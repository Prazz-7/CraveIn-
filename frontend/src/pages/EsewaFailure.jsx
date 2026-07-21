import { Link } from 'react-router-dom';

export default function EsewaFailure() {
  return (
    <div className="container" style={{ paddingTop: '5rem', textAlign: 'center', maxWidth: 480 }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
      <h2>Payment was not completed</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Your eSewa payment was cancelled or failed. Your order was not charged — you can try again from your orders page.
      </p>
      <Link className="btn btn-primary" to="/orders">View your orders</Link>
    </div>
  );
}
