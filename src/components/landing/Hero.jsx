import { motion } from 'framer-motion';
import { Play, Music2, Sparkles, Youtube, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Logo Animation - Simplified */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur-2xl opacity-50"></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="relative p-2 bg-gradient-to-br from-gray-900/80 to-purple-900/80 rounded-full backdrop-blur-sm border-4 border-purple-500/30 shadow-2xl"
            >
              <img
                src="/logo.png"
                alt="VMusic Logo"
                className="w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl relative z-10"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
            V
          </span>
          <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
            Music
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl lg:text-3xl text-gray-200 mb-4 font-light"
        >
          Discover Free Independent Music
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-base md:text-lg text-gray-400 mb-10 max-w-2xl mx-auto"
        >
          Stream 500K+ royalty-free tracks + Import your YouTube playlists
          <span className="inline-flex items-center ml-2">
            <Sparkles size={20} className="text-yellow-400" />
          </span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/explore">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold text-lg shadow-lg shadow-green-500/50 hover:shadow-green-500/80 transition-all duration-300 flex items-center gap-2"
            >
              <Play size={20} fill="white" />
              Start Listening
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.button>
          </Link>

          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold text-lg border-2 border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              Sign Up Free
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          <div className="text-center group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2"
            >
              <Music2 className="text-purple-400" size={28} />
              500K+
            </motion.div>
            <div className="text-sm md:text-base text-gray-400">Free Tracks</div>
          </div>
          <div className="text-center group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2"
            >
              <Sparkles className="text-pink-400" size={28} />
              40K+
            </motion.div>
            <div className="text-sm md:text-base text-gray-400">Artists</div>
          </div>
          <div className="text-center group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2"
            >
              <Youtube className="text-red-400" size={32} />
            </motion.div>
            <div className="text-sm md:text-base text-gray-400">YouTube Import</div>
          </div>
          <div className="text-center group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2"
            >
              <Play className="text-green-400" size={28} fill="currentColor" />
              100%
            </motion.div>
            <div className="text-sm md:text-base text-gray-400">Free Forever</div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-3 bg-white/50 rounded-full"></div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
