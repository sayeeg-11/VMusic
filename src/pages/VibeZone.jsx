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
  Disc3,
  AlertCircle,
  ArrowRight,
  Youtube,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from '../components/Toast';

/**
 * Vibe Zone - Spotify-powered music discovery focused on Hindi/Bollywood content
 *
 * 🔐 SECURE Token Management:
 * - Always calls backend API at /api/spotify-token (Vercel/Netlify serverless function)
 * - Backend uses SPOTIFY_CLIENT_SECRET (stored securely in hosting environment)
 * - ✅ NO secrets exposed to frontend/browser
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
  const [showApiLimitModal, setShowApiLimitModal] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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
      setTracks([]);
      setOffset(0);
      setHasMore(true);
      fetchTracks(0);
    }
  }, [selectedCategory, accessToken]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // Load more when user is 500px from bottom
      if (scrollTop + clientHeight >= scrollHeight - 500) {
        loadMoreTracks();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, offset, accessToken, selectedCategory, searchQuery]);

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

      // Always use backend API for token (secure - no secrets in frontend)
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || 'https://v-music-gamma.vercel.app/api';
      const response = await fetch(`${apiBaseUrl}/spotify-token`);

      if (!response.ok) {
        console.warn('Backend Spotify API not available, using guest mode');
        return;
      }

      const data = await response.json();

      if (data.access_token) {
        const expiryTime = Date.now() + data.expires_in * 1000 - 60000; // Expire 1 min early

        // Cache token
        localStorage.setItem('spotify_token', data.access_token);
        localStorage.setItem('spotify_token_expiry', expiryTime.toString());

        setAccessToken(data.access_token);
        setTokenExpiry(expiryTime);
      }
    } catch (error) {
      console.warn('Spotify backend not configured, using guest mode');
      setLoading(false);
    }
  };

  const fetchTracks = async (currentOffset = offset, append = false) => {
    if (!accessToken) return;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const category = categories.find((c) => c.id === selectedCategory);
      const searchTerm = searchQuery || category.query;

      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track&limit=20&offset=${currentOffset}&market=IN`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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

      // Check if there are more tracks
      const newTracks = data.tracks.items;
      if (newTracks.length === 0 || newTracks.length < 20) {
        setHasMore(false);
      }

      // Append or replace tracks
      if (append) {
        setTracks((prev) => [...prev, ...newTracks]);
      } else {
        setTracks(newTracks);
      }

      // Count tracks with previews
      const tracksWithPreview = newTracks.filter((track) => track.preview_url);

      if (!append && tracksWithPreview.length === 0 && newTracks.length > 0) {
        toast.show('Tracks loaded, but previews may not be available', 'info');
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
      toast.show('Failed to load tracks. Please try again.', 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreTracks = () => {
    if (!loadingMore && hasMore) {
      const newOffset = offset + 20;
      setOffset(newOffset);
      fetchTracks(newOffset, true);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setTracks([]);
      setOffset(0);
      setHasMore(true);
      fetchTracks(0);
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
      // Silently handle Firestore offline errors
      if (error.code !== 'unavailable' && !error.message?.includes('offline')) {
        console.error('Error loading favorites:', error);
      }
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
          spotifyFavorites: arrayRemove(track.id),
        });
        setFavorites((prev) => prev.filter((id) => id !== track.id));
        toast.show('Removed from favorites', 'info');
      } else {
        await updateDoc(userRef, {
          spotifyFavorites: arrayUnion(track.id),
        });
        setFavorites((prev) => [...prev, track.id]);
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

  const filteredTracks = tracks.filter(
    (track) =>
      track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artists?.some((artist) => artist.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-gray-900 pb-32">
      {/* API Limitation Modal */}
      <AnimatePresence>
        {showApiLimitModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setShowApiLimitModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="rounded-3xl shadow-2xl max-w-lg w-full border border-[#522cd5]/30 overflow-hidden"
                style={{ background: '#0d0f21' }}
              >
                {/* Header */}
                <div
                  className="relative border-b border-[#522cd5]/20 p-6"
                  style={{
                    background: 'linear-gradient(135deg, #522cd5 0%, #ff47b5 100%)',
                    opacity: 0.15,
                  }}
                >
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                </div>

                <div className="relative p-6" style={{ background: '#0d0f21' }}>
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 animate-pulse shadow-lg shadow-[#ff47b5]/50"
                      style={{
                        background: 'linear-gradient(135deg, #522cd5 0%, #ff47b5 100%)',
                      }}
                    >
                      <AlertCircle className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <h2
                        className="text-2xl font-bold mb-1 flex items-center gap-2"
                        style={{ color: '#ffffff' }}
                      >
                        ⚠️ Service Update
                      </h2>
                      <p className="text-sm" style={{ color: '#d1c4ff' }}>
                        Important information about music playback
                      </p>
                    </div>
                    <button
                      onClick={() => setShowApiLimitModal(false)}
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                      style={{ background: '#2a2d43' }}
                    >
                      <X size={18} style={{ color: '#ffffff' }} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 mb-6">
                    <div
                      className="rounded-2xl p-4 border backdrop-blur-sm"
                      style={{
                        background: '#2a2d43',
                        borderColor: '#522cd5',
                      }}
                    >
                      <p className="leading-relaxed" style={{ color: '#ffffff' }}>
                        Due to{' '}
                        <span className="font-bold" style={{ color: '#ff47b5' }}>
                          Spotify API limitations
                        </span>
                        , music playback is currently unavailable on this page.
                      </p>
                    </div>

                    <div
                      className="rounded-2xl p-4 border backdrop-blur-sm"
                      style={{
                        background: 'linear-gradient(135deg, #522cd5 0%, #ff47b5 100%)',
                        opacity: 0.9,
                        borderColor: '#ff47b5',
                      }}
                    >
                      <p className="leading-relaxed" style={{ color: '#ffffff' }}>
                        💡 <span className="font-semibold">Good news!</span> You can enjoy the full
                        music streaming experience with unlimited playback on{' '}
                        <span className="font-bold">VibeTube</span>.
                      </p>
                    </div>

                    <p className="text-sm text-center" style={{ color: '#d1c4ff' }}>
                      We're working hard to bring full Spotify integration back!
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowApiLimitModal(false)}
                      className="flex-1 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 hover:opacity-80"
                      style={{
                        background: '#2a2d43',
                        color: '#ffffff',
                      }}
                    >
                      Stay Here
                    </button>
                    <button
                      onClick={() => navigate('/vibetube')}
                      className="flex-1 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                      style={{
                        background: '#ff3f81',
                        color: '#ffffff',
                      }}
                    >
                      <Youtube size={20} />
                      <span>Go to VibeTube</span>
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Audio Element */}
      <audio ref={audioRef} onEnded={() => setCurrentlyPlaying(null)} />

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-fuchsia-900/40 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* API Limitation Banner */}
            <div
              className="mb-6 rounded-2xl border overflow-hidden"
              style={{
                background: '#0d0f21',
                borderColor: '#522cd5',
              }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 animate-pulse"
                    style={{
                      background: 'linear-gradient(135deg, #522cd5 0%, #ff47b5 100%)',
                    }}
                  >
                    <AlertCircle className="text-white" size={20} />
                  </div>
                  <div>
                    <h3
                      className="font-bold mb-1 flex items-center gap-2"
                      style={{ color: '#ffffff' }}
                    >
                      ⚠️ Service Update
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#d1c4ff' }}>
                      Due to{' '}
                      <span className="font-semibold" style={{ color: '#ff47b5' }}>
                        Spotify API limitations
                      </span>
                      , music playback is currently unavailable. Try{' '}
                      <span className="font-semibold" style={{ color: '#ff47b5' }}>
                        VibeTube
                      </span>{' '}
                      for full streaming experience!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/vibetube')}
                  className="shrink-0 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-105 shadow-lg"
                  style={{
                    background: '#ff3f81',
                    color: '#ffffff',
                  }}
                >
                  <Youtube size={18} />
                  <span>Go to VibeTube</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Music2 size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">🎧 Vibe Zone</h1>
                <p className="text-gray-300 text-lg">
                  Discover trending <span className="text-pink-400 font-semibold">Hindi</span>{' '}
                  tracks and fresh vibes from Spotify
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
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
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-400">Loading vibes...</p>
          </div>
        ) : filteredTracks.length > 0 ? (
          <>
            <div className="mb-6 text-center">
              <p className="text-gray-400">
                Found <span className="text-white font-semibold">{filteredTracks.length}</span>{' '}
                tracks with 30s previews
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
                    onClick={() => {
                      if (track.external_urls?.spotify) {
                        window.open(track.external_urls.spotify, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="bg-white/10 backdrop-blur-lg hover:bg-white/15 rounded-2xl p-4 transition-all border border-white/10 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/20 group cursor-pointer"
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

                      {/* Spotify Badge - Click to Open */}
                      <div className="absolute top-3 right-3 bg-green-500 p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink size={14} className="text-white" />
                      </div>

                      {/* Play Button Overlay */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(track);
                        }}
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
                        {track.artists?.map((artist) => artist.name).join(', ')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(track);
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition-all"
                      >
                        <Heart
                          size={20}
                          className={
                            isFavorite
                              ? 'text-red-500 fill-red-500'
                              : 'text-gray-400 hover:text-red-400'
                          }
                        />
                      </button>

                      {track.external_urls?.spotify && (
                        <a
                          href={track.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 hover:bg-white/10 rounded-full transition-all group/link"
                          title="Open in Spotify"
                        >
                          <ExternalLink
                            size={20}
                            className="text-gray-400 group-hover/link:text-green-400"
                          />
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

            {/* Loading More Indicator */}
            {loadingMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mb-3"></div>
                <p className="text-gray-400 text-sm">Loading more tracks...</p>
              </motion.div>
            )}

            {/* No More Tracks Indicator */}
            {!hasMore && tracks.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <p className="text-gray-400 text-sm">
                  🎵 You've reached the end! All tracks loaded.
                </p>
              </motion.div>
            )}
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
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
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
                    {currentlyPlaying.artists?.map((artist) => artist.name).join(', ')}
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
                    className={
                      favorites.includes(currentlyPlaying.id)
                        ? 'text-red-500 fill-red-500'
                        : 'text-gray-300'
                    }
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
