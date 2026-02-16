import db from '@tutribu/db'
import type { CreateUserInfoInput, UpdateUserInfoInput } from '@tutribu/types'
import { status } from 'elysia'

/**
 * UserInfo service functions
 *
 * These functions handle profile/userInfo data CRUD.
 * Access is restricted by userId where applicable to ensure privacy.
 */

/**
 * Get a specific UserInfo record by ID.
 * Optional ownerId provides an ownership check.
 */
export async function getUserInfo(id: string, userId?: string) {
  const userInfo = await db.userInfo.findUnique({
    where: { id },
  })

  if (!userInfo) {
    throw status(404, { message: 'UserInfo not found' })
  }

  if (userId && userInfo.userId !== userId) {
    throw status(403, { message: 'Forbidden' })
  }

  return userInfo
}

/**
 * List all UserInfo records belonging to a user.
 */
export async function listUserInfoForUser(userId: string) {
  return await db.userInfo.findMany({
    where: { userId },
  })
}

/**
 * Create a new UserInfo record for a user.
 */
export async function createUserInfo(
  userId: string,
  data: CreateUserInfoInput,
) {
  return await db.userInfo.create({
    data: {
      ...data,
      userId,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    },
  })
}

/**
 * Update an existing UserInfo record.
 * Enforces ownership by verifying userId.
 */
export async function updateUserInfo(
  id: string,
  userId: string,
  data: UpdateUserInfoInput,
) {
  // Ensure ownership
  await getUserInfo(id, userId)

  return await db.userInfo.update({
    where: { id },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    },
  })
}

/**
 * Delete a UserInfo record.
 * Enforces ownership by verifying userId.
 */
export async function deleteUserInfo(id: string, userId: string) {
  // Ensure ownership
  await getUserInfo(id, userId)

  return await db.userInfo.delete({
    where: { id },
  })
}
