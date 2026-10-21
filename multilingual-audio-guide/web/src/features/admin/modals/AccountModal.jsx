import { useState } from 'react';
import { useAdmin } from '../AdminContext';
import Modal from '../components/Modal';

/** editId = null → tạo mới; có id → chỉnh sửa. */
export default function AccountModal({ editId = null }) {
  const { places, accounts, saveAccount, closeModal } = useAdmin();
  const editing = editId != null ? accounts.find((a) => a.id === editId) : null;
  const [username, setUsername] = useState(editing?.username ?? '');
  const [landmarkId, setLandmarkId] = useState(editing?.landmarkId ?? '');
  const [password, setPassword] = useState('');

  const submit = async () => {
    if (await saveAccount({ editId, username: username.trim(), landmarkId, password })) closeModal();
  };

  return (
    <Modal
      narrow
      title={editing ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản Manager'}
      subtitle={editing ? 'Cập nhật địa danh, tên đăng nhập hoặc đặt mật khẩu mới' : 'Admin cấp thông tin đăng nhập cho tài khoản mới'}
      onClose={closeModal}
      footer={
        <>
          <button className="btn" onClick={closeModal}>
            Hủy
          </button>
          <button className="btn primary" onClick={submit}>
            {editing ? 'Lưu thay đổi' : 'Tạo tài khoản'}
          </button>
        </>
      }
    >
      {editing ? (
        <>
          <div className="form-grid">
            <div className="form-field full">
              <label>Địa danh phụ trách</label>
              <select value={landmarkId} onChange={(e) => setLandmarkId(e.target.value)}>
                {places.map((place) => <option key={place.id} value={place.id}>{place.name}</option>)}
              </select>
            </div>
            <div className="form-field full">
              <label>Tên đăng nhập</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="form-field full">
              <label>Mật khẩu mới (để trống nếu không đổi)</label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Nhập mật khẩu mới, tối thiểu 10 ký tự"
                minLength={10}
                maxLength={72}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <p className="footer-note">
            Để trống mật khẩu nếu không muốn thay đổi. Mật khẩu mới cần ít nhất 10 ký tự.
          </p>
        </>
      ) : (
        <>
          <div className="form-grid">
            <div className="form-field">
              <label>Địa danh phụ trách</label>
              <select value={landmarkId} onChange={(e) => setLandmarkId(e.target.value)} required>
                <option value="" disabled>Chọn địa danh</option>
                {places.map((place) => <option key={place.id} value={place.id}>{place.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Tên đăng nhập</label>
              <input
                placeholder="Ví dụ: manager.chobenthanh"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Mật khẩu khởi tạo</label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Tạo mật khẩu"
                required
                minLength={10}
                maxLength={72}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Vai trò</label>
              <input value="Manager" disabled readOnly />
            </div>
          </div>
          <p className="footer-note">
            Tài khoản Manager chỉ được gắn với một địa danh đã có trong cơ sở dữ liệu.
          </p>
        </>
      )}
    </Modal>
  );
}
