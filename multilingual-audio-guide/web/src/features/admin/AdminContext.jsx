import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { adminRequest } from '../../services/api';

const AdminContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin phải được dùng bên trong <AdminProvider>');
  return ctx;
}

export function AdminProvider({ children }) {
  const [places, setPlaces] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [modal, setModal] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const toastTimer = useRef();

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 3500);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const result = await adminRequest('/api/admin/bootstrap');
      setPlaces(result.data.places);
      setAccounts(result.data.accounts);
      setActivities(result.data.activities);
      setAnalytics(
        result.data.analytics
        && Number.isFinite(Number(result.data.analytics.visitors))
        && Number.isFinite(Number(result.data.analytics.listens))
          ? result.data.analytics
          : null,
      );
      setLoadError('');
      return true;
    } catch (error) {
      console.error('Admin data request failed:', error.code, error.status);
      setLoadError('Không tải được dữ liệu quản trị từ PostgreSQL. Hãy kiểm tra kết nối API và quyền tài khoản.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // The refresh applies the result of an asynchronous API request to state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const runMutation = useCallback(async (action, successMessage) => {
    try {
      await action();
      const refreshed = await refresh();
      if (!refreshed) return false;
      toast(successMessage);
      return true;
    } catch (error) {
      console.error('Admin database operation failed:', error.code, error.status);
      toast(error.message || 'Không thể lưu thay đổi vào PostgreSQL.');
      return false;
    }
  }, [refresh, toast]);

  const openModal = useCallback((kind, props = {}) => setModal({ kind, ...props }), []);
  const closeModal = useCallback(() => setModal(null), []);

  const acceptRequest = (landmarkId) => {
    const place = places.find((item) => item.id === landmarkId);
    if (!place?.request) return Promise.resolve(false);
    return runMutation(
      () => adminRequest(`/api/admin/landmarks/${encodeURIComponent(landmarkId)}/review`, {
        method: 'POST',
        body: JSON.stringify({ proposalId: place.request.proposalId, accepted: true }),
      }),
      'Đã duyệt và cập nhật nội dung địa danh.',
    ).then((saved) => {
      if (saved) closeModal();
      return saved;
    });
  };

  const rejectRequest = (landmarkId) => {
    const place = places.find((item) => item.id === landmarkId);
    if (!place?.request) return Promise.resolve(false);
    return runMutation(
      () => adminRequest(`/api/admin/landmarks/${encodeURIComponent(landmarkId)}/review`, {
        method: 'POST',
        body: JSON.stringify({ proposalId: place.request.proposalId, accepted: false }),
      }),
      'Đã từ chối yêu cầu cập nhật.',
    ).then((saved) => {
      if (saved) closeModal();
      return saved;
    });
  };

  const savePlace = async (id, values) => {
    const place = places.find((item) => item.id === id);
    if (!place) return false;
    const saved = await runMutation(
      () => adminRequest(`/api/admin/landmarks/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: values.name.trim() || place.name,
          district: values.district.trim() || place.district,
          content: values.content.trim() || place.content,
        }),
      }),
      'Đã lưu nội dung địa danh vào PostgreSQL.',
    );
    if (saved) closeModal();
    return saved;
  };

  const saveAccount = async ({ editId, username, landmarkId, password }) => {
    if (!username || !landmarkId || (!editId && !password)) {
      toast('Vui lòng nhập tên đăng nhập, địa danh phụ trách và mật khẩu.');
      return false;
    }
    const saved = await runMutation(
      () => adminRequest(
        editId
          ? `/api/admin/accounts/${encodeURIComponent(editId)}`
          : '/api/admin/accounts',
        {
          method: editId ? 'PATCH' : 'POST',
          body: JSON.stringify({ username, landmarkId, password }),
        },
      ),
      editId ? 'Đã cập nhật tài khoản Manager.' : 'Đã tạo tài khoản Manager.',
    );
    return saved;
  };

  const toggleAccount = async (id) => {
    const account = accounts.find((item) => item.id === id);
    if (!account || account.locked || account.role !== 'Manager') return false;
    return runMutation(
      () => adminRequest(`/api/admin/accounts/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !account.active }),
      }),
      account.active ? 'Đã khóa tài khoản Manager.' : 'Đã mở lại tài khoản Manager.',
    );
  };

  const addBus = async ({ placeId, no, stop }) => {
    if (!placeId || !no || !stop) {
      toast('Vui lòng nhập số tuyến và tên trạm xuống.');
      return false;
    }
    return runMutation(
      () => adminRequest(`/api/admin/landmarks/${encodeURIComponent(placeId)}/buses`, {
        method: 'POST',
        body: JSON.stringify({ no, stop }),
      }),
      'Đã thêm kết nối tuyến xe buýt.',
    );
  };

  const removeBus = async (connectionId) => runMutation(
    () => adminRequest(`/api/admin/bus-connections/${encodeURIComponent(connectionId)}`, {
      method: 'DELETE',
    }),
    'Đã xóa kết nối xe buýt.',
  );

  const stats = {
    places: places.length,
    activeAccounts: accounts.filter((account) => account.active).length,
    activeManagers: accounts.filter((account) => account.role === 'Manager' && account.active).length,
    visitors: analytics ? Number(analytics.visitors) : null,
    listens: analytics ? Number(analytics.listens) : null,
    pending: places.filter((place) => place.request).length,
    buses: places.reduce((sum, place) => sum + place.buses.length, 0),
  };

  const value = {
    places,
    accounts,
    activities,
    stats,
    modal,
    toastMsg,
    loading,
    loadError,
    toast,
    openModal,
    closeModal,
    refresh,
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
