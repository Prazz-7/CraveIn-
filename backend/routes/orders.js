import { Router } from 'express';
import pool from '../db.js';
import { getUserId } from '../authToken.js';

const router = Router();

/*
  Calculate restaurant status automatically.

  Priority:
  1. Temporary closure
  2. Normal opening/closing time
*/
function getRestaurantStatus(restaurant) {
  // Temporary closure
  if (restaurant.temporary_closed) {
    // If a temporary closure has an expiry time
    // and that time has passed, go back to normal schedule.
    if (
      restaurant.temporary_closed_until &&
      new Date() >= new Date(restaurant.temporary_closed_until)
    ) {
      // Continue to normal schedule below
    } else {
      return "temporarily_closed";
    }
  }

  // Current Nepal time
  const now = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kathmandu",
    })
  );

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  // Opening time
  const [openHour, openMinute] = String(
    restaurant.opening_time || "10:00:00"
  )
    .split(":")
    .map(Number);

  // Closing time
  const [closeHour, closeMinute] = String(
    restaurant.closing_time || "22:00:00"
  )
    .split(":")
    .map(Number);

  const openingMinutes =
    openHour * 60 + openMinute;

  const closingMinutes =
    closeHour * 60 + closeMinute;

  if (
    currentMinutes >= openingMinutes &&
    currentMinutes < closingMinutes
  ) {
    return "open";
  }

  return "closed";
}


/* =========================================================
   GET USER ORDERS
========================================================= */

router.get('/', async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }

    const [orders] = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );

    const result = await Promise.all(
      orders.map(async (order) => {

        const [items] = await pool.query(
          `
          SELECT
            oi.*,
            r.name AS restaurant_name,
            r.opening_time,
            r.closing_time,
            r.temporary_closed,
            r.temporary_closed_until
          FROM order_items oi
          JOIN restaurants r
            ON oi.restaurant_id = r.id
          WHERE oi.order_id = ?
          `,
          [order.id]
        );

        const restaurantIds = [
          ...new Set(
            items.map(item => item.restaurant_id)
          )
        ];

        const restaurants = restaurantIds.map(
          (restaurantId) => {

            const restaurantItems =
              items.filter(
                item =>
                  item.restaurant_id === restaurantId
              );

            const restaurantInfo =
              restaurantItems[0];

            return {
              id: restaurantId,

              name:
                restaurantInfo?.restaurant_name ||
                `Restaurant ${restaurantId}`,

              subtotal:
                restaurantItems.reduce(
                  (sum, item) =>
                    sum +
                    item.price * item.quantity,
                  0
                ),

              status:
                getRestaurantStatus(
                  restaurantInfo
                )
            };
          }
        );

        return {
          ...order,
          items,
          restaurants
        };
      })
    );

    res.json(result);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Failed to list orders'
    });
  }
});


/* =========================================================
   CREATE ORDER
========================================================= */

router.post('/', async (req, res) => {
  try {

    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }

    const {
      deliveryAddress,
      deliveryLatitude,
      deliveryLongitude,
      paymentMethod,
      items
    } = req.body;

    const latitude = Number(deliveryLatitude);
    const longitude = Number(deliveryLongitude);

    const hasMapLocation =
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180;

    if (
      !hasMapLocation ||
      !paymentMethod ||
      !items?.length
    ) {
      return res.status(400).json({
        error:
          'A map delivery location, payment method, and items are required'
      });
    }

    const addressForOrder =
      deliveryAddress?.trim() ||
      `Map location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    const menuItemIds =
      items.map(item => item.menuItemId);

    const [menuItems] = await pool.query(
      `
      SELECT
        mi.*,
        r.name AS restaurant_name,
        r.cluster_id
      FROM menu_items mi
      JOIN restaurants r
        ON mi.restaurant_id = r.id
      WHERE mi.id IN (?)
      `,
      [menuItemIds]
    );

    const clusterIds = [
      ...new Set(
        menuItems.map(
          item => item.cluster_id
        )
      )
    ];

    const restaurantIds = [
      ...new Set(
        menuItems.map(
          item => item.restaurant_id
        )
      )
    ];

    if (clusterIds.length > 1) {
      return res.status(400).json({
        error:
          'Some restaurants in your order are too far apart to be delivered together. Please order from one area or split into separate orders.'
      });
    }

    if (restaurantIds.length > 3) {
      return res.status(400).json({
        error:
          'You can only combine up to three restaurants in a single order. Please remove items from extra restaurants to continue.'
      });
    }

    const DELIVERY_FEE = 80;

    let subtotal = 0;

    for (const item of items) {

      const menuItem =
        menuItems.find(
          menu =>
            menu.id === item.menuItemId
        );

      if (menuItem) {
        subtotal +=
          menuItem.price *
          item.quantity;
      }
    }

    const totalAmount =
      subtotal + DELIVERY_FEE;

    const eta =
      new Date(
        Date.now() +
        45 * 60 * 1000
      );

    // Cash on Delivery is considered paid
    // at delivery time.
    const paymentStatus =
      paymentMethod === 'Cash on Delivery'
        ? 'paid'
        : 'pending';

    const [orderResult] =
      await pool.query(
        `
        INSERT INTO orders
        (
          user_id,
          status,
          total_amount,
          delivery_fee,
          delivery_address,
          delivery_lat,
          delivery_lng,
          payment_method,
          payment_status,
          estimated_delivery
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          userId,
          'pending_confirmation',
          totalAmount,
          DELIVERY_FEE,
          addressForOrder,
          latitude,
          longitude,
          paymentMethod,
          paymentStatus,
          eta
        ]
      );

    const orderId =
      orderResult.insertId;

    for (const item of items) {

      const menuItem =
        menuItems.find(
          menu =>
            menu.id === item.menuItemId
        );

      if (!menuItem) continue;

      await pool.query(
        `
        INSERT INTO order_items
        (
          order_id,
          menu_item_id,
          restaurant_id,
          name,
          price,
          quantity
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          orderId,
          item.menuItemId,
          menuItem.restaurant_id,
          menuItem.name,
          menuItem.price,
          item.quantity
        ]
      );
    }

    const [newOrder] =
      await pool.query(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
      );

    const [orderItems] =
      await pool.query(
        `
        SELECT
          oi.*,
          r.name AS restaurant_name,
          r.opening_time,
          r.closing_time,
          r.temporary_closed,
          r.temporary_closed_until
        FROM order_items oi
        JOIN restaurants r
          ON oi.restaurant_id = r.id
        WHERE oi.order_id = ?
        `,
        [orderId]
      );

    const orderRestaurantIds = [
      ...new Set(
        orderItems.map(
          item => item.restaurant_id
        )
      )
    ];

    const restaurants =
      orderRestaurantIds.map(
        restaurantId => {

          const restaurantItems =
            orderItems.filter(
              item =>
                item.restaurant_id ===
                restaurantId
            );

          const restaurantInfo =
            restaurantItems[0];

          return {
            id: restaurantId,

            name:
              restaurantInfo?.restaurant_name ||
              `Restaurant ${restaurantId}`,

            subtotal:
              restaurantItems.reduce(
                (sum, item) =>
                  sum +
                  item.price *
                  item.quantity,
                0
              ),

            status:
              getRestaurantStatus(
                restaurantInfo
              )
          };
        }
      );

    res.status(201).json({
      ...newOrder[0],
      items: orderItems,
      restaurants
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Failed to create order'
    });
  }
});


/* =========================================================
   GET SINGLE ORDER
========================================================= */

router.get('/:id', async (req, res) => {
  try {

    const id =
      parseInt(req.params.id);

    const [orders] =
      await pool.query(
        'SELECT * FROM orders WHERE id = ?',
        [id]
      );

    if (orders.length === 0) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    const [items] =
      await pool.query(
        `
        SELECT
          oi.*,
          r.name AS restaurant_name,
          r.opening_time,
          r.closing_time,
          r.temporary_closed,
          r.temporary_closed_until
        FROM order_items oi
        JOIN restaurants r
          ON oi.restaurant_id = r.id
        WHERE oi.order_id = ?
        `,
        [id]
      );

    const restaurantIds = [
      ...new Set(
        items.map(
          item => item.restaurant_id
        )
      )
    ];

    const restaurants =
      restaurantIds.map(
        restaurantId => {

          const restaurantItems =
            items.filter(
              item =>
                item.restaurant_id ===
                restaurantId
            );

          const restaurantInfo =
            restaurantItems[0];

          return {
            id: restaurantId,

            name:
              restaurantInfo?.restaurant_name ||
              `Restaurant ${restaurantId}`,

            subtotal:
              restaurantItems.reduce(
                (sum, item) =>
                  sum +
                  item.price *
                  item.quantity,
                0
              ),

            status:
              getRestaurantStatus(
                restaurantInfo
              )
          };
        }
      );

    res.json({
      ...orders[0],
      items,
      restaurants
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Failed to get order'
    });
  }
});


/* =========================================================
   CANCEL ORDER
========================================================= */

router.patch('/:id/cancel', async (req, res) => {
  try {

    const id =
      parseInt(req.params.id);

    await pool.query(
      `
      UPDATE orders
      SET status = ?
      WHERE id = ?
      `,
      ['cancelled', id]
    );

    // Ensure order_items are also marked cancelled so restaurants don't see them
    await pool.query(
      `
      UPDATE order_items
      SET status = 'cancelled'
      WHERE order_id = ?
      `,
      [id]
    );

    const [orders] =
      await pool.query(
        'SELECT * FROM orders WHERE id = ?',
        [id]
      );

    res.json({
      ...orders[0],
      items: [],
      restaurants: []
    });

  } catch (err) {

    res.status(500).json({
      error: 'Failed to cancel order'
    });
  }
});


/* =========================================================
   ACCEPT ORDER
========================================================= */

router.patch("/:id/accept", async (req, res) => {
  try {

    await pool.query(
      `
      UPDATE orders
      SET status = ?
      WHERE id = ?
      `,
      [
        "confirmed",
        req.params.id
      ]
    );

    res.json({
      success: true,
      message: "Order accepted"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });
  }
});


/* =========================================================
   REJECT ORDER
========================================================= */

router.patch("/:id/reject", async (req, res) => {
  try {

    await pool.query(
      `
      UPDATE orders
      SET status = ?
      WHERE id = ?
      `,
      [
        "rejected",
        req.params.id
      ]
    );

    res.json({
      success: true,
      message: "Order rejected"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });
  }
});


/* =========================================================
   RESTAURANT ORDERS
========================================================= */

router.get(
  "/restaurant/:restaurantId",
  async (req, res) => {

    try {

      const [orders] =
        await pool.query(
          `
          SELECT
            o.id,
            o.status,
            o.total_amount,
            o.created_at,
            u.name AS customer_name
          FROM orders o
          JOIN users u
            ON o.user_id = u.id
          JOIN order_items oi
            ON o.id = oi.order_id
          WHERE oi.restaurant_id = ?
          AND IFNULL(o.status, '') != 'cancelled'
          GROUP BY o.id
          ORDER BY o.created_at DESC
          `,
          [req.params.restaurantId]
        );

      for (const order of orders) {

        const [items] =
          await pool.query(
            `
            SELECT
              name,
              quantity,
              price
            FROM order_items
            WHERE order_id = ?
            AND restaurant_id = ?
            `,
            [
              order.id,
              req.params.restaurantId
            ]
          );

        order.items = items;
      }

      res.json(orders);

    } catch (err) {

      console.log(err);

      res.status(500).json({
        error: "Server Error"
      });
    }
  }
);

// router.put("/restaurant/orders/:orderId/status", async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { status, restaurantId } = req.body;

//     const allowedStatuses = [
//       "confirmed",
//       "preparing",
//       "ready",
//       "out for delivery",
//       "delivered",
//       "rejected"
//     ];

//     if (!allowedStatuses.includes(status)) {
//       return res.status(400).json({
//         error: "Invalid order status"
//       });
//     }

//     await pool.query(
//       `
//       UPDATE orders
//       SET status = ?
//       WHERE id = ?
//       `,
//       [status, orderId]
//     );

//     res.json({
//       success: true,
//       message: "Order status updated",
//       status
//     });

//   } catch (err) {
//     console.error("UPDATE ORDER STATUS ERROR:", err);

//     res.status(500).json({
//       error: "Failed to update order status"
//     });
//   }
// });

/* =========================================================
   UPDATE RESTAURANT ORDER STATUS
========================================================= */

router.put(
  "/restaurant/orders/:orderId/status",
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, restaurantId } = req.body;

      const allowedStatuses = [
        "confirmed",
        "preparing",
        "ready",
        "out for delivery",
        "delivered",
        "rejected"
      ];

      // Check status
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid order status"
        });
      }

      // Check restaurant ID
      if (!restaurantId) {
        return res.status(400).json({
          error: "Restaurant ID is required"
        });
      }

      /*
        Make sure this order actually belongs
        to this restaurant.
      */
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

      /*
        Update the MAIN order status.

        This is important because the customer
        tracking page reads orders.status.
      */
      const [result] = await pool.query(
        `
        UPDATE orders
        SET status = ?
        WHERE id = ?
        `,
        [status, orderId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: "Order not found"
        });
      }

      console.log(
        `Order ${orderId} status changed to: ${status}`
      );

      res.json({
        success: true,
        message: "Order status updated successfully",
        orderId: Number(orderId),
        status
      });

    } catch (err) {
      console.error(
        "UPDATE RESTAURANT ORDER STATUS ERROR:",
        err
      );

      res.status(500).json({
        error: "Failed to update order status"
      });
    }
  }
);

/* =========================================================
   MARK ORDER DELIVERED
========================================================= */

router.patch(
  "/:id/delivered",
  async (req, res) => {

    console.log(
      "DELIVERED ROUTE HIT:",
      req.params.id
    );

    try {

      await pool.query(
        `
        UPDATE orders
        SET status = 'delivered'
        WHERE id = ?
        `,
        [req.params.id]
      );

      const [result] =
        await pool.query(
          `
          UPDATE order_items
          SET status = 'delivered'
          WHERE order_id = ?
          `,
          [req.params.id]
        );

      console.log(
        "Updated order_items:",
        result.affectedRows
      );

      res.json({
        success: true,
        affectedRows:
          result.affectedRows
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        success: false
      });
    }
  }
);


export default router;