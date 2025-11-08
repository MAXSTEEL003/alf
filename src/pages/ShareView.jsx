import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../firebase';
import '../styles/feedback.css';

export default function ShareView() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchOrder() {
      try {
        const orderData = await getOrderById(id);
        if (orderData) {
          // Sort checkpoints by time (newest first)
          if (orderData.checkpoints && orderData.checkpoints.length > 0) {
            orderData.checkpoints.sort((a, b) => {
              const timeA = new Date(a.time).getTime();
              const timeB = new Date(b.time).getTime();
              return timeB - timeA; // Descending order (newest first)
            });
          }
          setOrder(orderData);
        } else {
          setError('Order not found');
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setError('Failed to load order information');
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="share-view-container">
        <div className="loading-spinner">
          <div className="spinner-icon"></div>
          <p>Loading order information...</p>
        </div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="share-view-container">
        <div className="share-card error">
          <div className="error-icon">📦</div>
          <h2>Order Not Found</h2>
          <p>The tracking information you're looking for could not be found.</p>
          <p>Please verify the order ID and try again.</p>
        </div>
      </div>
    );
  }

  const isDelivered = order.status === 'delivered';
  const getStatusBadge = () => {
    if (isDelivered) return { text: '✓ Delivered', class: 'delivered' };
    if (order.status === 'in-transit') return { text: '🚚 In Transit', class: 'in-transit' };
    return { text: '📋 Processing', class: 'processing' };
  };
  
  const statusBadge = getStatusBadge();
  
  return (
    <div className="share-view-container">
      <div className="share-card">
        <div className="share-header">
          <h2>📍 Tracking Information</h2>
          <div className={`status-badge ${statusBadge.class}`}>
            {statusBadge.text}
          </div>
        </div>
        
        <div className="order-info">
          <div className="order-id-wrapper">
            <div className="order-id">
              <span className="order-label">Order ID:</span>
              <span className="order-number">{order.id}</span>
            </div>
          </div>
          
          <div className="shipment-path">
            <div className="origin-point">
              <div className="point-marker origin" title="Origin">
                <span className="marker-icon">📍</span>
              </div>
              <div className="location">{order.origin}</div>
              <div className="location-label">Origin</div>
            </div>
            
            <div className="path-line">
              <div className={`progress-indicator ${isDelivered ? 'complete' : ''}`}>
                <div className="progress-glow"></div>
              </div>
            </div>
            
            <div className="destination-point">
              <div className="point-marker destination" title="Destination">
                <span className="marker-icon">🎯</span>
              </div>
              <div className="location">{order.destination}</div>
              <div className="location-label">Destination</div>
            </div>
          </div>
          
          <div className="customer-info">
            <div className="info-row">
              <span className="info-icon">👤</span>
              <div>
                <strong>Customer:</strong> {order.customer}
              </div>
            </div>
            {order.phone && (
              <div className="info-row">
                <span className="info-icon">📞</span>
                <div>
                  <strong>Phone:</strong> {order.phone}
                </div>
              </div>
            )}
          </div>
          
          <div className="updates-section">
            <h3>📦 Shipment Updates</h3>
            {order.checkpoints && order.checkpoints.length > 0 ? (
              <div className="checkpoints-timeline">
                <div 
                  className="checkpoints"
                  style={{
                    '--checkpoints-count': order.checkpoints.length,
                    '--line-height': order.checkpoints.length > 1 
                      ? `${((order.checkpoints.length - 1) * 76) + 40}px`
                      : '0px'
                  }}
                >
                  {order.checkpoints.map((cp, index) => (
                    <div key={cp.id || index} className="checkpoint-wrapper">
                      <div className="checkpoint-inner">
                        <div className="cp-text">{cp.text}</div>
                        <div className="cp-time">
                          {new Date(cp.time).toLocaleString()}
                        </div>
                      </div>
                      {index === 0 && (
                        <span className="latest-badge">Latest</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-updates">
                <div className="no-updates-icon">📭</div>
                <p>No tracking updates available yet</p>
                <small>Check back soon for updates on your shipment</small>
              </div>
            )}
          </div>
          
          {isDelivered && (
            <div className="feedback-prompt">
              <div className="feedback-icon">⭐</div>
              <h4>How was your experience?</h4>
              <p>We'd love to hear your feedback about our service!</p>
              <Link to={`/feedback/${order.id}`} className="btn feedback-btn">
                <span>Share Feedback</span>
                <span className="btn-arrow">→</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
