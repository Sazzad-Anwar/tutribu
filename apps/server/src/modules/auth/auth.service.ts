// crypto.ts
import type {
  SignUpInput,
  SignInInput,
  ChangePasswordInput,
} from "@tutribu/types";
import bcrypt from "bcryptjs";
import db from "@tutribu/db";
import { status } from "elysia";
import { stripeClient } from "@/lib/stripe";

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export function generateRefreshToken() {
  const bytes = new Uint8Array(64);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}

export async function hashToken(token: string) {
  const data = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hash).toString("hex");
}

const createStripeCustomer = async (userDetails: SignUpInput) => {
  const customer = await stripeClient.customers.create({
    name: `${userDetails.firstName} ${userDetails.lastName}`,
    email: userDetails.email,
    address: {
      line1: userDetails.address,
      postal_code: userDetails.zipCode,
      city: userDetails.city,
      country: userDetails.country,
    },
  });
  return customer.id;
};

export const saveUser = async (signupinput: SignUpInput) => {
  const isUserExist = await db.user.findUnique({
    where: { email: signupinput.email },
  });

  if (isUserExist) {
    throw status(409, {
      message: "User with this email already exists",
    });
  }
  const hashedPassword = await hashPassword(signupinput.password);
  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = await hashToken(refreshToken);

  // Here you would save the user to your database
  const user = {
    ...signupinput,
    password: hashedPassword,
  };

  const createdUser = await db.user.create({
    data: {
      ...user,
      dateOfBirth: new Date(user.dateOfBirth).toISOString(),
    },
  });

  // Create Stripe Customer
  const stripeCustomerId = await createStripeCustomer(signupinput);

  // Update user with Stripe Customer ID
  await db.user.update({
    where: { id: createdUser.id },
    data: { customerId: stripeCustomerId },
  });

  await db.refreshToken.create({
    data: {
      tokenHash: hashedRefreshToken,
      userId: createdUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });
  return {
    userId: createdUser.id,
    refreshToken: refreshToken,
  };
};

export const signInUser = async ({ email, password }: SignInInput) => {
  const user = await db.user.findUnique({
    where: { email },
    include: { refreshTokens: true },
  });

  if (!user) {
    throw status(400, {
      message: "Invalid email or password",
    });
  }

  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw status(400, {
      message: "Invalid email or password",
    });
  }

  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = await hashToken(refreshToken);

  await db.refreshToken.create({
    data: {
      tokenHash: hashedRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return {
    userId: user.id,
    refreshToken,
  };
};

export const changePassword = async (
  { currentPassword, newPassword }: ChangePasswordInput,
  userId: string,
) => {
  const userRecord = await db.user.findUnique({
    where: { id: userId },
  });
  const valid = await verifyPassword(currentPassword, userRecord?.password!);
  if (!valid) {
    throw status(400, {
      message: "Current password is incorrect",
    });
  }

  // 1. update password
  const newHash = await hashPassword(newPassword);

  const user = await db.user.update({
    where: { id: userId },
    data: { password: newHash },
  });

  // 2. revoke ALL existing refresh tokens
  await db.refreshToken.updateMany({
    where: { userId: user.id, revoked: false },
    data: { revoked: true },
  });

  // 3. create new session (current device)
  const rawRefreshToken = generateRefreshToken();
  const hashed = await hashToken(rawRefreshToken);

  await db.refreshToken.create({
    data: {
      tokenHash: hashed,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { rawRefreshToken };
};

// Refresh tokens
export const refreshTokens = async (rawRefreshToken: string) => {
  if (!rawRefreshToken) {
    throw status(401, {
      message: "Unauthorized: No refresh token provided",
    });
  }

  const hashedToken = await hashToken(rawRefreshToken);

  const storedToken = await db.refreshToken.findUnique({
    where: { tokenHash: hashedToken },
  });

  // 1. token not found
  if (!storedToken) {
    throw status(401, {
      message: "Unauthorized: Invalid refresh token",
    });
  }

  // 2. expired
  if (storedToken.expiresAt < new Date()) {
    throw status(401, {
      message: "Unauthorized: Refresh token expired",
    });
  }

  // 3. revoked (possible reuse attack)
  if (storedToken.revoked) {
    // ⚠️ token reuse detected — revoke all sessions
    await db.refreshToken.updateMany({
      where: { userId: storedToken.userId },
      data: { revoked: true },
    });

    throw status(401, {
      message: "Unauthorized: Refresh token revoked",
    });
  }

  // 4. rotate token
  const newRawToken = generateRefreshToken();
  const newHashedToken = await hashToken(newRawToken);

  const newToken = await db.refreshToken.create({
    data: {
      tokenHash: newHashedToken,
      userId: storedToken.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // 5. revoke old token
  await db.refreshToken.update({
    where: { id: storedToken.id },
    data: {
      revoked: true,
      replacedByTokenId: newToken.id,
    },
  });

  // 6. return minimal data to route
  return {
    userId: storedToken.userId,
    newRawToken, // RAW (to be set in cookie)
  };
};

export const getUser = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      dateOfBirth: true,
      country: true,
      address: true,
      zipCode: true,
      city: true,
      createdAt: true,
      updatedAt: true,
      authProvider: true,
      customerId: true,
    },
  });

  return user!;
};

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
    return { revoked: false, message: "No refresh token provided" };
  }

  const hashed = await hashToken(rawRefreshToken);

  const storedToken = await db.refreshToken.findUnique({
    where: { tokenHash: hashed },
  });

  // If token not found, treat as idempotent success (nothing to revoke).
  if (!storedToken) {
    return { revoked: false, message: "Refresh token not found" };
  }

  // Revoke all tokens for this user if requested
  if (options?.allDevices) {
    await db.refreshToken.updateMany({
      where: { userId: storedToken.userId, revoked: false },
      data: { revoked: true },
    });

    return { revoked: true, allDevices: true, userId: storedToken.userId };
  }

  // Revoke only the provided token
  await db.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  return { revoked: true, allDevices: false, userId: storedToken.userId };
};
