import { motion } from 'framer-motion';
import { Play, ChevronRight, Music2, Sparkles } from 'lucide-react';
import { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../contexts/PlayerContext';
import { musicAPI } from '../../api/music';
import jamendoAPI from '../../api/jamendo';

// Extract TrackCard outside to prevent re-renders
const TrackCard = memo(({ track, tracks, onNavigate, onPlay }) => {
  return (
    <div
      className="group relative bg-gray-800/50 backdrop-blur-lg rounded-xl overflow-hidden border border-gray-700 hover:border-green-500/50 hover:-translate-y-2 transition-all duration-300 cursor-pointer shrink-0 w-[200px]"
      onClick={() => onNavigate(track.id)}
    >
      {/* Album Art */}
      <div className="relative overflow-hidden aspect-square">
        <img
          src={track.image || track.album_image || 'https://via.placeholder.com/200'}
          alt={track.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Source Badge */}
        {track.source === 'spotify' && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 rounded-full text-xs font-semibold flex items-center gap-1 pointer-events-none">
            <Music2 size={12} />
            Spotify
          </div>
        )}

        {/* Overlay with Play Button */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (track.audio || track.preview_url) {
                onPlay(track, tracks);
              }
            }}
            className={`w-12 h-12 bg-green-500 rounded-full shadow-lg hover:bg-green-600 hover:scale-110 active:scale-95 transition-all flex items-center justify-center ${!track.audio && !track.preview_url ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!track.audio && !track.preview_url}
          >
            <Play size={20} fill="white" className="text-white ml-0.5" />
          </button>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs pointer-events-none">
          {track.source === 'spotify' && track.preview_url
            ? '0:30'
            : jamendoAPI.formatDuration(track.duration)}
        </div>
      </div>

      {/* Track Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-green-400 transition-colors">
          {track.name}
        </h3>
        <p className="text-gray-400 text-xs truncate">{track.artist_name}</p>
      </div>
    </div>
  );
});

TrackCard.displayName = 'TrackCard';

const Explore = () => {
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const [popularTracks, setPopularTracks] = useState([]);
  const [latestTracks, setLatestTracks] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);

  // Use ref to maintain stable reference to playTrack
  const playTrackRef = useRef(playTrack);

  useEffect(() => {
    playTrackRef.current = playTrack;
  }, [playTrack]);

  // Use useMemo to create stable references that won't change unless dependencies change
  const handleNavigate = useMemo(
    () => (trackId) => {
      navigate(`/track/${trackId}`);
    },
    [navigate]
  );

  const handlePlay = useMemo(
    () => (track, tracks) => {
      playTrackRef.current(track, tracks);
    },
    []
  ); // No dependencies - always stable
  const [musicSource, setMusicSource] = useState('combined'); // 'jamendo', 'spotify', or 'combined'

  // Initialize Spotify for guest users
  useEffect(() => {
    const initSpotify = async () => {
      await musicAPI.initializeGuestSpotify();
    };
    initSpotify();
  }, []);

  // Fetch popular tracks
  useEffect(() => {
    const fetchPopular = async () => {
      setLoadingPopular(true);
      const data = await musicAPI.getCombinedTracks('trending', 10);
      if (data.results) {
        setPopularTracks(data.results);
      }
      setLoadingPopular(false);
    };

    fetchPopular();
  }, []);

  // Fetch latest tracks
  useEffect(() => {
    const fetchLatest = async () => {
      setLoadingLatest(true);
      const data = await musicAPI.getCombinedTracks('new', 10);
      if (data.results) {
        setLatestTracks(data.results);
      }
      setLoadingLatest(false);
    };

    fetchLatest();
  }, []);

  const LoadingSkeleton = () => (
    <div className="shrink-0 w-[200px] bg-gray-800/50 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-700"></div>
      <div className="p-3">
        <div className="h-4 bg-gray-700 rounded mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  );

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto">
        {/* Popular Songs Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">🔥 Popular Right Now</h2>
              <p className="text-gray-400">Most played tracks this week</p>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all group"
            >
              <span className="font-semibold">Show More</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Horizontal Scroll Track List */}
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
              {loadingPopular ? (
                [...Array(6)].map((_, i) => <LoadingSkeleton key={i} />)
              ) : popularTracks.length > 0 ? (
                popularTracks.map((track, index) => (
                  <TrackCard
                    key={`popular-${track.id}-${index}`}
                    track={track}
                    tracks={popularTracks}
                    onNavigate={handleNavigate}
                    onPlay={handlePlay}
                  />
                ))
              ) : (
                <div className="w-full text-center py-8 text-gray-400">
                  <Music2 size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No tracks available</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Latest Songs Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">✨ Latest Releases</h2>
              <p className="text-gray-400">Fresh music added today</p>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all group"
            >
              <span className="font-semibold">Show More</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Horizontal Scroll Track List */}
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
              {loadingLatest ? (
                [...Array(6)].map((_, i) => <LoadingSkeleton key={i} />)
              ) : latestTracks.length > 0 ? (
                latestTracks.map((track, index) => (
                  <TrackCard
                    key={`latest-${track.id}-${index}`}
                    track={track}
                    tracks={latestTracks}
                    onNavigate={handleNavigate}
                    onPlay={handlePlay}
                  />
                ))
              ) : (
                <div className="w-full text-center py-8 text-gray-400">
                  <Music2 size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No tracks available</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Explore Full Library Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/explore')}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Explore Full Library
          </motion.button>
        </motion.div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default Explore;
