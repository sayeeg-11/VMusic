import { motion } from 'framer-motion';
import { UserPlus, Youtube, ListMusic, Play, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Sign Up / Log In',
    description:
      'Create your free account with email or Google. Quick and easy setup to get started with VMusic.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Youtube,
    number: '02',
    title: 'Connect YouTube',
    description:
      'Click "Connect with Google" in VibeTube. Authorize VMusic to access your YouTube playlists. One-time setup, instant access.',
    gradient: 'from-red-500 to-pink-500',
  },
  {
    icon: ListMusic,
    number: '03',
    title: 'Import Playlists',
    description:
      'All your YouTube playlists automatically appear in VMusic. Browse, search, and organize your collections seamlessly.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Play,
    number: '04',
    title: 'Play Anywhere',
    description:
      'Stream your YouTube playlists directly in VMusic. No switching apps. Enjoy all your music in one place, ad-free.',
    gradient: 'from-green-500 to-emerald-500',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-gray-950">
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
            Import Your YouTube Playlists
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Get started with VMusic in four simple steps. Connect your YouTube account and access
            all your playlists instantly.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
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
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${step.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl`}
                    ></div>

                    {/* Step Number */}
                    <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center text-3xl font-bold text-gray-300 dark:text-gray-600 border-4 border-gray-200 dark:border-gray-700 shadow-lg">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="relative inline-block">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className={`inline-flex p-6 rounded-2xl bg-gradient-to-r ${step.gradient} mb-6 mt-4`}
                      >
                        <Icon className="text-white" size={36} />
                      </motion.div>
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
