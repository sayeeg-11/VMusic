import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ListMusic, Plus, Play, Trash2, Edit3, Music2, Youtube } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { playlistsAPI } from '../api/playlists';

const Playlists = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { playTrack } = usePlayer();
  const [playlists, setPlaylists] = useState([]);
  const [mongoPlaylists, setMongoPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadPlaylists();
      loadMongoPlaylists();
    }
  }, [currentUser]);

  const loadPlaylists = async () => {
    try {
      const q = query(
        collection(db, 'playlists'),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const playlistsData = [];
      querySnapshot.forEach((doc) => {
        playlistsData.push({ id: doc.id, ...doc.data() });
      });
      setPlaylists(playlistsData);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMongoPlaylists = async () => {
    try {
      console.log('📥 Fetching playlists for user:', currentUser.uid);
      const data = await playlistsAPI.getUserPlaylists(currentUser.uid);
      console.log('📦 API Response:', data);
      console.log('📋 Playlists array:', data.playlists);
      setMongoPlaylists(data.playlists || []);
      console.log('✅ Loaded', data.playlists?.length || 0, 'playlists from MongoDB');
    } catch (error) {
      console.error('❌ Error loading MongoDB playlists:', error);
    }
  };

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setCreating(true);
    try {
      await addDoc(collection(db, 'playlists'), {
        name: newPlaylistName,
        description: '',
        userId: currentUser.uid,
        tracks: [],
        isPublic: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      setNewPlaylistName('');
      setShowCreateModal(false);
      loadPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setCreating(false);
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await deleteDoc(doc(db, 'playlists', playlistId));
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <ListMusic size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  My Playlists
                </h1>
                <p className="text-gray-300 text-lg mt-1">
                  {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Create Playlist Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Create Playlist</span>
            </button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* YouTube Imported Playlists Section */}
        {mongoPlaylists.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Youtube className="text-red-500" size={28} />
              <h2 className="text-2xl font-bold text-white">YouTube Playlists</h2>
              <span className="px-3 py-1 bg-red-600/20 text-red-400 text-sm rounded-full">
                {mongoPlaylists.length} imported
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mongoPlaylists.map((playlist, index) => (
                <motion.div
                  key={playlist._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 200, delay: index * 0.05 }}
                  onClick={() => navigate(`/playlist/${playlist._id}`)}
                  className="group relative bg-gradient-to-b from-[#1b0c2d] to-[#090e16] rounded-2xl p-4 border border-pink-500/20 hover:border-pink-500/60 shadow-lg hover:shadow-pink-500/30 backdrop-blur-lg overflow-hidden cursor-pointer"
                >
                  {/* Thumbnail Container with Blur Background */}
                  <div className="relative h-44 rounded-xl overflow-hidden mb-4">
                    {/* Background Thumbnail - Blurred */}
                    {playlist.tracks && playlist.tracks[0]?.thumbnail ? (
                      <>
                        <img 
                          src={playlist.tracks[0].thumbnail} 
                          alt={playlist.name}
                          className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm opacity-40"
                        />
                        {/* Main Thumbnail - Sharp */}
                        <img 
                          src={playlist.tracks[0].thumbnail} 
                          alt={playlist.name}
                          className="relative w-full h-full object-cover scale-110 group-hover:scale-100 transition-all duration-500 opacity-80"
                        />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-600/20 to-pink-600/20 flex items-center justify-center">
                        <Youtube size={64} className="text-red-400 opacity-50" />
                      </div>
                    )}
                    
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-all duration-300" />
                    
                    {/* Center Play Button */}
                    <button 
                      onClick={() => {
                        if (playlist.tracks && playlist.tracks.length > 0) {
                          const track = playlist.tracks[0];
                          navigate('/vibetube', {
                            state: {
                              autoPlayVideo: {
                                videoId: track.videoId,
                                title: track.title,
                                channelTitle: track.artist || track.channelTitle,
                                thumbnail: track.thumbnail
                              }
                            }
                          });
                        }
                      }}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-pink-600 hover:bg-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-pink-500/50 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                      title="Play All"
                    >
                      <Play size={24} className="text-white ml-1" fill="white" />
                    </button>
                    
                    {/* Delete Button - Top Right */}
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${playlist.name}"? This cannot be undone.`)) {
                          try {
                            await playlistsAPI.deletePlaylist(playlist._id);
                            loadMongoPlaylists();
                          } catch (error) {
                            console.error('Error deleting playlist:', error);
                            alert('Failed to delete playlist');
                          }
                        }
                      }}
                      className="absolute top-3 right-3 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 hover:rotate-12 transition-all duration-300"
                      title="Delete playlist"
                    >
                      <Trash2 size={18} className="text-white" />
                    </button>

                    {/* YouTube Badge - Bottom Left */}
                    <div className="absolute bottom-3 left-3 bg-red-600/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                      <Youtube size={14} className="text-white" />
                      <span className="text-white text-xs font-semibold">YouTube</span>
                    </div>

                    {/* Track Count Badge - Bottom Right */}
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <span className="text-white text-xs font-medium">
                        {playlist.tracks?.length || 0} tracks
                      </span>
                    </div>
                  </div>

                  {/* Playlist Info */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-pink-400 via-red-400 to-orange-400 bg-clip-text text-transparent group-hover:from-pink-300 group-hover:to-red-300 transition-all truncate">
                      {playlist.name}
                    </h3>
                    <p className="text-gray-400 text-sm flex items-center gap-1.5">
                      <Music2 size={14} className="text-pink-400" />
                      Imported from YouTube
                    </p>
                  </div>

                  {/* Subtle Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-pink-500/0 via-pink-500/0 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Firestore Playlists Section */}
        {playlists.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">My Playlists</h2>
          </div>
        )}

        {loading ? (
          // Loading State
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
                <div className="w-full aspect-square bg-white/10 rounded-lg mb-4"></div>
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : playlists.length > 0 || mongoPlaylists.length > 0 ? (
          // Playlists Grid
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {playlists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all border border-white/10 hover:border-white/20"
              >
                {/* Playlist Cover */}
                <div className="relative mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-purple-600/20 to-indigo-600/20 aspect-square flex items-center justify-center">
                  <ListMusic size={64} className="text-purple-400" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => {
                        // Play all tracks in playlist when tracks are implemented
                        if (playlist.tracks && playlist.tracks.length > 0) {
                          playTrack(playlist.tracks[0], playlist.tracks);
                        }
                      }}
                      className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 hover:scale-110 transition-all shadow-lg"
                    >
                      <Play size={24} className="text-white ml-1" fill="white" />
                    </button>
                  </div>
                </div>

                {/* Playlist Info */}
                <h3 className="text-white font-semibold mb-1 truncate group-hover:text-purple-400 transition-colors">
                  {playlist.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {playlist.tracks?.length || 0} track{playlist.tracks?.length !== 1 ? 's' : ''}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    className="flex-1 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm flex items-center justify-center gap-1"
                    title="Edit playlist"
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => deletePlaylist(playlist.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete playlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
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
              <ListMusic size={48} className="text-gray-600" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              No playlists yet
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Create your first playlist to organize your favorite tracks
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-900/50"
            >
              <Plus size={20} />
              Create Your First Playlist
            </button>
          </motion.div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 rounded-2xl p-6 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Create New Playlist</h2>
            <form onSubmit={createPlaylist}>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                autoFocus
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newPlaylistName.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Playlists;
