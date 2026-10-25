import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { createVisitorId } from '@shared/utils/visitorId.js';
import { startPresence } from '@shared/utils/presence.js';
import { API_BASE, getVisitorId } from '../services/analytics';
const sessionId = createVisitorId(); // A separate session for each browser tab.
export default function usePresence() {
  const { pathname } = useLocation();
  const publicPage = pathname === '/' || /^\/user(?:\/[^/]+)?\/?$/.test(pathname) || /^\/places(?:\/[^/]+)?\/?$/.test(pathname);
  useEffect(() => {
    if (!publicPage) return;
    let leaving = false;
    return startPresence({
      send: active => {
        void fetch(`${API_BASE}/api/analytics/ping`, {
          method: 'POST', keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, visitorId: getVisitorId(), platform: 'web', active }),
        }).catch(() => {});
      },
      isActive: () => !leaving && document.visibilityState === 'visible',
      subscribe: ping => {
        const hide = () => { leaving = true; ping(); };
        const show = () => { leaving = false; ping(); };
        document.addEventListener('visibilitychange', ping);
        window.addEventListener('pagehide', hide);
        window.addEventListener('pageshow', show);
        return () => {
          document.removeEventListener('visibilitychange', ping);
          window.removeEventListener('pagehide', hide);
          window.removeEventListener('pageshow', show);
        };
      },
    });
  }, [publicPage]);
}
