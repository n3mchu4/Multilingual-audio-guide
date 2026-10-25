import { useCallback } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { USER_TYPES } from '@shared/constants/roles.js'
import AdminRoutes from '../features/admin/AdminRoutes'
import ManagerRoutes from '../features/manager/ManagerRoutes'
import LoginPage from '../features/auth/LoginPage'
import RequireAuth from '../features/auth/RequireAuth'
import Home from '../pages/Home'
import useIdleLogout from '../hooks/useIdleLogout'
import {
  selectIsAuthenticated,
  useAppStore,
} from '../store/useAppStore'
import UserWebPage from "../features/user/UserWebPage";
function ProtectedHome() {
  const navigate = useNavigate()
  const logout = useAppStore((s) => s.logout)

  const logOff = useCallback(() => {
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  const onTimeout = useCallback(() => {
    logout()
    navigate('/login', {
      replace: true,
      state: { timedOut: true },
    })
  }, [logout, navigate])

  useIdleLogout(onTimeout)

  return <Home onLogOff={logOff} />
}

// W01: các link cũ /places/:id (đã in QR / đã chia sẻ) chuyển sang giao diện chính /user/:id.
function PlaceRedirect() {
  const { id } = useParams()
  return <Navigate to={id ? `/user/${encodeURIComponent(id)}` : '/user'} replace />
}

export default function AppRouter() {
  const isAuthenticated = useAppStore(selectIsAuthenticated)

  return (
    <BrowserRouter>
      <Routes>
        {/* Giao diện khách chính: không yêu cầu đăng nhập. /user/:placeId mở thẳng một địa danh. */}
        {/* Một Route duy nhất (placeId tùy chọn) để đổi địa danh không làm tải lại cả trang khách. */}
        <Route path="/user/:placeId?" element={<UserWebPage />} />
        <Route path="/places" element={<Navigate to="/user" replace />} />
        <Route path="/places/:id" element={<PlaceRedirect />} />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin/*"
          element={
            <RequireAuth userType={USER_TYPES.ADMIN}>
              <AdminRoutes />
            </RequireAuth>
          }
        />

        <Route
          path="/manager/*"
          element={
            <RequireAuth userType={USER_TYPES.MANAGER}>
              <ManagerRoutes />
            </RequireAuth>
          }
        />

        {/* Khách vào gốc site thì thấy giao diện khách; người đã đăng nhập thấy Home theo vai trò. */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <RequireAuth>
                <ProtectedHome />
              </RequireAuth>
            ) : (
              <Navigate to="/user" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/user" replace />} />
      </Routes>
    </BrowserRouter>
  )
}