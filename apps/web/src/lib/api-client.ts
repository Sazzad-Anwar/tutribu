import * as axiosClient from 'axios'

const API_USERNAME = import.meta.env.VITE_API_USERNAME ?? ''
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD ?? ''

/**
 * Axios instance with Basic Auth pre-configured.
 * Used by the SWR fetcher so every SWR call includes the auth header.
 */
export const apiClient = axiosClient.default.create({
  baseURL: 'https://corsproxy.io/' + import.meta.env.VITE_WP_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: API_USERNAME,
    password: API_PASSWORD,
  },
})

/**
 * Generic SWR fetcher backed by apiClient.
 *
 * Usage:
 *   const { data, error, isLoading } = useSWR('/your/endpoint', fetcher)
 *
 * The fetcher receives the SWR key as the URL and returns the response data.
 */
export const fetcher = async <T = unknown>(url: string): Promise<T> => {
  const response = await apiClient.get<T>(url)
  return response.data
}
