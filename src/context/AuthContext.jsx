import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

// Rate limiting configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes window for attempts

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem('loginAttempts');
    return saved ? JSON.parse(saved) : { count: 0, firstAttempt: null, lockoutUntil: null };
  });

  // Check admin status by Firestore document existence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Check if /admins/{uid} document exists
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          setIsAdmin(adminDoc.exists());
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Save login attempts to localStorage whenever they change
  useEffect(() => {
    if (loginAttempts.count > 0 || loginAttempts.lockoutUntil) {
      localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));
    } else {
      localStorage.removeItem('loginAttempts');
    }
  }, [loginAttempts]);

  const isAccountLocked = () => {
    if (!loginAttempts.lockoutUntil) return false;
    
    const now = Date.now();
    if (now >= loginAttempts.lockoutUntil) {
      // Lockout period has expired, reset attempts
      setLoginAttempts({ count: 0, firstAttempt: null, lockoutUntil: null });
      return false;
    }
    
    return true;
  };

  const getRemainingLockoutTime = () => {
    if (!loginAttempts.lockoutUntil) return 0;
    return Math.max(0, Math.ceil((loginAttempts.lockoutUntil - Date.now()) / 1000));
  };

  const recordFailedAttempt = () => {
    const now = Date.now();
    
    // If first attempt or attempts are outside the window, reset
    if (!loginAttempts.firstAttempt || (now - loginAttempts.firstAttempt) > ATTEMPT_WINDOW) {
      setLoginAttempts({
        count: 1,
        firstAttempt: now,
        lockoutUntil: null
      });
      return;
    }
    
    const newCount = loginAttempts.count + 1;
    
    // If max attempts reached, initiate lockout
    if (newCount >= MAX_LOGIN_ATTEMPTS) {
      setLoginAttempts({
        count: newCount,
        firstAttempt: loginAttempts.firstAttempt,
        lockoutUntil: now + LOCKOUT_DURATION
      });
    } else {
      setLoginAttempts({
        count: newCount,
        firstAttempt: loginAttempts.firstAttempt,
        lockoutUntil: null
      });
    }
  };

  const login = async (email, password) => {
    // Check if account is locked
    if (isAccountLocked()) {
      const remainingTime = getRemainingLockoutTime();
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      
      throw new Error(`Account temporarily locked due to too many failed attempts. Try again in ${timeString}.`);
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Reset attempts on successful login
      setLoginAttempts({ count: 0, firstAttempt: null, lockoutUntil: null });
      return true;
    } catch (error) {
      console.error("Login error:", error);
      
      // Record failed attempt for rate limiting
      recordFailedAttempt();
      
      // Customize error message based on Firebase error
      let errorMessage = 'Failed to login. Please check your credentials.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      const customError = new Error(errorMessage);
      customError.code = error.code;
      throw customError;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const value = {
    user,
    isAdmin,
    loading,
    login,
    logout,
    loginAttempts: {
      count: loginAttempts.count,
      isLocked: isAccountLocked(),
      remainingLockoutTime: getRemainingLockoutTime(),
      maxAttempts: MAX_LOGIN_ATTEMPTS
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);