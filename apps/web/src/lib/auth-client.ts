import {
  type SignInInput,
  type SignUpInput,
  type User,
  type UserInfo,
} from '@tutribu/types'
import { isAxiosError } from 'axios'
import { axios } from './utils'

const API_AUTH_URL = '/api/auth'
const API_USER_INFO = '/api/user-info'

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
      const response = await axios.post(`${API_AUTH_URL}/signup`, data)
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
    try {
      const response = await axios.post(`${API_AUTH_URL}/sign-in`, data)
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to sign in')
      }
      throw error
    }
  },

  updateProfile: async (data: UserInfo) => {
    try {
      const response = await axios.patch(`${API_USER_INFO}/${data.id}`, data)
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to update profile',
        )
      }
      throw error
    }
  },
}
