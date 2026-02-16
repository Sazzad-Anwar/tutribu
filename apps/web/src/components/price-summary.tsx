import { CircleAlert, Star } from 'lucide-react'

export default function PriceSummary({ totalPrice }: { totalPrice: number }) {
  return (
    <div className=" lg:col-span-2 order-1 lg:order-2 xl:col-span-1">
      <h2 className="hidden lg:block text-2xl lg:text-4xl xl:text-[54px] font-bold font-tinos mb-2.5">
        Price Summary
      </h2>
      <div className="lg:p-5 rounded-[20px] lg:border border-[#0000001A]">
        <div className="hidden lg:flex justify-between items-center mb-2.5">
          <p className="lg:text-lg xl:text-xl font-normal">Package Details</p>
          <div className="rounded-full flex items-center border border-brand gap-2 px-3 py-1">
            <p className="lg:text-xs xl:text-sm text-brand font-normal">
              Guaranteed{' '}
            </p>
            <CircleAlert className="text-brand lg:size-3 xl:size-4" />
          </div>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold font-tinos mb-3.5">
          Ultimate Argentina
        </h1>
        <div className="flex items-center gap-1">
          <p className="text-base lg:text-lg xl:text-xl font-normal leading-[100%]">
            546 reviews
          </p>
          <img
            src="/images/owl-eye.svg"
            className="w-6 h-4 lg:w-4 xl:w-6 lg:h-3 xl:h-4"
            alt="eyes"
          />
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className="size-4 lg:size-3 xl:size-4 fill-[#FF8800] stroke-[#FF8800]"
            />
          ))}
        </div>
        <div className="py-4 flex items-center gap-8">
          <p className="lg:text-lg xl:text-xl font-normal">Includes: </p>
          <div className="flex items-center gap-2.5">
            <img
              src="/images/building.svg"
              className="lg:size-5 xl:size-6"
              alt="building"
            />
            <img
              src="/images/train.svg"
              className="lg:size-5 xl:size-6"
              alt="train"
            />
            <img
              src="/images/food.svg"
              className="lg:size-5 xl:size-6"
              alt="food"
            />
            <img
              src="/images/plane.svg"
              className="lg:size-5 xl:size-6"
              alt="plane"
            />
          </div>
        </div>
        <p className="lg:text-base xl:text-xl font-normal pb-4">
          Sultry Buenos Aires. Vibrant Rio. The roaring majesty of Iguazú Falls.
          Embark on a whirlwind journey filled with rhythm, flavor, and
          unforgettable icons of South America. Are you in?
        </p>
        <p className="lg:text-base xl:text-xl font-normal pb-4">
          8 Days from 08 Nov to 16 Nov
        </p>
        <p className="lg:text-base xl:text-xl font-medium pb-2.5">
          Package includes
        </p>
        <ul className="list-none">
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
        </p>
      </div>

      <div className="hidden p-5 rounded-[20px] border border-[#0000001A] lg:flex justify-between items-center mt-10">
        <p className="lg:text-2xl xl:text-4xl font-tinos font-bold">Total</p>
        <p className="lg:text-2xl xl:text-4xl font-tinos font-bold">
          $ {totalPrice}
        </p>
      </div>
    </div>
  )
}
