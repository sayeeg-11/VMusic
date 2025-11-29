import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Play, Pause, Edit3, Trash2, Plus, Music2, 
  Youtube, Clock, MoreVertical, X, Save, Shuffle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { playlistsAPI } from '../api/playlists';

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isShuffle, setIsShuffle] = useState(false);

  useEffect(() => {
    if (currentUser && playlistId) {
      loadPlaylist();
    }
  }, [currentUser, playlistId]);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const data = await playlistsAPI.getUserPlaylists(currentUser.uid);
      const foundPlaylist = data.playlists?.find(p => p._id === playlistId);
      
      if (foundPlaylist) {
        setPlaylist(foundPlaylist);
        setEditedName(foundPlaylist.name);
      } else {
        console.error('Playlist not found');
        navigate('/playlists');
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (!playlist?.tracks?.length) return;
    
    const tracksToPlay = isShuffle ? shuffleArray([...playlist.tracks]) : playlist.tracks;
    
    // Navigate to VibeTube with first track
    navigate('/vibetube', {
      state: {
        autoPlayVideo: {
          videoId: tracksToPlay[0].videoId,
          title: tracksToPlay[0].title,
          channelTitle: tracksToPlay[0].channelTitle || tracksToPlay[0].artist,
          thumbnail: tracksToPlay[0].thumbnail
        }
      }
    });
  };

  const handlePlayTrack = (track, index) => {
    // Navigate to VibeTube with selected track
    navigate('/vibetube', {
      state: {
        autoPlayVideo: {
          videoId: track.videoId,
          title: track.title,
          channelTitle: track.channelTitle || track.artist,
          thumbnail: track.thumbnail
        }
      }
    });
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleUpdateName = async () => {
    if (!editedName.trim() || editedName === playlist.name) {
      setIsEditingName(false);
      return;
    }

    try {
      await playlistsAPI.updatePlaylist(playlistId, { name: editedName });
      setPlaylist({ ...playlist, name: editedName });
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating playlist name:', error);
    }
  };

  const handleDeleteTrack = async (trackId) => {
    if (!confirm('Remove this track from the playlist?')) return;

    try {
      await playlistsAPI.removeTrackFromPlaylist(playlistId, trackId);
      setPlaylist({
        ...playlist,
        tracks: playlist.tracks.filter(t => t.id !== trackId)
      });
    } catch (error) {
      console.error('Error removing track:', error);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!confirm('Are you sure you want to delete this entire playlist?')) return;

    try {
      await playlistsAPI.deletePlaylist(playlistId);
      navigate('/playlists');
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const formatDuration = (duration) => {
    if (!duration || duration === 'N/A') return 'N/A';
    return duration;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-400">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Music2 size={64} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Playlist not found</h2>
          <button
            onClick={() => navigate('/playlists')}
            className="mt-4 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full transition-all"
          >
            Back to Playlists
          </button>
        </div>
      </div>
    );
  }

  const totalDuration = playlist.tracks?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black pb-32">
      {/* Header Section */}
      <div className="relative bg-gradient-to-b from-pink-900/40 via-gray-900/80 to-gray-900 pb-8">
        {/* Background Blur Effect */}
        {playlist.tracks?.[0]?.thumbnail && (
          <div 
            className="absolute inset-0 opacity-30 blur-3xl"
            style={{
              backgroundImage: `url(${playlist.tracks[0].thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}

        <div className="container mx-auto px-6 pt-24 relative z-10">
          {/* Back Button */}
          <button
            onClick={() => navigate('/playlists')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Playlists</span>
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-end">
            {/* Playlist Cover */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative group"
            >
              <div className="w-64 h-64 rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-pink-600/20 to-purple-600/20 border border-white/10">
                {playlist.tracks?.[0]?.thumbnail ? (
                  <img
                    src={playlist.tracks[0].thumbnail}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 size={80} className="text-pink-400/50" />
                  </div>
                )}
              </div>
              {playlist.source === 'youtube' && (
                <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Youtube size={14} />
                  YouTube
                </div>
              )}
            </motion.div>

            {/* Playlist Info */}
            <div className="flex-1">
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Playlist</p>
              
              {/* Editable Name */}
              {isEditingName ? (
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateName();
                      if (e.key === 'Escape') {
                        setEditedName(playlist.name);
                        setIsEditingName(false);
                      }
                    }}
                    className="text-4xl md:text-6xl font-black text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdateName}
                    className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Save size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setEditedName(playlist.name);
                      setIsEditingName(false);
                    }}
                    className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 flex items-center gap-4 group">
                  {playlist.name}
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Edit3 size={24} />
                  </button>
                </h1>
              )}

              <div className="flex items-center gap-4 text-gray-300 text-sm mb-6">
                <span className="font-semibold">{currentUser?.displayName || 'You'}</span>
                <span>•</span>
                <span>{playlist.tracks?.length || 0} songs</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlayAll}
                  disabled={!playlist.tracks?.length}
                  className="px-8 py-4 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-bold rounded-full shadow-lg shadow-pink-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Play size={20} fill="white" />
                  Play All
                </motion.button>

                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-4 rounded-full transition-all ${
                    isShuffle 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'
                  }`}
                  title="Shuffle"
                >
                  <Shuffle size={20} />
                </button>

                <button
                  onClick={handleDeletePlaylist}
                  className="p-4 bg-white/10 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-full transition-all"
                  title="Delete Playlist"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="container mx-auto px-6 py-8">
        {playlist.tracks && playlist.tracks.length > 0 ? (
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm text-gray-400 uppercase tracking-wider border-b border-white/10">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-6 md:col-span-5">Title</div>
              <div className="hidden md:block col-span-3">Channel</div>
              <div className="col-span-2 md:col-span-2">Duration</div>
              <div className="col-span-3 md:col-span-1"></div>
            </div>

            {/* Tracks */}
            <div className="divide-y divide-white/5">
              {playlist.tracks.map((track, index) => (
                <motion.div
                  key={track.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/5 transition-colors group items-center"
                >
                  {/* Index */}
                  <div className="col-span-1 text-center">
                    <span className="text-gray-400 group-hover:hidden">{index + 1}</span>
                    <button
                      onClick={() => handlePlayTrack(track, index)}
                      className="hidden group-hover:inline-flex text-pink-500 hover:text-pink-400 transition-colors"
                    >
                      <Play size={16} fill="currentColor" />
                    </button>
                  </div>

                  {/* Title & Thumbnail */}
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="overflow-hidden">
                      <p className="text-white font-medium truncate group-hover:text-pink-400 transition-colors">
                        {track.title}
                      </p>
                    </div>
                  </div>

                  {/* Channel */}
                  <div className="hidden md:block col-span-3 text-gray-400 truncate">
                    {track.channelTitle || track.artist || 'Unknown'}
                  </div>

                  {/* Duration */}
                  <div className="col-span-2 md:col-span-2 text-gray-400 text-sm">
                    {formatDuration(track.duration)}
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 md:col-span-1 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDeleteTrack(track.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Remove from playlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <Music2 size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">No tracks yet</h3>
            <p className="text-gray-400 mb-6">
              Add tracks from VibeTube search or import from YouTube
            </p>
            <button
              onClick={() => navigate('/vibetube')}
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-full hover:from-pink-700 hover:to-red-700 transition-all"
            >
              Go to VibeTube
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;
