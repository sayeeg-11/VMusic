import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Configure action code settings for password reset
      const actionCodeSettings = {
        url: window.location.origin + '/',
        handleCodeInApp: false,
      };

      console.log('Sending password reset email to:', email);
      console.log('Action code settings:', actionCodeSettings);
      console.log('Auth domain:', auth.config.authDomain);
      
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      
      console.log('Password reset email sent successfully');
      console.log('✅ Email should arrive within 5-10 minutes');
      console.log('⚠️ Check your spam/junk folder!');
      
      setMessage(`Password reset email sent to ${email}! Please check your inbox and spam folder. The link expires in 1 hour.`);
      setEmail('');
    } catch (err) {
      console.error('❌ Password reset error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      console.error('Full error:', JSON.stringify(err, null, 2));
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address. Please check the email or sign up.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait a few minutes and try again.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized. Please add it to Firebase Console.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Back to Home Link */}
        <Link to="/">
          <motion.button
            whileHover={{ x: -5 }}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </motion.button>
        </Link>

        {/* Card */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl p-8 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Mail size={32} className="text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
            <p className="text-gray-400 text-sm">
              No worries! Enter your email and we'll send you a reset link.
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6 flex items-start gap-3"
            >
              <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-400 text-sm font-medium">{message}</p>
                <p className="text-green-400/70 text-xs mt-1">
                  If you don't see the email, check your spam folder.
                </p>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3"
            >
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Remember your password?{' '}
              <Link to="/" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm space-y-3"
        >
          <div className="flex items-start gap-2">
            <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-xs">
              <strong className="text-gray-300">Not receiving emails?</strong> Here's what to check:
            </p>
          </div>
          
          <ul className="text-gray-400 text-xs space-y-2 ml-6">
            <li>✉️ Check your <strong className="text-gray-300">spam/junk folder</strong></li>
            <li>📧 Look for email from <strong className="text-gray-300">noreply@vmusic-7806a.firebaseapp.com</strong></li>
            <li>⏰ Wait 5-10 minutes (sometimes emails are delayed)</li>
            <li>📱 Check all Gmail tabs (Promotions, Social, Updates)</li>
            <li>🔍 Search your inbox for "VMusic" or "Reset password"</li>
            <li>⚙️ Make sure the email <strong className="text-gray-300">{email || 'you entered'}</strong> is correct</li>
          </ul>
          
          <div className="pt-2 border-t border-white/10">
            <p className="text-gray-500 text-xs">
              💡 The reset link expires in <strong className="text-gray-400">1 hour</strong>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
