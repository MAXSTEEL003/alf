import React, { Suspense, lazy } from 'react';
import { Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
const About = lazy(() => import('./pages/About'))
// Load Home statically to avoid dynamic import fetch issues during dev
import Home from './pages/Home-Enhanced.jsx'
const Login = lazy(() => import('./pages/Login'))
const CreateOrder = lazy(() => import('./pages/CreateOrder'))
const ShareView = lazy(() => import('./pages/ShareView'))
const AdminTracking = lazy(() => import('./pages/AdminTracking'))
const AdminFeedback = lazy(() => import('./pages/AdminFeedback'))
const Enquiry = lazy(() => import('./pages/Enquiry'))
const FeedbackForm = lazy(() => import('./pages/FeedbackForm'))
import ProtectedRoute from './components/ProtectedRoute';
import './styles/theme.css';

// Custom styles for navbar links
const navLinkStyle = {
  color: '#0F172A',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
};

function AdminHeader() {
  const { logout } = useAuth();
  
  return (
    <header className="header admin-header glass-effect">
      <div className="container header-container">
        <div className="logo animate-fade-in">
          <h1 className="text-gradient">ALF Logistics Admin</h1>
        </div>
        <nav className="main-nav">
          <NavLink 
            to="/admin/create" 
            className={({isActive}) => isActive ? "nav-link active white-text hover-lift" : "nav-link white-text hover-lift"}
          >
            Create Order
          </NavLink>
          <NavLink 
            to="/admin/tracking" 
            className={({isActive}) => isActive ? "nav-link active white-text hover-lift" : "nav-link white-text hover-lift"}
          >
            Order Tracking
          </NavLink>
          {/* On mobile we move these into a dropdown */}
          <NavLink 
            to="/admin/enquiry" 
            className={({isActive}) => isActive ? "nav-link active white-text hover-lift" : "nav-link white-text hover-lift"}
          >
            Enquiries
          </NavLink>
          <NavLink 
            to="/admin/feedback" 
            className={({isActive}) => isActive ? "nav-link active white-text hover-lift" : "nav-link white-text hover-lift"}
          >
            Feedback
          </NavLink>
          <button onClick={logout} className="nav-link logout-btn white-text">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

function PublicHeader() {
  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <h1>ALF Logistics</h1>
        </div>
        <nav className="main-nav">
          <NavLink 
            to="/" 
            className={({isActive}) => isActive ? "nav-link active white-text" : "nav-link white-text"}
            style={navLinkStyle}
          >
            Home
          </NavLink>
          <NavLink 
            to="/about" 
            className={({isActive}) => isActive ? "nav-link active white-text" : "nav-link white-text"}
            style={navLinkStyle}
          >
            About
          </NavLink>
          <NavLink 
            to="/login" 
            className={({isActive}) => isActive ? "nav-link active white-text" : "nav-link white-text"}
            style={navLinkStyle}
          >
            Admin Login
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function AdminRoutes() {
  return (
    <ProtectedRoute>
      <div className="app admin-app">
        <AdminHeader />
        <main className="main">
          <div className="container main-container">
            <div className="content-wrapper">
              <Suspense fallback={
                <div className="loading glass-effect">
                  <div className="loading-spinner glow-effect">Loading admin...</div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Navigate to="tracking" replace />} />
                  <Route path="create" element={<CreateOrder />} />
                  <Route path="tracking/*" element={<AdminTracking />} />
                  <Route path="enquiry" element={<Enquiry />} />
                  <Route path="feedback" element={<AdminFeedback />} />
                  <Route path="*" element={<Navigate to="tracking" replace />} />
                </Routes>
              </Suspense>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

function Footer() {
  return (
    <footer className="footer glass-effect">
      <div className="container">
        <p className="text-gradient">© {new Date().getFullYear()} ALF Logistics. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        {/* Public Routes */}
        <Route path="/" element={
          <>
            <PublicHeader />
            <main className="main">
              <Suspense fallback={<div className="page-loading"><div className="loading-spinner">Loading...</div></div>}>
                <Home />
              </Suspense>
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/login" element={
          <>
            <PublicHeader />
            <main className="main">
                <div className="container main-container">
                <div className="content-wrapper">
                  <Suspense fallback={<div className="page-loading"><div className="loading-spinner">Loading...</div></div>}>
                    <Login />
                  </Suspense>
                </div>
              </div>
            </main>
            <Footer />
          </>
        } />
        
        {/* Shared public views - Customer facing */}
        <Route path="/share/:id" element={
          <>
            <PublicHeader />
            <main className="main">
              <div className="container main-container">
                <div className="content-wrapper">
                  <Suspense fallback={<div className="page-loading"><div className="loading-spinner">Loading...</div></div>}>
                    <ShareView />
                  </Suspense>
                </div>
              </div>
            </main>
            <Footer />
          </>
        } />
        
        {/* Public feedback via orderId (legacy) */}
        <Route path="/feedback/:id" element={
          <>
            <PublicHeader />
            <main className="main">
              <div className="container main-container">
                <div className="content-wrapper">
                  <Suspense fallback={<div className="page-loading"><div className="loading-spinner">Loading...</div></div>}>
                    <FeedbackForm />
                  </Suspense>
                </div>
              </div>
            </main>
            <Footer />
          </>
        } />

        {/* Public feedback via tokenized link */}
        <Route path="/f/:token" element={
          <>
            <PublicHeader />
            <main className="main">
              <div className="container main-container">
                <div className="content-wrapper">
                  <Suspense fallback={<div className="page-loading"><div className="loading-spinner">Loading...</div></div>}>
                    <FeedbackForm />
                  </Suspense>
                </div>
              </div>
            </main>
            <Footer />
          </>
        } />

        <Route path="/about" element={
          <>
            <PublicHeader />
            <main className="main">
              <div className="container main-container">
                <div className="content-wrapper">
                  <Suspense fallback={<div className="page-loading"><div className="loading-spinner">Loading...</div></div>}>
                    <About />
                  </Suspense>
                </div>
              </div>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </AuthProvider>
  );
}
