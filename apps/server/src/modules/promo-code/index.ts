import jwt from '@elysiajs/jwt'
import { env } from '@tutribu/env/server'
import {
  CreatePromotionalCodeSchema,
  UpdatePromotionalCodeSchema,
} from '@tutribu/types'
import Elysia from 'elysia'
import z from 'zod'
import {
  createPromotionalCode,
  deletePromotionalCode,
  getPromotionalCode,
  listPromotionalCodes,
  updatePromotionalCode,
} from './promo-code.service'

/**
 * PromoCodeModule - routes for promotional code operations
 */
export const PromoCodeModule: any = new Elysia({ prefix: '/api/promo-codes' })
  .use(
    jwt({
      secret: env.JWT_SECRET,
      exp: '15m',
    }),
  )
  // List active promotional codes (public)
  .get(
    '',
    async () => {
      const promos = await listPromotionalCodes(true)
      return promos
    },
    {
      response: {
        200: z.array(z.any()),
      },
      detail: {
        summary: 'List Promotional Codes',
        description: 'List active promotional codes',
        tags: ['Promotional Code'],
      },
    },
  )
  .post(
    '',
    async ({
      body,
      jwt,
      headers: { authorization },
      status,
      set,
      cookie: { accessToken },
    }) => {
      // Admin check would go here
      const token = (authorization ?? accessToken?.value) as string | undefined
      const jwtUser = await jwt.verify(token)
      if (!jwtUser) {
        return status(401, { message: 'Unauthorized' })
      }

      const promo = await createPromotionalCode(body as any)
      set.headers['content-type'] = 'application/json'
      return status(201, promo)
    },
    {
      body: CreatePromotionalCodeSchema,
      response: {
        201: z.any(),
        401: z.object({ message: z.string() }),
        409: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Create Promotional Code',
        description: 'Create a new promotional code',
        tags: ['Promotional Code'],
      },
    },
  )
  .get(
    '/:id',
    async ({ params }) => {
      const promo = await getPromotionalCode(params.id)
      return promo
    },
    {
      response: {
        200: z.any(),
        404: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Get Promotional Code',
        description: 'Get promotional code by ID',
        tags: ['Promotional Code'],
      },
    },
  )
  .patch(
    '/:id',
    async ({
      params,
      body,
      jwt,
      headers: { authorization },
      status,
      cookie: { accessToken },
    }) => {
      // Admin check would go here
      const token = (authorization ?? accessToken?.value) as string | undefined
      const jwtUser = await jwt.verify(token)
      if (!jwtUser) {
        return status(401, { message: 'Unauthorized' })
      }

      const updated = await updatePromotionalCode(params.id, body as any)
      return updated
    },
    {
      body: UpdatePromotionalCodeSchema,
      response: {
        200: z.any(),
        401: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
        409: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Update Promotional Code',
        description: 'Update an existing promotional code',
        tags: ['Promotional Code'],
      },
    },
  )
  .delete(
    '/:id',
    async ({
      params,
      jwt,
      headers: { authorization },
      status,
      cookie: { accessToken },
    }) => {
      // Admin check would go here
      const token = (authorization ?? accessToken?.value) as string | undefined
      const jwtUser = await jwt.verify(token)
      if (!jwtUser) {
        return status(401, { message: 'Unauthorized' })
      }

      const result = await deletePromotionalCode(params.id)
      return result
    },
    {
      response: {
        200: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      detail: {
        summary: 'Delete Promotional Code',
        description: 'Delete a promotional code',
        tags: ['Promotional Code'],
      },
    },
  )
