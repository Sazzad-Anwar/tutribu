import { useState, useEffect } from 'react'
import { useAuth } from '../context/auth-context'
import { axios, cn } from '../lib/utils'
import { Button } from '../components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import dayjs from 'dayjs'
import { apiClient } from '../lib/api-client'
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

export default function AdminBookings() {
  const { isAdmin, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState<any[]>([])
  const [isCancelling, setIsCancelling] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/')
    }
  }, [isAdmin, authLoading, navigate])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/bookings')
      const data = response.data
      setBookings(data)

      // Fetch trip details for each booking
      data.forEach(async (booking: any) => {
        try {
          const { data: tripData } = await apiClient.get(
            `/wp/v2/trips/${booking.tripId}`,
          )
          const { data: mediaData } = await apiClient.get(
            `/wp/v2/media/${tripData?.featured_media}`,
          )
          setTrips((prev) => {
            const exists = prev.find((t) => t.id === tripData.id)
            if (exists) return prev
            return [...prev, { ...tripData, media: mediaData }]
          })
        } catch (error) {
          console.error(
            `Failed to fetch trip details for ${booking.tripId}:`,
            error,
          )
        }
      })
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchBookings()
    }
  }, [isAdmin])

  const handleCancel = async (id: string) => {
    try {
      setIsCancelling(id)
      await axios.post(`/api/admin/bookings/${id}/cancel`)
      toast.success('Booking cancelled and refund processed.')
      fetchBookings()
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      toast.error('Failed to cancel booking')
    } finally {
      setIsCancelling(null)
    }
  }

  const getPaymentPlanLabel = (plan: string) => {
    switch (plan) {
      case 'LOWEST_DEPOSIT':
        return 'Lowest Deposit'
      case 'THREE_MONTH':
        return '3 Month Plan'
      case 'SIX_MONTH':
        return '6 Month Plan'
      case 'ONE_TIME':
        return 'One-Time Pay'
      default:
        return plan
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
              Booking Management
            </h1>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/users')}
              className="cursor-pointer h-9 xl:h-12 border-2 bg-brand hover:bg-brand/80 text-white border-brand py-2.5 px-5 xl:px-7 rounded-sm font-medium text-base leading-[120%]"
            >
              Manage Users
            </Button>
          </div>

          <div className="overflow-hidden w-full space-y-6">
            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-gray-100 rounded-full p-6 mb-4">
                  <Loader2 className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-500">
                  There are no bookings in the system yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((item: any) => {
                  const trip = trips.find((t) => t.id === item.tripId)
                  const group = trip?.meta?.group_item?.[item.groupId]

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-[#0000001A] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col xl:flex-row">
                        {/* Trip Info Section */}
                        <div className="flex-1 p-6 xl:p-6">
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="h-40 w-full sm:w-40 xl:h-28 xl:w-28 shrink-0 relative bg-gray-100 rounded-xl overflow-hidden">
                              {!trip?.media?.media_details?.sizes?.full
                                ?.source_url && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                                </div>
                              )}
                              <img
                                src={
                                  trip?.media?.media_details?.sizes?.full
                                    ?.source_url ||
                                  '/images/placeholder-trip.jpg'
                                }
                                alt={trip?.title?.rendered || 'Trip'}
                                className={cn(
                                  'h-full w-full object-cover transition-opacity duration-300',
                                  trip?.media ? 'opacity-100' : 'opacity-0',
                                )}
                                onLoad={(e) => {
                                  e.currentTarget.classList.remove('opacity-0')
                                }}
                              />
                            </div>
                            <div className="space-y-2 text-center sm:text-left">
                              <h2 className="text-2xl xl:text-3xl font-tinos font-bold">
                                {trip?.title?.rendered || 'Loading trip...'}
                              </h2>
                              <p className="text-gray-500 text-lg">
                                {item.userInfo?.firstName}{' '}
                                {item.userInfo?.lastName}
                                <span className="mx-2 text-gray-300">|</span>
                                ID:{' '}
                                <span className="font-mono text-sm">
                                  {item.userInfo?.userId}
                                </span>
                              </p>
                              <p className="text-base text-gray-400">
                                {group?.arriving_date
                                  ? dayjs(group.arriving_date).format(
                                      'DD MMM YYYY',
                                    )
                                  : 'Date pending'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Status Sections */}
                        <div className="flex flex-col sm:flex-row xl:flex-row border-t xl:border-t-0 xl:border-l border-gray-100">
                          <div className="flex-1 p-6 xl:p-8 flex flex-col justify-center items-center sm:items-start xl:w-40 border-b sm:border-b-0 sm:border-r xl:border-r border-gray-100">
                            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                              Amount
                            </p>
                            <p className="font-bold text-2xl text-gray-900">
                              ${item.totalAmount}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Total Price
                            </p>
                          </div>

                          <div className="flex-1 p-6 xl:p-8 flex flex-col justify-center items-center sm:items-start xl:w-48 border-b sm:border-b-0 sm:border-r xl:border-r border-gray-100">
                            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                              Payment
                            </p>
                            <div
                              className={cn(
                                'px-4 py-2 rounded-lg text-white text-base font-medium',
                                item.paymentStatus === 'COMPLETED'
                                  ? 'bg-[#00AEEF]'
                                  : item.paymentStatus === 'REFUNDED'
                                    ? 'bg-orange-500'
                                    : 'bg-[#EFCB00]',
                              )}
                            >
                              {item.paymentStatus}
                            </div>
                            <p className="text-[10px] font-medium mt-2">
                              Plan: {getPaymentPlanLabel(item.paymentPlan)}
                            </p>
                          </div>

                          <div className="flex-1 p-6 xl:p-8 flex flex-col justify-center items-center sm:items-start xl:w-48 border-b sm:border-b-0 sm:border-r xl:border-r border-gray-100">
                            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                              Booking
                            </p>
                            <div
                              className={cn(
                                'px-4 py-2 rounded-lg text-white text-base font-medium',
                                item.bookingStatus === 'CONFIRMED'
                                  ? 'bg-[#00AEEF]'
                                  : item.bookingStatus === 'CANCELLED'
                                    ? 'bg-red-500'
                                    : 'bg-[#EFCB00]',
                              )}
                            >
                              {item.bookingStatus}
                            </div>
                            <p className="text-[10px] text-white mt-2 font-mono uppercase tracking-tighter">
                              Plan: {getPaymentPlanLabel(item.paymentPlan)}
                            </p>
                          </div>

                          <div className="flex-1 p-6 xl:p-8 flex flex-col justify-center items-center xl:w-56 bg-gray-50/50">
                            {item.bookingStatus !== 'CANCELLED' ? (
                              <AlertDialog>
                                <AlertDialogTrigger
                                  disabled={isCancelling === item.id}
                                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all w-full h-12 text-lg inline-flex items-center justify-center rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isCancelling === item.id ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Cancelling...
                                    </>
                                  ) : (
                                    'Cancel'
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
                                      Confirm Admin Cancellation
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-lg text-gray-600">
                                      You are performing an administrative
                                      cancellation for{' '}
                                      <strong>
                                        {item.userInfo?.firstName}'s
                                      </strong>{' '}
                                      trip to{' '}
                                      <strong>
                                        {trip?.title?.rendered ||
                                          'this destination'}
                                      </strong>
                                      .
                                      <br />
                                      <br />
                                      This will automatically trigger a{' '}
                                      <span className="text-red-600 font-bold">
                                        full refund
                                      </span>{' '}
                                      of the paid amount (${item.amountPaid}) to
                                      the customer's original payment method.
                                      <br />
                                      <br />
                                      This action is permanent and cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="mt-8 gap-4">
                                    <AlertDialogCancel className="h-14 rounded-xl text-lg flex-1 border-gray-200">
                                      Keep Booking
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleCancel(item.id)}
                                      className="h-14 rounded-xl text-lg flex-1 bg-red-500 hover:bg-red-600 text-white"
                                    >
                                      Confirm Cancellation
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <div className="text-gray-300 font-medium text-lg italic">
                                Booking Cancelled
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
