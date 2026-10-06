import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AUTH_ERROR_CODES } from '@shared/constants/auth.js';
import { USER_TYPES } from '@shared/constants/roles.js';
import { ApiError, login } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const startSession = useAppStore((state) => state.startSession);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      const session = await login({
        unfid: username.trim(),
        password,
      });

      writeSavedUsername(username.trim(), remember);

      const userType = session?.user?.userType;
      if (!session?.token || !session?.expiresAt || !Object.values(USER_TYPES).includes(userType)) {
        setMessage('Máy chủ trả về thông tin phiên không hợp lệ. Vui lòng thử lại sau.');
        return;
      }

      startSession(session);
      navigate(userType === USER_TYPES.ADMIN ? '/admin' : '/', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        if (
          [AUTH_ERROR_CODES.UNFID_NOT_FOUND, AUTH_ERROR_CODES.WRONG_PASSWORD].includes(error.code)
        ) {
          setMessage('Mã tài khoản hoặc mật khẩu không đúng.');
        } else if (error.status === 0) {
          setMessage('Không kết nối được máy chủ đăng nhập. Hãy chạy npm run dev:api rồi thử lại.');
        } else if (error.status >= 500) {
          console.error('Login API returned an error:', error.code, error.status);
          setMessage(`Máy chủ đăng nhập gặp lỗi (HTTP ${error.status}, ${error.code}). Hãy kiểm tra terminal chạy API.`);
        } else {
          console.error('Login API rejected the request:', error.code, error.status);
          setMessage(`Đăng nhập thất bại (HTTP ${error.status}, ${error.code}).`);
        }
      } else {
        console.error('Unexpected login error:', error);
        const details = error instanceof Error ? error.message : String(error);
        setMessage(`Lỗi ứng dụng khi đăng nhập: ${details}. Hãy kiểm tra Console của trình duyệt.`);
      }
    } finally {
      setIsSubmitting(false);
    }
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
              <label htmlFor="username">Mã tài khoản (UNFID)</label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                placeholder="Nhập mã tài khoản"
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
            <button className="submit" type="submit" disabled={isSubmitting}>
              Đăng nhập <span aria-hidden="true">→</span>
            </button>
            <div className={'message' + (message ? ' error' : '')} role="status" aria-live="polite">
              {message}
            </div>
          </form>
          <div className="demo">
            <div className="demo-title">LƯU Ý</div>
            <p>
              Tài khoản thử nghiệm khi chạy máy chủ phát triển: <code>ADMIN001</code> / <code>Admin@123</code>.
              Đây là tài khoản dev, không dùng trên môi trường thật.
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
