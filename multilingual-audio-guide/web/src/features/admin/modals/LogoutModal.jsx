import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../AdminContext';
import Modal from '../components/Modal';

export default function LogoutModal() {
  const { closeModal } = useAdmin();
  const navigate = useNavigate();

  const confirm = () => {
    // TODO: xóa phiên đăng nhập (token/session) ở đây khi đã có xác thực thật
    closeModal();
    navigate('/login');
  };

  return (
    <Modal
      narrow
      title="Đăng xuất khỏi hệ thống?"
      subtitle="Bạn có thể quay lại trang đăng nhập sau khi xác nhận."
      onClose={closeModal}
      footer={
        <>
          <button className="btn" onClick={closeModal}>
            Ở lại
          </button>
          <button className="btn primary" onClick={confirm}>
            Xác nhận đăng xuất
          </button>
        </>
      }
    >
      <p style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--muted)' }}>
        Hệ thống hiện chưa có xác thực thật; xác nhận sẽ đưa bạn về trang đăng nhập.
      </p>
    </Modal>
  );
}
