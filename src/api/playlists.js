/**
 * Playlists API Client
 * 
 * Manages user playlists in MongoDB database
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://v-music-gamma.vercel.app/api';

export const playlistsAPI = {
  /**
   * Get all playlists for a user
   * @param {string} userId - Firebase user ID
   * @returns {Promise<Object>} { playlists: [] }
   */
  async getUserPlaylists(userId) {
    try {
      const response = await fetch(`${BASE_URL}/playlists?userId=${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      throw error;
    }
  },

  /**
   * Create a new playlist
   * @param {string} userId - Firebase user ID
   * @param {string} name - Playlist name
   * @param {Array} tracks - Array of track objects
   * @param {string} source - Source of playlist (youtube, spotify, jamendo)
   * @returns {Promise<Object>}
   */
  async createPlaylist(userId, name, tracks = [], source = 'youtube') {
    try {
      const response = await fetch(`${BASE_URL}/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, tracks, source })
      });

      if (!response.ok) {
        throw new Error('Failed to create playlist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  },

  /**
   * Update playlist (add/remove tracks, rename)
   * @param {string} playlistId - Playlist ID
   * @param {Object} updates - Updates object
   * @returns {Promise<Object>}
   */
  async updatePlaylist(playlistId, updates) {
    try {
      const response = await fetch(`${BASE_URL}/playlists`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, ...updates })
      });

      if (!response.ok) {
        throw new Error('Failed to update playlist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating playlist:', error);
      throw error;
    }
  },

  /**
   * Add a track to playlist
   * @param {string} playlistId - Playlist ID
   * @param {Object} track - Track object
   * @returns {Promise<Object>}
   */
  async addTrackToPlaylist(playlistId, track) {
    try {
      const response = await fetch(`${BASE_URL}/playlists`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, addTrack: track })
      });

      if (!response.ok) {
        throw new Error('Failed to add track');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      throw error;
    }
  },

  /**
   * Delete a playlist
   * @param {string} playlistId - Playlist ID
   * @returns {Promise<Object>}
   */
  async deletePlaylist(playlistId) {
    try {
      const response = await fetch(`${BASE_URL}/playlists`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Delete API error:', error);
        throw new Error(error.error || 'Failed to delete playlist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  }
};

export default playlistsAPI;
