import { useState } from 'react';
import { useAdmin } from '../AdminContext';

export default function Accounts() {
  const { accounts, openModal, toggleAccount, toast } = useAdmin();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');

  const q = query.toLowerCase();
  const data = accounts.filter(
    (a) =>
      (a.name + ' ' + a.username).toLowerCase().includes(q) &&
      (role === 'all' || a.role === role) &&
      (status === 'all' || (status === 'active' ? a.active : !a.active)),
  );

  const edit = (a) => {
    if (a.locked) {
      toast('Không thể chỉnh sửa tài khoản Admin chính trong bản minh họa.');
      return;
    }
    openModal('account', { editId: a.id });
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">PHÂN QUYỀN TRUY CẬP</p>
          <h1>Quản lý tài khoản</h1>
          <p>Tạo tài khoản Manager do Admin cấp, chỉnh sửa thông tin và tạm khóa tài khoản khi cần.</p>
        </div>
        <button className="btn primary" onClick={() => openModal('account')}>
          ＋ Tạo tài khoản Manager
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="⌕  Tìm tên hoặc tài khoản..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="all">Tất cả vai trò</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
        </select>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="closed">Đã đóng</option>
        </select>
      </div>

      <div className="table-wrap">
        <table style={{ minWidth: 780 }}>
          <thead>
            <tr>
              <th>Tài khoản</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              data.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="account-avatar">
                        {a.role === 'Admin' ? 'AD' : a.name.split(' ').slice(-1)[0].slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <b style={{ fontSize: 11 }}>{a.name}</b>
                        <small style={{ display: 'block', color: 'var(--muted)', marginTop: 4 }}>@{a.username}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={'status ' + (a.role === 'Admin' ? 'pending' : 'live')}>{a.role}</span>
                  </td>
                  <td>{a.date}</td>
                  <td>
                    <span className={'status ' + (a.active ? 'live' : 'closed')}>
                      {a.active ? 'Đang hoạt động' : 'Đã đóng'}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn small" onClick={() => edit(a)}>
                        Chỉnh sửa
                      </button>
                      {a.locked ? (
                        <span style={{ fontSize: 10, color: 'var(--muted)' }}>Tài khoản chính</span>
                      ) : (
                        <button
                          className={'btn small ' + (a.active ? 'danger' : 'success')}
                          onClick={() => toggleAccount(a.id)}
                        >
                          {a.active ? 'Đóng tài khoản' : 'Mở lại'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="empty">
                  Không tìm thấy tài khoản.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="footer-note">
        Tài khoản Admin mặc định được bảo vệ trong bản minh họa. Chức năng đóng tài khoản ở đây chỉ thay đổi trạng thái
        trên giao diện; hệ thống thật cần kiểm tra quyền và ghi nhận nhật ký.
      </p>
    </section>
  );
}
