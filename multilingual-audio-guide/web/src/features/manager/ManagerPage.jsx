import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerRequest } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import './styles/ManagerPortal.css';

const EMPTY_FORM = {
  titleVi: '',
  titleEn: '',
  subtitleVi: '',
  subtitleEn: '',
  latitude: '',
  longitude: '',
  backgroundImageUrl: '',
  descriptionVi: '',
  descriptionEn: '',
  transcriptVi: '',
  transcriptEn: '',
  audioViUrl: '',
  audioEnUrl: '',
  gallery: '',
};

function toForm(landmark) {
  return {
    ...landmark,
    gallery: landmark.gallery.join('\n'),
  };
}

function formatDate(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function ManagerPage() {
  const [workspace, setWorkspace] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const logout = useAppStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    managerRequest('/api/manager/workspace')
      .then(({ data }) => {
        if (cancelled) return;
        setWorkspace(data);
        setForm(toForm(data.current));
      })
      .catch((requestError) => {
        console.error('Manager workspace request failed:', requestError.code, requestError.status);
        if (!cancelled) setError(requestError.message || 'Không tải được dữ liệu địa danh.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        gallery: form.gallery.split(/\r?\n/).map((image) => image.trim()).filter(Boolean),
      };
      await managerRequest('/api/manager/proposals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setMessage('Đề xuất đã được lưu vào PostgreSQL và đang chờ Admin duyệt.');
      try {
        const { data } = await managerRequest('/api/manager/workspace');
        setWorkspace(data);
        setForm(toForm(data.current));
      } catch (refreshError) {
        console.error('Manager workspace refresh failed:', refreshError.code, refreshError.status);
        setError('Đề xuất đã được lưu, nhưng không thể tải lại lịch sử. Hãy tải lại trang để kiểm tra trạng thái.');
      }
    } catch (requestError) {
      console.error('Manager proposal submission failed:', requestError.code, requestError.status);
      setError(requestError.message || 'Không thể gửi đề xuất cập nhật.');
    } finally {
      setSaving(false);
    }
  };

  const endSession = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return <main className="manager-portal"><p role="status">Đang tải dữ liệu địa danh...</p></main>;
  }

  return (
    <main className="manager-portal">
      <header className="manager-header">
        <div>
          <p className="manager-eyebrow">CỔNG QUẢN LÝ ĐỊA DANH</p>
          <h1>{workspace?.landmarkName || 'Cập nhật địa danh'}</h1>
          <p>Đăng nhập: {workspace?.managerName}</p>
        </div>
        <button className="manager-button secondary" type="button" onClick={endSession}>Đăng xuất</button>
      </header>

      {error && <p className="manager-alert error" role="alert">{error}</p>}
      {message && <p className="manager-alert success" role="status">{message}</p>}
      {workspace?.pending && (
        <p className="manager-alert warning" role="status">
          Đề xuất cập nhật đang chờ Admin duyệt. Bạn có thể gửi đề xuất mới sau khi đề xuất này được xử lý.
        </p>
      )}

      {workspace && (
        <>
          <form className="manager-card manager-form" onSubmit={submit}>
            <div className="manager-section-heading">
              <div>
                <h2>Nội dung địa danh</h2>
                <p>Chỉnh sửa bản nháp rồi gửi Admin duyệt trước khi nội dung công khai được thay đổi.</p>
              </div>
              <button className="manager-button primary" type="submit" disabled={saving || workspace.pending}>
                {saving ? 'Đang gửi...' : 'Gửi đề xuất cập nhật'}
              </button>
            </div>

            <div className="manager-fields">
              <label>Tên tiếng Việt
                <input name="titleVi" value={form.titleVi} onChange={updateField} required maxLength={200} />
              </label>
              <label>Tên tiếng Anh
                <input name="titleEn" value={form.titleEn} onChange={updateField} required maxLength={200} />
              </label>
              <label>Mô tả ngắn tiếng Việt
                <textarea name="subtitleVi" value={form.subtitleVi} onChange={updateField} rows="2" />
              </label>
              <label>Mô tả ngắn tiếng Anh
                <textarea name="subtitleEn" value={form.subtitleEn} onChange={updateField} rows="2" />
              </label>
              <label>Vĩ độ
                <input name="latitude" type="number" min="-90" max="90" step="any" value={form.latitude} onChange={updateField} />
              </label>
              <label>Kinh độ
                <input name="longitude" type="number" min="-180" max="180" step="any" value={form.longitude} onChange={updateField} />
              </label>
              <label className="wide">Đường dẫn ảnh bìa
                <input name="backgroundImageUrl" value={form.backgroundImageUrl} onChange={updateField} />
              </label>
              <label>Mô tả chi tiết tiếng Việt
                <textarea name="descriptionVi" value={form.descriptionVi} onChange={updateField} rows="5" />
              </label>
              <label>Mô tả chi tiết tiếng Anh
                <textarea name="descriptionEn" value={form.descriptionEn} onChange={updateField} rows="5" />
              </label>
              <label>Lời thuyết minh tiếng Việt
                <textarea name="transcriptVi" value={form.transcriptVi} onChange={updateField} rows="6" />
              </label>
              <label>Lời thuyết minh tiếng Anh
                <textarea name="transcriptEn" value={form.transcriptEn} onChange={updateField} rows="6" />
              </label>
              <label>Đường dẫn âm thanh tiếng Việt
                <input name="audioViUrl" value={form.audioViUrl} onChange={updateField} />
              </label>
              <label>Đường dẫn âm thanh tiếng Anh
                <input name="audioEnUrl" value={form.audioEnUrl} onChange={updateField} />
              </label>
              <label className="wide">Ảnh thư viện (mỗi đường dẫn trên một dòng)
                <textarea name="gallery" value={form.gallery} onChange={updateField} rows="4" />
              </label>
            </div>
            <p className="manager-help">
              Nếu thay đổi lời thuyết minh, cần điền đường dẫn cho cả hai bản âm thanh. Tối đa 20 ảnh thư viện.
            </p>
          </form>

          <section className="manager-card manager-history">
            <h2>Lịch sử đề xuất</h2>
            {workspace.history.length === 0
              ? <p>Chưa có đề xuất cập nhật nào.</p>
              : (
                <ul>
                  {workspace.history.map((proposal) => (
                    <li key={proposal.id}>
                      <div>
                        <strong>{proposal.status === 'PENDING' ? 'Đang chờ duyệt' : proposal.status === 'ACCEPTED' ? 'Đã duyệt' : 'Đã từ chối'}</strong>
                        <time dateTime={proposal.submittedAt}>{formatDate(proposal.submittedAt)}</time>
                        {proposal.reviewNote && <p>{proposal.reviewNote}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
          </section>
        </>
      )}
    </main>
  );
}
