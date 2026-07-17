import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);
const DELIVERY_FEE = 80;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((menuItem, restaurant) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === menuItem.id);
      if (existing) return prev.map(i => i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, {
        ...menuItem,
        quantity: 1,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        clusterId: restaurant.cluster_id ?? restaurant.clusterId ?? null,
      }];
    });
  }, []);

  const updateQuantity = useCallback((itemId, qty) => {
    if (qty <= 0) { removeItem(itemId); return; }
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: qty } : i));
  }, []);

  const removeItem = useCallback((itemId) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = items.length > 0 ? subtotal + DELIVERY_FEE : 0;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const itemsByRestaurant = items.reduce((acc, item) => {
    if (!acc[item.restaurantId]) acc[item.restaurantId] = { restaurantName: item.restaurantName, items: [] };
    acc[item.restaurantId].items.push(item);
    return acc;
  }, {});

  return (
    <CartContext.Provider value={{ items, itemsByRestaurant, subtotal, deliveryFee: DELIVERY_FEE, total, totalItems, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
