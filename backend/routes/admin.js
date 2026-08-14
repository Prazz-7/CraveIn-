import { Router } from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";
import { makeToken } from "../authToken.js";

const router = Router();

// Normalize time inputs into HH:MM:SS (24-hour) for storage.
function normalizeTime(t) {
  if (!t && t !== 0) return null;
  const s = String(t).trim();
  if (s === '') return null;

  // Match HH:MM, HH:MM:SS, with optional AM/PM
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?$/);
  if (!m) return null;

  let hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const ss = m[3] ? parseInt(m[3], 10) : 0;
  const ampm = m[4];

  if (ampm) {
    const isPm = ampm.toLowerCase() === 'pm';
    if (isPm && hh !== 12) hh += 12;
    if (!isPm && hh === 12) hh = 0;
  }

  if (isNaN(hh) || isNaN(mm) || isNaN(ss)) return null;

  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM admins WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const admin = rows[0];

    const valid = await bcrypt.compare(password, admin.password);

    if (!valid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = makeToken(admin.id);

    res.json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Login failed",
    });
  }
});
router.get("/dashboard", async (req, res) => {
  try {
    const [[customers]] = await pool.query(
      "SELECT COUNT(*) AS total FROM users"
    );

    const [[restaurants]] = await pool.query(
      "SELECT COUNT(*) AS total FROM restaurants"
    );

    const [[orders]] = await pool.query(
      "SELECT COUNT(*) AS total FROM orders"
    );

    const [[pending]] = await pool.query(
      "SELECT COUNT(*) AS total FROM orders WHERE status='pending_confirmation'"
    );

    res.json({
      customers: customers.total,
      restaurants: restaurants.total,
      orders: orders.total,
      pending: pending.total,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

router.get("/restaurants", async (req, res) => {
  try {
    const [restaurants] = await pool.query(`
      SELECT
        id,
        name,
        email,
        phone,
        cuisine,
        address,
        lat,
        lng,
        description,
        opening_time,
        closing_time,
        temporary_closed,
        temporary_closed_until,
        temporary_closed_reason,
        is_active
      FROM restaurants
      WHERE is_active = TRUE
      ORDER BY id
    `);

    const now = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kathmandu",
      })
    );

    const currentMinutes =
      now.getHours() * 60 + now.getMinutes();

    const result = restaurants.map((restaurant) => {
      let current_status = "closed";

      // Temporary closure has priority
      if (restaurant.temporary_closed) {
        if (
          restaurant.temporary_closed_until &&
          new Date() >= new Date(restaurant.temporary_closed_until)
        ) {
          current_status = "closed";
        } else {
          current_status = "temporarily_closed";
        }
      } else {
        if (!restaurant.opening_time || !restaurant.closing_time) {
          current_status = restaurant.is_open ? "open" : "closed";
        } else {
          const openParts = String(restaurant.opening_time).split(":").map(Number);
          const closeParts = String(restaurant.closing_time).split(":").map(Number);

          if (openParts.length >= 2 && closeParts.length >= 2) {
            const openHour = openParts[0];
            const openMinute = openParts[1];
            const closeHour = closeParts[0];
            const closeMinute = closeParts[1];

            const openingMinutes = openHour * 60 + openMinute;
            const closingMinutes = closeHour * 60 + closeMinute;

            // Handle overnight schedules where closing is past midnight
            if (closingMinutes <= openingMinutes) {
              if (currentMinutes >= openingMinutes || currentMinutes < closingMinutes) {
                current_status = "open";
              }
            } else {
              if (currentMinutes >= openingMinutes && currentMinutes < closingMinutes) {
                current_status = "open";
              }
            }
          } else {
            current_status = restaurant.is_open ? "open" : "closed";
          }
        }
      }

      return {
        ...restaurant,
        current_status,
      };
    });

    res.json(result);

  } catch (err) {
  console.error("GET RESTAURANTS ERROR:", err);

  res.status(500).json({
    error: "Server Error",
    details: err.message,
  });
}
});


router.post("/restaurants", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      cuisine,
      address,
      lat,
      lng,
      description,
      opening_time,
      closing_time,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !cuisine ||
      !address
    ) {
      return res.status(400).json({
        error: "Please fill all required fields.",
      });
    }

    // Check if email already exists
    const [existing] = await pool.query(
      "SELECT id FROM restaurants WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Restaurant email already exists.",
      });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    const normalizedOpen = normalizeTime(opening_time) || '10:00:00';
    const normalizedClose = normalizeTime(closing_time) || '22:00:00';

    await pool.query(
      `
      INSERT INTO restaurants
      (
        name,
        email,
        password,
        phone,
        cuisine,
        address,
        lat,
        lng,
        description,
        opening_time,
        closing_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        email,
        hashedPassword,
        phone,
        cuisine,
        address,
        lat || 27.7172,
        lng || 85.3240,
        description || "",
        normalizedOpen,
        normalizedClose
      ]
    );

    res.json({
      success: true,
      message: "Restaurant added successfully.",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

router.put("/restaurants/:id", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      cuisine,
      address,
      lat,
      lng,
      description,
      opening_time,
      closing_time,
    } = req.body;

    const normalizedOpenUp = normalizeTime(opening_time) || '10:00:00';
    const normalizedCloseUp = normalizeTime(closing_time) || '22:00:00';

    await pool.query(
      `
      UPDATE restaurants
      SET
        name=?,
        email=?,
        phone=?,
        cuisine=?,
        address=?,
        lat=?,
        lng=?,
        description=?,
        opening_time=?,
        closing_time=?
      WHERE id=?
      `,
      [
        name,
        email,
        phone,
        cuisine,
        address,
        lat || 27.7172,
        lng || 85.3240,
        description,
        normalizedOpenUp,
        normalizedCloseUp,
        req.params.id,
      ]
    );

    res.json({
      success: true,
      message: "Restaurant updated successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

router.delete("/restaurants/:id", async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE restaurants
      SET is_active = FALSE
      WHERE id = ?
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Restaurant disabled successfully."
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error"
    });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT
        orders.id,
        users.name AS customer_name,
        orders.total_amount,
        orders.payment_method,
        orders.payment_status,
        orders.status,
        orders.created_at
      FROM orders
      JOIN users
        ON orders.user_id = users.id
      ORDER BY orders.created_at DESC
    `);

    res.json(orders);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

router.delete("/orders/:id", async (req, res) => {
  try {

    await pool.query(
      "DELETE FROM order_items WHERE order_id=?",
      [req.params.id]
    );

    await pool.query(
      "DELETE FROM orders WHERE id=?",
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Order deleted"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server Error"
    });

  }
});

router.get("/customers", async (req, res) => {
  try {
    const [customers] = await pool.query(`
      SELECT
        id,
        name,
        email,
        phone,
        created_at
      FROM users
      ORDER BY id DESC
    `);

    res.json(customers);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

router.delete("/customers/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM users WHERE id=?",
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Customer deleted",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

router.patch("/restaurants/:id/status", async (req, res) => {
  try {
    const { action, until, reason } = req.body;

    const id = req.params.id;

    if (action === "close") {
      await pool.query(
        `
        UPDATE restaurants
        SET
          temporary_closed = 1,
          temporary_closed_until = ?,
          temporary_closed_reason = ?
        WHERE id = ?
        `,
        [
          until || null,
          reason || "Temporarily closed by admin",
          id,
        ]
      );

      return res.json({
        success: true,
        message: "Restaurant temporarily closed",
      });
    }

    if (action === "open") {
      await pool.query(
        `
        UPDATE restaurants
        SET
          temporary_closed = 0,
          temporary_closed_until = NULL,
          temporary_closed_reason = NULL
        WHERE id = ?
        `,
        [id]
      );

      return res.json({
        success: true,
        message: "Restaurant reopened",
      });
    }

    res.status(400).json({
      error: "Invalid status action",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to update restaurant status",
    });
  }
});

export default router;