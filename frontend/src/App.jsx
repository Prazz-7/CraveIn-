import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { OrderNotifier } from './components/OrderNotifier.jsx';
import ActiveOrderButton from './components/ActiveOrderButton.jsx';
import { OrderStatusProvider } from './context/OrderStatusContext.jsx';
import Home from './pages/Home.jsx';
import Restaurants from './pages/Restaurants.jsx';
import RestaurantDetail from './pages/RestaurantDetail.jsx';
import Cart from './pages/Cart.jsx';
import Orders from './pages/Orders.jsx';
import OrderTracking from './pages/OrderTracking.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import EsewaSuccess from './pages/EsewaSuccess.jsx';
import EsewaFailure from './pages/EsewaFailure.jsx';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e85d04', marginBottom: '0.75rem' }}>📍 CraveIn</div>
            <p style={{ fontSize: '0.9rem', color: '#aaa', maxWidth: 280 }}>
              Order from multiple restaurants in one go. One cart, one delivery fee, endless cravings.
            </p>
          </div>
          <div>
            <h4>Discover</h4>
            <a href="/restaurants">All Restaurants</a>
            <a href="/restaurants?category=Nepali">Nepali</a>
            <a href="/restaurants?category=Fast Food">Fast Food</a>
          </div>
          <div>
            <h4>Account</h4>
            <a href="/profile">Profile</a>
            <a href="/cart">Cart</a>
          </div>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} CraveIn. All rights reserved. Built for Kathmandu.</div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <OrderStatusProvider>
        <OrderNotifier />
        <ActiveOrderButton />
        <div className="layout">
          <Navbar />
          <main className="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/restaurants/:id" element={<RestaurantDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderTracking />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/payment/esewa/success" element={<EsewaSuccess />} />
              <Route path="/payment/esewa/failure" element={<EsewaFailure />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </OrderStatusProvider>
    </ToastProvider>
  );
}
