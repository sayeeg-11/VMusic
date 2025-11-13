import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music2, 
  Search, 
  Home, 
  Compass, 
  Heart, 
  ListMusic, 
  User, 
  LogOut,
  Menu,
  X,
  Mail,
  MapPin,
  Users,
  Sparkles,
  Youtube
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SignIn, SignUp } from '../auth';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowMobileMenu(false);
      setShowSearchBar(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const guestLinks = [
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Artists', path: '/artists', icon: Users },
    { name: 'Vibe Zone', path: '/vibe-zone', icon: Sparkles },
    { name: 'VibeTube', path: '/vibe-tube', icon: Youtube },
  ];

  const userLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Artists', path: '/artists', icon: Users },
    { name: 'Vibe Zone', path: '/vibe-zone', icon: Sparkles },
    { name: 'VibeTube', path: '/vibe-tube', icon: Youtube },
    { name: 'Favorites', path: '/favorites', icon: Heart },
  ];

  const navLinks = currentUser ? userLinks : guestLinks;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-14 h-14 flex items-center justify-center"
              >
                <img src="/logo.png" alt="VMusic Logo" className="w-full h-full object-contain" />
              </motion.div>
              <span className="text-3xl font-bold text-white hidden sm:block">
                V<span className="text-purple-400">Music</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <link.icon size={18} />
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Search Icon (when logged in) or Search Bar (when not logged in) */}
            <div className="hidden md:flex items-center">
              {currentUser ? (
                <button
                  onClick={() => setShowSearchBar(!showSearchBar)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-400 hover:text-white transition-all"
                  title="Search"
                >
                  <Search size={20} />
                </button>
              ) : (
                <form onSubmit={handleSearch} className="flex items-center flex-1 max-w-md mx-8">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search songs, artists..."
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Auth Buttons / User Menu */}
            <div className="hidden md:flex items-center gap-3">
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/20"
                  >
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <User size={18} />
                    )}
                    <span className="text-white font-medium">
                      {currentUser.displayName?.split(' ')[0] || 'User'}
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-white/10 overflow-hidden"
                      >
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <User size={18} />
                          Profile Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={18} />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowSignIn(true)}
                    className="px-4 py-2 text-white hover:text-purple-400 font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowSignUp(true)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Search Bar */}
          <form onSubmit={handleSearch} className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs, artists..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </form>
        </div>

        {/* Full Width Search Bar (appears below header when logged in) */}
        <AnimatePresence>
          {currentUser && showSearchBar && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-white/10 bg-gray-900/95 backdrop-blur-lg overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for songs, artists, albums..."
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/20 rounded-full text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowSearchBar(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-gray-900"
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <link.icon size={20} />
                    {link.name}
                  </Link>
                ))}

                {currentUser ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                      <User size={20} />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <LogOut size={20} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowSignIn(true);
                        setShowMobileMenu(false);
                      }}
                      className="w-full px-4 py-3 text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setShowSignUp(true);
                        setShowMobileMenu(false);
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Auth Modals */}
      <AnimatePresence>
        {showSignIn && (
          <SignIn
            onClose={() => setShowSignIn(false)}
            onSwitchToSignUp={() => {
              setShowSignIn(false);
              setShowSignUp(true);
            }}
          />
        )}
        {showSignUp && (
          <SignUp
            onClose={() => setShowSignUp(false)}
            onSwitchToSignIn={() => {
              setShowSignUp(false);
              setShowSignIn(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;
