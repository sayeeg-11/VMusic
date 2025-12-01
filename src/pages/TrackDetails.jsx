import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Heart,
  Plus,
  Share2,
  Clock,
  Music2,
  User,
  Users,
  Calendar,
  Download,
  ExternalLink,
} from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/Toast';
import jamendoAPI from '../api/jamendo';
import SignIn from '../components/auth/SignIn';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';

const TrackDetails = () => {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();

  const [track, setTrack] = useState(null);
  const [artist, setArtist] = useState(null);
  const [relatedTracks, setRelatedTracks] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSignInModal, setShowSignInModal] = useState(false);

  useEffect(() => {
    loadTrackDetails();
    if (currentUser) {
      checkIfLiked();
    }
  }, [trackId, currentUser]);

  const loadTrackDetails = async () => {
    try {
      setLoading(true);

      // Get track details
      const trackData = await jamendoAPI.getTrackById(trackId);
      if (trackData.results && trackData.results.length > 0) {
        const trackInfo = trackData.results[0];
        setTrack(trackInfo);

        // Get artist details
        if (trackInfo.artist_id) {
          const artistData = await jamendoAPI.getArtist(trackInfo.artist_id);
          if (artistData.results && artistData.results.length > 0) {
            setArtist(artistData.results[0]);
          }

          // Get related tracks from same artist
          const relatedData = await jamendoAPI.getArtistTracks(trackInfo.artist_id, 6);
          if (relatedData.results) {
            // Filter out current track
            const filtered = relatedData.results.filter((t) => t.id !== trackId);
            setRelatedTracks(filtered);
          }
        }
      }
    } catch (error) {
      console.error('Error loading track details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfLiked = async () => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const likedTracks = userData.likedTracks || [];
        setIsLiked(likedTracks.includes(trackId));
      }
    } catch (error) {
      console.error('Error checking if liked:', error);
    }
  };

  const toggleLike = async () => {
    if (!currentUser) {
      setShowSignInModal(true);
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);

      if (isLiked) {
        await updateDoc(userRef, {
          likedTracks: arrayRemove(trackId),
        });
        setIsLiked(false);
      } else {
        await updateDoc(userRef, {
          likedTracks: arrayUnion(trackId),
        });
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handlePlayTrack = () => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, [track, ...relatedTracks]);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: track.name,
          text: `Check out "${track.name}" by ${track.artist_name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Music2 size={48} className="text-green-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading track details...</p>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Music2 size={48} className="text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Track not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black pb-32">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-green-900/40 to-transparent">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-8 items-start md:items-end"
          >
            {/* Album Art */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full md:w-64 h-64 flex-shrink-0 shadow-2xl"
            >
              <img
                src={track.image || 'https://via.placeholder.com/300'}
                alt={track.name}
                className="w-full h-full object-cover rounded-lg shadow-2xl"
              />
            </motion.div>

            {/* Track Info */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-white/80 mb-2">TRACK</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                {track.name}
              </h1>
              <div className="flex items-center gap-3 text-white/90">
                {artist?.image && (
                  <img
                    src={artist.image}
                    alt={track.artist_name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <button
                  onClick={() => navigate(`/artist/${track.artist_id}`)}
                  className="font-semibold hover:underline"
                >
                  {track.artist_name}
                </button>
                <span>•</span>
                <span>{new Date(track.releasedate).getFullYear()}</span>
                <span>•</span>
                <span>{jamendoAPI.formatDuration(track.duration)}</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4 mt-8"
          >
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayTrack}
              className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg"
            >
              {isCurrentlyPlaying ? (
                <Pause size={24} className="text-white" fill="white" />
              ) : (
                <Play size={24} className="text-white ml-1" fill="white" />
              )}
            </button>

            {/* Like Button */}
            <button
              onClick={toggleLike}
              className={`p-3 rounded-full transition-all ${
                isLiked
                  ? 'text-green-500 hover:bg-green-500/20'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Heart size={28} fill={isLiked ? 'currentColor' : 'none'} />
            </button>

            {/* Add to Playlist */}
            <button
              onClick={() => {
                if (!currentUser) {
                  toast.show('Please sign in to add tracks to playlists', 'error');
                } else {
                  toast.show('Playlist feature coming soon!', 'info');
                }
              }}
              className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <Plus size={28} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <Share2 size={28} />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Track Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Track Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="text-green-500" size={20} />
                  <p className="text-gray-400 text-sm">Released</p>
                </div>
                <p className="text-white font-semibold">
                  {new Date(track.releasedate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="text-green-500" size={20} />
                  <p className="text-gray-400 text-sm">Duration</p>
                </div>
                <p className="text-white font-semibold">
                  {jamendoAPI.formatDuration(track.duration)}
                </p>
              </div>

              {track.album_name && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <Music2 className="text-green-500" size={20} />
                    <p className="text-gray-400 text-sm">Album</p>
                  </div>
                  <p className="text-white font-semibold">{track.album_name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Artist Info */}
          {artist && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-white font-bold text-lg mb-6">About Artist</h3>

                {/* Artist Profile */}
                <div className="mb-6">
                  <button onClick={() => navigate(`/artist/${artist.id}`)} className="group w-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <img
                          src={artist.image || 'https://via.placeholder.com/100'}
                          alt={artist.name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-white/10 group-hover:border-green-500/50 transition-all"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-white font-bold text-xl group-hover:text-green-500 transition-colors">
                          {artist.name}
                        </p>
                        <p className="text-gray-400 text-sm">Artist</p>
                      </div>
                    </div>
                  </button>

                  {/* Artist Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {/* Followers/Fans */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="text-green-500" size={16} />
                        <p className="text-gray-400 text-xs">Fans</p>
                      </div>
                      <p className="text-white font-bold text-sm">
                        {artist.stats?.fans ? artist.stats.fans.toLocaleString() : 'N/A'}
                      </p>
                    </div>

                    {/* Tracks Count */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Music2 className="text-green-500" size={16} />
                        <p className="text-gray-400 text-xs">Tracks</p>
                      </div>
                      <p className="text-white font-bold text-sm">
                        {artist.stats?.tracks || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Artist Location */}
                  {artist.location && (
                    <div className="mb-4 flex items-center gap-2 text-gray-400 text-sm">
                      <User size={16} />
                      <span>From {artist.location}</span>
                    </div>
                  )}

                  {/* Artist Website */}
                  {artist.website && (
                    <div className="mb-4">
                      <a
                        href={artist.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-green-500 hover:text-green-400 text-sm transition-colors"
                      >
                        <ExternalLink size={16} />
                        <span>Visit Website</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* View Profile Button */}
                <button
                  onClick={() => navigate(`/artist/${artist.id}`)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg transition-all text-sm font-bold shadow-lg shadow-green-500/25"
                >
                  View Full Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Related Tracks */}
        {relatedTracks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">More by {track.artist_name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedTracks.map((relatedTrack) => (
                <motion.div
                  key={relatedTrack.id}
                  whileHover={{ scale: 1.05 }}
                  className="group bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all cursor-pointer"
                  onClick={() => navigate(`/track/${relatedTrack.id}`)}
                >
                  <div className="relative mb-3">
                    <img
                      src={relatedTrack.image || 'https://via.placeholder.com/150'}
                      alt={relatedTrack.name}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(relatedTrack, relatedTracks);
                        }}
                        className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 hover:scale-110 transition-all"
                      >
                        <Play size={20} className="text-white ml-0.5" fill="white" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-white text-sm font-semibold truncate mb-1">
                    {relatedTrack.name}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">{relatedTrack.artist_name}</p>
                </motion.div>
              ))}
            </div>
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

export default TrackDetails;
