import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  subscribeOrders,
  subscribeOrder,
  addCheckpointToOrder,
  deleteOrderById
} from '../firebase'
import '../styles/tracking.css';

function OrderList() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const unsub = subscribeOrders(setOrders)
    return () => unsub()
  }, [])

  // Determine status based on order data
  const getStatus = (order) => {
    return order.status || 'In Transit'
  }

  if (!orders.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📦</div>
        <h3>No Orders Found</h3>
        <p>Create your first order to get started</p>
      </div>
    )
  }

  return (
    <div className="order-list-container">
      <div className="order-list-header">
        <h3>Order History</h3>
        <p className="order-count">{orders.length} total orders</p>
      </div>
      
      <div className="order-table-wrapper">
        <div className="order-table-header">
          <div className="col-order-id">Order ID</div>
          <div className="col-route">Route</div>
          <div className="col-service">Service</div>
          <div className="col-status">Status</div>
          <div className="col-date">Date</div>
          <div className="col-amount">Amount</div>
          <div className="col-actions">Actions</div>
        </div>

        <ul className="order-list">
          {orders.map(o => {
            const status = getStatus(o)
            return (
              <li key={o.id}>
                <div className="col-order-id">
                  <div className="order-id-main">{o.id}</div>
                  <div className="order-id-ref">{o.id}</div>
                </div>
                <div className="col-route">
                  <span className="route-from">{o.origin}</span>
                  <span className="route-arrow">→</span>
                  <span className="route-to">{o.destination}</span>
                </div>
                <div className="col-service">
                  <span className="service-name">{o.service || 'Standard'}</span>
                </div>
                <div className="col-status">
                  <span className={`status-badge ${status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {status}
                  </span>
                </div>
                <div className="col-date">
                  <span className="date-value">{o.date || new Date().toISOString().split('T')[0]}</span>
                </div>
                <div className="col-amount">
                  <span className="amount-value">₹{o.amount || '0'}</span>
                </div>
                <div className="col-actions">
                  <Link to={`/tracking/${o.id}`} className="action-btn view-btn" title="View order details">
                    <span className="eye-icon">👁</span>
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [note, setNote] = useState('')
  const [showShare, setShowShare] = useState(false)
  const [phone, setPhone] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const { isAdmin } = useAuth()

  useEffect(() => {
    const unsub = subscribeOrder(id, setOrder)
    return () => unsub()
  }, [id])

  const [loading, setLoading] = useState(false)

  async function addCheckpoint(e) {
    e.preventDefault()
    const text = note.trim()
    if (!text) {
      alert('Please enter an update before submitting.')
      return
    }
    if (!id) {
      alert('Order ID missing. Please reload the page.')
      return
    }
    setLoading(true)
    try {
      const cp = { id: 'cp-' + Date.now(), text, time: new Date().toISOString() }
      await addCheckpointToOrder(id, cp)
      setNote('')
      // Avoid optimistic append to prevent duplicate entries; onSnapshot will refresh
    } catch (err) {
      console.error('Failed to add checkpoint', err)
      alert('Failed to add update. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function generateShareLink() {
    if (!order) return
    const url = `${window.location.origin}/share/${order.id}`
    setShareUrl(url)
    return url
  }

  async function copyLink() {
    const url = shareUrl || generateShareLink()
    try {
      await navigator.clipboard.writeText(url)
      alert('Link copied to clipboard')
    } catch (e) {
      prompt('Copy the link below:', url)
    }
  }

  function openSms() {
    const url = shareUrl || generateShareLink()
    const body = encodeURIComponent(`Track your order: ${url}`)
    const smsHref = phone ? `sms:${phone}?body=${body}` : `sms:?body=${body}`
    window.location.href = smsHref
  }

  async function removeOrder() {
    if (!confirm('Delete this order?')) return
    await deleteOrderById(id)
    navigate('/tracking')
  }

  if (!order) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    )
  }

  return (
    <div className="order-detail-container">
      <div className="order-detail-card">
        <div className="order-header">
          <div className="order-id-badge">{order.id}</div>
          <h3>Order Tracking Details</h3>
        </div>

        <div className="order-info-grid">
          <div className="order-info-item">
            <span className="info-label">Customer</span>
            <span className="info-value">{order.customer}</span>
          </div>
          
          <div className="order-info-item">
            <span className="info-label">Route</span>
            <span className="info-value">
              {order.origin}
              <span className="route-arrow">→</span>
              {order.destination}
            </span>
          </div>
          
          <div className="order-info-item">
            <span className="info-label">Items</span>
            <span className="info-value">{order.items || '(none)'}</span>
          </div>
        </div>

        <div className="checkpoints-section">
          <h4>📍 Tracking History</h4>
          <div className="checkpoints">
            {order.checkpoints && order.checkpoints.length > 0 ? (
              order.checkpoints.map(cp => (
                <div key={cp.id} className="checkpoint-item">
                  <div className="checkpoint-text">{cp.text}</div>
                  <div className="checkpoint-time">{new Date(cp.time).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <div className="no-checkpoints">No checkpoints yet</div>
            )}
          </div>
        </div>

        {isAdmin && (
          <form onSubmit={addCheckpoint} className="checkpoint-form">
            <input 
              value={note} 
              onChange={e => setNote(e.target.value)} 
              placeholder="Add a checkpoint update..." 
              className="checkpoint-input"
            />
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Adding…' : 'Add Checkpoint'}</button>
          </form>
        )}

        <div className="order-actions">
          <button className="btn btn-danger" onClick={removeOrder}>Delete Order</button>
          <button className="btn btn-secondary" onClick={() => { setShowShare(v => !v); if(!shareUrl) generateShareLink() }}>
            📤 Share Tracking
          </button>
        </div>

        {showShare && (
          <div className="share-panel">
            <div className="share-panel-header">
              <h4>📨 Share Tracking Link</h4>
              <p>Enter a phone number to open the customer's SMS app, or copy the link and send it via your preferred method.</p>
            </div>

            <div className="share-inputs">
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 555 555 5555 (optional)"
                className="share-phone-input"
              />
              <div className="share-buttons">
                <button className="btn btn-secondary" onClick={copyLink} type="button">📋 Copy Link</button>
                <button className="btn btn-secondary" onClick={openSms} type="button">💬 Send SMS</button>
              </div>
            </div>

            <div className="share-link-section">
              <label className="share-link-label">Shareable Link:</label>
              <input readOnly value={shareUrl} className="share-link-input" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Tracking() {
  return (
    <div className="tracking-page-container">
      <div className="tracking-header">
        <h2>My Orders</h2>
        <p className="tracking-subtitle">Track and manage your shipment orders</p>
      </div>
      <Routes>
        <Route path="/" element={<OrderList />} />
        <Route path=":id" element={<OrderDetail />} />
      </Routes>
    </div>
  )
}
