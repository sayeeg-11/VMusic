import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Hero,
  Features,
  Explore as ExploreLanding,
  HowItWorks,
  YouTubeSection,
  Footer,
} from '../components/landing';
import { SignIn, SignUp } from '../components/auth';

const Landing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

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
      <Features onOpenSignIn={() => setShowSignIn(true)} />
      <ExploreLanding />
      <HowItWorks />
      <YouTubeSection />
      <Footer onOpenSignIn={() => setShowSignIn(true)} />

      {showSignIn && (
        <SignIn
          onClose={() => setShowSignIn(false)}
          onSwitchToSignUp={() => {
            setShowSignIn(false);
            setShowSignUp(true);
          }}
        />
      )}

      {showSignUp && (
        <SignUp
          onClose={() => setShowSignUp(false)}
          onSwitchToSignIn={() => {
            setShowSignUp(false);
            setShowSignIn(true);
          }}
        />
      )}
    </div>
  );
};

export default Landing;
