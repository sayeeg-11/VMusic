import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music2, Play, Calendar, Disc3 } from 'lucide-react';
import jamendoAPI from '../api/jamendo';
import { usePlayer } from '../contexts/PlayerContext';

const Albums = () => {
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('popular');
  const [limit, setLimit] = useState(24);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const categories = [
    { id: 'popular', label: 'Popular' },
    { id: 'new', label: 'New Releases' },
    { id: 'featured', label: 'Featured' },
  ];

  useEffect(() => {
    setLimit(24);
    setHasMore(true);
    fetchAlbums();
  }, [activeCategory]);

  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore || loading) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight - 500) {
        loadMoreAlbums();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, loading, limit, activeCategory]);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      let data;
      if (activeCategory === 'popular') {
        data = await jamendoAPI.getPopularAlbums(limit);
      } else if (activeCategory === 'new') {
        data = await jamendoAPI.getNewAlbums(limit);
      } else {
        data = await jamendoAPI.getPopularAlbums(limit);
      }

      const uniqueAlbums = Array.from(
        new Map((data.results || []).map((album) => [album.id, album])).values()
      );
      setAlbums(uniqueAlbums);
      setHasMore(uniqueAlbums.length >= limit);
    } catch (error) {
      console.error('Error fetching albums:', error);
      setAlbums([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreAlbums = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const newLimit = limit + 24;

    try {
      let data;
      if (activeCategory === 'popular') {
        data = await jamendoAPI.getPopularAlbums(newLimit);
      } else if (activeCategory === 'new') {
        data = await jamendoAPI.getNewAlbums(newLimit);
      } else {
        data = await jamendoAPI.getPopularAlbums(newLimit);
      }

      const uniqueAlbums = Array.from(
        new Map((data.results || []).map((album) => [album.id, album])).values()
      );
      setAlbums(uniqueAlbums);
      setLimit(newLimit);
      setHasMore(uniqueAlbums.length >= newLimit);
    } catch (error) {
      console.error('Error loading more albums:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="bg-gray-800/50 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-700"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-700 rounded mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl">
                <Disc3 size={48} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Discover Albums
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Explore curated albums from talented artists around the world
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3 mb-8 justify-center"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Albums Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {[...Array(24)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : albums.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6"
            >
              {albums.map((album, index) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/album/${album.id}`)}
                  className="group bg-gray-800/50 rounded-xl overflow-hidden hover:bg-gray-800 transition-all cursor-pointer border border-gray-700 hover:border-purple-500/50 hover:-translate-y-2 duration-300"
                >
                  {/* Album Cover */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={album.image || 'https://via.placeholder.com/300'}
                      alt={album.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-xl hover:bg-purple-700 hover:scale-110 transition-all">
                        <Play size={24} fill="white" className="text-white ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Album Info */}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-white text-sm sm:text-base truncate mb-1 group-hover:text-purple-400 transition-colors">
                      {album.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 truncate mb-2">
                      {album.artist_name}
                    </p>
                    {album.releasedate && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>{new Date(album.releasedate).getFullYear()}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 mt-2">Loading more albums...</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Music2 size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No albums found</h3>
            <p className="text-gray-400">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Albums;
