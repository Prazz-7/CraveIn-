
STEP 1: Add new columns to the restaurants table

ALTER TABLE restaurants
ADD COLUMN email VARCHAR(255) UNIQUE;

ALTER TABLE restaurants
ADD COLUMN password VARCHAR(255);

ALTER TABLE restaurants
ADD COLUMN phone VARCHAR(20);

Step 2: Add login credentials
Use restaurant_idPW.sql to update the email and password for each restaurant in the restaurants table.