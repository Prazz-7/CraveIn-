import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

function StarRating({ rating, interactive, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="stars" style={{ cursor: interactive ? 'pointer' : 'default', fontSize: interactive ? '1.5rem' : undefined }}>
      {[1,2,3,4,5].map(s => (
        <span key={s}
          style={{ color: s <= (hover || rating) ? '#f59e0b' : '#d1d5db' }}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate(s)}>★</span>
      ))}
    </span>
  );
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');
  const [review, setReview] = useState({ rating: 0, comment: '', reviewerName: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setLoading(false); navigate('/restaurants'); });
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!data) return null;

  const menuByCategory = data.menuItems?.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {}) || {};

  const cartCount = (itemId) => items.find(i => i.id === itemId)?.quantity || 0;

  const handleReview = async e => {
    e.preventDefault();
    if (!review.rating) return alert('Please select a star rating');
    setSubmitting(true);
    const res = await fetch(`/api/restaurants/${id}/reviews`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cravein-token')}` },
      body: JSON.stringify(review),
    });
    if (res.ok) {
      const newRev = await res.json();
      setData(prev => ({ ...prev, reviews: [{ ...newRev, created_at: new Date().toISOString(), reviewer_name: review.reviewerName }, ...prev.reviews] }));
      setReview({ rating: 0, comment: '', reviewerName: '' });
    }
    setSubmitting(false);
  };

  return (
    <div>
      <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        <img src={data.image_url || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200'} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src='https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200'} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem 2rem', color: '#fff' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>{data.cuisine}</span>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize: '2rem', fontWeight: 800 }}>{data.name}</h1>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', marginTop: '0.25rem', opacity: 0.9 }}>
            <span>⭐ {data.rating} ({data.review_count} reviews)</span>
            <span>⏱ {data.delivery_time}</span>
            <span>💰 NPR {data.delivery_fee} delivery</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
          {['menu','reviews','about'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ background: 'none', border: 'none', padding: '0.75rem 0', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent', textTransform: 'capitalize' }}>
              {tab}
            </button>
          ))}
        </div>

        {data.clusterRestaurants?.length > 0 && (
          <section className="card card-body" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Available for Combined Delivery</h2>
            <p className="text-muted text-sm" style={{ marginBottom: '1rem' }}>These restaurants are in the same delivery cluster and can be combined in one order with a single delivery fee.</p>
            <div className="grid-2">
              {data.clusterRestaurants.map(restaurant => (
                <div key={restaurant.id} className="card restaurant-card" onClick={() => navigate(`/restaurants/${restaurant.id}`)} style={{ cursor: 'pointer' }}>
                  <img src={restaurant.image_url || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600'} alt={restaurant.name} onError={e => e.target.src='https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600'} />
                  <div className="restaurant-card-body">
                    <div className="flex items-center justify-between">
                      <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{restaurant.name}</h3>
                      <span className="badge badge-primary">{restaurant.cuisine}</span>
                    </div>
                    <div className="restaurant-card-meta">
                      <span>⭐ {restaurant.rating}</span>
                      <span>⏱ {restaurant.delivery_time}</span>
                      <span>📍 {restaurant.distance || 'Nearby'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'menu' && (
          <div>
            {Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category} style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>{category}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
                  {items.map(item => (
                    <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', padding: '1rem', gap: '1rem' }}>
                      {item.image_url && <img src={item.image_url} alt={item.name} style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600 }}>{item.name}</span>
                          {item.is_popular && <span className="badge badge-primary">Popular</span>}
                          {item.is_vegetarian && <span className="badge badge-green">Veg</span>}
                        </div>
                        {item.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{item.description}</p>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>NPR {item.price}</span>
                          {cartCount(item.id) > 0 ? (
                            <span className="badge badge-primary">✓ {cartCount(item.id)} in cart</span>
                          ) : (
                            <button className="btn btn-primary btn-sm" onClick={() => addItem(item, data)}>+ Add</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ maxWidth: 640 }}>
            <form className="card card-body" style={{ marginBottom: '1.5rem' }} onSubmit={handleReview}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Write a Review</h3>
              <div className="form-group">
                <label className="form-label">Your Rating</label>
                <StarRating rating={review.rating} interactive onRate={r => setReview(p => ({ ...p, rating: r }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input className="form-input" value={review.reviewerName} onChange={e => setReview(p => ({ ...p, reviewerName: e.target.value }))} placeholder="Anonymous" />
              </div>
              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea className="form-input" rows={3} value={review.comment} onChange={e => setReview(p => ({ ...p, comment: e.target.value }))} placeholder="Share your experience..." />
              </div>
              <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
            </form>
            {data.reviews?.map((r, i) => (
              <div key={i} className="card card-body" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>{r.reviewer_name || 'Anonymous'}</span>
                  <StarRating rating={r.rating} />
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <div style={{ maxWidth: 560 }}>
            <div className="card card-body">
              <p style={{ marginBottom: '1rem' }}>{data.description}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                <span>📍 {data.address}</span>
                <span>⏱ Delivery: {data.delivery_time}</span>
                <span>💰 Delivery fee: NPR {data.delivery_fee}</span>
                <span>🛒 Min order: NPR {data.min_order}</span>
                <span>🟢 {data.is_open ? 'Open Now' : 'Currently Closed'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
