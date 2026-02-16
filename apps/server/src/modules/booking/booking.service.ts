import { stripeClient } from '@/lib/stripe'
import db from '@tutribu/db'
import type { BookingSchema, CreateBookingInput } from '@tutribu/types'
import { status } from 'elysia'
import type z from 'zod'
import countries from '@/lib/country.json'

/**
 * Booking service functions
 *
 * These functions operate against the Prisma models defined in the booking and
 * auth schema files. They intentionally keep behavior minimal and DB-focused:
 * - Validation for promotional code windows is handled here
 * - Creation and simple updates of bookings, extra features and promotion links
 * - Totals are adjusted using the provided numeric values and any promotional discount
 *
 * Notes / assumptions:
 * - The Booking model in Prisma requires `totalAmount` so callers should provide
 *   a sensible base amount (e.g. price for the booking) in the input. Service
 *   functions will adjust that amount when a promotional code is applied or when
 *   extra features are added.
 * - Promotional code `discount` is interpreted as an absolute discount amount (Float).
 *   If you'd like % discounts instead, change the arithmetic where `discount` is
 *   applied.
 */

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

const createPaymentMethod = async (
  cardDetails: z.infer<typeof BookingSchema.shape.cardDetails>,
  userInfoId: string,
  countryCode?: string,
) => {
  const user = await db.userInfo.findUnique({
    where: { id: userInfoId },
  })

  if (!user) {
    throw status(400, { message: 'User not found' })
  }

  const data = await db.user.findUnique({
    where: { id: user?.userId! },
    select: {
      email: true,
    },
  })

  // Safe navigation in case userInfo is null (though we try to ensure it exists)
  const billingDetails = {
    name: `${user.firstName || ''} ${user.lastName || ''}`,
    email: data?.email,
    phone: user.phoneNumber || undefined,
    address: {
      line1: user.address || undefined,
      postal_code: user.zipCode || undefined,
      city: user.city || undefined,
      country: countryCode || undefined,
    },
  }

  await stripeClient.paymentMethods.create({
    type: 'card',
    card: {
      number: cardDetails?.number,
      exp_month: cardDetails?.exp_month,
      exp_year: cardDetails?.exp_year,
      cvc: cardDetails?.cvc,
    },
    billing_details: billingDetails,
  })
}

/**
 * Create a booking with optional extra features and optional promotional code.
 * - If a promotional code is provided and valid, the booking's totalAmount will
 *   be reduced by the `discount` amount from the promotional code.
 * - Extra features are created and associated with the booking; their price is
 *   not automatically added to totalAmount unless the caller includes them in
 *   the `totalAmount` field or explicitly calls `addExtraFeature` after creation.
 *
 * Returns the created booking including `extraFeatures` and `promotionalCode`.
 */
export async function createBooking(input: CreateBookingInput) {
  // Basic validation
  if (!input.userInfoId) {
    throw status(400, { message: 'userInfoId is required' })
  }

  // Ensure user exists and has userInfo
  const userInfo = await db.userInfo.findUnique({
    where: { id: input.userInfoId },
  })
  if (!userInfo) {
    throw status(400, { message: 'User info not found' })
  }

  // Validate country name against known countries
  let countryCode: string | undefined
  if (userInfo.country) {
    const matched = countries.find(
      (c) => c.name.toLowerCase() === userInfo.country!.toLowerCase(),
    )
    if (!matched) {
      throw status(400, {
        message: `Country name '${userInfo.country}' is not valid`,
      })
    }
    countryCode = matched.code
  }

  const userInfoId = userInfo.id

  if (!input.groupId) {
    throw status(400, { message: 'groupId is required' })
  }
  if (
    typeof input.totalAmount !== 'number' ||
    Number.isNaN(input.totalAmount)
  ) {
    throw status(400, { message: 'totalAmount must be a number' })
  }

  // Create booking in a transaction
  const created = await db.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        userInfoId: userInfoId!,
        groupId: input.groupId,
        totalAmount: input.totalAmount,
        specialRequest: input.specialRequest ?? null,
        paymentPlan: input.paymentPlan ?? 'ONE_TIME',
        checkingType: input.checkingType ?? 'SELF',
        status: input.status ?? 'PENDING',
      },
    })

    return booking
  })

  await createPaymentMethod(input.cardDetails, input.userInfoId, countryCode)

  return created
}

/**
 * Get a booking by id. Optionally enforce owner check by passing `ownerId`.
 * Returns booking with extra features and promotional code included.
 */
export async function getBookingById(bookingId: string, ownerId?: string) {
  if (!bookingId) {
    throw status(400, { message: 'bookingId is required' })
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      promotionalCode: true,
      userInfo: true,
    },
  })

  if (!booking) {
    throw status(404, { message: 'Booking not found' })
  }

  if (ownerId && booking.userInfo.userId !== ownerId) {
    throw status(403, { message: 'Forbidden' })
  }

  return booking
}

/**
 * List bookings for a given user id, ordered by creation date descending.
 */
export async function listBookingsForUser(userId: string) {
  if (!userId) {
    throw status(400, { message: 'userId is required' })
  }

  const bookings = await db.booking.findMany({
    where: {
      userInfo: {
        userId,
      },
    },
    include: {
      promotionalCode: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return bookings
}

/**
 * Apply a promotional code to an existing booking.
 * - Validates the promotional code window
 * - Rejects if booking already has a promotionalCode applied
 * - Adjusts the booking totalAmount by subtracting the promotional discount
 */
export async function applyPromotionalCodeToBooking(
  bookingId: string,
  code: string,
) {
  if (!bookingId || !code) {
    throw status(400, { message: 'bookingId and code are required' })
  }

  const [booking, promo] = await Promise.all([
    db.booking.findUnique({ where: { id: bookingId } }),
    getValidPromotionalCodeByCode(code),
  ])

  if (!booking) {
    throw status(404, { message: 'Booking not found' })
  }
  if (!promo) {
    throw status(400, { message: 'Invalid or expired promotional code' })
  }
  if (booking.promotionalCodeId) {
    throw status(400, {
      message: 'Promotional code already applied to this booking',
    })
  }

  // Apply discount as absolute amount
  const newTotal = Math.max(0, booking.totalAmount - promo.discount)

  const updated = await db.booking.update({
    where: { id: bookingId },
    data: {
      promotionalCodeId: promo.id,
      totalAmount: newTotal,
    },
    include: {
      promotionalCode: true,
    },
  })

  return updated
}

/**
 * Update the booking status.
 */
export async function updateBookingStatus(
  bookingId: string,
  statusValue: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
) {
  if (!bookingId) {
    throw status(400, { message: 'bookingId is required' })
  }

  const booking = await db.booking.findUnique({ where: { id: bookingId } })
  if (!booking) {
    throw status(404, { message: 'Booking not found' })
  }

  const updated = await db.booking.update({
    where: { id: bookingId },
    data: { status: statusValue },
    include: { promotionalCode: true },
  })

  return updated
}

/**
 * Utility: remove a promotional code from a booking and restore the totalAmount
 * to the value provided by the caller. This operation is intentionally explicit:
 * the service cannot know the original pre-discount value unless the caller
 * provides it or you store pre-discount amounts in your schema.
 */
export async function removePromotionalCodeFromBooking(
  bookingId: string,
  restoreTotalAmount?: number,
) {
  const booking = await db.booking.findUnique({ where: { id: bookingId } })
  if (!booking) {
    throw status(404, { message: 'Booking not found' })
  }
  if (!booking.promotionalCodeId) {
    throw status(400, {
      message: 'No promotional code applied to this booking',
    })
  }

  const updated = await db.booking.update({
    where: { id: bookingId },
    data: {
      promotionalCodeId: null,
      // If caller supplied a restoreTotalAmount use it; otherwise keep the existing total
      totalAmount: restoreTotalAmount ?? booking.totalAmount,
    },
    include: { promotionalCode: true },
  })

  return updated
}
