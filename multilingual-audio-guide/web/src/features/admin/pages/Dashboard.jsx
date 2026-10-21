import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAdmin } from '../AdminContext';
import { ADMIN_BASE } from '../navItems';

function getInitialMobileAddress() {
  const { hostname, origin } = window.location;
  return hostname === 'localhost' || hostname === '127.0.0.1' ? '' : origin;
}

export default function Dashboard() {
  const { places, stats, openModal, refresh } = useAdmin();
  const navigate = useNavigate();
  const requests = places.filter((p) => p.request);
  const [mobileAddress, setMobileAddress] = useState(getInitialMobileAddress);
  const mobileUrl = useMemo(() => {
    const address = mobileAddress.trim();
    if (!address) return '';

    try {
      const url = new URL(address.includes('://') ? address : `http://${address}`);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
        return '';
      }
      return new URL('/user', url.origin).toString();
    } catch {
      return '';
    }
  }, [mobileAddress]);

  useEffect(() => {
    const refreshTimer = window.setInterval(() => {
      void refresh();
    }, 30_000);
    return () => window.clearInterval(refreshTimer);
  }, [refresh]);

  return (
    <section className="page dashboard-page">
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
        <div className="stat">
          <div className="stat-top">
            <div className="stat-icon">♧</div>
            <span className="trend">Trình duyệt duy nhất</span>
          </div>
          <strong>{stats.visitors == null ? '—' : stats.visitors.toLocaleString('vi-VN')}</strong>
          <span className="label">Người dùng đã truy cập</span>
        </div>
        <div className="stat">
          <div className="stat-top">
            <div className="stat-icon">♫</div>
            <span className="trend">Audio phát thành công</span>
          </div>
          <strong>{stats.listens == null ? '—' : stats.listens.toLocaleString('vi-VN')}</strong>
          <span className="label">Lượt nghe audio</span>
        </div>
      </div>
      {(stats.visitors == null || stats.listens == null) && (
        <p className="analytics-setup-note" role="status">
          Chưa tải được thống kê. Hãy khởi động lại API bằng <code>npm run dev:api</code> sau khi áp dụng migration analytics và cập nhật quyền PostgreSQL.
        </p>
      )}

      <div className="panel mobile-share">
        <div className="panel-head">
          <div>
            <h3>Mở giao diện khách trên điện thoại</h3>
            <p>Quét mã QR bằng camera điện thoại đang kết nối cùng mạng Wi-Fi.</p>
          </div>
        </div>
        <div className="panel-body mobile-share-body">
          <div className="mobile-share-qr">
            {mobileUrl ? (
              <QRCodeSVG
                value={mobileUrl}
                size={200}
                level="M"
                title="Mã QR mở giao diện Saigon Audio Guide trên điện thoại"
              />
            ) : (
              <div className="mobile-share-placeholder" role="status">
                Nhập địa chỉ LAN của máy tính để tạo mã QR
              </div>
            )}
          </div>
          <div className="mobile-share-info">
            <label htmlFor="mobile-share-address">Địa chỉ máy tính trong mạng LAN</label>
            <input
              id="mobile-share-address"
              className="search"
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="192.168.1.10:5173"
              value={mobileAddress}
              onChange={(event) => setMobileAddress(event.target.value)}
              aria-describedby="mobile-share-help"
            />
            <p id="mobile-share-help">
              {mobileAddress && !mobileUrl
                ? 'Địa chỉ không hợp lệ. Nhập IP LAN, ví dụ 192.168.1.10:5173.'
                : 'Khi dùng localhost, lấy địa chỉ Network hiển thị trong terminal sau khi chạy npm run dev.'}
            </p>
            {mobileUrl && (
              <a className="btn primary mobile-share-link" href={mobileUrl} target="_blank" rel="noreferrer">
                Mở thử giao diện khách
              </a>
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
