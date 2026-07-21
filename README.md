# CraveIn — Multi-Restaurant Food Delivery (MySQL Version)

A full-stack food delivery web app for Nepal built with:
- **Frontend**: HTML, CSS, JavaScript, React.js (Vite)
- **Backend**: Node.js, Express.js
- **Database**: MySQL

## Project Structure

```
cravein-mysql/
├── server/            ← Node.js + Express API
│   ├── index.js       ← Entry point, auto-order progressor
│   ├── db.js          ← MySQL connection pool
│   └── routes/
│       ├── auth.js        ← Register, Login, Profile
│       ├── restaurants.js ← Restaurant listing, detail, reviews
│       └── orders.js      ← Create, list, track orders
├── client/            ← React.js frontend
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Toast.jsx
│       │   └── OrderNotifier.jsx  ← Live status notifications
│       ├── context/
│       │   ├── AuthContext.jsx    ← Login/register state
│       │   └── CartContext.jsx    ← Multi-restaurant cart
│       └── pages/
│           ├── Home.jsx
│           ├── Restaurants.jsx
│           ├── RestaurantDetail.jsx
│           ├── Cart.jsx
│           ├── Orders.jsx
│           ├── OrderTracking.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           └── Profile.jsx
└── database/
    ├── schema.sql     ← CREATE TABLE statements
    └── seed.sql       ← 8 restaurants + 35 menu items
```

## Setup Instructions

### 1. MySQL Database

Make sure MySQL is running, then:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

If you already created the database before saved delivery addresses were added, run this one-time migration:

```bash
mysql -u root -p < database/add_delivery_addresses.sql
mysql -u root -p < database/add_order_delivery_location.sql
```

If you seeded the original demo user and could not log in with it, run:

```bash
mysql -u root -p < database/fix_demo_password.sql
```

### 2. Backend (Express API)

```bash
cd server
npm install
```

Create a `.env` file (optional — defaults work with root/no-password MySQL):
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=cravein
AUTH_SECRET=replace-with-a-long-random-secret-in-production
```

Start the server:
```bash
npm run dev     # development (auto-restart on changes)
# or
npm start       # production
```

The API runs at **http://localhost:5000**

### 3. Frontend (React + Vite)

```bash
cd client
npm install
npm run dev
```

The app opens at **http://localhost:3000**

> The Vite dev server automatically proxies `/api` requests to `http://localhost:5000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in |
| GET | /api/auth/me | Get profile (auth) |
| PATCH | /api/auth/me | Update profile (auth) |
| GET | /api/restaurants | List all restaurants |
| GET | /api/restaurants/featured | Featured restaurants |
| GET | /api/restaurants/categories | Cuisine categories |
| GET | /api/restaurants/:id | Restaurant detail + menu + reviews |
| POST | /api/restaurants/:id/reviews | Add a review |
| GET | /api/orders | List my orders (auth) |
| POST | /api/orders | Place order (auth) |
| GET | /api/orders/:id | Order detail (auth) |
| PATCH | /api/orders/:id/cancel | Cancel order (auth) |

## Features

- **Multi-restaurant cart** — Add from Momo Palace AND Burger Hut in one order
- **Single NPR 80 delivery fee** — No matter how many restaurants
- **Live order tracking** — Status auto-advances every 30 seconds (demo mode)
- **Push notifications** — Toast popups when your order status changes
- **User auth** — Register, login, profile management with bcrypt password hashing
- **Restaurant reviews** — Star ratings and comments
- **Saved delivery addresses** — Save, set a default, remove, and select an address at checkout

## Tech Stack Details

- **mysql2** — MySQL driver for Node.js (uses connection pooling)
- **bcryptjs** — Password hashing
- **express** — REST API framework
- **react-router-dom** — Client-side routing
- **Vite** — Frontend build tool with dev proxy

## Default Test Account

After seeding, register a new account at `/register`.
Passwords are hashed with bcrypt — no plain text passwords stored.
