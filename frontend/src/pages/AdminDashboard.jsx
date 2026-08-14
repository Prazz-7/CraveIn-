import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const admin = JSON.parse(sessionStorage.getItem("admin"));

  const [stats, setStats] = useState({
    customers: 0,
    restaurants: 0,
    orders: 0,
    pending: 0,
  });

  const logout = () => {
    sessionStorage.removeItem("admin");
    sessionStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const loadDashboard = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/dashboard");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadDashboard();
    const intervalId = setInterval(loadDashboard, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="portal-dashboard">
      <div className="portal-page-header">
        <h1>Administrator Dashboard</h1>
        <p>Welcome, {admin?.name}</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 20,
        }}
      >
        <Card title="👥 Customers" value={stats.customers} />
        <Card title="🍽 Restaurants" value={stats.restaurants} />
        <Card title="📦 Orders" value={stats.orders} />
        <Card title="⏳ Pending Orders" value={stats.pending} />
      </div>

      <div className="portal-dashboard-panel">
        <h2>Recent Activity</h2>

        <p>✔ Dashboard connected successfully.</p>

        <p>✔ Live statistics loaded.</p>

        <p>✔ Administrator logged in.</p>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 25,
        boxShadow: "0 4px 10px rgba(0,0,0,.08)",
      }}
    >
      <h3>{title}</h3>

      <h1
        style={{
          marginTop: 15,
          color: "#e85d04",
          fontSize: 45,
        }}
      >
        {value}
      </h1>
    </div>
  );
}
