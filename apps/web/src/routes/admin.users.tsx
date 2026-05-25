import { useState, useEffect } from 'react'
import { useAuth } from '../context/auth-context'
import { axios, cn } from '../lib/utils'
import { fetcher, backendFetcher } from '../lib/api-client'
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
  KeyRound,
  ChevronLeft,
  ChevronRight,
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
import useSWR from 'swr'

const PAGE_SIZE = 12

interface PaginatedUsers {
  users: any[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminUsers() {
  const { isAdmin, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  // Password Change State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      window.location.replace(import.meta.env.VITE_MAIN_SITE_URL)
    }
  }, [isAdmin, authLoading])

  const { data, isLoading, mutate } = useSWR<PaginatedUsers>(
    isAdmin ? `/api/admin/users?page=${page}&limit=${PAGE_SIZE}` : null,
    backendFetcher,
  )

  const users = data?.users ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  const handleToggleSuspension = async (userId: string) => {
    try {
      setIsUpdating(userId)
      await axios.post(`/api/admin/users/${userId}/toggle-suspension`, {})
      toast.success('User status updated successfully.')
      mutate()
    } catch (error) {
      console.error('Failed to toggle suspension:', error)
      toast.error('Failed to update user status')
    } finally {
      setIsUpdating(null)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    try {
      setIsChangingPassword(true)
      await axios.post('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success('Password changed successfully')
      setIsPasswordModalOpen(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <main>
      <Header />
      <section className="pt-8 pb-12 xl:pt-12.5 xl:pb-17.5 px-4 xl:px-0 bg-gray-50/30 min-h-screen">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div>
              <h1 className="text-4xl xl:text-[54px] font-tinos font-bold text-center md:text-left">
                User Management
              </h1>
              {total > 0 && (
                <p className="text-sm text-muted-foreground mt-1 text-center md:text-left">
                  {total} user{total !== 1 ? 's' : ''} total
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/bookings')}
              className="cursor-pointer h-9 xl:h-12 border-2 bg-brand hover:bg-brand/80 text-white border-brand py-2.5 px-5 xl:px-7 rounded-sm font-medium text-base leading-[120%]"
            >
              Manage Bookings
            </Button>
          </div>

          {/* User Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-sm h-64 animate-pulse"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                    <div className="w-16 h-6 bg-gray-100 rounded-full" />
                  </div>
                  <div className="space-y-3">
                    <div className="w-2/3 h-6 bg-gray-100 rounded" />
                    <div className="w-1/2 h-4 bg-gray-100 rounded" />
                    <div className="w-3/4 h-4 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {users.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl shadow-sm">
                  <div className="bg-gray-100 rounded-full p-6 mb-4">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-medium text-gray-900 mb-2">
                    No users found
                  </h3>
                  <p className="text-gray-500">
                    There are no users registered in the system yet.
                  </p>
                </div>
              ) : (
                users.map((user) => {
                  const info = user.userInfos?.[0]
                  const fullName = info
                    ? `${info.firstName} ${info.lastName}`
                    : 'Anonymous User'

                  return (
                    <div
                      key={user.id}
                      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col"
                    >
                      {/* Role Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-[#00AEEF]/10 transition-colors">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                        <div
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                            user.role === 'ADMIN'
                              ? 'bg-[#00AEEF] text-white'
                              : 'bg-gray-100 text-gray-500',
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
                          <p className="text-xs font-mono text-gray-400 mt-1">
                            ID: {user.id}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-600">
                            <Mail className="w-4 h-4 shrink-0" />
                            <span className="text-sm truncate">
                              {user.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600">
                            <Calendar className="w-4 h-4 shrink-0" />
                            <span className="text-sm">
                              Joined{' '}
                              {dayjs(user.createdAt).format('MMM D, YYYY')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 shrink-0 text-[#00AEEF]" />
                            <span
                              className={cn(
                                'text-sm font-medium',
                                user.isSuspended
                                  ? 'text-red-500'
                                  : 'text-green-500',
                              )}
                            >
                              {user.isSuspended
                                ? 'Suspended'
                                : 'Account Active'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Footer */}
                      <div className="mt-8 pt-6 border-t border-gray-50">
                        {user.role === 'ADMIN' ? (
                          <AlertDialog
                            open={isPasswordModalOpen}
                            onOpenChange={setIsPasswordModalOpen}
                          >
                            <AlertDialogTrigger className="w-full h-12 rounded-xl text-base font-medium transition-all gap-2 inline-flex items-center justify-center bg-[#00AEEF]/5 text-[#00AEEF] hover:bg-[#00AEEF] hover:text-white">
                              <KeyRound className="w-4 h-4" />
                              Change Password
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl p-8 data-[size=default]:sm:max-w-lg">
                              <form onSubmit={handlePasswordChange}>
                                <AlertDialogHeader className="space-y-4">
                                  <AlertDialogTitle className="flex flex-col gap-4 text-2xl font-tinos">
                                    <img
                                      src="/images/logo.svg"
                                      alt="Logo"
                                      className="h-10 w-auto self-start"
                                    />
                                    Change Admin Password
                                  </AlertDialogTitle>
                                  <div className="text-base text-gray-600 space-y-4 pt-4 w-full">
                                    <div className="space-y-2 w-full">
                                      <label className="text-sm font-medium text-gray-900">
                                        Current Password
                                      </label>
                                      <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none transition-all"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) =>
                                          setPasswordForm((prev) => ({
                                            ...prev,
                                            currentPassword: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium text-gray-900">
                                        New Password
                                      </label>
                                      <input
                                        type="password"
                                        required
                                        minLength={8}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none transition-all"
                                        value={passwordForm.newPassword}
                                        onChange={(e) =>
                                          setPasswordForm((prev) => ({
                                            ...prev,
                                            newPassword: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium text-gray-900">
                                        Confirm New Password
                                      </label>
                                      <input
                                        type="password"
                                        required
                                        minLength={8}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] outline-none transition-all"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) =>
                                          setPasswordForm((prev) => ({
                                            ...prev,
                                            confirmPassword: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>
                                  </div>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-8 gap-4">
                                  <AlertDialogCancel
                                    type="button"
                                    className="h-14 rounded-xl text-lg flex-1 border-gray-200"
                                    onClick={() => {
                                      setPasswordForm({
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: '',
                                      })
                                    }}
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                  <Button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="h-14 rounded-xl text-lg flex-1 text-white bg-[#00AEEF] hover:bg-[#009EDF]"
                                  >
                                    {isChangingPassword ? (
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                      'Update Password'
                                    )}
                                  </Button>
                                </AlertDialogFooter>
                              </form>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger
                              disabled={isUpdating === user.id}
                              className={cn(
                                'w-full h-12 rounded-xl text-base font-medium transition-all gap-2 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed',
                                user.isSuspended
                                  ? 'bg-[#00AEEF]/5 text-[#00AEEF] hover:bg-[#00AEEF] hover:text-white'
                                  : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white',
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
                            <AlertDialogContent className="rounded-2xl p-8 data-[size=default]:sm:max-w-lg">
                              <AlertDialogHeader className="space-y-4">
                                <AlertDialogTitle className="flex flex-col gap-4 text-2xl font-tinos">
                                  <img
                                    src="/images/logo.svg"
                                    alt="Logo"
                                    className="h-10 w-auto self-start"
                                  />
                                  {user.isSuspended
                                    ? 'Confirm Account Activation'
                                    : 'Confirm Account Suspension'}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-lg text-gray-600">
                                  {user.isSuspended ? (
                                    <>
                                      You are about to restore access for{' '}
                                      <strong>{fullName}</strong>. The user will
                                      be able to log in and manage their
                                      bookings immediately.
                                    </>
                                  ) : (
                                    <>
                                      You are about to suspend{' '}
                                      <strong>{fullName}</strong>. The user will
                                      be immediately blocked from logging into
                                      their account.
                                      <br />
                                      <br />
                                      This does not cancel their existing
                                      bookings.
                                    </>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="mt-8 gap-4">
                                <AlertDialogCancel className="h-14 rounded-xl text-lg flex-1 border-gray-200">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleToggleSuspension(user.id)
                                  }
                                  className={cn(
                                    'h-14 rounded-xl text-lg flex-1 text-white',
                                    user.isSuspended
                                      ? 'bg-[#00AEEF] hover:bg-[#009EDF]'
                                      : 'bg-red-500 hover:bg-red-600',
                                  )}
                                >
                                  {user.isSuspended
                                    ? 'Unsuspend'
                                    : 'Confirm Suspension'}
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
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isCurrentPage = p === page
                const nearCurrent = Math.abs(p - page) <= 2
                const isEndpoint = p === 1 || p === totalPages

                if (!nearCurrent && !isEndpoint) {
                  if (p === 2 || p === totalPages - 1) {
                    return (
                      <span
                        key={p}
                        className="text-gray-400 px-1"
                      >
                        …
                      </span>
                    )
                  }
                  return null
                }

                return (
                  <Button
                    key={p}
                    variant={isCurrentPage ? 'default' : 'outline'}
                    size="icon"
                    className={cn(
                      'rounded-full w-10 h-10 text-sm font-medium',
                      isCurrentPage &&
                        'bg-brand border-brand text-white hover:bg-brand/90',
                    )}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
