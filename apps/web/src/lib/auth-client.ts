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

  signInWithGoogle: async (
    token: string,
  ): Promise<AuthResponse<{ accessToken: string }>> => {
    try {
      const response = await axios.post(`${API_AUTH_URL}/google`, { token })
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to sign in with Google',
        )
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

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const response = await axios.post(`${API_AUTH_URL}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to upload avatar',
        )
      }
      throw error
    }
  },

  deleteAvatar: async (): Promise<{ message: string }> => {
    try {
      const response = await axios.delete(`${API_AUTH_URL}/avatar`)
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to delete avatar',
        )
      }
      throw error
    }
  },

  deleteAccount: async (): Promise<{ message: string }> => {
    try {
      const response = await axios.delete(`${API_AUTH_URL}/account`)
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to delete account',
        )
      }
      throw error
    }
  },
}
