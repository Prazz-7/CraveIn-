import { useEffect, useState } from "react";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;

    try {
      await fetch(`http://localhost:5000/api/admin/orders/${id}`, {
        method: "DELETE",
      });

      loadOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toString().includes(search);

    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const badgeColor = (status) => {
    switch (status) {
      case "pending_confirmation":
        return "#f39c12";

      case "confirmed":
        return "#28a745";

      case "rejected":
        return "#dc3545";

      case "cancelled":
        return "#6c757d";

      case "delivered":
        return "#007bff";

      default:
        return "#666";
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 5 }}>Order Management</h1>

      <p style={{ color: "#666", marginBottom: 25 }}>
        Total Orders : <strong>{orders.length}</strong>
      </p>

      <div
        style={{
          display: "flex",
          gap: 15,
          marginBottom: 25,
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search customer or order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 300,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        >
          <option>All</option>
          <option value="pending_confirmation">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 5px 12px rgba(0,0,0,.08)",
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
                <th style={th}>ID</th>
                <th style={th}>Customer</th>
                <th style={th}>Total</th>
                <th style={th}>Payment</th>
                <th style={th}>Status</th>
                <th style={th}>Date</th>
                <th style={th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td style={td}>{order.id}</td>

                  <td style={td}>{order.customer_name}</td>

                  <td style={td}>NPR {order.total_amount}</td>

                  <td style={td}>{order.payment_method}</td>

                  <td style={td}>
                    <span
                      style={{
                        background: badgeColor(order.status),
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: 20,
                        fontSize: 13,
                      }}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td style={td}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>

                  <td style={td}>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: 30,
                      color: "#666",
                    }}
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const th = {
  padding: "14px",
  textAlign: "left",
};

const td = {
  padding: "14px",
  borderBottom: "1px solid #eee",
};