import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createEnquiry } from '../firebase';
import '../styles/modern-home.css';

const Home = () => {
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
    'Air Freight',
    'Ocean Freight',
    'Warehousing',
    'Supply Chain Solutions'
  ];

  const stats = [
    { number: '500+', label: 'Cities Connected', icon: 'fas fa-map-marked-alt' },
    { number: '50K+', label: 'Total Deliveries', icon: 'fas fa-shipping-fast' },
    { number: '98%', label: 'On-Time Delivery', icon: 'fas fa-stopwatch' },
    { number: '24/7', label: 'Customer Support', icon: 'fas fa-phone' }
  ];



  // Updated services with distinctive logistics icons
  const services_enhanced = [
    {
      icon: 'fas fa-shipping-fast',
      title: 'Ground Transport', 
      description: 'Reliable road transportation for all cargo sizes.',
    },
    {
      icon: 'fas fa-paper-plane',
      title: 'Air Freight', 
      description: 'Express air shipping for time-sensitive deliveries.',
    },
    {
      icon: 'fas fa-ship',
      title: 'Ocean Freight',
      description: 'Cost-effective sea transportation for bulk shipments.',
    },
    {
      icon: 'fas fa-boxes',
      title: 'Warehousing',
      description: 'Secure storage solutions with inventory management.',
    }
  ];

  // Auto-rotate statistics
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex((prevIndex) => (prevIndex + 1) % stats.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [stats.length]);

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
      console.log('Submitting enquiry with data:', formData);
      const dataToSubmit = {
        ...formData,
        status: 'new'
      };

      const result = await createEnquiry(dataToSubmit);
      console.log('Enquiry submitted successfully:', result);
      
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
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      setError(error.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modern-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-particles"></div>
        <div className="hero-overlay"></div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <i className="fas fa-star"></i>
            <span>NEW ARRIVAL - Professional Logistics Solutions</span>
          </div>
          
          <h1 className="hero-title">
            Transform Your <span className="gradient-text">Logistics Operations</span>
            <br />with Smart Technology
          </h1>
          
          <p className="hero-subtitle">
            Streamline your supply chain with AI-powered logistics solutions that adapt to your business needs. 
            Experience faster deliveries, real-time tracking, and unmatched reliability.
          </p>
          
          <div className="hero-buttons">
            <button 
              onClick={() => {
                const element = document.getElementById('enquiry-form');
                if (element) {
                  element.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                  });
                }
              }}
              className="btn btn-primary"
            >
              <i className="fas fa-rocket"></i>
              Get Quote Now
              <div className="btn-shine"></div>
            </button>
            <Link to="/about" className="btn btn-secondary">
              <i className="fas fa-play"></i>
              Learn More
            </Link>
          </div>
          
          <div className="trust-indicators">
            <div className="trust-item">
              <i className="fas fa-shield-check"></i>
              <span>24/7 Support</span>
            </div>
            <div className="trust-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>Real-time Tracking</span>
            </div>
            <div className="trust-item">
              <i className="fas fa-lock"></i>
              <span>Secure & Insured</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
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
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-progress"></div>
            </div>
          ))}
        </div>
      </section>



      {/* Services Section */}
      <section className="services-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">Our Services</div>
            <h2 className="section-title">Complete Logistics Solutions</h2>
            <p className="section-intro">
              From express delivery to complex supply chain management, we've got you covered.
            </p>
          </div>
          
          <div className="services-grid">
            {services_enhanced.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">
                  <i className={service.icon}></i>
                </div>
                <h4>{service.title}</h4>
                <p>{service.description}</p>
                <div className="service-arrow">
                  <i className="fas fa-arrow-right"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">Why Choose ALF Logistics</div>
            <h2 className="section-title">Your Trusted Logistics Partner</h2>
            <p className="section-intro">
              Experience the difference with our comprehensive logistics solutions designed to meet your unique business needs.
            </p>
          </div>
          
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-comments"></i>
              </div>
              <h4>24/7 Customer Support</h4>
              <p>Round-the-clock assistance to ensure your shipments are always on track.</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-satellite"></i>
              </div>
              <h4>Real-time GPS Tracking</h4>
              <p>Monitor your cargo with precision using our advanced tracking technology.</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-tags"></i>
              </div>
              <h4>Competitive Pricing</h4>
              <p>Get the best value for your logistics needs with transparent pricing.</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-lock"></i>
              </div>
              <h4>Insured Shipments</h4>
              <p>Complete protection and peace of mind for all your valuable cargo.</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-wrench"></i>
              </div>
              <h4>Custom Solutions</h4>
              <p>Tailored logistics strategies designed specifically for your business.</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-recycle"></i>
              </div>
              <h4>Eco-friendly Options</h4>
              <p>Sustainable shipping solutions that reduce your carbon footprint.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Enquiry Form */}
      <section id="enquiry-form" className="enquiry-section">
        <div className="enquiry-form-wrapper">
          <div className="section-header">
            <div className="section-badge">Get Started</div>
            <h2 className="section-title">Request Your Custom Quote</h2>
            <p className="section-intro">
              Fill out the form below and our logistics experts will provide you with a personalized solution.
            </p>
          </div>
          
          <div className="enquiry-form-container">
            <h3>Quote Information</h3>
            <form onSubmit={handleSubmit} className="enquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    <i className="fas fa-user"></i>
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">
                    <i className="fas fa-envelope"></i>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">
                    <i className="fas fa-phone"></i>
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="service">
                    <i className="fas fa-cog"></i>
                    Service Required
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
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
                  <i className="fas fa-comment-alt"></i>
                  Requirements
                </label>
                <textarea
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Tell us about your specific requirements..."
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
                  <span>Your enquiry has been submitted successfully! We'll contact you soon.</span>
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
                    <i className="fas fa-rocket"></i>
                    Get Instant Quote
                  </>
                )}
              </button>
              
              <div className="form-footer">
                <p>🔒 Your information is secure and will not be shared with third parties.</p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
