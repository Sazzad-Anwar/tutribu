import qs from 'qs'
import Header from './header'
import PriceSummary from './price-summary'

export default function CheckoutForm() {
  const query = qs.parse(location.search, { ignoreQueryPrefix: true })
  console.log(query)
  return (
    <main>
      <Header />
      <section className="h-[200px] px-5 md:px-0 overflow-hidden md:h-[300px] lg:h-[400px] w-full">
        <img
          className="h-full w-full object-cover rounded-[10px] md:rounded-none  object-center"
          src="/images/checkout-banner.svg"
          alt="banner-image"
        />
      </section>
      <section className="container mx-auto py-2.5 lg:py-8">
        <span className="text-sm block max-w-fit lg:text-md xl:text-lg font-normal bg-brand text-white p-2.5 rounded-[10px]">
          <span>Step 2 of 2</span>
        </span>
        <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-3 gap-7">
          <div className="col-span-1 order-2 lg:order-1 lg:col-span-3 xl:col-span-2"></div>
          <PriceSummary />
        </div>
      </section>
    </main>
  )
}
