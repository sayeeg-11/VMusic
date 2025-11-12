import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Users, Music2, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as jamendoAPI from '../api/jamendo';

const ArtistsByLocation = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Popular countries for quick selection
  const popularCountries = [
    { code: 'USA', name: 'United States', flag: '🇺🇸' },
    { code: 'GBR', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'FRA', name: 'France', flag: '🇫🇷' },
    { code: 'DEU', name: 'Germany', flag: '🇩🇪' },
    { code: 'ITA', name: 'Italy', flag: '🇮🇹' },
    { code: 'ESP', name: 'Spain', flag: '🇪🇸' },
    { code: 'CAN', name: 'Canada', flag: '🇨🇦' },
    { code: 'AUS', name: 'Australia', flag: '🇦🇺' },
    { code: 'BRA', name: 'Brazil', flag: '🇧🇷' },
    { code: 'JPN', name: 'Japan', flag: '🇯🇵' },
    { code: 'KOR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'IND', name: 'India', flag: '🇮🇳' },
  ];

  useEffect(() => {
    if (selectedCountry) {
      searchArtistsByLocation();
    }
  }, [selectedCountry]);

  const searchArtistsByLocation = async () => {
    setLoading(true);
    try {
      const data = await jamendoAPI.getArtistsByLocation({
        country: selectedCountry,
        city: selectedCity,
        limit: 50,
      });
      setArtists(data.results || []);
    } catch (error) {
      console.error('Error searching artists by location:', error);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = (countryCode) => {
    setSelectedCountry(countryCode);
    setSelectedCity('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedCountry || selectedCity) {
      searchArtistsByLocation();
    }
  };

  const clearFilters = () => {
    setSelectedCountry('');
    setSelectedCity('');
    setArtists([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-900/40 via-teal-900/40 to-cyan-900/40 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                <MapPin size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Artists by Location
                </h1>
                <p className="text-gray-300 text-lg">
                  Discover talented artists from around the world
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City Input */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  City
                </label>
                <input
                  type="text"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  placeholder="e.g., Milan, London, New York"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || (!selectedCountry && !selectedCity)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Search size={20} />
                  {loading ? 'Searching...' : 'Search Artists'}
                </button>
              </div>
            </div>

            {(selectedCountry || selectedCity) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Clear filters
              </button>
            )}
          </form>
        </motion.div>

        {/* Popular Countries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Globe size={24} className="text-green-500" />
            Popular Countries
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {popularCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleCountrySelect(country.code)}
                className={`p-4 rounded-xl border transition-all ${
                  selectedCountry === country.code
                    ? 'bg-green-600/20 border-green-500 shadow-lg shadow-green-500/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-3xl mb-2">{country.flag}</div>
                <p className="text-white text-sm font-medium">{country.name}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Searching for artists...</p>
          </div>
        ) : artists.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users size={24} className="text-green-500" />
                Found {artists.length} Artists
                {selectedCountry && (
                  <span className="text-gray-400 text-lg">
                    {' '}in {popularCountries.find(c => c.code === selectedCountry)?.name || selectedCountry}
                    {selectedCity && `, ${selectedCity}`}
                  </span>
                )}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {artists.map((artist) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="group bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all cursor-pointer border border-white/10 hover:border-white/20"
                  onClick={() => navigate(`/artist/${artist.id}`)}
                >
                  {/* Artist Image */}
                  <div className="relative mb-3">
                    <div className="aspect-square rounded-full overflow-hidden bg-gradient-to-br from-green-600 to-teal-600">
                      {artist.image ? (
                        <img
                          src={artist.image}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users size={48} className="text-white/50" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Artist Name */}
                  <h3 className="text-white font-semibold mb-1 truncate group-hover:text-green-400 transition-colors">
                    {artist.name}
                  </h3>

                  {/* Location */}
                  {artist.locations && artist.locations.length > 0 && (
                    <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
                      <MapPin size={12} />
                      <span className="truncate">
                        {artist.locations[0].city}, {artist.locations[0].country}
                      </span>
                    </div>
                  )}

                  {/* Join Date */}
                  <p className="text-gray-500 text-xs">
                    Joined {new Date(artist.joindate).getFullYear()}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : selectedCountry || selectedCity ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-gray-400" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">No Artists Found</h3>
            <p className="text-gray-400">Try selecting a different country or city</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe size={32} className="text-gray-400" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Explore Artists Worldwide</h3>
            <p className="text-gray-400">Select a country above to discover artists from around the world</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistsByLocation;
