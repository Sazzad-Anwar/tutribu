import { stripeClient } from '@/lib/stripe'
import db from '@tutribu/db'
import type { CreateBookingInput } from '@tutribu/types'
import { status } from 'elysia'
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

/**
 * Calculate the initial charge amount based on the payment plan.
 * - ONE_TIME: full totalAmount
 * - LOWEST_DEPOSIT: $300 flat (or totalAmount if less than $300)
 * - THREE_MONTH: totalAmount / 3
 * - SIX_MONTH: totalAmount / 6
 */
function calculateChargeAmount(
  totalAmount: number,
  paymentPlan: string,
): number {
  switch (paymentPlan) {
    case 'LOWEST_DEPOSIT':
      return Math.min(totalAmount, 300)
    case 'THREE_MONTH':
      return Math.ceil((totalAmount / 3) * 100) / 100 // Charge 1/3
    case 'SIX_MONTH':
      return Math.ceil((totalAmount / 6) * 100) / 100 // Charge 1/6
    case 'ONE_TIME':
    default:
      return totalAmount
  }
}

/**
 * Process a payment for a booking:
 * 1. Get or create a Stripe Customer (saved to User.customerId)
 * 2. Attach the PaymentMethod (created on frontend via Stripe.js) to customer
 * 3. Create and confirm a PaymentIntent for the calculated charge amount
 *
 * Returns { paymentIntentId, amountCharged } for storage on the booking.
 */
const getOrCreateInstallmentPrice = async (
  amount: number,
  interval: 'day' | 'month',
) => {
  const amountInCents = Math.round(amount * 100)

  // 1. Get or create a generic 'Trip Installment' product
  const products = await stripeClient.products.list({ limit: 100 })
  let product = products.data.find((p) => p.name === 'Trip Installment')

  if (!product) {
    product = await stripeClient.products.create({
      name: 'Trip Installment',
      description: 'Recurring payment for trip installments',
    })
  }

  // 2. Create a price for this specific amount and interval
  // Note: For high-volume, we'd cache these, but for now we create as needed
  const price = await stripeClient.prices.create({
    unit_amount: amountInCents,
    currency: 'usd',
    recurring: { interval },
    product: product.id,
    metadata: { generated_for_booking: 'true' },
  })

  return price.id
}

const processSubscriptionPayment = async (
  paymentMethodId: string,
  userInfoId: string,
  totalAmount: number,
  paymentPlan: 'THREE_MONTH' | 'SIX_MONTH',
  countryCode?: string,
): Promise<{ subscriptionId: string; amountCharged: number }> => {
  const userInfo = await db.userInfo.findUnique({
    where: { id: userInfoId },
    include: { user: true },
  })

  if (!userInfo || !userInfo.user) {
    throw status(400, { message: 'User not found' })
  }

  const user = userInfo.user
  let stripeCustomerId = user.customerId

  if (!stripeCustomerId) {
    const customer = await stripeClient.customers.create({
      email: user.email,
      name: `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim(),
      phone: userInfo.phoneNumber || undefined,
      address: {
        line1: userInfo.address || undefined,
        postal_code: userInfo.zipCode || undefined,
        city: userInfo.city || undefined,
        country: countryCode || undefined,
      },
    })
    stripeCustomerId = customer.id
    await db.user.update({
      where: { id: user.id },
      data: { customerId: stripeCustomerId },
    })
  }

  await stripeClient.paymentMethods.attach(paymentMethodId, {
    customer: stripeCustomerId,
  })

  await stripeClient.customers.update(stripeCustomerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  })

  const iterations = paymentPlan === 'THREE_MONTH' ? 3 : 6
  const installmentAmount = totalAmount / iterations
  const priceId = await getOrCreateInstallmentPrice(installmentAmount, 'month')

  // Calculate cancel_at (iterations - 1 full periods + 1 day buffer)
  // For monthly, if we want 3 charges: T=0, T=30d, T=60d. Cancel at T=61d.
  // Using 30 days as a Rough month for cancellation logic (Stripe handles exact dates)
  const cancelAt =
    Math.floor(Date.now() / 1000) +
    (iterations - 1) * 30 * 24 * 3600 +
    24 * 3600

  const subscription = await stripeClient.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: priceId }],
    default_payment_method: paymentMethodId,
    payment_behavior: 'allow_incomplete',
    cancel_at: cancelAt,
    metadata: { paymentPlan, totalAmount: String(totalAmount) },
    expand: ['latest_invoice.payment_intent'],
  })

  const invoice = subscription.latest_invoice as any
  const paymentIntent = invoice?.payment_intent

  if (paymentIntent && paymentIntent.status !== 'succeeded') {
    // If the first payment fails or requires action, we should not consider it paid
    throw status(400, {
      message: `First installment payment ${paymentIntent.status}. Please check your card or handle authentication.`,
    })
  }

  return {
    subscriptionId: subscription.id,
    amountCharged: installmentAmount,
  }
}

const processPayment = async (
  paymentMethodId: string,
  userInfoId: string,
  totalAmount: number,
  paymentPlan: string,
  countryCode?: string,
): Promise<{ paymentIntentId: string; amountCharged: number }> => {
  // 1. Look up userInfo and associated User
  const userInfo = await db.userInfo.findUnique({
    where: { id: userInfoId },
    include: { user: true },
  })

  if (!userInfo || !userInfo.user) {
    throw status(400, { message: 'User not found' })
  }

  const user = userInfo.user

  // 2. Get or create Stripe Customer
  let stripeCustomerId = user.customerId

  if (!stripeCustomerId) {
    const customer = await stripeClient.customers.create({
      email: user.email,
      name: `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim(),
      phone: userInfo.phoneNumber || undefined,
      address: {
        line1: userInfo.address || undefined,
        postal_code: userInfo.zipCode || undefined,
        city: userInfo.city || undefined,
        country: countryCode || undefined,
      },
    })
    stripeCustomerId = customer.id

    // Save the Stripe Customer ID on the User
    await db.user.update({
      where: { id: user.id },
      data: { customerId: stripeCustomerId },
    })
  }

  // 3. Attach the PaymentMethod (created on frontend) to the customer
  await stripeClient.paymentMethods.attach(paymentMethodId, {
    customer: stripeCustomerId,
  })

  // 4. Calculate charge amount and create PaymentIntent
  const chargeAmount = calculateChargeAmount(totalAmount, paymentPlan)
  const amountInCents = Math.round(chargeAmount * 100)

  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    customer: stripeCustomerId,
    payment_method: paymentMethodId,
    off_session: true,
    confirm: true,
    description: `Booking payment – ${paymentPlan} plan`,
    metadata: {
      paymentPlan,
      totalAmount: String(totalAmount),
      chargeAmount: String(chargeAmount),
    },
  })

  return {
    paymentIntentId: paymentIntent.id,
    amountCharged: chargeAmount,
  }
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

  // Create the booking
  const paymentPlan = input.paymentPlan ?? 'ONE_TIME'

  const booking = await db.booking.create({
    data: {
      userInfoId: userInfoId!,
      groupId: input.groupId,
      totalAmount: input.totalAmount,
      specialRequest: input.specialRequest ?? null,
      paymentPlan,
      checkingType: input.checkingType ?? 'SELF',
      bookingStatus: input.bookingStatus ?? 'PENDING',
      paymentStatus: 'PENDING',
    },
  })

  // Process payment via Stripe
  let paymentDetails: {
    paymentIntentId?: string
    subscriptionId?: string
    amountCharged: number
  }

  if (paymentPlan === 'THREE_MONTH' || paymentPlan === 'SIX_MONTH') {
    const { subscriptionId, amountCharged } = await processSubscriptionPayment(
      input.paymentMethodId,
      input.userInfoId,
      input.totalAmount,
      paymentPlan as 'THREE_MONTH' | 'SIX_MONTH',
      countryCode,
    )
    paymentDetails = { subscriptionId, amountCharged }
  } else {
    const { paymentIntentId, amountCharged } = await processPayment(
      input.paymentMethodId,
      input.userInfoId,
      input.totalAmount,
      paymentPlan,
      countryCode,
    )
    paymentDetails = { paymentIntentId, amountCharged }
  }

  // Update booking with payment details
  const updated = await db.booking.update({
    where: { id: booking.id },
    data: {
      stripePaymentIntentId: paymentDetails.paymentIntentId,
      stripeSubscriptionId: paymentDetails.subscriptionId,
      amountPaid: paymentDetails.amountCharged,
      bookingStatus: 'CONFIRMED',
      paymentStatus: paymentDetails.subscriptionId ? 'COMPLETED' : 'COMPLETED', // Both should be COMPLETED if we reach here since we throw on failure now
    },
  })

  return updated
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
  updates: {
    bookingStatus?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
    paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  },
) {
  if (!bookingId) {
    throw status(400, { message: 'bookingId is required' })
  }

  const updated = await db.booking.update({
    where: { id: bookingId },
    data: updates,
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

/**
 * Fetch saved payment methods for a user
 */
export async function getSavedPaymentMethods(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw status(404, { message: 'User not found' })
  }

  if (!user.customerId) {
    return []
  }

  const paymentMethods = await stripeClient.paymentMethods.list({
    customer: user.customerId,
    type: 'card',
  })

  return paymentMethods.data.map((pm) => ({
    id: pm.id,
    brand: pm.card?.brand,
    last4: pm.card?.last4,
    exp_month: pm.card?.exp_month,
    exp_year: pm.card?.exp_year,
  }))
}
