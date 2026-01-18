import db from '@tutribu/db'
import type {
  CreatePromotionalCodeInput,
  UpdatePromotionalCodeInput,
} from '@tutribu/types'
import { status } from 'elysia'

/**
 * Validate a promotional code string and return the promotional record if valid.
 * A valid code:
 *  - exists
 *  - now is between validFrom and validTo (inclusive)
 */
export async function getValidPromotionalCodeByCode(code: string) {
  if (!code) return null
  const promo = await db.promotionalCode.findUnique({
    where: { code },
  })

  if (!promo) return null

  const now = new Date()
  if (promo.validFrom > now || promo.validTo < now) {
    return null
  }

  return promo
}

/**
 * Promotional Code CRUD
 */

export async function createPromotionalCode(input: CreatePromotionalCodeInput) {
  const existing = await db.promotionalCode.findUnique({
    where: { code: input.code },
  })
  if (existing) {
    throw status(409, { message: 'Promotional code already exists' })
  }

  const promo = await db.promotionalCode.create({
    data: {
      code: input.code,
      discount: input.discount,
      validFrom: new Date(input.validFrom),
      validTo: new Date(input.validTo),
    },
  })
  return promo
}

export async function updatePromotionalCode(
  id: string,
  input: UpdatePromotionalCodeInput,
) {
  const existing = await db.promotionalCode.findUnique({ where: { id } })
  if (!existing) {
    throw status(404, { message: 'Promotional code not found' })
  }

  // Check unique code collision if code is being updated
  if (input.code && input.code !== existing.code) {
    const collision = await db.promotionalCode.findUnique({
      where: { code: input.code },
    })
    if (collision) {
      throw status(409, { message: 'Promotional code already exists' })
    }
  }

  const updated = await db.promotionalCode.update({
    where: { id },
    data: {
      code: input.code,
      discount: input.discount,
      validFrom: input.validFrom ? new Date(input.validFrom) : undefined,
      validTo: input.validTo ? new Date(input.validTo) : undefined,
    },
  })
  return updated
}

export async function deletePromotionalCode(id: string) {
  const existing = await db.promotionalCode.findUnique({ where: { id } })
  if (!existing) {
    throw status(404, { message: 'Promotional code not found' })
  }

  await db.promotionalCode.delete({ where: { id } })
  return { message: 'Promotional code deleted' }
}

export async function getPromotionalCode(id: string) {
  const promo = await db.promotionalCode.findUnique({ where: { id } })
  if (!promo) {
    throw status(404, { message: 'Promotional code not found' })
  }
  return promo
}

/**
 * List promotional codes (optionally only active ones).
 */
export async function listPromotionalCodes(activeOnly = true) {
  const now = new Date()
  const where = activeOnly
    ? {
        validFrom: { lte: now },
        validTo: { gte: now },
      }
    : undefined

  const promos = await db.promotionalCode.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return promos
}
