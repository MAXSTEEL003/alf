import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../firebase';

export default function ShareView() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  const [loading, setLoading] = useState(true);
  
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
  }, [id])

  if (loading) {
    return (
      <div className="share-view-container">
        <div className="loading-spinner">Loading order information...</div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="share-view-container">
        <div className="share-card error">
          <h2>Order Not Found</h2>
          <p>The tracking information you're looking for could not be found.</p>
          <p>Please check the order ID and try again.</p>
        </div>
      </div>
    );
  }

  const isDelivered = order.status === 'delivered';
  
  return (
    <div className="share-view-container">
      <div className="share-card">
        <div className="share-header">
          <h2>Tracking Information</h2>
          {isDelivered && (
            <div className="status-badge delivered">Delivered</div>
          )}
        </div>
        
        <div className="order-info">
          <div className="order-id mb-3">Order: {order.id}</div>
          
          <div className="shipment-path">
            <div className="origin-point">
              <div className="point-marker origin"></div>
              <div className="location">{order.origin}</div>
            </div>
            
            <div className="path-line">
              <div className={`progress-indicator ${isDelivered ? 'complete' : ''}`}></div>
            </div>
            
            <div className="destination-point">
              <div className="point-marker destination"></div>
              <div className="location">{order.destination}</div>
            </div>
          </div>
          
          <div className="customer-info mb-4">
            <div><strong>Customer:</strong> {order.customer}</div>
          </div>
          
          <h3>Shipment Updates</h3>
          <ol 
            className="checkpoints" 
            style={{
              '--checkpoints-count': order.checkpoints?.length || 0,
              '--line-height': order.checkpoints?.length > 1 
                ? `${((order.checkpoints.length - 1) * 76) + 40}px`
                : '0px'
            }}
          >
            {order.checkpoints?.map((cp, index) => (
              <li key={cp.id}>
                <div className="cp-text">{cp.text}</div>
                <small className="cp-time">{new Date(cp.time).toLocaleString()}</small>
              </li>
            ))}
            
            {!order.checkpoints?.length && (
              <div className="no-updates">No updates available yet</div>
            )}
          </ol>
          
          {isDelivered && (
            <div className="feedback-prompt">
              <h4>How was your experience?</h4>
              <p>We'd love to hear your feedback about our service!</p>
              <Link to={`/feedback/${order.id}`} className="btn secondary">
                Share Feedback
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
