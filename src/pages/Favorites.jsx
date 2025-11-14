import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Play, Trash2, Music2, ListPlus, Youtube } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import jamendoAPI from '../api/jamendo';
import { favoritesAPI } from '../api/favorites';

const Favorites = () => {
  const { currentUser } = useAuth();
  const { playTrack } = usePlayer();
  const [favorites, setFavorites] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [youtubeFavorites, setYoutubeFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jamendo'); // 'jamendo' or 'youtube'

  useEffect(() => {
    if (currentUser) {
      loadFavorites();
    }
  }, [currentUser]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      
      // Load Jamendo favorites from Firestore
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const likedTrackIds = userData.likedTracks || [];
          setFavorites(likedTrackIds);
          
          // Load each liked track by ID
          if (likedTrackIds.length > 0) {
            const trackPromises = likedTrackIds.map(async (trackId) => {
              try {
                const trackData = await jamendoAPI.getTrackById(trackId);
                return trackData.results?.[0];
              } catch (error) {
                console.error(`Error loading track ${trackId}:`, error);
                return null;
              }
            });
            
            const loadedTracks = await Promise.all(trackPromises);
            setTracks(loadedTracks.filter(track => track !== null));
          } else {
            setTracks([]);
          }
        }
      } catch (firestoreError) {
        // Silently handle Firestore offline errors
        if (firestoreError.code === 'unavailable' || firestoreError.message?.includes('offline')) {
          console.log('⚠️ Firestore offline - using cached data');
        } else {
          console.error('Error loading Jamendo favorites:', firestoreError);
        }
      }

      // Load YouTube favorites from MongoDB
      try {
        const ytFavorites = await favoritesAPI.getFavorites(currentUser.uid);
        setYoutubeFavorites(ytFavorites);
        console.log('✅ Loaded YouTube favorites:', ytFavorites.length);
      } catch (error) {
        console.error('Failed to load YouTube favorites:', error);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (trackId) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        likedTracks: arrayRemove(trackId),
      });
      
      setFavorites(prev => prev.filter(id => id !== trackId));
      setTracks(prev => prev.filter(track => track.id !== trackId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const removeYoutubeFavorite = async (videoId) => {
    try {
      await favoritesAPI.removeFromFavorites(currentUser.uid, videoId);
      setYoutubeFavorites(prev => prev.filter(track => track.videoId !== videoId));
      console.log('✅ Removed YouTube favorite');
    } catch (error) {
      console.error('Error removing YouTube favorite:', error);
    }
  };

  const displayedTracks = activeTab === 'jamendo' ? tracks : youtubeFavorites;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-900/40 via-rose-900/40 to-red-900/40 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
                <Heart size={32} className="text-white" fill="white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  My Favorites
                </h1>
                <p className="text-gray-300 text-lg mt-1">
                  {displayedTracks.length} track{displayedTracks.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setActiveTab('jamendo')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'jamendo'
                    ? 'bg-pink-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Music2 size={18} />
                Jamendo ({tracks.length})
              </button>
              <button
                onClick={() => setActiveTab('youtube')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'youtube'
                    ? 'bg-red-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Youtube size={18} />
                YouTube ({youtubeFavorites.length})
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          // Loading State
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedTracks.length > 0 ? (
          // Tracks List
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            {displayedTracks.map((track, index) => {
              const isYouTube = activeTab === 'youtube';
              const trackId = isYouTube ? track.videoId : track.id;
              const trackName = isYouTube ? track.title : track.name;
              const artistName = isYouTube ? track.channelTitle : track.artist_name;
              const trackImage = isYouTube ? track.thumbnail : (track.image || 'https://via.placeholder.com/100');
              const trackDuration = track.duration || 0;
              
              return (
                <motion.div
                  key={trackId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all border border-white/10 hover:border-white/20"
                >
                  <div className="flex items-center gap-4">
                    {/* Album Art */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <img
                        src={trackImage}
                        alt={trackName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {!isYouTube && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <button 
                            onClick={() => playTrack(track, displayedTracks)}
                            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 hover:scale-110 transition-all"
                          >
                            <Play size={16} className="text-white ml-0.5" fill="white" />
                          </button>
                        </div>
                      )}
                      {isYouTube && (
                        <div className="absolute top-1 right-1">
                          <Youtube size={14} className="text-red-500" />
                        </div>
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate group-hover:text-green-400 transition-colors">
                        {trackName}
                      </h3>
                      <p className="text-gray-400 text-sm truncate">{artistName}</p>
                    </div>

                    {/* Duration */}
                    <div className="hidden sm:block text-gray-400 text-sm">
                      {isYouTube ? trackDuration : jamendoAPI.formatDuration(trackDuration)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => isYouTube ? removeYoutubeFavorite(trackId) : removeFavorite(trackId)}
                        className="p-2 text-pink-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Remove from favorites"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title="Add to playlist"
                      >
                        <ListPlus size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 rounded-full mb-6">
              <Heart size={48} className="text-gray-600" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start exploring music and click the heart icon to save your favorite tracks here
            </p>
            <a
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-full hover:from-pink-700 hover:to-rose-700 transition-all shadow-lg shadow-pink-900/50"
            >
              <Music2 size={20} />
              Explore Music
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
