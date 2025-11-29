import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingPlayer from './components/player/FloatingPlayer';
import Toast from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import Landing from './pages/Landing';
import About from './pages/About';
import TrackDetails from './pages/TrackDetails';
import SpotifyCallback from './pages/SpotifyCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Artists from './pages/Artists';
import Album from './pages/Album';
import VibeZone from './pages/VibeZone';
import VibeTube from './pages/VibeTube';
import {
  Dashboard,
  Favorites,
  Playlists,
  PlaylistDetail,
  Profile,
  Explore,
  Search,
  Artist,
  Contact,
  PrivacyPolicy,
  TermsOfService,
} from './pages';
import './App.css';

function App() {
  return (
    <Router>
      <div className="bg-gray-900 min-h-screen">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/vibe-zone" element={<VibeZone />} />
          <Route path="/vibetube" element={
            <ErrorBoundary>
              <VibeTube />
            </ErrorBoundary>
          } />
          <Route path="/search" element={<Search />} />
          <Route path="/artist/:id" element={<Artist />} />
          <Route path="/album/:id" element={<Album />} />
          <Route path="/track/:trackId" element={<TrackDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/callback" element={<SpotifyCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/playlists"
            element={
              <ProtectedRoute>
                <Playlists />
              </ProtectedRoute>
            }
          />
          <Route
            path="/playlist/:playlistId"
            element={
              <ProtectedRoute>
                <PlaylistDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
        
        {/* Floating Music Player */}
        <FloatingPlayer />
        
        {/* Toast Notifications */}
        <Toast />
      </div>
    </Router>
  );
}

export default App;
