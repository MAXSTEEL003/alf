import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
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

  if (!orders.length) return <p>No orders found. Create one first.</p>

  return (
    <div>
      <h3>Your Orders</h3>
      <ul className="order-list">
        {orders.map(o => (
          <li key={o.id}>
            <div><strong>{o.id}</strong> — {o.customer} ({o.origin} → {o.destination})</div>
            <div className="order-actions">
              <Link to={`/tracking/${o.id}`}>View</Link>
            </div>
          </li>
        ))}
      </ul>
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

  useEffect(() => {
    const unsub = subscribeOrder(id, setOrder)
    return () => unsub()
  }, [id])

  async function addCheckpoint(e) {
    e.preventDefault()
    if (!note.trim()) return
    if (!id) return
    const cp = { id: 'cp-' + Date.now(), text: note.trim(), time: new Date().toISOString() }
    await addCheckpointToOrder(id, cp)
    setNote('')
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

  if (!order) return <p>Order not found.</p>

  return (
    <div className="order-detail">
      <div className="order-header">
        <div className="order-id">{order.id}</div>
        <h3>Order Tracking Details</h3>
      </div>

      <div className="order-info">
        <div className="order-info-item">
          <strong>Customer</strong>
          <span className="order-customer">{order.customer}</span>
        </div>
        
        <div className="order-info-item">
          <strong>Route</strong>
          <span>
            {order.origin}
            <span className="route-arrow">→</span>
            {order.destination}
          </span>
        </div>
        
        <div className="order-info-item">
          <strong>Items</strong>
          <span>{order.items || '(none)'}</span>
        </div>
      </div>

      <div className="checkpoints-section">
        <h4>📍 Tracking History</h4>
        <div className="checkpoints">
          {order.checkpoints && order.checkpoints.length > 0 ? (
            order.checkpoints.map(cp => (
              <div key={cp.id}>
                <div className="cp-text">{cp.text}</div>
                <small className="cp-time">{new Date(cp.time).toLocaleString()}</small>
              </div>
            ))
          ) : (
            <div style={{color: 'var(--text-muted)'}}>No checkpoints yet</div>
          )}
        </div>
      </div>

      <form onSubmit={addCheckpoint} className="form-inline">
        <input 
          value={note} 
          onChange={e => setNote(e.target.value)} 
          placeholder="Add a checkpoint update..." 
        />
        <button className="btn" type="submit">Add Checkpoint</button>
      </form>

      <div style={{marginTop: 'var(--space-lg)', display:'flex', gap: 'var(--space-md)', alignItems:'center', flexWrap: 'wrap'}}>
        <button className="btn danger" onClick={removeOrder}>Delete Order</button>

        <button className="btn" onClick={() => { setShowShare(v => !v); if(!shareUrl) generateShareLink() }}>
          📤 Share Tracking
        </button>
      </div>

      {showShare && (
        <div className="share-panel">
          <div className="share-panel-title">📨 Share Tracking Link</div>
          <div className="share-panel-description">
            Enter a phone number to open the customer's SMS app, or copy the link and send it via your preferred method.
          </div>

          <div className="share-inputs">
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 555 555 5555 (optional)"
            />
            <button className="btn" onClick={copyLink} type="button">📋 Copy Link</button>
            <button className="btn" onClick={openSms} type="button">💬 Send SMS</button>
          </div>

          <div className="share-link-label">Shareable Link:</div>
          <input readOnly value={shareUrl} className="share-link-input" />
        </div>
      )}
    </div>
  )
}

export default function Tracking() {
  return (
    <div>
      <h2>Tracking</h2>
      <Routes>
        <Route path="/" element={<OrderList />} />
        <Route path=":id" element={<OrderDetail />} />
      </Routes>
    </div>
  )
}
