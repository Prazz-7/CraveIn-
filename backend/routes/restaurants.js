import { Router } from "express";
import pool from "../db.js";

const router = Router();

function getRestaurantStatus(restaurant) {
  // Temporary closure has priority
  if (restaurant.temporary_closed) {
    if (
      restaurant.temporary_closed_until &&
      new Date() >= new Date(restaurant.temporary_closed_until)
    ) {
      return "open";
    }

    return "temporarily_closed";
  }
  // If opening/closing times are missing or malformed, fall back
  if (!restaurant.opening_time || !restaurant.closing_time) {
    return restaurant.is_open ? "open" : "closed";
  }

  // Get current Nepal time
  const now = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kathmandu",
    })
  );

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Support stored values like HH:MM or HH:MM:SS
  const openParts = String(restaurant.opening_time).split(":").map(Number);
  const closeParts = String(restaurant.closing_time).split(":").map(Number);

  if (openParts.length < 2 || closeParts.length < 2) {
    return restaurant.is_open ? "open" : "closed";
  }

  const openHour = openParts[0];
  const openMinute = openParts[1];
  const closeHour = closeParts[0];
  const closeMinute = closeParts[1];

  const openingMinutes = openHour * 60 + openMinute;
  const closingMinutes = closeHour * 60 + closeMinute;

  // Handle overnight schedules (e.g., open 18:00 close 02:00)
  if (closingMinutes <= openingMinutes) {
    // If closing is next day, it's open if current >= opening OR current < closing
    if (currentMinutes >= openingMinutes || currentMinutes < closingMinutes) {
      return "open";
    }
  } else {
    if (currentMinutes >= openingMinutes && currentMinutes < closingMinutes) {
      return "open";
    }
  }

  return "closed";
}

router.get("/", async (req, res) => {
  try {
    const { category, search, featured, clusterId } = req.query;
    let sql = "SELECT * FROM restaurants WHERE is_active = TRUE";
    const params = [];
    if (category && category !== "All") {
      sql += " AND cuisine = ?";
      params.push(category);
    }
    if (search) {
      sql += " AND (name LIKE ? OR cuisine LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (featured === "true") {
      sql += " AND is_featured = TRUE";
    }
    if (clusterId) {
      sql += " AND cluster_id = ?";
      params.push(clusterId);
    }
    sql += " ORDER BY rating DESC";
    const [rows] = await pool.query(sql, params);
    const restaurants = rows.map((r) => ({
      ...r,
      distance: (Math.random() * 2.5 + 0.5).toFixed(1) + "km",
    }));
    res.json(restaurants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT cuisine FROM restaurants ORDER BY cuisine",
    );
    res.json(rows.map((r) => r.cuisine));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM restaurants WHERE is_active = TRUE AND is_featured = TRUE ORDER BY rating DESC LIMIT 6",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch featured restaurants" });
  }
});

router.get("/menu/:restaurantId", async (req, res) => {
  try {
    const [items] = await pool.query(
      `
      SELECT *
      FROM menu_items
      WHERE restaurant_id = ?
      ORDER BY id DESC
      `,
      [req.params.restaurantId],
    );

    res.json(items);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [rRows] = await pool.query(
      "SELECT * FROM restaurants WHERE id = ? AND is_active = TRUE",
      [id],
    );
    if (rRows.length === 0)
      return res.status(404).json({ error: "Restaurant not found" });
    const restaurant = rRows[0];
    restaurant.current_status = getRestaurantStatus(restaurant);
    const [mRows] = await pool.query(
      "SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = TRUE ORDER BY category, name",
      [id],
    );
    const [revRows] = await pool.query(
      "SELECT * FROM reviews WHERE restaurant_id = ? ORDER BY created_at DESC",
      [id],
    );
    const [clusterRows] = await pool.query(
      "SELECT id, name, cuisine,address,lat,lng,rating,review_count,delivery_time,delivery_fee,min_order,is_open,is_featured,image_url,cluster_id FROM restaurants WHERE cluster_id = ? AND id != ? AND is_active = TRUE ORDER BY rating DESC ",
      [restaurant.cluster_id, id],
    );
    res.json({
      ...restaurant,
      menuItems: mRows,
      reviews: revRows,
      clusterRestaurants: clusterRows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch restaurant" });
  }
});

router.post("/:id/reviews", async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    const { rating, comment, reviewerName } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ error: "Rating 1-5 required" });
    const auth = req.headers.authorization;
    let userId = 1;
    if (auth) {
      const parts = auth.replace("Bearer ", "").split("-");
      userId = parseInt(parts[parts.length - 2]) || 1;
    }
    const [result] = await pool.query(
      "INSERT INTO reviews (restaurant_id, user_id, rating, comment, reviewer_name) VALUES (?, ?, ?, ?, ?)",
      [
        restaurantId,
        userId,
        rating,
        comment || null,
        reviewerName || "Anonymous",
      ],
    );
    const [newRating] = await pool.query(
      "SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE restaurant_id = ?",
      [restaurantId],
    );
    await pool.query(
      "UPDATE restaurants SET rating = ?, review_count = ? WHERE id = ?",
      [parseFloat(newRating[0].avg).toFixed(1), newRating[0].cnt, restaurantId],
    );
    res
      .status(201)
      .json({ id: result.insertId, rating, comment, reviewerName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add review" });
  }
});

router.post("/menu", async (req, res) => {
  try {
    const { restaurant_id, name, description, category, price, image_url } =
      req.body;

    const [result] = await pool.query(
      `
      INSERT INTO menu_items
      (
        restaurant_id,
        name,
        description,
        category,
        price,
        image_url
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [restaurant_id, name, description, category, price, image_url],
    );

    res.json({
      success: true,
      id: result.insertId,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to add menu item",
    });
  }
});

router.put("/menu/:id", async (req, res) => {
  try {
    const { name, description, category, price, image_url } = req.body;

    await pool.query(
      `
      UPDATE menu_items
      SET
        name = ?,
        description = ?,
        category = ?,
        price = ?,
        image_url = ?
      WHERE id = ?
      `,
      [name, description, category, price, image_url, req.params.id],
    );

    res.json({
      success: true,
      message: "Menu item updated successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

router.delete("/menu/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM menu_items WHERE id = ?", [req.params.id]);

    res.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

export default router;
