import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Map, PieChart, User, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { name: 'Home', path: '/authority', icon: <Home size={20} /> },
    { name: 'Reports', path: '/authority/ReportsPage', icon: <FileText size={20} /> },
    { name: 'Area-wise Uploads', path: '/authority/areawise-uploads', icon: <Map size={20} /> },
    { name: 'Status', path: '/authority/Status', icon: <PieChart size={20} /> },
    { name: 'Profile', path: '/authority/Settings', icon: <User size={20} /> },
  ];

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('email');
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Sidebar */}
      <nav className="authority-sidebar">
        <div className="authority-sidebar-header">
          <img src="/Logo.png" alt="SafeStreet Logo" className="authority-logo" />
        </div>
        <div className="authority-nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`authority-nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
        <button className="authority-logout-btn" onClick={handleLogoutClick}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="authority-logout-confirm-overlay">
          <div className="authority-logout-confirm-dialog">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>
            <div className="authority-logout-confirm-buttons">
              <button onClick={cancelLogout} className="authority-cancel-button">
                Cancel
              </button>
              <button onClick={confirmLogout} className="authority-confirm-button">
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
