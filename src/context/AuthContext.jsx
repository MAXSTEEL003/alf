import React, { createContext, useState, useEffect, useContext } from 'react';
import { subscribeToAuthChanges, signIn, logOut } from '../firebase/auth';

const AuthContext = createContext(null);

// Rate limiting configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes window for attempts

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem('loginAttempts');
    return saved ? JSON.parse(saved) : { count: 0, firstAttempt: null, lockoutUntil: null };
  });

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
      setLoading(false);
      
      // Clear login attempts on successful login
      if (user) {
        const clearedAttempts = { count: 0, firstAttempt: null, lockoutUntil: null };
        setLoginAttempts(clearedAttempts);
        localStorage.removeItem('loginAttempts');
      }
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
    const now = Date.now();
    
    // Check if still in lockout period
    if (loginAttempts.lockoutUntil && now < loginAttempts.lockoutUntil) {
      return true;
    }
    
    // Clear expired lockout
    if (loginAttempts.lockoutUntil && now >= loginAttempts.lockoutUntil) {
      setLoginAttempts({ count: 0, firstAttempt: null, lockoutUntil: null });
      return false;
    }
    
    return false;
  };

  const getRemainingLockoutTime = () => {
    if (!loginAttempts.lockoutUntil) return 0;
    const remaining = loginAttempts.lockoutUntil - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000)); // Return seconds
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
      await signIn(email, password);
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
      await logOut();
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const value = {
    user,
    isAdmin: !!user,
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