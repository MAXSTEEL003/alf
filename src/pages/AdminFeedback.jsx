import React, { useEffect, useMemo, useState } from 'react';
import { createFeedbackLink, subscribeFeedback, getOrderById } from '../firebase';
import '../styles/admin-feedback.css';

function useSuggestions() {
  function analyze(feedback) {
    const s = [];
    const txt = (feedback.comments || '').toLowerCase();
    const rating = Number(feedback.rating || 0);

    if (rating <= 2) {
      s.push('High-priority follow-up: Contact the customer to understand the issue and offer remedy.');
    } else if (rating === 3) {
      s.push('Neutral experience: Ask what would have made the experience a 5.');
    } else if (rating >= 4) {
      s.push('Positive feedback: Consider asking for a testimonial or permission to share.');
    }

    if (/delay|late|slow|time|eta/.test(txt)) {
      s.push('Investigate route delays; review handoff points and update ETA communication process.');
    }
    if (/damage|broken|pack|condition/.test(txt)) {
      s.push('Audit packaging/handling SOP; reinforce partner SLAs and add photo-evidence step at pickup/dropoff.');
    }
    if (/price|cost|charge|bill|invoice/.test(txt)) {
      s.push('Assess pricing transparency; include cost breakdown in order updates and pre-delivery quotes.');
    }
    if (/communication|update|call|contact|response/.test(txt)) {
      s.push('Improve comms cadence: automated milestone updates and single point-of-contact escalation.');
    }

    return s;
  }
  return { analyze };
}

export default function AdminFeedback() {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null); // {token, url}
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null); // selected feedback item
  const { analyze } = useSuggestions();

  useEffect(() => {
    const unsub = subscribeFeedback((list) => {
      setFeedback(list);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return feedback;
    return feedback.filter(f => String(f.rating) === filter);
  }, [feedback, filter]);

  const handleGenerate = async () => {
    const id = orderIdInput.trim();
    if (!id) return;
    setGenerating(true);
    setGenerated(null);
    try {
      // Validate order exists (optional UX)
      const ord = await getOrderById(id);
      if (!ord) {
        alert('Order not found');
        return;
      }
  const { token } = await createFeedbackLink(id);
  const origin = window.location.origin;
  // Include orderId as a fallback query param (?o=) so public reads work even if
  // Firestore rules block reading feedbackLinks. FeedbackForm will use this.
  const url = `${origin}/f/${token}?o=${encodeURIComponent(id)}`;
  setGenerated({ token, url });
    } catch (e) {
      console.error('Failed to generate link', e);
      alert('Failed to generate feedback link.');
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = async () => {
    if (!generated?.url) return;
    try {
      await navigator.clipboard.writeText(generated.url);
      setGenerated(prev => ({ ...prev, copied: true }));
      setTimeout(() => setGenerated(prev => prev ? { ...prev, copied: false } : prev), 1500);
    } catch (_) {}
  };

  return (
    <div className="admin-feedback-page">
      <div className="page-header">
        <h2 className="text-gradient">Feedback Management</h2>
        <p className="subtext">Generate secure feedback links and review customer feedback in one place.</p>
      </div>

      <div className="grid two-cols">
        <section className="card glass generate-link">
          <h3>Generate Feedback Link</h3>
          <p className="muted">Enter an Order ID to create a unique, tokenized feedback link you can share with the customer.</p>

          <div className="form-inline">
            <input
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="Enter Order ID (e.g., 12345 or Firestore doc id)"
            />
            <button className="btn" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating…' : 'Generate Link'}
            </button>
          </div>

          {generated && (
            <div className="generated-link">
              <div className="url" title={generated.url}>{generated.url}</div>
              <div className="actions">
                <button className="btn secondary" onClick={copyLink}>{generated.copied ? 'Copied' : 'Copy'}</button>
                <a className="btn" href={generated.url} target="_blank" rel="noreferrer">Open</a>
              </div>
            </div>
          )}
        </section>

        <section className="card glass feedback-list">
          <div className="list-header">
            <h3>Received Feedback</h3>
            <div className="filters">
              <label>Filter by rating:</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading feedback…</div>
          ) : (
            <ul className="items">
              {filtered.map(item => (
                <li key={item.id} className="item" onClick={() => setSelected(item)}>
                  <div className="meta">
                    <span className={`badge rating r${item.rating}`}>{item.rating}★</span>
                    <span className="order">Order: {item.orderId}</span>
                    <span className="name">By {item.name || 'Anonymous'}</span>
                    <span className="date">{new Date(item.createdAt || Date.now()).toLocaleString()}</span>
                  </div>
                  <div className="preview">{(item.comments || '').slice(0, 120) || '—'}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {selected && (
        <div className="drawer" role="dialog" aria-modal="true">
          <div className="drawer-card glass">
            <div className="drawer-header">
              <h3>Feedback Details</h3>
              <button className="btn small secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
            <div className="drawer-body">
              <div className="row">
                <div><strong>Order:</strong> {selected.orderId}</div>
                <div><strong>Customer:</strong> {selected.name || 'Anonymous'}</div>
                <div><strong>Rating:</strong> {selected.rating} / 5</div>
                <div><strong>Received:</strong> {new Date(selected.createdAt || Date.now()).toLocaleString()}</div>
              </div>
              <div className="comment">
                <strong>Comments:</strong>
                <p>{selected.comments || '—'}</p>
              </div>
              <div className="suggestions">
                <h4>Suggested actions</h4>
                <ul>
                  {analyze(selected).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
