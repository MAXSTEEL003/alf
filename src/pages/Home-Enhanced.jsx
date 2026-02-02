import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createEnquiry } from '../firebase';
import ImageSlideshow from '../components/ImageSlideshow';
import '../styles/modern-home.css';

const HomeEnhanced = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    remarks: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);

  const services = [
    'Express Delivery',
    'Ground Transportation', 
    'Warehousing',
    'Supply Chain Solutions'
  ];

  const stats = [
    { number: '500+', label: 'Cities Connected', icon: 'fas fa-map-marked-alt' },
    { number: '50K+', label: 'Total Deliveries', icon: 'fas fa-shipping-fast' }, // Renamed from Daily Deliveries
    { number: '98%', label: 'On-Time Delivery', icon: 'fas fa-clock' },
    { number: '24/7', label: 'Customer Support', icon: 'fas fa-headset' }
  ];

  const features = [
    {
      icon: 'fas fa-shipping-fast',
      title: 'Lightning Fast Delivery',
      description: 'Same-day and next-day delivery options available across major cities.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Secure & Insured',
      description: 'Full insurance coverage and secure handling for all your shipments.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Smart Tracking',
      description: 'AI-powered real-time tracking with predictive delivery estimates.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: 'fas fa-rupee-sign',
      title: 'Competitive Pricing',
      description: 'Best rates in the market with transparent pricing - no hidden costs.',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      icon: 'fas fa-leaf',
      title: 'Eco-Friendly Options',
      description: 'Carbon-neutral delivery choices and sustainable packaging solutions.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: 'fas fa-headset',
      title: '24/7 Support',
      description: 'Round-the-clock customer service to assist with all your logistics needs.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  ];

  // Auto-rotate stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^\d{10}$/.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.service) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      setIsLoading(false);
      return;
    }

    if (formData.remarks.split(' ').length > 100) {
      setError('Remarks should not exceed 100 words');
      setIsLoading(false);
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        status: 'new',
        timestamp: new Date().toISOString()
      };

      await createEnquiry(dataToSubmit);
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        remarks: ''
      });
      
      setSuccess(true);
      setError('');
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
      
      // Scroll to top after success
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setError(error.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modern-home">
      {/* Image Slideshow Hero Section with Overlay Text - Full Width */}
      <section className="slideshow-hero">
        {/* Slides Background */}
        {ImageSlideshow && <ImageSlideshow />}
        
        {/* Content Overlay */}
        <div className="slideshow-hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">Lightning Fast</span> Logistics
            <br/>Across India
          </h1>
          <p className="hero-subtitle">
            Experience the future of logistics with AI-powered tracking, 
            same-day delivery, and 99.8% reliability rate. 
            From startups to enterprises, we scale with you.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => {
              document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <i className="fas fa-rocket"></i>
              Get Instant Quote
              <div className="btn-shine"></div>
            </button>
            <Link to="/about" className="btn btn-secondary">
              <i className="fas fa-arrow-right"></i>
              Learn More
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="trust-indicators">
            <div className="trust-item">
              <i className="fas fa-certificate"></i>
              <span>ISO Certified</span>
            </div>
            <div className="trust-item">
              <i className="fas fa-award"></i>
              <span>Best Logistics 2024</span>
            </div>
            <div className="trust-item">
              <i className="fas fa-users"></i>
              <span>10K+ Happy Customers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Container for rest of content */}
      <div className="container main-container">
        <div className="content-wrapper">
          {/* Enhanced Stats Section with Animation */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`stat-card ${index === currentStatIndex ? 'active' : ''}`}
            >
              <div className="stat-icon">
                <i className={stat.icon}></i>
              </div>
              <h3 className="stat-number">{stat.number}</h3>
              <p className="stat-label">{stat.label}</p>
              <div className="stat-progress"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Why Choose Us</span>
            <h2 className="section-title">Built for Modern Businesses</h2>
            <p className="section-intro">
              Cutting-edge technology meets reliable service. Here's what makes us different.
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card" style={{'--gradient': feature.gradient}}>
                <div className="feature-header">
                  <div className="feature-icon">
                    <i className={feature.icon}></i>
                  </div>
                  <h3>{feature.title}</h3>
                </div>
                <p>{feature.description}</p>
                <div className="feature-hover-effect"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Services Section */}
      <section className="services-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Our Services</span>
            <h2 className="section-title">Complete Logistics Solutions</h2>
          </div>
          
          <div className="services-grid">
            {[
              { icon: 'fas fa-bolt', title: 'Express Delivery', desc: 'Same-day & next-day delivery' },
              { icon: 'fas fa-truck', title: 'Ground Transport', desc: 'Cost-effective surface shipping' },
              { icon: 'fas fa-warehouse', title: 'Warehousing', desc: 'Secure storage facilities' },
              { icon: 'fas fa-cogs', title: 'Supply Chain', desc: 'End-to-end management' }
            ].map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">
                  <i className={service.icon}></i>
                </div>
                <h4>{service.title}</h4>
                <p>{service.desc}</p>
                <div className="service-arrow">
                  <i className="fas fa-arrow-right"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Enquiry Form */}
      <section id="enquiry-form" className="enquiry-section">
        <div className="section-container">
          <div className="enquiry-header">
            <span className="section-badge">Get Started</span>
            <h2 className="section-title">Get Your Custom Quote</h2>
            <p className="section-subtitle">
              Tell us about your shipping needs and get a personalized quote within minutes
            </p>
          </div>
          
          <div className="enquiry-form-wrapper">
            <form onSubmit={handleSubmit} className="enquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    <i className="fas fa-user"></i>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <i className="fas fa-envelope"></i>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">
                    <i className="fas fa-phone"></i>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service">
                    <i className="fas fa-box"></i>
                    Service Required *
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="remarks">
                  <i className="fas fa-comment"></i>
                  Additional Requirements
                </label>
                <textarea
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Tell us about your shipping requirements, special handling needs, or any questions..."
                  rows="4"
                />
                <div className="word-count">
                  {formData.remarks.split(' ').filter(word => word.length > 0).length}/100 words
                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>{error}</span>
                  <button type="button" onClick={() => setError('')}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
              
              {success && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle"></i>
                  <span>Enquiry submitted successfully! We'll contact you within 2 hours.</span>
                  <button type="button" onClick={() => setSuccess(false)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Get My Quote Now
                    <div className="btn-shine"></div>
                  </>
                )}
              </button>
              
              <p className="form-footer">
                <i className="fas fa-lock"></i>
                Your information is secure and will never be shared
              </p>
            </form>
          </div>
        </div>
      </section>
        </div>
      </div>
    </div>
  );
};

export default HomeEnhanced;