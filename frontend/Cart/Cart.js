import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity } from '../../store/cartSlice';
import './Cart.css';
import { FaTrash } from 'react-icons/fa';

function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, totalAmount } = useSelector(state => state.cart);

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <h2>Your Cart is Empty</h2>
            <p>Add items from restaurants to get started</p>
            <button className="btn btn-primary" onClick={() => navigate('/restaurants')}>Browse Restaurants</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h2>Your Cart</h2>
        <div className="cart-content">
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p className="price">Rs. {item.price}</p>
                </div>
                <div className="quantity-control">
                  <button onClick={() => dispatch(updateQuantity({itemId: item.id, quantity: item.quantity - 1}))}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => dispatch(updateQuantity({itemId: item.id, quantity: item.quantity + 1}))}>+</button>
                </div>
                <div className="item-total">Rs. {(item.price * item.quantity).toFixed(2)}</div>
                <button className="btn-delete" onClick={() => dispatch(removeFromCart(item.id))}><FaTrash /></button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row"><span>Subtotal:</span><span>Rs. {totalAmount.toFixed(2)}</span></div>
            <div className="summary-row"><span>Delivery:</span><span>Rs. 100</span></div>
            <div className="summary-row total"><span>Total:</span><span>Rs. {(totalAmount + 100).toFixed(2)}</span></div>
            <button className="btn btn-primary btn-block">Proceed to Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;