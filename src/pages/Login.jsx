import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail, sanitizeString, checkRateLimit } from '../utils/validation';
import '../styles/login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAttempts } = useAuth();
  
  const from = location.state?.from?.pathname || '/admin';

  // Countdown timer for lockout period
  useEffect(() => {
    let interval;
    if (loginAttempts.isLocked && loginAttempts.remainingLockoutTime > 0) {
      setCountdown(loginAttempts.remainingLockoutTime);
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loginAttempts.isLocked, loginAttempts.remainingLockoutTime]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Client-side validation
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error);
      }
      
      // Basic password validation
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      if (password.length > 128) {
        throw new Error('Password is too long');
      }
      
      // Rate limiting check (additional client-side protection)
      const rateLimitCheck = checkRateLimit(`login_${email}`, 3, 60000); // 3 attempts per minute per email
      if (!rateLimitCheck.allowed) {
        throw new Error(rateLimitCheck.error);
      }
      
      // Sanitize inputs
      const sanitizedEmail = emailValidation.sanitized;
      const sanitizedPassword = sanitizeString(password);
      
      await login(sanitizedEmail, sanitizedPassword);
      
      // Clear form on successful login
      setEmail('');
      setPassword('');
      
      navigate(from, { replace: true });
    } catch (error) {
      setError(error.message || 'Failed to login. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page animate-fade-in">
      <h2>Admin Login</h2>
      <div className="login-card">
        <form onSubmit={handleSubmit} className="form">
          {error && <div className="alert alert-danger">{error}</div>}
          
          {/* Rate limiting warning */}
          {loginAttempts.count > 0 && !loginAttempts.isLocked && (
            <div className="alert alert-warning">
              <strong>Warning:</strong> {loginAttempts.count}/{loginAttempts.maxAttempts} failed attempts. 
              Account will be temporarily locked after {loginAttempts.maxAttempts} failed attempts.
            </div>
          )}
          
          {/* Account locked message */}
          {loginAttempts.isLocked && (
            <div className="alert alert-danger">
              <strong>Account Locked:</strong> Too many failed login attempts. 
              {countdown > 0 ? (
                <span> Try again in {formatTime(countdown)}.</span>
              ) : (
                <span> You can try logging in again now.</span>
              )}
            </div>
          )}
          
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              disabled={loginAttempts.isLocked}
            />
          </label>
          
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loginAttempts.isLocked}
            />
          </label>
          
          <button 
            type="submit" 
            className="btn" 
            disabled={loading || loginAttempts.isLocked}
          >
            {loading ? 'Logging in...' : loginAttempts.isLocked ? 'Account Locked' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}