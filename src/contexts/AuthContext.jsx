import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { usersAPI } from '../api/users';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState(null); // Store Google OAuth token for YouTube API

  // Create user document in Firestore
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const { email, displayName, photoURL } = user;
        const createdAt = new Date();

        try {
          await setDoc(userRef, {
            email,
            displayName,
            photoURL,
            createdAt,
            likedTracks: [],
            playlists: [],
            ...additionalData,
          });
        } catch (error) {
          console.error('Error creating user document:', error);
        }
      }

      // Sync user to MongoDB
      try {
        await usersAPI.syncUser(user.uid, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          providerData: user.providerData
        });
        console.log('✅ User synced to MongoDB');
      } catch (mongoError) {
        console.error('MongoDB sync error:', mongoError);
        // Continue even if MongoDB sync fails
      }

      return userRef;
    } catch (error) {
      // Handle offline or network errors gracefully (silently)
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        // Firestore is offline - this is normal and will sync when online
        return null;
      } else {
        console.error('Error accessing user document:', error);
      }
      return null;
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    await createUserDocument(userCredential.user, { displayName });
    
    return userCredential;
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Sync user to MongoDB on sign in
    try {
      await usersAPI.syncUser(userCredential.user.uid, {
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        providerData: userCredential.user.providerData
      });
      console.log('✅ User synced to MongoDB on sign in');
    } catch (mongoError) {
      console.error('MongoDB sync error on sign in:', mongoError);
      // Continue even if MongoDB sync fails
    }
    
    return userCredential;
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    
    console.log('🔍 Google Sign-In Result:', {
      hasTokenResponse: !!result._tokenResponse,
      hasOAuthAccessToken: !!result._tokenResponse?.oauthAccessToken,
      tokenPreview: result._tokenResponse?.oauthAccessToken?.substring(0, 30)
    });
    
    // Get Google OAuth access token for YouTube API
    const credential = result._tokenResponse;
    if (credential?.oauthAccessToken) {
      setGoogleAccessToken(credential.oauthAccessToken);
      console.log('✅ Google access token obtained for YouTube API');
      
      // Calculate token expiration time (Google tokens expire in 1 hour)
      const expiresAt = Date.now() + (3600 * 1000); // 1 hour from now
      
      // Extract refresh token (only available on first consent or when prompt=consent)
      const refreshToken = credential.refreshToken || null;
      if (refreshToken) {
        console.log('✅ Refresh token obtained (will never expire)');
      } else {
        console.warn('⚠️ No refresh token in response. May need to revoke app permissions and sign in again.');
      }
      
      // Store token in MongoDB for persistent access
      try {
        await usersAPI.syncUser(result.user.uid, {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          providerData: result.user.providerData,
          googleAccessToken: credential.oauthAccessToken,
          googleRefreshToken: refreshToken, // Store refresh token
          tokenExpiresAt: expiresAt
        });
        console.log('✅ Access token and refresh token saved to MongoDB');
      } catch (error) {
        console.error('Failed to save tokens:', error);
      }
    } else {
      console.error('❌ No OAuth access token in response!');
      console.error('Token response keys:', Object.keys(credential || {}));
    }
    
    await createUserDocument(result.user);
    return result;
  };

  // Sign out
  const logout = () => {
    return signOut(auth);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          await createUserDocument(user);
          
          // Try to restore Google access token from MongoDB
          try {
            const userData = await usersAPI.getUser(user.uid);
            // Token restored from MongoDB
            
            if (userData?.googleAccessToken) {
              // Check if token is expired
              const isExpired = userData.tokenExpiresAt && Date.now() > userData.tokenExpiresAt;
              
              if (isExpired) {
                console.warn('⚠️ Token has expired. Attempting auto-refresh...');
                
                // Try to auto-refresh using refresh token
                try {
                  const newToken = await autoRefreshToken(user.uid);
                  console.log('✅ Token auto-refreshed on startup');
                } catch (refreshError) {
                  console.error('❌ Auto-refresh failed:', refreshError);
                  setGoogleAccessToken(null);
                }
              } else {
                setGoogleAccessToken(userData.googleAccessToken);
                console.log('✅ Google access token restored from MongoDB');
              }
            } else {
              console.warn('⚠️ No token found in MongoDB - user needs to sign in with Google again');
            }
          } catch (error) {
            console.error('Failed to restore access token:', error);
          }
        } else {
          setGoogleAccessToken(null);
        }
        setCurrentUser(user);
      } catch (error) {
        // Silently handle auth state change errors
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Auto-refresh token using refresh token (no popup needed!)
  const autoRefreshToken = async (userId) => {
    try {
      console.log('🔄 Auto-refreshing token using refresh token...');
      
      const response = await fetch('/api/refresh-google-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to refresh token');
      }

      const data = await response.json();
      setGoogleAccessToken(data.accessToken);
      console.log('✅ Token auto-refreshed successfully (no popup needed!)');
      
      return data.accessToken;
    } catch (error) {
      console.error('❌ Auto-refresh failed:', error);
      throw error;
    }
  };

  // Refresh Google Authentication (manual re-auth with popup)
  const refreshGoogleAuth = async () => {
    if (!currentUser) {
      throw new Error('No user signed in');
    }
    
    // Try automatic refresh first (using refresh token)
    try {
      console.log('🔄 Attempting automatic token refresh...');
      const newToken = await autoRefreshToken(currentUser.uid);
      return newToken;
    } catch (autoRefreshError) {
      console.warn('⚠️ Automatic refresh failed, falling back to popup:', autoRefreshError.message);
    }
    
    // Fallback: Show Google sign-in popup
    const result = await signInWithPopup(auth, googleProvider);
    
    // Get new Google OAuth access token
    const credential = result._tokenResponse;
    if (credential?.oauthAccessToken) {
      setGoogleAccessToken(credential.oauthAccessToken);
      console.log('✅ Google access token refreshed successfully');
      
      // Calculate token expiration time (Google tokens expire in 1 hour)
      const expiresAt = Date.now() + (3600 * 1000); // 1 hour from now
      
      // Update token in MongoDB
      try {
        await usersAPI.syncUser(result.user.uid, {
          email: result.user.email,
          displayName: result.user.displayName,
          googleAccessToken: credential.oauthAccessToken,
          tokenExpiresAt: expiresAt
        });
        console.log('✅ Refreshed token saved to MongoDB');
      } catch (mongoError) {
        console.error('MongoDB sync error on token refresh:', mongoError);
        // Continue even if MongoDB sync fails
      }
      
      return credential.oauthAccessToken;
    } else {
      throw new Error('Failed to obtain access token');
    }
  };

  const value = {
    currentUser,
    signUp,
    signIn,
    signInWithGoogle,
    refreshGoogleAuth,
    autoRefreshToken,
    logout,
    loading,
    googleAccessToken, // Expose access token for YouTube API calls
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
