import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Youtube, Loader2, Music, Play, AlertCircle, Download, CheckCircle } from 'lucide-react';
import { youtubeAPI } from '../../api/youtube';
import { playlistsAPI } from '../../api/playlists';

const YouTubePlaylists = ({ isOpen, onClose, userId, accessToken, onPlayVideo, onRefreshAuth }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistItems, setPlaylistItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importedPlaylists, setImportedPlaylists] = useState(new Set());
  const [successMessage, setSuccessMessage] = useState('');

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
      if (err.message.includes('expired') || err.message.includes('TOKEN_EXPIRED')) {
        setError(
          '🔒 Your Google access token has expired.\n\nDon\'t worry, we can refresh it automatically!'
        );
      } else if (err.message.includes('quotas') || err.message.includes('denied')) {
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

  const handleImportPlaylist = async (playlist) => {
    setImporting(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      // Fetch all videos in the playlist
      const data = await youtubeAPI.getPlaylistItems(userId, playlist.id, accessToken);
      const items = data.items || [];
      
      if (items.length === 0) {
        setError('This playlist is empty!');
        return;
      }

      // Transform YouTube playlist items to track format
      const tracks = items.map(item => ({
        id: item.videoId,
        videoId: item.videoId,
        title: item.title,
        artist: item.channelTitle,
        channelTitle: item.channelTitle,
        thumbnail: item.thumbnail,
        source: 'youtube',
        duration: 'N/A'
      }));

      // Save playlist to database
      await playlistsAPI.createPlaylist(
        userId,
        playlist.title,
        tracks,
        'youtube'
      );

      setImportedPlaylists(prev => new Set([...prev, playlist.id]));
      setSuccessMessage(`✅ "${playlist.title}" imported successfully! (${tracks.length} tracks)`);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log(`✅ Playlist "${playlist.title}" imported with ${tracks.length} tracks`);
    } catch (err) {
      console.error('Error importing playlist:', err);
      setError(err.message || 'Failed to import playlist. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleImportAll = async () => {
    setImporting(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      let importedCount = 0;
      let totalTracks = 0;

      for (const playlist of playlists) {
        if (importedPlaylists.has(playlist.id)) {
          console.log(`⏭️ Skipping "${playlist.title}" (already imported)`);
          continue;
        }

        try {
          const data = await youtubeAPI.getPlaylistItems(userId, playlist.id, accessToken);
          const items = data.items || [];
          
          if (items.length === 0) continue;

          const tracks = items.map(item => ({
            id: item.videoId,
            videoId: item.videoId,
            title: item.title,
            artist: item.channelTitle,
            channelTitle: item.channelTitle,
            thumbnail: item.thumbnail,
            source: 'youtube',
            duration: 'N/A'
          }));

          await playlistsAPI.createPlaylist(
            userId,
            playlist.title,
            tracks,
            'youtube'
          );

          setImportedPlaylists(prev => new Set([...prev, playlist.id]));
          importedCount++;
          totalTracks += tracks.length;
          
          console.log(`✅ Imported "${playlist.title}" (${tracks.length} tracks)`);
        } catch (err) {
          console.error(`Failed to import "${playlist.title}":`, err);
        }
      }

      if (importedCount > 0) {
        setSuccessMessage(`✅ Imported ${importedCount} playlist(s) with ${totalTracks} total tracks!`);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError('All playlists are already imported or empty.');
      }
    } catch (err) {
      console.error('Error importing playlists:', err);
      setError('Failed to import playlists. Please try again.');
    } finally {
      setImporting(false);
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
            <div className="flex items-center gap-2">
              {!selectedPlaylist && playlists.length > 0 && (
                <button
                  onClick={handleImportAll}
                  disabled={importing}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  {importing ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Import All
                    </>
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-4 bg-green-600/20 border border-green-500/50 rounded-lg flex items-center gap-3"
              >
                <CheckCircle className="text-green-500" size={24} />
                <p className="text-green-100 font-medium">{successMessage}</p>
              </motion.div>
            )}
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
                {(error.includes('sign in') || error.includes('expired')) && onRefreshAuth && (
                  <div className="mt-6 flex flex-col items-center gap-3">
                    <button
                      onClick={async () => {
                        try {
                          setLoading(true);
                          setError(null);
                          await onRefreshAuth();
                          // Retry fetching playlists with new token
                          await fetchPlaylists();
                        } catch (err) {
                          console.error('Failed to refresh auth:', err);
                          setError('Failed to refresh access. Please try again.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-red-500/50 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Refresh Google Access
                    </button>
                    <p className="text-xs text-gray-500">No need to logout, just reauthorize.</p>
                  </div>
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
                {playlists.map((playlist) => {
                  const isImported = importedPlaylists.has(playlist.id);
                  
                  return (
                    <motion.div
                      key={playlist.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-red-500/50 transition-all"
                    >
                      <div 
                        className="relative aspect-video cursor-pointer group"
                        onClick={() => handlePlaylistClick(playlist)}
                      >
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
                        {isImported && (
                          <div className="absolute top-2 right-2 bg-green-600 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                            <CheckCircle size={12} />
                            Imported
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-semibold text-sm line-clamp-2 mb-3">
                          {playlist.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImportPlaylist(playlist);
                          }}
                          disabled={importing || isImported}
                          className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium ${
                            isImported
                              ? 'bg-green-600/30 text-green-400 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          {isImported ? (
                            <>
                              <CheckCircle size={16} />
                              Imported
                            </>
                          ) : importing ? (
                            <>
                              <Loader2 className="animate-spin" size={16} />
                              Importing...
                            </>
                          ) : (
                            <>
                              <Download size={16} />
                              Import Playlist
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
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
