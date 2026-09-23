import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

const AuthContext = createContext(null);

const DEMO_USER_KEY = 'drishti_ai_demo_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedDemoUser = localStorage.getItem(DEMO_USER_KEY);
      if (savedDemoUser) {
        return JSON.parse(savedDemoUser);
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [isDemoMode, setIsDemoMode] = useState(!isFirebaseConfigured || Boolean(localStorage.getItem(DEMO_USER_KEY)));

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const mappedUser = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Healthcare Worker',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || '',
          role: 'ASHA Health Worker',
          center: 'Rural Health Sub-Centre, Maharashtra',
          isDemo: false,
        };
        setUser(mappedUser);
        setIsDemoMode(false);
        try {
          localStorage.removeItem(DEMO_USER_KEY);
        } catch {}
      } else {
        // If not authenticated via Firebase, check if demo user was logged in
        const savedDemo = localStorage.getItem(DEMO_USER_KEY);
        if (savedDemo) {
          try {
            setUser(JSON.parse(savedDemo));
            setIsDemoMode(true);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const mapped = {
          uid: result.user.uid,
          displayName: result.user.displayName || 'Healthcare Worker',
          email: result.user.email || '',
          photoURL: result.user.photoURL || '',
          role: 'ASHA Health Worker',
          center: 'Rural Health Sub-Centre, Wardha',
          isDemo: false,
        };
        setUser(mapped);
        setIsDemoMode(false);
        return mapped;
      } catch (err) {
        console.error('Firebase Google Auth error:', err);
        throw err;
      }
    } else {
      throw new Error('Firebase Auth is not initialized. Please verify configuration.');
    }
  };

  const loginWithDemo = (customName = 'Priya Sharma', customDetails = {}) => {
    const demoUser = {
      uid: 'demo-asha-worker-001',
      displayName: typeof customName === 'string' ? customName : 'Priya Sharma',
      email: customDetails.email || 'asha.worker.priya@drishtiai.in',
      photoURL: '',
      role: customDetails.role || 'Lead ASHA Health Worker',
      center: customDetails.center || 'Primary Health Sub-Centre, Koregaon',
      workerId: customDetails.workerId || 'MH-2026-ASHA-042',
      village: customDetails.village || 'Koregaon, Rahimatpur',
      device: customDetails.device || 'Remidio FundusCam v2.1',
      phone: customDetails.phone || '+91 98765 43210',
      isDemo: true,
      ...customDetails,
    };
    try {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    } catch {}
    setUser(demoUser);
    setIsDemoMode(true);
    return demoUser;
  };

  const updateProfile = (updatedFields) => {
    setUser((prev) => {
      const base = prev || {
        uid: 'demo-asha-worker-001',
        displayName: 'Priya Sharma',
        email: 'asha.worker.priya@drishtiai.in',
        photoURL: '',
        role: 'Lead ASHA Health Worker',
        center: 'Primary Health Sub-Centre, Koregaon',
        workerId: 'MH-2026-ASHA-042',
        village: 'Koregaon, Rahimatpur',
        device: 'Remidio FundusCam v2.1',
        phone: '+91 98765 43210',
        isDemo: true,
      };
      const updated = { ...base, ...updatedFields };
      try {
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const logout = async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    try {
      localStorage.removeItem(DEMO_USER_KEY);
    } catch {}
    setUser(null);
    setIsDemoMode(!isFirebaseConfigured);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        loginWithGoogle,
        loginWithDemo,
        updateProfile,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
