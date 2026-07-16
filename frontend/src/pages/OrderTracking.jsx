import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PIPELINE = ['placed','confirmed','preparing','out for delivery','delivered'];
const LABELS = { placed:'Placed', confirmed:'Confirmed', preparing:'Preparing', 'out for delivery':'Out for Delivery', delivered:'Delivered' };

export default function OrderTracking() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => fetch(`/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    .then(r => r.json()).then(setOrder).catch(() => {});

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!order) return;
    const status = order.status?.toLowerCase();
    if (status === 'delivered' || status === 'cancelled') return;
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [order?.status]);

  if (loading) return <div className="spinner" />;
  if (!order) return <div className="empty-state"><h3>Order not found</h3><button className="btn btn-primary" onClick={() => navigate('/orders')}>Back to Orders</button></div>;

  const status = order.status?.toLowerCase();
  const isCancelled = status === 'cancelled';
  const isDelivered = status === 'delivered';
  const isActive = !isCancelled && !isDelivered;
  const currentIdx = PIPELINE.indexOf(status);
  const safeIdx = currentIdx === -1 ? 0 : currentIdx;
  const progressPct = (safeIdx / (PIPELINE.length - 1)) * 100;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem', maxWidth: 840 }}>
      <button className="btn btn-ghost" style={{ marginBottom: '1.5rem' }} onClick={() => navigate('/orders')}>← Back to Orders</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.8rem', display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
            Order #{order.id}
            {isActive && <span className="badge badge-primary"><span className="live-dot" style={{ marginRight: 4 }} />Live</span>}
            {isDelivered && <span className="badge badge-green">✅ Delivered</span>}
            {isCancelled && <span className="badge badge-red">Cancelled</span>}
          </h1>
          <p style={{ color:'var(--text-muted)', marginTop:'0.25rem' }}>
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' })}
          </p>
        </div>
        {isActive && order.estimated_delivery && (
          <div style={{ background:'var(--primary-light)', border:'2px solid rgba(232,93,4,0.2)', padding:'0.75rem 1.25rem', borderRadius:12, textAlign:'center' }}>
            <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:2 }}>Est. Arrival</div>
            <div style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--primary)' }}>
              {new Date(order.estimated_delivery).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="card" style={{ marginBottom:'2rem', overflow:'hidden' }}>
        <div style={{ padding:'2rem', background:'#fafaf8' }}>
          {isCancelled ? (
            <div style={{ textAlign:'center', padding:'1.5rem 0' }}>
              <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>❌</div>
              <h3 style={{ color:'#dc2626' }}>Order Cancelled</h3>
            </div>
          ) : (
            <div style={{ position:'relative' }}>
              <div style={{ position:'absolute', top:18, left:0, right:0, height:3, background:'var(--border)', borderRadius:4 }} />
              <div style={{ position:'absolute', top:18, left:0, height:3, background:'var(--primary)', borderRadius:4, width:`${progressPct}%`, transition:'width 0.6s ease' }} />
              <div className="steps">
                {PIPELINE.map((s, idx) => {
                  const done = idx <= safeIdx;
                  const current = idx === safeIdx;
                  return (
                    <div key={s} className="step">
                      <div className={`step-dot${done ? ' done' : current ? ' current' : ''}`}>
                        {done ? '✓' : ''}
                      </div>
                      <span className={`step-label${done ? ' done' : current ? ' current' : ''}`}>{LABELS[s]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {isActive && (
          <div style={{ background:'rgba(232,93,4,0.05)', borderTop:'1px solid rgba(232,93,4,0.1)', padding:'0.6rem 1.25rem', fontSize:'0.8rem', color:'var(--primary)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <span className="live-dot" />Updating live every 5 seconds
          </div>
        )}
      </div>

      <div className="grid-sidebar">
        <div className="card">
          <div className="card-header"><span style={{ fontWeight:700 }}>📦 Order Details</span></div>
          {(() => {
            const grouped = (order.items || []).reduce((acc, item) => {
              const key = item.restaurant_id;
              if (!acc[key]) acc[key] = { name: item.restaurant_name, items: [] };
              acc[key].items.push(item);
              return acc;
            }, {});
            return Object.values(grouped).map((g, i) => (
              <div key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}>
                <div style={{ padding:'0.75rem 1.25rem', background:'#fafafa', fontWeight:700, fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  🏪 {g.name}
                </div>
                {g.items.map(item => (
                  <div key={item.id} style={{ display:'flex', justifyContent:'space-between', padding:'0.75rem 1.25rem', borderTop:'1px solid var(--border)' }}>
                    <span><span style={{ fontWeight:700, color:'var(--primary)' }}>{item.quantity}×</span> {item.name}</span>
                    <span style={{ fontWeight:700 }}>NPR {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            ));
          })()}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className="card card-body" style={{ background:'var(--primary-light)' }}>
            <h4 style={{ fontWeight:700, marginBottom:'0.75rem' }}>💰 Summary</h4>
            <div style={{ display:'flex', justifyContent:'space-between', color:'var(--text-muted)', marginBottom:'0.5rem' }}><span>Subtotal</span><span>NPR {order.total_amount - order.delivery_fee}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', color:'var(--text-muted)', marginBottom:'0.75rem' }}><span>Delivery</span><span>NPR {order.delivery_fee}</span></div>
            <div className="separator" style={{ margin:'0.5rem 0' }} />
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:'1.1rem' }}><span>Total</span><span style={{ color:'var(--primary)' }}>NPR {order.total_amount}</span></div>
            <div style={{ marginTop:'0.75rem', color:'var(--text-muted)', fontSize:'0.85rem' }}>💳 {order.payment_method}</div>
          </div>
          <div className="card card-body">
            <h4 style={{ fontWeight:700, marginBottom:'0.5rem' }}>📍 Delivery Address</h4>
            <div style={{ background:'var(--bg)', padding:'0.75rem', borderRadius:8, border:'1px dashed var(--border)', fontSize:'0.9rem' }}>{order.delivery_address}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
