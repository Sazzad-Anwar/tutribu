import { Outlet } from 'react-router'
import ProtectedRoute from '../components/protected-route'

export default function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  )
}
