import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useToast } from "../components/Toast.jsx";

export default function RestaurantLogin() {
  const navigate = useNavigate();
  const { toast } = useToast() ?? {};

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/restaurant/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      sessionStorage.setItem("restaurantToken", data.token);
      sessionStorage.setItem(
        "restaurant",
        JSON.stringify(data.restaurant)
      );

      if (toast) toast({ title: 'Welcome back', description: `Signed in as ${data.restaurant?.name || data.restaurant?.email || 'restaurant'}`, duration: 3500, variant: 'restaurant' });

      navigate("/restaurant/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: 440, margin: "4rem auto", padding: "0 1.5rem" }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2rem",
            textAlign: "center",
            marginBottom: "0.5rem",
            color: "var(--primary)",
          }}
        >
          Restaurant Portal
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "var(--text-muted)",
            marginBottom: "2rem",
          }}
        >
          Sign in to manage incoming orders from your restaurant.
        </p>

        <form className="card card-body" onSubmit={handleSubmit}>
          <h2 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>
            Restaurant Login
          </h2>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "0.75rem",
                borderRadius: 8,
                marginBottom: "1rem",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>

            <input
              type="email"
              className="form-input"
              placeholder="restaurant@gmail.com"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>

            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </>
  );
}