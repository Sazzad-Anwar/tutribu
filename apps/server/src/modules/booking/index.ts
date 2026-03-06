import Elysia from 'elysia'
import jwt from '@elysiajs/jwt'
import { env } from '@tutribu/env/server'
import z from 'zod'

import {
  createBooking,
  listBookingsForUser,
  getBookingById,
  updateBookingStatus,
  getSavedPaymentMethods,
  cancelBooking,
  savePaymentMethodToCustomer,
  deletePaymentMethodFromCustomer,
} from './booking.service'
import { CreateBookingSchema, UpdateStatusSchema } from '@tutribu/types'

/**
 * BookingModule - routes for booking operations
 */
export const BookingModule: any = new Elysia({ prefix: '/api/booking' })
  .use(
    jwt({
      secret: env.JWT_SECRET,
      exp: '15m',
    }),
  )
  // Create booking
  .post(
    '',
    async ({
      body,
      jwt,
      cookie: { accessToken },
      headers: { authorization },
      set,
      status,
    }) => {
      const token = (authorization ?? accessToken?.value) as string | undefined
      const jwtUser = await jwt.verify(token)
      if (!jwtUser) {
        set.headers['content-type'] = 'application/json'
        return status(401, { message: 'Unauthorized' })
      }

      // Construct input for service (ensure userId from JWT)
      const input = {
        ...(body as Record<string, any>),
        userId: jwtUser.userId as string,
      }

      const created = await createBooking(input as any)

      set.headers['content-type'] = 'application/json'
      return status(201, created)
    },
    {
      body: CreateBookingSchema,
      response: {
        201: z.any(),
        400: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Create Booking',
        description: 'Create a new booking for the authenticated user',
        tags: ['Booking'],
      },
    },
  )
  // List bookings for current user
  .get(
    '',
    async ({
      jwt,
      cookie: { accessToken },
      headers: { authorization },
      status,
    }) => {
      const token = (authorization ?? accessToken?.value) as string | undefined
      const jwtUser = await jwt.verify(token)
      if (!jwtUser) {
        return status(401, { message: 'Unauthorized' })
      }

      const bookings = await listBookingsForUser(jwtUser.userId as string)
      return bookings
    },
    {
      response: {
        200: z.array(z.any()),
        401: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'List Bookings',
        description: 'List bookings for the authenticated user',
        tags: ['Booking'],
      },
    },
  )
  // Get saved payment methods for current user
  .get(
    '/payment-methods',
    async ({
      jwt,
      cookie: { accessToken },
      headers: { authorization },
      status,
    }) => {
      const token = (authorization ?? accessToken?.value) as string | undefined
      const jwtUser = await jwt.verify(token)
      if (!jwtUser) {
        return status(401, { message: 'Unauthorized' })
      }

      const paymentMethods = await getSavedPaymentMethods(
        jwtUser.userId as string,
      )
      return paymentMethods
    },
    {
      response: {
        200: z.array(z.any()),
        401: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Get Saved Payment Methods',
        description:
          'Get saved Stripe payment methods for the authenticated user',
        tags: ['Booking'],
      },
    },
  )
  // Attach payment method to current user
  .post(
    '/payment-methods',
    async ({
      body,
      jwt,
      cookie: { accessToken },
      headers: { authorization },
      status,
      set,
    }) => {
      const token = (authorization ?? accessToken?.value) as string | undefined
      const jwtUser = await jwt.verify(token)
      if (!jwtUser) {
        set.headers['content-type'] = 'application/json'
        return status(401, { message: 'Unauthorized' })
      }

      const { paymentMethodId } = body as any
      if (!paymentMethodId) {
        set.headers['content-type'] = 'application/json'
        return status(400, { message: 'Payment method ID is required' })
      }

      const attached = await savePaymentMethodToCustomer(
        jwtUser.userId as string,
        paymentMethodId,
      )

      set.headers['content-type'] = 'application/json'
      return status(201, attached)
    },
    {
      body: z.object({
        paymentMethodId: z.string(),
      }),
      response: {
        201: z.any(),
        400: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Save Payment Method',
        description: 'Attach a new Stripe payment method to the user',
        tags: ['Booking'],
      },
    },
  )
  // Detach payment method from current user
  .delete(
    '/payment-methods/:id',
    async ({
      params,
      jwt,
      cookie: { accessToken },
      headers: { authorization },
      status,
      set,
    }) => {
      const token = (authorization ?? accessToken?.value) as string | undefined
      const jwtUser = await jwt.verify(token)
      if (!jwtUser) {
        set.headers['content-type'] = 'application/json'
        return status(401, { message: 'Unauthorized' })
      }

      await deletePaymentMethodFromCustomer(
        jwtUser.userId as string,
        params.id as string,
      )

      set.headers['content-type'] = 'application/json'
      return status(200, { message: 'Payment method deleted successfully' })
    },
    {
      response: {
        200: z.object({ message: z.string() }),
        400: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Delete Saved Payment Method',
        description: 'Detach a saved Stripe payment method from the user',
        tags: ['Booking'],
      },
    },
  )
  // Get booking by id (must belong to authenticated user)
  .get(
    '/:id',
    async ({
      params,
      jwt,
      cookie: { accessToken },
      headers: { authorization },
      status,
    }) => {
      const token = (authorization ?? accessToken?.value) as string | undefined
      const jwtUser = await jwt.verify(token)
      if (!jwtUser) {
        return status(401, { message: 'Unauthorized' })
      }

      const booking = await getBookingById(
        params.id as string,
        jwtUser.userId as string,
      )
      return booking
    },
    {
      response: {
        200: z.any(),
        401: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Get Booking',
        description:
          'Retrieve a booking by id (must belong to authenticated user)',
        tags: ['Booking'],
      },
    },
  )
  // Update booking status
  .patch(
    '/:id/status',
    async ({
      params,
      body,
      jwt,
      cookie: { accessToken },
      headers: { authorization },
      status,
      set,
    }) => {
      const token = (authorization ?? accessToken?.value) as string | undefined
      const jwtUser = await jwt.verify(token)
      if (!jwtUser) {
        set.headers['content-type'] = 'application/json'
        return status(401, { message: 'Unauthorized' })
      }

      // Ensure booking belongs to user (or you could check roles here)
      await getBookingById(params.id as string, jwtUser.userId as string)

      const updated = await updateBookingStatus(
        params.id as string,
        body as any,
      )
      set.headers['content-type'] = 'application/json'
      return updated
    },
    {
      body: UpdateStatusSchema,
      response: {
        200: z.any(),
        400: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Update Booking Status',
        description: 'Update the status of an existing booking (owner only)',
        tags: ['Booking'],
      },
    },
  )
  // Cancel booking with 70% refund
  .post(
    '/:id/cancel',
    async ({
      params,
      jwt,
      cookie: { accessToken },
      headers: { authorization },
      status,
      set,
    }) => {
      const token = (authorization ?? accessToken?.value) as string | undefined
      const jwtUser = await jwt.verify(token)
      if (!jwtUser) {
        set.headers['content-type'] = 'application/json'
        return status(401, { message: 'Unauthorized' })
      }

      const updated = await cancelBooking(
        params.id as string,
        jwtUser.userId as string,
      )
      set.headers['content-type'] = 'application/json'
      return updated
    },
    {
      response: {
        200: z.any(),
        400: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Cancel Booking',
        description:
          'Cancel an existing booking (owner only). Issues a 70% refund.',
        tags: ['Booking'],
      },
    },
  )
