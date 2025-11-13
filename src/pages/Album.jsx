import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Music2, 
  Play, 
  Heart, 
  Download, 
  Share2, 
  Calendar, 
  User,
  Clock,
  ArrowLeft
} from 'lucide-react';
import jamendoAPI from '../api/jamendo';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from '../components/Toast';

const Album = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { playTrack, isPlaying, currentTrack } = usePlayer();
  
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedTracks, setLikedTracks] = useState([]);

  useEffect(() => {
    loadAlbumData();
    if (currentUser) {
      loadLikedTracks();
    }
  }, [id, currentUser]);

  const loadAlbumData = async () => {
    setLoading(true);
    try {
      // Get album details
      const albumData = await jamendoAPI.getAlbumById(id);
      
      if (albumData) {
        setAlbum(albumData);
        
        // Get album tracks
        const tracksData = await jamendoAPI.getAlbumTracks(id);
        if (tracksData.results && tracksData.results.length > 0) {
          const albumWithTracks = tracksData.results[0];
          setTracks(albumWithTracks.tracks || []);
        }
      }
    } catch (error) {
      console.error('Error loading album:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLikedTracks = async () => {
    if (!currentUser) return;
    try {
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', currentUser.uid)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        setLikedTracks(userData.likedTracks || []);
      }
    } catch (error) {
      console.error('Error loading liked tracks:', error);
    }
  };

  const toggleLike = async (track) => {
    if (!currentUser) {
      toast.show('Please login to like tracks', 'error');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const isLiked = likedTracks.includes(track.id);

      if (isLiked) {
        await updateDoc(userRef, {
          likedTracks: arrayRemove(track.id)
        });
        setLikedTracks(prev => prev.filter(id => id !== track.id));
        toast.show('Removed from favorites', 'info');
      } else {
        await updateDoc(userRef, {
          likedTracks: arrayUnion(track.id)
        });
        setLikedTracks(prev => [...prev, track.id]);
        toast.show('Added to favorites', 'info');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.show('Failed to update favorites', 'error');
    }
  };

  const handlePlayTrack = (track) => {
    playTrack(track);
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0]);
    }
  };

  const handleShare = async () => {
    if (navigator.share && album) {
      try {
        await navigator.share({
          title: album.name,
          text: `Check out ${album.name} by ${album.artist_name} on VMusic`,
          url: album.shareurl || window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.show('Link copied to clipboard!', 'info');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading album...</p>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Music2 size={64} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Album Not Found</h2>
          <p className="text-gray-400 mb-6">The album you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black pb-32">
      {/* Header */}
      <div className="relative h-96 overflow-hidden">
        {/* Background Image with Blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${album.image})`,
            filter: 'blur(50px)',
            transform: 'scale(1.1)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-gray-900" />
        
        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-8">
          <div className="flex items-end gap-6">
            {/* Album Cover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-48 h-48 rounded-lg overflow-hidden shadow-2xl flex-shrink-0"
            >
              {album.image ? (
                <img 
                  src={album.image} 
                  alt={album.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
                  <Music2 size={64} className="text-white/50" />
                </div>
              )}
            </motion.div>

            {/* Album Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1"
            >
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              
              <p className="text-sm font-semibold text-cyan-400 tracking-wider mb-2">ALBUM</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {album.name}
              </h1>
              
              <div className="flex items-center gap-4 text-gray-300">
                <button
                  onClick={() => navigate(`/artist/${album.artist_id}`)}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <User size={18} />
                  <span className="font-medium">{album.artist_name}</span>
                </button>
                
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>{new Date(album.releasedate).getFullYear()}</span>
                </div>
                
                {tracks.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Music2 size={18} />
                    <span>{tracks.length} track{tracks.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayAll}
            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-full flex items-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/50"
          >
            <Play size={20} fill="white" />
            Play All
          </button>
          
          {album.zip_allowed && album.zip && (
            <a
              href={album.zip}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
              title="Download Album"
            >
              <Download size={20} className="text-white" />
            </a>
          )}
          
          <button
            onClick={handleShare}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
            title="Share Album"
          >
            <Share2 size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Tracks List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 rounded-xl overflow-hidden">
          {tracks.length > 0 ? (
            <div className="divide-y divide-white/10">
              {tracks.map((track, index) => {
                const isCurrentTrack = currentTrack?.id === track.id;
                const isLiked = likedTracks.includes(track.id);

                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-all group ${
                      isCurrentTrack ? 'bg-white/10' : ''
                    }`}
                  >
                    {/* Track Number / Play Button */}
                    <div className="w-8 flex-shrink-0 text-center">
                      <span className="text-gray-400 group-hover:hidden">
                        {index + 1}
                      </span>
                      <button
                        onClick={() => handlePlayTrack(track)}
                        className="hidden group-hover:block"
                      >
                        <Play 
                          size={20} 
                          className={isCurrentTrack && isPlaying ? 'text-cyan-400' : 'text-white'}
                          fill={isCurrentTrack && isPlaying ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${
                        isCurrentTrack ? 'text-cyan-400' : 'text-white'
                      }`}>
                        {track.name}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                        {track.artist_name}
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock size={14} />
                      {jamendoAPI.formatDuration(track.duration)}
                    </div>

                    {/* Like Button */}
                    <button
                      onClick={() => toggleLike(track)}
                      className="p-2 hover:bg-white/10 rounded-full transition-all"
                    >
                      <Heart
                        size={20}
                        className={isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                      />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Music2 size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No tracks available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Album;
