import { useState } from 'react';
import { Link } from 'react-router-dom';
import './login.css';

const STORAGE_KEY = 'saigonGuideUsername';

function readSavedUsername() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return ''; // localStorage có thể không dùng được ở một số chế độ trình duyệt
  }
}

function writeSavedUsername(username, remember) {
  try {
    if (remember) localStorage.setItem(STORAGE_KEY, username);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* bỏ qua */
  }
}

const FEATURES = [
  { icon: '⌖', label: 'Quản lý địa danh' },
  { icon: '♫', label: 'Nội dung thuyết minh' },
  { icon: '▤', label: 'Theo dõi hệ thống' },
];

export default function LoginPage() {
  const saved = readSavedUsername();
  const [username, setUsername] = useState(saved);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(Boolean(saved));
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    writeSavedUsername(username.trim(), remember);

    // TODO: gọi API xác thực (web/src/services) rồi điều hướng theo vai trò:
    //   admin -> /admin, manager -> /manager
    setMessage(
      'Giao diện đăng nhập đã sẵn sàng. Chức năng xác thực và điều hướng đến trang Admin/Manager sẽ được kết nối khi các trang quản trị hoàn thành.',
    );
  };

  return (
    <div className="login-root">
      <main className="shell">
        <section className="brand-panel">
          <div className="brand-top">
            <div className="logo">
              <div className="logo-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 10.5 12 4l9 6.5" />
                  <path d="M5.5 9.5V20h13V9.5M9 20v-6h6v6" />
                  <circle cx="18.5" cy="5.5" r="2" />
                </svg>
              </div>
              <span>SAIGON AUDIO GUIDE</span>
            </div>
          </div>
          <div className="brand-content">
            <p className="eyebrow">ADMINISTRATION PORTAL</p>
            <h1>
              Quản lý hành trình
              <br />
              khám phá Sài Gòn.
            </h1>
            <p>
              Cổng quản trị dành cho đội ngũ vận hành hệ thống thuyết minh đa ngôn ngữ, quản lý nội dung địa danh và
              trải nghiệm tham quan.
            </p>
            <div className="feature-list">
              {FEATURES.map((f) => (
                <div className="feature" key={f.label}>
                  <span className="feature-icon">{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="brand-footer">© 2026 Saigon Audio Guide · Quận 1, TP. Hồ Chí Minh</div>
        </section>

        <section className="form-panel">
          <div className="form-heading">
            <p className="small-label">WELCOME BACK</p>
            <h2>Đăng nhập hệ thống</h2>
            <p>Nhập tên tài khoản và mật khẩu được cấp để tiếp tục.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="username">Tên tài khoản</label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                placeholder="Nhập tên tài khoản"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-wrap">
                <input
                  className="password-input"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button className="toggle" type="button" onClick={() => setShowPassword((s) => !s)}>
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>
            <div className="options">
              <label className="remember">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Ghi nhớ tên
                tài khoản
              </label>
            </div>
            <button className="submit" type="submit">
              Đăng nhập <span aria-hidden="true">→</span>
            </button>
            <div className={'message' + (message ? ' success' : '')} role="status" aria-live="polite">
              {message}
            </div>
          </form>
          <div className="demo">
            <div className="demo-title">LƯU Ý</div>
            <p>
              Giao diện đăng nhập hiện là bản thiết kế UI. Trang quản trị Admin/Manager và xác thực tài khoản sẽ được
              tích hợp sau.
            </p>
          </div>
          <Link to="/" className="back-link">
            ← Quay lại giao diện tham quan
          </Link>
        </section>
      </main>
    </div>
  );
}
