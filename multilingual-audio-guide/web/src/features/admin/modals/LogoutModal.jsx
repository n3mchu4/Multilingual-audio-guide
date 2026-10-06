import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../AdminContext';
import Modal from '../components/Modal';
import { useAppStore } from '../../../store/useAppStore';

export default function LogoutModal() {
  const { closeModal } = useAdmin();
  const navigate = useNavigate();
  const logout = useAppStore((state) => state.logout);

  const confirm = () => {
    logout();
    closeModal();
    navigate('/login', { replace: true });
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
        Phiên đăng nhập hiện tại sẽ kết thúc và bạn sẽ được đưa về trang đăng nhập.
      </p>
    </Modal>
  );
}
