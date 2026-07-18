import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, action, duration = 5000 }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, action }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.title}</div>
              {t.description && <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: 2 }}>{t.description}</div>}
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
