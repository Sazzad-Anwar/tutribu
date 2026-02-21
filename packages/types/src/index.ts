import z from 'zod'

export const BaseSignUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Invalid email address'),
  gender: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().optional(),
  dateOfBirth: z.iso.date().optional(),
  phoneNumber: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  city: z.string().optional(),
  avatarUrl: z.url('Invalid URL format').optional(),
})

export const BookingSignUpSchema = BaseSignUpSchema.omit({
  password: true,
  confirmPassword: true,
})

export const SignUpSchema = BaseSignUpSchema.superRefine(
  ({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['password'],
      })
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  },
)

export const UserSchema = BaseSignUpSchema.extend({
  id: z.cuid(),
  authProvider: z.enum(['PASSWORD', 'GOOGLE']).default('PASSWORD'),
}).omit({ password: true })
export const SignInSchema = BaseSignUpSchema.pick({
  email: true,
  password: true,
})
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters long'),
})

export const ExtraFeatureSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
})

export const BookingSchema = z.object({
  userInfoId: z.cuid(),
  specialRequest: z.string().optional(),
  promotionalCode: z.string().optional(),
  bookingStatus: z
    .enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
    .default('PENDING'),
  paymentStatus: z
    .enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])
    .default('PENDING'),
  paymentPlan: z
    .enum(['THREE_MONTH', 'SIX_MONTH', 'ONE_TIME', 'LOWEST_DEPOSIT'])
    .default('ONE_TIME'),
  groupId: z.string(),
  checkingType: z.enum(['SELF', 'GUEST']).default('SELF'),
  paymentMethodId: z.string().min(1),
  // extraFeatures: z.array(ExtraFeatureSchema).optional(),
})

/**
 * Request schemas
 */
export const CreateBookingSchema = BookingSchema.extend({
  // ensure callers pass a total amount (service expects it)
  totalAmount: z.number().min(0),
})

export const ApplyPromoSchema = z.object({
  code: z.string().min(1),
})

export const UpdateStatusSchema = z.object({
  bookingStatus: z
    .enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
    .optional(),
  paymentStatus: z
    .enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])
    .optional(),
})

export type SignUpInput = z.infer<typeof SignUpSchema>
export type BookingSignUpInput = z.infer<typeof BookingSignUpSchema>
export type User = z.infer<typeof UserSchema>
export type SignInInput = z.infer<typeof SignInSchema>
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
export type Booking = z.infer<typeof BookingSchema>
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>
export type ApplyPromoInput = z.infer<typeof ApplyPromoSchema>
export type ExtraFeatureInput = z.infer<typeof ExtraFeatureSchema>
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>

export const CreatePromotionalCodeSchema = z.object({
  code: z
    .string()
    .min(1)
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric'),
  discount: z.number().min(0),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
})

export const UpdatePromotionalCodeSchema = CreatePromotionalCodeSchema.partial()

export const PromotionalCodeSchema = CreatePromotionalCodeSchema.extend({
  id: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type CreatePromotionalCodeInput = z.infer<
  typeof CreatePromotionalCodeSchema
>
export type UpdatePromotionalCodeInput = z.infer<
  typeof UpdatePromotionalCodeSchema
>
export type PromotionalCode = z.infer<typeof PromotionalCodeSchema>

export const UserInfoSchema = z.object({
  id: z.cuid(),
  phoneNumber: z.string().optional().nullable(),
  dateOfBirth: z.iso.date().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  userType: z.enum(['SELF', 'GUEST']).default('SELF'),
  userId: z.string().cuid().optional().nullable(),
})

export const CreateUserInfoSchema = UserInfoSchema.omit({
  id: true,
  userId: true,
})
export const UpdateUserInfoSchema = CreateUserInfoSchema.partial()

export type UserInfo = z.infer<typeof UserInfoSchema>
export type CreateUserInfoInput = z.infer<typeof CreateUserInfoSchema>
export type UpdateUserInfoInput = z.infer<typeof UpdateUserInfoSchema>
