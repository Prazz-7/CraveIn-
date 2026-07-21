-- Run this once if your database was created before map-based delivery locations were added.

USE cravein;

ALTER TABLE orders
  ADD COLUMN delivery_lat DECIMAL(10,7) NULL AFTER delivery_address,
  ADD COLUMN delivery_lng DECIMAL(10,7) NULL AFTER delivery_lat;
