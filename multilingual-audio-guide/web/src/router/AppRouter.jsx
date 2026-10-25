import { useCallback } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import { USER_TYPES } from '@shared/constants/roles.js'
import AdminRoutes from '../features/admin/AdminRoutes'
import ManagerRoutes from '../features/manager/ManagerRoutes'
import LoginPage from '../features/auth/LoginPage'
import RequireAuth from '../features/auth/RequireAuth'
import Home from '../pages/Home'
import PlaceList from '../pages/PlaceList'
import PlaceDetail from '../pages/PlaceDetail'
import useIdleLogout from '../hooks/useIdleLogout'
import {
  useAppStore,
} from '../store/useAppStore'
import usePresence from '../hooks/usePresence';
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

function Presence() {
  usePresence();
  return null;
}

export default function AppRouter() {

  return (
    <BrowserRouter>
      <Presence />
      <Routes>
        {/* Trang dành cho khách tham quan: không yêu cầu đăng nhập */}
        <Route path="/" element={<UserWebPage />} />
        <Route path="/user" element={<UserWebPage />} />
        <Route path="/places" element={<PlaceList />} />
        <Route path="/places/:id" element={<PlaceDetail />} />

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

        <Route
          path="/home"
          element={
            <RequireAuth>
              <ProtectedHome />
            </RequireAuth>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}