USE cravein;

INSERT INTO restaurants (name, cuisine, address, lat, lng, rating, review_count, delivery_time, delivery_fee, min_order, is_open, is_featured, image_url, cluster_id, description) VALUES
('Momo Palace', 'Nepali', 'Thamel, Kathmandu', 27.7154, 85.3123, 4.7, 120, '25-35 min', 60, 150, TRUE, TRUE, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', 1, 'The best momos in Kathmandu. Steamed, fried, jhol — we have them all.'),
('Thakali Kitchen', 'Nepali', 'Baneshwor, Kathmandu', 27.6929, 85.3329, 4.5, 98, '30-45 min', 70, 200, TRUE, TRUE, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', 2, 'Authentic Thakali dal-bhat set meals straight from Mustang.'),
('Burger Hut Kathmandu', 'Fast Food', 'New Baneshwor, Kathmandu', 27.6888, 85.3410, 4.2, 77, '20-30 min', 50, 250, TRUE, FALSE, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600', 2, 'Juicy smash burgers and crispy fries made fresh to order.'),
('Himalayan Cafe', 'Chinese', 'Lazimpat, Kathmandu', 27.7244, 85.3179, 4.4, 65, '35-50 min', 80, 300, TRUE, TRUE, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', 1, 'Pan-Asian flavors with a Himalayan twist. Chowmein, momos and more.'),
('Pizza Corner Nepal', 'Italian', 'Jhamsikhel, Lalitpur', 27.6727, 85.3165, 4.1, 43, '40-55 min', 100, 400, TRUE, FALSE, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600', 3, 'Wood-fired Neapolitan-style pizzas with local toppings.'),
('Indian Spice Garden', 'Indian', 'Kumaripati, Lalitpur', 27.6753, 85.3121, 4.3, 55, '30-45 min', 90, 250, TRUE, FALSE, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600', 3, 'Rich curries, tandoori delights and authentic Indian street food.'),
('Sushi Zen Kathmandu', 'Japanese', 'Durbar Marg, Kathmandu', 27.7099, 85.3171, 4.6, 38, '45-60 min', 120, 500, TRUE, TRUE, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600', 1, 'Freshest sushi and Japanese fusion in the heart of Kathmandu.'),
('Newari Chhen', 'Nepali', 'Kirtipur, Kathmandu', 27.6777, 85.2790, 4.8, 210, '30-40 min', 60, 150, FALSE, TRUE, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600', 4, 'Traditional Newari cuisine. Bara, Chatamari, Kwati and more.'),
('Jwalamukhi Kitchen', 'Newari', 'Kirtipur, Kathmandu', 27.6775, 85.2770, 4.6, 85, '30-40 min', 55, 150, TRUE, FALSE, 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600', 4, 'Everyday Newari favourites like Sukuti, Chhoyela and bara.'),
('Bhojan Griha', 'Newari', 'Kirtipur, Kathmandu', 27.6768, 85.2802, 4.5, 90, '35-45 min', 55, 150, TRUE, FALSE, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600', 4, 'Home-style Newari sets and seasonal festival dishes.'),
('Gaun Ghar', 'Newari', 'Kirtipur, Kathmandu', 27.6784, 85.2784, 4.7, 70, '30-40 min', 65, 150, FALSE, TRUE, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', 4, 'Local Newari classic flavours with a modern touch.');

INSERT INTO menu_items (restaurant_id, name, description, price, category, is_popular, is_vegetarian) VALUES
-- Momo Palace (id=1)
(1, 'Steamed Buff Momo', 'Traditional steamed buffalo momos with house-made tomato achar', 180, 'Momos', TRUE, FALSE),
(1, 'Fried Chicken Momo', 'Crispy pan-fried chicken momos with chilli sauce', 200, 'Momos', TRUE, FALSE),
(1, 'Jhol Momo', 'Momos soaked in spicy sesame-tomato soup broth', 220, 'Momos', TRUE, FALSE),
(1, 'Veg Momo', 'Stuffed with cabbage, tofu, and spices', 160, 'Momos', FALSE, TRUE),
(1, 'Momo Platter', 'Mix of 6 steamed + 6 fried momos with 2 achars', 350, 'Combos', TRUE, FALSE),
(1, 'Lassi', 'Chilled sweet yogurt drink', 80, 'Drinks', FALSE, TRUE),
-- Thakali Kitchen (id=2)
(2, 'Thakali Dal Bhat Set', 'Complete set: rice, dal, 2 sabji, gundruk, papad, pickle', 350, 'Set Meals', TRUE, FALSE),
(2, 'Dhido Set', 'Buckwheat dhido with gundruk soup and sidekicks', 280, 'Set Meals', TRUE, FALSE),
(2, 'Mutton Sekuwa', 'Marinated mutton grilled on open flame', 420, 'Grills', TRUE, FALSE),
(2, 'Sel Roti with Curd', 'Crispy ring-shaped rice bread with fresh curd', 150, 'Snacks', FALSE, TRUE),
(2, 'Butter Tea', 'Traditional Tibetan-style salted butter tea', 100, 'Drinks', FALSE, TRUE),
-- Burger Hut (id=3)
(3, 'Classic Smash Burger', 'Double smash patty, cheddar, pickles, special sauce', 450, 'Burgers', TRUE, FALSE),
(3, 'Chicken Crunch Burger', 'Crispy fried chicken thigh with sriracha mayo', 400, 'Burgers', TRUE, FALSE),
(3, 'Veggie Burger', 'Black bean patty with avocado and fresh veggies', 350, 'Burgers', FALSE, TRUE),
(3, 'Loaded Fries', 'Cheese sauce, jalapeños, bacon bits on crispy fries', 250, 'Sides', TRUE, FALSE),
(3, 'Chocolate Milkshake', 'Thick hand-spun chocolate milkshake', 220, 'Drinks', FALSE, TRUE),
-- Himalayan Cafe (id=4)
(4, 'Veg Chowmein', 'Stir-fried noodles with fresh vegetables and soy sauce', 200, 'Noodles', FALSE, TRUE),
(4, 'Chicken Chowmein', 'Wok-tossed noodles with chicken and Himalayan spices', 250, 'Noodles', TRUE, FALSE),
(4, 'Chicken Fried Rice', 'Classic Chinese fried rice with egg and chicken', 280, 'Rice', TRUE, FALSE),
(4, 'Manchurian Gravy', 'Crispy chicken balls in tangy Manchurian sauce', 300, 'Starters', TRUE, FALSE),
(4, 'Spring Rolls', 'Crispy vegetable spring rolls with sweet chilli dip', 180, 'Starters', FALSE, TRUE),
-- Pizza Corner (id=5)
(5, 'Margherita Pizza', 'Classic San Marzano tomato, fresh mozzarella, basil', 550, 'Pizzas', TRUE, TRUE),
(5, 'BBQ Chicken Pizza', 'Smoky BBQ base, grilled chicken, red onion, coriander', 680, 'Pizzas', TRUE, FALSE),
(5, 'Buff Pepperoni Pizza', 'House-made buff pepperoni, mozzarella, olives', 720, 'Pizzas', TRUE, FALSE),
(5, 'Garlic Bread', 'Toasted sourdough with roasted garlic butter', 180, 'Sides', FALSE, TRUE),
-- Indian Spice Garden (id=6)
(6, 'Butter Chicken', 'Tender chicken in rich tomato-cream masala sauce', 480, 'Curries', TRUE, FALSE),
(6, 'Dal Makhani', 'Slow-cooked black lentils in buttery tomato gravy', 320, 'Curries', TRUE, TRUE),
(6, 'Garlic Naan', 'Tandoor-baked naan with garlic and butter', 80, 'Breads', FALSE, TRUE),
(6, 'Paneer Tikka', 'Marinated paneer grilled in tandoor with peppers', 380, 'Starters', FALSE, TRUE),
-- Sushi Zen (id=7)
(7, 'Salmon Nigiri (2 pcs)', 'Fresh Atlantic salmon over seasoned rice', 380, 'Nigiri', TRUE, FALSE),
(7, 'California Roll (8 pcs)', 'Crab stick, avocado, cucumber, tobiko', 450, 'Rolls', TRUE, FALSE),
(7, 'Spicy Tuna Roll (8 pcs)', 'Fresh tuna, sriracha mayo, cucumber', 520, 'Rolls', TRUE, FALSE),
(7, 'Miso Soup', 'Traditional Japanese dashi with tofu and wakame', 150, 'Soups', FALSE, TRUE),
-- Newari Chhen (id=8)
(8, 'Bara (2 pcs)', 'Crispy lentil pancakes, the classic Newari snack', 120, 'Snacks', TRUE, TRUE),
(8, 'Chatamari', 'Rice crepe topped with minced meat and egg', 180, 'Snacks', TRUE, FALSE),
(8, 'Kwati Soup', 'Traditional mixed bean soup — a Newari festival staple', 200, 'Soups', FALSE, TRUE),
(8, 'Samay Baji Set', 'Full Newari feast: beaten rice, bara, meat, eggs, achar', 450, 'Set Meals', TRUE, FALSE),
-- Jwalamukhi Kitchen (id=9)
(9, 'Sukuti', 'Smoked dried buffalo strips with fresh chili and onion', 280, 'Starters', TRUE, FALSE),
(9, 'Chhoyela', 'Spicy grilled buffalo with mustard oil and herbs', 320, 'Starters', TRUE, FALSE),
(9, 'Bara Set', 'Lentil patties with achar and spicy meat topping', 180, 'Snacks', TRUE, FALSE),
(9, 'Aalu Tama Bodi', 'Potato, bamboo shoots and black-eyed peas curry', 270, 'Mains', FALSE, TRUE),
(9, 'Masala Tea', 'Spiced milk tea with a Newari twist', 90, 'Drinks', FALSE, TRUE),
-- Bhojan Griha (id=10)
(10, 'Yomari', 'Sweet rice flour dumplings filled with molasses', 150, 'Desserts', TRUE, TRUE),
(10, 'Aalu Papa', 'Potatoes and bamboo shoots in spicy gravy', 240, 'Mains', TRUE, TRUE),
(10, 'Bara Tarkari', 'Lentil patties with mixed veggie curry', 210, 'Combos', FALSE, TRUE),
(10, 'Mula Achaar', 'Radish pickle with sesame seeds', 70, 'Sides', FALSE, TRUE),
(10, 'Butter Tea', 'Traditional salted tea', 80, 'Drinks', FALSE, TRUE),
-- Gaun Ghar (id=11)
(11, 'Choila', 'Grilled spiced chicken with achar and beaten rice', 280, 'Starters', TRUE, FALSE),
(11, 'Baahadur Set', 'Mixed meat platter with bhat and achar', 480, 'Set Meals', TRUE, FALSE),
(11, 'Bhangko Jhol', 'Smoked meat stew with herbs', 340, 'Mains', FALSE, FALSE),
(11, 'Masu Bhaye', 'Pork curry with traditional spices', 360, 'Mains', TRUE, FALSE),
(11, 'Masala Chiya', 'Spiced tea with milk', 90, 'Drinks', FALSE, TRUE);
-- Password for the demo account is: 123456
-- It is stored as a bcrypt hash so it works with the authentication API.
INSERT INTO users (name, email, password, phone, address) VALUES
('Demo User', 'demo@example.com', '$2a$10$.x6oV71.eIgLaUaS9UXPDeLBkjXQOWpfuwMYSqjttLdNLJniazyda', '9800000000', 'Kathmandu');

INSERT INTO reviews (restaurant_id, user_id, rating, comment, reviewer_name) VALUES
(1, 1, 5, 'Best jhol momo in Kathmandu, hands down!', 'Aarav S.'),
(1, 1, 4, 'Great taste, delivery was a little slow.', 'Priya T.'),
(2, 1, 5, 'The dal bhat set is incredible value.', 'Suresh K.'),
(4, 1, 4, 'Loved the chowmein, will order again.', 'Anjali M.');
