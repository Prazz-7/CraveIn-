import { useEffect, useState } from "react";

export default function RestaurantDashboard() {
  const restaurant = JSON.parse(sessionStorage.getItem("restaurant"));

  const [stats, setStats] = useState({
    menuItems: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
  });

  const loadDashboard = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/restaurant/dashboard/${restaurant.id}`
      );

      const data = await res.json();

      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (restaurant) {
      loadDashboard();
      const intervalId = setInterval(loadDashboard, 5000);
      return () => clearInterval(intervalId);
    }
  }, [restaurant?.id]);

  if (!restaurant) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Restaurant not logged in.</h2>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 10 }}>
        Welcome, {restaurant.name} 👋
      </h1>

      <p
        style={{
          color: "#666",
          marginBottom: 30,
        }}
      >
        Here's today's overview of your restaurant.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 20,
        }}
      >
        <Card
          title="🍽 Menu Items"
          value={stats.menuItems}
          color="#0d6efd"
        />

        <Card
          title="📦 Total Orders"
          value={stats.totalOrders}
          color="#fd7e14"
        />

        <Card
          title="⏳ Pending Orders"
          value={stats.pendingOrders}
          color="#dc3545"
        />

        <Card
          title="💰 Revenue"
          value={`NPR ${stats.revenue}`}
          color="#198754"
        />
      </div>
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: 25,
        borderRadius: 12,
        boxShadow: "0 5px 12px rgba(0,0,0,.08)",
      }}
    >
      <h3
        style={{
          color,
          marginBottom: 15,
        }}
      >
        {title}
      </h3>

      <h1
        style={{
          margin: 0,
        }}
      >
        {value}
      </h1>
    </div>
  );
}