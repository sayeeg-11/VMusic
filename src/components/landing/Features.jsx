import { motion } from 'framer-motion';
import {
  Search,
  Heart,
  Radio,
  Smartphone,
  Cloud,
  Sparkles,
  Youtube,
  Download,
  ListMusic,
  Lightbulb,
} from 'lucide-react';

const features = [
  {
    icon: Youtube,
    title: 'YouTube Playlist Import',
    description:
      'Connect with Google and instantly import all your YouTube playlists. Play them directly in VMusic!',
    gradient: 'from-red-500 to-pink-500',
    featured: true,
  },
  {
    icon: Lightbulb,
    title: 'Personalized Recommendations',
    description:
      'Discover songs tailored to your listening history, mood, and favorite genres using smart recommendation technology.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Search,
    title: 'Powerful Search',
    description:
      'Instantly find any song, artist, or album from our massive library powered by Jamendo API.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Heart,
    title: 'Like & Save',
    description:
      'Create custom playlists, save your favorite tracks, and organize your music library.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Radio,
    title: 'Smart Radio',
    description:
      'Discover new music with mood-based radio stations. Chill, Focus, Workout, and more.',
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    icon: Cloud,
    title: 'Cloud Sync',
    description:
      'Access your playlists and favorites from any device. Everything syncs seamlessly.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Sparkles,
    title: 'Ad-Free Forever',
    description:
      'No ads, no interruptions, no premium tiers. Just pure music streaming for everyone.',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

const Features = ({ onOpenSignIn }) => {
  return (
    <section className="py-20 px-4 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Why Choose VMusic?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Experience the future of independent music streaming with powerful features designed for
            music lovers.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isFeatured = feature.featured;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`group relative ${isFeatured ? 'md:col-span-2 lg:col-span-3' : ''}`}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl -z-10"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                  }}
                ></div>

                <div
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border ${
                    isFeatured
                      ? 'border-purple-500/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 p-10 cursor-pointer'
                      : 'border-gray-100 dark:border-gray-700 p-8'
                  } h-full`}
                  onClick={isFeatured && onOpenSignIn ? () => onOpenSignIn() : undefined}
                >
                  {isFeatured && (
                    <div className="absolute top-4 right-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles size={12} />
                      NEW FEATURE
                    </div>
                  )}

                  <div className={isFeatured ? 'flex flex-col md:flex-row items-center gap-8' : ''}>
                    {/* Icon */}
                    <div
                      className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.gradient} ${
                        isFeatured ? 'mb-0 md:w-24 md:h-24 items-center justify-center' : 'mb-6'
                      }`}
                    >
                      <Icon className="text-white" size={isFeatured ? 40 : 28} />
                    </div>

                    {/* Content */}
                    <div className={isFeatured ? 'flex-1 text-center md:text-left' : ''}>
                      <h3
                        className={`font-bold mb-3 text-gray-900 dark:text-white ${
                          isFeatured ? 'text-3xl md:text-4xl' : 'text-xl'
                        }`}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className={`text-gray-600 dark:text-gray-400 leading-relaxed ${
                          isFeatured ? 'text-lg md:text-xl' : ''
                        }`}
                      >
                        {feature.description}
                      </p>

                      {isFeatured && (
                        <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
                          <span className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-full text-sm font-semibold">
                            <Download size={16} />
                            Instant Import
                          </span>
                          <span className="flex items-center gap-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-4 py-2 rounded-full text-sm font-semibold">
                            <ListMusic size={16} />
                            All Playlists
                          </span>
                          <span className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-semibold">
                            <Sparkles size={16} />
                            One Click
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-2xl`}
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
      </div>
    </section>
  );
};

export default Features;
