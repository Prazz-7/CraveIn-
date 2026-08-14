import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const loginMenuRef = useRef(null);

  const [showLoginMenu, setShowLoginMenu] = useState(false);

  useEffect(() => {
    const handleDocumentMouseDown = (event) => {
      if (
        loginMenuRef.current &&
        !loginMenuRef.current.contains(event.target)
      ) {
        setShowLoginMenu(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.setItem("cravein-show-logout-popup", "1");
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📍</span>
          CraveIn
        </Link>

        <div className="navbar-nav">
          <Link to="/restaurants" className="nav-link">
            Restaurants
          </Link>
        </div>

        <div className="navbar-actions">
          <button
            className="cart-btn"
            onClick={() => navigate("/cart")}
            title="Cart"
          >
            🛒
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="btn btn-ghost btn-sm">
                👤 {user?.name?.split(" ")[0]}
              </Link>

              <button
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </>
          ) : (
            <div ref={loginMenuRef} style={{ position: "relative" }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowLoginMenu((prev) => !prev)}
                aria-expanded={showLoginMenu}
                aria-haspopup="menu"
              >
                Log In ▼
              </button>

              {showLoginMenu && (
                <div
                  role="menu"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 0.35rem)",
                    right: 0,
                    width: 220,
                    background: "#fff",
                    borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    overflow: "hidden",
                    zIndex: 999,
                  }}
                >
                  <Link
                    to="/login"
                    onClick={() => setShowLoginMenu(false)}
                    style={{
                      display: "block",
                      padding: "12px 18px",
                      textDecoration: "none",
                      color: "#333",
                    }}
                  >
                    👤 Customer Login
                  </Link>

                  <Link
                    to="/restaurant/login"
                    onClick={() => setShowLoginMenu(false)}
                    style={{
                      display: "block",
                      padding: "12px 18px",
                      textDecoration: "none",
                      color: "#333",
                      borderTop: "1px solid #eee",
                    }}
                  >
                    🏪 Restaurant Login
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}