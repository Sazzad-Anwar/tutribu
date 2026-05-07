import * as axiosClient from 'axios'
import { axios as backendAxios } from './utils'

const API_USERNAME = import.meta.env.VITE_API_USERNAME ?? ''
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD ?? ''

/**
 * Axios instance with Basic Auth pre-configured.
 * Used by the SWR fetcher so every SWR call includes the auth header.
 * Points at the WordPress site via CORS proxy.
 */
export const apiClient = axiosClient.default.create({
  baseURL: 'https://corsproxy.io/?url=' + import.meta.env.VITE_WP_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: API_USERNAME,
    password: API_PASSWORD,
  },
})

/**
 * SWR fetcher for WordPress API calls via CORS proxy.
 */
export const fetcher = async <T = unknown>(url: string): Promise<T> => {
  const response = await apiClient.get<T>(url)
  return response.data
}

/**
 * SWR fetcher for backend API calls (VITE_API_URL).
 * Shares the same axios instance used everywhere else in the app,
 * so cookie credentials and the token-refresh interceptor apply.
 */
export const backendFetcher = async <T = unknown>(url: string): Promise<T> => {
  const response = await backendAxios.get<T>(url)
  return response.data
}
