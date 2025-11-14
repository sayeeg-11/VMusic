import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Youtube, Loader2, Music, Play, AlertCircle } from 'lucide-react';
import { youtubeAPI } from '../../api/youtube';

const YouTubePlaylists = ({ isOpen, onClose, userId, accessToken, onPlayVideo }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistItems, setPlaylistItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Fetch user's playlists when modal opens
  useEffect(() => {
    if (isOpen && userId && accessToken) {
      fetchPlaylists();
    }
  }, [isOpen, userId, accessToken]);

  const fetchPlaylists = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await youtubeAPI.getUserPlaylists(userId, accessToken);
      setPlaylists(data.playlists || []);
      if (data.playlists.length === 0) {
        setError('No playlists found. Create playlists on YouTube first!');
      }
    } catch (err) {
      console.error('Error fetching playlists:', err);
      
      // Show user-friendly error message with instructions
      if (err.message.includes('quotas') || err.message.includes('denied')) {
        setError(
          'YouTube API is not available. To enable this feature:\n\n' +
          '1. Go to Google Cloud Console\n' +
          '2. Enable YouTube Data API v3\n' +
          '3. Configure OAuth consent screen\n\n' +
          'For now, you can still search and play videos directly!'
        );
      } else if (err.message.includes('token') || err.message.includes('sign in')) {
        setError('Your session has expired. Please sign out and sign in with Google again.');
      } else {
        setError(err.message || 'Failed to load playlists. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylistItems = async (playlistId) => {
    setLoadingItems(true);
    setError(null);
    try {
      const data = await youtubeAPI.getPlaylistItems(userId, playlistId, accessToken);
      setPlaylistItems(data.items || []);
      if (data.items.length === 0) {
        setError('This playlist is empty!');
      }
    } catch (err) {
      console.error('Error fetching playlist items:', err);
      setError(err.message || 'Failed to load playlist items.');
    } finally {
      setLoadingItems(false);
    }
  };

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(playlist);
    setPlaylistItems([]);
    fetchPlaylistItems(playlist.id);
  };

  const handleBackToPlaylists = () => {
    setSelectedPlaylist(null);
    setPlaylistItems([]);
    setError(null);
  };

  const handlePlayVideo = (item) => {
    if (onPlayVideo) {
      onPlayVideo({
        videoId: item.videoId,
        title: item.title,
        channelTitle: item.channelTitle,
        thumbnail: item.thumbnail,
        duration: 'N/A' // Duration not available from playlistItems endpoint
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-red-900/30 to-pink-900/30">
            <div className="flex items-center gap-3">
              <Youtube className="text-red-500" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedPlaylist ? selectedPlaylist.title : 'My YouTube Playlists'}
                </h2>
                {selectedPlaylist && (
                  <button
                    onClick={handleBackToPlaylists}
                    className="text-sm text-gray-400 hover:text-white transition-colors mt-1"
                  >
                    ← Back to playlists
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
            {/* Loading State */}
            {(loading || loadingItems) && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="text-red-500 animate-spin mb-4" size={48} />
                <p className="text-gray-400">
                  {loading ? 'Loading playlists...' : 'Loading playlist items...'}
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && !loadingItems && (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <AlertCircle className="text-red-500 mb-4" size={48} />
                <p className="text-gray-300 text-center max-w-2xl whitespace-pre-line leading-relaxed">
                  {error}
                </p>
                {(error.includes('sign in') || error.includes('expired')) && (
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Close & Sign In Again
                  </button>
                )}
                {error.includes('Google Cloud Console') && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 mb-3">Alternative: Search videos directly instead</p>
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Playlists List */}
            {!loading && !selectedPlaylist && playlists.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map((playlist) => (
                  <motion.div
                    key={playlist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-red-500/50 transition-all cursor-pointer group"
                    onClick={() => handlePlaylistClick(playlist)}
                  >
                    <div className="relative aspect-video">
                      <img
                        src={playlist.thumbnail}
                        alt={playlist.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="text-white" size={48} />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                        {playlist.itemCount} videos
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-sm line-clamp-2">
                        {playlist.title}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Playlist Items */}
            {!loadingItems && selectedPlaylist && playlistItems.length > 0 && (
              <div className="space-y-3">
                {playlistItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-red-500/50 transition-all group cursor-pointer"
                    onClick={() => handlePlayVideo(item)}
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="relative w-32 h-20 flex-shrink-0 rounded overflow-hidden">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="text-white" size={32} />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-gray-400 text-xs flex items-center gap-2">
                          <Music size={12} />
                          {item.channelTitle}
                        </p>
                      </div>

                      {/* Play Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayVideo(item);
                        }}
                        className="flex-shrink-0 w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Play className="text-white" size={20} fill="white" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default YouTubePlaylists;
