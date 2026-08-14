import { useEffect, useState } from "react";

const thStyle = {
  padding: "15px",
  textAlign: "left",
  fontWeight: "bold",
};

const tdStyle = {
  padding: "15px",
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  cuisine: "",
  address: "",
  opening_time: "",
  closing_time: "",
  description: "",
};

export default function ManageRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [statusRestaurant, setStatusRestaurant] = useState(null);

  const [statusForm, setStatusForm] = useState({
    reason: "",
    until: "",
  });
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(emptyForm);

  // =========================
  // LOAD RESTAURANTS
  // =========================
  const loadRestaurants = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/restaurants");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load restaurants");
      }

      setRestaurants(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load restaurants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  // =========================
  // ADD RESTAURANT
  // =========================
  const saveRestaurant = async () => {
    try {
      const res = await fetch("/api/admin/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add restaurant.");
        return;
      }

      alert("Restaurant added successfully!");

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      loadRestaurants();
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };

  // =========================
  // UPDATE RESTAURANT
  // =========================
  const updateRestaurant = async () => {
    try {
      const res = await fetch(`/api/admin/restaurants/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update restaurant.");
        return;
      }

      alert("Restaurant updated successfully!");

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      loadRestaurants();
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };

  // =========================
  // TEMPORARY CLOSE / REOPEN
  // =========================
// const toggleRestaurantStatus = async (restaurant) => {
//   // Reopen restaurant
//   if (restaurant.temporary_closed) {
//     const ok = window.confirm(
//       `Reopen ${restaurant.name}?`
//     );

//     if (!ok) return;

//     try {
//       const res = await fetch(
//         `http://localhost:5000/api/admin/restaurants/${restaurant.id}/status`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             action: "open",
//           }),
//         }
//       );

//       const data = await res.json();

//       if (!res.ok) {
//         alert(data.error || "Failed to reopen restaurant.");
//         return;
//       }

//       alert("Restaurant reopened successfully.");

//       loadRestaurants();
//     } catch (err) {
//       console.error(err);
//       alert("Server error.");
//     }

//     return;
//   }

//   // Temporarily close restaurant
//   const until = window.prompt(
//     "Enter reopening date and time.\n\nExample: 2026-08-10T10:00"
//   );

//   if (!until) {
//     alert("Reopening date/time is required.");
//     return;
//   }

//   const reason = window.prompt(
//     "Enter the reason for temporary closure:"
//   );

//   try {
//     const res = await fetch(
//       `http://localhost:5000/api/admin/restaurants/${restaurant.id}/status`,
//       {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           action: "close",
//           until: until,
//           reason: reason || "Temporarily closed by admin",
//         }),
//       }
//     );

//     const data = await res.json();

//     if (!res.ok) {
//       alert(data.error || "Failed to update restaurant status.");
//       return;
//     }

//     alert("Restaurant temporarily closed.");

//     loadRestaurants();
//   } catch (err) {
//     console.error(err);
//     alert("Server error.");
//   }
// };

  const openStatusForm = (restaurant) => {
    setStatusRestaurant(restaurant);

    setStatusForm({
      reason: "",
      until: "",
    });

    setShowStatusForm(true);
  };

  const closeRestaurantTemporarily = async () => {
    if (!statusRestaurant) return;

    if (!statusForm.reason.trim()) {
      alert("Please enter a reason for the temporary closure.");
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/restaurants/${statusRestaurant.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "close",
            until: statusForm.until || null,
            reason: statusForm.reason.trim(),
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to close restaurant.");
        return;
      }

      alert("Restaurant temporarily closed.");

      setShowStatusForm(false);
      setStatusRestaurant(null);

      setStatusForm({
        reason: "",
        until: "",
      });

      loadRestaurants();
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };

  const reopenRestaurant = async (restaurant) => {
    if (!window.confirm(`Reopen ${restaurant.name}?`)) {
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/restaurants/${restaurant.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "open",
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to reopen restaurant.");
        return;
      }

      alert("Restaurant reopened.");

      loadRestaurants();
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };

  // =========================
  // DELETE RESTAURANT
  // =========================
  const deleteRestaurant = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this restaurant?",
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/restaurants/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete restaurant.");
        return;
      }

      alert("Restaurant deleted successfully!");

      loadRestaurants();
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };

  // =========================
  // EDIT BUTTON
  // =========================
  const startEditing = (restaurant) => {
    setEditingId(restaurant.id);

    setForm({
      name: restaurant.name || "",
      email: restaurant.email || "",
      password: "",
      phone: restaurant.phone || "",
      cuisine: restaurant.cuisine || "",
      address: restaurant.address || "",
      opening_time: restaurant.opening_time || "",
      closing_time: restaurant.closing_time || "",
      description: restaurant.description || "",
    });

    setShowForm(true);
  };

  // =========================
  // CLOSE FORM
  // =========================
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div
      className="portal-dashboard"
      style={{
        padding: "2rem",
        background: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* ================= HEADER ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>🍽 Restaurant Management</h1>

          <p
            style={{
              color: "#666",
              marginTop: 5,
            }}
          >
            Manage all restaurants registered in CraveIn.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
        >
          + Add Restaurant
        </button>
      </div>

      {/* ================= ADD / EDIT FORM ================= */}

      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: "min(650px, 92vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 12,
              padding: 30,
            }}
          >
            <h2 style={{ marginBottom: 20 }}>
              {editingId ? "Edit Restaurant" : "Add Restaurant"}
            </h2>

            <div
              className="portal-modal-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 15,
              }}
            >
              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Name</label>
                <input
                  placeholder="Restaurant Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Email</label>
                <input
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              {!editingId && (
                <div>
                  <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Password</label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Phone</label>
                <input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Cuisine</label>
                <input
                  placeholder="Cuisine"
                  value={form.cuisine}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cuisine: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Address</label>
                <input
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Opening Time</label>
                <input
                  type="time"
                  value={form.opening_time}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      opening_time: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Closing Time</label>
                <input
                  type="time"
                  value={form.closing_time}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      closing_time: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <textarea
              placeholder="Description"
              rows={4}
              style={{
                width: "100%",
                marginTop: 15,
                padding: 10,
                boxSizing: "border-box",
              }}
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 20,
                gap: 10,
              }}
            >
              <button className="btn btn-outline" onClick={closeForm}>
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={editingId ? updateRestaurant : saveRestaurant}
              >
                {editingId ? "Update Restaurant" : "Save Restaurant"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showStatusForm && statusRestaurant && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        width: "min(450px, 92vw)",
        background: "#fff",
        borderRadius: 12,
        padding: 30,
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      }}
    >
      <h2 style={{ marginBottom: 8 }}>
        Temporarily Close Restaurant
      </h2>

      <p
        style={{
          color: "#666",
          marginBottom: 20,
        }}
      >
        {statusRestaurant.name}
      </p>

      <label
        style={{
          display: "block",
          fontWeight: "bold",
          marginBottom: 6,
        }}
      >
        Reason
      </label>

      <input
        type="text"
        placeholder="e.g. Festival, holiday, maintenance"
        value={statusForm.reason}
        onChange={(e) =>
          setStatusForm({
            ...statusForm,
            reason: e.target.value,
          })
        }
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 15,
          border: "1px solid #ddd",
          borderRadius: 6,
          boxSizing: "border-box",
        }}
      />

      <label
        style={{
          display: "block",
          fontWeight: "bold",
          marginBottom: 6,
        }}
      >
        Reopen At
      </label>

      <input
        type="datetime-local"
        value={statusForm.until}
        onChange={(e) =>
          setStatusForm({
            ...statusForm,
            until: e.target.value,
          })
        }
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 20,
          border: "1px solid #ddd",
          borderRadius: 6,
          boxSizing: "border-box",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <button
          className="btn btn-outline"
          onClick={() => {
            setShowStatusForm(false);
            setStatusRestaurant(null);
          }}
        >
          Cancel
        </button>

        <button
          className="btn btn-primary"
          onClick={closeRestaurantTemporarily}
        >
          🔒 Close Restaurant
        </button>
      </div>
    </div>
  </div>
)}

      {/* ================= RESTAURANT TABLE ================= */}

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 5px 15px rgba(0,0,0,.08)",
        }}
      >
        <div className="portal-table-wrap">
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead
            style={{
              background: "#e85d04",
              color: "white",
            }}
          >
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Restaurant</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Cuisine</th>
              <th style={thStyle}>Address</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                  }}
                >
                  Loading restaurants...
                </td>
              </tr>
            ) : restaurants.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#666",
                  }}
                >
                  No restaurants found.
                </td>
              </tr>
            ) : (
              restaurants.map((restaurant) => (
                <tr
                  key={restaurant.id}
                  style={{
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <td style={tdStyle}>{restaurant.id}</td>

                  <td style={tdStyle}>
                    <strong>{restaurant.name}</strong>
                  </td>

                  <td style={tdStyle}>{restaurant.email}</td>

                  <td style={tdStyle}>{restaurant.phone}</td>

                  <td style={tdStyle}>{restaurant.cuisine}</td>

                  <td style={tdStyle}>{restaurant.address}</td>

                  {/* STATUS */}

                  <td style={tdStyle}>
                    {restaurant.current_status === "temporarily_closed" ? (
                      <span
                        style={{
                          background: "#fee2e2",
                          color: "#dc2626",
                          padding: "6px 10px",
                          borderRadius: 20,
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        🔒 Temporarily Closed
                      </span>
                    ) : restaurant.current_status === "open" ? (
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#198754",
                          padding: "6px 10px",
                          borderRadius: 20,
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        🟢 Open
                      </span>
                    ) : (
                      <span
                        style={{
                          background: "#f3f4f6",
                          color: "#6b7280",
                          padding: "6px 10px",
                          borderRadius: 20,
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        🔴 Closed
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}

                  <td style={tdStyle}>
                    <button
                      style={{
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "8px 15px",
                        borderRadius: 6,
                        cursor: "pointer",
                        marginRight: 8,
                      }}
                      onClick={() => startEditing(restaurant)}
                    >
                      ✏ Edit
                    </button>

                    <button
                      onClick={() =>
                        restaurant.temporary_closed
                          ? reopenRestaurant(restaurant)
                          : openStatusForm(restaurant)
                      }
                      style={{
                        background: restaurant.temporary_closed
                          ? "#198754"
                          : "#f59e0b",
                        color: "white",
                        border: "none",
                        padding: "8px 15px",
                        borderRadius: 6,
                        cursor: "pointer",
                        marginRight: 8,
                      }}
                    >
                      {restaurant.temporary_closed ? "🔓 Reopen" : "🔒 Close"}
                    </button>

                    <button
                      onClick={() => deleteRestaurant(restaurant.id)}
                      style={{
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        padding: "8px 15px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
