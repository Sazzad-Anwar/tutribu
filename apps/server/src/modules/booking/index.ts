import Elysia from 'elysia'
import jwt from '@elysiajs/jwt'
import { env } from '@tutribu/env/server'
import z from 'zod'

import {
  createBooking,
  listBookingsForUser,
  getBookingById,
  applyPromotionalCodeToBooking,
  updateBookingStatus,
} from './booking.service'
import {
  ApplyPromoSchema,
  CreateBookingSchema,
  UpdateStatusSchema,
} from '@tutribu/types'

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
      console.log({ jwtUser })
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
  // Apply promotional code to booking
  .post(
    '/:id/apply-promo',
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

      // Ensure booking belongs to user
      await getBookingById(params.id as string, jwtUser.userId as string)

      const updated = await applyPromotionalCodeToBooking(
        params.id as string,
        (body as any).code,
      )
      set.headers['content-type'] = 'application/json'
      return updated
    },
    {
      body: ApplyPromoSchema,
      response: {
        200: z.any(),
        400: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Apply Promotional Code',
        description:
          'Apply a promotional code to an existing booking (owner only)',
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
        (body as any).status,
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
