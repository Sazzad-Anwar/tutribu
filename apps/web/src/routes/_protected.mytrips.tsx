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
                          <AlertDialogContent className="rounded-sm">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
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
                              <AlertDialogCancel>Keep Trip</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancel(item.id)}
                                className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                              >
                                Confirm Cancellation
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
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
