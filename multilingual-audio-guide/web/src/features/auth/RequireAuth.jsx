import { Navigate, useLocation } from 'react-router-dom'
import { selectIsAuthenticated, useAppStore } from '../../store/useAppStore'

// Precondition của UC8: chưa có Session thì bị chuyển về trang Login.
export default function RequireAuth({ children }) {
  const isAuthenticated = useAppStore(selectIsAuthenticated)
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}
