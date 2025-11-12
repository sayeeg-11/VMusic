import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthAction = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    const apiKey = searchParams.get('apiKey');
    const continueUrl = searchParams.get('continueUrl');
    const lang = searchParams.get('lang');

    // Build the query string for the reset password page
    const params = new URLSearchParams();
    if (oobCode) params.set('oobCode', oobCode);
    if (apiKey) params.set('apiKey', apiKey);
    if (continueUrl) params.set('continueUrl', continueUrl);
    if (lang) params.set('lang', lang);

    if (mode === 'resetPassword') {
      // Redirect to reset password page with all parameters
      navigate(`/reset-password?${params.toString()}`, { replace: true });
    } else if (mode === 'verifyEmail') {
      // Handle email verification if needed in the future
      navigate(`/verify-email?${params.toString()}`, { replace: true });
    } else {
      // Unknown mode, redirect to home
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Redirecting...</p>
      </div>
    </div>
  );
};

export default AuthAction;
