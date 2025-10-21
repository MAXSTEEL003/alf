import React, { Suspense, lazy } from 'react';
import { Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
const About = lazy(() => import('./pages/About'))
const Login = lazy(() => import('./pages/Login'))
const CreateOrder = lazy(() => import('./pages/CreateOrder'))
const ShareView = lazy(() => import('./pages/ShareView'))
const AdminTracking = lazy(() => import('./pages/AdminTracking'))
const FeedbackForm = lazy(() => import('./pages/FeedbackForm'))
import ProtectedRoute from './components/ProtectedRoute';
import './styles/App.css';
import './styles/additional.css';
import './styles/tracking.css';
import './styles/auth.css';
import './styles/feedback.css';
import './styles/about.css';

// Custom styles for navbar links
const navLinkStyle = {
  color: '#ffffff',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
};

function AdminHeader() {
  const { logout } = useAuth();
  
  return (
    <header className="header admin-header">
      <div className="container header-container">
        <div className="logo">
          <h1>ALF Logistics Admin</h1>
        </div>
        <nav className="main-nav">
          <NavLink 
            to="/admin/create" 
            className={({isActive}) => isActive ? "nav-link active white-text" : "nav-link white-text"}
            style={navLinkStyle}
          >
            Create Order
          </NavLink>
          <NavLink 
            to="/admin/tracking" 
            className={({isActive}) => isActive ? "nav-link active white-text" : "nav-link white-text"}
            style={navLinkStyle}
          >
            Order Tracking
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
              <Suspense fallback={<div>Loading admin...</div>}>
                <Routes>
                  <Route path="/" element={<Navigate to="/admin/tracking" replace />} />
                  <Route path="/create" element={<CreateOrder />} />
                  <Route path="/tracking/*" element={<AdminTracking />} />
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
    <footer className="footer">
      <div className="container">
        <p>© {new Date().getFullYear()} ALF Logistics. All rights reserved.</p>
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
              <div className="container main-container">
                <div className="content-wrapper">
                  <Suspense fallback={<div>Loading...</div>}>
                    <About />
                  </Suspense>
                </div>
              </div>
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
                  <Suspense fallback={<div>Loading...</div>}>
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
                  <Suspense fallback={<div>Loading...</div>}>
                    <ShareView />
                  </Suspense>
                </div>
              </div>
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/feedback/:id" element={
          <>
            <PublicHeader />
            <main className="main">
              <div className="container main-container">
                <div className="content-wrapper">
                  <Suspense fallback={<div>Loading...</div>}>
                    <FeedbackForm />
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
