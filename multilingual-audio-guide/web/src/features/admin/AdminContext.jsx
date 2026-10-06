import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { initialAccounts, initialActivities, initialPlaces } from './data/mockData';

const AdminContext = createContext(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin phải được dùng bên trong <AdminProvider>');
  return ctx;
}

const today = () => new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function AdminProvider({ children }) {
  const [places, setPlaces] = useState(() => structuredClone(initialPlaces));
  const [accounts, setAccounts] = useState(() => structuredClone(initialAccounts));
  const [activities, setActivities] = useState(() => structuredClone(initialActivities));
  const [modal, setModal] = useState(null); // { kind, ...props } hoặc null
  const [toastMsg, setToastMsg] = useState('');
  const nextAccountId = useRef(Math.max(...initialAccounts.map((a) => a.id)) + 1);
  const toastTimer = useRef();

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 3500);
  }, []);
  const log = useCallback((icon, text) => setActivities((list) => [{ icon, text, time: 'Vừa xong' }, ...list]), []);
  const openModal = useCallback((kind, props = {}) => setModal({ kind, ...props }), []);
  const closeModal = useCallback(() => setModal(null), []);

  const patchPlace = (id, fn) => setPlaces((list) => list.map((p) => (p.id === id ? fn(p) : p)));

  // ---- Địa danh ----
  const acceptRequest = (id) => {
    const p = places.find((x) => x.id === id);
    if (!p?.request) return;
    patchPlace(id, (x) => ({
      ...x,
      current: { ...x.request, gallery: [...(x.request.gallery || [])] },
      content: x.request.descVi,
      request: null,
    }));
    log(
      '✓',
      `Admin chấp nhận yêu cầu cập nhật địa danh “${p.name}” từ ${p.request.manager}: đã cập nhật riêng audio/văn bản Việt, audio/văn bản Anh, ảnh bìa và ảnh nổi bật theo đề xuất.`,
    );
    closeModal();
    toast('Đã chấp nhận: bản Việt cập nhật bản Việt, bản Anh cập nhật bản Anh trong dữ liệu minh họa.');
  };

  const rejectRequest = (id) => {
    const p = places.find((x) => x.id === id);
    if (!p?.request) return;
    log(
      '×',
      `Admin từ chối yêu cầu cập nhật “${p.name}” của ${p.request.manager}; giữ nguyên toàn bộ bản Việt, bản Anh, hai tệp audio và hình ảnh hiện tại. Thông báo từ chối đang được mô phỏng.`,
    );
    patchPlace(id, (x) => ({ ...x, request: null }));
    closeModal();
    toast('Đã từ chối yêu cầu. Toàn bộ nội dung Việt/Anh hiện tại được giữ nguyên.');
  };

  const savePlace = (id, { name, district, content }) => {
    const p = places.find((x) => x.id === id);
    if (!p) return;
    const next = {
      name: name.trim() || p.name,
      district: district.trim() || p.district,
      content: content.trim() || p.content,
    };
    patchPlace(id, (x) => ({ ...x, ...next }));
    log('✎', `Admin chỉnh sửa nội dung địa danh “${next.name}”.`);
    closeModal();
    toast('Đã lưu nội dung trong dữ liệu mẫu.');
  };

  // ---- Tài khoản (trả về true nếu lưu thành công) ----
  const saveAccount = ({ editId, name, username, password }) => {
    if (!name || !username) {
      toast('Vui lòng nhập địa danh phụ trách và tên đăng nhập.');
      return false;
    }
    if (accounts.some((a) => a.username.toLowerCase() === username.toLowerCase() && a.id !== editId)) {
      toast('Tên tài khoản đã tồn tại. Vui lòng chọn tên khác.');
      return false;
    }
    if (editId != null) {
      setAccounts((list) => list.map((a) => (a.id === editId ? { ...a, name, username } : a)));
      log('♙', `Admin chỉnh sửa tài khoản “${username}”.`);
      toast('Đã cập nhật thông tin tài khoản.');
    } else {
      if (!password) {
        toast('Vui lòng nhập mật khẩu khởi tạo.');
        return false;
      }
      const id = nextAccountId.current++;
      setAccounts((list) => [
        ...list,
        {
          id,
          name: 'Ban quản lý ' + name.replace(/^Ban quản lý\s*/i, ''),
          username,
          role: 'Manager',
          date: today(),
          active: true,
          placeName: name,
        },
      ]);
      log('♙', `Admin tạo tài khoản Manager “${username}”.`);
      toast('Đã tạo tài khoản Manager mẫu. Mật khẩu chưa được lưu trong giao diện.');
    }
    return true;
  };

  const toggleAccount = (id) => {
    const a = accounts.find((x) => x.id === id);
    if (!a || a.locked) return;
    setAccounts((list) => list.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
    log('♙', `Admin ${!a.active ? 'mở lại' : 'đóng'} tài khoản “${a.username}”.`);
    toast(!a.active ? 'Đã mở lại tài khoản mẫu.' : 'Đã đóng tài khoản mẫu.');
  };

  // ---- Xe buýt (addBus trả về true nếu thành công) ----
  const addBus = ({ placeId, no, stop }) => {
    const p = places.find((x) => x.id === placeId);
    if (!p || !no || !stop) {
      toast('Vui lòng nhập số tuyến và tên trạm xuống.');
      return false;
    }
    if (p.buses.some((b) => b.no.toLowerCase() === no.toLowerCase() && b.stop.toLowerCase() === stop.toLowerCase())) {
      toast('Kết nối tuyến và trạm này đã tồn tại.');
      return false;
    }
    patchPlace(placeId, (x) => ({ ...x, buses: [...x.buses, { no, stop }] }));
    log('▤', `Admin thêm tuyến xe buýt ${no} tại địa danh “${p.name}”, trạm ${stop}.`);
    toast('Đã thêm kết nối tuyến xe buýt mẫu.');
    return true;
  };

  const removeBus = (placeId, index) => {
    const p = places.find((x) => x.id === placeId);
    const b = p?.buses[index];
    if (!b) return;
    patchPlace(placeId, (x) => ({ ...x, buses: x.buses.filter((_, i) => i !== index) }));
    log('▤', `Admin xóa kết nối tuyến ${b.no} tại “${p.name}”.`);
    toast('Đã xóa kết nối trong dữ liệu mẫu.');
  };

  const stats = {
    places: places.length,
    activeAccounts: accounts.filter((a) => a.active).length,
    activeManagers: accounts.filter((a) => a.role === 'Manager' && a.active).length,
    pending: places.filter((p) => p.request).length,
    buses: places.reduce((sum, p) => sum + p.buses.length, 0),
  };

  const value = {
    places,
    accounts,
    activities,
    stats,
    modal,
    toastMsg,
    toast,
    openModal,
    closeModal,
    acceptRequest,
    rejectRequest,
    savePlace,
    saveAccount,
    toggleAccount,
    addBus,
    removeBus,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
