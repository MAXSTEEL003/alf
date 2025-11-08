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
  const [searchQuery, setSearchQuery] = useState('');
  const [helpfulCounts, setHelpfulCounts] = useState({});
  const [markedHelpful, setMarkedHelpful] = useState({});
  const { analyze } = useSuggestions();

  useEffect(() => {
    const unsub = subscribeFeedback((list) => {
      setFeedback(list);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, []);

  const filtered = useMemo(() => {
    let list = feedback || [];
    if (filter !== 'all') list = list.filter(f => String(f.rating) === filter);
    const q = (searchQuery || '').trim().toLowerCase();
    if (q) {
      list = list.filter(f => (
        String(f.orderId || '').toLowerCase().includes(q) ||
        String(f.name || '').toLowerCase().includes(q) ||
        String(f.comments || '').toLowerCase().includes(q)
      ));
    }
    return list;
  }, [feedback, filter, searchQuery]);

  const stats = useMemo(() => {
    const total = (feedback || []).length;
    if (!total) return { total: 0, avg: 0, positive: 0, dist: [0,0,0,0,0] };
    const dist = [0,0,0,0,0];
    let sum = 0;
    feedback.forEach(f => {
      const r = Math.min(5, Math.max(1, Number(f.rating || 0)));
      if (r >= 1 && r <= 5) dist[r-1]++;
      sum += Number(f.rating || 0);
    });
    const avg = +(sum / total).toFixed(2);
    const positive = Math.round(((dist[4] + dist[3]) / total) * 100);
    return { total, avg, positive, dist };
  }, [feedback]);

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

  // Local helpful-count UI (optimistic, no server call here)
  useEffect(() => {
    // Initialize counts from feedback items when feed changes
    const init = {};
    (feedback || []).forEach(f => { init[f.id] = Number(f.helpful || 0) || 0; });
    setHelpfulCounts(init);
    setMarkedHelpful({});
  }, [feedback]);

  const handleMarkHelpful = (id) => {
    if (!id) return;
    setMarkedHelpful(prev => {
      if (prev[id]) return prev; // already marked
      const next = { ...prev, [id]: true };
      return next;
    });
    setHelpfulCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    // TODO: wire to Firestore to persist helpful counts if desired
  };

  return (
    <div className="admin-feedback-page">
      <div className="page-header">
        <h2 className="text-gradient">Feedback Management</h2>
        <p className="subtext">Generate secure feedback links and review customer feedback in one place.</p>
      </div>

      <div className="metrics-row">
        <div className="stat-card">
          <h4>Average rating</h4>
          <div className="value">{stats.avg} / 5</div>
          <div className="muted">Based on {stats.total} reviews</div>
        </div>

        <div className="stat-card">
          <h4>Total reviews</h4>
          <div className="value">{stats.total}</div>
          <div className="muted">All time</div>
        </div>

        <div className="stat-card">
          <h4>Positive rate</h4>
          <div className="value">{stats.positive}%</div>
          <div className="muted">% of 4★ & 5★ reviews</div>
        </div>

        <div className="rating-distribution">
          <h4>Rating distribution</h4>
          {stats.dist.slice().reverse().map((count, idx) => {
            const rating = 5 - idx;
            const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
            return (
              <div className="row" key={rating}>
                <div className="label">{rating}★</div>
                <div className="bar-wrap" aria-hidden>
                  <div className="bar" style={{ width: `${pct}%` }} />
                </div>
                <div className="count">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      <section className="card glass feedback-list full-width">
          <div className="list-header">
            <div>
              <h3>Received Feedback</h3>
              <p className="muted">Click an item to view details and suggested actions.</p>
            </div>

            <div className="filters">
              <input className="search" placeholder="Search by order, name or comment" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <label>Filter:</label>
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
            <div className="feedback-cards-container">
              {filtered.map(item => (
                <div key={item.id} className="feedback-card" onClick={() => setSelected(item)}>
                  <div className="feedback-card-header">
                    <div className="feedback-card-info">
                      <h4 className="feedback-card-name">{item.name || 'Anonymous'}</h4>
                      <p className="feedback-card-meta">Order: {item.orderId} • {new Date(item.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div className="feedback-card-rating">
                      <div className="feedback-stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < (item.rating || 0) ? 'star filled' : 'star empty'}>★</span>
                        ))}
                      </div>
                      <span className="feedback-score">{(item.rating || 0).toFixed ? (Number(item.rating).toFixed(1)) : item.rating}</span>
                    </div>
                  </div>

                  <div className="feedback-card-content">
                    <p>{item.comments || '—'}</p>
                  </div>

                  <div className="feedback-card-footer">
                    <span className="feedback-route">{item.route || ''}</span>
                    <div className="feedback-actions">
                      <span className="helpful-text">{helpfulCounts[item.id] || 0} people found this helpful</span>
                      <button 
                        className="btn-helpful" 
                        onClick={(e) => { e.stopPropagation(); handleMarkHelpful(item.id); }} 
                        disabled={!!markedHelpful[item.id]}
                      >
                        Mark as Helpful
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      <section className="card glass generate-link full-width">
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
