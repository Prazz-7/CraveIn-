import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrderStatus } from '../context/OrderStatusContext.jsx';

const terminalStatuses = ['delivered', 'rejected', 'cancelled'];

export default function ActiveOrderButton() {
  const { activeOrders = [] } = useOrderStatus() ?? {};
  const activeOrder = activeOrders[0] ?? null;

  const [fallbackOrder, setFallbackOrder] = useState(null);

  useEffect(() => {
    // If we have an activeOrder from context, clear fallback
    if (activeOrder) {
      setFallbackOrder(null);
      return;
    }

    // Otherwise try to load lastOrderId from sessionStorage
    const id = sessionStorage.getItem('lastOrderId');
    if (!id) return;

    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        // If any order item was rejected, treat the order as terminal and clear lastOrderId
        const anyItemRejected = Array.isArray(data.items) && data.items.some(it => String(it.status || '').toLowerCase() === 'rejected');
        if (anyItemRejected) {
          try { sessionStorage.removeItem('lastOrderId'); } catch (e) {}
          return;
        }

        const status = String(data.status || '').toLowerCase();
        if (!terminalStatuses.includes(status)) {
          setFallbackOrder({ id: data.id, status: data.status });
        } else {
          // clear stale lastOrderId when order is terminal
          try { sessionStorage.removeItem('lastOrderId'); } catch (e) {}
        }
      } catch (e) {
        // ignore
      }
    };

    load();

    return () => { cancelled = true; };
  }, [activeOrder]);

  const order = activeOrder || fallbackOrder;

  if (!order) return null;

  const statusText = order.status ? ` — ${String(order.status).replace(/_/g, ' ')}` : '';

  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 1200 }}>
      <Link
        to={`/orders/${order.id}`}
        aria-label="Track my order"
        style={{
          background: 'var(--primary)',
          color: '#fff',
          border: 'none',
          padding: '12px 18px',
          borderRadius: 9999,
          boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
          cursor: 'pointer',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
        }}
      >
        <span style={{ fontSize: 18 }}>📦</span>
        <span>Track My Order{statusText}</span>
      </Link>
    </div>
  );
}
