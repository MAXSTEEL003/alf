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
          <NavLink 
            to="create" 
            className={({isActive}) => isActive ? "nav-link active white-text hover-lift" : "nav-link white-text hover-lift"}
          >
            Create Order
          </NavLink>
          <NavLink 
            to="tracking" 
            className={({isActive}) => isActive ? "nav-link active white-text hover-lift" : "nav-link white-text hover-lift"}
          >
            Order Tracking
          </NavLink>
          <NavLink 
            to="enquiry" 
            className={({isActive}) => isActive ? "nav-link active white-text hover-lift" : "nav-link white-text hover-lift"}
          >
            Enquiries
          </NavLink>
          <NavLink 
            to="feedback" 
            className={({isActive}) => isActive ? "nav-link active white-text hover-lift" : "nav-link white-text hover-lift"}
          >
            Feedback
          </NavLink>
          <button onClick={logout} className="nav-link logout-btn white-text">
            Logout
          </button>
          
          {/* Mobile Dropdown with Enquiries */}
          <div className="mobile-dropdown">
            <button className="dropdown-toggle" id="mobileDropdownToggle">
              More
              <span className="dropdown-arrow">▼</span>
            </button>
            <div className="dropdown-menu" id="mobileDropdownMenu">
              <NavLink to="enquiry" className="dropdown-item">Enquiries</NavLink>
              <NavLink to="feedback" className="dropdown-item">Feedback</NavLink>
              <button onClick={logout} className="dropdown-item logout-action">Logout</button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

// ADD THIS JAVASCRIPT TO YOUR COMPONENT OR IN A useEffect
useEffect(() => {
  const dropdownToggle = document.getElementById('mobileDropdownToggle');
  const dropdownMenu = document.getElementById('mobileDropdownMenu');
  
  if (dropdownToggle && dropdownMenu) {
    const handleToggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isOpen = dropdownMenu.classList.contains('show');
      if (isOpen) {
        dropdownMenu.classList.remove('show');
        dropdownToggle.classList.remove('active');
      } else {
        dropdownMenu.classList.add('show');
        dropdownToggle.classList.add('active');
      }
    };
    
    const handleOutsideClick = (e) => {
      if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('show');
        dropdownToggle.classList.remove('active');
      }
    };
    
    dropdownToggle.addEventListener('click', handleToggle);
    document.addEventListener('click', handleOutsideClick);
    
    return () => {
      dropdownToggle.removeEventListener('click', handleToggle);
      document.removeEventListener('click', handleOutsideClick);
    };
  }
}, []);