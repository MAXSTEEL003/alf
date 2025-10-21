import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'

// Minimal runtime error overlay to surface production failures
function installGlobalErrorHandler() {
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

// Install overlay ASAP
if (typeof window !== 'undefined') {
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
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
