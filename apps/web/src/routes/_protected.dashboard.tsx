import { useAuth } from '../context/auth-context'
import { Button } from '../components/ui/button'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-4">
      <h1 className="text-2xl font-bold">Protected Dashboard</h1>
      <p>Welcome, {user?.firstName + ' ' + user?.lastName}</p>
      <div className="p-4 border rounded shadow">
        <p className="mb-2">
          This is a protected route. You can only see this if you are
          authenticated.
        </p>
        <p className="text-sm text-gray-500">User ID: {user?.id}</p>
      </div>
      <Button onClick={() => logout()}>Logout</Button>
    </div>
  )
}
