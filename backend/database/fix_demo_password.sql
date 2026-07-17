-- Optional one-time fix for an existing database seeded before the bcrypt demo-user update.
-- Demo login: demo@example.com / 123456

USE cravein;

UPDATE users
SET password = '$2a$10$.x6oV71.eIgLaUaS9UXPDeLBkjXQOWpfuwMYSqjttLdNLJniazyda'
WHERE email = 'demo@example.com';
