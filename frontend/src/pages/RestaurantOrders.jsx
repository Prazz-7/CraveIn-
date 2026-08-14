import { useEffect, useState } from "react";
import { useToast } from "../components/Toast.jsx";

export default function RestaurantOrders() {
  const restaurant = JSON.parse(sessionStorage.getItem("restaurant"));
  const { toast } = useToast() ?? {};

  const [orders, setOrders] = useState([]);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/restaurant/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            restaurantId: restaurant.id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      console.log("Status updated:", data);

      if (status === "rejected") {
        const rejectingNames = Array.isArray(data?.rejecting) && data.rejecting.length > 0
          ? data.rejecting.join(", ")
          : "another restaurant";

        toast?.({
          title: "Order rejected",
          description: `This order was rejected due to ${rejectingNames}.`,
          duration: 6000,
          variant: "restaurant",
        });
      }

      await loadOrders();
    } catch (err) {
      console.error("STATUS UPDATE ERROR:", err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/restaurant/orders/${restaurant.id}`
      );

      const data = await res.json();

      setOrders(data);
    } catch (err) {
      console.error("LOAD ORDERS ERROR:", err);
    }
  };

  useEffect(() => {
    if (restaurant?.id) {
      loadOrders();
      const intervalId = setInterval(loadOrders, 5000);
      return () => clearInterval(intervalId);
    }
  }, [restaurant?.id]);

  const th = {
    padding: 12,
    textAlign: "left",
  };

  const td = {
    padding: 12,
    borderBottom: "1px solid #eee",
  };

  const acceptBtn = {
    background: "#198754",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
    marginRight: 8,
  };

  const rejectBtn = {
    background: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
  };

  const disabledRejectBtn = {
    ...rejectBtn,
    background: "#adb5bd",
    cursor: "not-allowed",
    opacity: 0.7,
  };

  const formatStatus = (status) => {
    if (!status) return "";
    return String(status)
      .split(/[_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="portal-table-wrap">
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={th}>Order ID</th>
          <th style={th}>Customer</th>
          <th style={th}>Food</th>
          <th style={th}>Quantity</th>
          <th style={th}>Price</th>
          <th style={th}>Status</th>
          <th style={th}>Action</th>
        </tr>
      </thead>

      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td style={td}>{order.id}</td>

            <td style={td}>{order.customer}</td>

            <td style={td}>{order.name}</td>

            <td style={td}>{order.quantity}</td>

            <td style={td}>NPR {order.price}</td>

            <td style={td}>{formatStatus(order.status)}</td>

            <td style={td}>
              {order.status === "cancelled" ? (
                <span style={{ color: "#6c757d", fontWeight: "bold" }}>
                  ✖ Cancelled
                </span>
              ) : order.status === "out for delivery" ? (
                <>
                  <span style={{ color: "#1f7a1f", fontWeight: "bold" }}>
                    🚚 On the way
                  </span>
                  <div style={{ marginTop: 8 }}>
                    <button
                      style={disabledRejectBtn}
                      disabled
                      title="This order is already out for delivery"
                    >
                      Reject
                    </button>
                  </div>
                </>
              ) : order.status === "confirmed" || order.status === "preparing" || order.status === "ready" || order.status === "out for delivery" ? (
                <>
                  {order.status === "confirmed" && (
                    <button
                      style={acceptBtn}
                      onClick={() => updateStatus(order.id, "preparing")}
                    >
                      Preparing
                    </button>
                  )}

                  {order.status === "preparing" && (
                    <button
                      style={acceptBtn}
                      onClick={() => updateStatus(order.id, "ready")}
                    >
                      Ready
                    </button>
                  )}

                  {order.status === "ready" && (
                    <button
                      style={acceptBtn}
                      onClick={() => updateStatus(order.id, "out for delivery")}
                    >
                      Out for delivery
                    </button>
                  )}

                  <button
                    style={disabledRejectBtn}
                    disabled
                    title="Reject is disabled once the order is accepted"
                  >
                    Reject
                  </button>
                </>
              ) : order.status !== "delivered" && order.status !== "rejected" ? (
                <>
                  {order.status === "pending_confirmation" && (
                    <button
                      style={acceptBtn}
                      onClick={() => updateStatus(order.id, "confirmed")}
                    >
                      Accept
                    </button>
                  )}

                  <button
                    style={rejectBtn}
                    onClick={() => updateStatus(order.id, "rejected")}
                  >
                    Reject
                  </button>
                </>
              ) : order.status === "delivered" ? (
                <span style={{ color: "green", fontWeight: "bold" }}>
                  ✔ Completed
                </span>
              ) : (
                <span style={{ color: "red", fontWeight: "bold" }}>
                  ✖ Rejected
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}