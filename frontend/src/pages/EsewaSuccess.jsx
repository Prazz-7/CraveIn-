import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function EsewaSuccess() {
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const encodedData = searchParams.get('data');
    if (!encodedData) {
      setStatus('error');
      setMessage('No payment data was returned by eSewa.');
      return;
    }

    fetch('/api/payments/esewa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ encodedData }),
    })
      .then(async res => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Payment could not be verified');
        return body;
      })
      .then(body => {
        setStatus('success');
        setOrderId(body.orderId);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.message);
      });
  }, [searchParams, token]);

  return (
    <div className="container" style={{ paddingTop: '5rem', textAlign: 'center', maxWidth: 480 }}>
      {status === 'verifying' && (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2>Confirming your eSewa payment…</h2>
          <p style={{ color: 'var(--text-muted)' }}>Please wait, this only takes a moment.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2>Payment successful!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Your order has been confirmed.</p>
          <button className="btn btn-primary" onClick={() => navigate(`/orders/${orderId}`)}>Track your order</button>
        </>
      )}
      {status === 'error' && (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2>We couldn't confirm your payment</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{message}</p>
          <Link className="btn btn-outline" to="/orders">View your orders</Link>
        </>
      )}
    </div>
  );
}
