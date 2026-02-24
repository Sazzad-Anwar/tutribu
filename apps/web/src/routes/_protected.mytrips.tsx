import { Link } from 'react-router'
import dayjs from 'dayjs'
import Footer from '../components/footer'
import Header from '../components/header'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { bookingClient } from '../lib/booking-client'
import useSWR, { useSWRConfig } from 'swr'
import { cn } from '../lib/utils'
import { type Booking } from '@tutribu/types'
import { useState } from 'react'
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
import { toast } from 'sonner'

export default function MyTrips() {
  const { mutate } = useSWRConfig()
  const { data } = useSWR<Booking[]>('bookings', bookingClient.list)
  const [isCancelling, setIsCancelling] = useState<string | null>(null)

  const handleCancel = async (id: string) => {
    try {
      setIsCancelling(id)
      await bookingClient.cancel(id)
      toast.success(
        'Trip cancelled successfully. 70% refund has been processed.',
      )
      mutate('bookings')
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel trip')
    } finally {
      setIsCancelling(null)
    }
  }

  return (
    <main>
      <Header />
      <section className="pt-8 pb-12 xl:pt-12.5 xl:pb-17.5 px-4 xl:px-0">
        <div className="container mx-auto">
          <h1 className="text-4xl xl:text-[54px] font-tinos font-bold mb-8 xl:mb-17.5 text-center xl:text-left">
            My Trips
          </h1>
          <div className="overflow-hidden w-full">
            {data?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-gray-100 rounded-full p-6 mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3m0 0l3-3m-3 3V8"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-2">
                  No trips found
                </h3>
                <p className="text-gray-500 mb-6">
                  Looks like you haven't booked any trips yet.
                </p>
                <Link
                  to="/"
                  className="bg-[#00AEEF] hover:bg-[#0098d1] text-white px-8 py-3 rounded-md font-medium transition-colors"
                >
                  Explore Destinations
                </Link>
              </div>
            ) : (
              <Table className="block xl:table w-full">
                <TableBody className="block xl:table-row-group">
                  {data?.map((item: any, index: number) => (
                    <TableRow
                      key={item.id || index}
                      className="flex flex-col xl:table-row border border-[#0000001A] mb-6 xl:mb-0   xl:p-0 xl:pb-5 shadow-sm xl:shadow-none"
                    >
                      <TableCell className="block xl:table-cell font-medium pb-5 xl:pb-0 border-b border-gray-100 xl:border-none">
                        <div className="flex flex-col sm:flex-row xl:flex-row items-center sm:items-start xl:items-center gap-4 xl:gap-5 text-center sm:text-left">
                          <img
                            src="/images/trip-image.png"
                            alt="trip-image"
                            className="h-40 w-full sm:w-40 xl:h-25 xl:w-25 rounded-[10px] object-cover"
                          />
                          <div className="space-y-2 sm:space-y-0 xl:space-y-1">
                            <h1 className="text-2xl xl:text-[32px]">
                              Trip to Ibiza
                            </h1>
                            <p className="text-base xl:text-lg text-gray-500 xl:text-black">
                              {dayjs().format('DD MMM YYYY')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="block xl:table-cell py-4 xl:py-0 border-b border-gray-100 xl:border-none">
                        <div className="flex xl:flex-col justify-between xl:justify-start items-center xl:items-start xl:space-y-4.5">
                          <p className="text-lg xl:text-xl font-medium xl:font-normal">
                            Traveler
                          </p>
                          <p className="text-base xl:text-lg">
                            2 Adults and 1 Kid
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="block xl:table-cell py-4 xl:py-0 border-b border-gray-100 xl:border-none">
                        <div className="flex xl:flex-col justify-between xl:justify-start xl:items-center space-y-0 xl:space-y-2.5">
                          <p className="text-lg xl:text-xl font-medium xl:font-normal">
                            Payment Status
                          </p>
                          <div
                            className={cn(
                              item.paymentStatus === 'COMPLETED'
                                ? 'bg-[#00AEEF]'
                                : 'bg-[#EFCB00]',
                              'py-2 xl:py-4 w-auto px-6 xl:px-10 rounded-[5px] text-white',
                            )}
                          >
                            <p className="text-sm xl:text-lg">
                              {item.paymentStatus}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="block xl:table-cell py-4 xl:py-0 border-b border-gray-100 xl:border-none">
                        <div className="flex xl:flex-col justify-between xl:justify-start xl:items-center space-y-0 xl:space-y-2.5">
                          <p className="text-lg xl:text-xl font-medium xl:font-normal">
                            Booking Status
                          </p>
                          <div
                            className={cn(
                              item.bookingStatus === 'CONFIRMED'
                                ? 'bg-[#00AEEF]'
                                : 'bg-[#EFCB00]',
                              'py-2 xl:py-4 w-auto px-6 xl:px-10 rounded-[5px] text-white',
                            )}
                          >
                            <p className="text-sm xl:text-lg">
                              {item.bookingStatus}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="block xl:table-cell pt-4 xl:pt-0 text-center text-[#C0C0C0] text-base xl:text-lg cursor-pointer">
                        {item.bookingStatus !== 'CANCELLED' ? (
                          <AlertDialog>
                            <AlertDialogTrigger className="hover:text-red-500 cursor-pointer transition-colors">
                              {isCancelling === item.id
                                ? 'Cancelling...'
                                : 'Cancel Trip'}
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-xl p-8 data-[size=default]:sm:max-w-lg">
                              <AlertDialogHeader className="space-y-4">
                                <AlertDialogTitle className="space-y-4 text-base lg:text-xl">
                                  <img
                                    src="/images/logo.svg"
                                    alt="Logo"
                                    className="h-9 w-28 lg:h-12 lg:w-[162px] xl:h-16 xl:w-[182px]"
                                    height={64}
                                    width={182}
                                  />
                                  <span className="font-semibold text-base md:text-2xl">
                                    Are you absolutely sure?
                                  </span>
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-base xl:text-lg">
                                  This action cannot be undone. This will
                                  permanently cancel your trip to Ibiza. Please
                                  note that{' '}
                                  <strong>
                                    only 70% of the paid amount will be refunded
                                  </strong>{' '}
                                  to your original payment method.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-brand mt-12.5 py-6 w-full disabled:bg-brand/30 md:w-52 text-white rounded-[5px] px-14 text-lg">
                                  Keep Trip
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancel(item.id)}
                                  className="bg-red-500 mt-12.5 py-6 w-full disabled:bg-brand/30 md:w-52 text-white rounded-[5px] px-14 text-lg"
                                >
                                  Cancel Trip
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <span className="text-gray-400 cursor-not-allowed">
                            Cancelled
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
