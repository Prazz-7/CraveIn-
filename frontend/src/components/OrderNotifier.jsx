import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "./Toast.jsx";
import { useNavigate } from "react-router-dom";

const STATUS_MESSAGES = {
    pending_confirmation: {
    emoji: "🕑",
    title: "Order pending confirmation!",
    description: "Waiting for restaurant to confirm your order.",
  },
  confirmed: {
    emoji: "✅",
    title: "Order confirmed!",
    description: "The restaurant received your order.",
  },
  preparing: {
    emoji: "👨‍🍳",
    title: "Preparing your food!",
    description: "Your food is being cooked fresh right now.",
  },
    ready: {
    emoji: "✅",
    title: "Your order is ready!",
    description: "Your food is ready for pickup.",
  },
  "out for delivery": {
    emoji: "🛵",
    title: "Out for delivery!",
    description: "Your rider is on the way.",
  },
  delivered: {
    emoji: "🎉",
    title: "Order delivered!",
    description: "Enjoy your meal!",
  },
};

export function OrderNotifier() {
  const { isAuthenticated = false, token = null } = useAuth() ?? {};
  const { toast = () => {} } = useToast() ?? {};
  const navigate = useNavigate();
  const lastStatusRef = useRef({});
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token) return undefined;

    let intervalId;

    const check = async () => {
      try {
        const res = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;

        const orders = await res.json();
        const activeOrders = Array.isArray(orders)
          ? orders.filter(
              (order) =>
                !["delivered", "cancelled"].includes(
                  String(order.status || "").toLowerCase(),
                ),
            )
          : [];

        if (!initializedRef.current) {
          for (const order of orders || []) {
            if (order?.id !== undefined) {
              lastStatusRef.current[order.id] = order.status;
            }
          }
          initializedRef.current = true;
          return;
        }

        for (const order of activeOrders) {
          const prev = lastStatusRef.current[order.id];
          const statusKey = String(order.status || "").toLowerCase();

          if (prev !== undefined && prev !== order.status) {
            if (statusKey === 'rejected') {
              // Determine which restaurants rejected this order
              const rejectedNames = Array.from(
                new Set(
                  (order.items || [])
                    .filter(i => String(i.status || '').toLowerCase() === 'rejected')
                    .map(i => i.restaurant_name)
                )
              );

              const description = rejectedNames.length > 0
                ? `Order rejected by: ${rejectedNames.join(', ')}. Please place your order again.`
                : 'Your order was rejected. Please place a new order.';

              toast({
                title: `❌ Order rejected`,
                description,
                duration: 10000,
                action: {
                  label: 'Track',
                  onClick: () => navigate(`/orders/${order.id}`),
                },
              });
            } else {
              const msg = STATUS_MESSAGES[statusKey];
              if (msg) {
                toast({
                  title: `${msg.emoji} ${msg.title}`,
                  description: msg.description,
                  duration: 6000,
                  action: {
                    label: "Track",
                    onClick: () => navigate(`/orders/${order.id}`),
                  },
                });
              }
            }
          }

          lastStatusRef.current[order.id] = order.status;
        }
      } catch {
        // silently ignore polling errors
      }
    };

    check();
    intervalId = setInterval(check, 10000);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, token, toast, navigate]);

  return null;
}
