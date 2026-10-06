import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import './admin.css';
import { AdminProvider, useAdmin } from './AdminContext';
import Toast from './components/Toast';
import AdminModals from './modals/AdminModals';
import { NAV_ITEMS } from './navItems';

function AdminShell() {
  const { stats, openModal } = useAdmin();
  const { pathname } = useLocation();

  const path = pathname.replace(/\/$/, '');
  const current = NAV_ITEMS.find((i) => (i.end ? path === i.to : path.startsWith(i.to))) ?? NAV_ITEMS[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <div className="admin-root">
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-icon">⌖</div>
            <div>
              <strong>SAIGON AUDIO GUIDE</strong>
              <small>CỔNG QUẢN TRỊ HỆ THỐNG</small>
            </div>
          </div>
          <div className="nav-label">KHÔNG GIAN QUẢN TRỊ</div>
          <nav className="nav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span className="ico">{item.icon}</span> {item.label}
                {item.badge === 'pending' && <span className="count">{stats.pending}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="side-bottom">
            <div className="profile">
              <div className="avatar">AD</div>
              <div>
                <b>Quản trị viên</b>
                <small>ADMIN · Đang hoạt động</small>
              </div>
            </div>
            <button className="logout-side" onClick={() => openModal('logout')}>
              ↪ &nbsp; Đăng xuất
            </button>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="crumb">
              Saigon Audio Guide &nbsp; / &nbsp; <b>{current.label}</b>
            </div>
            <div className="top-right">
              <span className="status-pill">● HỆ THỐNG ĐANG HOẠT ĐỘNG</span>
              <span className="date-label">Khu vực: Quận 1, TP.HCM</span>
              <div className="avatar">AD</div>
            </div>
          </header>
          <div className="content">
            <Outlet />
          </div>
        </main>
      </div>
      <AdminModals />
      <Toast />
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminProvider>
      <AdminShell />
    </AdminProvider>
  );
}
