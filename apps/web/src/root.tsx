import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'

import PageSkeleton from './components/page-skeleton'
import type { Route } from './+types/root'

import './index.css'
import { Toaster } from './components/ui/sonner'

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap',
  },
]

export function HydrateFallback() {
  return <PageSkeleton />
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link
          rel="icon"
          href="/images/icon.ico"
          type="image/x-icon"
        />
        <link
          rel="icon"
          href="/images/icon.svg"
          type="image/svg+xml"
        />
        <Meta />
        <Links />
        <title>Tutribu</title>
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

import { AuthProvider } from './context/auth-context'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { SWRConfig } from 'swr'
import { fetcher } from './lib/api-client'

export default function App() {
  return (
    <SWRConfig value={{ fetcher }}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <div className="grid grid-rows-[auto_1fr] h-svh">
            <Outlet />
          </div>
          <Toaster richColors />
        </AuthProvider>
      </GoogleOAuthProvider>
    </SWRConfig>
  )
}

import Header from './components/header'
import Footer from './components/footer'
import { Button } from './components/ui/button'
import { Link } from 'react-router'

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'

  if (isRouteErrorResponse(error)) {
    details =
      import.meta.env.DEV && error && error instanceof Error
        ? error.message
        : details
    return (
      <>
        <Header />
        <main className="container mx-auto flex flex-col items-center justify-center py-20 lg:py-32 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-7xl font-bold text-brand">
              {error.status === 404 ? '404' : 'Error'}
            </h1>
            <h2 className="text-2xl lg:text-4xl font-semibold text-[#473D3E]">
              {error.status === 404
                ? 'Lost in Adventure?'
                : 'Something went wrong'}
            </h2>
          </div>
          <p className="max-w-md text-sm lg:text-lg text-[#7A7A7A]">
            {error.status === 404
              ? 'The requested page could not be found.'
              : details}
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

  return (
    <main className="pt-16 p-4 container mx-auto text-center flex flex-col items-center gap-4">
      <h1 className="text-3xl font-bold">{message}</h1>
      <p className="text-gray-600">{details}</p>
      <Link to="/">
        <Button variant="outline">Back to Home</Button>
      </Link>
    </main>
  )
}
