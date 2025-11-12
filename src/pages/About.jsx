import { motion } from 'framer-motion';
import { Music2, Code, Heart, Sparkles, Users, Globe, Award, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Music2, value: '500K+', label: 'Tracks Available' },
    { icon: Users, value: '40K+', label: 'Independent Artists' },
    { icon: Globe, value: '150+', label: 'Countries Worldwide' },
    { icon: Award, value: '100%', label: 'Royalty-Free' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6">
            <Music2 size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">About VMusic</h1>
          <p className="text-xl text-gray-400">
            Free, independent music for everyone
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <Heart className="text-purple-400" size={28} />
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-4">
            VMusic was built to celebrate independent artists and provide free access to incredible music. 
            We believe music should be accessible to everyone, and artists deserve to be discovered. 
            Powered by Jamendo API, we offer over 500,000 royalty-free tracks from talented musicians worldwide.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Whether you're a music lover discovering new sounds or an artist looking to share your work, 
            VMusic provides a platform that connects passionate creators with engaged listeners around the globe.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center hover:scale-105 transition-transform"
            >
              <stat.icon className="text-purple-400 mx-auto mb-3" size={32} />
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <Code className="text-blue-400" size={28} />
            <h2 className="text-2xl font-bold text-white">Built With</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-300">
            <div className="p-4 bg-white/5 rounded-lg">React 19</div>
            <div className="p-4 bg-white/5 rounded-lg">Vite</div>
            <div className="p-4 bg-white/5 rounded-lg">Tailwind CSS</div>
            <div className="p-4 bg-white/5 rounded-lg">Firebase</div>
            <div className="p-4 bg-white/5 rounded-lg">Framer Motion</div>
            <div className="p-4 bg-white/5 rounded-lg">Jamendo API</div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-yellow-400" size={28} />
            <h2 className="text-2xl font-bold text-white">Features</h2>
          </div>
          <ul className="space-y-4 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>500,000+ royalty-free tracks from independent artists</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>Create custom playlists and save your favorites</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>Discover music by genre, mood, and popularity</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>100% legal and free - no subscriptions required</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>Beautiful, responsive design with smooth animations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>High-quality audio streaming with no interruptions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>Support independent artists from around the world</span>
            </li>
          </ul>
        </motion.div>

        {/* Why Choose VMusic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-green-400" size={28} />
            <h2 className="text-2xl font-bold text-white">Why Choose VMusic?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">100% Legal & Free</h3>
              <p className="text-gray-400 text-sm">
                All tracks on VMusic are licensed under Creative Commons, ensuring 
                you can enjoy music without any legal concerns or subscription fees.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Support Artists</h3>
              <p className="text-gray-400 text-sm">
                By using VMusic, you help independent artists gain exposure and 
                grow their audience worldwide.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">No Ads, No Interruptions</h3>
              <p className="text-gray-400 text-sm">
                Enjoy uninterrupted music streaming without annoying advertisements 
                or forced breaks in your listening experience.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Discover Hidden Gems</h3>
              <p className="text-gray-400 text-sm">
                Find unique tracks and talented artists you won't hear on mainstream 
                platforms. Explore diverse genres and styles.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-linear-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Explore?</h2>
          <p className="text-gray-300 mb-6">
            Start discovering amazing music from independent artists around the world
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/explore')}
              className="px-8 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              Browse Music
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all"
            >
              Contact Us
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
