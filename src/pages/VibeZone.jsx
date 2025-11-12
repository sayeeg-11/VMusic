import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music2, 
  Play, 
  Pause, 
  Heart, 
  ExternalLink, 
  Search,
  Volume2,
  VolumeX,
  Filter,
  TrendingUp,
  Sparkles,
  Disc3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from '../components/Toast';

/**
 * Vibe Zone - Spotify-powered music discovery focused on Hindi/Bollywood content
 * 
 * Token Management:
 * - Development: Calls Spotify API directly with Client Credentials
 *   - Uses VITE_SPOTIFY_CLIENT_SECRET from .env file
 * - Production: Uses secure backend API at /api/spotify-token (Vercel serverless function)
 *   - Uses SPOTIFY_CLIENT_SECRET from Vercel environment variables
 * - Token cached for 55 minutes in localStorage
 * 
 * Features:
 * - 7 music categories (Hindi, Bollywood, Romantic, Trending, Lo-Fi, Party, Chill)
 * - Custom search with market=IN for Indian content
 * - 30-second preview playback
 * - Firebase favorites integration
 * - Volume controls and mini player
 */

const VibeZone = () => {
  const { currentUser } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const [accessToken, setAccessToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);

  const categories = [
    { id: 'hindi', name: 'Hindi Vibes', icon: Music2, query: 'year:2023-2024 hindi' },
    { id: 'bollywood', name: 'Bollywood', icon: Sparkles, query: 'year:2023-2024 bollywood' },
    { id: 'romantic', name: 'Romantic', icon: Heart, query: 'romantic songs' },
    { id: 'trending', name: 'Trending', icon: TrendingUp, query: 'top hits 2024' },
    { id: 'lofi', name: 'Lo-Fi', icon: Disc3, query: 'lofi hip hop' },
    { id: 'party', name: 'Party', icon: Music2, query: 'party hits' },
    { id: 'chill', name: 'Chill', icon: Music2, query: 'chill vibes' },
  ];

  useEffect(() => {
    getSpotifyToken();
    if (currentUser) {
      loadFavorites();
    }
  }, [currentUser]);

  useEffect(() => {
    if (accessToken) {
      fetchTracks();
    }
  }, [selectedCategory, accessToken]);

  const getSpotifyToken = async () => {
    try {
      // Check if we have a valid cached token
      const cachedToken = localStorage.getItem('spotify_token');
      const cachedExpiry = localStorage.getItem('spotify_token_expiry');
      
      if (cachedToken && cachedExpiry && Date.now() < parseInt(cachedExpiry)) {
        setAccessToken(cachedToken);
        setTokenExpiry(parseInt(cachedExpiry));
        return;
      }

      // In development, call Spotify directly (CLIENT_SECRET will be in production via Vercel)
      // In production, use the secure backend API
      const isDevelopment = import.meta.env.DEV;
      
      let data;
      
      if (isDevelopment) {
        // Development: Direct Spotify API call
        const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '375b56d194264fd18ddc1e4151bb6c48';
        const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
        
        if (!clientSecret) {
          throw new Error('VITE_SPOTIFY_CLIENT_SECRET not found in environment variables');
        }
        
        const credentials = btoa(`${clientId}:${clientSecret}`);
        
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: 'grant_type=client_credentials'
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error('Failed to get Spotify token from API');
        }
        
        data = await response.json();
      } else {
        // Production: Use secure backend API
        const response = await fetch('/api/spotify-token');
        
        if (!response.ok) {
          throw new Error('Failed to get Spotify token from backend');
        }
        
        data = await response.json();
      }
      
      if (data.access_token) {
        const expiryTime = Date.now() + (data.expires_in * 1000) - 60000; // Expire 1 min early
        
        // Cache token
        localStorage.setItem('spotify_token', data.access_token);
        localStorage.setItem('spotify_token_expiry', expiryTime.toString());
        
        setAccessToken(data.access_token);
        setTokenExpiry(expiryTime);
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Error getting Spotify token:', error);
      toast.show('Failed to connect to Spotify. Please try again.', 'error');
      setLoading(false);
    }
  };

  const fetchTracks = async () => {
    if (!accessToken) return;
    
    setLoading(true);
    try {
      const category = categories.find(c => c.id === selectedCategory);
      const searchTerm = searchQuery || category.query;
      
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track&limit=20&market=IN`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.status === 401) {
        // Token expired, get new one
        localStorage.removeItem('spotify_token');
        localStorage.removeItem('spotify_token_expiry');
        await getSpotifyToken();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Failed to fetch tracks');
      }

      const data = await response.json();
      
      // Show all tracks, not just those with previews
      setTracks(data.tracks.items);
      
      // Count tracks with previews
      const tracksWithPreview = data.tracks.items.filter(track => track.preview_url);
      
      if (tracksWithPreview.length === 0 && data.tracks.items.length > 0) {
        toast.show('Tracks loaded, but previews may not be available', 'info');
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
      toast.show('Failed to load tracks. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchTracks();
    }
  };

  const loadFavorites = async () => {
    if (!currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFavorites(userData.spotifyFavorites || []);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (track) => {
    if (!currentUser) {
      toast.show('Please login to save favorites', 'error');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const isFavorite = favorites.includes(track.id);

      if (isFavorite) {
        await updateDoc(userRef, {
          spotifyFavorites: arrayRemove(track.id)
        });
        setFavorites(prev => prev.filter(id => id !== track.id));
        toast.show('Removed from favorites', 'info');
      } else {
        await updateDoc(userRef, {
          spotifyFavorites: arrayUnion(track.id)
        });
        setFavorites(prev => [...prev, track.id]);
        toast.show('Added to favorites', 'info');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.show('Failed to update favorites', 'error');
    }
  };

  const playTrack = (track) => {
    if (!track.preview_url) {
      toast.show('Preview not available for this track', 'error');
      return;
    }

    if (currentlyPlaying?.id === track.id) {
      // Pause if same track
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setCurrentlyPlaying(null);
      } else {
        audioRef.current?.play();
        setCurrentlyPlaying(track);
      }
    } else {
      // Play new track
      if (audioRef.current) {
        audioRef.current.src = track.preview_url;
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.play();
        setCurrentlyPlaying(track);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    }
  };

  const filteredTracks = tracks.filter(track =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artists?.some(artist => artist.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-gray-900 pb-32">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setCurrentlyPlaying(null)}
      />

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-fuchsia-900/40 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Music2 size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  🎧 Vibe Zone
                </h1>
                <p className="text-gray-300 text-lg">
                  Discover trending <span className="text-pink-400 font-semibold">Hindi</span> tracks and fresh vibes from Spotify
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Hindi vibes..."
                className="w-full pl-12 pr-24 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium"
              >
                Search
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="sticky top-16 z-30 bg-gray-900/80 backdrop-blur-lg border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Icon size={16} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-400">Loading vibes...</p>
          </div>
        ) : filteredTracks.length > 0 ? (
          <>
            <div className="mb-6 text-center">
              <p className="text-gray-400">
                Found <span className="text-white font-semibold">{filteredTracks.length}</span> tracks with 30s previews
              </p>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredTracks.map((track, index) => {
                const isPlaying = currentlyPlaying?.id === track.id;
                const isFavorite = favorites.includes(track.id);

                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="bg-white/10 backdrop-blur-lg hover:bg-white/15 rounded-2xl p-4 transition-all border border-white/10 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/20 group"
                  >
                    {/* Album Cover */}
                    <div className="relative mb-4">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-800 shadow-xl">
                        <img
                          src={track.album?.images?.[0]?.url || '/placeholder-album.png'}
                          alt={track.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Play Button Overlay */}
                      <button
                        onClick={() => playTrack(track)}
                        disabled={!track.preview_url}
                        className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-opacity rounded-xl ${
                          track.preview_url 
                            ? 'opacity-0 group-hover:opacity-100' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {isPlaying ? (
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                          >
                            <Pause size={32} className="text-white" fill="white" />
                          </motion.div>
                        ) : (
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                          >
                            <Play size={32} className="text-white ml-1" fill="white" />
                          </motion.div>
                        )}
                      </button>

                      {/* Playing Indicator */}
                      {isPlaying && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full"
                        >
                          <div className="flex items-center gap-1">
                            <div className="w-1 h-3 bg-pink-500 rounded animate-pulse"></div>
                            <div className="w-1 h-4 bg-pink-500 rounded animate-pulse delay-75"></div>
                            <div className="w-1 h-3 bg-pink-500 rounded animate-pulse delay-150"></div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="mb-3">
                      <h3 className="text-white font-semibold truncate mb-1 group-hover:text-pink-400 transition-colors">
                        {track.name}
                      </h3>
                      <p className="text-gray-400 text-sm truncate">
                        {track.artists?.map(artist => artist.name).join(', ')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleFavorite(track)}
                        className="p-2 hover:bg-white/10 rounded-full transition-all"
                      >
                        <Heart
                          size={20}
                          className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'}
                        />
                      </button>

                      {track.external_urls?.spotify && (
                        <a
                          href={track.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white/10 rounded-full transition-all group/link"
                          title="Open in Spotify"
                        >
                          <ExternalLink size={20} className="text-gray-400 group-hover/link:text-green-400" />
                        </a>
                      )}

                      {!track.preview_url && (
                        <span className="text-xs text-gray-500">No preview</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        ) : (
          <div className="text-center py-12">
            <Music2 size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">No Tracks Found</h3>
            <p className="text-gray-400">
              {searchQuery ? 'Try a different search term' : 'Unable to load tracks'}
            </p>
          </div>
        )}
      </div>

      {/* Floating Mini Player */}
      <AnimatePresence>
        {currentlyPlaying && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4"
          >
            <div className="bg-gradient-to-r from-purple-900/95 via-pink-900/95 to-fuchsia-900/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl shadow-purple-900/50 p-4">
              <div className="flex items-center gap-4">
                {/* Album Art */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 shadow-lg">
                    <img
                      src={currentlyPlaying.album?.images?.[0]?.url || '/placeholder-album.png'}
                      alt={currentlyPlaying.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Animated Playing Indicator */}
                  <div className="absolute -top-1 -right-1 bg-pink-500 rounded-full p-1.5">
                    <div className="flex items-center gap-0.5">
                      <div className="w-0.5 h-2 bg-white rounded animate-pulse"></div>
                      <div className="w-0.5 h-3 bg-white rounded animate-pulse delay-75"></div>
                      <div className="w-0.5 h-2 bg-white rounded animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold truncate mb-0.5 text-sm">
                    {currentlyPlaying.name}
                  </h4>
                  <p className="text-gray-300 text-xs truncate">
                    {currentlyPlaying.artists?.map(artist => artist.name).join(', ')}
                  </p>
                </div>

                {/* Volume Control */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    {volume === 0 || isMuted ? (
                      <VolumeX size={20} className="text-gray-300" />
                    ) : volume < 0.5 ? (
                      <Volume1 size={20} className="text-gray-300" />
                    ) : (
                      <Volume2 size={20} className="text-gray-300" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:bg-pink-400"
                  />
                </div>

                {/* Play/Pause Button */}
                <button
                  onClick={() => playTrack(currentlyPlaying)}
                  className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Pause size={20} className="text-white" fill="white" />
                </button>

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(currentlyPlaying)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <Heart
                    size={20}
                    className={favorites.includes(currentlyPlaying.id) ? 'text-red-500 fill-red-500' : 'text-gray-300'}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VibeZone;
