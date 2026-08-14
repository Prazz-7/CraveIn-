Terminal command to create the admins table and insert an administrator record with a hashed password.
node hashAdmin.js


INSERT INTO admins (name, email, password)
VALUES (
    'Administrator',
    'admin@cravein.com',
    'PASTE_YOUR_BCRYPT_HASH_HERE'
);