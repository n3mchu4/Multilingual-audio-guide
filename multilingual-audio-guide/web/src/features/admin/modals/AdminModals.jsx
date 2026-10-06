import { useAdmin } from '../AdminContext';
import AccountModal from './AccountModal';
import BusModal from './BusModal';
import LogoutModal from './LogoutModal';
import { PlaceDetailModal, PlaceEditorModal, RequestModal } from './PlaceModals';

/** Hiển thị đúng một modal theo trạng thái `modal` trong AdminContext. */
export default function AdminModals() {
  const { modal } = useAdmin();
  if (!modal) return null;
  // key buộc form được khởi tạo lại mỗi lần mở
  const key = `${modal.kind}-${modal.placeId ?? modal.editId ?? ''}`;
  switch (modal.kind) {
    case 'detail':
      return <PlaceDetailModal key={key} placeId={modal.placeId} />;
    case 'request':
      return <RequestModal key={key} placeId={modal.placeId} />;
    case 'placeEditor':
      return <PlaceEditorModal key={key} placeId={modal.placeId} />;
    case 'account':
      return <AccountModal key={key} editId={modal.editId ?? null} />;
    case 'bus':
      return <BusModal key={key} placeId={modal.placeId ?? null} />;
    case 'logout':
      return <LogoutModal key={key} />;
    default:
      return null;
  }
}
