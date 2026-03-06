import { Skeleton } from './ui/skeleton'

export default function PageSkeleton() {
  return (
    <main>
      {/* Header skeleton */}
      <header className="w-full h-16 border-b border-[#0000001A] px-5 flex items-center justify-between">
        <Skeleton className="w-32 h-8 rounded-lg" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-8 rounded-lg" />
          <Skeleton className="w-20 h-8 rounded-lg" />
          <Skeleton className="w-24 h-9 rounded-[5px]" />
        </div>
      </header>

      {/* Hero banner */}
      <section className="h-[200px] md:h-[300px] lg:h-[400px] w-full">
        <Skeleton className="h-full w-full rounded-[10px] md:rounded-none" />
      </section>

      {/* Trip details section */}
      <section className="container mx-auto py-2.5 lg:py-8">
        {/* Step badge */}
        <Skeleton className="w-24 h-8 rounded-[10px]" />

        <div className="pt-3 pb-0 lg:py-6">
          {/* "Order details" label */}
          <Skeleton className="w-28 h-4 rounded-lg mt-2 mb-5" />

          <div className="py-5 hidden lg:grid grid-cols-1 md:grid-cols-3">
            {/* Left: title + description */}
            <div className="col-span-2 space-y-4">
              <Skeleton className="w-8/12 h-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="w-full h-4 rounded-lg" />
                <Skeleton className="w-full h-4 rounded-lg" />
                <Skeleton className="w-full h-4 rounded-lg" />
                <Skeleton className="w-full h-4 rounded-lg" />
                <Skeleton className="w-11/12 h-4 rounded-lg" />
                <Skeleton className="w-10/12 h-4 rounded-lg" />
                <Skeleton className="w-8/12 h-4 rounded-lg" />
              </div>
            </div>

            {/* Right: status badge + days/nights + dates */}
            <div className="flex-col flex items-end justify-center gap-5">
              <Skeleton className="w-28 h-10 rounded-[10px]" />
              <Skeleton className="w-36 h-10 rounded-[10px]" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-28 h-10 rounded-[10px]" />
                <span className="text-xl font-normal text-gray-300">-</span>
                <Skeleton className="w-28 h-10 rounded-[10px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking signup section */}
      <section className="container mx-auto lg:py-12 xl:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-3 gap-7 lg:gap-10">
          {/* Left: form skeleton */}
          <div className="col-span-1 lg:col-span-3 xl:col-span-2 space-y-5">
            <Skeleton className="w-48 h-10 rounded-xl" />
            <Skeleton className="w-full h-12 rounded-[10px]" />
            <Skeleton className="w-full h-12 rounded-[10px]" />
            <Skeleton className="w-full h-12 rounded-[10px]" />
            <Skeleton className="w-36 h-11 rounded-[5px]" />
          </div>

          {/* Right: price summary skeleton */}
          <div className="lg:col-span-2 xl:col-span-1 space-y-4">
            <Skeleton className="w-48 h-10 rounded-xl" />
            <div className="lg:p-5 rounded-[20px] lg:border border-[#0000001A] space-y-4">
              <div className="hidden lg:flex justify-between items-center">
                <Skeleton className="w-32 h-5 rounded-lg" />
                <Skeleton className="w-24 h-6 rounded-full" />
              </div>
              <Skeleton className="w-3/4 h-10 rounded-xl" />
              <Skeleton className="w-48 h-5 rounded-lg" />
              <div className="flex items-center gap-2.5 py-2">
                <Skeleton className="w-20 h-5 rounded-lg" />
                <Skeleton className="size-5 rounded" />
                <Skeleton className="size-5 rounded" />
                <Skeleton className="size-5 rounded" />
                <Skeleton className="size-5 rounded" />
              </div>
              <Skeleton className="w-72 h-5 rounded-lg" />
              <Skeleton className="w-40 h-5 rounded-lg" />
              <div className="space-y-3">
                <Skeleton className="w-full h-5 rounded-lg" />
                <Skeleton className="w-full h-5 rounded-lg" />
                <Skeleton className="w-full h-5 rounded-lg" />
                <Skeleton className="w-10/12 h-5 rounded-lg" />
              </div>
            </div>
            <div className="hidden lg:flex justify-between items-center p-5 rounded-[20px] border border-[#0000001A]">
              <Skeleton className="w-16 h-8 rounded-xl" />
              <Skeleton className="w-24 h-8 rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer skeleton */}
      <footer className="w-full border-t border-[#0000001A] py-10 mt-10">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="space-y-3"
            >
              <Skeleton className="w-24 h-5 rounded-lg" />
              <Skeleton className="w-full h-4 rounded-lg" />
              <Skeleton className="w-full h-4 rounded-lg" />
              <Skeleton className="w-3/4 h-4 rounded-lg" />
            </div>
          ))}
        </div>
      </footer>
    </main>
  )
}
