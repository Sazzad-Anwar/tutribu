import { useEffect, useState } from 'react'
import { useAuth } from '../context/auth-context'
import type { Route } from './+types/_index.$id'
import Header from '../components/header'
import Footer from '../components/footer'
import useSWR from 'swr'
import { Skeleton } from '../components/ui/skeleton'
import { Link } from 'react-router'
import dayjs from 'dayjs'
import { ChevronLeft, Info } from 'lucide-react'
import { cn } from '../lib/utils'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'tutribu' },
    { name: 'description', content: 'tutribu is a web application' },
  ]
}

export default function Trips({ params }: Route.ComponentProps) {
  const { id } = params
  const { checkAuth } = useAuth()
  const [imageLoaded, setImageLoaded] = useState(false)
  const { data, isLoading } = useSWR(`/wp/v2/trips/?slug=${id}`)
  const trip = data?.[0]
  const groups = trip?.meta?.group_item
    ? Object.entries(trip?.meta?.group_item).map(([key, value]) => ({
        ...value,
        group_item: key,
      }))
    : []
  const { data: imageData, isLoading: isLoadingImage } = useSWR(
    trip?.featured_media ? `/wp/v2/media/${trip?.featured_media}` : null,
  )

  useEffect(() => {
    const checkAuthHandler = async () => {
      await checkAuth()
    }
    checkAuthHandler()
  }, [])

  console.log(groups)

  return (
    <main>
      <Header />
      <section className="container mx-auto">
        <Link
          to="/"
          className="flex items-center gap-1"
        >
          <ChevronLeft />
          <span className="text-xl font-normal">Back</span>
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-bold leading-[100%] font-tinos text-[42px] md:text-[54px] mt-3.5">
              {isLoading ? (
                <Skeleton className="w-8/12 rounded-xl h-20" />
              ) : (
                trip?.title?.rendered
              )}
            </h1>
            <div className="mt-7.5">
              {isLoading ? (
                <Skeleton className="w-36 h-10 rounded-[10px]" />
              ) : (
                <span className="p-2.5 rounded-[10px] border text-xl font-normal">
                  {trip?.meta?.days} days, {trip?.meta?.nights} nights
                </span>
              )}
            </div>
            <div className="mt-6 flex items-center gap-1 md:gap-5">
              <div className="p-2.5 rounded-[10px] border lg:text-sm xl:text-xl font-normal flex items-center gap-2.5">
                <img
                  src="/images/calendar-icon.svg"
                  className="h-4 w-4 lg:h-7.5 lg:w-6.5"
                />
                <span className="text-base lg:text-xl">When ?</span>
              </div>
              <div className="p-2.5 rounded-[10px] border lg:text-sm xl:text-xl font-normal flex items-center gap-2.5">
                <img
                  src="/images/key.svg"
                  className="h-4 w-4 lg:h-6 lg:w-6"
                />
                <span className="text-base lg:text-xl">Room Options</span>
              </div>
              <div className="p-2.5 rounded-[10px] border lg:text-sm xl:text-xl font-normal flex items-center gap-2.5">
                <img
                  src="/images/on-sale-icon.svg"
                  className="h-4 w-4 lg:h-6 lg:w-6"
                />
                <span className="text-base lg:text-xl">On Sale</span>
              </div>
            </div>
          </div>
          {/* <div className="flex items-center gap-2.5">
            <button className="p-4 rounded-[5px] text-xl border border-[#00000033]">
              Age 30-49
            </button>
            <button className="p-4 rounded-[5px] text-xl border border-[#00000033]">
              Age 45-59
            </button>
          </div> */}
        </div>
        <div className="mt-4 lg:mt-12.5 w-full px-5 lg:px-7.5 py-2.5 lg:py-2.5 bg-[#F2FBFE] flex flex-col lg:flex-row justify-between items-center">
          <div className="space-y-8.5 lg:space-x-2.5 flex flex-col lg:flex-row items-center">
            <img
              src="/images/people-group.png"
              alt="people-group"
              className="w-[288px] lg:w-[230px] h-[100] lg:h-20"
            />
            <div className="space-y-5 lg:-space-y-2.5 text-center">
              <h1 className="text-[32px]">
                Got questions? <br className="block lg:hidden" /> We’re here to
                help.
              </h1>
              <p className="text-[18px] lg:text-2xl">
                Meet people who get where you are in life.
              </p>
            </div>
          </div>
          <button className="mt-11 w-full md:w-auto lg:mt-0 p-4 rounded-[10px] text-xl border text-white bg-black border-[#00000033]">
            Call: (331) 214-3422
          </button>
        </div>
        {groups?.map((item) => (
          <div
            key={'group-' + item?.group_item}
            className="mt-12.5 border border-[#0000004D] rounded-[15px] lg:rounded-[20px] flex flex-col lg:flex-row justify-between items-center"
          >
            <div className="w-full p-5">
              <div className="flex flex-col lg:flex-row justify-between w-full">
                <div className="flex items-center justify-between lg:justify-start gap-2.5 mb-4.5 lg:mb-0">
                  <div className="space-y-2.5 lg:space-y-0">
                    <h1
                      className={cn(
                        'text-xl font-normal',
                        +item?.seats === 0 ? 'opacity-60' : '',
                      )}
                    >
                      {dayjs(item?.arriving_date).format('DD MMM YYYY')}
                    </h1>
                    <p
                      className={cn(
                        'text-base text-[#00000080] font-normal',
                        +item?.seats === 0 ? 'opacity-50' : '',
                      )}
                    >
                      We are arriving
                    </p>
                  </div>
                  <img
                    className="size-6"
                    src="/images/right-arrow.png"
                    alt="right-arrow"
                  />
                  <div className="space-y-2.5 lg:space-y-0">
                    <h1
                      className={cn(
                        'text-xl font-normal',
                        +item?.seats === 0 ? 'opacity-60' : '',
                      )}
                    >
                      {dayjs(item?.depart_date).format('DD MMM YYYY')}
                    </h1>
                    <p
                      className={cn(
                        'text-base text-[#00000080] font-normal',
                        +item?.seats === 0 ? 'opacity-50' : '',
                      )}
                    >
                      Depart on {dayjs(item?.depart_date).format('dddd')}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    ' px-5 py-2.5 flex justify-center items-center',
                    +item?.seats === 0
                      ? 'bg-[#00AEEF33]/50 text-[#00AEEF]/50'
                      : 'text-[#00AEEF] bg-[#00AEEF33]',
                  )}
                >
                  <p className="text-base">
                    {+item?.seats === 0 ? 'Sold out' : 'Closing soon'}
                  </p>
                </div>
              </div>
              <div className=" lg:flex mt-15.5 hidden items-center gap-2.5">
                <img
                  src="/images/lock-icon.png"
                  alt="lock-icon"
                  className={cn(
                    'size-6',
                    +item?.seats === 0 ? 'opacity-50' : '',
                  )}
                />
                <span
                  className={cn(
                    'text-base text-[#00000080]',
                    +item?.seats === 0 ? 'opacity-50' : '',
                  )}
                >
                  Unlock to see who's going
                </span>
              </div>
              <div className=" lg:hidden mt-3.5 flex justify-center  items-center gap-2.5">
                <img
                  src="/images/lock-icon.png"
                  alt="lock-icon"
                  className={cn(
                    'size-6',
                    +item?.seats === 0 ? 'opacity-50' : '',
                  )}
                />
                <span
                  className={cn(
                    'text-base text-[#00000080]',
                    +item?.seats === 0 ? 'opacity-50' : '',
                  )}
                >
                  Unlock to see who's going
                </span>
              </div>
            </div>
            {+item?.seats > 0 ? (
              <div className=" lg:border-l lg:border-[#0000004D] flex flex-col gap-4 px-4 py-2.5 w-full lg:w-auto">
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-0 text-center">
                    <h1 className="text-[40px]">${item?.price}</h1>
                    {Boolean(item?.room_options?.['Private rooms']) && (
                      <div className="flex items-center gap-2.5 justify-center">
                        <Info className="text-[#00000080]" />
                        <p className="text-base text-[#00000080]">
                          Private room on request
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Link
                      to={`/trip/${id}?group_item=${item?.group_item}`}
                      className="w-full lg:w-[325px] mx-auto block text-center rounded-[5px] bg-black text-white py-4"
                    >
                      Join this group
                    </Link>
                    <div className=" lg:hidden mt-3.5 flex justify-center  items-center gap-2.5">
                      <img
                        src="/images/lock-icon.png"
                        alt="lock-icon"
                        className={cn(
                          'size-6',
                          +item?.seats === 0 ? 'opacity-50' : '',
                        )}
                      />
                      <span
                        className={cn(
                          'text-base text-[#00000080]',
                          +item?.seats === 0 ? 'opacity-50' : '',
                        )}
                      >
                        Unlock to see who's going
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ))}

        <div className="mt-[100px] mb-[61px] grid grid-cols-1 lg:grid-cols-3 gap-7.5">
          <div className="border border-[#0000004D] space-y-2.5 p-5 rounded-[10px]">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/key-square.png"
                alt="key-square"
                className="size-7.5"
              />
              <h1 className="text-2xl">Book your trip today</h1>
            </div>
            <p className="text-base lg:text-xl text-[#00000080]">
              Secure your spot with a deposit of just £200 for tours departing
              in 90+ days.
            </p>
          </div>
          <div className="border border-[#0000004D]  space-y-2.5 p-5 rounded-[10px]">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/calendar-search-icon.png"
                alt="calendar-search-icon"
                className="size-7.5"
              />
              <h1 className="text-2xl">Flexible ways to pay</h1>
            </div>
            <p className="text-base lg:text-xl text-[#00000080]">
              Split your payment into 3 or 6 monthly installments, or pay in
              full 90 days prior to travel.
            </p>
          </div>
          <div className="border border-[#0000004D] p-5 space-y-2.5 rounded-[10px]">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/verified-check.png"
                alt="verified-check"
                className="size-7.5"
              />
              <h1 className="text-2xl">Our Guarantee</h1>
            </div>
            <p className="text-base lg:text-xl text-[#00000080]">
              If anything under our control doesn’t meet expectations, we’ll
              make it right for you.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
