import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import {
  subscribeOrders,
  subscribeOrder,
  addCheckpointToOrder,
  deleteOrderById,
  completeOrder,
  searchOrdersByCustomer,
  searchOrdersById
} from '../firebase';
import { useAuth } from '../context/AuthContext';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('customer');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();

  // Redirect to about page if not admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    const unsub = subscribeOrders(setOrders);
    return () => unsub();
  }, []);

  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
      return;
    }
    
    setLoading(true);
    try {
      if (searchType === 'customer') {
        const results = await searchOrdersByCustomer(searchTerm.trim());
        setFilteredOrders(results);
      } else {
        const results = await searchOrdersById(searchTerm.trim());
        setFilteredOrders(results);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Show loading while checking authentication
  if (authLoading) return <div className="loading-spinner">Loading...</div>;

  // Don't render if not admin
  if (!isAdmin) return null;

  if (loading) return <div className="loading-spinner">Searching...</div>;

  if (!orders.length) return (
    <div className="empty-state card">
      <h3>No Orders Found</h3>
      <p>You don't have any orders yet. Create one to get started.</p>
      <Link to="/admin/create" className="btn">Create New Order</Link>
    </div>
  );

  return (
    <div className="animate-slide-up">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h3>Order Management</h3>
        <Link to="/admin/create" className="btn">Create New Order</Link>
      </div>

      <div className="search-container mb-4">
        <div className="search-inputs d-flex gap-2">
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
            className="search-type"
          >
            <option value="customer">Customer Name</option>
            <option value="id">Order ID</option>
          </select>
          
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={searchType === 'customer' ? "Search by customer name..." : "Search by order ID..."}
            className="search-input"
          />
          
          <button onClick={handleSearch} className="btn">
            Search
          </button>
        </div>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="empty-search-results">
          <p>No orders match your search criteria.</p>
          <button onClick={() => setFilteredOrders(orders)} className="btn outline small">
            Show All Orders
          </button>
        </div>
      ) : (
        <ul className="order-list">
          {filteredOrders.map(order => (
            <li key={order.id} className={order.status === 'delivered' ? 'delivered' : ''}>
              <div>
                <div className="order-id mb-2">{order.id}</div>
                <div className="order-customer">{order.customer}</div>
                <div className="order-route text-muted">
                  {order.origin} <span className="route-arrow">→</span> {order.destination}
                </div>
                {order.status === 'delivered' && (
                  <div className="status-badge delivered">Delivered</div>
                )}
              </div>
              <div className="order-actions">
                <Link to={`/admin/tracking/${order.id}`} className="btn outline">View Details</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [note, setNote] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [phone, setPhone] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeOrder(id, setOrder);
    return () => unsub();
  }, [id]);

  async function addCheckpoint(e) {
    e.preventDefault();
    if (!note.trim()) return;
    if (!id) return;
    
    setLoading(true);
    try {
      const cp = { 
        id: 'cp-' + Date.now(), 
        text: note.trim(), 
        time: new Date().toISOString() 
      };
      await addCheckpointToOrder(id, cp);
      setNote('');
    } catch (error) {
      console.error("Error adding checkpoint:", error);
    } finally {
      setLoading(false);
    }
  }

  function generateShareLink() {
    if (!order) return;
    const url = `${window.location.origin}/share/${order.id}`;
    setShareUrl(url);
    return url;
  }

  async function copyLink() {
    const url = shareUrl || generateShareLink();
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard');
    } catch (e) {
      prompt('Copy the link below:', url);
    }
  }

  function openSms() {
    if (!phone.trim()) {
      alert('Please enter a phone number first');
      return;
    }
    
    const url = shareUrl || generateShareLink();
    const body = encodeURIComponent(`Track your order from ALF Logistics: ${url}\n\nPlease share your feedback after delivery.`);
    const smsHref = `sms:${phone}?body=${body}`;
    window.location.href = smsHref;
  }

  async function removeOrder() {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    setLoading(true);
    try {
      await deleteOrderById(id);
      navigate('/admin/tracking');
    } catch (error) {
      console.error("Error deleting order:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsDelivered() {
    if (!confirm('Mark this order as delivered? This will complete the order.')) return;
    
    setLoading(true);
    try {
      await completeOrder(id);
      // Add final checkpoint
      const cp = { 
        id: 'cp-delivery-' + Date.now(), 
        text: 'Order delivered successfully', 
        time: new Date().toISOString() 
      };
      await addCheckpointToOrder(id, cp);
    } catch (error) {
      console.error("Error completing order:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="loading-spinner">Processing...</div>;

  if (!order) return (
    <div className="card">
      <h3>Order Not Found</h3>
      <p>The order you're looking for doesn't exist or has been deleted.</p>
      <Link to="/admin/tracking" className="btn">Back to Orders</Link>
    </div>
  );

  const isDelivered = order.status === 'delivered';

  return (
    <div className="animate-slide-up">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h3>Order Details</h3>
        <Link to="/admin/tracking" className="btn outline small">Back to Orders</Link>
      </div>
      
      <div className="card mb-4">
        <div className="d-flex justify-content-between mb-3">
          <div className="order-id text-bold">{order.id}</div>
          <div className="order-status">
            {isDelivered ? (
              <div className="status-badge delivered">Delivered</div>
            ) : (
              <div className="status-badge active">Active</div>
            )}
          </div>
        </div>
        
        <div className="order-details">
          <div className="d-flex mb-3">
            <div className="detail-label text-muted" style={{width: '120px'}}>Customer:</div>
            <div className="detail-value text-bold">{order.customer}</div>
          </div>
          
          <div className="d-flex mb-3">
            <div className="detail-label text-muted" style={{width: '120px'}}>Route:</div>
            <div className="detail-value">
              <span className="origin">{order.origin}</span>
              <span className="route-arrow" style={{margin: '0 10px'}}>→</span>
              <span className="destination">{order.destination}</span>
            </div>
          </div>
          
          <div className="d-flex mb-3">
            <div className="detail-label text-muted" style={{width: '120px'}}>Items:</div>
            <div className="detail-value">{order.items || '(none)'}</div>
          </div>
          
          {isDelivered && (
            <div className="d-flex mb-3">
              <div className="detail-label text-muted" style={{width: '120px'}}>Delivered:</div>
              <div className="detail-value">
                {new Date(order.deliveredAt).toLocaleDateString()} at {new Date(order.deliveredAt).toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>
      </div>

      <h4>Shipment Progress</h4>
      <ol 
        className="checkpoints" 
        style={{
          '--checkpoints-count': order.checkpoints?.length || 0,
          '--line-height': order.checkpoints?.length > 1 
            ? `${((order.checkpoints.length - 1) * 76) + 40}px` // Increased to +40px to fully connect to the last checkpoint
            : '0px'
        }}
      >
        {order.checkpoints?.map((cp, index) => (
          <li key={cp.id} className={index === order.checkpoints.length - 1 ? 'animate-checkpoint-add' : ''}>
            <div className="cp-text">{cp.text}</div>
            <small className="cp-time">{new Date(cp.time).toLocaleString()}</small>
          </li>
        ))}
      </ol>

      {!isDelivered && (
        <form onSubmit={addCheckpoint} className="form-inline mb-4">
          <input 
            value={note} 
            onChange={e => setNote(e.target.value)} 
            placeholder="Add new checkpoint update..." 
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Update'}
          </button>
        </form>
      )}

      <div className="d-flex gap-3 align-items-center mt-4 flex-wrap">
        <button 
          className="btn danger" 
          onClick={removeOrder}
          disabled={loading}
        >
          Delete Order
        </button>
        
        {!isDelivered && (
          <button 
            className="btn success" 
            onClick={markAsDelivered}
            disabled={loading}
          >
            Mark as Delivered
          </button>
        )}
        
        <button 
          className="btn secondary" 
          onClick={() => { setShowShare(v => !v); if(!shareUrl) generateShareLink() }}
          disabled={loading}
        >
          Share Tracking
        </button>
      </div>

      {showShare && (
        <div className="share-module animate-fade-in mt-4">
          <div className="share-module-title">Share Tracking & Feedback Link</div>
          <div className="text-muted mb-3">
            Enter a phone number to send an SMS with the tracking link and feedback form.
          </div>

          <div className="d-flex gap-2 align-items-center mb-3">
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter phone number"
              style={{flex: 1}}
            />
            <button className="btn small" onClick={copyLink} type="button">
              Copy Link
            </button>
            <button className="btn small secondary" onClick={openSms} type="button">
              Send SMS
            </button>
          </div>

          <div className="text-small text-muted mb-2">Shareable tracking link:</div>
          <input 
            readOnly 
            value={shareUrl} 
            className="share-url-input" 
            onClick={e => e.target.select()}
          />
          
          <div className="text-small text-muted mt-3">
            This link includes the order tracking page and customer feedback form.
          </div>
        </div>
      )}
    </div>
  );
}

export default function Tracking() {
  return (
    <div className="tracking-page animate-fade-in">
      <h2>Order Tracking</h2>
      <Routes>
        <Route path="/" element={<OrderList />} />
        <Route path=":id" element={<OrderDetail />} />
      </Routes>
    </div>
  );
}