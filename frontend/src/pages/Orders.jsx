import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_COLOR = { placed:'badge-gray', confirmed:'badge-primary', preparing:'badge-primary', 'out for delivery':'badge-green', delivered:'badge-green', cancelled:'badge-red' };

export default function Orders() {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isAuthenticated]);

  if (loading) return <div className="spinner" />;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize: '2rem', marginBottom: '2rem' }}>My Orders</h1>
      {orders.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h3>No orders yet</h3>
          <p style={{ marginBottom: '1.5rem' }}>Your order history will appear here</p>
          <button className="btn btn-primary" onClick={() => navigate('/restaurants')}>Start Ordering</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => (
            <div key={order.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${order.id}`)}>
              <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Order #{order.id}</span>
                    <span className={`badge ${STATUS_COLOR[order.status?.toLowerCase()] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{order.status}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    {new Date(order.created_at).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {order.restaurants?.map(r => r.name).join(' + ')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>NPR {order.total_amount}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{order.payment_method}</div>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>Track →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
