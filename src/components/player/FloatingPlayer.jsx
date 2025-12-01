import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Shuffle,
  Repeat,
  X,
  ExternalLink,
} from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import jamendoAPI from '../../api/jamendo';
import SignIn from '../auth/SignIn';

const FloatingPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    changeVolume,
  } = usePlayer();

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showVolume, setShowVolume] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isVisible, setIsVisible] = useState(true);
  const [showSignInModal, setShowSignInModal] = useState(false);

  if (!currentTrack || !isVisible) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    seek(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    changeVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      changeVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      changeVolume(0);
      setIsMuted(true);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl"
      >
        {/* Progress Bar */}
        <div
          onClick={handleProgressClick}
          className="absolute top-0 left-0 right-0 h-1 bg-white/10 cursor-pointer group"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"></div>
          </motion.div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {/* Album Art - Increased Size - Clickable */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/track/${currentTrack.id}`)}
                className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg overflow-hidden shadow-xl cursor-pointer group"
              >
                {currentTrack.image ? (
                  <img
                    src={currentTrack.image}
                    alt={currentTrack.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ListMusic size={28} className="text-purple-400" />
                  </div>
                )}
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ExternalLink size={20} className="text-white" />
                </div>
              </motion.div>

              {/* Track Details - Clickable */}
              <div className="min-w-0 flex-1">
                <motion.h4
                  whileHover={{ x: 3 }}
                  onClick={() => navigate(`/track/${currentTrack.id}`)}
                  className="text-white font-semibold truncate text-sm md:text-base hover:text-green-400 transition-colors cursor-pointer flex items-center gap-2 w-fit group"
                >
                  {currentTrack.name}
                  <ExternalLink
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  />
                </motion.h4>
                <motion.p
                  whileHover={{ x: 3 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/artist/${currentTrack.artist_id}`);
                  }}
                  className="text-gray-400 text-xs md:text-sm truncate hover:text-purple-400 hover:underline transition-all cursor-pointer w-fit"
                >
                  {currentTrack.artist_name}
                </motion.p>
              </div>

              {/* Like Button (Desktop) */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (!currentUser) {
                    setShowSignInModal(true);
                  } else {
                    // TODO: Add to favorites
                    console.log('Add to favorites');
                  }
                }}
                className="hidden md:block text-gray-400 hover:text-pink-500 transition-colors"
              >
                <Heart size={20} />
              </motion.button>
            </div>

            {/* Player Controls - Single Line */}
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              {/* Shuffle (Desktop) */}
              <button className="hidden lg:block text-gray-400 hover:text-white transition-colors">
                <Shuffle size={18} />
              </button>

              {/* Previous */}
              <button
                onClick={playPrevious}
                className="text-gray-300 hover:text-white transition-all hover:scale-110"
              >
                <SkipBack size={20} md:size={24} fill="currentColor" />
              </button>

              {/* Play/Pause - Enhanced */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={togglePlay}
                className="w-11 h-11 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all"
              >
                {isPlaying ? (
                  <Pause size={22} className="text-gray-900 md:w-6 md:h-6" fill="currentColor" />
                ) : (
                  <Play
                    size={22}
                    className="text-gray-900 ml-0.5 md:w-6 md:h-6"
                    fill="currentColor"
                  />
                )}
              </motion.button>

              {/* Next */}
              <button
                onClick={playNext}
                className="text-gray-300 hover:text-white transition-all hover:scale-110"
              >
                <SkipForward size={20} md:size={24} fill="currentColor" />
              </button>

              {/* Repeat (Desktop) */}
              <button className="hidden lg:block text-gray-400 hover:text-white transition-colors">
                <Repeat size={18} />
              </button>

              {/* Time Display */}
              <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 min-w-20">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Queue Button (Desktop) */}
              <button className="hidden lg:block text-gray-400 hover:text-white transition-colors">
                <ListMusic size={20} />
              </button>

              {/* Volume Control (Desktop) */}
              <div
                className="hidden md:flex items-center gap-2"
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                <button
                  onClick={toggleMute}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                <AnimatePresence>
                  {showVolume && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 100, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Time Display */}
              <div className="md:hidden text-xs text-gray-400 min-w-[60px] text-right">
                <div>{formatTime(currentTime)}</div>
                <div className="text-gray-600">{formatTime(duration)}</div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                title="Hide player"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sign In Modal */}
      {showSignInModal && (
        <SignIn
          onClose={() => setShowSignInModal(false)}
          onSwitchToSignUp={() => {
            setShowSignInModal(false);
            // If you have sign up modal, open it here
          }}
        />
      )}
    </AnimatePresence>
  );
};

export default FloatingPlayer;
