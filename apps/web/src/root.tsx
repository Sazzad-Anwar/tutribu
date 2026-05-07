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
import './lib/i18n'
import { I18nextProvider } from 'react-i18next'
import i18n from './lib/i18n'

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
    <I18nextProvider i18n={i18n}>
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
    </I18nextProvider>
  )
}

import Header from './components/header'
import Footer from './components/footer'
import { Button } from './components/ui/button'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { t } = useTranslation()
  let message = t('errors.oops')
  let details = t('errors.unexpectedError')

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
              {error.status === 404 ? t('errors.pageNotFound') : 'Error'}
            </h1>
            <h2 className="text-2xl lg:text-4xl font-semibold text-[#473D3E]">
              {error.status === 404
                ? t('errors.lostInAdventure')
                : t('errors.somethingWentWrong')}
            </h2>
          </div>
          <p className="max-w-md text-sm lg:text-lg text-[#7A7A7A]">
            {error.status === 404
              ? t('errors.pageNotFoundDesc')
              : details}
          </p>
          <Link to="/">
            <Button className="bg-brand text-white px-8 py-6 rounded-[5px] text-lg hover:bg-brand/90 transition-all font-medium">
              {t('common.backToHome')}
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
        <Button variant="outline">{t('common.backToHome')}</Button>
      </Link>
    </main>
  )
}
