import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import LocationPicker from '../components/LocationPicker.jsx';

export default function Cart() {
  const { items, itemsByRestaurant, subtotal, deliveryFee, total, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.address || '');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [saveLocationLabel, setSaveLocationLabel] = useState('Home location');
  const [savingMapLocation, setSavingMapLocation] = useState(false);
  const [mapSaveMessage, setMapSaveMessage] = useState('');
  const [locationSaved, setLocationSaved] = useState(false);
  const [payment, setPayment] = useState('Cash on Delivery');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const clusterIds = [...new Set(items.map(i => i.clusterId).filter(id => id != null))];
  const restaurantIds = [...new Set(items.map(i => i.restaurantId))];
  const clusterError = clusterIds.length > 1 ? 'Some restaurants in your cart are too far apart to combine into a single delivery. Please order from nearby restaurants in the same area or split your order.' : '';
  const restaurantLimitError = restaurantIds.length > 3 ? 'You can only combine up to three restaurants in one order. Remove items from extra restaurants to continue.' : '';

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/auth/addresses', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : [])
      .then(addresses => {
        setSavedAddresses(addresses);
        const preferred = addresses.find(item => item.is_default) || addresses[0];
        if (preferred) {
          setSelectedAddressId(String(preferred.id));
          setSelectedLocation({
            ...preferred,
            latitude: Number(preferred.latitude),
            longitude: Number(preferred.longitude),
          });
          setAddress(preferred.address);
        }
      })
      .catch(() => setSavedAddresses([]));
  }, [isAuthenticated, token]);

  const chooseSavedAddress = event => {
    const id = event.target.value;
    setSelectedAddressId(id);
    const selected = savedAddresses.find(item => String(item.id) === id);
    if (selected) {
      const latitude = Number(selected.latitude);
      const longitude = Number(selected.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        setError('Saved location coordinates are invalid. Please choose a new map location.');
        return;
      }
      setSelectedLocation({
        ...selected,
        latitude,
        longitude,
      });
      setAddress(selected.address);
      setShowMapPicker(false);
      setLocationSaved(false);
    }
  };

  const chooseMapLocation = location => {
    const selected = { latitude: Number(location.lat), longitude: Number(location.lng) };
    setSelectedAddressId('');
    setSelectedLocation(selected);
    setAddress('');
    setError('');
    setMapSaveMessage('');
    setLocationSaved(false);
  };

  const saveSelectedMapLocation = async () => {
    if (!isAuthenticated) {
      setError('Log in first to save this delivery location.');
      return;
    }
    if (!selectedLocation?.latitude || !selectedLocation?.longitude) {
      setError('Choose a delivery pin on the map before saving.');
      return;
    }
    setSavingMapLocation(true);
    setError('');
    setMapSaveMessage('');

    try {
      const response = await fetch('/api/auth/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: saveLocationLabel.trim() || `Saved location ${selectedLocation.latitude.toFixed(5)}, ${selectedLocation.longitude.toFixed(5)}`,
          address: address.trim() || 'Saved map location',
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          isDefault: savedAddresses.length === 0,
        }),
      });
      const saved = await response.json();
      if (!response.ok) throw new Error(saved.error || 'Could not save address');
      const normalizedSaved = {
        ...saved,
        latitude: Number(saved.latitude),
        longitude: Number(saved.longitude),
      };
      if (!Number.isFinite(normalizedSaved.latitude) || !Number.isFinite(normalizedSaved.longitude)) {
        throw new Error('Saved address returned invalid coordinates.');
      }
      setSavedAddresses(previous => [normalizedSaved, ...previous.filter(item => !normalizedSaved.is_default || !item.is_default)]);
      setSelectedAddressId(String(normalizedSaved.id));
      setSelectedLocation(normalizedSaved);
      setLocationSaved(true);
      setMapSaveMessage('Location saved. You can still adjust it or place your order now.');
      toast({
        title: 'Location saved',
        description: 'Your delivery location was saved successfully.',
      });
    } catch (err) {
      setError(err.message || 'Could not save delivery location.');
    } finally {
      setSavingMapLocation(false);
    }
  };

  const handleOrder = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (clusterError) {
      setError(clusterError);
      return;
    }
    if (restaurantLimitError) {
      setError(restaurantLimitError);
      return;
    }
    if (!selectedLocation || selectedLocation.latitude == null || selectedLocation.longitude == null) {
      setError('Choose a delivery location on the map before placing your order.');
      return;
    }
    setPlacing(true); setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          deliveryAddress: address,
          deliveryLatitude: selectedLocation.latitude,
          deliveryLongitude: selectedLocation.longitude,
          paymentMethod: payment,
          items: items.map(i => ({ menuItemId: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order failed');

      if (payment === 'eSewa') {
        // Cart is cleared now since the order already exists (as "pending
        // payment"); the browser is about to leave the page for eSewa's
        // sandbox payment form.
        clearCart();
        const initRes = await fetch('/api/payments/esewa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ orderId: data.id }),
        });
        const initData = await initRes.json();
        if (!initRes.ok) throw new Error(initData.error || 'Could not start eSewa payment');

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = initData.formUrl;
        Object.entries(initData.fields).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }

      clearCart();
      navigate(`/orders/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) return (
    <div className="empty-state" style={{ paddingTop: '5rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
      <h3>Your cart is empty</h3>
      <p style={{ marginBottom: '1.5rem' }}>Add items from multiple restaurants to get started</p>
      <button className="btn btn-primary" onClick={() => navigate('/restaurants')}>Browse Restaurants</button>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize: '2rem', marginBottom: '1rem' }}>Your Cart</h1>
      {clusterError && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '1rem', borderRadius: 8, marginBottom: '1rem' }}>
          <strong>Nearby restaurants only:</strong> {clusterError}
        </div>
      )}
      <div className="grid-sidebar">
        <div>
          {Object.entries(itemsByRestaurant).map(([rid, group]) => (
            <div key={rid} className="card" style={{ marginBottom: '1rem' }}>
              <div className="card-header"><span style={{ fontWeight: 700 }}>🏪 {group.restaurantName}</span></div>
              {group.items.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: 'var(--primary)', fontWeight: 700 }}>NPR {item.price}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '0.25rem 0.6rem' }} onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                    <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '0.25rem 0.6rem' }} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: '#dc2626', padding: '0.25rem 0.6rem' }} onClick={() => removeItem(item.id)}>🗑</button>
                  </div>
                  <div style={{ fontWeight: 700, minWidth: 80, textAlign: 'right' }}>NPR {item.price * item.quantity}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div>
          <div className="card card-body" style={{ position: 'sticky', top: 80 }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Order Summary</h3>
            <div className="form-group">
              <label className="form-label">Delivery Location</label>
              {isAuthenticated && savedAddresses.length > 0 && (
                <select className="form-input form-select" value={selectedAddressId} onChange={chooseSavedAddress} style={{ marginBottom: '0.6rem' }}>
                  {savedAddresses.map(item => <option key={item.id} value={item.id}>{item.label}{item.is_default ? ' (Default)' : ''}</option>)}
                </select>
              )}
              {isAuthenticated && !savedAddresses.length && <p className="text-muted text-sm" style={{ marginBottom: '0.6rem' }}>No saved delivery locations yet.</p>}
              {isAuthenticated && <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowMapPicker(previous => !previous)} style={{ marginBottom: showMapPicker ? '0.75rem' : '0.6rem' }}>{showMapPicker ? 'Hide map' : 'Add location on map'}</button>}
              {isAuthenticated && showMapPicker && <div style={{ marginBottom: '0.9rem' }}>
                <LocationPicker
                  value={selectedLocation ? { lat: Number(selectedLocation.latitude), lng: Number(selectedLocation.longitude) } : null}
                  onChange={chooseMapLocation}
                />
              </div>}
              {selectedLocation && !locationSaved && selectedAddressId === '' && (
                <div style={{ marginBottom: '0.9rem', display: 'grid', gap: '0.65rem' }}>
                  <p style={{ color: '#166534', fontSize: '0.9rem' }}>Map location selected at {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}.</p>
                  <input
                    className="form-input"
                    value={saveLocationLabel}
                    onChange={e => setSaveLocationLabel(e.target.value)}
                    placeholder="Save this location as..."
                  />
                  <textarea className="form-input" rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="Optional: building, floor, street, or landmark" />
                  <button type="button" className="btn btn-primary btn-sm" onClick={saveSelectedMapLocation} disabled={savingMapLocation} style={{ marginTop: '0.65rem' }}>
                    {savingMapLocation ? 'Saving...' : 'Save location'}
                  </button>
                  {mapSaveMessage && <p style={{ color: '#166534', fontSize: '0.85rem', marginTop: 0 }}>{mapSaveMessage}</p>}
                </div>
              )}
              {selectedLocation && locationSaved && (
                <div style={{ marginBottom: '0.9rem' }}>
                  <p style={{ color: '#166534', fontSize: '0.9rem' }}>This location has been saved to your address list.</p>
                  {mapSaveMessage && <p style={{ color: '#166534', fontSize: '0.85rem', marginTop: 0 }}>{mapSaveMessage}</p>}
                </div>
              )}
              {isAuthenticated && <button type="button" className="btn btn-ghost btn-sm" style={{ padding: '0.35rem 0', marginTop: '0.35rem' }} onClick={() => navigate('/profile')}>Manage saved addresses</button>}
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select className="form-input form-select" value={payment} onChange={e => setPayment(e.target.value)}>
                <option>Cash on Delivery</option>
                <option>eSewa</option>
                <option>Khalti</option>
              </select>
            </div>
            <div className="separator" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              <span>Subtotal</span><span>NPR {subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              <span>Delivery Fee</span><span>NPR {deliveryFee}</span>
            </div>
            <div className="separator" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              <span>Total</span><span style={{ color: 'var(--primary)' }}>NPR {total}</span>
            </div>
            {((clusterError || restaurantLimitError) || error) && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{clusterError || restaurantLimitError || error}</p>}
            {!isAuthenticated ? (
              <button className="btn btn-primary btn-full" onClick={() => navigate('/login')}>Login to Order</button>
            ) : (
              <button className="btn btn-primary btn-full" onClick={handleOrder} disabled={placing}>
                {placing ? 'Placing...' : `Place Order — NPR ${total}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
