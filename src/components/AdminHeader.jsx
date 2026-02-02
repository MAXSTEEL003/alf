import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminHeader() {
  const { logout } = useAuth();
  const location = useLocation(); // still used for active NavLink styling only

  return (
    <header className="header admin-header glass-effect">
      <div className="container header-container">
        <div className="logo animate-fade-in">
          <h1 className="text-gradient">ALF Logistics Admin</h1>
        </div>
        <nav className="main-nav" aria-label="Admin Navigation">
          <NavLink 
            to="/admin/create" 
            className={({isActive}) => isActive ? 'nav-link active white-text hover-lift' : 'nav-link white-text hover-lift'}
          >
            Create Order
          </NavLink>
          <NavLink 
            to="/admin/tracking" 
            className={({isActive}) => isActive ? 'nav-link active white-text hover-lift' : 'nav-link white-text hover-lift'}
          >
            Order Tracking
          </NavLink>
          {/* Items moved to dropdown on small screens by CSS rules */}
          <NavLink 
            to="/admin/enquiry" 
            className={({isActive}) => isActive ? 'nav-link active white-text hover-lift' : 'nav-link white-text hover-lift'}
          >
            Enquiries
          </NavLink>
          <NavLink 
            to="/admin/feedback" 
            className={({isActive}) => isActive ? 'nav-link active white-text hover-lift' : 'nav-link white-text hover-lift'}
          >
            Feedback
          </NavLink>
          <button onClick={logout} className="nav-link logout-btn white-text" type="button">
            Logout
          </button>

          {/* Dropdown removed: all links shown directly */}
        </nav>
      </div>
    </header>
  );
}
