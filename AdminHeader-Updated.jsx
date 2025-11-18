// UPDATE YOUR AdminHeader COMPONENT IN App.jsx

function AdminHeader() {
  const { logout } = useAuth();
  return (
    <header className="header admin-header glass-effect">
      <div className="container header-container">
        <div className="logo animate-fade-in">
          <h1 className="text-gradient">ALF Logistics Admin</h1>
        </div>
        <nav className="main-nav">
          <NavLink to="create" className={({isActive}) => isActive ? "nav-link active white-text hover-lift" : "nav-link white-text hover-lift"}>Create Order</NavLink>
          <NavLink to="tracking" className={({isActive}) => isActive ? "nav-link active white-text hover-lift" : "nav-link white-text hover-lift"}>Order Tracking</NavLink>
          <NavLink to="enquiry" className={({isActive}) => isActive ? "nav-link active white-text hover-lift" : "nav-link white-text hover-lift"}>Enquiries</NavLink>
          <NavLink to="feedback" className={({isActive}) => isActive ? "nav-link active white-text hover-lift" : "nav-link white-text hover-lift"}>Feedback</NavLink>
          <button onClick={logout} className="nav-link logout-btn white-text">Logout</button>
        </nav>
      </div>
    </header>
  );
}

// ADD THIS JAVASCRIPT TO YOUR COMPONENT OR IN A useEffect
// Dropdown logic removed