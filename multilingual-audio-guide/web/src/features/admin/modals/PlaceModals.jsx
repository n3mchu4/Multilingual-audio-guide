import { useState } from 'react';
import { useAdmin } from '../AdminContext';
import Modal from '../components/Modal';
import PlaceDetailPreview from '../components/PlaceDetailPreview';

export function PlaceDetailModal({ placeId }) {
  const { places, closeModal } = useAdmin();
  const p = places.find((x) => x.id === placeId);
  if (!p) return null;
  return (
    <Modal
      title="Chi tiết địa danh"
      subtitle={`${p.name} · Nội dung hiện đang hiển thị bên người dùng`}
      onClose={closeModal}
      footer={
        <button className="btn" onClick={closeModal}>
          Đóng
        </button>
      }
    >
      <PlaceDetailPreview place={p} version={p.current} />
    </Modal>
  );
}

export function RequestModal({ placeId }) {
  const { places, closeModal, acceptRequest, rejectRequest } = useAdmin();
  const p = places.find((x) => x.id === placeId);
  if (!p?.request) return null;
  return (
    <Modal
      title="So sánh yêu cầu cập nhật"
      subtitle={`${p.name} · Gửi bởi ${p.request.manager} · ${p.request.date}`}
      onClose={closeModal}
      footer={
        <>
          <button className="btn" onClick={closeModal}>
            Đóng
          </button>
          <button className="btn danger" onClick={() => rejectRequest(p.id)}>
            ✕ Từ chối yêu cầu
          </button>
          <button className="btn success" onClick={() => acceptRequest(p.id)}>
            ✓ Chấp nhận & cập nhật
          </button>
        </>
      }
    >
      <div className="notice request-notice" style={{ marginBottom: 18 }}>
        <span className="notice-icon">⇄</span>
        <div>
          <b>So sánh tổng quan bản cũ và bản mới</b>
          <p>
            Hai phiên bản được đặt cạnh nhau. Đối chiếu ảnh bìa, tên, phụ đề, tọa độ, địa chỉ, audio và nội dung tiếng
            Việt, audio và nội dung tiếng Anh, cùng bộ ảnh nổi bật trước khi quyết định.
          </p>
        </div>
      </div>
      <div className="request-compare">
        <section className="request-version old-version">
          <h3 className="request-version-heading">● BẢN CŨ · ĐANG HIỂN THỊ</h3>
          <PlaceDetailPreview place={p} version={p.current} />
        </section>
        <section className="request-version new-version">
          <h3 className="request-version-heading proposed">● BẢN MỚI · MANAGER ĐỀ XUẤT</h3>
          <PlaceDetailPreview place={p} version={p.request} />
        </section>
      </div>
    </Modal>
  );
}

/** Có sẵn trong bản HTML gốc nhưng chưa có nút nào gọi tới; mở bằng openModal('placeEditor', { placeId }). */
export function PlaceEditorModal({ placeId }) {
  const { places, closeModal, savePlace } = useAdmin();
  const p = places.find((x) => x.id === placeId);
  const [name, setName] = useState(p?.name ?? '');
  const [district, setDistrict] = useState(p?.district ?? '');
  const [content, setContent] = useState(p?.content ?? '');
  if (!p) return null;
  return (
    <Modal
      title="Chỉnh sửa địa danh"
      subtitle={`${p.name} · Chỉnh sửa bản nội dung đang hiển thị`}
      onClose={closeModal}
      footer={
        <>
          <button className="btn" onClick={closeModal}>
            Hủy
          </button>
          <button className="btn primary" onClick={() => savePlace(p.id, { name, district, content })}>
            Lưu nội dung
          </button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-field full">
          <label>Tên địa danh</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-field full">
          <label>Địa chỉ / khu vực</label>
          <input value={district} onChange={(e) => setDistrict(e.target.value)} />
        </div>
        <div className="form-field full">
          <label>Nội dung thuyết minh đang hiển thị</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
