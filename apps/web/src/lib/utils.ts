import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import * as axiosClient from 'axios'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const axios = axiosClient.default.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

interface CustomAxiosRequestConfig
  extends axiosClient.InternalAxiosRequestConfig {
  _retry?: boolean
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/refresh-tokens')
    ) {
      originalRequest._retry = true

      try {
        await axios.post('/api/auth/refresh-tokens')
        return axios(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)
