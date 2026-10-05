export const ADMIN_BASE = '/admin';

export const NAV_ITEMS = [
  { to: ADMIN_BASE, end: true, icon: '▦', label: 'Thống kê' },
  { to: `${ADMIN_BASE}/places`, icon: '⌖', label: 'Quản lý địa danh', badge: 'pending' },
  { to: `${ADMIN_BASE}/accounts`, icon: '♙', label: 'Quản lý tài khoản' },
  { to: `${ADMIN_BASE}/buses`, icon: '▤', label: 'Kết nối xe buýt' },
  { to: `${ADMIN_BASE}/activity`, icon: '◷', label: 'Nhật ký hoạt động' },
  { to: `${ADMIN_BASE}/settings`, icon: '⚙', label: 'Cài đặt hệ thống' },
];
