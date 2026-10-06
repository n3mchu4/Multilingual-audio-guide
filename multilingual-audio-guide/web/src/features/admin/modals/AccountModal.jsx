import { useState } from 'react';
import { useAdmin } from '../AdminContext';
import Modal from '../components/Modal';

/** editId = null → tạo mới; có id → chỉnh sửa. */
export default function AccountModal({ editId = null }) {
  const { accounts, saveAccount, closeModal } = useAdmin();
  const editing = editId != null ? accounts.find((a) => a.id === editId) : null;
  const [name, setName] = useState(editing?.name ?? '');
  const [username, setUsername] = useState(editing?.username ?? '');
  const [password, setPassword] = useState('');

  const submit = () => {
    if (saveAccount({ editId, name: name.trim(), username: username.trim(), password })) closeModal();
  };

  return (
    <Modal
      narrow
      title={editing ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản Manager'}
      subtitle={editing ? 'Cập nhật tên hiển thị và tên đăng nhập' : 'Admin cấp thông tin đăng nhập cho tài khoản mới'}
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
        <div className="form-grid">
          <div className="form-field full">
            <label>Ban quản lý / địa danh phụ trách</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-field full">
            <label>Tên đăng nhập</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
        </div>
      ) : (
        <>
          <div className="form-grid">
            <div className="form-field">
              <label>Địa danh phụ trách</label>
              <input placeholder="Ví dụ: Chợ Bến Thành" value={name} onChange={(e) => setName(e.target.value)} />
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
                placeholder="Tạo mật khẩu"
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
            Nên đặt tên tài khoản theo địa danh phụ trách, ví dụ manager.chobenthanh. Nếu tạo tài khoản cho địa danh
            mới, Manager gửi yêu cầu tạo địa danh; khi Admin chấp nhận, địa danh sẽ xuất hiện ở danh sách và tab kết nối
            xe buýt.
          </p>
        </>
      )}
    </Modal>
  );
}
