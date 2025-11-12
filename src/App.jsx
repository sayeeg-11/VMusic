import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingPlayer from './components/player/FloatingPlayer';
import Landing from './pages/Landing';
import About from './pages/About';
import TrackDetails from './pages/TrackDetails';
import SpotifyCallback from './pages/SpotifyCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import {
  Dashboard,
  Favorites,
  Playlists,
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
          <Route path="/search" element={<Search />} />
          <Route path="/artist/:id" element={<Artist />} />
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
      </div>
    </Router>
  );
}

export default App;
