import { useEffect, useState } from "react";

export default function RestaurantProfile() {
  const restaurant = JSON.parse(sessionStorage.getItem("restaurant"));

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    cuisine: "",
    opening_hours: "",
    delivery_fee: "",
    min_order: "",
    image_url: "",
  });

  useEffect(() => {
    if (restaurant) {
      loadProfile();
    }
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/restaurant/profile/${restaurant.id}`
      );

      const data = await res.json();

      setForm(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfile = async () => {
    try {
      await fetch(
        `http://localhost:5000/api/restaurant/profile/${restaurant.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2>👤 Restaurant Profile</h2>

      <div style={card}>
        <Label>Name</Label>
        <input name="name" value={form.name} onChange={handleChange} style={input} />

        <Label>Email</Label>
        <input
          name="email"
          value={form.email}
          readOnly
          style={{ ...input, background: "#f3f3f3" }}
        />

        <Label>Phone</Label>
        <input name="phone" value={form.phone} onChange={handleChange} style={input} />

        <Label>Address</Label>
        <input name="address" value={form.address} onChange={handleChange} style={input} />

        <Label>Cuisine</Label>
        <input name="cuisine" value={form.cuisine} onChange={handleChange} style={input} />

        {/* <Label>Opening Hours</Label>
        <input
          name="opening_hours"
          value={form.opening_hours}
          onChange={handleChange}
          style={input}
        />

        <Label>Delivery Fee</Label>
        <input
          name="delivery_fee"
          value={form.delivery_fee}
          onChange={handleChange}
          style={input}
        />

        <Label>Minimum Order</Label>
        <input
          name="min_order"
          value={form.min_order}
          onChange={handleChange}
          style={input}
        /> */}

        <Label>Restaurant Image URL</Label>
        <input
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          style={input}
        />

        <button style={button} onClick={saveProfile}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <label
      style={{
        fontWeight: "bold",
        display: "block",
        marginTop: 15,
        marginBottom: 5,
      }}
    >
      {children}
    </label>
  );
}

const card = {
  background: "#fff",
  padding: 25,
  borderRadius: 12,
  boxShadow: "0 5px 12px rgba(0,0,0,.08)",
};

const input = {
  width: "100%",
  padding: 10,
  border: "1px solid #ddd",
  borderRadius: 6,
};

const button = {
  marginTop: 25,
  padding: "12px 20px",
  background: "#198754",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};