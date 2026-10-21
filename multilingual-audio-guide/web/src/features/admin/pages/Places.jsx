import { useState } from 'react';
import { useAdmin } from '../AdminContext';

export default function Places() {
  const { places, openModal } = useAdmin();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const q = query.toLowerCase();
  const data = places.filter(
    (p) => p.name.toLowerCase().includes(q) && (filter === 'all' || (filter === 'pending' ? !!p.request : !p.request)),
  );

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">NỘI DUNG THUYẾT MINH</p>
          <h1>Quản lý địa danh</h1>
          <p>Xem nội dung đang hiển thị, kiểm tra yêu cầu chỉnh sửa từ Manager và quyết định duyệt.</p>
        </div>
        <span className="status live">Địa danh được tạo khi Admin duyệt yêu cầu mới từ Manager</span>
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="⌕  Tìm tên địa danh..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Có yêu cầu mới</option>
          <option value="live">Đang hiển thị bản hiện tại</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Địa danh</th>
              <th>Tuyến xe buýt</th>
              <th>Yêu cầu từ Manager</th>
              <th>Nội dung người dùng</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              data.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="place-cell">
                      <img
                        className="place-img"
                        src={p.current?.bgImg || undefined}
                        alt=""
                        onError={(e) => (e.currentTarget.style.opacity = '.35')}
                      />
                      <div>
                        <b>{p.name}</b>
                        <small>{p.district}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {p.buses.length ? (
                      p.buses.map((b, i) => (
                        <span className="bus-number" key={i}>
                          {b.no}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--muted)' }}>Chưa có tuyến</span>
                    )}
                  </td>
                  <td>
                    {p.request ? (
                      <>
                        <span className="status pending">Có yêu cầu mới</span>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 5 }}>{p.request.manager}</div>
                      </>
                    ) : (
                      <span className="status live">Không có yêu cầu</span>
                    )}
                  </td>
                  <td>
                    <button className="btn small" onClick={() => openModal('detail', { placeId: p.id })}>
                      ◉ Xem nội dung
                    </button>
                  </td>
                  <td>
                    <div className="row-actions">
                      {p.request ? (
                        <button className="btn small primary" onClick={() => openModal('request', { placeId: p.id })}>
                          Xem yêu cầu
                        </button>
                      ) : (
                        <button className="btn small" onClick={() => openModal('detail', { placeId: p.id })}>
                          Xem chi tiết
                        </button>
                      )}
                      <button className="btn small" onClick={() => openModal('placeEditor', { placeId: p.id })}>
                        Chỉnh sửa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="empty">
                  Không tìm thấy địa danh phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="footer-note">
        Nội dung và trạng thái yêu cầu được tải từ PostgreSQL. Các URL ảnh/audio được lưu dưới dạng tham chiếu đến Storage.
      </p>
    </section>
  );
}
