import { useAdmin } from '../AdminContext';

const WORKFLOW_SETTINGS = [
  { title: 'Yêu cầu Manager phải được duyệt', desc: 'Nội dung mới chưa hiển thị khi chưa được Admin chấp nhận.' },
  { title: 'Ghi nhật ký thao tác', desc: 'Lưu lịch sử chấp nhận, từ chối và chỉnh sửa.' },
  { title: 'Thông báo yêu cầu mới', desc: 'Hiển thị số lượng yêu cầu đang chờ xử lý.' },
];

export default function Settings() {
  const { toast } = useAdmin();
  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">CẤU HÌNH CHUNG</p>
          <h1>Cài đặt hệ thống</h1>
          <p>Quản lý các tùy chọn hiển thị và quy trình vận hành trong giao diện quản trị.</p>
        </div>
      </div>
      <div className="settings-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Quy trình nội dung</h3>
              <p>Thiết lập cách xử lý yêu cầu cập nhật</p>
            </div>
          </div>
          <div className="panel-body">
            {WORKFLOW_SETTINGS.map((s) => (
              <div className="setting-row" key={s.title}>
                <div>
                  <b>{s.title}</b>
                  <small>{s.desc}</small>
                </div>
                <input className="switch" type="checkbox" defaultChecked />
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Thông tin dự án</h3>
              <p>Thông tin nhận diện hệ thống</p>
            </div>
          </div>
          <div className="panel-body">
            <div className="form-field">
              <label>Tên hệ thống</label>
              <input defaultValue="Saigon Audio Guide" />
            </div>
            <div className="form-field" style={{ marginTop: 13 }}>
              <label>Khu vực nội dung</label>
              <input defaultValue="Quận 1, TP. Hồ Chí Minh" />
            </div>
            <div className="form-field" style={{ marginTop: 13 }}>
              <label>Ngôn ngữ nội dung</label>
              <input defaultValue="Tiếng Việt / English" />
            </div>
            <button className="btn primary" style={{ marginTop: 16 }} onClick={() => toast('Đã lưu cài đặt minh họa.')}>
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
