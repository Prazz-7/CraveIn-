import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function EsewaFailure() {
  const { token } = useAuth();
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    // Try to read pending esewa info and cancel the order on the server
    let info = null;
    try { info = JSON.parse(localStorage.getItem('pendingEswa') || 'null'); } catch (e) { info = null; }
    if (!info || !info.orderId) return;

    const cancel = async () => {
      setCancelling(true);
      setCancelError('');
      try {
        const res = await fetch(`/api/orders/${info.orderId}/cancel`, {
          method: 'PATCH',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to cancel order');
        }

        try { localStorage.removeItem('pendingEswa'); } catch (e) {}
      } catch (err) {
        setCancelError(err.message || 'Could not cancel order');
      } finally {
        setCancelling(false);
      }
    };

    cancel();
  }, [token]);

  return (
    <div className="container" style={{ paddingTop: '5rem', textAlign: 'center', maxWidth: 480 }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
      <h2>Payment was not completed</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Your eSewa payment was cancelled or failed. {cancelling ? 'Cancelling order…' : 'Your order was not charged — you can try again from your orders page.'}
      </p>
      {cancelError && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{cancelError}</p>}
      <Link className="btn btn-primary" to="/orders">View your orders</Link>
    </div>
  );
}
