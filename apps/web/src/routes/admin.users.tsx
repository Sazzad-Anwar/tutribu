import { useState, useEffect } from 'react'
import { useAuth } from '../context/auth-context'
import { axios, cn } from '../lib/utils'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import {
  Loader2,
  User,
  Mail,
  Shield,
  Calendar,
  UserMinus,
  UserCheck,
} from 'lucide-react'
import dayjs from 'dayjs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog'
import Header from '../components/header'
import Footer from '../components/footer'

export default function AdminUsers() {
  const { isAdmin, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/')
    }
  }, [isAdmin, authLoading, navigate])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  const handleToggleSuspension = async (userId: string) => {
    try {
      setIsUpdating(userId)
      await axios.post(`/api/admin/users/${userId}/toggle-suspension`, {})
      toast.success('User status updated successfully.')
      fetchUsers()
    } catch (error) {
      console.error('Failed to toggle suspension:', error)
      toast.error('Failed to update user status')
    } finally {
      setIsUpdating(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <main>
      <Header />
      <section className="pt-8 pb-12 xl:pt-12.5 xl:pb-17.5 px-4 xl:px-0 bg-gray-50/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <h1 className="text-4xl xl:text-[54px] font-tinos font-bold text-center md:text-left">
              User Management
            </h1>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/bookings')}
              className="bg-white border-[#00AEEF] text-[#00AEEF] hover:bg-[#00AEEF] hover:text-white transition-all px-8"
            >
              Manage Bookings
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-gray-100 rounded-full p-6 mb-4">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">There are no users registered in the system yet.</p>
              </div>
            ) : (
              users.map((user) => {
                const info = user.userInfos?.[0]
                const fullName = info ? `${info.firstName} ${info.lastName}` : 'Anonymous User'

                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-2xl border border-[#0000001A] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col"
                  >
                    {/* Role Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-[#00AEEF]/10 transition-colors">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                      <div
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                          user.role === 'ADMIN' ? 'bg-[#00AEEF] text-white' : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        {user.role}
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="space-y-4 flex-1">
                      <div>
                        <h2 className="text-2xl font-tinos font-bold text-gray-900 line-clamp-1">
                          {fullName}
                        </h2>
                        <p className="text-xs font-mono text-gray-400 mt-1">ID: {user.id}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-600">
                          <Mail className="w-4 h-4 shrink-0" />
                          <span className="text-sm truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span className="text-sm">Joined {dayjs(user.createdAt).format('MMM D, YYYY')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4 shrink-0 text-[#00AEEF]" />
                          <span
                            className={cn(
                              'text-sm font-medium',
                              user.isSuspended ? 'text-red-500' : 'text-green-500'
                            )}
                          >
                            {user.isSuspended ? 'Suspended' : 'Account Active'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-50">
                      {user.role === 'ADMIN' ? (
                        <p className="text-center text-xs text-gray-400 font-medium bg-gray-50 py-2 rounded-lg">
                          Admin roles cannot be suspended
                        </p>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger
                            disabled={isUpdating === user.id}
                            className={cn(
                              'w-full h-12 rounded-xl text-base font-medium transition-all gap-2 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed',
                              user.isSuspended
                                ? 'bg-[#00AEEF]/5 text-[#00AEEF] hover:bg-[#00AEEF] hover:text-white'
                                : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                            )}
                          >
                            {isUpdating === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : user.isSuspended ? (
                              <>
                                <UserCheck className="w-4 h-4" />
                                Unsuspend User
                              </>
                            ) : (
                              <>
                                <UserMinus className="w-4 h-4" />
                                Suspend User
                              </>
                            )}
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl p-8">
                            <AlertDialogHeader className="space-y-4">
                              <AlertDialogTitle className="flex flex-col gap-4 text-2xl font-tinos">
                                <img src="/images/logo.svg" alt="Logo" className="h-10 w-auto self-start" />
                                {user.isSuspended ? 'Confirm Account Activation' : 'Confirm Account Suspension'}
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-lg text-gray-600">
                                {user.isSuspended ? (
                                  <>
                                    You are about to restore access for <strong>{fullName}</strong>.
                                    The user will be able to log in and manage their bookings immediately.
                                  </>
                                ) : (
                                  <>
                                    You are about to suspend <strong>{fullName}</strong>.
                                    The user will be immediately blocked from logging into their account.
                                    <br /><br />
                                    This does not cancel their existing bookings.
                                  </>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-8 gap-4">
                              <AlertDialogCancel className="h-14 rounded-xl text-lg flex-1 border-gray-200">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleToggleSuspension(user.id)}
                                className={cn(
                                  'h-14 rounded-xl text-lg flex-1 text-white',
                                  user.isSuspended ? 'bg-[#00AEEF] hover:bg-[#009EDF]' : 'bg-red-500 hover:bg-red-600'
                                )}
                              >
                                {user.isSuspended ? 'Unsuspend' : 'Confirm Suspension'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
