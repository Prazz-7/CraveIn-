import db from './db.js';

const run = async () => {
  try {
    const [rows] = await db.query('SELECT id, name, cluster_id FROM restaurants WHERE cluster_id = 4 ORDER BY id');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('DB query failed:', err.message);
  } finally {
    process.exit(0);
  }
};

run();
