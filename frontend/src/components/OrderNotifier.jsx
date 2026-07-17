import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from './Toast.jsx';
import { useNavigate } from 'react-router-dom';

const STATUS_MESSAGES = {
  confirmed:          { emoji: '✅', title: 'Order confirmed!',        description: 'The restaurant received your order.' },
  preparing:          { emoji: '👨‍🍳', title: 'Now preparing your food', description: 'Your food is being cooked fresh right now.' },
  'out for delivery': { emoji: '🛵', title: 'Out for delivery!',        description: 'Your rider is on the way.' },
  delivered:          { emoji: '🎉', title: 'Order delivered!',         description: 'Enjoy your meal!' },
};

export function OrderNotifier() {
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const lastStatusRef = useRef({});
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const check = async () => {
      try {
        const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const orders = await res.json();

        if (!initializedRef.current) {
          for (const o of orders) lastStatusRef.current[o.id] = o.status;
          initializedRef.current = true;
          return;
        }

        for (const o of orders) {
          const prev = lastStatusRef.current[o.id];
          if (prev !== undefined && prev !== o.status) {
            const msg = STATUS_MESSAGES[o.status?.toLowerCase()];
            if (msg) {
              toast({
                title: `${msg.emoji} ${msg.title}`,
                description: msg.description,
                duration: 6000,
                action: { label: 'Track', onClick: () => navigate(`/orders/${o.id}`) },
              });
            }
          }
          lastStatusRef.current[o.id] = o.status;
        }
      } catch { /* silent */ }
    };

    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  return null;
}
