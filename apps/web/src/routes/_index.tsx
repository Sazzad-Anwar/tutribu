import { useEffect } from 'react'
import { useAuth } from '../context/auth-context'
import type { Route } from './+types/_index'
import { axios } from '../lib/utils'
import Header from '../components/header'
import UserBookingSignup from '../components/user-booking-signup'

const TITLE_TEXT = `
 ██████╗ ███████╗████████╗████████╗███████╗██████╗
 ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝
 ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗
 ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║
 ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

 ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
    ██║       ███████╗   ██║   ███████║██║     █████╔╝
    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 `

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'tutribu' },
    { name: 'description', content: 'tutribu is a web application' },
  ]
}

export default function Home() {
  const { user } = useAuth()

  return (
    <main>
      <Header />
      <section className="h-[200px] px-5 md:px-0 overflow-hidden md:h-[300px] lg:h-[400px] w-full">
        <img
          className="h-full w-full object-cover rounded-[10px] md:rounded-none  object-center"
          src="/images/banner-image.svg"
          alt="banner-image"
        />
      </section>
      <section className="container mx-auto py-2.5 lg:py-8">
        <span className="text-sm block max-w-fit lg:text-md xl:text-lg font-normal bg-brand text-white p-2.5 rounded-[10px]">
          <span>Step 1 of 2</span>
        </span>
        <div className=" pt-3 pb-0 lg:py-6">
          <p className="text-sm lg:text-md xl:text-lg font-normal">
            Order details
          </p>
          <div className="py-5 hidden lg:grid grid-cols-1 md:grid-cols-3">
            <div className="col-span-2">
              <h1 className="font-bold text-3xl lg:text-4xl xl:text-[54px] font-tinos mb-2.5">
                Ultimate Argentina
              </h1>
              <p className="text-sm lg:text-md xl:text-lg font-normal">
                Ultimate Argentina is a four-day journey through the heart and
                soul of this vibrant nation — blending culture, nature, and
                flavor into one unforgettable experience. From the tango-filled
                streets of Buenos Aires to the open plains of the Pampas, the
                sun-soaked vineyards of Mendoza, and the breathtaking power of
                Iguazú Falls, every moment is crafted to reveal Argentina’s
                diverse beauty. Whether you’re savoring world-class wines,
                witnessing gaucho traditions, or standing in awe before
                cascading waterfalls, Ultimate Argentina is your gateway to the
                country’s most iconic sights and authentic experiences — all in
                one extraordinary adventure.
              </p>
            </div>
            <div className="flex-col flex items-end justify-center gap-5">
              <span className="p-2.5 rounded-[10px] border border-brand text-brand lg:text-sm xl:text-xl font-normal">
                Guaranteed
              </span>
              <span className="p-2.5 rounded-[10px] border border-brand text-brand lg:text-sm xl:text-xl font-normal">
                9 days, 8 nights
              </span>
              <span className="flex items-center gap-2">
                <span className="p-2.5 rounded-[10px] border border-brand lg:text-sm xl:text-xl font-normal">
                  27th Jun 2026
                </span>
                <span className="text-xl font-normal">-</span>
                <span className="p-2.5 rounded-[10px] border border-brand lg:text-sm xl:text-xl font-normal">
                  5th Jul 2026
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="container mx-auto lg:py-12 xl:py-24">
        <UserBookingSignup />
      </section>
    </main>
  )
}
