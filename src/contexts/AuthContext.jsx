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
      console.log('🎯 Token length:', credential.oauthAccessToken.length);
      
      // Store token in MongoDB for persistent access
      try {
        await usersAPI.syncUser(result.user.uid, {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          providerData: result.user.providerData,
          googleAccessToken: credential.oauthAccessToken,
          googleRefreshToken: credential.refreshToken || null
        });
        console.log('✅ Access token saved to MongoDB');
      } catch (error) {
        console.error('Failed to save access token:', error);
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
            if (userData?.googleAccessToken) {
              setGoogleAccessToken(userData.googleAccessToken);
              console.log('✅ Google access token restored from MongoDB');
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

  const value = {
    currentUser,
    signUp,
    signIn,
    signInWithGoogle,
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
