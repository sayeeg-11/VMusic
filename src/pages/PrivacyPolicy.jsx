import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Mail, UserCheck } from 'lucide-react';

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: [
        'Account information (name, email address) when you register',
        'Profile information you choose to provide',
        'Music preferences and listening history',
        'Device and browser information',
        'IP address and general location data',
      ],
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content: [
        'To provide and improve our music streaming services',
        'To personalize your music recommendations',
        'To communicate with you about your account',
        'To analyze usage patterns and improve user experience',
        'To prevent fraud and ensure platform security',
      ],
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: [
        'We use industry-standard encryption to protect your data',
        'All passwords are securely hashed and never stored in plain text',
        'Regular security audits and updates',
        'Secure data transmission using HTTPS/SSL',
        'Limited access to personal data by authorized personnel only',
      ],
    },
    {
      icon: UserCheck,
      title: 'Your Rights',
      content: [
        'Access your personal data at any time',
        'Request correction of inaccurate information',
        'Delete your account and associated data',
        'Export your data in a portable format',
        'Opt-out of marketing communications',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 via-gray-900 to-black pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
              <Shield size={40} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-300 text-lg">
              Your privacy is important to us. Learn how we collect, use, and protect your data.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Last Updated: November 12, 2025
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Welcome to VMusic's Privacy Policy. This policy describes how we collect, use, disclose, and safeguard 
            your information when you use our music streaming platform. We are committed to protecting your privacy 
            and ensuring you have a positive experience on our platform.
          </p>
          <p className="text-gray-300 leading-relaxed">
            By using VMusic, you agree to the collection and use of information in accordance with this policy. 
            If you do not agree with our policies and practices, please do not use our service.
          </p>
        </motion.div>

        {/* Main Sections */}
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-blue-600/20 to-indigo-600/20 rounded-lg flex items-center justify-center">
                <section.icon className="text-blue-400" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">{section.title}</h2>
            </div>
            <ul className="space-y-3">
              {section.content.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-300">
                  <span className="text-blue-400 font-bold mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        {/* Third Party Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            VMusic uses the following third-party services that may collect information:
          </p>
          <div className="space-y-3 text-gray-300">
            <div>
              <strong className="text-white">Firebase (Google):</strong> For authentication and data storage
            </div>
            <div>
              <strong className="text-white">Jamendo API:</strong> For music content and streaming
            </div>
            <div>
              <strong className="text-white">EmailJS:</strong> For contact form submissions
            </div>
          </div>
        </motion.div>

        {/* Cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Cookies and Tracking</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
            Cookies are files with small amount of data which may include an anonymous unique identifier.
          </p>
          <p className="text-gray-300 leading-relaxed">
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
            However, if you do not accept cookies, you may not be able to use some portions of our service.
          </p>
        </motion.div>

        {/* Children's Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
          <p className="text-gray-300 leading-relaxed">
            Our service is not intended for children under the age of 13. We do not knowingly collect personally 
            identifiable information from children under 13. If you are a parent or guardian and you are aware 
            that your child has provided us with personal information, please contact us.
          </p>
        </motion.div>

        {/* Changes to Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Changes to This Privacy Policy</h2>
          <p className="text-gray-300 leading-relaxed">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
            the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review 
            this Privacy Policy periodically for any changes.
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="bg-linear-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30 text-center"
        >
          <Mail className="text-blue-400 mx-auto mb-4" size={40} />
          <h2 className="text-2xl font-bold text-white mb-4">Questions About Privacy?</h2>
          <p className="text-gray-300 mb-6">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Contact Us
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
