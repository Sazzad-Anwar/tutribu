import Elysia from 'elysia'
import jwt from '@elysiajs/jwt'
import { env } from '@tutribu/env/server'
import { listUsers, toggleUserSuspension } from '../auth/auth.service'
import { cancelBooking } from '../booking/booking.service'
import db from '@tutribu/db'

export const AdminModule: any = new Elysia({ prefix: '/api/admin' })
  .use(
    jwt({
      secret: env.JWT_SECRET,
      exp: '15m',
    }),
  )
  .derive(async ({ jwt, cookie: { accessToken }, headers: { authorization } }) => {
    const token = (authorization ?? accessToken?.value) as string | undefined
    const user = await jwt.verify(token)
    if (!user) return { user: null, isAdmin: false }

    const userRecord = await db.user.findUnique({
      where: { id: user.userId as string },
      select: { role: true },
    })

    return {
      user,
      isAdmin: userRecord?.role === 'ADMIN',
    }
  })
  .onBeforeHandle(({ isAdmin, set }) => {
    if (!isAdmin) {
      set.status = 403
      return { message: 'Forbidden: Admin access required' }
    }
  })
  // List all users
  .get('/users', async ({ query }) => {
    const page = Math.max(1, parseInt((query as any).page ?? '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt((query as any).limit ?? '12', 10)))
    return await listUsers(page, limit)
  })
  // Toggle user suspension
  .post('/users/:id/toggle-suspension', async ({ params: { id } }) => {
    return await toggleUserSuspension(id)
  })
  // List all bookings
  .get('/bookings', async () => {
    return await db.booking.findMany({
      include: {
        userInfo: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  })
  // Update any booking
  .patch('/bookings/:id', async ({ params: { id }, body }) => {
    return await db.booking.update({
      where: { id },
      data: body as any,
    })
  })
  // Cancel any booking
  .post('/bookings/:id/cancel', async ({ params: { id } }) => {
    return await cancelBooking(id, null, true)
  })
