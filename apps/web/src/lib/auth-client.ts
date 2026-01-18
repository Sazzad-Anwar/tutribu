import { type SignInInput, type SignUpInput, type User } from '@tutribu/types'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { axios } from './utils'

const API_URL = '/api/auth'

type AuthResponse<T> = {
  accessToken?: string
  message?: string
  user?: User
} & T

export const authClient = {
  signUp: async (
    data: SignUpInput,
  ): Promise<AuthResponse<{ accessToken: string }>> => {
    try {
      const response = await axios.post(`${API_URL}/signup`, data)
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to sign up')
      }
      throw error
    }
  },

  signIn: async (
    data: SignInInput,
  ): Promise<AuthResponse<{ accessToken: string }>> => {
    console.log(API_URL)
    try {
      const response = await axios.post(`${API_URL}/sign-in`, data)
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to sign in')
      }
      throw error
    }
  },
}
