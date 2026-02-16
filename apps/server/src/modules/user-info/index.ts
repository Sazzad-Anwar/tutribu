import Elysia from 'elysia'
import jwt from '@elysiajs/jwt'
import { env } from '@tutribu/env/server'
import { CreateUserInfoSchema, UpdateUserInfoSchema } from '@tutribu/types'
import z from 'zod'
import {
  createUserInfo,
  deleteUserInfo,
  getUserInfo,
  listUserInfoForUser,
  updateUserInfo,
} from './user-info.service'

/**
 * UserInfoModule - routes for managing user profile information (UserInfo)
 */
export const UserInfoModule: any = new Elysia({ prefix: '/api/user-info' })
  .use(
    jwt({
      secret: env.JWT_SECRET,
      exp: '15m',
    }),
  )
  .derive(
    async ({ jwt, cookie: { accessToken }, headers: { authorization } }) => {
      const token = (authorization ?? accessToken?.value) as string | undefined
      const user = await jwt.verify(token)
      return { user: user as { userId: string } | undefined }
    },
  )
  .onBeforeHandle(({ user, status }) => {
    if (!user) {
      return status(401, { message: 'Unauthorized' })
    }
  })
  .get(
    '/me',
    async ({ user }) => {
      return await listUserInfoForUser(user!.userId)
    },
    {
      response: {
        200: z.array(z.any()),
        401: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Get My Info',
        description: 'List all UserInfo records for the authenticated user',
        tags: ['UserInfo'],
      },
    },
  )
  .get(
    '/:id',
    async ({ params, user }) => {
      return await getUserInfo(params.id, user!.userId)
    },
    {
      response: {
        200: z.any(),
        401: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Get User Info',
        description: 'Retrieve a specific UserInfo record by id',
        tags: ['UserInfo'],
      },
    },
  )
  .post(
    '/',
    async ({ body, user }) => {
      return await createUserInfo(user!.userId, body)
    },
    {
      body: CreateUserInfoSchema,
      response: {
        201: z.any(),
        401: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Create User Info',
        description: 'Create a new UserInfo record for the authenticated user',
        tags: ['UserInfo'],
      },
    },
  )
  .patch(
    '/:id',
    async ({ params, body, user }) => {
      return await updateUserInfo(params.id, user!.userId, body)
    },
    {
      body: UpdateUserInfoSchema,
      response: {
        200: z.any(),
        401: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Update User Info',
        description: 'Update an existing UserInfo record (owner only)',
        tags: ['UserInfo'],
      },
    },
  )
  .delete(
    '/:id',
    async ({ params, user }) => {
      await deleteUserInfo(params.id, user!.userId)
      return { message: 'UserInfo deleted' }
    },
    {
      response: {
        200: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Delete User Info',
        description: 'Delete a specific UserInfo record (owner only)',
        tags: ['UserInfo'],
      },
    },
  )
