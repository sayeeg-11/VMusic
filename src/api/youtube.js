/**
 * YouTube API Client
 * 
 * Frontend client for fetching YouTube playlists and playlist items
 * using user's Google OAuth access token.
 */

// Get API base URL from environment variable
// Default to production if not set
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://v-music-gamma.vercel.app/api';

/**
 * YouTube API Client
 */
export const youtubeAPI = {
  /**
   * Fetch user's YouTube playlists
   * @param {string} userId - Firebase user ID
   * @param {string} accessToken - Google OAuth access token
   * @returns {Promise<Object>} { playlists: [], total: number }
   */
  async getUserPlaylists(userId, accessToken) {
    if (!userId || !accessToken) {
      throw new Error('userId and accessToken are required');
    }

    try {
      const url = new URL(`${BASE_URL}/youtube-playlists`);
      url.searchParams.append('userId', userId);
      url.searchParams.append('accessToken', accessToken);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch playlists');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching YouTube playlists:', error);
      throw error;
    }
  },

  /**
   * Fetch items from a specific playlist
   * @param {string} userId - Firebase user ID
   * @param {string} playlistId - YouTube playlist ID
   * @param {string} accessToken - Google OAuth access token
   * @returns {Promise<Object>} { playlistId: string, items: [], total: number }
   */
  async getPlaylistItems(userId, playlistId, accessToken) {
    if (!userId || !playlistId || !accessToken) {
      throw new Error('userId, playlistId, and accessToken are required');
    }

    try {
      const url = new URL(`${BASE_URL}/youtube-playlists`);
      url.searchParams.append('userId', userId);
      url.searchParams.append('playlistId', playlistId);
      url.searchParams.append('accessToken', accessToken);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch playlist items');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching playlist items:', error);
      throw error;
    }
  },

  /**
   * Check if access token is valid
   * @param {string} accessToken - Google OAuth access token
   * @returns {Promise<boolean>}
   */
  async validateAccessToken(accessToken) {
    if (!accessToken) return false;

    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
      );
      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
};

export default youtubeAPI;
