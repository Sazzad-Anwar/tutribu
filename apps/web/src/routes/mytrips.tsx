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

export default function MyTrips() {
  return (
    <main>
      <Header />
      <section className="pt-12.5 pb-17.5">
        <div className="container mx-auto">
          <h1 className="text-[54px] font-tinos font-bold mb-17.5">My Trips</h1>
          <Table>
            <TableBody>
              <TableRow className="border border-[#0000001A] pb-5">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-5">
                    <img
                      src="/images/trip-image.png"
                      alt="trip-image"
                      width={100}
                      height={100}
                      className="h-25 w-25 rounded-[10px]"
                    />
                    <div>
                      <h1 className="text-[32px]">Trip to Ibiza</h1>
                      <p className="text-lg">{dayjs().format('DD MMM YYYY')}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-4.5">
                    <p className="text-xl">Traveler</p>
                    <p className="text-lg">2 Adults and 1 Kid </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2.5 flex flex-col items-center">
                    <p className="text-xl">Payment Status</p>
                    <div className="py-4 w-auto px-10 bg-[#00AEEF] rounded-[5px] text-white">
                      <p className="text-lg">Paid</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2.5 flex flex-col items-center">
                    <p className="text-xl">Booking Status</p>
                    <div className="py-4 w-auto px-10 bg-[#EFCB00] rounded-[5px] text-white">
                      <p className="text-lg">On Pending</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center text-[#C0C0C0] text-lg cursor-pointer">
                  Cancel Trip
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>
      <Footer />
    </main>
  )
}
