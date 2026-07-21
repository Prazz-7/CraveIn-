import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginWelcomeModal() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState({ title: '', body: '' });

  useEffect(() => {
    const loginFlag = sessionStorage.getItem('cravein-show-login-popup') === '1';
    const logoutFlag = sessionStorage.getItem('cravein-show-logout-popup') === '1';
    const signupFlag = sessionStorage.getItem('cravein-show-signup-popup') === '1';

    if (loginFlag) {
      sessionStorage.removeItem('cravein-show-login-popup');
      const name = user?.name || user?.email?.split('@')[0] || 'friend';
      setMessage({ title: 'Logged in successfully', body: `Welcome back, ${name}.` });
      setOpen(true);

      const timer = window.setTimeout(() => setOpen(false), 3000);
      return () => window.clearTimeout(timer);
    }

    if (signupFlag) {
      sessionStorage.removeItem('cravein-show-signup-popup');
      setMessage({ title: 'Account created successfully', body: 'Your account is ready to use.' });
      setOpen(true);

      const timer = window.setTimeout(() => setOpen(false), 3000);
      return () => window.clearTimeout(timer);
    }

    if (logoutFlag) {
      sessionStorage.removeItem('cravein-show-logout-popup');
      setMessage({ title: 'Logged out successfully', body: 'You have been signed out.' });
      setOpen(true);

      const timer = window.setTimeout(() => setOpen(false), 3000);
      return () => window.clearTimeout(timer);
    }

    setOpen(false);
  }, [isAuthenticated, user]);

  if (!open) return null;

  return (
    <div className="login-toast" role="status" aria-live="polite">
      <div className="login-toast-icon">✓</div>
      <div>
        <div className="login-toast-title">{message.title}</div>
        <div className="login-toast-message">{message.body}</div>
      </div>
    </div>
  );
}
