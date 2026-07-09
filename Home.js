import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Pages.css';
import { FaMapMarkerAlt, FaStar } from 'react-icons/fa';

function Home() {
  const navigate = useNavigate();

  const featuredRestaurants = [
    {
      id: 1,
      name: "Himalayan Momo House",
      address: "New Baneshwor",
      rating: 4.8,
      description: "Authentic Nepali momos and traditional dishes."
    },
    {
      id: 2,
      name: "Pizza Palace",
      address: "Koteshwor",
      rating: 4.7,
      description: "Fresh pizzas, burgers and pasta."
    },
    {
      id: 3,
      name: "Everest Biryani",
      address: "Putalisadak",
      rating: 4.9,
      description: "Delicious biryani and kebabs."
    }
  ];

  return (
    <div className="home">
      <div className="hero-section">
        <div className="container">
          <h2>Welcome to CraveIn</h2>
          <p>Order food from multiple restaurants with just one delivery charge</p>

          <button
            onClick={() => navigate('/restaurants')}
            className="btn btn-primary btn-large"
          >
            Order Now
          </button>
        </div>
      </div>

      <section className="featured-section">
        <div className="container">
          <h3>Featured Restaurants</h3>

          <div className="grid grid-3">
            {featuredRestaurants.map((r) => (
              <div
                key={r.id}
                className="restaurant-card"
                onClick={() => navigate(`/restaurants/${r.id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-content">
                  <h4>{r.name}</h4>

                  <div className="restaurant-info">
                    <span><FaMapMarkerAlt /> {r.address}</span>
                    <span><FaStar style={{ color: "#ffc107" }} /> {r.rating}</span>
                  </div>

                  <p className="description">{r.description}</p>

                  <button className="btn btn-primary btn-small">
                    View Menu
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h3>Why Choose CraveIn?</h3>

          <div className="grid grid-3">
            <div className="feature">
              <i className="fas fa-shopping-cart"></i>
              <h4>Multi-Restaurant</h4>
              <p>Order from multiple restaurants</p>
            </div>

            <div className="feature">
              <i className="fas fa-truck"></i>
              <h4>Single Delivery</h4>
              <p>One delivery charge only</p>
            </div>

            <div className="feature">
              <i className="fas fa-clock"></i>
              <h4>Fast Delivery</h4>
              <p>Quick delivery to your door</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;