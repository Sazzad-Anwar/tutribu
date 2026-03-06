import { useEffect, useState } from 'react'
import { useAuth } from '../context/auth-context'
import type { Route } from './+types/_index.$id'
import Header from '../components/header'
import UserBookingSignup from '../components/user-booking-signup'
import Footer from '../components/footer'
import useSWR from 'swr'
import { Skeleton } from '../components/ui/skeleton'
import { useSearchParams } from 'react-router'
import dayjs from 'dayjs'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'tutribu' },
    { name: 'description', content: 'tutribu is a web application' },
  ]
}

export default function Home({ params }: Route.ComponentProps) {
  const { id } = params
  const [searchParams] = useSearchParams()
  const groupItem = searchParams.get('group_item')
  const { checkAuth } = useAuth()
  const [imageLoaded, setImageLoaded] = useState(false)
  const { data, isLoading } = useSWR(`/wp/v2/trips/?slug=${id}`)
  const trip = data?.[0]
  const group = groupItem ? trip?.meta?.group_item?.[groupItem] : undefined
  const { data: imageData, isLoading: isLoadingImage } = useSWR(
    trip?.featured_media ? `/wp/v2/media/${trip?.featured_media}` : null,
  )

  useEffect(() => {
    const checkAuthHandler = async () => {
      await checkAuth()
    }
    checkAuthHandler()
  }, [])

  return (
    <main>
      <Header />
      <section className="h-[200px] px-5 md:px-0 overflow-hidden md:h-[300px] lg:h-[400px] w-full relative">
        {(isLoadingImage || !imageLoaded) && (
          <Skeleton className="absolute inset-0 h-full w-full rounded-[10px] md:rounded-none" />
        )}
        {imageData?.media_details?.sizes?.full?.source_url && (
          <img
            className={`h-full w-full object-cover rounded-[10px] md:rounded-none object-center transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            src={imageData.media_details.sizes.full.source_url}
            alt={trip?.title?.rendered}
            onLoad={() => setImageLoaded(true)}
          />
        )}
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
                {isLoading ? (
                  <Skeleton className="w-8/12 rounded-xl h-12" />
                ) : (
                  trip?.title?.rendered
                )}
              </h1>
              <div>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="w-full rounded-lg h-4" />
                    <Skeleton className="w-full rounded-lg h-4" />
                    <Skeleton className="w-full rounded-lg h-4" />
                    <Skeleton className="w-full rounded-lg h-4" />
                    <Skeleton className="w-11/12 rounded-lg h-4" />
                    <Skeleton className="w-10/12 rounded-lg h-4" />
                    <Skeleton className="w-8/12 rounded-lg h-4" />
                  </div>
                ) : (
                  <div
                    className="text-sm lg:text-base xl:text-lg font-normal"
                    dangerouslySetInnerHTML={{
                      __html: trip?.meta?._description,
                    }}
                  ></div>
                )}
              </div>
            </div>
            <div className="flex-col flex items-end justify-center gap-5">
              {isLoading ? (
                <Skeleton className="w-28 h-10 rounded-[10px]" />
              ) : (
                <span className="p-2.5 rounded-[10px] border border-brand text-brand lg:text-sm xl:text-xl font-normal">
                  {group?.status}
                </span>
              )}
              {isLoading ? (
                <Skeleton className="w-36 h-10 rounded-[10px]" />
              ) : (
                <span className="p-2.5 rounded-[10px] border border-brand text-brand lg:text-sm xl:text-xl font-normal">
                  {trip?.meta?.days} days, {trip?.meta?.nights} nights
                </span>
              )}
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="w-28 h-10 rounded-[10px]" />
                  <span className="text-xl font-normal">-</span>
                  <Skeleton className="w-28 h-10 rounded-[10px]" />
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="p-2.5 rounded-[10px] border border-brand lg:text-sm xl:text-xl font-normal">
                    {dayjs(group?.arriving_date).format('DD MMM YYYY')}
                  </span>
                  <span className="text-xl font-normal">-</span>
                  <span className="p-2.5 rounded-[10px] border border-brand lg:text-sm xl:text-xl font-normal">
                    {dayjs(group?.depart_date).format('DD MMM YYYY')}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="container mx-auto lg:py-12 xl:py-24">
        <UserBookingSignup />
      </section>
      <Footer />
    </main>
  )
}
