import { useAdmin } from '../AdminContext';

export default function Activity() {
  const { activities, toast } = useAdmin();
  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">THEO DÕI THAO TÁC</p>
          <h1>Nhật ký hoạt động</h1>
          <p>Lịch sử duyệt nội dung, quản lý tài khoản và thay đổi kết nối tuyến xe.</p>
        </div>
        <button className="btn" onClick={() => toast('Bản minh họa: nhật ký được lưu trong phiên trình duyệt.')}>
          ⇩ Xuất nhật ký
        </button>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Lịch sử gần đây</h3>
            <p>Các thao tác mẫu để minh họa cách theo dõi hoạt động</p>
          </div>
        </div>
        <div className="panel-body activity">
          {activities.map((a, i) => (
            <div className="activity-item" key={i}>
              <div className="activity-dot">{a.icon}</div>
              <div>
                <p>{a.text}</p>
                <small>{a.time}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
