import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="about-page animate-fade-in">
      <div className="hero-section">
        <h2>Welcome to ALF Logistics</h2>
        <p className="hero-text">
          Your reliable partner for all logistics and transportation needs. We provide efficient, 
          transparent and secure shipping services for businesses and individuals.
        </p>
      </div>
      
      <div className="features-section mt-5">
        <h3>Why Choose Us?</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h4>Reliable Shipping</h4>
            <p>We deliver your packages safely and on time, every time.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h4>Real-time Tracking</h4>
            <p>Track your shipments in real-time with our advanced tracking system.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h4>Global Coverage</h4>
            <p>We deliver to over 200 countries and territories worldwide.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h4>Business Solutions</h4>
            <p>Tailored logistics solutions for businesses of all sizes.</p>
          </div>
        </div>
      </div>
      
      <div className="services-section mt-5">
        <h3>Our Services</h3>
        <ul className="services-list">
          <li>Express Delivery</li>
          <li>Standard Shipping</li>
          <li>International Freight</li>
          <li>Specialized Cargo</li>
          <li>Warehousing</li>
          <li>Supply Chain Solutions</li>
        </ul>
      </div>
      
      <div className="cta-section mt-5">
        <h3>Have a shipment to track?</h3>
        <p>
          If you've received a tracking link, you can use it to see real-time updates on your shipment.
        </p>
        <p className="mt-3">
          For business inquiries, please contact our customer service.
        </p>
        <div className="mt-4">
          <Link to="/login" className="btn">Admin Login</Link>
        </div>
      </div>
      
      <div className="contact-section mt-5">
        <h3>Contact Us</h3>
        <div className="contact-details">
          <p><strong>Phone:</strong> (123) 456-7890</p>
          <p><strong>Email:</strong> info@alflogistics.com</p>
          <p><strong>Address:</strong> 123 Shipping Lane, Logistics City</p>
        </div>
      </div>
    </div>
  );
}
