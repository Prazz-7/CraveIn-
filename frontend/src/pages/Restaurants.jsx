import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function StarRating({ rating }) {
  return <span className="stars">{[1,2,3,4,5].map(s => <span key={s}>{s <= Math.round(rating) ? '★' : '☆'}</span>)}</span>;
}

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('search');
    if (cat) setActiveCategory(cat);
    if (q) setSearch(q);
  }, []);

  useEffect(() => {
    fetch('/api/restaurants/categories').then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== 'All') params.set('category', activeCategory);
    if (search) params.set('search', search);
    fetch(`/api/restaurants?${params}`)
      .then(r => r.json())
      .then(data => { setRestaurants(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeCategory, search]);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Discover Restaurants</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input className="form-input" style={{ maxWidth: 420, flex: 1 }} placeholder="Search restaurants or dishes..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="category-pills">
        {['All', ...categories].map(cat => (
          <button key={cat} className={`pill${activeCategory === cat ? ' active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{restaurants.length} restaurants found</p>
          {restaurants.length === 0 ? (
            <div className="empty-state"><h3>No restaurants found</h3><p>Try a different search or category</p></div>
          ) : (
            <div className="grid-2">
              {restaurants.map(r => (
                <div key={r.id} className="card restaurant-card" onClick={() => navigate(`/restaurants/${r.id}`)}>
                  <img src={r.image_url || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600'} alt={r.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} onError={e => e.target.src='https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600'} />
                  <div style={{ padding: '1rem' }}>
                    <div className="flex items-center justify-between">
                      <h3 style={{ fontWeight: 700 }}>{r.name}</h3>
                      <span className="badge badge-primary">{r.cuisine}</span>
                    </div>
                    <div className="restaurant-card-meta">
                      <span><StarRating rating={r.rating} /> {r.rating}</span>
                      <span>⏱ {r.delivery_time}</span>
                      <span>📍 {r.distance}</span>
                      <span style={{ marginLeft: 'auto' }}>NPR {r.delivery_fee} delivery</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
