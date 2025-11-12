import { motion } from 'framer-motion';
import { FileText, AlertTriangle, CheckCircle, XCircle, Scale, Shield } from 'lucide-react';

const TermsOfService = () => {
  const sections = [
    {
      icon: CheckCircle,
      title: 'Acceptance of Terms',
      content: `By accessing and using VMusic, you accept and agree to be bound by these Terms of Service. 
      If you do not agree to these terms, please do not use our service. We reserve the right to update 
      these terms at any time, and your continued use of the service constitutes acceptance of any changes.`,
    },
    {
      icon: Shield,
      title: 'User Accounts',
      content: `You may need to create an account to access certain features. You are responsible for maintaining 
      the confidentiality of your account credentials and for all activities that occur under your account. 
      You must provide accurate and complete information when creating an account. You must be at least 13 years 
      old to use VMusic.`,
    },
    {
      icon: Scale,
      title: 'License and Usage Rights',
      content: `VMusic grants you a limited, non-exclusive, non-transferable license to access and use our service 
      for personal, non-commercial purposes. All music content is provided through Jamendo API and is subject to 
      Creative Commons licenses. You may not reproduce, distribute, modify, or create derivative works without 
      proper authorization.`,
    },
    {
      icon: AlertTriangle,
      title: 'Prohibited Activities',
      content: `You agree not to: (a) use the service for any illegal purpose; (b) attempt to gain unauthorized 
      access to our systems; (c) interfere with or disrupt the service; (d) upload malicious code or content; 
      (e) impersonate others or provide false information; (f) scrape or harvest data from the service; 
      (g) use automated tools to access the service.`,
    },
  ];

  const additionalTerms = [
    {
      title: 'Content Ownership',
      points: [
        'All music content is provided by Jamendo and licensed under Creative Commons',
        'VMusic does not claim ownership of any music or user-generated content',
        'Users retain ownership of any playlists or favorites they create',
        'We may use aggregated, anonymized data for analytics and improvements',
      ],
    },
    {
      title: 'Service Availability',
      points: [
        'We strive to provide uninterrupted service but cannot guarantee 100% uptime',
        'Scheduled maintenance may require temporary service interruptions',
        'We reserve the right to modify or discontinue features at any time',
        'Third-party services (Jamendo, Firebase) availability may affect our service',
      ],
    },
    {
      title: 'Intellectual Property',
      points: [
        'VMusic logo, design, and original content are our intellectual property',
        'You may not use our trademarks without written permission',
        'Music content rights belong to respective artists and licensors',
        'Fair use of content for personal purposes is permitted under Creative Commons',
      ],
    },
    {
      title: 'User Responsibilities',
      points: [
        'Respect the rights of artists and other users',
        'Do not share account credentials with others',
        'Report any bugs, security issues, or inappropriate content',
        'Keep your contact information up to date',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 via-gray-900 to-black pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-r from-purple-600 to-indigo-600 rounded-full mb-6">
              <FileText size={40} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-300 text-lg">
              Please read these terms carefully before using VMusic
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
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to VMusic</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            These Terms of Service ("Terms") govern your access to and use of VMusic's music streaming platform, 
            including our website, mobile applications, and all related services (collectively, the "Service").
          </p>
          <p className="text-gray-300 leading-relaxed">
            By using VMusic, you agree to comply with these Terms. Please read them carefully. If you do not 
            agree with any part of these Terms, you must not use our Service.
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
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-linear-to-br from-purple-600/20 to-indigo-600/20 rounded-lg flex items-center justify-center shrink-0">
                <section.icon className="text-purple-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">{section.title}</h2>
                <p className="text-gray-300 leading-relaxed">{section.content}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Additional Terms Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {additionalTerms.map((term, index) => (
            <motion.div
              key={term.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <h3 className="text-xl font-bold text-white mb-4">{term.title}</h3>
              <ul className="space-y-3">
                {term.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300 text-sm">
                    <span className="text-purple-400 font-bold mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-white/10"
        >
          <div className="flex items-start gap-4">
            <XCircle className="text-red-400 shrink-0 mt-1" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Disclaimer of Warranties</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                VMusic is provided "as is" and "as available" without warranties of any kind, either express or implied. 
                We do not warrant that the service will be uninterrupted, secure, or error-free.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We are not responsible for any damages arising from the use or inability to use our service, including 
                but not limited to direct, indirect, incidental, or consequential damages.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Limitation of Liability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            To the maximum extent permitted by law, VMusic shall not be liable for any indirect, incidental, special, 
            consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Our total liability for any claims related to the service shall not exceed the amount you paid us in the 
            past 12 months (which is $0 for free services).
          </p>
        </motion.div>

        {/* Termination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Termination</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We may terminate or suspend your account and access to the service immediately, without prior notice or 
            liability, for any reason, including if you breach these Terms.
          </p>
          <p className="text-gray-300 leading-relaxed">
            You may terminate your account at any time by contacting us or using the account deletion feature in 
            your profile settings. Upon termination, your right to use the service will immediately cease.
          </p>
        </motion.div>

        {/* Governing Law */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Governing Law</h2>
          <p className="text-gray-300 leading-relaxed">
            These Terms shall be governed by and construed in accordance with applicable laws. Any disputes 
            arising from these Terms or your use of the service shall be resolved through binding arbitration, 
            except where prohibited by law.
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="bg-linear-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 text-center"
        >
          <FileText className="text-purple-400 mx-auto mb-4" size={40} />
          <h2 className="text-2xl font-bold text-white mb-4">Questions About These Terms?</h2>
          <p className="text-gray-300 mb-6">
            If you have any questions about our Terms of Service, please don't hesitate to reach out.
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Contact Us
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
