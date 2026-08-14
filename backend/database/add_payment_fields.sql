-- Adds payment tracking fields needed for the eSewa payment gateway integration.
-- Run this once against your existing database:
--   mysql -u root -p cravein < database/add_payment_fields.sql

ALTER TABLE orders
  ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' AFTER payment_method,
  ADD COLUMN transaction_uuid VARCHAR(100) NULL AFTER payment_status,
  ADD COLUMN payment_ref_id VARCHAR(100) NULL AFTER transaction_uuid;

-- Backfill: orders placed before this migration (COD/etc.) are treated as paid
-- so existing data/tests aren't affected.
UPDATE orders SET payment_status = 'paid' WHERE payment_status = 'pending' AND payment_method = 'Cash on Delivery';
