const db = require('./database');
const bcrypt = require('bcryptjs'); // already likely installed if you have auth; if not: npm install bcryptjs

const restaurantData = [
  { name: 'Spice Junction',   description: 'Authentic North & South Indian curries, biryanis and tandoori specialties.', address: 'Durbar Marg, Kathmandu', latitude: 27.7115, longitude: 85.3181, rating: 4.5 },
  { name: 'Momo House',       description: 'Steamed, fried and jhol momos served the traditional Newari way.', address: 'Thamel, Kathmandu', latitude: 27.7154, longitude: 85.3123, rating: 4.7 },
  { name: 'Bella Italia',     description: 'Wood-fired pizzas, fresh pastas and classic Italian desserts.', address: 'Jhamsikhel, Lalitpur', latitude: 27.6733, longitude: 85.3082, rating: 4.3 },
  { name: 'Dragon Wok',       description: 'Sizzling stir-fries, dim sum and noodle bowls made to order.', address: 'Baneshwor, Kathmandu', latitude: 27.6893, longitude: 85.3436, rating: 4.2 },
  { name: 'Burger Barn',      description: 'Juicy grilled burgers, loaded fries and thick milkshakes.', address: 'Pulchowk, Lalitpur', latitude: 27.6789, longitude: 85.3161, rating: 4.1 },
  { name: 'Sushi Zen',        description: 'Fresh sushi rolls, sashimi and warm miso soup in a calm setting.', address: 'Lazimpat, Kathmandu', latitude: 27.7186, longitude: 85.3225, rating: 4.6 },
  { name: 'Taco Fiesta',      description: 'Street-style tacos, burritos and loaded nachos with house salsa.', address: 'Boudha, Kathmandu', latitude: 27.7215, longitude: 85.3620, rating: 4.0 },
  { name: 'The Kebab Corner', description: 'Grilled kebabs, hummus and warm pita fresh off the grill.', address: 'New Road, Kathmandu', latitude: 27.7025, longitude: 85.3121, rating: 4.4 },
  { name: 'Green Leaf Cafe',  description: 'Plant-based bowls, smoothies and guilt-free comfort food.', address: 'Sanepa, Lalitpur', latitude: 27.6820, longitude: 85.3061, rating: 4.5 },
  { name: 'Newari Kitchen',   description: 'Traditional Newari feast with yomari, choila and bara.', address: 'Patan Durbar Square, Lalitpur', latitude: 27.6727, longitude: 85.3250, rating: 4.8 },
  { name: 'Pasta Paradise',   description: 'Handmade pastas tossed in rich, comforting sauces.', address: 'Kupondole, Lalitpur', latitude: 27.6890, longitude: 85.3140, rating: 4.2 },
  { name: 'Grill Master BBQ', description: 'Smoky grilled meats, ribs and barbecue platters.', address: 'Chabahil, Kathmandu', latitude: 27.7175, longitude: 85.3450, rating: 4.3 }
];

const seed = async () => {
  // 1. Create a default restaurant owner if one doesn't already exist
  const ownerEmail = 'owner@cravein.com';
  db.query('SELECT id FROM users WHERE email = ?', [ownerEmail], async (err, results) => {
    if (err) return console.error('Error checking owner:', err);

    let ownerId;

    if (results.length > 0) {
      ownerId = results[0].id;
      console.log(`✓ Using existing owner (id: ${ownerId})`);
      insertRestaurants(ownerId);
    } else {
      const hashedPassword = await bcrypt.hash('Owner@123', 10);
      db.query(
        `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'restaurant_owner')`,
        ['CraveIn Owner', ownerEmail, '9800000000', hashedPassword],
        (err, result) => {
          if (err) return console.error('Error creating owner:', err);
          ownerId = result.insertId;
          console.log(`✓ Created default owner (id: ${ownerId})`);
          insertRestaurants(ownerId);
        }
      );
    }
  });
};

const insertRestaurants = (ownerId) => {
  const values = restaurantData.map(r => [
    ownerId, r.name, r.description, r.latitude, r.longitude, r.address, r.rating
  ]);

  db.query(
    `INSERT INTO restaurants (owner_id, name, description, latitude, longitude, address, rating) VALUES ?`,
    [values],
    (err, result) => {
      if (err) return console.error('Error inserting restaurants:', err);
      console.log(`✓ Inserted ${result.affectedRows} restaurants`);
    }
  );
};

setTimeout(seed, 1000);