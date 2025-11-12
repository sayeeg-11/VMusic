import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Hero, Features, Explore as ExploreLanding, HowItWorks, Footer } from '../components/landing';

const Landing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is a Firebase auth action (password reset, email verification, etc.)
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    if (mode === 'resetPassword' && oobCode) {
      // Redirect to reset password page with all parameters
      const params = new URLSearchParams(searchParams);
      navigate(`/reset-password?${params.toString()}`, { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div>
      <Hero />
      <Features />
      <ExploreLanding />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Landing;
