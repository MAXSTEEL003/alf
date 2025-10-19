import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import {
  subscribeOrders,
  subscribeOrder,
  addCheckpointToOrder,
  deleteOrderById
} from '../firebase'

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
    <div>
      <h3>Order {order.id}</h3>
      <p><strong>Customer:</strong> {order.customer}</p>
      <p><strong>Route:</strong> {order.origin} → {order.destination}</p>
      <p><strong>Items:</strong> {order.items || '(none)'}</p>

      <h4>Checkpoints</h4>
      <ol className="checkpoints">
        {order.checkpoints?.map(cp => (
          <li key={cp.id}>
            <div className="cp-text">{cp.text}</div>
            <small className="cp-time">{new Date(cp.time).toLocaleString()}</small>
          </li>
        ))}
      </ol>

      <form onSubmit={addCheckpoint} className="form-inline">
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="New checkpoint note" />
        <button className="btn" type="submit">Add checkpoint</button>
      </form>

      <div style={{marginTop:12, display:'flex', gap:8, alignItems:'center'}}>
        <button className="btn danger" onClick={removeOrder}>Delete Order</button>

        <button className="btn" onClick={() => { setShowShare(v => !v); if(!shareUrl) generateShareLink() }}>
          Share tracking
        </button>
      </div>

      {showShare && (
        <div style={{marginTop:12,padding:12,border:`1px solid var(--border)`,borderRadius:8,background:'#fff',maxWidth:520}}>
          <div style={{fontWeight:600,marginBottom:8}}>Share tracking link</div>
          <div style={{marginBottom:8,color:'var(--text-muted)'}}>Enter a phone number to open the customer's SMS app, or copy the link and send it via your preferred method.</div>

          <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 555 555 5555 (optional)"
              style={{flex:1,padding:'8px',borderRadius:6,border:'1px solid var(--border)'}}
            />
            <button className="btn" onClick={copyLink} type="button">Copy link</button>
            <button className="btn" onClick={openSms} type="button">Send SMS</button>
          </div>

          <div style={{fontSize:'0.9rem',color:'var(--text-muted)'}}>Shareable link:</div>
          <input readOnly value={shareUrl} style={{width:'100%',padding:'8px',borderRadius:6,border:'1px solid var(--border)',marginTop:6}} />
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
