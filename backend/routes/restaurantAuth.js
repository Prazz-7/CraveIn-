import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { makeToken } from '../authToken.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const [rows] = await pool.query(
      'SELECT * FROM restaurants WHERE email = ?',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const restaurant = rows[0];

    const valid = await bcrypt.compare(password, restaurant.password);

    if (!valid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const token = makeToken(restaurant.id);

    res.json({
      token,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Restaurant login failed'
    });
  }
});

router.get("/orders/:restaurantId", async (req, res) => {
  try {
    const [orders] = await pool.query(
      `
        SELECT
          orders.id,
          order_items.status,
          users.name AS customer,
          order_items.name,
          order_items.quantity,
          order_items.price
        FROM order_items
        JOIN orders
          ON orders.id = order_items.order_id
        JOIN users
          ON users.id = orders.user_id
        WHERE order_items.restaurant_id = ?
          AND IFNULL(orders.status, '') != 'cancelled'
        ORDER BY orders.id DESC
      `,
      [req.params.restaurantId]
    );

    res.json(orders);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

router.put("/orders/:orderId/status", async (req, res) => {
  try {
    const { status, restaurantId } = req.body;
    const orderId = req.params.orderId;

    const allowedStatuses = [
      "pending_confirmation",
      "confirmed",
      "preparing",
      "ready",
      "out for delivery",
      "delivered",
      "rejected"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid order status"
      });
    }

    if (!restaurantId) {
      return res.status(400).json({
        error: "Restaurant ID is required"
      });
    }

    const [orderCheck] = await pool.query(
      `
      SELECT o.id
      FROM orders o
      JOIN order_items oi
        ON o.id = oi.order_id
      WHERE o.id = ?
        AND oi.restaurant_id = ?
      LIMIT 1
      `,
      [orderId, restaurantId]
    );

    if (orderCheck.length === 0) {
      return res.status(404).json({
        error: "Order not found for this restaurant"
      });
    }

    await pool.query(
      `
      UPDATE order_items
      SET status = ?
      WHERE order_id = ?
        AND restaurant_id = ?
      `,
      [status, orderId, restaurantId]
    );

    const [rows] = await pool.query(
      `
      SELECT DISTINCT restaurant_id, status
      FROM order_items
      WHERE order_id = ?
      `,
      [orderId]
    );

    const anyRejected = rows.some(r => r.status === "rejected");
    const anyCancelled = rows.some(r => r.status === "cancelled");
    const statusOrder = {
      pending_confirmation: 0,
      confirmed: 1,
      preparing: 2,
      ready: 3,
      "out for delivery": 4,
      delivered: 5,
    };
    const activeStatuses = rows.filter(
      r => r.status !== "cancelled" && r.status !== "rejected"
    );
    const slowestStatus = activeStatuses.length
      ? activeStatuses.reduce((slowest, current) => {
          return statusOrder[current.status] < statusOrder[slowest.status]
            ? current
            : slowest;
        }, activeStatuses[0]).status
      : status;
    const uniqueRestaurantCount = new Set(rows.map(r => r.restaurant_id)).size;

    let orderStatus;
    let rejectingRestaurantIds = [];

    if (anyRejected) {
      rejectingRestaurantIds = rows
        .filter(r => r.status === 'rejected')
        .map(r => r.restaurant_id);

      orderStatus = "rejected";
    } else if (anyCancelled) {
      orderStatus = "cancelled";
    } else if (activeStatuses.length > 0 && activeStatuses.every(r => r.status === "delivered")) {
      orderStatus = "delivered";
    } else if (activeStatuses.length > 0) {
      orderStatus = slowestStatus;
    } else {
      orderStatus = status;
    }

    await pool.query(
      `
      UPDATE orders
      SET status = ?
      WHERE id = ?
      `,
      [orderStatus, orderId]
    );

    // If the order was rejected by a restaurant, keep the rejecting
    // restaurant's item as 'rejected' and cancel the rest of the order for
    // every other restaurant on that order. This way the customer sees only
    // the actual rejecting restaurant(s), while other restaurants are marked cancelled.
    if (orderStatus === 'rejected') {
      await pool.query(
        `
        UPDATE order_items
        SET status = 'cancelled'
        WHERE order_id = ?
        AND status != 'rejected'
        `,
        [orderId]
      );
    }

    // If the customer cancelled the order, only that case stays cancelled.
    if (orderStatus === "cancelled") {
      await pool.query(
        `
        UPDATE order_items
        SET status = 'cancelled'
        WHERE order_id = ?
        `,
        [orderId]
      );
    }

    // If there were rejecting restaurants, fetch their names to return
    // so the frontend can show a helpful message to the customer.
    let rejectingNames = [];
    if (rejectingRestaurantIds.length > 0) {
      const [namesRows] = await pool.query(
        `SELECT id, name FROM restaurants WHERE id IN (?)`,
        [rejectingRestaurantIds]
      );
      rejectingNames = namesRows.map(r => r.name);
    }

    res.json({
      success: true,
      message: "Status Updated",
      orderId: Number(orderId),
      status: orderStatus,
      itemStatus: status,
      rejecting: rejectingNames
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

router.get("/dashboard/:restaurantId", async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    const [[menu]] = await pool.query(
      "SELECT COUNT(*) AS total FROM menu_items WHERE restaurant_id = ?",
      [restaurantId]
    );

      const [[orders]] = await pool.query(
        `
        SELECT COUNT(DISTINCT oi.order_id) AS total
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE oi.restaurant_id = ?
        AND IFNULL(o.status, '') != 'cancelled'
        `,
        [restaurantId]
      );

      const [[pending]] = await pool.query(
        `
        SELECT COUNT(DISTINCT oi.order_id) AS total
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE oi.restaurant_id = ?
        AND IFNULL(o.status, '') != 'cancelled'
        AND oi.status IN ('pending_confirmation','confirmed','preparing','ready')
        `,
        [restaurantId]
      );

    const [[revenue]] = await pool.query(
      `SELECT IFNULL(SUM(order_items.price * order_items.quantity),0) AS total
       FROM order_items
       JOIN orders
         ON orders.id = order_items.order_id
       WHERE order_items.restaurant_id = ?
       AND orders.status='delivered'`,
      [restaurantId]
    );

    res.json({
      menuItems: menu.total,
      totalOrders: orders.total,
      pendingOrders: pending.total,
      revenue: revenue.total,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

router.get("/profile/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        name,
        email,
        phone,
        address,
        cuisine,
        image_url
      FROM restaurants
      WHERE id = ?
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Restaurant not found",
      });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

router.put("/profile/:id", async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      cuisine,
      image_url,
    } = req.body;

    await pool.query(
      `
      UPDATE restaurants
      SET
        name = ?,
        phone = ?,
        address = ?,
        cuisine = ?,
        image_url = ?
      WHERE id = ?
      `,
      [
        name,
        phone,
        address,
        cuisine,
        image_url,
        req.params.id,
      ]
    );

    res.json({
      success: true,
      message: "Profile Updated",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
});

export default router;