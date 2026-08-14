import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function StarRating({ rating }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s}>{s <= Math.round(rating) ? '★' : '☆'}</span>
      ))}
    </span>
  );
}

// Automatically determine restaurant status using Nepal time
function getRestaurantStatus(restaurant) {
  // Temporary closure has priority
  if (restaurant.temporary_closed) {
    if (
      restaurant.temporary_closed_until &&
      new Date() >= new Date(restaurant.temporary_closed_until)
    ) {
      return 'open';
    }

    return 'temporarily_closed';
  }

  // If schedule is missing, fall back to database is_open value
  if (!restaurant.opening_time || !restaurant.closing_time) {
    return restaurant.is_open ? 'open' : 'closed';
  }

  // Get current Nepal time
  const now = new Date(
    new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kathmandu',
    })
  );

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  const openParts = String(restaurant.opening_time)
    .split(':')
    .map(Number);

  const closeParts = String(restaurant.closing_time)
    .split(':')
    .map(Number);

  if (openParts.length < 2 || closeParts.length < 2) {
    return restaurant.is_open ? 'open' : 'closed';
  }

  const openHour = openParts[0];
  const openMinute = openParts[1];
  const closeHour = closeParts[0];
  const closeMinute = closeParts[1];

  const openingMinutes = openHour * 60 + openMinute;
  const closingMinutes = closeHour * 60 + closeMinute;

  // Handle overnight schedules, including midnight closing times.
  if (closingMinutes <= openingMinutes) {
    if (
      currentMinutes >= openingMinutes ||
      currentMinutes < closingMinutes
    ) {
      return 'open';
    }
  } else {
    if (
      currentMinutes >= openingMinutes &&
      currentMinutes < closingMinutes
    ) {
      return 'open';
    }
  }

  return 'closed';
}

function StatusBadge({ status }) {
  if (status === 'temporarily_closed') {
    return (
      <span
        style={{
          background: '#fef3c7',
          color: '#92400e',
          padding: '5px 10px',
          borderRadius: 20,
          fontSize: '0.75rem',
          fontWeight: 700,
        }}
      >
        🔒 Temporarily Closed
      </span>
    );
  }

  if (status === 'open') {
    return (
      <span
        style={{
          background: '#dcfce7',
          color: '#166534',
          padding: '5px 10px',
          borderRadius: 20,
          fontSize: '0.75rem',
          fontWeight: 700,
        }}
      >
        🟢 Open
      </span>
    );
  }

  return (
    <span
      style={{
        background: '#fee2e2',
        color: '#991b1b',
        padding: '5px 10px',
        borderRadius: 20,
        fontSize: '0.75rem',
        fontWeight: 700,
      }}
    >
      🔴 Closed
    </span>
  );
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
    fetch('/api/restaurants/categories')
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams();

    if (activeCategory !== 'All') {
      params.set('category', activeCategory);
    }

    if (search) {
      params.set('search', search);
    }

    fetch(`/api/restaurants?${params}`)
      .then(r => r.json())
      .then(data => {
        setRestaurants(
          Array.isArray(data) ? data : []
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeCategory, search]);

  return (
    <div
      className="container"
      style={{
        paddingTop: '2rem',
        paddingBottom: '3rem',
      }}
    >
      <h1
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
        }}
      >
        Discover Restaurants
      </h1>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        <input
          className="form-input"
          style={{
            maxWidth: 420,
            flex: 1,
          }}
          placeholder="Search restaurants or dishes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="category-pills">
        {['All', ...categories].map(cat => (
          <button
            key={cat}
            className={`pill${
              activeCategory === cat ? ' active' : ''
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          <p
            style={{
              color: 'var(--text-muted)',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
            }}
          >
            {restaurants.length} restaurants found
          </p>

          {restaurants.length === 0 ? (
            <div className="empty-state">
              <h3>No restaurants found</h3>
              <p>
                Try a different search or category
              </p>
            </div>
          ) : (
            <div className="grid-2">
              {restaurants.map(r => {
                const status = getRestaurantStatus(r);

                return (
                  <div
                    key={r.id}
                    className="card restaurant-card"
                    onClick={() =>
                      navigate(`/restaurants/${r.id}`)
                    }
                    style={{
                      cursor: 'pointer',
                      opacity:
                        status === 'closed' ||
                        status === 'temporarily_closed'
                          ? 0.75
                          : 1,
                    }}
                  >
                    <img
                      src={
                        r.image_url ||
                        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600'
                      }
                      alt={r.name}
                      style={{
                        width: '100%',
                        height: 180,
                        objectFit: 'cover',
                      }}
                      onError={e =>
                        (e.target.src =
                          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600')
                      }
                    />

                    <div style={{ padding: '1rem' }}>
                      <div
                        className="flex items-center justify-between"
                      >
                        <h3 style={{ fontWeight: 700 }}>
                          {r.name}
                        </h3>

                        <span className="badge badge-primary">
                          {r.cuisine}
                        </span>
                      </div>

                      {/* Restaurant Status */}
                      <div
                        style={{
                          marginTop: '0.6rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <StatusBadge status={status} />
                      </div>

                      <div className="restaurant-card-meta">
                        <span>
                          <StarRating rating={r.rating} />{' '}
                          {r.rating}
                        </span>

                        <span>
                          ⏱ {r.delivery_time}
                        </span>

                        <span>
                          📍 {r.distance}
                        </span>

                        <span
                          style={{
                            marginLeft: 'auto',
                          }}
                        >
                          NPR {r.delivery_fee} delivery
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}