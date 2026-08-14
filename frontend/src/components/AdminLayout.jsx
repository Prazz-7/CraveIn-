import { Link, Outlet, useNavigate } from "react-router-dom";
import { useToast } from "./Toast.jsx";

export default function AdminLayout() {
  const navigate = useNavigate();

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const { toast } = useToast() ?? {};

  const logout = () => {
    sessionStorage.removeItem("admin");
    sessionStorage.removeItem("adminToken");
    if (toast) toast({ title: 'Signed out', description: 'You have been signed out of the admin portal.', variant: 'restaurant' });
    navigate("/admin/login");
  };

  return (
    <div
      className="portal-shell portal-shell--admin"
    >
      {/* Sidebar */}
      <div
        className="portal-sidebar"
      >
        <h2 className="portal-sidebar-title">🍔 CraveIn Admin</h2>

        <div className="portal-sidebar-links">
          <Link to="/admin/dashboard" className="portal-sidebar-link">
            📊 Dashboard
          </Link>

          <Link to="/admin/restaurants" className="portal-sidebar-link">
            🍽 Restaurants
          </Link>

          <Link to="/admin/orders" className="portal-sidebar-link">
            📦 Orders
          </Link>

          <Link to="/admin/customers" className="portal-sidebar-link">
            👥 Customers
          </Link>
        </div>

        <button
          className="btn btn-primary portal-sidebar-logout"
          onClick={logout}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="portal-main">
        <div className="portal-page-header">
          <h1>Administrator Dashboard</h1>
          <p>Welcome, {admin?.name}</p>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
