import z from 'zod'

const BaseSignUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Invalid email address'),
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
  id: z.uuid(),
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
  userId: z.cuid(),
  specialRequest: z.string().optional(),
  hasOwnRoom: z.boolean().default(false),
  joinWhatsAppGroup: z.boolean().default(false),
  promotionalCode: z.cuid().optional(),
  status: z
    .enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
    .default('PENDING'),
  paymentPlan: z
    .enum(['THREE_MONTH', 'SIX_MONTH', 'ONE_TIME'])
    .default('ONE_TIME'),
  groupId: z.string(),
  checkingType: z.enum(['SELF', 'GUEST']).default('SELF'),
  cardDetails: z.object({
    number: z.string().min(12).max(19),
    exp_month: z.number().min(1).max(12),
    exp_year: z.number().min(new Date().getFullYear()),
    cvc: z.string().min(3).max(4),
  }),
  extraFeatures: z.array(ExtraFeatureSchema).optional(),
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
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
})

export type SignUpInput = z.infer<typeof SignUpSchema>
export type User = z.infer<typeof UserSchema>
export type SignInInput = z.infer<typeof SignInSchema>
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
export type Booking = z.infer<typeof BookingSchema>
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>
export type ApplyPromoInput = z.infer<typeof ApplyPromoSchema>
export type ExtraFeatureInput = z.infer<typeof ExtraFeatureSchema>
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>
