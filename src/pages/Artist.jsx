import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Heart, Users, Music2, ArrowLeft, ExternalLink } from 'lucide-react';
import { jamendoAPI } from '../api/jamendo';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/Toast';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import SignIn from '../components/auth/SignIn';

const Artist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const { currentUser } = useAuth();
  const [artist, setArtist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedTracks, setLikedTracks] = useState(new Set());
  const [showSignInModal, setShowSignInModal] = useState(false);

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
      const tracksResponse = await jamendoAPI.getArtistTracks(id, 200);

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
    <div className="min-h-screen bg-gradient-to-b from-purple-900/20 via-gray-900 to-black pb-20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-full text-gray-300 hover:text-white transition-all mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </motion.button>

        {/* Artist Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-12"
        >
          {/* Glass Card Container */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 p-8">
              {/* Artist Image */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-64 h-64 flex-shrink-0 relative group"
              >
                {/* Glowing border effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>

                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600/20 to-indigo-600/20 shadow-2xl border-2 border-white/10 group-hover:border-white/30 transition-all">
                  {artist.image ? (
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-indigo-500/30">
                      <Users size={80} className="text-purple-300" />
                    </div>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </motion.div>

              {/* Artist Info */}
              <div className="flex-1 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-3"
                >
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium">
                    <Users size={14} />
                    Artist Profile
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent mb-4"
                >
                  {artist.name}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap items-center gap-4 text-gray-300 mb-6"
                >
                  {artist.joinDate && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm">Member since {artist.joinDate}</span>
                    </div>
                  )}
                  {artist.website && (
                    <a
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-purple-500/50 transition-all group"
                    >
                      <ExternalLink
                        size={14}
                        className="group-hover:rotate-12 transition-transform"
                      />
                      <span className="text-sm">Visit Website</span>
                    </a>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                    <Music2 size={14} />
                    <span className="text-sm">{tracks.length} Tracks</span>
                  </div>
                </motion.div>

                {/* Play All Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => playTrack(tracks[0], tracks)}
                  disabled={tracks.length === 0}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-full transition-all shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/70 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                >
                  <Play size={24} fill="white" />
                  <span>Play All</span>
                </motion.button>
              </div>
            </div>

            {/* Bio Section */}
            {artist.bio && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="px-8 pb-8 pt-6 border-t border-white/10"
              >
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  About
                </h3>
                <p className="text-gray-300 leading-relaxed">{artist.bio}</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Top Tracks */}
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-white mb-6 flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Music2 size={20} className="text-white" />
            </div>
            <span>Popular Tracks</span>
          </motion.h2>

          {tracks.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              {tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="group flex items-center gap-4 p-4 bg-gradient-to-r from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 backdrop-blur-xl rounded-2xl transition-all border border-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20"
                >
                  {/* Track Number / Play Button */}
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 relative">
                    <span className="text-gray-400 font-medium group-hover:opacity-0 transition-opacity">
                      {index + 1}
                    </span>
                    <button
                      onClick={() => playTrack(track, tracks)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                        <Play size={16} className="text-white ml-0.5" fill="white" />
                      </div>
                    </button>
                  </div>

                  {/* Album Art */}
                  <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow border border-white/10">
                    {track.image ? (
                      <img
                        src={track.image}
                        alt={track.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
                        <Music2 size={24} className="text-purple-400" />
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate group-hover:text-purple-300 transition-colors mb-1">
                      {track.name}
                    </h3>
                    <p className="text-gray-400 text-sm truncate flex items-center gap-2">
                      {track.album_name || 'Single'}
                      {track.releasedate && (
                        <span className="text-gray-500">
                          • {new Date(track.releasedate).getFullYear()}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="text-gray-400 text-sm font-medium flex-shrink-0 hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {jamendoAPI.formatDuration(track.duration)}
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={() => toggleLike(track.id)}
                    className={`p-2.5 rounded-full transition-all flex-shrink-0 ${
                      likedTracks.has(track.id)
                        ? 'text-purple-400 bg-purple-500/20 border border-purple-500/30 hover:scale-110'
                        : 'text-gray-400 hover:text-purple-300 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 hover:scale-110'
                    }`}
                    title={likedTracks.has(track.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      size={18}
                      fill={likedTracks.has(track.id) ? 'currentColor' : 'none'}
                      className="transition-all"
                    />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music2 size={40} className="text-purple-400" />
              </div>
              <p className="text-gray-400 text-lg">No tracks available for this artist yet.</p>
              <p className="text-gray-500 text-sm mt-2">Check back later for new releases!</p>
            </motion.div>
          )}
        </div>
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

export default Artist;
