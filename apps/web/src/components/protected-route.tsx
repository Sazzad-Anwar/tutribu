import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../context/auth-context'

interface ProtectedRouteProps {
  children?: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/signin"
        state={{ from: location }}
        replace
      />
    )
  }

  return children ? <>{children}</> : <Outlet />
}
