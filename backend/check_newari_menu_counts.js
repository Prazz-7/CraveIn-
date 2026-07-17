import db from './db.js';

const run = async () => {
  try {
    const [rows] = await db.query(
      `SELECT r.id, r.name, COUNT(mi.id) AS menu_count
       FROM restaurants r
       LEFT JOIN menu_items mi ON mi.restaurant_id = r.id
       WHERE r.name IN ('Jwalamukhi Kitchen','Bhojan Griha','Gaun Ghar')
       GROUP BY r.id, r.name
       ORDER BY r.id`
    );
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('DB query failed:', err.message);
  } finally {
    process.exit(0);
  }
};

run();
