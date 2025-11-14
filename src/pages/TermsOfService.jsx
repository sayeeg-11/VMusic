import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Mail } from 'lucide-react';

const TermsOfService = () => {
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
              <ShieldCheck size={40} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-300 text-lg">
              Please read these Terms carefully before using VMusic.
            </p>
            <p className="text-gray-400 text-sm mt-2">Last Updated: Nov 12, 2025</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Section title="1. Acceptance of Terms" delay={0.1}>
          By accessing or using VMusic, you acknowledge that you have read, understood,
          and agree to be bound by these Terms of Service. If you do not agree, please
          discontinue use of the platform.
        </Section>

        <Section title="2. Use of the Service" delay={0.2}>
          <ul className="list-disc ml-6 space-y-2">
            <li>You must be at least 13 years old to use VMusic.</li>
            <li>
              You agree not to misuse the platform or attempt unauthorized access,
              reverse-engineering, scraping, or harmful activities.
            </li>
            <li>
              You may only use VMusic for lawful purposes and in compliance with
              applicable copyright laws.
            </li>
          </ul>
        </Section>

        <Section title="3. Google Login & YouTube API Usage" delay={0.3}>
          <p className="mb-3">
            When you sign in with Google, VMusic collects your name, email, and profile
            picture. This is used only to authenticate you and enhance your user
            experience.
          </p>
          <p className="mb-3">
            If you access YouTube-related features, we may temporarily access your:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>YouTube playlists</li>
            <li>Liked videos</li>
            <li>Subscriptions</li>
            <li>Public YouTube activity</li>
          </ul>

          <p className="mt-4">
            We DO NOT store or share any YouTube API data. All usage complies with:
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
            You may revoke access at any time at:{' '}
            <a
              href="https://myaccount.google.com/permissions"
              className="text-blue-400 underline"
            >
              https://myaccount.google.com/permissions
            </a>
          </p>
        </Section>

        <Section title="4. Intellectual Property" delay={0.4}>
          All music on VMusic comes from licensed or open sources such as Jamendo API.
          You may not copy, download, or distribute content unless explicitly permitted.
        </Section>

        <Section title="5. Limitation of Liability" delay={0.5}>
          VMusic is provided "as is" with no guarantees. We are not responsible for:
          <ul className="list-disc ml-6 mt-2 space-y-2">
            <li>Service interruptions</li>
            <li>Data loss</li>
            <li>Unauthorized access</li>
            <li>Third-party API limitations</li>
          </ul>
        </Section>

        <Section title="6. Account Termination" delay={0.6}>
          We may suspend or terminate accounts that violate these Terms or engage in
          harmful behavior.
        </Section>

        <Section title="7. Updates to Terms" delay={0.7}>
          We may modify these Terms at any time. Updates will appear on this page with
          a revised date.
        </Section>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-linear-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30 text-center"
        >
          <Mail className="text-blue-400 mx-auto mb-4" size={40} />
          <h2 className="text-2xl font-bold text-white mb-4">
            Need Help or Have Questions?
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

export default TermsOfService;
