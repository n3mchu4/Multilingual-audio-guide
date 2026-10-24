import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../AdminContext';
import { ADMIN_BASE } from '../navItems';

export default function Dashboard() {
  const { places, stats, analytics, openModal } = useAdmin();
  const navigate = useNavigate();
  const requests = places.filter((p) => p.request);
  const playsByLandmark = stats.playsByLandmark || {};
  const recentPlays = analytics?.recentPlays || [];

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">TỔNG QUAN HỆ THỐNG & THEO DÕI TRỰC TIẾP</p>
          <h1>Xin chào, Admin 👋</h1>
          <p>Theo dõi số người đang dùng app, lượt nghe thuyết minh và nội dung di sản.</p>
        </div>
        <button className="btn" onClick={() => navigate(`${ADMIN_BASE}/activity`)}>
          ◷ Xem nhật ký hoạt động
        </button>
      </div>

      <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat" style={{ borderLeft: '4px solid #21835e' }}>
          <div className="stat-top">
            <div className="stat-icon" style={{ background: '#edf8f2', color: '#21835e' }}>👥</div>
            <span className="status live" style={{ animation: 'pulse 2s infinite' }}>● Trực tiếp</span>
          </div>
          <strong>{stats.activeUsers}</strong>
          <span className="label">Người đang dùng app (Online)</span>
        </div>

        <div className="stat" style={{ borderLeft: '4px solid #d63384' }}>
          <div className="stat-top">
            <div className="stat-icon">🎧</div>
            <span className="trend">Âm thanh</span>
          </div>
          <strong>{stats.totalAudioPlays}</strong>
          <span className="label">Tổng lượt nghe thuyết minh</span>
        </div>

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
            <span className="trend">Tài khoản</span>
          </div>
          <strong>{stats.activeAccounts}</strong>
          <span className="label">Tài khoản quản lý</span>
        </div>

        <div className="stat">
          <div className="stat-top">
            <div className="stat-icon">↻</div>
            <span className="status pending">Cần xử lý</span>
          </div>
          <strong>{stats.pending}</strong>
          <span className="label">Yêu cầu từ Manager</span>
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

      {/* Thống kê người dùng và lượt nghe thuyết minh */}
      <div className="section-grid" style={{ marginBottom: 18 }}>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>🎧 Lượt nghe thuyết minh theo địa danh</h3>
              <p>Số lần khách tham quan bấm nghe audio thuyết minh</p>
            </div>
            <span className="status live">{stats.totalAudioPlays} lượt nghe</span>
          </div>
          <div className="panel-body">
            {places.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {places.map((p) => {
                  const count = playsByLandmark[p.id] || 0;
                  const pct = stats.totalAudioPlays > 0 ? Math.round((count / stats.totalAudioPlays) * 100) : 0;
                  return (
                    <div key={p.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                        <b>{p.name}</b>
                        <span><strong>{count}</strong> lượt ({pct}%)</span>
                      </div>
                      <div style={{ height: 7, background: '#fce7f3', borderRadius: 4, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            minWidth: count > 0 ? 8 : 0,
                            height: '100%',
                            background: 'linear-gradient(90deg, #d63384, #ad1f63)',
                            borderRadius: 4,
                            transition: 'width 0.5s',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty">Chưa có dữ liệu địa danh.</div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>📡 Hoạt động nghe gần nhất (Live Feed)</h3>
              <p>Khách đang tương tác với ứng dụng</p>
            </div>
            <span className="status live" style={{ background: '#edf8f2', color: '#21835e' }}>
              ● {stats.activeUsers} người online
            </span>
          </div>
          <div className="panel-body">
            {recentPlays.length ? (
              <div className="activity">
                {recentPlays.slice(0, 5).map((ev, i) => (
                  <div className="activity-item" key={i}>
                    <div className="activity-dot" style={{ background: '#fce7f3', color: '#d63384' }}>🎧</div>
                    <div style={{ flex: 1 }}>
                      <p><b>{ev.title}</b></p>
                      <small>{new Date(ev.time).toLocaleTimeString('vi-VN')} · Thuyết minh {ev.lang ? ev.lang.toUpperCase() : 'VI'}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty" style={{ padding: '24px 0' }}>
                <p>Chưa có lượt phát audio nào được ghi nhận gần đây.</p>
                <small style={{ color: 'var(--muted)' }}>Khi khách mở app và bấm nghe audio, hoạt động sẽ xuất hiện tại đây theo thời gian thực.</small>
              </div>
            )}
          </div>
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
                <p>{stats.buses} kết nối tuyến/trạm đang được lưu trong PostgreSQL.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
