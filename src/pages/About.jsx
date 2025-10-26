import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/about.css';

export default function About() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-container">
          <div className="hero-content">
            <h1 className="hero-title">About ALF Logistics</h1>
            <p className="hero-subtitle">Pioneering Modern Logistics Solutions for the Connected World</p>
            <p className="hero-description">
              ALF Logistics is a technology-driven logistics company committed to revolutionizing the way businesses and individuals manage their shipping needs. With over a decade of industry expertise, we've built a reputation for reliability, innovation, and customer-centric solutions.
            </p>
            <div className="hero-accent"></div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="about-container">
          <div className="mission-vision-grid">
            <div className="mission-card feature-card">
              <div className="card-icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <h3>Our Mission</h3>
              <p>To deliver exceptional logistics services that empower businesses to grow globally while maintaining the highest standards of safety, reliability, and transparency. We're committed to making shipping simple, affordable, and accessible to everyone.</p>
            </div>

            <div className="vision-card feature-card">
              <div className="card-icon">
                <i className="fas fa-eye"></i>
              </div>
              <h3>Our Vision</h3>
              <p>To become the most trusted and innovative logistics partner in the world. We envision a future where seamless global connectivity transforms how goods move across borders, powered by technology and human excellence.</p>
            </div>

            <div className="values-card feature-card">
              <div className="card-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>Our Values</h3>
              <p>We operate with integrity, transparency, and innovation at our core. Every team member is dedicated to exceeding expectations, fostering partnerships based on trust, and driving sustainable growth for all stakeholders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose">
        <div className="about-container">
          <h2 className="section-title">Why Choose ALF Logistics?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-shipping-fast"></i>
              </div>
              <h4>99.8% Reliability Rate</h4>
              <p>Industry-leading on-time delivery and package safety. Your shipments are our priority, backed by real-time monitoring and proactive communication.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h4>Real-time Tracking</h4>
              <p>Advanced GPS and IoT technology gives you complete visibility. Track your shipments at any moment with detailed location updates and estimated delivery times.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-globe"></i>
              </div>
              <h4>Global Coverage</h4>
              <p>Delivery to 200+ countries and territories worldwide. Our extensive network of partners ensures efficient routing and faster delivery times, no matter the destination.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-lock"></i>
              </div>
              <h4>Secure & Insured</h4>
              <p>Comprehensive insurance coverage and advanced security protocols. Every package is protected with end-to-end encryption and real-time security monitoring.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-cogs"></i>
              </div>
              <h4>Scalable Solutions</h4>
              <p>From startups to enterprises. Our flexible infrastructure grows with your business, offering custom solutions tailored to your specific logistics needs.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-headset"></i>
              </div>
              <h4>24/7 Support</h4>
              <p>Dedicated customer service team available round the clock. Multi-channel support via chat, email, and phone ensures your questions are answered instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="services-section">
        <div className="about-container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            <div className="service-item">
              <div className="service-number">01</div>
              <h4>Express Delivery</h4>
              <p>Same-day and next-day delivery options for time-sensitive shipments with guaranteed delivery windows.</p>
            </div>

            <div className="service-item">
              <div className="service-number">02</div>
              <h4>Standard Shipping</h4>
              <p>Reliable and cost-effective shipping for regular parcels with flexible delivery timelines.</p>
            </div>

            <div className="service-item">
              <div className="service-number">03</div>
              <h4>International Freight</h4>
              <p>Comprehensive international shipping with customs clearance and full documentation support.</p>
            </div>

            <div className="service-item">
              <div className="service-number">04</div>
              <h4>Specialized Cargo</h4>
              <p>Expert handling of fragile, hazardous, and temperature-controlled shipments with specialized packaging.</p>
            </div>

            <div className="service-item">
              <div className="service-number">05</div>
              <h4>Warehousing</h4>
              <p>Climate-controlled storage facilities with inventory management and fulfillment services.</p>
            </div>

            <div className="service-item">
              <div className="service-number">06</div>
              <h4>Supply Chain Solutions</h4>
              <p>End-to-end supply chain optimization, from sourcing to last-mile delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="about-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">10+</div>
              <p>Years of Industry Excellence</p>
            </div>

            <div className="stat-card">
              <div className="stat-value">50M+</div>
              <p>Packages Delivered Globally</p>
            </div>

            <div className="stat-card">
              <div className="stat-value">200+</div>
              <p>Countries Covered</p>
            </div>

            <div className="stat-card">
              <div className="stat-value">99.8%</div>
              <p>On-Time Delivery Rate</p>
            </div>

            <div className="stat-card">
              <div className="stat-value">24/7</div>
              <p>Customer Support Available</p>
            </div>

            <div className="stat-card">
              <div className="stat-value">500+</div>
              <p>Cities Connected</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="about-container">
          <div className="cta-content">
            <h2>Ready to Transform Your Logistics?</h2>
            <p>Join thousands of businesses trusting ALF Logistics for their shipping needs.</p>
            <div className="cta-buttons">
              <Link to="/?quote=true" className="btn btn-primary" onClick={() => {
                setTimeout(() => {
                  document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}>
                <i className="fas fa-rocket"></i> Get Started Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="about-container">
          <h2 className="section-title">Get in Touch</h2>
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon">
                <i className="fas fa-phone"></i>
              </div>
              <h4>Phone</h4>
              <p>+1 (555) 123-4567</p>
              <p className="contact-label">Available 24/7</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <h4>Email</h4>
              <p>support@alflogistics.com</p>
              <p className="contact-label">Response within 2 hours</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h4>Address</h4>
              <p>123 Logistics Boulevard</p>
              <p className="contact-label">San Francisco, CA 94105</p>
            </div>

            <div className="contact-card" style={{ gridColumn: '1 / -1', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
              <div className="contact-icon">
                <i className="fas fa-share-alt"></i>
              </div>
              <h4>Follow Us</h4>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                <a href="https://facebook.com/alflogistics" target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="https://twitter.com/alflogistics" target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://instagram.com/alflogistics" target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
              <p className="contact-label">Connect with us</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
