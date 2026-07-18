import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const passwordIsStrong = password => password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
const isGmail = email => /^[^\s@]+@gmail\.com$/i.test(email.trim());

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const set = key => event => {
    setForm(previous => ({ ...previous, [key]: event.target.value }));
    setError('');
    setFieldErrors(previous => ({ ...previous, [key]: '' }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const errors = {};
    if (!form.name.trim()) errors.name = 'Enter your full name.';
    if (!isGmail(form.email)) errors.email = 'Use a Gmail address ending in @gmail.com.';
    if (!form.phone.trim()) errors.phone = 'Phone number is required.';
    else if (!/^[+\d][\d\s-]{6,19}$/.test(form.phone.trim())) errors.phone = 'Enter a valid phone number.';
    if (!passwordIsStrong(form.password)) errors.password = 'Use at least 8 characters with uppercase, lowercase, and a number.';
    if (!form.confirmPassword) errors.confirmPassword = 'Confirm your password.';
    else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setError(''); setFieldErrors({}); setLoading(true);
    try {
      const { confirmPassword, ...fields } = form;
      await register(fields);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 480, margin: '3rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--primary)' }}>Join CraveIn</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Create an account to order and track deliveries.</p>
      <form className="card card-body" onSubmit={handleSubmit} noValidate>
        <h2 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Create Account</h2>
        {error && <div role="alert" style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        <div className="form-group">
          <label className="form-label" htmlFor="register-name">Full Name</label>
          <input id="register-name" className="form-input" value={form.name} onChange={set('name')} placeholder="John Doe" autoComplete="name" required maxLength="255" aria-invalid={!!fieldErrors.name} />
          {fieldErrors.name && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.35rem' }}>{fieldErrors.name}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="register-email">Email</label>
          <input id="register-email" type="email" className="form-input" value={form.email} onChange={set('email')} placeholder="you@gmail.com" autoComplete="email" required aria-invalid={!!fieldErrors.email} />
          {fieldErrors.email && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.35rem' }}>{fieldErrors.email}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="register-phone">Phone Number</label>
          <input id="register-phone" type="tel" className="form-input" value={form.phone} onChange={set('phone')} placeholder="9800000000" autoComplete="tel" required aria-invalid={!!fieldErrors.phone} />
          {fieldErrors.phone && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.35rem' }}>{fieldErrors.phone}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="register-password">Password</label>
          <div style={{ position: 'relative' }}>
            <input id="register-password" type={showPassword ? 'text' : 'password'} className="form-input" value={form.password} onChange={set('password')} autoComplete="new-password" required aria-invalid={!!fieldErrors.password} style={{ paddingRight: '4.6rem' }} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowPassword(previous => !previous)} style={{ position: 'absolute', right: '0.2rem', top: '0.25rem', padding: '0.3rem 0.55rem' }}>{showPassword ? 'Hide' : 'Show'}</button>
          </div>
          {!fieldErrors.password && <p className="text-muted text-sm" style={{ marginTop: '0.35rem' }}>At least 8 characters, including uppercase, lowercase, and a number.</p>}
          {fieldErrors.password && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.35rem' }}>{fieldErrors.password}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="register-confirm-password">Confirm Password</label>
          <input id="register-confirm-password" type={showPassword ? 'text' : 'password'} className="form-input" value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" required aria-invalid={!!fieldErrors.confirmPassword} />
          {(fieldErrors.confirmPassword || (form.confirmPassword && form.password !== form.confirmPassword)) && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.35rem' }}>{fieldErrors.confirmPassword || 'Passwords do not match.'}</p>}
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </form>
    </div>
  );
}
