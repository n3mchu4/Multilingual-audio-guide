import { useCallback } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { USER_TYPES } from '@shared/constants/roles.js'
import AdminRoutes from '../features/admin/AdminRoutes'
import LoginPage from '../features/auth/LoginPage'
import RequireAuth from '../features/auth/RequireAuth'
import Home from '../pages/Home'
import useIdleLogout from '../hooks/useIdleLogout'
import { selectIsAuthenticated, useAppStore } from '../store/useAppStore'

function ProtectedHome() {
  const navigate = useNavigate()
  const logout = useAppStore((s) => s.logout)

  const logOff = useCallback(() => {
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  const onTimeout = useCallback(() => {
    logout()
    navigate('/login', { replace: true, state: { timedOut: true } })
  }, [logout, navigate])

  useIdleLogout(onTimeout)
  return <Home onLogOff={logOff} />
}

export default function AppRouter() {
  const isAuthenticated = useAppStore(selectIsAuthenticated)
  return (
    <BrowserRouter>
      <Routes>
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
          path="/"
          element={
            <RequireAuth>
              <ProtectedHome />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
