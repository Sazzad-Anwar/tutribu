import type {
  CreateBookingInput,
  ApplyPromoInput,
  UpdateStatusInput,
} from '@tutribu/types'
import { isAxiosError } from 'axios'
import { axios } from './utils'

const API_URL = '/api/booking'

export const bookingClient = {
  create: async (data: CreateBookingInput) => {
    try {
      const response = await axios.post(API_URL, data)
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to create booking',
        )
      }
      throw error
    }
  },

  list: async () => {
    try {
      const response = await axios.get(API_URL)
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to list bookings',
        )
      }
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`)
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to get booking',
        )
      }
      throw error
    }
  },

  applyPromo: async (id: string, data: ApplyPromoInput) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/apply-promo`, data)
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to apply promotional code',
        )
      }
      throw error
    }
  },

  updateStatus: async (id: string, data: UpdateStatusInput) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, data)
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to update booking status',
        )
      }
      throw error
    }
  },

  getSavedPaymentMethods: async () => {
    try {
      const response = await axios.get(`${API_URL}/payment-methods`)
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            'Failed to fetch saved payment methods',
        )
      }
      throw error
    }
  },

  cancel: async (id: string) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/cancel`)
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to cancel booking',
        )
      }
      throw error
    }
  },

  savePaymentMethod: async (paymentMethodId: string) => {
    try {
      const response = await axios.post(`${API_URL}/payment-methods`, {
        paymentMethodId,
      })
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to save payment method',
        )
      }
      throw error
    }
  },

  deletePaymentMethod: async (paymentMethodId: string) => {
    try {
      const response = await axios.delete(
        `${API_URL}/payment-methods/${paymentMethodId}`,
      )
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to delete payment method',
        )
      }
      throw error
    }
  },
}
