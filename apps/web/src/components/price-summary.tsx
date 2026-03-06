import dayjs from 'dayjs'
import { CircleAlert, Star } from 'lucide-react'
import { useParams, useSearchParams } from 'react-router'
import useSWR from 'swr'
import { Skeleton } from './ui/skeleton'

export default function PriceSummary({ totalPrice }: { totalPrice?: number }) {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const groupItem = searchParams.get('group_item')
  const { data, isLoading } = useSWR(`/wp/v2/trips/?slug=${id}`)
  const trip = data?.[0]
  const group = groupItem ? trip?.meta?.group_item?.[groupItem] : undefined
  return (
    <div className=" lg:col-span-2 order-1 lg:order-2 xl:col-span-1">
      <h2 className="hidden lg:block text-2xl lg:text-4xl xl:text-[54px] font-bold font-tinos mb-2.5">
        Price Summary
      </h2>
      <div className="lg:p-5 rounded-[20px] lg:border border-[#0000001A]">
        {/* Package Details row */}
        <div className="hidden lg:flex justify-between items-center mb-2.5">
          <p className="lg:text-lg xl:text-xl font-normal">Package Details</p>
          {isLoading ? (
            <Skeleton className="w-24 h-6 rounded-full" />
          ) : (
            <div className="rounded-full flex items-center border border-brand gap-2 px-3 py-1">
              <p className="lg:text-xs xl:text-sm text-brand font-normal">
                {group?.status}
              </p>
              <CircleAlert className="text-brand lg:size-3 xl:size-4" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl lg:text-4xl font-bold font-tinos mb-3.5">
          {isLoading ? (
            <Skeleton className="w-3/4 h-10 rounded-xl" />
          ) : (
            trip?.title?.rendered
          )}
        </h1>

        {/* Reviews row */}
        <div className="flex items-center gap-1">
          {isLoading ? (
            <Skeleton className="w-48 h-5 rounded-lg" />
          ) : (
            <>
              <p className="text-base lg:text-lg xl:text-xl font-normal leading-[100%]">
                {trip?.meta?.review_count} reviews
              </p>
              <img
                src="/images/owl-eye.svg"
                className="w-6 h-4 lg:w-4 xl:w-6 lg:h-3 xl:h-4"
                alt="eyes"
              />
              {Array.from({ length: Number(trip?.meta?.review) }).map(
                (_, index) => (
                  <Star
                    key={index}
                    className="size-4 lg:size-3 xl:size-4 fill-[#FF8800] stroke-[#FF8800]"
                  />
                ),
              )}
            </>
          )}
        </div>

        {/* Includes icons */}
        <div className="py-4 flex items-center gap-8">
          <p className="lg:text-lg xl:text-xl font-normal">Includes: </p>
          {isLoading ? (
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-5 lg:size-5 xl:size-6 rounded" />
              <Skeleton className="size-5 lg:size-5 xl:size-6 rounded" />
              <Skeleton className="size-5 lg:size-5 xl:size-6 rounded" />
              <Skeleton className="size-5 lg:size-5 xl:size-6 rounded" />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              {trip?.meta?.hotel ? (
                <img
                  src="/images/building.svg"
                  className="lg:size-5 xl:size-6"
                  alt="building"
                />
              ) : null}
              {trip?.meta?.train ? (
                <img
                  src="/images/train.svg"
                  className="lg:size-5 xl:size-6"
                  alt="train"
                />
              ) : null}
              {trip?.meta?.food ? (
                <img
                  src="/images/food.svg"
                  className="lg:size-5 xl:size-6"
                  alt="food"
                />
              ) : null}
              {trip?.meta?.flight ? (
                <img
                  src="/images/plane.svg"
                  className="lg:size-5 xl:size-6"
                  alt="plane"
                />
              ) : null}
            </div>
          )}
        </div>

        {/* Date range */}
        {isLoading ? (
          <Skeleton className="w-72 h-5 rounded-lg mb-4" />
        ) : (
          <p className="lg:text-base xl:text-xl font-normal pb-4">
            {dayjs(group?.depart_date).diff(dayjs(group?.arriving_date), 'day')}{' '}
            Days from {dayjs(group?.arriving_date).format('DD MMM YYYY')} to{' '}
            {dayjs(group?.depart_date).format('DD MMM YYYY')}
          </p>
        )}

        {/* Package includes list */}
        <p className="lg:text-base xl:text-xl font-medium pb-2.5">
          Package includes
        </p>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="w-full h-5 rounded-lg" />
            <Skeleton className="w-full h-5 rounded-lg" />
            <Skeleton className="w-full h-5 rounded-lg" />
            <Skeleton className="w-10/12 h-5 rounded-lg" />
          </div>
        ) : (
          <div
            className="[&_ul]:list-item [&_li]:py-2 [&_li]:px-0 [&_li]:flex [&_li]:items-center [&_li]:gap-1.5 [&_li]:lg:text-base [&_li]:xl:text-xl [&_li]:font-normal [&_li]:before:content-['•'] [&_li]:before:text-black [&_li]:before:pr-2.5 [&_li]:before:text-2xl [&_li]:before:leading-none"
            dangerouslySetInnerHTML={{ __html: trip?.meta?.includes_text }}
          />
        )}
        {/* <ul className="list-none">
          <li className="py-2 px-2.5 flex items-center gap-1.5">
            <img
              src="/images/bed.svg"
              alt="bed"
              className="lg:size-5 xl:size-6"
            />
            <p className="lg:text-base xl:text-xl font-normal">
              Handpicked 4-star stays
            </p>
          </li>
          <li className="py-2 px-2.5 flex items-center gap-1.5">
            <img
              src="/images/skateboarding.svg"
              alt="skateboarding"
              className="lg:size-5 xl:size-6"
            />
            <p className="lg:text-base xl:text-xl font-normal">
              All activities from the itinerary
            </p>
          </li>
          <li className="py-2 px-2.5 flex items-center gap-1.5">
            <img
              src="/images/map1.svg"
              alt="map1"
              className="lg:size-5 xl:size-6"
            />
            <p className="lg:text-base xl:text-xl font-normal">
              Expert Pack Leader
            </p>
          </li>
          <li className="py-2 px-2.5 flex items-center gap-1.5">
            <img
              src="/images/bus.svg"
              alt="bus"
              className="lg:size-5 xl:size-6"
            />
            <p className="lg:text-base xl:text-xl font-normal">
              Seamless travel
            </p>
          </li>
          <li className="py-2 px-2.5 flex items-center gap-1.5">
            <img
              src="/images/glass.svg"
              alt="glass"
              className="lg:size-5 xl:size-6"
            />
            <p className="lg:text-base xl:text-xl font-normal">Meals covered</p>
          </li>
          <li className="py-2 px-2.5 flex items-center gap-1.5">
            <img
              src="/images/user-fav.svg"
              alt="user-fav"
              className="lg:size-5 xl:size-6"
            />
            <p className="lg:text-base xl:text-xl font-normal">
              For travelers in their 30s & 40s
            </p>
          </li>
        </ul>
        <p className="lg:text-base xl:text-xl font-normal pt-1">
          Arrival transfer included
        </p>
        <p className="lg:text-base xl:text-xl font-normal pt-1">
          ATOL protected
        </p> */}
      </div>

      {/* Total price footer */}
      <div className="hidden p-5 rounded-[20px] border border-[#0000001A] lg:flex justify-between items-center mt-10">
        <p className="lg:text-2xl xl:text-4xl font-tinos font-bold">Total</p>
        {isLoading ? (
          <Skeleton className="w-24 h-8 rounded-xl" />
        ) : (
          <p className="lg:text-2xl xl:text-4xl font-tinos font-bold">
            $ {totalPrice ?? group?.price}
          </p>
        )}
      </div>
    </div>
  )
}
