import { createVisitorId } from '@shared/utils/visitorId.js';
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const KEY = 'saigon-audio-guide.visitor-id';
let visitorId;
export function getVisitorId() {
  if (visitorId) return visitorId;
  try {
    const stored = localStorage.getItem(KEY);
    visitorId = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(stored || '') ? stored : createVisitorId();
    localStorage.setItem(KEY, visitorId);
  } catch { visitorId = createVisitorId(); }
  return visitorId;
}
export function recordPlayback(landmarkId, language) {
  return fetch(`${API_BASE}/api/analytics/listens`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitorId: getVisitorId(), landmarkId, language }),
  }).catch(() => {});
}
