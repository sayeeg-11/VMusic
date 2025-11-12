import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Play, Heart, Music2, X } from 'lucide-react';
import jamendoAPI from '../api/jamendo';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/Toast';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';

const Search = () => {
  const { playTrack } = usePlayer();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [likedTracks, setLikedTracks] = useState(new Set());

  // Load liked tracks
  useEffect(() => {
    if (currentUser) {
      loadLikedTracks();
    }
  }, [currentUser]);

  const loadLikedTracks = async () => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const likedTrackIds = userData.likedTracks || [];
        setLikedTracks(new Set(likedTrackIds));
      }
    } catch (error) {
      console.error('Error loading liked tracks:', error);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initial search from URL
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, []);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    
    try {
      const data = await jamendoAPI.searchTracks(query, 30);
      setTracks(data.results || []);
      setSearchParams({ q: query });
    } catch (error) {
      console.error('Error searching tracks:', error);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setTracks([]);
    setHasSearched(false);
    setSearchParams({});
  };

  const toggleLike = async (trackId) => {
    // Check if user is logged in
    if (!currentUser) {
      toast.show('Please sign in to like tracks', 'error');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const isLiked = likedTracks.has(trackId);

      if (isLiked) {
        await updateDoc(userRef, {
          likedTracks: arrayRemove(trackId),
        });
        setLikedTracks(prev => {
          const newSet = new Set(prev);
          newSet.delete(trackId);
          return newSet;
        });
        toast.show('Removed from favorites', 'info');
      } else {
        await updateDoc(userRef, {
          likedTracks: arrayUnion(trackId),
        });
        setLikedTracks(prev => {
          const newSet = new Set(prev);
          newSet.add(trackId);
          return newSet;
        });
        toast.show('Added to favorites', 'info');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.show('Failed to update favorites', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black pb-20">
      {/* Header with Search */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
              Search Music
            </h1>
            <p className="text-gray-300 text-lg text-center mb-8">
              Find your favorite tracks, artists, and albums
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for songs, artists, or albums..."
                  className="w-full pl-16 pr-16 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        {hasSearched && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white">
              {tracks.length > 0
                ? `Found ${tracks.length} result${tracks.length !== 1 ? 's' : ''} for "${searchQuery}"`
                : `No results found for "${searchQuery}"`}
            </h2>
            {tracks.length === 0 && (
              <p className="text-gray-400 mt-2">
                Try different keywords or check your spelling
              </p>
            )}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 animate-pulse">
                <div className="w-full aspect-square bg-white/10 rounded-lg mb-3"></div>
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {!loading && tracks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
          >
            {tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className="group relative bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-all border border-white/10 hover:border-white/20 cursor-pointer"
                onClick={() => navigate(`/track/${track.id}`)}
              >
                {/* Album Art */}
                <div className="relative mb-3 overflow-hidden rounded-lg">
                  <img
                    src={track.image || 'https://via.placeholder.com/300'}
                    alt={track.name}
                    className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(track, tracks);
                      }}
                      className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 hover:scale-110 transition-all shadow-lg"
                    >
                      <Play size={20} className="text-white ml-0.5" fill="white" />
                    </button>
                  </div>
                </div>

                {/* Track Info */}
                <h3 className="text-white text-sm font-semibold mb-1 truncate group-hover:text-green-400 transition-colors">
                  {track.name}
                </h3>
                <p className="text-gray-400 text-xs truncate mb-2">{track.artist_name}</p>
                
                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {jamendoAPI.formatDuration(track.duration)}
                  </span>
                  <button
                    onClick={() => toggleLike(track.id)}
                    className={`transition-colors ${
                      likedTracks.has(track.id)
                        ? 'text-pink-500'
                        : 'text-gray-400 hover:text-pink-500'
                    }`}
                  >
                    <Heart
                      size={16}
                      fill={likedTracks.has(track.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!hasSearched && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 rounded-full mb-6">
              <SearchIcon size={48} className="text-gray-600" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              Start your search
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Enter a song name, artist, or album to discover amazing indie music from around the world
            </p>
          </motion.div>
        )}

        {/* No Results */}
        {!loading && hasSearched && tracks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <Music2 size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No tracks found
            </h3>
            <p className="text-gray-400 mb-6">
              We couldn't find any tracks matching "{searchQuery}"
            </p>
            <button
              onClick={clearSearch}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full transition-all"
            >
              Clear Search
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Search;
