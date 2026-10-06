import { useState } from 'react';
import { useAdmin } from '../AdminContext';
import { pic } from '../data/mockData';

export default function Buses() {
  const { places, stats, openModal, removeBus } = useAdmin();
  const [query, setQuery] = useState('');

  const q = query.toLowerCase();
  const data = places.filter((p) =>
    (p.name + ' ' + p.buses.map((b) => b.no + ' ' + b.stop).join(' ')).toLowerCase().includes(q),
  );

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">THÔNG TIN DI CHUYỂN</p>
          <h1>Kết nối xe buýt</h1>
          <p>Quản lý tuyến xe và trạm xuống gần từng địa danh để hiển thị cho khách tham quan.</p>
        </div>
        <button className="btn primary" onClick={() => openModal('bus')}>
          ＋ Thêm kết nối xe buýt
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="⌕  Tìm địa danh hoặc số tuyến..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="status live">{stats.buses} kết nối tuyến</span>
      </div>

      <div className="bus-grid">
        {data.length ? (
          data.map((p) => (
            <div className="bus-card" key={p.id}>
              <div className="bus-card-head">
                <img src={pic(p.name)} alt="" onError={(e) => (e.currentTarget.style.opacity = '.35')} />
                <div style={{ flex: 1 }}>
                  <h3>{p.name}</h3>
                  <p>
                    {p.district} · {p.buses.length} tuyến được khai báo
                  </p>
                </div>
                <button className="btn small primary" onClick={() => openModal('bus', { placeId: p.id })}>
                  ＋ Thêm xe
                </button>
              </div>
              <div className="bus-card-body">
                {p.buses.length ? (
                  p.buses.map((b, i) => (
                    <div className="bus-route" key={i}>
                      <div className="route-info">
                        <span className="route-no">{b.no}</span>
                        <div>
                          <b>Tuyến xe buýt số {b.no}</b>
                          <small>Trạm xuống: {b.stop}</small>
                        </div>
                      </div>
                      <button className="btn small danger" onClick={() => removeBus(p.id, i)}>
                        Xóa
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty">Chưa có tuyến xe buýt cho địa danh này.</div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty">Không tìm thấy dữ liệu tuyến xe.</div>
        )}
      </div>
      <p className="footer-note">
        Tên tuyến và trạm trong bản này là dữ liệu minh họa, chưa phải thông tin vận hành xe buýt được xác minh.
      </p>
    </section>
  );
}
