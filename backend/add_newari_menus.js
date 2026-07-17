import db from './db.js';

const menuData = [
  {
    restaurantId: 9,
    items: [
      ['Sukuti', 'Smoked dried buffalo strips with fresh chili and onion', 280, 'Starters', true, false],
      ['Chhoyela', 'Spicy grilled buffalo with mustard oil and herbs', 320, 'Starters', true, false],
      ['Bara Set', 'Lentil patties with achar and spicy meat topping', 180, 'Snacks', true, false],
      ['Aalu Tama Bodi', 'Potato, bamboo shoots and black-eyed peas curry', 270, 'Mains', false, true],
      ['Masala Tea', 'Spiced milk tea with a Newari twist', 90, 'Drinks', false, true],
    ],
  },
  {
    restaurantId: 10,
    items: [
      ['Yomari', 'Sweet rice flour dumplings filled with molasses', 150, 'Desserts', true, true],
      ['Aalu Papa', 'Potatoes and bamboo shoots in spicy gravy', 240, 'Mains', true, true],
      ['Bara Tarkari', 'Lentil patties with mixed veggie curry', 210, 'Combos', false, true],
      ['Mula Achaar', 'Radish pickle with sesame seeds', 70, 'Sides', false, true],
      ['Butter Tea', 'Traditional salted tea', 80, 'Drinks', false, true],
    ],
  },
  {
    restaurantId: 11,
    items: [
      ['Choila', 'Grilled spiced chicken with achar and beaten rice', 280, 'Starters', true, false],
      ['Baahadur Set', 'Mixed meat platter with bhat and achar', 480, 'Set Meals', true, false],
      ['Bhangko Jhol', 'Smoked meat stew with herbs', 340, 'Mains', false, false],
      ['Masu Bhaye', 'Pork curry with traditional spices', 360, 'Mains', true, false],
      ['Masala Chiya', 'Spiced tea with milk', 90, 'Drinks', false, true],
    ],
  },
];

const run = async () => {
  try {
    for (const { restaurantId, items } of menuData) {
      const [[{ menu_count }]] = await db.query(
        'SELECT COUNT(*) AS menu_count FROM menu_items WHERE restaurant_id = ?',
        [restaurantId]
      );

      if (menu_count > 0) {
        console.log(`Restaurant ${restaurantId} already has ${menu_count} menu items; skipping.`);
        continue;
      }

      const values = items.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
      const params = items.flatMap((item) => item);

      await db.query(
        `INSERT INTO menu_items (restaurant_id, name, description, price, category, is_popular, is_vegetarian) VALUES ${values}`,
        params.reduce((acc, val, idx) => {
          if (idx % 6 === 0) acc.push(restaurantId);
          acc.push(val);
          return acc;
        }, [])
      );

      console.log(`Added ${items.length} menu items for restaurant ${restaurantId}.`);
    }
  } catch (err) {
    console.error('Menu insert failed:', err.message);
  } finally {
    process.exit(0);
  }
};

run();
