import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Music2,
  Heart,
  ListMusic,
  Play,
  Clock,
  Sparkles,
  Youtube,
  Download,
  ArrowRight,
  PlayCircle,
  Search,
  Radio,
  TrendingUp,
  ChevronRight,
  Zap,
  Music,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { useEffect, useState } from 'react';
import jamendoAPI from '../api/jamendo';
import { playlistsAPI } from '../api/playlists';
import { favoritesAPI } from '../api/favorites';

const Dashboard = () => {
  const { currentUser, googleAccessToken } = useAuth();
  const { playTrack } = usePlayer();
  const navigate = useNavigate();
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real stats from database
  const [stats, setStats] = useState({
    playlists: 0,
    favorites: 0,
    totalTracks: 0,
    ytPlaylists: 0,
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch real user stats
        if (currentUser) {
          const [playlistsData, favoritesData] = await Promise.all([
            playlistsAPI.getUserPlaylists(currentUser.uid).catch(() => ({ playlists: [] })),
            favoritesAPI.getFavorites(currentUser.uid).catch(() => ({ favorites: [] })),
          ]);

          const playlists = playlistsData.playlists || [];
          const favorites = favoritesData.favorites || [];
          const ytPlaylists = playlists.filter((p) => p.source === 'youtube').length;
          const totalTracks = playlists.reduce((sum, p) => sum + (p.tracks?.length || 0), 0);

          setStats({
            playlists: playlists.length,
            favorites: favorites.length,
            totalTracks: totalTracks,
            ytPlaylists: ytPlaylists,
          });
        }

        // Fetch trending tracks
        const trendingData = await jamendoAPI.getTrendingTracks(6);
        setTrendingTracks(trendingData.results || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-indigo-900/40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            {/* User Avatar */}
            {currentUser?.photoURL ? (
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="w-20 h-20 rounded-full border-4 border-purple-500/50 shadow-xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-4 border-purple-500/50 shadow-xl">
                <span className="text-3xl font-bold text-white">
                  {currentUser?.displayName?.charAt(0) || 'U'}
                </span>
              </div>
            )}

            {/* Greeting */}
            <div>
              <h1 className="text-4xl font-black text-white mb-1">
                Welcome back, {currentUser?.displayName?.split(' ')[0] || 'Music Lover'}!
              </h1>
              <p className="text-gray-300 text-lg flex items-center gap-2">
                <Music2 size={20} className="text-purple-400" />
                Ready to discover amazing music?
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* 🌟 HERO FEATURE: YouTube Playlist Import */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-red-600/20 via-pink-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl border-2 border-red-500/30 shadow-2xl">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>

            <div className="relative p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                {/* Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/30 backdrop-blur-sm border border-red-400/50 rounded-full"
                >
                  <Sparkles className="text-yellow-300" size={18} />
                  <span className="text-white font-bold text-sm uppercase">New Feature</span>
                </motion.div>

                {/* Title */}
                <div>
                  <h2 className="text-5xl font-black text-white mb-3">
                    Import Your YouTube Playlists
                  </h2>
                  <div className="flex items-center gap-3 text-red-400">
                    <Youtube size={32} />
                    <span className="text-2xl font-bold">Powered by VibeTube</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-200 text-lg leading-relaxed">
                  Connect with Google and instantly import all your YouTube playlists. Play them
                  seamlessly right here in VMusic - no switching apps needed!
                </p>

                {/* Features */}
                <div className="space-y-3">
                  {[
                    { icon: Download, text: 'Import all YouTube playlists instantly' },
                    { icon: PlayCircle, text: 'Play music videos directly' },
                    { icon: ListMusic, text: 'Organize and manage your collections' },
                  ].map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-red-500/30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <feature.icon size={20} className="text-red-300" />
                      </div>
                      <span className="text-white font-medium">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  onClick={() => navigate('/vibetube')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold text-lg rounded-xl shadow-xl flex items-center justify-center gap-3 group"
                >
                  <Youtube size={24} />
                  <span>Open VibeTube</span>
                  <ArrowRight
                    className="group-hover:translate-x-2 transition-transform"
                    size={20}
                  />
                </motion.button>

                {/* Connection Status */}
                {googleAccessToken ? (
                  <div className="flex items-center gap-2 px-4 py-3 bg-green-500/20 border border-green-400/40 rounded-xl">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-200 font-semibold">YouTube Connected</span>
                    <span className="ml-auto text-green-300 font-bold">
                      {stats.ytPlaylists} playlists imported
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-3 bg-yellow-500/20 border border-yellow-400/40 rounded-xl">
                    <Sparkles className="text-yellow-300" size={18} />
                    <span className="text-yellow-200 font-semibold">
                      Connect in VibeTube to import
                    </span>
                  </div>
                )}
              </div>

              {/* Right Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border-2 border-white/10 p-6 shadow-2xl">
                  {/* Preview Header */}
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                      <Youtube className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">VibeTube</h3>
                      <p className="text-gray-400 text-sm">Your YouTube Music Hub</p>
                    </div>
                  </div>

                  {/* Preview Playlists */}
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer"
                      >
                        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Music size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="h-4 bg-white/20 rounded-full w-3/4 mb-2"></div>
                          <div className="h-3 bg-white/10 rounded-full w-1/2"></div>
                        </div>
                        <Play size={20} className="text-gray-400 group-hover:text-pink-400" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Floating Badge */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-4 py-2 shadow-xl border-2 border-white/20"
                >
                  <span className="text-white font-bold text-sm">{stats.ytPlaylists} Imported</span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              label: 'Total Playlists',
              value: stats.playlists,
              icon: ListMusic,
              color: 'from-purple-500 to-indigo-500',
              link: '/playlists',
            },
            {
              label: 'Favorite Tracks',
              value: stats.favorites,
              icon: Heart,
              color: 'from-pink-500 to-rose-500',
              link: '/favorites',
            },
            {
              label: 'Total Tracks',
              value: stats.totalTracks,
              icon: Music2,
              color: 'from-blue-500 to-cyan-500',
              link: '/playlists',
            },
            {
              label: 'YouTube Playlists',
              value: stats.ytPlaylists,
              icon: Youtube,
              color: 'from-red-500 to-pink-500',
              link: '/vibetube',
            },
          ].map((stat, idx) => (
            <motion.button
              key={stat.label}
              onClick={() => navigate(stat.link)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <stat.icon size={24} className="text-white" />
                </div>
                <ChevronRight
                  size={20}
                  className="text-gray-600 group-hover:text-white transition-colors"
                />
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-4xl font-black text-white">{stat.value}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-yellow-400" size={28} />
            <h2 className="text-3xl font-black text-white">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.button
              onClick={() => navigate('/explore')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-2xl transition-all shadow-xl group"
            >
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Search size={28} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-lg">Explore Music</h3>
                <p className="text-green-100 text-sm">Discover trending tracks</p>
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/vibezone')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 p-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl transition-all shadow-xl group"
            >
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Radio size={28} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-lg">VibeZone Radio</h3>
                <p className="text-purple-100 text-sm">Mood-based stations</p>
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/playlists')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-2xl transition-all shadow-xl group"
            >
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ListMusic size={28} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-lg">My Playlists</h3>
                <p className="text-blue-100 text-sm">Manage collections</p>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Trending Tracks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-orange-400" size={28} />
              <h2 className="text-3xl font-black text-white">Trending Now</h2>
            </div>
            <motion.button
              onClick={() => navigate('/explore')}
              whileHover={{ x: 5 }}
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-2"
            >
              View All <ChevronRight size={20} />
            </motion.button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-2xl p-5 animate-pulse border border-white/10"
                >
                  <div className="w-full aspect-square bg-white/10 rounded-xl mb-4"></div>
                  <div className="h-5 bg-white/10 rounded-full w-3/4 mb-2"></div>
                  <div className="h-4 bg-white/10 rounded-full w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:border-white/30 cursor-pointer transition-all"
                  onClick={() => navigate(`/track/${track.id}`)}
                >
                  {/* Album Art */}
                  <div className="relative mb-4 overflow-hidden rounded-xl">
                    <motion.img
                      src={track.image || 'https://via.placeholder.com/300'}
                      alt={track.name}
                      className="w-full aspect-square object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(track, trendingTracks);
                        }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-xl"
                      >
                        <Play size={24} className="text-white ml-1" fill="white" />
                      </motion.button>
                    </div>
                    <div className="absolute top-3 left-3 bg-orange-500 rounded-full px-3 py-1 text-xs font-bold text-white">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Track Info */}
                  <h3 className="text-white font-bold text-lg truncate mb-1">{track.name}</h3>
                  <p className="text-gray-400 text-sm truncate mb-3">{track.artist_name}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {jamendoAPI.formatDuration(track.duration)}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-400 hover:text-pink-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Heart size={18} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && trendingTracks.length === 0 && (
            <div className="text-center py-12 bg-white/5 rounded-2xl">
              <Music2 size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No trending tracks available right now.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
