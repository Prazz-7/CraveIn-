import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, action, duration = 5000, variant }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, action, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.variant ? `toast--${t.variant}` : ''}`}>
            <div className="toast-icon">🔔</div>
            <div style={{ flex: 1 }}>
              <div className="toast-title" style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.title}</div>
              {t.description && <div className="toast-desc" style={{ fontSize: '0.86rem', opacity: 0.9, marginTop: 4 }}>{t.description}</div>}
            </div>
            {t.action && (
              <button className="toast-action" onClick={t.action.onClick}>{t.action.label}</button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
