import { Link } from 'react-router'
import Header from '../components/header'
import Footer from '../components/footer'
import { Button } from '../components/ui/button'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container mx-auto flex flex-col items-center justify-center py-20 lg:py-32 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl lg:text-7xl font-bold text-brand">404</h1>
          <h2 className="text-2xl lg:text-4xl font-semibold text-[#473D3E]">
            Lost in Adventure?
          </h2>
        </div>
        <p className="max-w-md text-sm lg:text-lg text-[#7A7A7A]">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track to your next destination.
        </p>
        <Link to="/">
          <Button className="bg-brand text-white px-8 py-6 rounded-[5px] text-lg hover:bg-brand/90 transition-all font-medium">
            Back to Home
          </Button>
        </Link>
      </main>
      <Footer />
    </>
  )
}
