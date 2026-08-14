ALTER TABLE users
ADD COLUMN role ENUM('customer', 'restaurant', 'admin')
DEFAULT 'customer';