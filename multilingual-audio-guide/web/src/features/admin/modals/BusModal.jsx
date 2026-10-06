import { useState } from 'react';
import { useAdmin } from '../AdminContext';
import Modal from '../components/Modal';

export default function BusModal({ placeId = null }) {
  const { places, addBus, closeModal } = useAdmin();
  const [selected, setSelected] = useState(placeId ?? places[0]?.id);
  const [no, setNo] = useState('');
  const [stop, setStop] = useState('');

  const submit = () => {
    if (addBus({ placeId: Number(selected), no: no.trim(), stop: stop.trim() })) closeModal();
  };

  return (
    <Modal
      narrow
      title="Thêm kết nối xe buýt"
      subtitle="Khai báo số tuyến và trạm xuống gần địa danh"
      onClose={closeModal}
      footer={
        <>
          <button className="btn" onClick={closeModal}>
            Hủy
          </button>
          <button className="btn primary" onClick={submit}>
            Lưu kết nối
          </button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-field full">
          <label>Địa danh</label>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Số tuyến xe buýt</label>
          <input placeholder="Ví dụ: 52" value={no} onChange={(e) => setNo(e.target.value)} />
        </div>
        <div className="form-field">
          <label>Trạm xuống gần địa danh</label>
          <input placeholder="Tên trạm xuống" value={stop} onChange={(e) => setStop(e.target.value)} />
        </div>
      </div>
      <p className="footer-note">
        Dữ liệu tuyến/trạm chỉ dùng minh họa. Hãy xác minh tuyến xe buýt thực tế trước khi đưa vào ứng dụng người dùng.
      </p>
    </Modal>
  );
}
