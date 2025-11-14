import { motion } from 'framer-motion';
import { Shield, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
  const Section = ({ title, children, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/10"
    >
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="text-gray-300 leading-relaxed">{children}</div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 via-gray-900 to-black pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
              <Shield size={40} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-300 text-lg">
              Learn how VMusic collects, uses, and protects your data.
            </p>
            <p className="text-gray-400 text-sm mt-2">Last Updated: Nov 12, 2025</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* INTRODUCTION */}
        <Section title="Introduction" delay={0.1}>
          Welcome to VMusic. This Privacy Policy explains how we collect, use, store,
          and protect your information when you use our service. By using VMusic, you
          agree to the practices outlined in this policy.
        </Section>

        {/* INFORMATION WE COLLECT */}
        <Section title="1. Information We Collect" delay={0.2}>
          <p className="mb-3">We collect the following categories of information:</p>

          <ul className="list-disc ml-6 space-y-2">
            <li>
              <strong className="text-white">Google Account Data:</strong> your name,
              email address, and profile picture (via Google OAuth).
            </li>
            <li>
              <strong className="text-white">YouTube API Data:</strong> playlists, liked
              videos, subscriptions, or public activity (only if you grant permission).
            </li>
            <li>
              <strong className="text-white">Usage Data:</strong> search queries,
              listening activity, and interactions inside the app.
            </li>
            <li>
              <strong className="text-white">Technical Data:</strong> device type,
              browser, operating system, IP address.
            </li>
            <li>
              <strong className="text-white">Cookies:</strong> used for authentication
              and user sessions.
            </li>
          </ul>
        </Section>

        {/* HOW WE USE YOUR DATA */}
        <Section title="2. How We Use Your Information" delay={0.3}>
          We use your data to:
          <ul className="list-disc ml-6 mt-2 space-y-2">
            <li>Authenticate you using Google Login</li>
            <li>Personalize music experience and recommendations</li>
            <li>Load your YouTube playlists or activity (if permitted)</li>
            <li>Improve app performance and security</li>
            <li>Communicate account-related updates</li>
          </ul>

          <p className="mt-4 text-gray-300">
            <strong className="text-white">We never sell or share your personal data.</strong>
          </p>
        </Section>

        {/* DATA SECURITY */}
        <Section title="3. Data Security" delay={0.4}>
          <ul className="list-disc ml-6 space-y-2">
            <li>HTTPS/SSL encryption for all communication</li>
            <li>Secure password hashing (if applicable)</li>
            <li>Limited access to personal data</li>
            <li>Regular security audits and monitoring</li>
          </ul>
        </Section>

        {/* YOUTUBE API COMPLIANCE */}
        <Section title="4. YouTube API Data Compliance" delay={0.5}>
          <p className="mb-3">
            VMusic uses YouTube API Services in compliance with Google policies.
          </p>

          <p className="mb-3">
            We DO NOT store, share, or sell any YouTube data you provide access to.
            Data is only displayed inside the app to enhance your music experience.
          </p>

          <p>
            You agree to Google policies:
            <br />
            <a href="https://policies.google.com/privacy" className="text-blue-400 underline">
              Google Privacy Policy
            </a>
            <br />
            <a href="https://www.youtube.com/t/terms" className="text-blue-400 underline">
              YouTube Terms of Service
            </a>
          </p>

          <p className="mt-3">
            You may revoke access anytime at:{' '}
            <a
              href="https://myaccount.google.com/permissions"
              className="text-blue-400 underline"
            >
              https://myaccount.google.com/permissions
            </a>
          </p>
        </Section>

        {/* THIRD-PARTY SERVICES */}
        <Section title="5. Third-Party Services" delay={0.6}>
          VMusic uses the following services:
          <ul className="list-disc ml-6 mt-2 space-y-2">
            <li><strong className="text-white">Firebase:</strong> authentication & database</li>
            <li><strong className="text-white">Jamendo API:</strong> music content</li>
            <li><strong className="text-white">EmailJS:</strong> sending contact form emails</li>
          </ul>
        </Section>

        {/* CHILDREN PRIVACY */}
        <Section title="6. Children's Privacy" delay={0.7}>
          VMusic is not intended for children under 13. We do not knowingly collect data
          from children. Contact us if such data was submitted.
        </Section>

        {/* DATA DELETION */}
        <Section title="7. Data Deletion" delay={0.8}>
          You may request deletion of your account and all associated data by emailing
          us at:
          <br /><br />
          <span className="text-white font-semibold">baraiyavishalbhai32@gmail.com</span>
          <br /><br />
          We will delete your data within 48 hours.
        </Section>

        {/* UPDATES */}
        <Section title="8. Updates to This Policy" delay={0.9}>
          We may update this Privacy Policy. Updates will appear on this page with a new
          "Last Updated" date.
        </Section>

        {/* CONTACT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-linear-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30 text-center"
        >
          <Mail className="text-blue-400 mx-auto mb-4" size={40} />
          <h2 className="text-2xl font-bold text-white mb-4">
            Questions About This Privacy Policy?
          </h2>
          <p className="text-gray-300 mb-6">
            Contact us anytime at:
          </p>
          <a
            href="mailto:baraiyavishalbhai32@gmail.com"
            className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Email Support
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
