import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Music2, TrendingUp, Calendar, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as jamendoAPI from '../api/jamendo';

const Artists = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity_total');
  const [hasImage, setHasImage] = useState(false);
  const [limit, setLimit] = useState(50);

  const sortOptions = [
    { value: 'popularity_total', label: 'Most Popular' },
    { value: 'popularity_month', label: 'Popular This Month' },
    { value: 'popularity_week', label: 'Popular This Week' },
    { value: 'joindate_desc', label: 'Newest First' },
    { value: 'joindate_asc', label: 'Oldest First' },
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
  ];

  useEffect(() => {
    fetchArtists();
  }, [sortBy, hasImage]);

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const data = await jamendoAPI.getArtists({
        limit,
        order: sortBy,
        hasImage: hasImage || undefined,
      });
      setArtists(data.results || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchArtists();
      return;
    }

    setLoading(true);
    try {
      const data = await jamendoAPI.searchArtists({
        query: searchQuery,
        limit,
        order: sortBy,
      });
      setArtists(data.results || []);
    } catch (error) {
      console.error('Error searching artists:', error);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchArtists();
  };

  const loadMore = () => {
    setLimit(prev => prev + 50);
  };

  useEffect(() => {
    if (limit > 50) {
      fetchArtists();
    }
  }, [limit]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Users size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Discover Artists
                </h1>
                <p className="text-gray-300 text-lg">
                  Explore talented musicians from around the world
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search artists by name..."
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </form>

              {/* Sort Dropdown */}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-gray-900">
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Filter Toggle */}
                <button
                  onClick={() => setHasImage(!hasImage)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    hasImage
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                  title="Show only artists with images"
                >
                  <Filter size={20} />
                  <span className="hidden sm:inline">With Image</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Count */}
        {!loading && artists.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-400">
              Showing <span className="text-white font-semibold">{artists.length}</span> artists
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading artists...</p>
          </div>
        ) : artists.length > 0 ? (
          <>
            {/* Artists Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {artists.map((artist, index) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ scale: 1.05 }}
                  className="group bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all cursor-pointer border border-white/10 hover:border-white/20"
                  onClick={() => navigate(`/artist/${artist.id}`)}
                >
                  {/* Artist Image */}
                  <div className="relative mb-3">
                    <div className="aspect-square rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600">
                      {artist.image ? (
                        <img
                          src={artist.image}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users size={48} className="text-white/50" />
                        </div>
                      )}
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Music2 size={32} className="text-white" />
                    </div>
                  </div>

                  {/* Artist Name */}
                  <h3 className="text-white font-semibold mb-1 truncate group-hover:text-purple-400 transition-colors text-center">
                    {artist.name}
                  </h3>

                  {/* Join Date */}
                  <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                    <Calendar size={12} />
                    <span>Joined {new Date(artist.joindate).getFullYear()}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Load More Button */}
            {artists.length >= limit && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  Load More Artists
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-gray-400" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">No Artists Found</h3>
            <p className="text-gray-400">
              {searchQuery ? 'Try a different search term' : 'Unable to load artists'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Artists;
