// Get API base URL from environment variable
// Default to production if not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://v-music-gamma.vercel.app/api';

export const favoritesAPI = {
  // Get user's favorites
  async getFavorites(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch favorites');
      const data = await response.json();
      return data.favorites || [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  },

  // Add track to favorites
  async addToFavorites(userId, track) {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          track: {
            videoId: track.videoId,
            title: track.title,
            channelTitle: track.channelTitle,
            thumbnail: track.thumbnail,
            duration: track.duration
          }
        })
      });

      if (!response.ok) throw new Error('Failed to add to favorites');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  },

  // Remove track from favorites
  async removeFromFavorites(userId, videoId) {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          videoId
        })
      });

      if (!response.ok) throw new Error('Failed to remove from favorites');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  },

  // Check if track is in favorites
  async isInFavorites(userId, videoId) {
    try {
      const favorites = await this.getFavorites(userId);
      return favorites.some(track => track.videoId === videoId);
    } catch (error) {
      console.error('Error checking favorites:', error);
      return false;
    }
  }
};
