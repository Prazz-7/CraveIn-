import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';

const OrderStatusContext = createContext({ activeOrders: [] });

const isActiveOrder = order => !['delivered', 'cancelled', 'rejected'].includes(order.status?.toLowerCase());

export function OrderStatusProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [activeOrders, setActiveOrders] = useState([]);
  const lastStatusRef = useRef({});
  const initializedRef = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const clearPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (!isAuthenticated || !token) {
      setActiveOrders([]);
      initializedRef.current = false;
      lastStatusRef.current = {};
      clearPolling();
      return;
    }

    let cancelled = false;

    const checkOrders = async () => {
      try {
        const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return null;
        const orders = await res.json();
        if (cancelled) return null;

        const active = Array.isArray(orders) ? orders.filter(isActiveOrder) : [];

        if (!initializedRef.current) {
          (Array.isArray(orders) ? orders : []).forEach(o => {
            lastStatusRef.current[o.id] = o.status;
          });
          initializedRef.current = true;
        } else {
          active.forEach(o => {
            lastStatusRef.current[o.id] = o.status;
          });
        }

        setActiveOrders(active);

        if (active.length && !intervalRef.current) {
          intervalRef.current = setInterval(checkOrders, 10000);
        }

        if (!active.length) {
          clearPolling();
        }

        return active;
      } catch {
        return null;
      }
    };

    checkOrders();

    return () => {
      cancelled = true;
      clearPolling();
    };
  }, [isAuthenticated, token]);

  return (
    <OrderStatusContext.Provider value={{ activeOrders }}>
      {children}
    </OrderStatusContext.Provider>
  );
}

export function useOrderStatus() {
  return useContext(OrderStatusContext) ?? { activeOrders: [] };
}
