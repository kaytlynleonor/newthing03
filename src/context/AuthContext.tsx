import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { isTestShopLogin } from '../lib/testCredentials';

const TEST_USER_SESSION_KEY = 'kl_test_user_session';

function createTestShopProfile(): UserProfile {
  const now = new Date().toISOString();
  return {
    uid: 'test-admin',
    email: 'admin@test.local',
    displayName: 'Test Admin',
    photoURL: null,
    createdAt: now,
    updatedAt: now,
    membershipTier: 'MAISON GOLD ATELIER VIP',
  };
}

function readTestShopProfile(): UserProfile | null {
  try {
    const raw = sessionStorage.getItem(TEST_USER_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

function persistTestShopProfile(profile: UserProfile | null) {
  if (profile) {
    sessionStorage.setItem(TEST_USER_SESSION_KEY, JSON.stringify(profile));
  } else {
    sessionStorage.removeItem(TEST_USER_SESSION_KEY);
  }
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
  addresses?: Array<{
    fullName: string;
    addressLine: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  }>;
  membershipTier?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [devProfile, setDevProfile] = useState<UserProfile | null>(() => readTestShopProfile());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setDevProfile(null);
        persistTestShopProfile(null);
        loadUserProfile(firebaseUser.uid, firebaseUser);
      } else {
        const testProfile = readTestShopProfile();
        setDevProfile(testProfile);
        setProfile(testProfile);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const loadUserProfile = async (uid: string, firebaseUser: User) => {
    try {
      const now = new Date().toISOString();
      const existing: UserProfile = {
        uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        createdAt: now,
        updatedAt: now,
        membershipTier: 'MAISON GOLD ATELIER VIP',
      };
      await setDoc(doc(db, 'users', uid), existing, { merge: true });
      setProfile(existing);
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  const signInAsTestShopUser = useCallback(() => {
    const testProfile = createTestShopProfile();
    setDevProfile(testProfile);
    setProfile(testProfile);
    persistTestShopProfile(testProfile);
    setAuthError(null);
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    if (isTestShopLogin(email, password)) {
      signInAsTestShopUser();
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const message = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : err.code === 'auth/user-not-found'
        ? 'No account found with that email.'
        : err.code === 'auth/wrong-password'
        ? 'Incorrect password.'
        : err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Try again later.'
        : err.message || 'Sign in failed.';
      setAuthError(message);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email,
        displayName,
        photoURL: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        membershipTier: 'MAISON GOLD ATELIER VIP',
      }, { merge: true });
    } catch (err: any) {
      const message = err.code === 'auth/email-already-in-use'
        ? 'An account with that email already exists.'
        : err.code === 'auth/weak-password'
        ? 'Password is too weak.'
        : err.code === 'auth/invalid-email'
        ? 'Invalid email address.'
        : err.message || 'Sign up failed.';
      setAuthError(message);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await loadUserProfile(result.user.uid, result.user);
    } catch (err: any) {
      setAuthError(err.message || 'Google sign in failed.');
      throw err;
    }
  };

  const signInWithFacebook = async () => {
    setAuthError(null);
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await loadUserProfile(result.user.uid, result.user);
    } catch (err: any) {
      setAuthError(err.message || 'Facebook sign in failed.');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setAuthError(err.code === 'auth/user-not-found' ? 'No account found with that email.' : err.message);
      throw err;
    }
  };

  const handleSignOut = async () => {
    setDevProfile(null);
    persistTestShopProfile(null);
    setProfile(null);
    await signOut(auth);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user signed in');
    await setDoc(doc(db, 'users', user.uid), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    setProfile(prev => prev ? { ...prev, ...data } : null);
  };

  const value: AuthContextType = {
    user,
    profile: user ? profile : devProfile,
    isAuthenticated: !!user || !!devProfile,
    isLoading,
    authError,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    resetPassword,
    signOut: handleSignOut,
    updateUserProfile,
    clearAuthError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};