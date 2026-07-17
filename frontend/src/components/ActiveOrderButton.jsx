import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const isActive = order => !['delivered', 'cancelled'].includes(order.status?.toLowerCase());

export default function ActiveOrderButton() {
  const { isAuthenticated, token } = useAuth();
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setActiveOrder(null);
      return;
    }
    const load = async () => {
      try {
        const response = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) return;
        const orders = await response.json();
        setActiveOrder(Array.isArray(orders) ? orders.find(isActive) || null : null);
      } catch { setActiveOrder(null); }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  if (!activeOrder) return null;
  return <Link className="active-order-button" to={`/orders/${activeOrder.id}`}><span className="live-dot" /> Track Order</Link>;
}
