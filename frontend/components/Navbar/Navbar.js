import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import './Navbar.css';
import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { totalItems } = useSelector(state => state.cart);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { dispatch(logout()); navigate('/'); };

  return (
    <nav className="navbar">
      <div className="container flex navbar-container">
        <Link to="/" className="navbar-brand"><h1>🍕 CraveIn</h1></Link>
        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/restaurants" className="nav-link">Restaurants</Link>
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="nav-link"><FaShoppingCart /> Cart ({totalItems})</Link>
              <Link to="/profile" className="nav-link"><FaUser /> {user?.name}</Link>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;