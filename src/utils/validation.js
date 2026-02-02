/**
 * Input Validation and Sanitization Utilities
 * Production-ready validation for secure form handling
 */

import DOMPurify from 'isomorphic-dompurify';

// XSS Protection - Sanitize HTML content
export const sanitizeHTML = (input) => {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: []  // No attributes allowed
  });
};

// SQL Injection Protection - Basic string sanitization
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  
  // Remove common SQL injection patterns
  const dangerous = /('|(;|')|(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|SCRIPT|UNION|OR|AND|TRUNCATE|MERGE)\b))/gi;
  
  return input
    .replace(dangerous, '')
    .trim()
    .slice(0, 1000); // Limit length
};

// Email validation with regex and format checking
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }
  
  // Basic format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }
  
  return { isValid: true, sanitized: sanitizeString(email.toLowerCase()) };
};

// Phone validation - Indian mobile numbers
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Indian mobile number format: +91 or 0 followed by 10 digits starting with 6-9
  const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
  
  if (!phoneRegex.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid Indian mobile number' };
  }
  
  // Normalize format
  const normalized = cleaned.replace(/^(\+91|0)/, '+91');
  
  return { isValid: true, sanitized: normalized };
};

// Order ID validation
export const validateOrderId = (orderId) => {
  if (!orderId || typeof orderId !== 'string') {
    return { isValid: false, error: 'Order ID is required' };
  }
  
  // Alphanumeric, hyphens, underscores only, 3-50 characters
  const orderIdRegex = /^[A-Za-z0-9\-_]{3,50}$/;
  
  if (!orderIdRegex.test(orderId)) {
    return { isValid: false, error: 'Order ID must be 3-50 characters (letters, numbers, hyphens, underscores only)' };
  }
  
  return { isValid: true, sanitized: sanitizeString(orderId.toUpperCase()) };
};

// Generic text validation
export const validateText = (text, fieldName, minLength = 1, maxLength = 1000) => {
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const trimmed = text.trim();
  
  if (trimmed.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  
  if (trimmed.length > maxLength) {
    return { isValid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }
  
  return { isValid: true, sanitized: sanitizeHTML(trimmed) };
};

// URL validation for tracking links
export const validateURL = (url) => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }
  
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }
    
    return { isValid: true, sanitized: urlObj.toString() };
  } catch (error) {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

// File validation for uploads
export const validateFile = (file, allowedTypes = [], maxSizeMB = 5) => {
  if (!file) {
    return { isValid: false, error: 'File is required' };
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` };
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `File size must not exceed ${maxSizeMB}MB` };
  }
  
  // Check filename for suspicious content
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
  if (safeName !== file.name) {
    return { isValid: false, error: 'Filename contains invalid characters' };
  }
  
  return { isValid: true, sanitized: { ...file, safeName } };
};

// Rating validation (1-5 stars)
export const validateRating = (rating) => {
  const num = parseInt(rating);
  
  if (isNaN(num) || num < 1 || num > 5) {
    return { isValid: false, error: 'Rating must be between 1 and 5' };
  }
  
  return { isValid: true, sanitized: num };
};

// Date validation
export const validateDate = (dateString, fieldName = 'Date') => {
  if (!dateString) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return { isValid: false, error: `Please enter a valid ${fieldName.toLowerCase()}` };
  }
  
  return { isValid: true, sanitized: date.toISOString() };
};

// Comprehensive form validation
export const validateForm = (formData, rules) => {
  const errors = {};
  const sanitizedData = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = formData[field];
    let result;
    
    switch (rule.type) {
      case 'email':
        result = validateEmail(value);
        break;
      case 'phone':
        result = validatePhone(value);
        break;
      case 'orderId':
        result = validateOrderId(value);
        break;
      case 'text':
        result = validateText(value, rule.label || field, rule.minLength, rule.maxLength);
        break;
      case 'url':
        result = validateURL(value);
        break;
      case 'rating':
        result = validateRating(value);
        break;
      case 'date':
        result = validateDate(value, rule.label || field);
        break;
      default:
        result = { isValid: true, sanitized: sanitizeString(value) };
    }
    
    if (!result.isValid) {
      errors[field] = result.error;
    } else {
      sanitizedData[field] = result.sanitized;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};

// Rate limiting helper for form submissions
const submissionCounts = new Map();

export const checkRateLimit = (identifier, maxRequests = 5, windowMs = 60000) => {
  const now = Date.now();
  const userRequests = submissionCounts.get(identifier) || [];
  
  // Remove old requests outside the time window
  const validRequests = userRequests.filter(time => now - time < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return {
      allowed: false,
      error: `Too many requests. Please wait before submitting again.`,
      retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
    };
  }
  
  // Add current request
  validRequests.push(now);
  submissionCounts.set(identifier, validRequests);
  
  return { allowed: true };
};

export default {
  sanitizeHTML,
  sanitizeString,
  validateEmail,
  validatePhone,
  validateOrderId,
  validateText,
  validateURL,
  validateFile,
  validateRating,
  validateDate,
  validateForm,
  checkRateLimit
};