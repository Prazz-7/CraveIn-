import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useToast } from "../components/Toast.jsx";

export default function AdminLogin() {
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
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      sessionStorage.setItem("adminToken", data.token);
      sessionStorage.setItem("admin", JSON.stringify(data.admin));

      if (toast) toast({ title: 'Welcome back', description: `Signed in as ${data.admin?.name || data.admin?.email || 'admin'}`, duration: 3500, variant: 'restaurant' });

      navigate("/admin/dashboard");
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
          Administrator Portal
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "var(--text-muted)",
            marginBottom: "2rem",
          }}
        >
          Sign in to manage the CraveIn platform.
        </p>

        <form className="card card-body" onSubmit={handleSubmit}>
          <h2 style={{ marginBottom: "1.5rem" }}>Admin Login</h2>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              className="form-input"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              required
            />
          </div>

          <button
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>
      </div>
    </>
  );
}