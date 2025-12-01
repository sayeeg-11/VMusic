import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, TrendingUp, Clock, Music2 } from 'lucide-react';
import jamendoAPI from '../api/jamendo';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/Toast';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import SignIn from '../components/auth/SignIn';

const Explore = () => {
  const { playTrack } = usePlayer();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState('trending');
  const [activeGenre, setActiveGenre] = useState('all');
  const [likedTracks, setLikedTracks] = useState(new Set());
  const [limit, setLimit] = useState(24);
  const [hasMore, setHasMore] = useState(true);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const categories = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'new', label: 'New Releases', icon: Clock },
    { id: 'popular', label: 'Popular', icon: Music2 },
  ];

  const genres = [
    { id: 'all', label: 'All Genres', tag: null },
    { id: 'pop', label: 'Pop', tag: 'pop' },
    { id: 'rock', label: 'Rock', tag: 'rock' },
    { id: 'electronic', label: 'Electronic', tag: 'electronic' },
    { id: 'jazz', label: 'Jazz', tag: 'jazz' },
    { id: 'classical', label: 'Classical', tag: 'classical' },
    { id: 'hiphop', label: 'Hip Hop', tag: 'hiphop' },
    { id: 'ambient', label: 'Ambient', tag: 'ambient' },
    { id: 'metal', label: 'Metal', tag: 'metal' },
  ];

  useEffect(() => {
    setLimit(24); // Reset limit when category/genre changes
    setHasMore(true);
    fetchTracks();
  }, [activeCategory, activeGenre]);

  useEffect(() => {
    if (currentUser) {
      loadLikedTracks();
    }
  }, [currentUser]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore || loading) return;

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
  }, [loadingMore, hasMore, loading, limit, activeCategory, activeGenre]);

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
      // Silently handle Firestore offline errors
      if (error.code !== 'unavailable' && !error.message?.includes('offline')) {
        console.error('Error loading liked tracks:', error);
      }
    }
  };

  const fetchTracks = async () => {
    setLoading(true);
    try {
      let data;
      const genre = genres.find((g) => g.id === activeGenre);

      if (activeCategory === 'trending') {
        if (genre?.tag) {
          data = await jamendoAPI.getTracksByTag(genre.tag, limit);
        } else {
          data = await jamendoAPI.getTrendingTracks(limit);
        }
      } else if (activeCategory === 'new') {
        data = await jamendoAPI.getNewReleases(limit);
      } else {
        data = await jamendoAPI.getTrendingTracks(limit);
      }

      // Remove duplicates by track id
      const uniqueTracks = Array.from(
        new Map((data.results || []).map((track) => [track.id, track])).values()
      );
      setTracks(uniqueTracks);
      setHasMore(uniqueTracks.length >= limit);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setTracks([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTracks = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const newLimit = limit + 24;

    try {
      let data;
      const genre = genres.find((g) => g.id === activeGenre);

      if (activeCategory === 'trending') {
        if (genre?.tag) {
          data = await jamendoAPI.getTracksByTag(genre.tag, newLimit);
        } else {
          data = await jamendoAPI.getTrendingTracks(newLimit);
        }
      } else if (activeCategory === 'new') {
        data = await jamendoAPI.getNewReleases(newLimit);
      } else {
        data = await jamendoAPI.getTrendingTracks(newLimit);
      }

      // Remove duplicates by track id
      const uniqueTracks = Array.from(
        new Map((data.results || []).map((track) => [track.id, track])).values()
      );
      setTracks(uniqueTracks);
      setLimit(newLimit);
      setHasMore(uniqueTracks.length >= newLimit);
    } catch (error) {
      console.error('Error loading more tracks:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleLike = async (trackId) => {
    // Check if user is logged in
    if (!currentUser) {
      setShowSignInModal(true);
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const isLiked = likedTracks.has(trackId);

      if (isLiked) {
        await updateDoc(userRef, {
          likedTracks: arrayRemove(trackId),
        });
        setLikedTracks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(trackId);
          return newSet;
        });
        toast.show('Removed from favorites', 'info');
      } else {
        await updateDoc(userRef, {
          likedTracks: arrayUnion(trackId),
        });
        setLikedTracks((prev) => {
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
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Explore Music</h1>
            <p className="text-gray-300 text-lg">
              Discover 500,000+ free tracks from independent artists worldwide
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-6"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <category.icon size={18} />
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Genre Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Filter by Genre</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setActiveGenre(genre.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeGenre === genre.id
                    ? 'bg-white/20 text-white border-2 border-white/40'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {genre.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tracks Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 animate-pulse">
                <div className="w-full aspect-square bg-white/10 rounded-lg mb-3"></div>
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : tracks.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
            >
              {tracks.map((track, index) => (
                <motion.div
                  key={`${track.id}-${index}`}
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
                      <Heart size={16} fill={likedTracks.has(track.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </motion.div>
              ))}
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
          <div className="text-center py-20">
            <Music2 size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tracks found</h3>
            <p className="text-gray-400">Try selecting a different category or genre</p>
          </div>
        )}
      </div>

      {/* Sign In Modal */}
      {showSignInModal && (
        <SignIn
          onClose={() => setShowSignInModal(false)}
          onSwitchToSignUp={() => setShowSignInModal(false)}
        />
      )}
    </div>
  );
};

export default Explore;
