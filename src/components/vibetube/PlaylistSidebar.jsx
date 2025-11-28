import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  List,
  Music2,
  FolderPlus,
  Check,
  X,
  Edit2,
  Trash2,
  Play,
  GripVertical,
  Heart,
  ExternalLink
} from 'lucide-react';

// Component: PlaylistManager
const PlaylistManager = ({
  playlists,
  onCreatePlaylist,
  onRenamePlaylist,
  onDeletePlaylist,
  currentPlaylistId,
  onSelectPlaylist,
}) => {
  const navigate = useNavigate();
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

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* View All Playlists */}
        <button
          onClick={() => navigate('/playlists')}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 rounded-xl border border-purple-400/30 hover:border-purple-400/50 transition-all group"
        >
          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <List size={20} className="text-purple-400" />
          </div>
          <span className="text-xs font-semibold text-purple-200">View All</span>
        </button>

        {/* Liked Songs */}
        <button
          onClick={() => navigate('/favorites')}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-red-600/20 to-pink-600/20 hover:from-red-600/30 hover:to-pink-600/30 rounded-xl border border-red-400/30 hover:border-red-400/50 transition-all group"
        >
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Heart size={20} className="text-red-400" />
          </div>
          <span className="text-xs font-semibold text-red-200">Liked Songs</span>
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

const PlaylistSidebar = ({
  playlists,
  onCreatePlaylist,
  onRenamePlaylist,
  onDeletePlaylist,
  currentPlaylistId,
  onSelectPlaylist,
  playlist,
  currentIndex,
  onPlay,
  onRemove,
  onReorder,
  showPlaylist,
  onTogglePlaylist
}) => {
  const currentPlaylist = playlists.find(p => p.id === currentPlaylistId) || playlists[0];

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Playlist Manager */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-6 border-2 border-white/20 shadow-2xl"
      >
        <PlaylistManager
          playlists={playlists}
          onCreatePlaylist={onCreatePlaylist}
          onRenamePlaylist={onRenamePlaylist}
          onDeletePlaylist={onDeletePlaylist}
          currentPlaylistId={currentPlaylistId}
          onSelectPlaylist={onSelectPlaylist}
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
            onClick={onTogglePlaylist}
            className="lg:hidden p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
          >
            {showPlaylist ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
        <div className={`${showPlaylist ? 'block' : 'hidden'} lg:block`}>
          <Playlist
            playlist={playlist}
            currentIndex={currentIndex}
            onPlay={onPlay}
            onRemove={onRemove}
            onReorder={onReorder}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default PlaylistSidebar;
