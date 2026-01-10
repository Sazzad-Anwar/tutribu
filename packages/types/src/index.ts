import z from "zod";

export const SignUpSchema = z.object({
  firstName: z.string().min(1, "First name is required").default("John"),
  lastName: z.string().min(1, "Last name is required").default("smith"),
  email: z.email("Invalid email address").default("johnsmith@yopmail.com"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .default("$up3r53cr3t"),
  dateOfBirth: z.iso.date().optional().default("2000-01-01"),
  phoneNumber: z.string().optional().default("123-456-7890"),
  country: z.string().optional().default("USA"),
  address: z.string().optional().default("123 Main St"),
  zipCode: z.string().optional().default("12345"),
  city: z.string().optional().default("Anytown"),
  avatarUrl: z
    .url("Invalid URL format")
    .optional()
    .default("https://example.com/profile.jpg"),
});

export const UserSchema = SignUpSchema.extend({
  id: z.uuid(),
  authProvider: z.enum(["PASSWORD", "GOOGLE"]).default("PASSWORD"),
}).omit({ password: true });
export const SignInSchema = SignUpSchema.pick({ email: true, password: true });
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters long"),
});

export const ExtraFeatureSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
});

export const BookingSchema = z.object({
  userId: z.cuid(),
  specialRequest: z.string().optional(),
  hasOwnRoom: z.boolean().default(false),
  joinWhatsAppGroup: z.boolean().default(false),
  promotionalCode: z.cuid().optional(),
  status: z
    .enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"])
    .default("PENDING"),
  paymentPlan: z
    .enum(["THREE_MONTH", "SIX_MONTH", "ONE_TIME"])
    .default("ONE_TIME"),
  groupId: z.string(),
  checkingType: z.enum(["SELF", "GUEST"]).default("SELF"),
  cardDetails: z.object({
    number: z.string().min(12).max(19),
    exp_month: z.number().min(1).max(12),
    exp_year: z.number().min(new Date().getFullYear()),
    cvc: z.string().min(3).max(4),
  }),
  extraFeatures: z.array(ExtraFeatureSchema).optional(),
});

/**
 * Request schemas
 */
export const CreateBookingSchema = BookingSchema.extend({
  // ensure callers pass a total amount (service expects it)
  totalAmount: z.number().min(0),
});

export const ApplyPromoSchema = z.object({
  code: z.string().min(1),
});

export const UpdateStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type User = z.infer<typeof UserSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type ApplyPromoInput = z.infer<typeof ApplyPromoSchema>;
export type ExtraFeatureInput = z.infer<typeof ExtraFeatureSchema>;
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>;
