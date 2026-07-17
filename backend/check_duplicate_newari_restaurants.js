import db from './db.js';

const run = async () => {
  try {
    const [rows] = await db.query(
      `SELECT name, COUNT(*) AS cnt, GROUP_CONCAT(id ORDER BY id SEPARATOR ',') AS ids
       FROM restaurants
       WHERE name IN ('Jwalamukhi Kitchen','Bhojan Griha','Gaun Ghar')
       GROUP BY name
       HAVING COUNT(*) > 1`
    );
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('DB query failed:', err.message);
  } finally {
    process.exit(0);
  }
};

run();
