import { stripeClient } from "@/lib/stripe";
import db from "@tutribu/db";
import type {
  BookingSchema,
  CreateBookingInput,
  ExtraFeatureInput,
} from "@tutribu/types";
import { status } from "elysia";
import type z from "zod";

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
  if (!code) return null;
  const promo = await db.promotionalCode.findUnique({
    where: { code },
  });

  if (!promo) return null;

  const now = new Date();
  if (promo.validFrom > now || promo.validTo < now) {
    return null;
  }

  return promo;
}

const createPaymentMethod = async (
  cardDetails: z.infer<typeof BookingSchema.shape.cardDetails>,
  userId: string,
) => {
  const user = await db.user.findUnique({ where: { id: userId } });
  await stripeClient.paymentMethods.create({
    type: "card",
    card: {
      number: cardDetails.number,
      exp_month: cardDetails.exp_month,
      exp_year: cardDetails.exp_year,
      cvc: cardDetails.cvc,
    },
    billing_details: {
      name: `${user?.firstName} ${user?.lastName}`,
      email: user?.email,
      phone: user?.phoneNumber || undefined,
      address: {
        line1: user?.address || undefined,
        postal_code: user?.zipCode || undefined,
        city: user?.city || undefined,
        country: user?.country || undefined,
      },
    },
  });
};

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
  if (!input.userId) {
    throw status(400, { message: "userId is required" });
  }
  if (!input.groupId) {
    throw status(400, { message: "groupId is required" });
  }
  if (
    typeof input.totalAmount !== "number" ||
    Number.isNaN(input.totalAmount)
  ) {
    throw status(400, { message: "totalAmount must be a number" });
  }

  // If promotional code provided, validate it and apply its discount
  let promotionalCodeId: string | null = null;
  if (input.promotionalCode) {
    const promo = await getValidPromotionalCodeByCode(input.promotionalCode);
    if (!promo) {
      throw status(400, { message: "Invalid or expired promotional code" });
    }
    promotionalCodeId = promo.id;
  }

  // Prepare nested create for extraFeatures if any
  const extraFeaturesData =
    input.extraFeatures?.map((f) => ({
      name: f.name,
      description: f.description ?? null,
      price: f.price,
    })) ?? [];

  // Apply promotional discount (interpreted as absolute discount)
  const discount = promotionalCodeId
    ? ((
        await db.promotionalCode.findUnique({
          where: { id: promotionalCodeId },
        })
      )?.discount ?? 0)
    : 0;

  const finalTotal = Math.max(0, input.totalAmount - discount);

  // Create booking and any extra features in a transaction
  const created = await db.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        userId: input.userId,
        groupId: input.groupId,
        totalAmount: finalTotal,
        specialRequest: input.specialRequest ?? null,
        paymentPlan: input.paymentPlan ?? "ONE_TIME",
        checkingType: input.checkingType ?? "SELF",
        status: input.status ?? "PENDING",
        promotionalCodeId,
        extraFeatures: {
          create: extraFeaturesData,
        },
      },
      include: {
        extraFeatures: true,
        promotionalCode: true,
      },
    });

    return booking;
  });

  await createPaymentMethod(input.cardDetails, input.userId);

  return created;
}

/**
 * Get a booking by id. Optionally enforce owner check by passing `ownerId`.
 * Returns booking with extra features and promotional code included.
 */
export async function getBookingById(bookingId: string, ownerId?: string) {
  if (!bookingId) {
    throw status(400, { message: "bookingId is required" });
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      extraFeatures: true,
      promotionalCode: true,
    },
  });

  if (!booking) {
    throw status(404, { message: "Booking not found" });
  }

  if (ownerId && booking.userId !== ownerId) {
    throw status(403, { message: "Forbidden" });
  }

  return booking;
}

/**
 * List bookings for a given user id, ordered by creation date descending.
 */
export async function listBookingsForUser(userId: string) {
  if (!userId) {
    throw status(400, { message: "userId is required" });
  }

  const bookings = await db.booking.findMany({
    where: { userId },
    include: {
      extraFeatures: true,
      promotionalCode: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return bookings;
}

/**
 * Add an extra feature to a booking and increment the booking's totalAmount by the feature price.
 * Returns the created ExtraFeature and the updated Booking (with new total).
 */
export async function addExtraFeatureToBooking(
  bookingId: string,
  feature: ExtraFeatureInput,
) {
  if (!bookingId) {
    throw status(400, { message: "bookingId is required" });
  }
  if (!feature || !feature.name || typeof feature.price !== "number") {
    throw status(400, { message: "feature must include name and price" });
  }

  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    throw status(404, { message: "Booking not found" });
  }

  // Use a transaction to ensure both operations succeed or fail together
  const [createdFeature, updatedBooking] = await db.$transaction(async (tx) => {
    const createdFeature = await tx.extraFeature.create({
      data: {
        name: feature.name,
        description: feature.description ?? null,
        price: feature.price,
        bookingId,
      },
    });

    // compute new total based on current booking value to avoid relying on Prisma types
    const newTotal = booking.totalAmount + feature.price;

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        totalAmount: newTotal,
      },
      include: {
        extraFeatures: true,
        promotionalCode: true,
      },
    });

    return [createdFeature, updatedBooking];
  });

  return { createdFeature, updatedBooking };
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
    throw status(400, { message: "bookingId and code are required" });
  }

  const [booking, promo] = await Promise.all([
    db.booking.findUnique({ where: { id: bookingId } }),
    getValidPromotionalCodeByCode(code),
  ]);

  if (!booking) {
    throw status(404, { message: "Booking not found" });
  }
  if (!promo) {
    throw status(400, { message: "Invalid or expired promotional code" });
  }
  if (booking.promotionalCodeId) {
    throw status(400, {
      message: "Promotional code already applied to this booking",
    });
  }

  // Apply discount as absolute amount
  const newTotal = Math.max(0, booking.totalAmount - promo.discount);

  const updated = await db.booking.update({
    where: { id: bookingId },
    data: {
      promotionalCodeId: promo.id,
      totalAmount: newTotal,
    },
    include: {
      extraFeatures: true,
      promotionalCode: true,
    },
  });

  return updated;
}

/**
 * Update the booking status.
 */
export async function updateBookingStatus(
  bookingId: string,
  statusValue: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED",
) {
  if (!bookingId) {
    throw status(400, { message: "bookingId is required" });
  }

  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    throw status(404, { message: "Booking not found" });
  }

  const updated = await db.booking.update({
    where: { id: bookingId },
    data: { status: statusValue },
    include: { extraFeatures: true, promotionalCode: true },
  });

  return updated;
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
  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    throw status(404, { message: "Booking not found" });
  }
  if (!booking.promotionalCodeId) {
    throw status(400, {
      message: "No promotional code applied to this booking",
    });
  }

  const updated = await db.booking.update({
    where: { id: bookingId },
    data: {
      promotionalCodeId: null,
      // If caller supplied a restoreTotalAmount use it; otherwise keep the existing total
      totalAmount: restoreTotalAmount ?? booking.totalAmount,
    },
    include: { extraFeatures: true, promotionalCode: true },
  });

  return updated;
}

/**
 * List promotional codes (optionally only active ones).
 */
export async function listPromotionalCodes(activeOnly = true) {
  const now = new Date();
  const where = activeOnly
    ? {
        validFrom: { lte: now },
        validTo: { gte: now },
      }
    : undefined;

  const promos = await db.promotionalCode.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return promos;
}
