import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { restaurantAPI } from "../../services/api";
import { toast } from "react-toastify";
import "./RestaurantList.css";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";

// Fallback/demo restaurant data - used if the API has nothing to return yet
const MOCK_RESTAURANTS = [
  {
    id: 1,
    name: "Spice Junction",
    cuisine: "Indian",
    rating: 4.5,
    address: "Durbar Marg, Kathmandu",
    description:
      "Authentic North & South Indian curries, biryanis and tandoori specialties.",
  },
  {
    id: 2,
    name: "Momo House",
    cuisine: "Nepali",
    rating: 4.7,
    address: "Thamel, Kathmandu",
    description:
      "Steamed, fried and jhol momos served the traditional Newari way.",
  },
  {
    id: 3,
    name: "Bella Italia",
    cuisine: "Italian",
    rating: 4.3,
    address: "Jhamsikhel, Lalitpur",
    description:
      "Wood-fired pizzas, fresh pastas and classic Italian desserts.",
  },
  {
    id: 4,
    name: "Dragon Wok",
    cuisine: "Chinese",
    rating: 4.2,
    address: "Baneshwor, Kathmandu",
    description: "Sizzling stir-fries, dim sum and noodle bowls made to order.",
  },
  {
    id: 5,
    name: "Burger Barn",
    cuisine: "American",
    rating: 4.1,
    address: "Pulchowk, Lalitpur",
    description: "Juicy grilled burgers, loaded fries and thick milkshakes.",
  },
  {
    id: 6,
    name: "Sushi Zen",
    cuisine: "Japanese",
    rating: 4.6,
    address: "Lazimpat, Kathmandu",
    description:
      "Fresh sushi rolls, sashimi and warm miso soup in a calm setting.",
  },
  {
    id: 7,
    name: "Taco Fiesta",
    cuisine: "Mexican",
    rating: 4.0,
    address: "Boudha, Kathmandu",
    description:
      "Street-style tacos, burritos and loaded nachos with house salsa.",
  },
  {
    id: 8,
    name: "The Kebab Corner",
    cuisine: "Middle Eastern",
    rating: 4.4,
    address: "New Road, Kathmandu",
    description: "Grilled kebabs, hummus and warm pita fresh off the grill.",
  },
  {
    id: 9,
    name: "Green Leaf Cafe",
    cuisine: "Vegan",
    rating: 4.5,
    address: "Sanepa, Lalitpur",
    description: "Plant-based bowls, smoothies and guilt-free comfort food.",
  },
  {
    id: 10,
    name: "Newari Kitchen",
    cuisine: "Nepali",
    rating: 4.8,
    address: "Patan Durbar Square, Lalitpur",
    description: "Traditional Newari feast with yomari, choila and bara.",
  },
  {
    id: 11,
    name: "Pasta Paradise",
    cuisine: "Italian",
    rating: 4.2,
    address: "Kupondole, Lalitpur",
    description: "Handmade pastas tossed in rich, homestyle sauces.",
  },
  {
    id: 12,
    name: "Grill Master BBQ",
    cuisine: "Barbecue",
    rating: 4.3,
    address: "Chabahil, Kathmandu",
    description: "Smoky grilled meats, ribs and barbecue platters.",
  },
  {
    id: 13,
    name: "Thai Orchid",
    cuisine: "Thai",
    rating: 4.4,
    address: "Kumaripati, Lalitpur",
    description: "Fragrant curries, pad thai and tom yum soup done right.",
  },
  {
    id: 14,
    name: "Bakers Delight",
    cuisine: "Bakery",
    rating: 4.6,
    address: "Bouddha, Kathmandu",
    description: "Fresh breads, pastries, cakes and specialty coffee.",
  },
];

function RestaurantList() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    restaurantAPI
      .getAll(50, 0)
      .then((res) => {
        const data =
          res.data.restaurants && res.data.restaurants.length > 0
            ? res.data.restaurants
            : MOCK_RESTAURANTS;
        setRestaurants(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Could not reach server, showing sample restaurants");
        setRestaurants(MOCK_RESTAURANTS);
        setFiltered(MOCK_RESTAURANTS);
        setLoading(false);
      });
  }, []);

  const handleSearch = (term) => {
    setSearch(term);
    setFiltered(
      restaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(term.toLowerCase()) ||
          r.address.toLowerCase().includes(term.toLowerCase()),
      ),
    );
  };

  return (
    <div className="restaurants-page">
      <div className="container">
        <h2>Explore Restaurants</h2>
        <div className="search-section">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        {loading ? (
          <div className="loading"></div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-3">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="restaurant-card"
                onClick={() => navigate(`/restaurants/${r.id}`)}
              >
                <div className="card-content">
                  <div className="card-header">
                    <h3>{r.name}</h3>
                    <span className="rating">
                      <FaStar /> {r.rating || "N/A"}
                    </span>
                  </div>
                  {r.cuisine && (
                    <span className="cuisine-tag">{r.cuisine}</span>
                  )}
                  <p className="address">
                    <FaMapMarkerAlt /> {r.address}
                  </p>
                  <p className="description">{r.description}</p>
                  <button className="btn btn-primary">View Menu</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No restaurants found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RestaurantList;
