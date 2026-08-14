import { Link, Outlet, useNavigate } from "react-router-dom";
import { useToast } from "./Toast.jsx";

export default function RestaurantLayout() {
  const navigate = useNavigate();

  const restaurant = JSON.parse(sessionStorage.getItem("restaurant"));
  const { toast } = useToast() ?? {};

  const logout = () => {
    sessionStorage.removeItem("restaurant");
    sessionStorage.removeItem("restaurantToken");
    if (toast) toast({ title: 'Signed out', description: 'You have been signed out of the restaurant portal.', variant: 'restaurant' });
    navigate("/restaurant/login");
  };

  return (
    <div
      className="portal-shell portal-shell--restaurant"
    >
      {/* Sidebar */}
      <div
        className="portal-sidebar"
      >
        <h2 className="portal-sidebar-title">🍔 CraveIn Restaurant</h2>

        <div className="portal-sidebar-links">
          <Link to="/restaurant/dashboard" className="portal-sidebar-link">
            📊 Dashboard
          </Link>

          <Link to="/restaurant/profile" className="portal-sidebar-link">
            👤 Profile
          </Link>

          <Link to="/restaurant/menu" className="portal-sidebar-link">
            🍽 Menu Items
          </Link>

          <Link to="/restaurant/orders" className="portal-sidebar-link">
            📦 Orders
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
          <h1>{restaurant?.name}</h1>
          <p>Restaurant Owner Dashboard</p>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
