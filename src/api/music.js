/**
 * Unified Music API
 * Combines Jamendo (free, full tracks) and Spotify (previews) APIs
 * Automatically switches between sources based on user authentication
 */

import { jamendoAPI } from './jamendo';
import { spotifyAPI } from './spotify';

class MusicAPI {
  constructor() {
    this.useSpotify = false; // Default to Jamendo for guest users
    this.spotifyEnabled = false;
  }

  /**
   * Initialize Spotify for guest users (preview mode)
   * With Implicit Grant Flow, Spotify requires user login
   */
  async initializeGuestSpotify() {
    try {
      // Check if user is already authenticated with Spotify
      if (spotifyAPI.isTokenValid()) {
        this.spotifyEnabled = true;
        return true;
      }
      // Spotify requires user authentication with Implicit Grant Flow
      // No guest access available - use Jamendo instead
      this.spotifyEnabled = false;
      return false;
    } catch (error) {
      console.error('Failed to initialize Spotify:', error);
      this.spotifyEnabled = false;
      return false;
    }
  }

  /**
   * Enable Spotify mode (for authenticated users)
   */
  enableSpotify() {
    this.useSpotify = true;
    this.spotifyEnabled = true;
  }

  /**
   * Disable Spotify mode (fallback to Jamendo)
   */
  disableSpotify() {
    this.useSpotify = false;
  }

  /**
   * Check if Spotify is available
   */
  isSpotifyEnabled() {
    return this.spotifyEnabled;
  }

  /**
   * Get trending/popular tracks
   */
  async getTrendingTracks(limit = 20) {
    if (this.useSpotify && this.spotifyEnabled) {
      // Get featured playlists and extract tracks
      const playlists = await spotifyAPI.getFeaturedPlaylists(5);
      if (playlists.items.length > 0) {
        const tracks = await spotifyAPI.getPlaylistTracks(playlists.items[0].id, limit);
        return { 
          results: tracks.items, 
          source: 'spotify',
          message: 'Spotify Previews (30s)' 
        };
      }
    }
    
    // Fallback to Jamendo
    const data = await jamendoAPI.getTrendingTracks(limit);
    return { 
      results: data.results || [], 
      source: 'jamendo',
      message: 'Full Tracks' 
    };
  }

  /**
   * Get new releases
   */
  async getNewReleases(limit = 20) {
    if (this.useSpotify && this.spotifyEnabled) {
      const data = await spotifyAPI.getNewReleases(limit);
      return { 
        results: data.items, 
        source: 'spotify',
        message: 'Spotify Previews (30s)' 
      };
    }
    
    const data = await jamendoAPI.getNewReleases(limit);
    return { 
      results: data.results || [], 
      source: 'jamendo',
      message: 'Full Tracks' 
    };
  }

  /**
   * Search tracks
   */
  async searchTracks(query, limit = 20) {
    if (this.useSpotify && this.spotifyEnabled) {
      const data = await spotifyAPI.searchTracks(query, limit);
      return { 
        results: data.items, 
        source: 'spotify',
        message: 'Spotify Previews (30s)' 
      };
    }
    
    const data = await jamendoAPI.searchTracks(query, limit);
    return { 
      results: data.results || [], 
      source: 'jamendo',
      message: 'Full Tracks' 
    };
  }

  /**
   * Get track by ID
   */
  async getTrackById(trackId, source = 'jamendo') {
    if (source === 'spotify' && this.spotifyEnabled) {
      const track = await spotifyAPI.getTrack(trackId);
      return { 
        results: track ? [track] : [], 
        source: 'spotify' 
      };
    }
    
    return await jamendoAPI.getTrackById(trackId);
  }

  /**
   * Get tracks by tag/genre
   */
  async getTracksByTag(tag, limit = 20) {
    // Only Jamendo supports tags
    const data = await jamendoAPI.getTracksByTag(tag, limit);
    return { 
      results: data.results || [], 
      source: 'jamendo',
      message: 'Full Tracks' 
    };
  }

  /**
   * Get artist information
   */
  async getArtist(artistId, source = 'jamendo') {
    if (source === 'spotify' && this.spotifyEnabled) {
      return await spotifyAPI.getArtist(artistId);
    }
    
    return await jamendoAPI.getArtist(artistId);
  }

  /**
   * Get artist tracks
   */
  async getArtistTracks(artistId, source = 'jamendo', limit = 20) {
    if (source === 'spotify' && this.spotifyEnabled) {
      const data = await spotifyAPI.getArtistTopTracks(artistId);
      return { 
        results: data.items, 
        source: 'spotify' 
      };
    }
    
    const data = await jamendoAPI.getArtistTracks(artistId, limit);
    return { 
      results: data.results || [], 
      source: 'jamendo' 
    };
  }

  /**
   * Get recommendations (Spotify only)
   */
  async getRecommendations(seedTracks = [], seedArtists = [], limit = 20) {
    if (this.spotifyEnabled) {
      const data = await spotifyAPI.getRecommendations(seedTracks, seedArtists, limit);
      return { 
        results: data.items, 
        source: 'spotify',
        message: 'Personalized Recommendations' 
      };
    }
    
    // Fallback to Jamendo trending
    return this.getTrendingTracks(limit);
  }

  /**
   * Get user's saved tracks (Spotify authenticated users only)
   */
  async getSavedTracks(limit = 20, offset = 0) {
    if (spotifyAPI.isUserAuthenticated()) {
      const data = await spotifyAPI.getSavedTracks(limit, offset);
      return { 
        results: data.items, 
        source: 'spotify' 
      };
    }
    
    return { results: [], source: 'none', message: 'Login with Spotify to access your library' };
  }

  /**
   * Get user's top tracks (Spotify authenticated users only)
   */
  async getUserTopTracks(timeRange = 'medium_term', limit = 20) {
    if (spotifyAPI.isUserAuthenticated()) {
      const data = await spotifyAPI.getUserTopTracks(timeRange, limit);
      return { 
        results: data.items, 
        source: 'spotify' 
      };
    }
    
    return { results: [], source: 'none', message: 'Login with Spotify to see your top tracks' };
  }

  /**
   * Get both Jamendo and Spotify tracks combined
   */
  async getCombinedTracks(type = 'trending', limit = 20) {
    const halfLimit = Math.floor(limit / 2);
    
    let jamendoTracks = [];
    let spotifyTracks = [];

    // Get Jamendo tracks
    try {
      const jamendoData = type === 'trending' 
        ? await jamendoAPI.getTrendingTracks(halfLimit)
        : await jamendoAPI.getNewReleases(halfLimit);
      jamendoTracks = jamendoData.results || [];
    } catch (error) {
      console.error('Error fetching Jamendo tracks:', error);
    }

    // Get Spotify tracks if enabled
    if (this.spotifyEnabled) {
      try {
        const spotifyData = type === 'trending'
          ? await this.getTrendingTracks(halfLimit)
          : await spotifyAPI.getNewReleases(halfLimit);
        spotifyTracks = spotifyData.results || spotifyData.items || [];
      } catch (error) {
        console.error('Error fetching Spotify tracks:', error);
      }
    }

    // Combine and shuffle
    const combined = [...jamendoTracks, ...spotifyTracks];
    return {
      results: this.shuffleArray(combined),
      source: 'combined',
      message: 'Jamendo + Spotify'
    };
  }

  /**
   * Shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Format duration
   */
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

export const musicAPI = new MusicAPI();
export default musicAPI;
