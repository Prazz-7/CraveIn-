import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => sessionStorage.getItem('cravein-token'));

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(u => { if (u) setUser(u); else logout(); })
        .catch(() => logout());
    }
  }, []);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    sessionStorage.setItem('cravein-token', data.token);
    sessionStorage.setItem('cravein-show-login-popup', '1');
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (fields) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    sessionStorage.setItem('cravein-token', data.token);
    sessionStorage.setItem('cravein-show-signup-popup', '1');
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    // Show logout popup for customers
    try { sessionStorage.setItem('cravein-show-logout-popup', '1'); } catch (e) {}
    sessionStorage.removeItem('cravein-token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
