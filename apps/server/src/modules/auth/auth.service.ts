import type {
  SignUpInput,
  SignInInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@tutribu/types'
import bcrypt from 'bcryptjs'
import db from '@tutribu/db'
import { status } from 'elysia'
import { stripeClient } from '@/lib/stripe'
import { sendPasswordResetEmail } from '@/lib/mailer'

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}

export function generateRefreshToken() {
  const bytes = new Uint8Array(64)
  crypto.getRandomValues(bytes)
  return Buffer.from(bytes).toString('base64url')
}

export async function hashToken(token: string) {
  const data = new TextEncoder().encode(token)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Buffer.from(hash).toString('hex')
}

const createStripeCustomer = async (
  userDetails: Partial<SignUpInput> & { email: string },
) => {
  const customer = await stripeClient.customers.create({
    name: `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim(),
    email: userDetails.email,
    address: {
      line1: userDetails.address || undefined,
      postal_code: userDetails.zipCode || undefined,
      city: userDetails.city || undefined,
      country: userDetails.country || undefined,
    },
  })
  return customer.id
}

export const saveUser = async (signupinput: SignUpInput) => {
  const isUserExist = await db.user.findUnique({
    where: { email: signupinput.email },
  })

  if (isUserExist) {
    throw status(409, {
      message: 'User with this email already exists',
    })
  }
  const hashedPassword = await hashPassword(signupinput.password)
  const refreshToken = generateRefreshToken()
  const hashedRefreshToken = await hashToken(refreshToken)

  // Separate user data and user info data
  const {
    phoneNumber,
    dateOfBirth,
    country,
    address,
    zipCode,
    city,
    ...userData
  } = signupinput

  const createdUser = await db.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      avatarUrl: userData.avatarUrl || null,
      authProvider: 'PASSWORD',
      userInfos: {
        create: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          country,
          address,
          zipCode,
          city,
          userType: 'SELF',
        },
      },
    },
  })

  // Create Stripe Customer
  const stripeCustomerId = await createStripeCustomer(signupinput)

  // Update user with Stripe Customer ID
  await db.user.update({
    where: { id: createdUser.id },
    data: { customerId: stripeCustomerId },
  })

  await db.refreshToken.create({
    data: {
      tokenHash: hashedRefreshToken,
      userId: createdUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })
  return {
    userId: createdUser.id,
    refreshToken: refreshToken,
  }
}

export const initAdminUser = async () => {
  const adminEmail = 'admin@yopmail.com'
  const adminPassword = 'Admin_2026#'

  const admin = await db.user.findUnique({
    where: { email: adminEmail },
  })

  if (!admin) {
    const hashedPassword = await hashPassword(adminPassword)
    await db.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        authProvider: 'PASSWORD',
        userInfos: {
          create: {
            firstName: 'Admin',
            lastName: 'User',
            userType: 'SELF',
          },
        },
      },
    })
    console.log('Default admin user created: admin@yopmail.com')
  }
}

export const signInUser = async ({ email, password }: SignInInput) => {
  const user = await db.user.findUnique({
    where: { email },
    include: { refreshTokens: true },
  })

  if (!user) {
    throw status(400, {
      message: 'Invalid email or password',
    })
  }

  if (user.isSuspended) {
    throw status(403, {
      message: 'Your account has been suspended. Please contact support.',
    })
  }

  const isPasswordValid = await verifyPassword(password, user.password)
  if (!isPasswordValid) {
    throw status(400, {
      message: 'Invalid email or password',
    })
  }

  const refreshToken = generateRefreshToken()
  const hashedRefreshToken = await hashToken(refreshToken)

  await db.refreshToken.create({
    data: {
      tokenHash: hashedRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })

  return {
    userId: user.id,
    refreshToken,
  }
}

export const googleAuth = async ({ token }: { token: string }) => {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw status(400, { message: 'Invalid Google token' })
  }
  const payload: any = await res.json()
  if (!payload || !payload.email) {
    throw status(400, { message: 'Invalid Google token payload' })
  }

  const { email, given_name, family_name, picture } = payload

  let user = await db.user.findUnique({
    where: { email },
    include: { refreshTokens: true },
  })

  if (user?.isSuspended) {
    throw status(403, {
      message: 'Your account has been suspended. Please contact support.',
    })
  }

  if (!user) {
    const randomPassword = crypto.randomUUID()
    const hashedPassword = await hashPassword(randomPassword)

    const createdUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        avatarUrl: picture || null,
        authProvider: 'GOOGLE',
        userInfos: {
          create: {
            firstName: given_name || '',
            lastName: family_name || '',
            userType: 'SELF',
          },
        },
      },
    })

    const stripeCustomerId = await createStripeCustomer({
      email,
      firstName: given_name || '',
      lastName: family_name || '',
    })

    user = await db.user.update({
      where: { id: createdUser.id },
      data: { customerId: stripeCustomerId },
      include: { refreshTokens: true },
    })
  }

  const refreshToken = generateRefreshToken()
  const hashedRefreshToken = await hashToken(refreshToken)

  await db.refreshToken.create({
    data: {
      tokenHash: hashedRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })

  return {
    userId: user.id,
    refreshToken,
  }
}

export const changePassword = async (
  { currentPassword, newPassword }: ChangePasswordInput,
  userId: string,
) => {
  const userRecord = await db.user.findUnique({
    where: { id: userId },
  })
  const valid = await verifyPassword(currentPassword, userRecord?.password!)
  if (!valid) {
    throw status(400, {
      message: 'Current password is incorrect',
    })
  }

  // 1. update password
  const newHash = await hashPassword(newPassword)

  const user = await db.user.update({
    where: { id: userId },
    data: { password: newHash },
  })

  // 2. revoke ALL existing refresh tokens
  await db.refreshToken.updateMany({
    where: { userId: user.id, revoked: false },
    data: { revoked: true },
  })

  // 3. create new session (current device)
  const rawRefreshToken = generateRefreshToken()
  const hashed = await hashToken(rawRefreshToken)

  await db.refreshToken.create({
    data: {
      tokenHash: hashed,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  return { rawRefreshToken }
}

// Refresh tokens
export const refreshTokens = async (rawRefreshToken: string) => {
  if (!rawRefreshToken) {
    throw status(401, {
      message: 'Unauthorized: No refresh token provided',
    })
  }

  const hashedToken = await hashToken(rawRefreshToken)

  const storedToken = await db.refreshToken.findUnique({
    where: { tokenHash: hashedToken },
  })

  // 1. token not found
  if (!storedToken) {
    throw status(401, {
      message: 'Unauthorized: Invalid refresh token',
    })
  }

  // 2. expired
  if (storedToken.expiresAt < new Date()) {
    throw status(401, {
      message: 'Unauthorized: Refresh token expired',
    })
  }

  // 3. revoked (possible reuse attack)
  if (storedToken.revoked) {
    // ⚠️ token reuse detected — revoke all sessions
    await db.refreshToken.updateMany({
      where: { userId: storedToken.userId },
      data: { revoked: true },
    })

    throw status(401, {
      message: 'Unauthorized: Refresh token revoked',
    })
  }

  // 4. rotate token
  const newRawToken = generateRefreshToken()
  const newHashedToken = await hashToken(newRawToken)

  const newToken = await db.refreshToken.create({
    data: {
      tokenHash: newHashedToken,
      userId: storedToken.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  // 5. revoke old token
  await db.refreshToken.update({
    where: { id: storedToken.id },
    data: {
      revoked: true,
      replacedByTokenId: newToken.id,
    },
  })

  // 6. return minimal data to route
  return {
    userId: storedToken.userId,
    newRawToken, // RAW (to be set in cookie)
  }
}

export const getUser = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      userInfos: true,
    },
  })

  if (!user) {
    throw status(404, { message: 'User not found' })
  }

  const { userInfos, ...userFields } = user
  const userInfo = userInfos?.[0] || {}

  return {
    ...userFields,
    ...userInfo,
  }
}

/**
 * Logout helper
 *
 * - If a raw refresh token is provided, hash it and revoke that refresh token.
 * - If `options.allDevices` is true, revoke all non-revoked refresh tokens for the user.
 * - The function is idempotent: if the token is missing or not found, it returns a result
 *   indicating nothing was revoked but does not throw (so logout can clear cookies client-side).
 */
export const logout = async (
  rawRefreshToken?: string,
  options?: { allDevices?: boolean },
) => {
  // If no raw token is provided, nothing to revoke server-side.
  if (!rawRefreshToken) {
    return { revoked: false, message: 'No refresh token provided' }
  }

  const hashed = await hashToken(rawRefreshToken)

  const storedToken = await db.refreshToken.findUnique({
    where: { tokenHash: hashed },
  })

  // If token not found, treat as idempotent success (nothing to revoke).
  if (!storedToken) {
    return { revoked: false, message: 'Refresh token not found' }
  }

  // Revoke all tokens for this user if requested
  if (options?.allDevices) {
    await db.refreshToken.updateMany({
      where: { userId: storedToken.userId, revoked: false },
      data: { revoked: true },
    })

    return { revoked: true, allDevices: true, userId: storedToken.userId }
  }

  // Revoke only the provided token
  await db.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  })

  return { revoked: true, allDevices: false, userId: storedToken.userId }
}

export async function uploadUserAvatar(userId: string, file: File) {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw status(404, { message: 'User not found' })
  }

  const extension = file.name.split('.').pop()
  const filename = `avatar-${userId}-${Date.now()}.${extension}`
  const path = `public/upload/${filename}`
  const url = `/public/upload/${filename}`

  await Bun.write(path, file)

  // Default clean up old file if exists
  if (user.avatarUrl && user.avatarUrl.startsWith('/public/upload/')) {
    const oldPath = user.avatarUrl.replace(/^\//, '')
    const fileFile = Bun.file(oldPath)
    if (await fileFile.exists()) {
      import('node:fs').then((fs) => fs.promises.unlink(oldPath))
    }
  }

  await db.user.update({
    where: { id: userId },
    data: { avatarUrl: url },
  })

  return url
}

export async function deleteUserAvatar(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw status(404, { message: 'User not found' })
  }

  if (user.avatarUrl && user.avatarUrl.startsWith('/public/upload/')) {
    const oldPath = user.avatarUrl.replace(/^\//, '')
    const fileFile = Bun.file(oldPath)
    if (await fileFile.exists()) {
      import('node:fs').then((fs) => fs.promises.unlink(oldPath))
    }
  }

  await db.user.update({
    where: { id: userId },
    data: { avatarUrl: null },
  })
}

export async function deleteAccount(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw status(404, { message: 'User not found' })
  }

  // 1. Clean up avatar file if exists
  if (user.avatarUrl && user.avatarUrl.startsWith('/public/upload/')) {
    const oldPath = user.avatarUrl.replace(/^\//, '')
    const fileFile = Bun.file(oldPath)
    if (await fileFile.exists()) {
      import('node:fs').then((fs) =>
        fs.promises.unlink(oldPath).catch(() => {}),
      )
    }
  }

  // 2. Delete Stripe Customer records
  if (user.customerId) {
    try {
      await stripeClient.customers.del(user.customerId)
    } catch (e) {
      console.error('Failed to delete Stripe customer', e)
    }
  }

  // 3. Delete all database records inside a transaction
  await db.$transaction(async (tx) => {
    // Find associated UserInfo ids to cascade Bookings manually if needed
    const userInfos = await tx.userInfo.findMany({ where: { userId } })
    const userInfoIds = userInfos.map((u) => u.id)

    // Delete bookings linked to these UserInfo records
    if (userInfoIds.length > 0) {
      await tx.booking.deleteMany({
        where: { userInfoId: { in: userInfoIds } },
      })
    }

    // Now delete the dependent UserInfos
    await tx.userInfo.deleteMany({ where: { userId } })

    // Delete refresh tokens
    await tx.refreshToken.deleteMany({ where: { userId } })

    // Finally, wipe the user record
    await tx.user.delete({ where: { id: userId } })
  })
}

export async function forgotPassword({ email }: ForgotPasswordInput) {
  const user = await db.user.findUnique({
    where: { email },
    include: { userInfos: { where: { userType: 'SELF' } } },
  })

  if (!user) {
    throw status(404, { message: 'User with this email not found' })
  }

  const token = crypto.randomUUID()
  const hashedToken = await hashToken(token)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  await db.passwordResetToken.create({
    data: {
      tokenHash: hashedToken,
      userId: user.id,
      expiresAt,
    },
  })

  // BETTER_AUTH_URL is the frontend URL
  const resetLink = `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`
  await sendPasswordResetEmail(
    user.email,
    user.userInfos[0]?.firstName || 'User',
    resetLink,
  )

  return { message: 'Password reset link sent to your email' }
}

export async function resetPassword({
  token,
  password,
}: Omit<ResetPasswordInput, 'confirmPassword'>) {
  const hashedToken = await hashToken(token)

  const resetToken = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashedToken },
    include: { user: true },
  })

  if (!resetToken) {
    throw status(400, { message: 'Invalid or expired reset token' })
  }

  if (resetToken.expiresAt < new Date()) {
    await db.passwordResetToken.delete({ where: { id: resetToken.id } })
    throw status(400, { message: 'Reset token has expired' })
  }

  const hashedPassword = await hashPassword(password)

  await db.$transaction(async (tx) => {
    // 1. Update password
    await tx.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    })

    // 2. Revoke all refresh tokens
    await tx.refreshToken.updateMany({
      where: { userId: resetToken.userId, revoked: false },
      data: { revoked: true },
    })

    // 3. Delete the reset token
    await tx.passwordResetToken.delete({
      where: { id: resetToken.id },
    })
  })

  return { message: 'Password reset successfully' }
}

export const listUsers = async () => {
  return await db.user.findMany({
    include: {
      userInfos: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export const toggleUserSuspension = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw status(404, { message: 'User not found' })
  }

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      isSuspended: !user.isSuspended,
    },
  })

  // If suspending, optionally revoke all refresh tokens
  if (updatedUser.isSuspended) {
    await db.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revoked: true },
    })
  }

  return updatedUser
}
