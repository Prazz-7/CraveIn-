import { Router } from 'express';
import crypto from 'crypto';
import pool from '../db.js';
import { getUserId } from '../authToken.js';

const router = Router();

// --- eSewa configuration -------------------------------------------------
// These default to eSewa's official UAT/sandbox test-merchant credentials,
// which is what you use to demo the flow without a real merchant account.
// eSewa publishes these values in their developer docs; they only work
// against the sandbox host below, never against real money.
const ESW_MERCHANT_CODE = process.env.ESW_MERCHANT_ID || 'EPAYTEST';
const ESW_SECRET_KEY = process.env.ESW_SECRET_KEY || '8gBm/:&EnhH.1/q';
const ESW_FORM_URL = process.env.ESW_FORM_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const ESW_STATUS_URL = process.env.ESW_STATUS_URL || 'https://rc.esewa.com.np/api/epay/transaction/status';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function signFields(totalAmount, transactionUuid) {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESW_MERCHANT_CODE}`;
  return crypto.createHmac('sha256', ESW_SECRET_KEY).update(message).digest('base64');
}

// Kick off a payment: given an existing (pending) order, build the signed
// form fields the frontend needs to auto-submit to eSewa's payment page.
router.post('/esewa/initiate', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { orderId } = req.body;
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = orders[0];

    if (order.payment_status === 'paid') {
      return res.status(400).json({ error: 'This order has already been paid for' });
    }

    const totalAmount = Number(order.total_amount);
    // transaction_uuid must be unique per payment attempt for eSewa
    const transactionUuid = `${order.id}-${Date.now()}`;
    const signature = signFields(totalAmount, transactionUuid);

    await pool.query('UPDATE orders SET transaction_uuid = ?, payment_status = ? WHERE id = ?', [transactionUuid, 'pending', order.id]);

    res.json({
      formUrl: ESW_FORM_URL,
      fields: {
        amount: totalAmount,
        tax_amount: 0,
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: ESW_MERCHANT_CODE,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `${FRONTEND_URL}/payment/esewa/success`,
        failure_url: `${FRONTEND_URL}/payment/esewa/failure`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to initiate eSewa payment' });
  }
});

// eSewa redirects the browser back with a base64-encoded JSON payload
// describing the outcome. We re-verify it server-side against eSewa's
// status-check API before trusting it (never trust the redirect alone).
router.post('/esewa/verify', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { encodedData } = req.body;
    if (!encodedData) return res.status(400).json({ error: 'Missing payment data' });

    let payload;
    try {
      payload = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'));
    } catch {
      return res.status(400).json({ error: 'Malformed payment data' });
    }

    const { transaction_uuid, total_amount, status } = payload;
    const [orders] = await pool.query('SELECT * FROM orders WHERE transaction_uuid = ? AND user_id = ?', [transaction_uuid, userId]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found for this transaction' });
    const order = orders[0];

    if (status !== 'COMPLETE') {
      await pool.query('UPDATE orders SET payment_status = ? WHERE id = ?', ['failed', order.id]);
      return res.status(400).json({ error: 'Payment was not completed', order: { id: order.id } });
    }

    // Cross-check directly with eSewa so a tampered redirect can't fake success
    const statusCheckUrl = `${ESW_STATUS_URL}?product_code=${ESW_MERCHANT_CODE}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`;
    const statusRes = await fetch(statusCheckUrl);
    const statusData = await statusRes.json();

    if (statusData.status !== 'COMPLETE') {
      await pool.query('UPDATE orders SET payment_status = ? WHERE id = ?', ['failed', order.id]);
      return res.status(400).json({ error: 'eSewa could not confirm this payment', order: { id: order.id } });
    }

    await pool.query(
      'UPDATE orders SET payment_status = ?, payment_ref_id = ? WHERE id = ?',
      ['paid', statusData.ref_id || payload.transaction_code || null, order.id]
    );

    res.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify eSewa payment' });
  }
});

export default router;
