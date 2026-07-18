import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StarRating({ rating }) {
  return (
    <span className="stars">
      {[1,2,3,4,5].map(s => <span key={s}>{s <= Math.round(rating) ? '★' : '☆'}</span>)}
    </span>
  );
}

function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();
  return (
    <div className="card restaurant-card" onClick={() => navigate(`/restaurants/${restaurant.id}`)}>
      <img src={restaurant.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'} alt={restaurant.name} onError={e => e.target.src='https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600'} />
      <div className="restaurant-card-body">
        <div className="flex items-center justify-between">
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{restaurant.name}</h3>
          <span className="badge badge-primary">{restaurant.cuisine}</span>
        </div>
        <div className="restaurant-card-meta">
          <span><StarRating rating={restaurant.rating} /> {restaurant.rating}</span>
          <span>⏱ {restaurant.delivery_time}</span>
          <span>📍 {restaurant.distance}</span>
          <span>NPR {restaurant.delivery_fee} delivery</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/restaurants/featured')
      .then(r => r.json())
      .then(data => setFeatured(Array.isArray(data) ? data.map(r => ({ ...r, distance: (Math.random()*2.5+0.5).toFixed(1)+'km' })) : []))
      .catch(() => {});
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) navigate(`/restaurants?search=${encodeURIComponent(search)}`);
    else navigate('/restaurants');
  };

  return (
    <>
      <section className="hero">
        <img className="hero-bg" src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200" alt="Food" />
        <div className="hero-content">
          <div style={{ background: 'rgba(232,93,4,0.2)', border: '1px solid rgba(232,93,4,0.5)', color: '#ffb347', padding: '0.3rem 1rem', borderRadius: 50, fontSize: '0.85rem', fontWeight: 600, display: 'inline-block', marginBottom: '1rem' }}>
            Kathmandu's First Multi-Restaurant App
          </div>
          <h1 className="hero-title">
            Mix <span className="hero-highlight">Momos</span> &amp; <span style={{ color: '#f59e0b' }}>Chowmein</span>.<br />One Order.
          </h1>
          <p className="hero-sub">Refuse to compromise. Order from multiple nearby restaurants in a single cart with just one delivery fee.</p>
          <form className="hero-search" onSubmit={handleSearch}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="What are you craving?" />
            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      <div className="container">
        <section className="section">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '3rem' }}>
            {[['🍱','Multi-Restaurant Cart','Add items from different restaurants in one order'],
              ['💰','One Delivery Fee','Pay NPR 80 flat — no matter how many restaurants'],
              ['⚡','35 Min Avg Delivery','Fast delivery across Kathmandu Valley']
            ].map(([icon,title,desc]) => (
              <div key={title} className="card card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <h2 className="section-title">Featured Restaurants</h2>
          <p className="section-sub">Top-rated spots near you</p>
          <div className="grid-2">
            {featured.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/restaurants')}>View All Restaurants →</button>
          </div>
        </section>
      </div>
    </>
  );
}
