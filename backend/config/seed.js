// seed.js
const db = require('./database'); // your existing mysql2 connection

const menuData = {
  'Spice Junction': [
    { name: 'Butter Chicken', description: 'Rich tomato and butter curry', price: 320, category: 'Main', is_vegetarian: 0 },
    { name: 'Paneer Tikka', description: 'Grilled cottage cheese skewers', price: 260, category: 'Starter', is_vegetarian: 1 },
    { name: 'Chicken Biryani', description: 'Fragrant basmati rice with spiced chicken', price: 350, category: 'Main', is_vegetarian: 0 },
    { name: 'Garlic Naan', description: 'Tandoor-baked flatbread with garlic butter', price: 90, category: 'Bread', is_vegetarian: 1 }
  ],
  'Momo House': [
    { name: 'Steamed Chicken Momo', description: 'Classic steamed chicken dumplings', price: 180, category: 'Main', is_vegetarian: 0 },
    { name: 'Jhol Momo', description: 'Momos served in spicy tangy soup', price: 200, category: 'Main', is_vegetarian: 0 },
    { name: 'Veg Fried Momo', description: 'Crispy fried vegetable momos', price: 170, category: 'Main', is_vegetarian: 1 },
    { name: 'Chicken Choila', description: 'Spiced grilled chicken, Newari style', price: 250, category: 'Starter', is_vegetarian: 0 }
  ],
  'Bella Italia': [
    { name: 'Margherita Pizza', description: 'Classic wood-fired pizza with basil', price: 550, category: 'Main', is_vegetarian: 1 },
    { name: 'Spaghetti Carbonara', description: 'Creamy pasta with pancetta', price: 480, category: 'Main', is_vegetarian: 0 },
    { name: 'Tiramisu', description: 'Traditional Italian dessert', price: 250, category: 'Dessert', is_vegetarian: 1 },
    { name: 'Bruschetta', description: 'Toasted bread with tomato and basil', price: 220, category: 'Starter', is_vegetarian: 1 }
  ],
  'Dragon Wok': [
    { name: 'Chicken Chowmein', description: 'Wok-tossed noodles with chicken and veggies', price: 280, category: 'Main', is_vegetarian: 0 },
    { name: 'Veg Dim Sum', description: 'Steamed vegetable dumplings', price: 220, category: 'Starter', is_vegetarian: 1 },
    { name: 'Kung Pao Chicken', description: 'Spicy stir-fried chicken with peanuts', price: 340, category: 'Main', is_vegetarian: 0 },
    { name: 'Hot & Sour Soup', description: 'Tangy, spicy classic Chinese soup', price: 180, category: 'Starter', is_vegetarian: 1 }
  ],
  'Burger Barn': [
    { name: 'Classic Cheeseburger', description: 'Beef patty with melted cheese and pickles', price: 350, category: 'Main', is_vegetarian: 0 },
    { name: 'Crispy Chicken Burger', description: 'Fried chicken breast with spicy mayo', price: 380, category: 'Main', is_vegetarian: 0 },
    { name: 'Loaded Fries', description: 'Fries topped with cheese and jalapenos', price: 240, category: 'Side', is_vegetarian: 1 },
    { name: 'Oreo Milkshake', description: 'Thick shake blended with Oreo cookies', price: 200, category: 'Beverage', is_vegetarian: 1 }
  ],
  'Sushi Zen': [
    { name: 'California Roll', description: 'Crab, avocado and cucumber roll', price: 420, category: 'Main', is_vegetarian: 0 },
    { name: 'Salmon Sashimi', description: 'Fresh sliced salmon, chef selection', price: 480, category: 'Main', is_vegetarian: 0 },
    { name: 'Veg Tempura Roll', description: 'Crispy vegetable tempura wrapped in rice', price: 380, category: 'Main', is_vegetarian: 1 },
    { name: 'Miso Soup', description: 'Warm soybean paste soup with tofu', price: 150, category: 'Starter', is_vegetarian: 1 }
  ],
  'Taco Fiesta': [
    { name: 'Chicken Tacos', description: 'Three soft tacos with grilled chicken', price: 300, category: 'Main', is_vegetarian: 0 },
    { name: 'Beef Burrito', description: 'Loaded burrito with beef, rice and beans', price: 340, category: 'Main', is_vegetarian: 0 },
    { name: 'Loaded Nachos', description: 'Nachos with cheese, salsa and jalapenos', price: 280, category: 'Starter', is_vegetarian: 1 },
    { name: 'Guacamole & Chips', description: 'Fresh avocado dip with tortilla chips', price: 220, category: 'Side', is_vegetarian: 1 }
  ],
  'The Kebab Corner': [
    { name: 'Chicken Seekh Kebab', description: 'Grilled minced chicken skewers', price: 280, category: 'Main', is_vegetarian: 0 },
    { name: 'Lamb Kebab Platter', description: 'Grilled lamb with rice and salad', price: 420, category: 'Main', is_vegetarian: 0 },
    { name: 'Hummus with Pita', description: 'Creamy chickpea dip with warm pita', price: 200, category: 'Starter', is_vegetarian: 1 },
    { name: 'Falafel Wrap', description: 'Crispy falafel wrapped with tahini sauce', price: 250, category: 'Main', is_vegetarian: 1 }
  ],
  'Green Leaf Cafe': [
    { name: 'Buddha Bowl', description: 'Quinoa, chickpeas, greens and tahini dressing', price: 320, category: 'Main', is_vegetarian: 1 },
    { name: 'Vegan Burger', description: 'Plant-based patty with fresh veggies', price: 350, category: 'Main', is_vegetarian: 1 },
    { name: 'Green Detox Smoothie', description: 'Spinach, apple and ginger smoothie', price: 180, category: 'Beverage', is_vegetarian: 1 },
    { name: 'Avocado Toast', description: 'Sourdough toast topped with smashed avocado', price: 240, category: 'Starter', is_vegetarian: 1 }
  ],
  'Newari Kitchen': [
    { name: 'Yomari', description: 'Steamed rice dumpling with sweet filling', price: 150, category: 'Dessert', is_vegetarian: 1 },
    { name: 'Bara', description: 'Savory lentil pancake, Newari style', price: 180, category: 'Starter', is_vegetarian: 1 },
    { name: 'Choila', description: 'Spiced grilled buff meat', price: 280, category: 'Main', is_vegetarian: 0 },
    { name: 'Newari Khaja Set', description: 'Traditional festive platter with assorted items', price: 450, category: 'Main', is_vegetarian: 0 }
  ],
  'Pasta Paradise': [
    { name: 'Penne Arrabbiata', description: 'Spicy tomato sauce with penne pasta', price: 380, category: 'Main', is_vegetarian: 1 },
    { name: 'Fettuccine Alfredo', description: 'Creamy parmesan sauce with fettuccine', price: 420, category: 'Main', is_vegetarian: 1 },
    { name: 'Lasagna', description: 'Layered pasta with meat sauce and cheese', price: 460, category: 'Main', is_vegetarian: 0 },
    { name: 'Garlic Bread', description: 'Toasted bread with garlic and herb butter', price: 150, category: 'Side', is_vegetarian: 1 }
  ],
  'Grill Master BBQ': [
    { name: 'BBQ Pork Ribs', description: 'Slow-smoked ribs with house BBQ sauce', price: 480, category: 'Main', is_vegetarian: 0 },
    { name: 'Grilled Chicken Platter', description: 'Smoky grilled chicken with sides', price: 380, category: 'Main', is_vegetarian: 0 },
    { name: 'BBQ Pulled Pork Sandwich', description: 'Slow-cooked pulled pork on a brioche bun', price: 340, category: 'Main', is_vegetarian: 0 },
    { name: 'Grilled Corn on the Cob', description: 'Charred corn with butter and spices', price: 150, category: 'Side', is_vegetarian: 1 }
  ]
};
const seedMenu = () => {
  for (const [restaurantName, items] of Object.entries(menuData)) {
    db.query('SELECT id FROM restaurants WHERE name = ?', [restaurantName], (err, results) => {
      if (err) return console.error(`Error looking up ${restaurantName}:`, err);
      if (results.length === 0) {
        console.warn(`⚠ No restaurant found named "${restaurantName}" — skipping`);
        return;
      }

      const restaurantId = results[0].id;
      const values = items.map(item => [
        restaurantId, item.name, item.description, item.price, item.category, item.is_vegetarian
      ]);

      db.query(
        `INSERT INTO menu_items (restaurant_id, name, description, price, category, is_vegetarian) VALUES ?`,
        [values],
        (err, result) => {
          if (err) return console.error(`Error inserting menu for ${restaurantName}:`, err);
          console.log(`✓ Inserted ${result.affectedRows} items for ${restaurantName} (id: ${restaurantId})`);
        }
      );
    });
  }
};

setTimeout(seedMenu, 1000); // small delay to ensure db connection is ready