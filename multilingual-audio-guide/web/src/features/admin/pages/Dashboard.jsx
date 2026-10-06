import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../AdminContext';
import { ADMIN_BASE } from '../navItems';

export default function Dashboard() {
  const { places, stats, openModal } = useAdmin();
  const navigate = useNavigate();
  const requests = places.filter((p) => p.request);

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">TỔNG QUAN HỆ THỐNG</p>
          <h1>Xin chào, Admin 👋</h1>
          <p>Theo dõi tình trạng nội dung thuyết minh, tài khoản và các kết nối xe buýt.</p>
        </div>
        <button className="btn" onClick={() => navigate(`${ADMIN_BASE}/activity`)}>
          ◷ Xem nhật ký hoạt động
        </button>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-top">
            <div className="stat-icon">⌖</div>
            <span className="trend">Đang hiển thị</span>
          </div>
          <strong>{stats.places}</strong>
          <span className="label">Địa danh thuyết minh</span>
        </div>
        <div className="stat">
          <div className="stat-top">
            <div className="stat-icon">♙</div>
            <span className="trend">Tài khoản hoạt động</span>
          </div>
          <strong>{stats.activeAccounts}</strong>
          <span className="label">Tài khoản đang quản lý</span>
        </div>
        <div className="stat">
          <div className="stat-top">
            <div className="stat-icon">↻</div>
            <span className="status pending">Cần xử lý</span>
          </div>
          <strong>{stats.pending}</strong>
          <span className="label">Yêu cầu cập nhật từ Manager</span>
        </div>
        <div className="stat">
          <div className="stat-top">
            <div className="stat-icon">▤</div>
            <span className="trend">Đã kết nối</span>
          </div>
          <strong>{stats.buses}</strong>
          <span className="label">Kết nối tuyến xe buýt</span>
        </div>
      </div>

      <div className="section-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Yêu cầu cập nhật gần đây</h3>
              <p>Các nội dung Manager gửi chờ Admin xem xét</p>
            </div>
            <button className="btn small" onClick={() => navigate(`${ADMIN_BASE}/places`)}>
              Xem tất cả →
            </button>
          </div>
          <div className="panel-body">
            {requests.length ? (
              requests.map((p) => (
                <div className="activity-item" key={p.id}>
                  <div className="activity-dot">✎</div>
                  <div style={{ flex: 1 }}>
                    <p>
                      <b>{p.name}</b> — yêu cầu cập nhật từ {p.request.manager}
                    </p>
                    <small>{p.request.date} · Đang chờ Admin duyệt</small>
                  </div>
                  <button className="btn small" onClick={() => openModal('request', { placeId: p.id })}>
                    Xem yêu cầu
                  </button>
                </div>
              ))
            ) : (
              <div className="empty">Không có yêu cầu mới cần xử lý.</div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Tình trạng hệ thống</h3>
              <p>Tóm tắt hoạt động quản trị</p>
            </div>
            <span className="status live">Ổn định</span>
          </div>
          <div className="panel-body">
            <div className="notice">
              <span className="notice-icon">✎</span>
              <div>
                <b>Nội dung thuyết minh</b>
                <p>{stats.places} địa danh đang có nội dung hiển thị cho khách tham quan.</p>
              </div>
            </div>
            <div className="notice">
              <span className="notice-icon">♙</span>
              <div>
                <b>Tài khoản Manager</b>
                <p>{stats.activeManagers} tài khoản Manager đang hoạt động.</p>
              </div>
            </div>
            <div className="notice">
              <span className="notice-icon">▤</span>
              <div>
                <b>Dữ liệu xe buýt</b>
                <p>{stats.buses} kết nối tuyến/trạm đang được khai báo trong dữ liệu mẫu.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <div>
            <h3>Quy trình duyệt nội dung</h3>
            <p>Admin kiểm tra thay đổi trước khi nội dung mới được hiển thị cho người dùng</p>
          </div>
        </div>
        <div className="panel-body" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <span className="status pending">1. Manager gửi yêu cầu</span>
          <span style={{ color: '#9fb0ad' }}>→</span>
          <span className="status pending">2. Admin so sánh nội dung</span>
          <span style={{ color: '#9fb0ad' }}>→</span>
          <span className="status live">3. Chấp nhận / Từ chối</span>
          <span style={{ color: '#9fb0ad' }}>→</span>
          <span className="status live">4. Cập nhật hoặc giữ bản cũ</span>
        </div>
      </div>
    </section>
  );
}
