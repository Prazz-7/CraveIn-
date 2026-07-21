import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';

const OrderStatusContext = createContext({ activeOrders: [] });

const STATUS_MESSAGES = {
  confirmed:          { emoji: '✅', title: 'Order confirmed!',        description: 'The restaurant received your order.' },
  preparing:          { emoji: '👨‍🍳', title: 'Now preparing your food', description: 'Your food is being cooked fresh right now.' },
  'out for delivery': { emoji: '🛵', title: 'Out for delivery!',        description: 'Your rider is on the way.' },
  delivered:          { emoji: '🎉', title: 'Order delivered!',         description: 'Enjoy your meal!' },
};

const isActiveOrder = order => !['delivered', 'cancelled'].includes(order.status?.toLowerCase());

export function OrderStatusProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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
            const prev = lastStatusRef.current[o.id];
            if (prev !== undefined && prev !== o.status) {
              const msg = STATUS_MESSAGES[o.status?.toLowerCase()];
              if (msg) {
                toast({
                  title: `${msg.emoji} ${msg.title}`,
                  description: msg.description,
                  duration: 6000,
                  action: { label: 'Track', onClick: () => navigate(`/orders/${o.id}`) },
                });
              }
            }
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
  }, [isAuthenticated, token, toast, navigate]);

  return (
    <OrderStatusContext.Provider value={{ activeOrders }}>
      {children}
    </OrderStatusContext.Provider>
  );
}

export function useOrderStatus() {
  return useContext(OrderStatusContext) ?? { activeOrders: [] };
}
