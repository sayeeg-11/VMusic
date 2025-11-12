import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Heart, Users, Music2, ArrowLeft, ExternalLink } from 'lucide-react';
import * as jamendoAPI from '../api/jamendo';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/Toast';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';

const Artist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const { currentUser } = useAuth();
  const [artist, setArtist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedTracks, setLikedTracks] = useState(new Set());

  useEffect(() => {
    loadArtistData();
  }, [id]);

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

  const loadArtistData = async () => {
    setLoading(true);
    try {
      // Fetch artist info and tracks from Jamendo
      const artistResponse = await jamendoAPI.getArtist(id);
      const tracksResponse = await jamendoAPI.getArtistTracks(id, 20);
      
      if (artistResponse.results && artistResponse.results.length > 0) {
        setArtist(artistResponse.results[0]);
      }
      
      if (tracksResponse.results) {
        setTracks(tracksResponse.results);
      }
    } catch (error) {
      console.error('Error loading artist:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading skeleton */}
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-white/10 rounded mb-8"></div>
            <div className="flex flex-col md:flex-row gap-8 mb-12">
              <div className="w-64 h-64 bg-white/10 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-12 bg-white/10 rounded w-2/3 mb-4"></div>
                <div className="h-6 bg-white/10 rounded w-1/2 mb-6"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded w-full"></div>
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Music2 size={64} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Artist Not Found</h2>
          <p className="text-gray-400 mb-6">The artist you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/explore')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Artist Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row gap-8 mb-12"
        >
          {/* Artist Image */}
          <div className="w-64 h-64 flex-shrink-0">
            <div className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-purple-600/20 to-indigo-600/20 shadow-2xl">
              {artist.image ? (
                <img 
                  src={artist.image} 
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users size={80} className="text-purple-400" />
                </div>
              )}
            </div>
          </div>

          {/* Artist Info */}
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              {artist.name}
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 text-gray-300 mb-6"
            >
              {artist.joinDate && (
                <span className="flex items-center gap-2">
                  <Users size={16} />
                  Member since {artist.joinDate}
                </span>
              )}
              {artist.website && (
                <a
                  href={artist.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-purple-400 transition-colors"
                >
                  <ExternalLink size={16} />
                  Website
                </a>
              )}
            </motion.div>

            {/* Play All Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 px-8 py-4 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 hover:scale-105 transition-all shadow-lg shadow-green-900/50 mb-6"
            >
              <Play size={24} fill="white" />
              Play All
            </motion.button>

            {/* Bio */}
            {artist.bio && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-400 leading-relaxed"
              >
                {artist.bio}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Top Tracks */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Music2 size={24} className="text-purple-400" />
            Top Tracks
          </h2>

          {tracks.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              {tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 hover:border-white/10"
                >
                  {/* Track Number / Play Button */}
                  <div className="w-8 text-center flex-shrink-0">
                    <span className="text-gray-400 group-hover:hidden">{index + 1}</span>
                    <button 
                      onClick={() => playTrack(track, tracks)}
                      className="hidden group-hover:flex items-center justify-center w-8 h-8 bg-green-500 rounded-full hover:bg-green-600 hover:scale-110 transition-all"
                    >
                      <Play size={14} className="text-white ml-0.5" fill="white" />
                    </button>
                  </div>

                  {/* Album Art */}
                  <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded overflow-hidden">
                    {track.image ? (
                      <img src={track.image} alt={track.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 size={20} className="text-purple-400" />
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate group-hover:text-purple-400 transition-colors">
                      {track.name}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">{track.album_name || 'Single'}</p>
                  </div>

                  {/* Duration */}
                  <div className="text-gray-400 text-sm flex-shrink-0 hidden md:block">
                    {jamendoAPI.formatDuration(track.duration)}
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={() => toggleLike(track.id)}
                    className={`p-2 rounded-full transition-all flex-shrink-0 ${
                      likedTracks.has(track.id)
                        ? 'text-purple-500 bg-purple-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={likedTracks.has(track.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      size={20}
                      fill={likedTracks.has(track.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
              <Music2 size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No tracks available for this artist.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Artist;
