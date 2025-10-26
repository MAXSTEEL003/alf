import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import '../styles/enquiry.css';

const Enquiry = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'new', 'contacted'
  const [updatingId, setUpdatingId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'enquiries'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const enquiriesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp instanceof Timestamp 
            ? data.timestamp.toDate() 
            : new Date(data.timestamp?.seconds * 1000) || new Date(),
        };
      });
      setEnquiries(enquiriesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <div className="loading">Loading enquiries...</div>;
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const filteredEnquiries = enquiries.filter(enquiry => {
    if (filter === 'all') return true;
    return enquiry.status === filter;
  });

  const handleMarkAsContacted = async (enquiryId) => {
    if (!user) return;
    
    try {
      setUpdatingId(enquiryId);
      const enquiryRef = doc(db, 'enquiries', enquiryId);
      await updateDoc(enquiryRef, {
        status: 'contacted',
        contactedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating enquiry:', error);
      alert('Failed to update enquiry status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="enquiry-container">
      <h2>Customer Enquiries</h2>
      
      <div className="filter-container">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'new' ? 'active' : ''}`}
          onClick={() => setFilter('new')}
        >
          New
        </button>
        <button 
          className={`filter-btn ${filter === 'contacted' ? 'active' : ''}`}
          onClick={() => setFilter('contacted')}
        >
          Contacted
        </button>
      </div>
      
      <div className="enquiries-list">
        {loading ? (
          <div className="loading">Loading enquiries...</div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="no-enquiries">No enquiries found</div>
        ) : (
          filteredEnquiries.map((enquiry) => (
            <div key={enquiry.id} className="enquiry-card">
              <div className="enquiry-header">
                <div className="header-main">
                  <h3>{enquiry.name}</h3>
                  <span className="timestamp">{formatDate(enquiry.timestamp)}</span>
                </div>
                <div className="header-actions">
                  <div className="status-badge" data-status={enquiry.status || 'new'}>
                    {enquiry.status || 'new'}
                  </div>
                  {(!enquiry.status || enquiry.status === 'new') && (
                    <button 
                      className="contacted-btn"
                      onClick={() => handleMarkAsContacted(enquiry.id)}
                      disabled={updatingId === enquiry.id}
                    >
                      {updatingId === enquiry.id ? 'Updating...' : 'Mark Contacted'}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="enquiry-details">
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <a href={`mailto:${enquiry.email}`} className="value email-link">
                    {enquiry.email}
                  </a>
                </div>
                
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <a href={`tel:${enquiry.phone}`} className="value phone-link">
                    {enquiry.phone}
                  </a>
                </div>
                
                <div className="detail-row">
                  <span className="label">Service:</span>
                  <span className="value service-tag">{enquiry.service}</span>
                </div>
                
                {enquiry.remarks && (
                  <div className="remarks">
                    <span className="label">Remarks:</span>
                    <p className="value">{enquiry.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Enquiry;
