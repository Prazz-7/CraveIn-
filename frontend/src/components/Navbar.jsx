import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📍</span>
          CraveIn
        </Link>
        <div className="navbar-nav">
          <Link to="/restaurants" className="nav-link">Restaurants</Link>
        </div>
        <div className="navbar-actions">
          <button className="cart-btn" onClick={() => navigate('/cart')} title="Cart">
            🛒
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="btn btn-ghost btn-sm">👤 {user?.name?.split(' ')[0]}</Link>
              <button className="btn btn-outline btn-sm" onClick={logout}>Log Out</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Log In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
