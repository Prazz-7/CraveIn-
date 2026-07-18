import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(form.email, form.password); navigate('/'); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 440, margin: '4rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', textAlign:'center', marginBottom:'0.5rem', color:'var(--primary)' }}>Welcome Back</h1>
      <p style={{ textAlign:'center', color:'var(--text-muted)', marginBottom:'2rem' }}>Log in to track your multi-restaurant orders.</p>
      <form className="card card-body" onSubmit={handleSubmit}>
        <h2 style={{ fontWeight:700, marginBottom:'1.25rem' }}>Log In</h2>
        {error && <div style={{ background:'#fee2e2', color:'#991b1b', padding:'0.75rem', borderRadius:8, marginBottom:'1rem', fontSize:'0.9rem' }}>{error}</div>}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder="you@example.com" required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" className="form-input" value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} placeholder="••••••••" required />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Logging in...' : 'Sign In'}</button>
        <p style={{ textAlign:'center', marginTop:'1rem', fontSize:'0.9rem', color:'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color:'var(--primary)', fontWeight:600 }}>Sign up</Link>
        </p>
      </form>
    </div>
  );
}
