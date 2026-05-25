import { redirect } from 'react-router'

export function clientLoader() {
  return redirect(import.meta.env.VITE_MAIN_SITE_URL)
}

export default function Home() {
  return null
}
