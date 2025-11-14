// Get API base URL from environment variable
// Default to production if not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://v-music-gamma.vercel.app/api';

export const usersAPI = {
  // Sync user data with MongoDB after Firebase authentication
  async syncUser(userId, userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          provider: userData.providerData?.[0]?.providerId || 'email',
          googleAccessToken: userData.googleAccessToken || null,
          googleRefreshToken: userData.googleRefreshToken || null
        })
      });

      if (!response.ok) throw new Error('Failed to sync user');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error syncing user:', error);
      throw error;
    }
  },

  // Get user details from MongoDB
  async getUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...profileData
        })
      });

      if (!response.ok) throw new Error('Failed to update profile');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};

export const searchHistoryAPI = {
  // Get user's search history
  async getSearchHistory(userId, limit = 20) {
    try {
      const response = await fetch(`${API_BASE_URL}/search-history?userId=${userId}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch search history');
      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('Error fetching search history:', error);
      return [];
    }
  },

  // Add search query to history
  async addToHistory(userId, query, resultsCount = 0) {
    try {
      const response = await fetch(`${API_BASE_URL}/search-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          query,
          results: resultsCount
        })
      });

      if (!response.ok) throw new Error('Failed to add to search history');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding to search history:', error);
      throw error;
    }
  },

  // Clear search history
  async clearHistory(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/search-history`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId
        })
      });

      if (!response.ok) throw new Error('Failed to clear search history');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  }
};

export const playlistsAPI = {
  // Get user's playlists
  async getPlaylists(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/playlists?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch playlists');
      const data = await response.json();
      return data.playlists || [];
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }
  },

  // Create new playlist
  async createPlaylist(userId, name, tracks = [], source = 'vibetube') {
    try {
      const response = await fetch(`${API_BASE_URL}/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          name,
          tracks,
          source
        })
      });

      if (!response.ok) throw new Error('Failed to create playlist');
      const data = await response.json();
      return data.playlist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  },

  // Update playlist
  async updatePlaylist(playlistId, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/playlists`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistId,
          ...updates
        })
      });

      if (!response.ok) throw new Error('Failed to update playlist');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating playlist:', error);
      throw error;
    }
  },

  // Add track to playlist
  async addTrack(playlistId, track) {
    try {
      const response = await fetch(`${API_BASE_URL}/playlists`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistId,
          addTrack: track
        })
      });

      if (!response.ok) throw new Error('Failed to add track');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding track:', error);
      throw error;
    }
  },

  // Remove track from playlist
  async removeTrack(playlistId, trackId) {
    try {
      const response = await fetch(`${API_BASE_URL}/playlists`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistId,
          removeTrackId: trackId
        })
      });

      if (!response.ok) throw new Error('Failed to remove track');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing track:', error);
      throw error;
    }
  },

  // Delete playlist
  async deletePlaylist(playlistId) {
    try {
      const response = await fetch(`${API_BASE_URL}/playlists`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistId
        })
      });

      if (!response.ok) throw new Error('Failed to delete playlist');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  }
};
