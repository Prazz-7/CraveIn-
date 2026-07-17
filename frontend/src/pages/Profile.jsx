import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import LocationPicker from '../components/LocationPicker.jsx';

export default function Profile() {
  const { user, token, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState({ label: '', address: '', isDefault: false });
  const [addressLocation, setAddressLocation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [msg, setMsg] = useState('');
  const [addressError, setAddressError] = useState('');
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editAddressForm, setEditAddressForm] = useState({ label: '', address: '', isDefault: false });
  const [savingEditAddress, setSavingEditAddress] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/auth/addresses', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setAddresses)
      .catch(() => setAddresses([]));
  }, [isAuthenticated, token]);

  if (!isAuthenticated) { navigate('/login'); return null; }

  const set = key => event => setForm(previous => ({ ...previous, [key]: event.target.value }));
  const setAddress = key => event => setAddressForm(previous => ({ ...previous, [key]: key === 'isDefault' ? event.target.checked : event.target.value }));

  const handleSave = async event => {
    event.preventDefault();
    if (!isEditingProfile) return;
    setSaving(true); setMsg('');
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setMsg('Profile updated!');
      setIsEditingProfile(false);
    } catch {
      setMsg('Could not update your profile. Please try again.');
    } finally { setSaving(false); }
  };

  const addAddress = async event => {
    event.preventDefault();
    setAddressError(''); setSavingAddress(true);
    if (!addressLocation) {
      setAddressError('Choose your delivery location on the map before saving.');
      setSavingAddress(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...addressForm,
          latitude: addressLocation?.lat ?? null,
          longitude: addressLocation?.lng ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save delivery address');
      setAddresses(previous => [data, ...previous.filter(item => !data.is_default || !item.is_default)]);
      setAddressForm({ label: '', address: '', isDefault: false });
      setAddressLocation(null);
    } catch (err) {
      setAddressError(err.message);
    } finally { setSavingAddress(false); }
  };

  const makeDefault = async id => {
    const res = await fetch(`/api/auth/addresses/${id}/default`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setAddresses(await res.json());
  };

  const deleteAddress = async id => {
    if (!window.confirm('Remove this saved delivery address?')) return;
    const res = await fetch(`/api/auth/addresses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setAddresses(previous => previous.filter(item => item.id !== id));
  };

  const startEditAddress = item => {
    setEditingAddressId(item.id);
    setEditAddressForm({
      label: item.label || '',
      address: item.address || '',
      isDefault: item.is_default || false,
    });
    setMsg('');
    setAddressError('');
  };

  const setEditAddress = key => event => setEditAddressForm(previous => ({ ...previous, [key]: key === 'isDefault' ? event.target.checked : event.target.value }));

  const saveEditedAddress = async id => {
    setSavingEditAddress(true);
    setAddressError('');
    try {
      const res = await fetch(`/api/auth/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editAddressForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update address');
      setAddresses(previous => previous.map(item => item.id === id ? data : item));
      if (data.is_default) {
        setAddresses(previous => previous.map(item => item.id === id ? data : { ...item, is_default: false }));
      }
      setEditingAddressId(null);
      setMsg('Delivery address updated.');
    } catch (err) {
      setAddressError(err.message || 'Could not update address.');
    } finally {
      setSavingEditAddress(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '3rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', marginBottom: '2rem' }}>My Profile</h1>
      <div className="card card-body" style={{ marginBottom: '1.5rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700, margin: '0 auto 1rem' }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{user?.email}</p>
        {msg && <div style={{ background: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem' }}>{msg}</div>}
        <form onSubmit={handleSave}>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={set('name')} readOnly={!isEditingProfile} /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={set('phone')} placeholder="9800000000" readOnly={!isEditingProfile} /></div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {isEditingProfile ? (
                <>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setForm({ name: user?.name || '', phone: user?.phone || '' }); setIsEditingProfile(false); }}>Cancel</button>
                </>
              ) : (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditingProfile(true)}>Edit</button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginLeft: 'auto' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate('/orders')}>My Orders</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={logout} style={{ color: '#dc2626' }}>Log Out</button>
            </div>
          </div>
        </form>
      </div>

      <section className="card card-body">
        <h2 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>Saved Delivery Addresses</h2>
        <p className="text-muted text-sm" style={{ marginBottom: '1.25rem' }}>Save your frequently used addresses, then choose one at checkout.</p>
        {addresses.length ? <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {addresses.map(item => (
            <div key={item.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '0.85rem', display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                {editingAddressId === item.id ? (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div className="form-group"><label className="form-label">Label</label><input className="form-input" value={editAddressForm.label} onChange={setEditAddress('label')} /></div>
                    <div className="form-group"><label className="form-label">Additional info</label><textarea className="form-input" rows={2} value={editAddressForm.address} onChange={setEditAddress('address')} /></div>
                    <label className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" checked={editAddressForm.isDefault} onChange={setEditAddress('isDefault')} /> Set as default</label>
                  </div>
                ) : (
                  <>
                    <strong>{item.label}</strong>{item.is_default ? <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>Default</span> : null}
                    <p className="text-muted text-sm" style={{ marginTop: '0.2rem' }}>{item.address}</p>
                    {item.latitude != null && <p className="text-muted text-sm" style={{ marginTop: '0.2rem' }}>📍 Map pin saved</p>}
                  </>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {editingAddressId === item.id ? (
                  <>
                    <button className="btn btn-primary btn-sm" type="button" onClick={() => saveEditedAddress(item.id)} disabled={savingEditAddress}>{savingEditAddress ? 'Saving...' : 'Save'}</button>
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditingAddressId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    {!item.is_default && <button className="btn btn-ghost btn-sm" type="button" onClick={() => makeDefault(item.id)}>Set default</button>}
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => startEditAddress(item)}>Edit</button>
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => deleteAddress(item.id)} style={{ color: '#dc2626' }}>Remove</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div> : <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>No saved addresses yet.</p>}
        <form onSubmit={addAddress}>
          <div className="form-group"><label className="form-label">Address label</label><input className="form-input" value={addressForm.label} onChange={setAddress('label')} placeholder="Home, Work, or Hostel" maxLength="100" /></div>
          <div className="form-group"><label className="form-label">Delivery notes <span className="text-muted" style={{ fontWeight: 400 }}>(optional)</span></label><textarea className="form-input" rows={2} value={addressForm.address} onChange={setAddress('address')} placeholder="Building, floor, street, or nearby landmark" /></div>
          <div className="form-group"><LocationPicker value={addressLocation} onChange={setAddressLocation} /></div>
          <label className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><input type="checkbox" checked={addressForm.isDefault} onChange={setAddress('isDefault')} /> Make this my default address</label>
          {addressError && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{addressError}</p>}
          <button className="btn btn-primary" type="submit" disabled={savingAddress}>{savingAddress ? 'Saving...' : 'Add Delivery Address'}</button>
        </form>
      </section>
    </div>
  );
}
