import { motion } from 'framer-motion';
import { UserPlus, Search as SearchIcon, ListMusic, Music2, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Sign Up / Log In',
    description: 'Create your free account with email or Google. Connect Spotify for enhanced features and personalized recommendations.',
    gradient: 'from-purple-500 to-pink-500',
    badge: 'Free Forever',
  },
  {
    icon: SearchIcon,
    number: '02',
    title: 'Discover Music',
    description: 'Browse 500,000+ royalty-free tracks from Jamendo. Access millions of Spotify previews (30s) as guest or full library when logged in.',
    gradient: 'from-blue-500 to-cyan-500',
    badge: 'Dual Source',
  },
  {
    icon: ListMusic,
    number: '03',
    title: 'Save & Create Playlists',
    description: 'Like your favorites, create custom playlists, and sync across all your devices. Get AI-powered recommendations.',
    gradient: 'from-green-500 to-emerald-500',
    badge: 'Smart Playlists',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Get started with VMusic in three simple steps. Access millions of tracks and discover your next favorite song.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-200 via-blue-200 to-green-200 dark:from-purple-900 dark:via-blue-900 dark:to-green-900 transform -translate-y-1/2 -z-10"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative"
                >
                  {/* Card */}
                  <div className="relative bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-transparent hover:shadow-2xl transition-all duration-300 group">
                    {/* Gradient Border Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${step.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl`}></div>

                    {/* Step Number */}
                    <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center text-3xl font-bold text-gray-300 dark:text-gray-600 border-4 border-gray-200 dark:border-gray-700 shadow-lg">
                      {step.number}
                    </div>

                    {/* Icon with Badge */}
                    <div className="relative inline-block">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className={`inline-flex p-6 rounded-2xl bg-gradient-to-r ${step.gradient} mb-6 mt-4`}
                      >
                        <Icon className="text-white" size={36} />
                      </motion.div>
                      {step.badge && (
                        <span className="absolute -top-2 -right-2 px-2 py-1 bg-white dark:bg-gray-900 text-xs font-bold text-gray-900 dark:text-white rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                          {step.badge}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Arrow for desktop */}
                    {index < steps.length - 1 && (
                      <motion.div
                        className="hidden lg:block absolute top-1/2 -right-12 transform -translate-y-1/2"
                        animate={{ x: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 48 48"
                          fill="none"
                          className="text-gray-300 dark:text-gray-700"
                        >
                          <path
                            d="M20 12L32 24L20 36"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
