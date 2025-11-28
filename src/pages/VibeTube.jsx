import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, X, List, Youtube, Sparkles, Music2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { favoritesAPI } from '../api/favorites';
import { searchHistoryAPI } from '../api/users';
import { youtubeAPI } from '../api/youtube';
import {
  VibeTubeHeader,
  SearchBar,
  SearchResults,
  VideoPlayer,
  PlaylistSidebar
} from '../components/vibetube';
import SearchHistory from '../components/vibetube/SearchHistory';
import YouTubePlaylists from '../components/vibetube/YouTubePlaylists';

// YouTube API Configuration
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';


// Main VibeTube Component
const VibeTube = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, googleAccessToken } = useAuth();
  
  const autoPlayVideo = location.state?.autoPlayVideo; // Get video from navigation state
  
  const urlParams = new URLSearchParams(location.search);
  const searchQueryFromUrl = urlParams.get('search');
  
  // State Management
  const [searchResults, setSearchResults] = useState([]);
  const [playlists, setPlaylists] = useState([
    { id: 'default', name: 'My Playlist', tracks: [] }
  ]);
  const [currentPlaylistId, setCurrentPlaylistId] = useState('default');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentTrack, setCurrentTrack] = useState(null); // Track being played (may not be in playlist)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [showYouTubePlaylists, setShowYouTubePlaylists] = useState(false);
  const [pageToken, setPageToken] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('top music 2024');
  const [initialSearchPerformed, setInitialSearchPerformed] = useState(false);

  // Hardcoded popular music video IDs to save API quota (avoids 100-unit search call)
  const POPULAR_MUSIC_IDS = [
    'kJQP7kiw5Fk', // Despacito
    'JGwWNGJdvx8', // Shape of You
    '60ItHLz5WEA', // Faded
    'RgKAFK5djSk', // Waka Waka
    'CevxZvSJLk8', // Katy Perry - Roar
    'hTWKbfoikeg', // Smells Like Teen Spirit
    '9bZkp7q19f0', // PSY - Gangnam Style
    'SlPhMPnQ58k', // Sorry - Justin Bieber
    'OPf0YbXqDm0', // Uptown Funk
    '2Vv-BfVoq4g', // Perfect - Ed Sheeran
    'ru0K8uYEZWw', // Closer - Chainsmokers
    'lWA2pjMjpBs', // Timber - Pitbull
    'nfWlot6h_JM', // Taylor Swift - Shake It Off
    'YQHsXMglC9A', // Hello - Adele
    'pRpeEdMmmQ0', // Shakira - Whenever Wherever
    '450p7goxZqg', // All Of Me - John Legend
    'hLQl3WQQoQ0', // Someone Like You - Adele
    'FM7MFYoylVs', // Somebody That I Used To Know
    'fJ9rUzIMcZQ', // Bohemian Rhapsody
    'DyDfgMOUjCI', // bad guy - Billie Eilish
    'ZbZSe6N_BXs', // Happy - Pharrell Williams
    'S5L3JwHiGp0', // Let Her Go - Passenger
    'kXYiU_JCYtU', // Numb - Linkin Park
    'Pkh8UtuejGw'  // Stereo Hearts - Gym Class Heroes
  ];

  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const fullscreenPlayerRef = useRef(null);
  const autoPlayHandledRef = useRef(false); // Prevent duplicate autoplay
  
  const currentPlaylist = playlists.find(p => p.id === currentPlaylistId) || playlists[0];
  const playlist = currentPlaylist.tracks;

  // Load playlists from localStorage
  useEffect(() => {
    const savedPlaylists = localStorage.getItem('vibetube_playlists');
    if (savedPlaylists) {
      try {
        const parsed = JSON.parse(savedPlaylists);
        setPlaylists(parsed);
      } catch (err) {
        console.error('Failed to load playlists:', err);
      }
    }
  }, []);

  // Save playlists to localStorage
  useEffect(() => {
    localStorage.setItem('vibetube_playlists', JSON.stringify(playlists));
  }, [playlists]);

  // Keyboard shortcuts
  useEffect(() => {
    let lastKeyPressTime = 0;
    const KEY_DEBOUNCE_MS = 200; // Prevent key spam

    const handleKeyPress = (e) => {
      // Don't trigger shortcuts if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Debounce key presses
      const now = Date.now();
      if (now - lastKeyPressTime < KEY_DEBOUNCE_MS) {
        return;
      }
      lastKeyPressTime = now;

      switch (e.key.toLowerCase()) {
        case ' ': // Space - Play/Pause
          e.preventDefault();
          handlePlayPause();
          console.log('⌨️ Keyboard: Space pressed - Play/Pause');
          break;
        case 'arrowright': // Right arrow - Next track
          e.preventDefault();
          handleNext();
          console.log('⌨️ Keyboard: Right arrow pressed - Next track');
          break;
        case 'arrowleft': // Left arrow - Previous track
          e.preventDefault();
          handlePrevious();
          console.log('⌨️ Keyboard: Left arrow pressed - Previous track');
          break;
        case 'arrowup': // Up arrow - Volume up
          e.preventDefault();
          handleVolumeChange(Math.min(volume + 10, 100));
          console.log('⌨️ Keyboard: Up arrow pressed - Volume up');
          break;
        case 'arrowdown': // Down arrow - Volume down
          e.preventDefault();
          handleVolumeChange(Math.max(volume - 10, 0));
          console.log('⌨️ Keyboard: Down arrow pressed - Volume down');
          break;
        case 'm': // M - Mute/Unmute
          e.preventDefault();
          handleToggleMute();
          console.log('⌨️ Keyboard: M pressed - Mute/Unmute');
          break;
        case 's': // S - Shuffle
          e.preventDefault();
          const newShuffle = !isShuffle;
          setIsShuffle(newShuffle);
          console.log('⌨️ Keyboard: S pressed - Shuffle', newShuffle ? 'ON' : 'OFF');
          break;
        case 'r': // R - Repeat
          e.preventDefault();
          const newRepeat = !isRepeat;
          setIsRepeat(newRepeat);
          console.log('⌨️ Keyboard: R pressed - Repeat', newRepeat ? 'ON' : 'OFF');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, volume, isMuted, isShuffle, isRepeat, currentIndex, playlist]);

  // Initialize YouTube Player
  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        height: '360',
        width: '640',
        playerVars: {
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            console.log('YouTube Player Ready');
            event.target.setVolume(volume);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startProgressTracking();
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              stopProgressTracking();
            } else if (event.data === window.YT.PlayerState.ENDED) {
              handleVideoEnd();
            }
          },
        },
      });
    };

    return () => {
      stopProgressTracking();
    };
  }, []);

  // Setup player in hidden container (audio only)
  useEffect(() => {
    if (playerRef.current && playerRef.current.getIframe) {
      const iframe = playerRef.current.getIframe();
      const container = document.getElementById('yt-player');
      if (container && iframe) {
        container.appendChild(iframe);
        iframe.style.width = '1px';
        iframe.style.height = '1px';
      }
    }
  }, []);

  // Handle URL search parameter from global search
  useEffect(() => {
    if (searchQueryFromUrl && !initialSearchPerformed) {
      setCurrentQuery(searchQueryFromUrl);
      searchVideos(searchQueryFromUrl);
      setInitialSearchPerformed(true);
    }
  }, []);

  // Handle autoplay from navigation (Playlists page)
  useEffect(() => {
    if (autoPlayVideo && playerRef.current && !autoPlayHandledRef.current) {
      console.log('🎵 Autoplay from Playlists:', autoPlayVideo);
      autoPlayHandledRef.current = true; // Mark as handled
      
      const video = {
        videoId: autoPlayVideo.videoId,
        title: autoPlayVideo.title,
        channelTitle: autoPlayVideo.channelTitle,
        thumbnail: autoPlayVideo.thumbnail
      };
      
      // Use playVideoDirectly to add to playlist and play
      playVideoDirectly(video);
      
      // Clear navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [autoPlayVideo, playerRef.current]);
  // Progress Tracking
  const startProgressTracking = () => {
    stopProgressTracking();
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
        if (playerRef.current.getDuration) {
          setDuration(playerRef.current.getDuration());
        }
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Handle Video End - using useCallback to capture latest state
  const handleVideoEnd = useCallback(() => {
    // Get current playlist tracks
    const currentPlaylist = playlists.find(p => p.id === currentPlaylistId) || playlists[0];
    const currentTracks = currentPlaylist?.tracks || [];
    
    console.log('🎵 Video ended. Repeat:', isRepeat, 'Shuffle:', isShuffle, 'Playlist length:', currentTracks.length, 'Current index:', currentIndex);
    
    if (isRepeat) {
      console.log('🔁 Repeat is ON - Replaying current video');
      if (playerRef.current && playerRef.current.playVideo) {
        playerRef.current.playVideo();
      }
    } else if (currentTracks.length > 0 && currentIndex !== -1) {
      console.log('⏭️ Playing next video');
      
      // Calculate next index
      let nextIndex;
      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * currentTracks.length);
        console.log(`🔀 Shuffle is ON - Playing random track #${nextIndex}`);
      } else {
        nextIndex = (currentIndex + 1) % currentTracks.length;
        console.log(`⏭️ Shuffle is OFF - Playing next track #${nextIndex}`);
      }
      
      // Play the next video
      const nextVideo = currentTracks[nextIndex];
      if (nextVideo && playerRef.current && playerRef.current.loadVideoById) {
        setCurrentIndex(nextIndex);
        setCurrentTrack(nextVideo);
        playerRef.current.loadVideoById(nextVideo.videoId);
        playerRef.current.playVideo();
      }
    } else {
      console.log('⏸️ No more tracks to play');
      setIsPlaying(false);
    }
  }, [isRepeat, isShuffle, playlists, currentPlaylistId, currentIndex]);

  // Parse ISO 8601 duration to readable format
  const parseDuration = (isoDuration) => {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return null;

    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Rate limiting - prevent rapid API calls
  const lastSearchTime = useRef(0);
  const MIN_SEARCH_INTERVAL = 1000; // 1 second between searches

  // YouTube API Functions - Enhanced to load MORE results
  const searchVideos = async (query, append = false, nextPageToken = null) => {
    // Rate limiting check
    const now = Date.now();
    if (now - lastSearchTime.current < MIN_SEARCH_INTERVAL && !append) {
      console.log('⏱️ Rate limited: Search too soon after previous call');
      return;
    }
    lastSearchTime.current = now;
    if (append) {
      setLoadingMore(true);
    } else {
      setIsLoading(true);
      setSearchResults([]);
      setPageToken(null);
      setHasMore(true);
    }
    setError(null);
    setCurrentQuery(query);

    try {
      // Search for videos - INCREASED from 12 to 24 results!
      const pageTokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : '';
      const searchResponse = await fetch(
        `${YOUTUBE_API_BASE}/search?part=snippet&type=video&videoCategoryId=10&maxResults=24&q=${encodeURIComponent(
          query
        )}${pageTokenParam}&key=${YOUTUBE_API_KEY}`
      );

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json().catch(() => ({}));
        if (searchResponse.status === 403) {
          throw new Error('YouTube API quota exceeded. Please try again later or use a different API key.');
        } else if (searchResponse.status === 400) {
          throw new Error('Invalid API request. Please check the API key configuration.');
        }
        throw new Error(errorData.error?.message || 'Failed to search videos. Please try again.');
      }

      const searchData = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        if (!append) {
          setSearchResults([]);
        }
        setHasMore(false);
        setIsLoading(false);
        setLoadingMore(false);
        return;
      }

      // Store next page token
      setPageToken(searchData.nextPageToken || null);
      setHasMore(!!searchData.nextPageToken);

      // Get video IDs for duration lookup
      const videoIds = searchData.items.map((item) => item.id.videoId).join(',');

      // Fetch video details including duration
      const detailsResponse = await fetch(
        `${YOUTUBE_API_BASE}/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
      );

      const detailsData = await detailsResponse.json();

      // Parse duration and combine data
      const results = searchData.items.map((item, index) => {
        const details = detailsData.items[index];
        const duration = details ? parseDuration(details.contentDetails.duration) : null;

        return {
          videoId: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.medium.url,
          duration: duration,
        };
      });

      if (append) {
        setSearchResults(prev => [...prev, ...results]);
      } else {
        setSearchResults(results);
        
        // Save search to history (only for user searches, not initial load)
        if (currentUser && query !== 'top music 2024') {
          try {
            await searchHistoryAPI.addToHistory(currentUser.uid, query, results.length);
            console.log('✅ Search saved to history');
          } catch (historyError) {
            console.error('Failed to save search history:', historyError);
            // Continue even if history save fails
          }
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err.message || 'Failed to search videos. Please try again.';
      setError(errorMessage);
      
      // Don't show error on initial load if it's just API quota issue
      if (!append && searchResults.length === 0) {
        setSearchResults([]);
      }
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreVideos = useCallback(() => {
    if (!loadingMore && hasMore && pageToken) {
      searchVideos(currentQuery, true, pageToken);
    }
  }, [loadingMore, hasMore, pageToken, currentQuery]);

  // Load popular music on component mount - Using hardcoded IDs to save API quota!
  useEffect(() => {
    const loadPopularMusic = async () => {
      // Only load if no URL search parameter
      if (!searchQueryFromUrl) {
        setIsLoading(true);
        try {
          // Use videos.list (1 unit) instead of search (100 units)
          const videoIds = POPULAR_MUSIC_IDS.join(',');
          const detailsResponse = await fetch(
            `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
          );

          if (!detailsResponse.ok) {
            throw new Error('Failed to load popular music');
          }

          const detailsData = await detailsResponse.json();
          const results = detailsData.items.map((item) => ({
            videoId: item.id,
            title: item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.medium.url,
            duration: parseDuration(item.contentDetails.duration),
          }));

          setSearchResults(results);
          setHasMore(false); // No pagination for hardcoded list
        } catch (err) {
          console.error('Error loading popular music:', err);
          // Fallback to search if hardcoded approach fails
          await searchVideos('top music 2024');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPopularMusic();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore || isLoading) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // Load more when user is 1000px from bottom (increased to save API quota)
      if (scrollTop + clientHeight >= scrollHeight - 1000) {
        loadMoreVideos();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreVideos, loadingMore, hasMore, isLoading]);

  // Playlist Management Functions
  const createPlaylist = (name) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      tracks: []
    };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const renamePlaylist = (id, newName) => {
    setPlaylists(prev => prev.map(p => 
      p.id === id ? { ...p, name: newName } : p
    ));
  };

  const deletePlaylist = (id) => {
    if (id === 'default') return;
    setPlaylists(prev => prev.filter(p => p.id !== id));
    if (currentPlaylistId === id) {
      setCurrentPlaylistId('default');
    }
  };

  const addToPlaylist = (video, playlistId = currentPlaylistId) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        // Check if video already exists
        const exists = p.tracks.some(t => t.videoId === video.videoId);
        if (!exists) {
          // Show success feedback
          console.log(`✅ Added "${video.title}" to playlist "${p.name}"`);
          return { ...p, tracks: [...p.tracks, video] };
        } else {
          console.log(`ℹ️ "${video.title}" already exists in playlist "${p.name}"`);
        }
      }
      return p;
    }));
  };

  // Add track to favorites (MongoDB)
  const addToFavorites = async (track) => {
    if (!currentUser) {
      // Show toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3';
      toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>Please sign in to add favorites</span>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      return;
    }

    try {
      const result = await favoritesAPI.addToFavorites(currentUser.uid, track);
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 z-50 bg-gradient-to-r from-pink-600 to-red-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in';
      toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span>${result.alreadyExists ? 'Already in favorites!' : 'Added to favorites! ❤️'}</span>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3';
      toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <span>Failed to add to favorites</span>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

  const removeFromPlaylist = (index) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === currentPlaylistId) {
        const newTracks = p.tracks.filter((_, i) => i !== index);
        
        // If currently playing track from this playlist
        if (currentTrack && currentIndex === index && p.tracks[index]?.videoId === currentTrack.videoId) {
          setCurrentIndex(-1);
          setCurrentTrack(null);
          playerRef.current?.stopVideo();
        } else if (index < currentIndex) {
          setCurrentIndex(prev => prev - 1);
        }
        
        return { ...p, tracks: newTracks };
      }
      return p;
    }));
  };

  const reorderPlaylist = (fromIndex, toIndex) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === currentPlaylistId) {
        const newTracks = [...p.tracks];
        const [removed] = newTracks.splice(fromIndex, 1);
        newTracks.splice(toIndex, 0, removed);
        
        // Update current index if needed
        if (fromIndex === currentIndex) {
          setCurrentIndex(toIndex);
        } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
          setCurrentIndex(prev => prev - 1);
        } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
          setCurrentIndex(prev => prev + 1);
        }
        
        return { ...p, tracks: newTracks };
      }
      return p;
    }));
  };

  // Play video directly without adding to playlist
  const playNow = (video) => {
    setCurrentTrack(video);
    setCurrentIndex(-1); // Not from playlist
    
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(video.videoId);
      playerRef.current.playVideo();
    }
  };



  // Play video directly from search results (receives video object)
  const playVideoDirectly = (video) => {
    console.log('🎵 Playing video:', video.title);
    
    // Check if video is already in playlist
    const existingIndex = playlist.findIndex(t => t.videoId === video.videoId);
    
    if (existingIndex >= 0) {
      // Video exists in playlist, play it
      console.log('✅ Video found in playlist at index:', existingIndex);
      playVideo(existingIndex);
    } else {
      // Add to current playlist and play immediately
      const newPlaylist = [...playlist, video];
      const newIndex = newPlaylist.length - 1;
      
      console.log('➕ Adding video to playlist at index:', newIndex);
      
      // Update the playlists array with the new track in current playlist
      setPlaylists(prevPlaylists => 
        prevPlaylists.map(p => 
          p.id === currentPlaylistId 
            ? { ...p, tracks: newPlaylist }
            : p
        )
      );
      
      setCurrentTrack(video);
      setCurrentIndex(newIndex);
      
      // Ensure player is ready before playing (with max retries)
      let retryCount = 0;
      const maxRetries = 15;
      
      const attemptPlay = () => {
        // Check if YT API is loaded and player is initialized
        if (window.YT && window.YT.Player && playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
          try {
            console.log('▶️ Loading video ID:', video.videoId);
            playerRef.current.loadVideoById(video.videoId);
            playerRef.current.playVideo();
            setIsPlaying(true);
          } catch (error) {
            console.error('❌ Error loading video:', error);
          }
        } else if (retryCount < maxRetries) {
          retryCount++;
          console.warn(`⏳ Player not ready, retry ${retryCount}/${maxRetries}...`);
          setTimeout(attemptPlay, 500); // Increased delay
        } else {
          console.error('❌ Player failed to initialize after', maxRetries, 'attempts');
          console.error('Debug info:', {
            hasYT: !!window.YT,
            hasYTPlayer: !!(window.YT && window.YT.Player),
            hasPlayerRef: !!playerRef.current,
            hasLoadMethod: !!(playerRef.current && typeof playerRef.current.loadVideoById === 'function')
          });
        }
      };
      
      setTimeout(attemptPlay, 200);
    }
  };

  const playVideo = (index) => {
    if (index < 0 || index >= playlist.length) return;
    
    setCurrentIndex(index);
    const video = playlist[index];
    setCurrentTrack(video);
    
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(video.videoId);
      playerRef.current.playVideo();
    }
  };

  // Player Controls
  const handlePlayPause = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      if (!currentTrack && playlist.length > 0) {
        playVideo(0);
      } else if (currentTrack) {
        playerRef.current.playVideo();
      }
    }
  };

  const handleNext = () => {
    // Only skip if playing from playlist
    if (currentIndex === -1 || playlist.length === 0) return;
    
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
      console.log(`🔀 Shuffle is ON - Playing random track #${nextIndex}`);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
      console.log(`⏭️ Shuffle is OFF - Playing next track #${nextIndex}`);
    }
    
    playVideo(nextIndex);
  };

  const handlePrevious = () => {
    // Only skip if playing from playlist
    if (currentIndex === -1 || playlist.length === 0) return;
    
    let prevIndex;
    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * playlist.length);
      console.log(`🔀 Shuffle is ON - Playing random track #${prevIndex}`);
    } else {
      prevIndex = currentIndex - 1 < 0 ? playlist.length - 1 : currentIndex - 1;
      console.log(`⏮️ Shuffle is OFF - Playing previous track #${prevIndex}`);
    }
    
    playVideo(prevIndex);
  };

  const handleSeek = (time) => {
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(time, true);
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(newVolume);
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-black pb-20 relative">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* YouTube Player Container (hidden - audio only) */}
      <div style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', opacity: 0 }}>
        <div id="yt-player"></div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-900/40 via-pink-900/40 to-purple-900/40 border-b border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Youtube size={56} className="text-red-500" />
              </motion.div>
              <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-red-200 to-pink-200 bg-clip-text text-transparent">
                VibeTube
              </h1>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles size={36} className="text-yellow-400" />
              </motion.div>
            </div>
            <p className="text-gray-300 text-xl font-medium">Stream Millions of Music Videos in Stunning Quality</p>
          </motion.div>

          <SearchBar 
            onSearch={searchVideos} 
            isLoading={isLoading}
            onShowHistory={() => setShowSearchHistory(true)}
            showHistoryButton={!!currentUser}
            onShowYouTubePlaylists={() => {
              console.log('🎬 YouTube button clicked!');
              setShowYouTubePlaylists(true);
            }}
            showYouTubeButton={!!currentUser && !!googleAccessToken}
          />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Search Results - FULL WIDTH on large screens */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-4"
              >
                <TrendingUp className="text-red-400" size={28} />
                <h2 className="text-3xl font-black text-white">Discover Music</h2>
              </motion.div>
              <SearchResults
                results={searchResults}
                onAdd={addToPlaylist}
                onPlayNow={playVideoDirectly}
                onAddToFavorites={addToFavorites}
                playlists={playlists}
                isLoading={isLoading}
                error={error}
              />

              {/* Loading More Indicator */}
              {loadingMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-400 text-sm">Loading more videos...</p>
                </motion.div>
              )}

              {/* No More Videos Indicator */}
              {!hasMore && searchResults.length > 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <p className="text-gray-400 text-sm">
                    🎵 You've reached the end! All videos loaded.
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right: Player & Playlist */}
          <div className="lg:col-span-1 space-y-6">
            {/* Now Playing */}
            <VideoPlayer
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
              isRepeat={isRepeat}
              isShuffle={isShuffle}
              onToggleRepeat={() => {
                const newRepeat = !isRepeat;
                setIsRepeat(newRepeat);
                console.log('🔁 Repeat toggled:', newRepeat ? 'ON' : 'OFF');
              }}
              onToggleShuffle={() => {
                const newShuffle = !isShuffle;
                setIsShuffle(newShuffle);
                console.log('🔀 Shuffle toggled:', newShuffle ? 'ON' : 'OFF');
              }}
            />

            {/* Playlist Sidebar */}
            <PlaylistSidebar
              playlists={playlists}
              onCreatePlaylist={createPlaylist}
              onRenamePlaylist={renamePlaylist}
              onDeletePlaylist={deletePlaylist}
              currentPlaylistId={currentPlaylistId}
              onSelectPlaylist={setCurrentPlaylistId}
              playlist={playlist}
              currentIndex={currentIndex}
              onPlay={playVideo}
              onRemove={removeFromPlaylist}
              onReorder={reorderPlaylist}
              showPlaylist={showPlaylist}
              onTogglePlaylist={() => setShowPlaylist(!showPlaylist)}
            />
          </div>
        </div>
      </div>

      {/* Search History Modal */}
      {showSearchHistory && currentUser && (
        <SearchHistory
          userId={currentUser.uid}
          onSelectQuery={(query) => searchVideos(query)}
          onClose={() => setShowSearchHistory(false)}
        />
      )}

      {/* YouTube Playlists Modal */}
      {showYouTubePlaylists && currentUser && (
        <YouTubePlaylists
          isOpen={showYouTubePlaylists}
          onClose={() => setShowYouTubePlaylists(false)}
          userId={currentUser.uid}
          accessToken={googleAccessToken}
          onPlayVideo={playVideoDirectly}
        />
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.7);
        }
      `}</style>
    </div>
  );
};

export default VibeTube;
