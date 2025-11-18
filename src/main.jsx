import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/theme.css'

// Minimal runtime error overlay to surface production failures
function installGlobalErrorHandler() {
  // Disable verbose overlay in production builds
  if (import.meta.env && import.meta.env.PROD) return;
  window.__appErrorOverlay = document.createElement('div')
  const s = window.__appErrorOverlay.style
  s.position = 'fixed'
  s.left = 0
  s.right = 0
  s.top = 0
  s.zIndex = 999999
  s.background = 'rgba(0,0,0,0.85)'
  s.color = 'white'
  s.padding = '12px'
  s.fontFamily = 'monospace'
  s.fontSize = '12px'
  s.maxHeight = '50vh'
  s.overflow = 'auto'
  s.display = 'none'
  window.__appErrorOverlay.id = 'app-error-overlay'
  document.body.appendChild(window.__appErrorOverlay)

  window.addEventListener('error', (ev) => {
    const msg = `${ev.message} at ${ev.filename}:${ev.lineno}:${ev.colno}`
    showError(msg)
  })

  window.addEventListener('unhandledrejection', (ev) => {
    showError('Unhandled promise rejection: ' + (ev.reason && ev.reason.stack ? ev.reason.stack : String(ev.reason)))
  })

  function showError(text) {
    window.__appErrorOverlay.style.display = 'block'
    window.__appErrorOverlay.textContent = text
    console.error('[App Overlay]', text)
  }
}

// Install overlay ASAP (dev only)
if (typeof window !== 'undefined' && (!import.meta.env || import.meta.env.DEV)) {
  // If document isn't ready yet, defer until it is
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installGlobalErrorHandler)
  } else {
    installGlobalErrorHandler()
  }
}

// Mark the app as initialized so the inline fallback in index.html doesn't show
if (typeof window !== 'undefined') {
  window.__appInitialized = true
  // Remove fallback banner if it was shown
  const fb = document.getElementById('app-fallback-banner')
  if (fb) try { fb.remove() } catch (_) {}
}

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('#root element not found');
}

createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// After first paint, mark the document to enable animations (improves LCP)
if (typeof window !== 'undefined') {
  const enableAnimations = () => {
    document.body.classList.add('app-animated');
  };
  if (document.readyState === 'complete') {
    // Give the browser a tick to render LCP elements
    setTimeout(enableAnimations, 150);
  } else {
    window.addEventListener('load', () => setTimeout(enableAnimations, 150));
  }
}
