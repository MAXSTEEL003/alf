import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, createFeedback } from '../firebase';

export default function FeedbackForm() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rating: 0,
    comments: '',
  });
  
  useEffect(() => {
    async function fetchOrder() {
      try {
        const orderData = await getOrderById(id);
        setOrder(orderData);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrder();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (formData.rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await createFeedback({
        orderId: id,
        name: formData.name,
        rating: formData.rating,
        comments: formData.comments,
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  if (!order) {
    return (
      <div className="feedback-container">
        <div className="feedback-card">
          <h2>Order Not Found</h2>
          <p>We couldn't find the order you're looking for.</p>
        </div>
      </div>
    );
  }
  
  if (submitted) {
    return (
      <div className="feedback-container">
        <div className="feedback-card thank-you">
          <div className="thank-you-icon">✓</div>
          <h2>Thank You!</h2>
          <p>Your feedback has been submitted successfully.</p>
          <p>We appreciate you taking the time to share your experience with ALF Logistics.</p>
          
          <Link to={`/share/${id}`} className="btn mt-4">
            Back to Order Tracking
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <h2>Share Your Feedback</h2>
        <p className="thank-you-message">
          Thank you for using ALF Logistics services! We'd love to hear about your experience.
        </p>
        
        <div className="order-summary">
          <div><strong>Order ID:</strong> {order.id}</div>
          <div><strong>From:</strong> {order.origin} <strong>To:</strong> {order.destination}</div>
        </div>
        
        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>How would you rate your experience?</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  className={`star ${formData.rating >= star ? 'selected' : ''}`}
                  onClick={() => handleRatingClick(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="comments">Comments (Optional)</label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows="4"
              placeholder="Tell us about your experience..."
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            className="btn submit-feedback" 
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}