import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder, testConnection, getNextOrderNumber } from '../firebase'
import { useAuth } from '../context/AuthContext'
import '../styles/create-order.css'

export default function CreateOrder() {
  const [customer, setCustomer] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [items, setItems] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { isAdmin, loading: authLoading } = useAuth()

  // Redirect to about page if not admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  // Test Firebase connection when component mounts
  useEffect(() => {
    testConnection();
  }, []);

  // Show loading while checking authentication
  if (authLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault()
    console.log('Form submitted with data:', { customer, origin, destination, items });
    
    setLoading(true);
    
    try {
      // Get the next incremental order number
      const orderNumber = await getNextOrderNumber();
      const id = `ALF-${orderNumber}`;
      
      const newOrder = {
        id,
        orderNumber,
        customer,
        origin,
        destination,
        items,
        createdAt: new Date().toISOString(),
        checkpoints: [
          { id: 'cp-' + Date.now(), text: 'Order created', time: new Date().toISOString() }
        ]
      }

      console.log('Calling createOrder with:', newOrder);

      // save to Firestore
      const result = await createOrder(newOrder)
      console.log('Order created successfully:', result);
      // Navigate to admin tracking
      navigate(`/admin/tracking/${id}`)
    } catch (err) {
      console.error('createOrder error details:', err)
      console.error('Error code:', err.code)
      console.error('Error message:', err.message)
      alert(`Failed to create order: ${err.message}`)
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-order-container animate-fade-in">
      <h2>Create New Order</h2>
      <div className="order-form-wrapper">
        <form onSubmit={handleSubmit} className="form">
          <label>
            <span>Customer Name</span>
            <input 
              type="text"
              value={customer} 
              onChange={e => setCustomer(e.target.value)} 
              placeholder="Enter customer name"
              required 
            />
          </label>

          <label>
            <span>Origin Location</span>
            <input 
              type="text"
              value={origin} 
              onChange={e => setOrigin(e.target.value)} 
              placeholder="Enter pickup location"
              required 
            />
          </label>

          <label>
            <span>Destination Location</span>
            <input 
              type="text"
              value={destination} 
              onChange={e => setDestination(e.target.value)} 
              placeholder="Enter delivery location"
              required 
            />
          </label>

          <label>
            <span>Items / Notes</span>
            <textarea 
              value={items} 
              onChange={e => setItems(e.target.value)} 
              placeholder="Enter package details, items, or special instructions..."
            />
          </label>

          <div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Creating Order...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
