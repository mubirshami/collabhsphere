import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiUser, FiLogOut, FiHome } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">⚡</span>
          CollabSphere
        </Link>
        
        <div className="navbar-actions">
          {user?.role === 'Admin' && (
            <Link to="/admin/users" className="icon-btn" title="User Management">
              <FiUser size={20} />
            </Link>
          )}
          <button onClick={toggleDarkMode} className="icon-btn" title="Toggle theme">
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
          
          <Link to="/" className="icon-btn" title="Dashboard">
            <FiHome size={20} />
          </Link>
          
          <Link to="/profile" className="icon-btn" title="Profile">
            <FiUser size={20} />
          </Link>
          
          <button onClick={handleLogout} className="icon-btn" title="Logout">
            <FiLogOut size={20} />
          </button>
          
          <div className="user-info">
            {user?.avatar && user.avatar.startsWith('/uploads') ? (
              <img src={user.avatar} alt="avatar" className="nav-avatar" />
            ) : (
              <span className="nav-avatar-fallback">{user?.name?.charAt(0).toUpperCase()}</span>
            )}
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

