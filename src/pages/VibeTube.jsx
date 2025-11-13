import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Plus,
  X,
  List,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Music2,
  Loader,
  AlertCircle,
  Trash2,
  GripVertical,
  Youtube,
  Eye,
  EyeOff,
  FolderPlus,
  Edit2,
  Check,
  Maximize,
  Minimize,
  TrendingUp,
  Star,
  Clock,
  Filter,
  Grid,
  ListMusic,
  ChevronDown,
  Sparkles,
  Zap,
  Radio,
  Flame,
  Heart,
  Save,
  Expand
} from 'lucide-react';

// YouTube API Configuration
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Component: SearchBar with Quick Filters
const SearchBar = ({ onSearch, isLoading, onQuickFilter }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const quickFilters = [
    { label: '🔥 Trending', value: 'trending music 2024' },
    { label: '🎵 Top Hits', value: 'top music hits' },
    { label: '💖 Romantic', value: 'romantic songs' },
    { label: '🎸 Rock', value: 'rock music' },
    { label: '🎹 Piano', value: 'piano instrumental' },
    { label: '🎧 Electronic', value: 'electronic music' },
    { label: '🎤 Pop', value: 'pop music hits' },
    { label: '🌙 Lo-Fi', value: 'lofi hip hop' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Search millions of music videos..."
            className="w-full px-6 py-5 pl-14 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/20 hover:border-red-400/50 rounded-3xl text-white text-lg placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-400 transition-all shadow-2xl"
            disabled={isLoading}
            aria-label="Search YouTube videos"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-red-400 group-hover:scale-110 transition-transform" size={24} />
          {isLoading && (
            <Loader className="absolute right-5 top-1/2 -translate-y-1/2 text-red-400 animate-spin" size={24} />
          )}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-16 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Filter size={20} />
          </button>
        </div>
      </form>

      {/* Quick Filter Chips */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {quickFilters.map((filter, index) => (
              <motion.button
                key={filter.value}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setQuery(filter.value);
                  onSearch(filter.value);
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-600/20 to-pink-600/20 hover:from-red-600/40 hover:to-pink-600/40 border border-red-400/30 rounded-full text-white text-sm font-medium backdrop-blur-xl transition-all hover:scale-105 shadow-lg"
              >
                {filter.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Component: SearchResults with Grid/List View
const SearchResults = ({ results, onAdd, onPlayNow, onFullscreen, playlists, isLoading, error }) => {
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
            <div className="aspect-video bg-white/10 rounded-lg mb-3"></div>
            <div className="h-4 bg-white/10 rounded mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <Music2 size={64} className="text-red-400 mb-4 mx-auto" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Discover Amazing Music</h3>
        <p className="text-gray-400 text-lg">Search for your favorite artists, songs, or genres</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-red-400" size={20} />
          <span className="text-white font-semibold">{results.length} Videos Found</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <ListMusic size={18} />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((video, index) => (
            <motion.div
              key={video.videoId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03, type: "spring" }}
              className="group bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-2xl overflow-visible border border-white/20 hover:border-red-400/60 transition-all shadow-xl hover:shadow-2xl hover:shadow-red-900/30 hover:-translate-y-2"
            >
              <div className="relative aspect-video overflow-hidden cursor-pointer rounded-t-2xl" onClick={() => onFullscreen(video)}>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl"
                  >
                    <Play size={28} className="text-white ml-1" fill="white" />
                  </motion.div>
                </div>
                {video.duration && (
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/90 backdrop-blur-sm rounded-lg text-xs text-white font-bold border border-white/20">
                    {video.duration}
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2 py-1 bg-red-600/90 backdrop-blur-sm rounded-lg text-xs text-white font-bold">
                  HD
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-sm line-clamp-2 mb-2 group-hover:text-red-400 transition-colors leading-tight">
                  {video.title}
                </h3>
                <p className="text-gray-400 text-xs mb-3 truncate flex items-center gap-1">
                  <Youtube size={12} className="text-red-500" />
                  {video.channelTitle}
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onPlayNow(video)}
                    className="flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all hover:scale-110"
                  >
                    <Zap size={20} fill="white" />
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowPlaylistMenu(showPlaylistMenu === video.videoId ? null : video.videoId)}
                      className={`flex items-center justify-center w-12 h-12 rounded-xl text-white transition-all hover:scale-110 ${
                        showPlaylistMenu === video.videoId 
                          ? 'bg-red-500/30 border-2 border-red-400' 
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <Heart 
                        size={20} 
                        className={showPlaylistMenu === video.videoId ? 'fill-red-400 text-red-400' : ''}
                      />
                    </button>
                    
                    <AnimatePresence>
                      {showPlaylistMenu === video.videoId && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                          onClick={() => setShowPlaylistMenu(null)}
                        >
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-80 bg-gray-900 backdrop-blur-xl border-2 border-white/30 rounded-2xl shadow-2xl overflow-hidden"
                          >
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-bold text-lg">Add to Playlist</h3>
                                <button
                                  onClick={() => setShowPlaylistMenu(null)}
                                  className="text-gray-400 hover:text-white transition-colors"
                                >
                                  <X size={20} />
                                </button>
                              </div>
                              <div className="max-h-96 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {playlists.map((playlist) => (
                                  <button
                                    key={playlist.id}
                                    onClick={() => {
                                      onAdd(video, playlist.id);
                                      setShowPlaylistMenu(null);
                                    }}
                                    className="w-full px-4 py-3 text-left text-white hover:bg-red-600/70 bg-white/5 rounded-xl transition-colors text-sm font-medium flex items-center gap-3 group"
                                  >
                                    <FolderPlus size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
                                    <span className="flex-1">{playlist.name}</span>
                                    <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">
                                      {playlist.tracks?.length || 0}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <button
                    onClick={() => onFullscreen(video)}
                    className="flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all hover:scale-110"
                  >
                    <Expand size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {results.map((video, index) => (
            <motion.div
              key={video.videoId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className="group flex items-center gap-4 p-4 bg-gradient-to-r from-white/10 to-transparent backdrop-blur-xl rounded-xl border border-white/20 hover:border-red-400/60 transition-all hover:bg-white/20"
            >
              <div className="relative w-40 aspect-video rounded-lg overflow-hidden shrink-0 cursor-pointer" onClick={() => onFullscreen(video)}>
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play size={24} className="text-white" fill="white" />
                </div>
                {video.duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/90 rounded text-xs text-white font-bold">
                    {video.duration}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base line-clamp-1 mb-1 group-hover:text-red-400 transition-colors">
                  {video.title}
                </h3>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <Youtube size={14} className="text-red-500" />
                  {video.channelTitle}
                </p>
              </div>
              
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => onPlayNow(video)}
                  className="flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all hover:scale-110"
                >
                  <Zap size={20} fill="white" />
                </button>
                <button
                  onClick={() => onFullscreen(video)}
                  className="flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all hover:scale-110"
                >
                  <Expand size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Component: Fullscreen Video Modal
const FullscreenModal = ({ video, onClose, onPlay }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-10"
        >
          <X size={24} />
        </button>
        
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden border-2 border-red-500/30 shadow-2xl">
          <div className="aspect-video w-full bg-black relative">
            <div id="fullscreen-player" className="absolute inset-0"></div>
          </div>
          
          <div className="p-6 bg-gradient-to-r from-gray-900 to-black">
            <h2 className="text-2xl font-black text-white mb-2 line-clamp-2">{video.title}</h2>
            <div className="flex items-center justify-between">
              <p className="text-gray-400 flex items-center gap-2">
                <Youtube size={20} className="text-red-500" />
                {video.channelTitle}
              </p>
              <button
                onClick={() => {
                  onPlay(video);
                  onClose();
                }}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white text-lg font-bold transition-all flex items-center justify-center hover:scale-105"
              >
                <Zap size={32} fill="white" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Component: NowPlaying with Enhanced UI
const NowPlaying = ({ currentTrack, showVideo, onToggleVideo, onFullscreen }) => {
  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", duration: 1 }}
          className="relative mb-6"
        >
          <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
            <Music2 size={48} className="text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-pink-600 rounded-full animate-ping opacity-20"></div>
        </motion.div>
        <h3 className="text-2xl font-black text-white mb-2">Ready to Rock? 🎵</h3>
        <p className="text-gray-400 text-center">Search and play any music video you love!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Video/Album Art Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6">
        {showVideo ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-full max-w-2xl aspect-video rounded-3xl overflow-hidden shadow-2xl border-2 border-red-500/30"
            id="video-container"
          >
            {/* Video will be embedded here */}
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative group"
          >
            <div className="w-80 h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>
            {/* Floating decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </motion.div>
        )}
      </div>

      {/* Track Info */}
      <div className="text-center px-6 pb-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-black mb-3 line-clamp-2 bg-gradient-to-r from-white via-red-200 to-pink-200 bg-clip-text text-transparent"
        >
          {currentTrack.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg flex items-center justify-center gap-2 mb-4"
        >
          <Youtube size={20} className="text-red-500" />
          {currentTrack.channelTitle}
        </motion.p>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleVideo}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all flex items-center gap-2"
          >
            {showVideo ? <EyeOff size={18} /> : <Eye size={18} />}
            {showVideo ? 'Audio Mode' : 'Video Mode'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFullscreen(currentTrack)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all flex items-center gap-2"
          >
            <Maximize size={18} />
            Fullscreen
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// Component: Player Controls
const PlayerControls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleMute,
  isRepeat,
  isShuffle,
  onToggleRepeat,
  onToggleShuffle,
}) => {
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime || 0}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-red-400"
          aria-label="Seek video"
          style={{
            background: `linear-gradient(to right, rgb(239 68 68) 0%, rgb(239 68 68) ${progress}%, rgba(255,255,255,0.2) ${progress}%, rgba(255,255,255,0.2) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onToggleShuffle}
          className={`p-2 rounded-full transition-colors ${
            isShuffle ? 'text-red-400 bg-red-400/20' : 'text-gray-400 hover:text-white'
          }`}
          aria-label="Toggle shuffle"
          title="Shuffle"
        >
          <Shuffle size={20} />
        </button>

        <button
          onClick={onPrevious}
          className="p-3 text-white hover:text-red-400 transition-all hover:scale-110"
          aria-label="Previous video"
        >
          <SkipBack size={28} fill="currentColor" />
        </button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlayPause}
          className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center shadow-2xl hover:shadow-red-900/50 transition-all"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause size={32} className="text-white" fill="white" />
          ) : (
            <Play size={32} className="text-white ml-1" fill="white" />
          )}
        </motion.button>

        <button
          onClick={onNext}
          className="p-3 text-white hover:text-red-400 transition-all hover:scale-110"
          aria-label="Next video"
        >
          <SkipForward size={28} fill="currentColor" />
        </button>

        <button
          onClick={onToggleRepeat}
          className={`p-2 rounded-full transition-colors ${
            isRepeat ? 'text-red-400 bg-red-400/20' : 'text-gray-400 hover:text-white'
          }`}
          aria-label="Toggle repeat"
          title="Repeat"
        >
          <Repeat size={20} />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMute}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(parseInt(e.target.value))}
          className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          aria-label="Volume control"
        />
        <span className="text-xs text-gray-400 w-8 text-right">{volume}</span>
      </div>
    </div>
  );
};

// Component: Playlist Manager
const PlaylistManager = ({ playlists, onCreatePlaylist, onRenamePlaylist, onDeletePlaylist, currentPlaylistId, onSelectPlaylist }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };

  const handleRename = (id) => {
    if (editName.trim()) {
      onRenamePlaylist(id, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music2 size={20} className="text-red-400" />
          <h3 className="text-xl font-black text-white">My Playlists</h3>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all hover:scale-105"
          aria-label="Create new playlist"
        >
          <FolderPlus size={18} />
          <span className="text-sm font-medium">New</span>
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="flex gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Playlist name..."
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all hover:scale-105 shrink-0"
                title="Create"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewPlaylistName('');
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all hover:scale-105 shrink-0"
                title="Cancel"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
        {playlists.map((playlist, index) => (
          <motion.div
            key={playlist.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group relative overflow-hidden rounded-xl transition-all ${
              currentPlaylistId === playlist.id
                ? 'bg-gradient-to-r from-red-600/30 to-pink-600/20 border-2 border-red-400/50 shadow-lg shadow-red-900/20'
                : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
            }`}
          >
            {editingId === playlist.id ? (
              <div className="flex items-center gap-2 p-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleRename(playlist.id)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoFocus
                />
                <button
                  onClick={() => handleRename(playlist.id)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all hover:scale-105"
                  title="Save"
                >
                  <Check size={16} className="text-white" />
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditName('');
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all hover:scale-105"
                  title="Cancel"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3">
                <button
                  onClick={() => onSelectPlaylist(playlist.id)}
                  className="flex-1 text-left flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentPlaylistId === playlist.id
                      ? 'bg-red-500/30'
                      : 'bg-white/10'
                  }`}>
                    <List size={18} className={currentPlaylistId === playlist.id ? 'text-red-400' : 'text-gray-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${
                      currentPlaylistId === playlist.id ? 'text-red-400' : 'text-white'
                    }`}>
                      {playlist.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
                    </p>
                  </div>
                </button>
                <div className="flex gap-1">
                  {playlist.id !== 'default' && (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(playlist.id);
                          setEditName(playlist.name);
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Rename"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeletePlaylist(playlist.id)}
                        className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Component: Playlist
const Playlist = ({ playlist, currentIndex, onPlay, onRemove, onReorder }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (playlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <List size={48} className="text-gray-600 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Playlist is empty</h3>
        <p className="text-gray-400">Add videos from search results</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
      {playlist.map((video, index) => (
        <motion.div
          key={`${video.videoId}-${index}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`group flex items-center gap-3 p-3 rounded-xl transition-all cursor-move ${
            currentIndex === index
              ? 'bg-gradient-to-r from-red-600/30 to-red-500/30 border border-red-400/50'
              : 'bg-white/5 hover:bg-white/10 border border-white/10'
          }`}
        >
          <GripVertical size={16} className="text-gray-500 shrink-0" />
          
          <button
            onClick={() => onPlay(index)}
            className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden group-hover:ring-2 ring-red-400 transition-all"
          >
            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play size={20} className="text-white" fill="white" />
            </div>
          </button>

          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-sm line-clamp-1 ${
              currentIndex === index ? 'text-red-400' : 'text-white'
            }`}>
              {video.title}
            </h4>
            <p className="text-gray-400 text-xs truncate">{video.channelTitle}</p>
            {video.duration && (
              <p className="text-gray-500 text-xs">{video.duration}</p>
            )}
          </div>

          <button
            onClick={() => onRemove(index)}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors shrink-0"
            aria-label={`Remove ${video.title}`}
          >
            <Trash2 size={18} />
          </button>
        </motion.div>
      ))}
    </div>
  );
};

// Main VibeTube Component
const VibeTube = () => {
  // State Management
  const [searchResults, setSearchResults] = useState([]);
  const [playlists, setPlaylists] = useState([
    { id: 'default', name: 'My Playlist', tracks: [] }
  ]);
  const [currentPlaylistId, setCurrentPlaylistId] = useState('default');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentTrack, setCurrentTrack] = useState(null); // Track being played (may not be in playlist)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  const [pageToken, setPageToken] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('top music 2024');

  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const fullscreenPlayerRef = useRef(null);
  
  const currentPlaylist = playlists.find(p => p.id === currentPlaylistId) || playlists[0];
  const playlist = currentPlaylist.tracks;

  // Load playlists from localStorage
  useEffect(() => {
    const savedPlaylists = localStorage.getItem('vibetube_playlists');
    if (savedPlaylists) {
      try {
        const parsed = JSON.parse(savedPlaylists);
        setPlaylists(parsed);
      } catch (err) {
        console.error('Failed to load playlists:', err);
      }
    }
  }, []);

  // Save playlists to localStorage
  useEffect(() => {
    localStorage.setItem('vibetube_playlists', JSON.stringify(playlists));
  }, [playlists]);

  // Initialize YouTube Player
  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        height: '360',
        width: '640',
        playerVars: {
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            console.log('YouTube Player Ready');
            event.target.setVolume(volume);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startProgressTracking();
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              stopProgressTracking();
            } else if (event.data === window.YT.PlayerState.ENDED) {
              handleVideoEnd();
            }
          },
        },
      });
    };

    return () => {
      stopProgressTracking();
    };
  }, []);

  // Update video container when showVideo changes
  useEffect(() => {
    if (playerRef.current && playerRef.current.getIframe) {
      const iframe = playerRef.current.getIframe();
      const container = document.getElementById(showVideo ? 'video-container' : 'yt-player');
      if (container && iframe) {
        container.appendChild(iframe);
        iframe.style.width = showVideo ? '100%' : '1px';
        iframe.style.height = showVideo ? '100%' : '1px';
      }
    }
  }, [showVideo]);

  // Progress Tracking
  const startProgressTracking = () => {
    stopProgressTracking();
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
        if (playerRef.current.getDuration) {
          setDuration(playerRef.current.getDuration());
        }
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Handle Video End
  const handleVideoEnd = () => {
    if (isRepeat) {
      playerRef.current?.playVideo();
    } else {
      handleNext();
    }
  };

  // Parse ISO 8601 duration to readable format
  const parseDuration = (isoDuration) => {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return null;

    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // YouTube API Functions - Enhanced to load MORE results
  const searchVideos = async (query, append = false, nextPageToken = null) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setIsLoading(true);
      setSearchResults([]);
      setPageToken(null);
      setHasMore(true);
    }
    setError(null);
    setCurrentQuery(query);

    try {
      // Search for videos - INCREASED from 12 to 24 results!
      const pageTokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : '';
      const searchResponse = await fetch(
        `${YOUTUBE_API_BASE}/search?part=snippet&type=video&videoCategoryId=10&maxResults=24&q=${encodeURIComponent(
          query
        )}${pageTokenParam}&key=${YOUTUBE_API_KEY}`
      );

      if (!searchResponse.ok) {
        throw new Error('Failed to search videos. Please check your API key.');
      }

      const searchData = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        if (!append) {
          setSearchResults([]);
        }
        setHasMore(false);
        setIsLoading(false);
        setLoadingMore(false);
        return;
      }

      // Store next page token
      setPageToken(searchData.nextPageToken || null);
      setHasMore(!!searchData.nextPageToken);

      // Get video IDs for duration lookup
      const videoIds = searchData.items.map((item) => item.id.videoId).join(',');

      // Fetch video details including duration
      const detailsResponse = await fetch(
        `${YOUTUBE_API_BASE}/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
      );

      const detailsData = await detailsResponse.json();

      // Parse duration and combine data
      const results = searchData.items.map((item, index) => {
        const details = detailsData.items[index];
        const duration = details ? parseDuration(details.contentDetails.duration) : null;

        return {
          videoId: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.medium.url,
          duration: duration,
        };
      });

      if (append) {
        setSearchResults(prev => [...prev, ...results]);
      } else {
        setSearchResults(results);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search videos. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreVideos = () => {
    if (!loadingMore && hasMore && pageToken) {
      searchVideos(currentQuery, true, pageToken);
    }
  };

  // Load popular music on component mount - Now loads MORE music!
  useEffect(() => {
    const loadPopularMusic = async () => {
      // Load popular music videos by default
      await searchVideos('top music 2024');
    };

    loadPopularMusic();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore || isLoading) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // Load more when user is 500px from bottom
      if (scrollTop + clientHeight >= scrollHeight - 500) {
        loadMoreVideos();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, isLoading, pageToken, currentQuery]);

  // Playlist Management Functions
  const createPlaylist = (name) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      tracks: []
    };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const renamePlaylist = (id, newName) => {
    setPlaylists(prev => prev.map(p => 
      p.id === id ? { ...p, name: newName } : p
    ));
  };

  const deletePlaylist = (id) => {
    if (id === 'default') return;
    setPlaylists(prev => prev.filter(p => p.id !== id));
    if (currentPlaylistId === id) {
      setCurrentPlaylistId('default');
    }
  };

  const addToPlaylist = (video, playlistId = currentPlaylistId) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        // Check if video already exists
        const exists = p.tracks.some(t => t.videoId === video.videoId);
        if (!exists) {
          // Show success feedback
          console.log(`✅ Added "${video.title}" to playlist "${p.name}"`);
          return { ...p, tracks: [...p.tracks, video] };
        } else {
          console.log(`ℹ️ "${video.title}" already exists in playlist "${p.name}"`);
        }
      }
      return p;
    }));
  };

  const removeFromPlaylist = (index) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === currentPlaylistId) {
        const newTracks = p.tracks.filter((_, i) => i !== index);
        
        // If currently playing track from this playlist
        if (currentTrack && currentIndex === index && p.tracks[index]?.videoId === currentTrack.videoId) {
          setCurrentIndex(-1);
          setCurrentTrack(null);
          playerRef.current?.stopVideo();
        } else if (index < currentIndex) {
          setCurrentIndex(prev => prev - 1);
        }
        
        return { ...p, tracks: newTracks };
      }
      return p;
    }));
  };

  const reorderPlaylist = (fromIndex, toIndex) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === currentPlaylistId) {
        const newTracks = [...p.tracks];
        const [removed] = newTracks.splice(fromIndex, 1);
        newTracks.splice(toIndex, 0, removed);
        
        // Update current index if needed
        if (fromIndex === currentIndex) {
          setCurrentIndex(toIndex);
        } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
          setCurrentIndex(prev => prev - 1);
        } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
          setCurrentIndex(prev => prev + 1);
        }
        
        return { ...p, tracks: newTracks };
      }
      return p;
    }));
  };

  // Play video directly without adding to playlist
  const playNow = (video) => {
    setCurrentTrack(video);
    setCurrentIndex(-1); // Not from playlist
    
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(video.videoId);
      playerRef.current.playVideo();
    }
  };

  // Fullscreen modal controls
  const openFullscreen = (video) => {
    setFullscreenVideo(video);
  };

  const closeFullscreen = () => {
    setFullscreenVideo(null);
  };

  const playVideo = (index) => {
    if (index < 0 || index >= playlist.length) return;
    
    setCurrentIndex(index);
    const video = playlist[index];
    setCurrentTrack(video);
    
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(video.videoId);
      playerRef.current.playVideo();
    }
  };

  // Player Controls
  const handlePlayPause = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      if (!currentTrack && playlist.length > 0) {
        playVideo(0);
      } else if (currentTrack) {
        playerRef.current.playVideo();
      }
    }
  };

  const handleNext = () => {
    // Only skip if playing from playlist
    if (currentIndex === -1 || playlist.length === 0) return;
    
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    
    playVideo(nextIndex);
  };

  const handlePrevious = () => {
    // Only skip if playing from playlist
    if (currentIndex === -1 || playlist.length === 0) return;
    
    let prevIndex;
    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex = currentIndex - 1 < 0 ? playlist.length - 1 : currentIndex - 1;
    }
    
    playVideo(prevIndex);
  };

  const handleSeek = (time) => {
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(time, true);
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(newVolume);
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-black pb-20 relative">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Fullscreen Video Modal */}
      <AnimatePresence>
        {fullscreenVideo && (
          <FullscreenModal
            video={fullscreenVideo}
            onClose={closeFullscreen}
            onPlay={playNow}
          />
        )}
      </AnimatePresence>

      {/* YouTube Player Container (hidden when not showing video) */}
      {!showVideo && (
        <div style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', opacity: 0 }}>
          <div id="yt-player"></div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-900/40 via-pink-900/40 to-purple-900/40 border-b border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Youtube size={56} className="text-red-500" />
              </motion.div>
              <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-red-200 to-pink-200 bg-clip-text text-transparent">
                VibeTube
              </h1>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles size={36} className="text-yellow-400" />
              </motion.div>
            </div>
            <p className="text-gray-300 text-xl font-medium">Stream Millions of Music Videos in Stunning Quality</p>
          </motion.div>

          <SearchBar onSearch={searchVideos} isLoading={isLoading} />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Search Results - FULL WIDTH on large screens */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-4"
              >
                <TrendingUp className="text-red-400" size={28} />
                <h2 className="text-3xl font-black text-white">Discover Music</h2>
              </motion.div>
              <SearchResults
                results={searchResults}
                onAdd={addToPlaylist}
                onPlayNow={playNow}
                onFullscreen={openFullscreen}
                playlists={playlists}
                isLoading={isLoading}
                error={error}
              />

              {/* Loading More Indicator */}
              {loadingMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-400 text-sm">Loading more videos...</p>
                </motion.div>
              )}

              {/* No More Videos Indicator */}
              {!hasMore && searchResults.length > 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <p className="text-gray-400 text-sm">
                    🎵 You've reached the end! All videos loaded.
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right: Player & Playlist */}
          <div className="lg:col-span-1 space-y-6">
            {/* Now Playing */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-r from-red-900/30 to-pink-900/30 border-b border-white/10">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Music2 className="text-red-400" size={24} />
                  Now Playing
                </h2>
              </div>
              <NowPlaying 
                currentTrack={currentTrack} 
                showVideo={showVideo}
                onToggleVideo={() => setShowVideo(!showVideo)}
                onFullscreen={openFullscreen}
              />
              <div className="p-6 border-t border-white/10">
                <PlayerControls
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  volume={volume}
                  isMuted={isMuted}
                  onPlayPause={handlePlayPause}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onSeek={handleSeek}
                  onVolumeChange={handleVolumeChange}
                  onToggleMute={handleToggleMute}
                  isRepeat={isRepeat}
                  isShuffle={isShuffle}
                  onToggleRepeat={() => setIsRepeat(!isRepeat)}
                  onToggleShuffle={() => setIsShuffle(!isShuffle)}
                />
              </div>
            </motion.div>

            {/* Playlist Manager */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-6 border-2 border-white/20 shadow-2xl"
            >
              <PlaylistManager
                playlists={playlists}
                onCreatePlaylist={createPlaylist}
                onRenamePlaylist={renamePlaylist}
                onDeletePlaylist={deletePlaylist}
                currentPlaylistId={currentPlaylistId}
                onSelectPlaylist={setCurrentPlaylistId}
              />
            </motion.div>

            {/* Current Playlist */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-6 border-2 border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <List className="text-red-400" />
                  {currentPlaylist.name} ({playlist.length})
                </h2>
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className="lg:hidden p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                >
                  {showPlaylist ? <X size={20} /> : <List size={20} />}
                </button>
              </div>
              <div className={`${showPlaylist ? 'block' : 'hidden'} lg:block`}>
                <Playlist
                  playlist={playlist}
                  currentIndex={currentIndex}
                  onPlay={playVideo}
                  onRemove={removeFromPlaylist}
                  onReorder={reorderPlaylist}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.7);
        }
      `}</style>
    </div>
  );
};

export default VibeTube;
