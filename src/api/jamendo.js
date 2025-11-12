const BASE_URL = 'https://api.jamendo.com/v3.0';
const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID || '83bfb626';

/**
 * Jamendo API Service
 * Handles all API calls to Jamendo music platform
 */
export const jamendoAPI = {
  /**
   * Get trending/popular tracks
   * @param {number} limit - Number of tracks to fetch
   * @returns {Promise<Object>} API response with tracks
   */
  getTrendingTracks: async (limit = 20) => {
    try {
      const response = await fetch(
        `${BASE_URL}/tracks/?client_id=${CLIENT_ID}&format=json&limit=${limit}&order=popularity_total&audioformat=mp32`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching trending tracks:', error);
      return { headers: { status: 'error' }, results: [] };
    }
  },

  /**
   * Get new release tracks
   * @param {number} limit - Number of tracks to fetch
   * @returns {Promise<Object>} API response with tracks
   */
  getNewReleases: async (limit = 20) => {
    try {
      const response = await fetch(
        `${BASE_URL}/tracks/?client_id=${CLIENT_ID}&format=json&limit=${limit}&order=releasedate_desc&audioformat=mp32`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching new releases:', error);
      return { headers: { status: 'error' }, results: [] };
    }
  },

  /**
   * Search tracks by query
   * @param {string} query - Search term
   * @param {number} limit - Number of results
   * @returns {Promise<Object>} API response with tracks
   */
  searchTracks: async (query, limit = 20) => {
    try {
      const response = await fetch(
        `${BASE_URL}/tracks/?client_id=${CLIENT_ID}&format=json&search=${encodeURIComponent(query)}&limit=${limit}&audioformat=mp32`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching tracks:', error);
      return { headers: { status: 'error' }, results: [] };
    }
  },

  /**
   * Get tracks by genre/tags
   * @param {string} tag - Genre tag (rock, pop, jazz, etc.)
   * @param {number} limit - Number of tracks
   * @returns {Promise<Object>} API response with tracks
   */
  getTracksByTag: async (tag, limit = 20) => {
    try {
      const response = await fetch(
        `${BASE_URL}/tracks/?client_id=${CLIENT_ID}&format=json&tags=${tag}&limit=${limit}&audioformat=mp32`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tracks by tag:', error);
      return { headers: { status: 'error' }, results: [] };
    }
  },

  /**
   * Get track by ID
   * @param {string} trackId - Track ID
   * @returns {Promise<Object>} API response with track data
   */
  getTrackById: async (trackId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/tracks/?client_id=${CLIENT_ID}&format=json&id=${trackId}&audioformat=mp32`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching track:', error);
      return { headers: { status: 'error' }, results: [] };
    }
  },

  /**
   * Get artist information
   * @param {string} artistId - Artist ID
   * @returns {Promise<Object>} API response with artist data
   */
  getArtist: async (artistId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/artists/?client_id=${CLIENT_ID}&format=json&id=${artistId}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching artist:', error);
      return { headers: { status: 'error' }, results: [] };
    }
  },

  /**
   * Get multiple artists with filters
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of artists to fetch
   * @param {string} options.order - Sort order
   * @param {boolean} options.hasImage - Filter artists with images
   * @returns {Promise<Object>} API response with artists
   */
  getArtists: async ({ limit = 50, order = 'popularity_total', hasImage } = {}) => {
    try {
      let url = `${BASE_URL}/artists/?client_id=${CLIENT_ID}&format=json&limit=${limit}&order=${order}`;
      
      if (hasImage) {
        url += '&hasimage=true';
      }

      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching artists:', error);
      return { headers: { status: 'error' }, results: [] };
    }
  },

  /**
   * Search artists by name
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {number} options.limit - Number of results
   * @param {string} options.order - Sort order
   * @returns {Promise<Object>} API response with artists
   */
  searchArtists: async ({ query, limit = 50, order = 'popularity_total' } = {}) => {
    try {
      const response = await fetch(
        `${BASE_URL}/artists/?client_id=${CLIENT_ID}&format=json&namesearch=${encodeURIComponent(query)}&limit=${limit}&order=${order}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching artists:', error);
      return { headers: { status: 'error' }, results: [] };
    }
  },

  /**
   * Get tracks by artist
   * @param {string} artistId - Artist ID
   * @param {number} limit - Number of tracks
   * @returns {Promise<Object>} API response with tracks
   */
  getArtistTracks: async (artistId, limit = 20) => {
    try {
      const response = await fetch(
        `${BASE_URL}/tracks/?client_id=${CLIENT_ID}&format=json&artist_id=${artistId}&limit=${limit}&audioformat=mp32`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching artist tracks:', error);
      return { headers: { status: 'error' }, results: [] };
    }
  },

  /**
   * Get album information
   * @param {string} albumId - Album ID
   * @returns {Promise<Object>} API response with album data
   */
  getAlbum: async (albumId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/albums/?client_id=${CLIENT_ID}&format=json&id=${albumId}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching album:', error);
      return { headers: { status: 'error' }, results: [] };
    }
  },

  /**
   * Get available radios (mood/genre based)
   * @returns {Promise<Object>} API response with radio stations
   */
  getRadios: async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/radios/?client_id=${CLIENT_ID}&format=json`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching radios:', error);
      return { headers: { status: 'error' }, results: [] };
    }
  },

  /**
   * Get tracks from a specific radio
   * @param {string} radioId - Radio station ID
   * @param {number} limit - Number of tracks
   * @returns {Promise<Object>} API response with tracks
   */
  getRadioTracks: async (radioId, limit = 20) => {
    try {
      const response = await fetch(
        `${BASE_URL}/tracks/?client_id=${CLIENT_ID}&format=json&fuzzytags=${radioId}&limit=${limit}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching radio tracks:', error);
      return { headers: { status: 'error' }, results: [] };
    }
  },

  /**
   * Get playlists
   * @param {number} limit - Number of playlists
   * @returns {Promise<Object>} API response with playlists
   */
  getPlaylists: async (limit = 20) => {
    try {
      const response = await fetch(
        `${BASE_URL}/playlists/?client_id=${CLIENT_ID}&format=json&limit=${limit}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return { headers: { status: 'error' }, results: [] };
    }
  },

  /**
   * Get artists by location
   * @param {Object} options - Search options
   * @param {string} options.country - Country code (ISO 3166-1)
   * @param {string} options.city - City name
   * @param {number} options.limit - Number of results
   * @returns {Promise<Object>} API response with artists
   */
  getArtistsByLocation: async ({ country, city, limit = 50 }) => {
    try {
      let url = `${BASE_URL}/artists/locations/?client_id=${CLIENT_ID}&format=json&limit=${limit}&haslocation=true`;
      
      if (country) {
        url += `&location_country=${country}`;
      }
      
      if (city) {
        url += `&location_city=${encodeURIComponent(city)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching artists by location:', error);
      return { headers: { status: 'error' }, results: [] };
    }
  },

  /**
   * Format duration from seconds to MM:SS
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  formatDuration: (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },
};

export default jamendoAPI;
