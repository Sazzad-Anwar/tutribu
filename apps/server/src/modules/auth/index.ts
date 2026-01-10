import Elysia from "elysia";
import { ChangePasswordSchema, SignUpSchema } from "@tutribu/types";
import jwt from "@elysiajs/jwt";
import { env } from "@tutribu/env/server";
import {
  changePassword,
  getUser,
  refreshTokens,
  saveUser,
  signInUser,
  logout,
} from "./auth.service";
import z from "zod";

export const AuthModule: any = new Elysia({ prefix: "/api/auth" })
  .use(
    jwt({
      secret: env.JWT_SECRET,
      exp: "15m",
    }),
  )
  .post(
    "/signup",
    async ({
      jwt,
      body,
      cookie: { accessToken, refreshToken },
      set,
      status,
    }) => {
      const user = await saveUser(body);
      const token = await jwt.sign({ userId: user.userId });

      accessToken?.set({
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60,
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
      });

      refreshToken?.set({
        value: user.refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
      });
      set.headers["content-type"] = "application/json";

      return status(201, {
        accessToken: token,
      });
    },
    {
      body: SignUpSchema,
      response: {
        201: z.object({
          accessToken: z.jwt(),
        }),
        409: z.object({
          message: z.string().default("User with this email already exists"),
        }),
      },
      detail: {
        summary: "Sign Up",
        description: "User sign-up endpoint",
        tags: ["Auth"],
      },
    },
  )
  .post(
    "/sign-in",
    async ({ jwt, body, cookie: { accessToken, refreshToken }, set }) => {
      const user = await signInUser(body);
      const token = await jwt.sign({ userId: user.userId });

      accessToken?.set({
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60,
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
      });

      refreshToken?.set({
        value: user.refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
      });
      set.headers["content-type"] = "application/json";
      return {
        accessToken: token,
      };
    },
    {
      body: SignUpSchema.pick({ email: true, password: true }),
      response: {
        200: z.object({
          accessToken: z.jwt(),
        }),
        400: z.object({
          message: z.string().default("Invalid email or password"),
        }),
      },
      detail: {
        summary: "Sign In",
        description: "User sign-in endpoint",
        tags: ["Auth"],
      },
    },
  )
  .post(
    "/change-password",
    async ({
      jwt,
      body,
      cookie: { accessToken, refreshToken },
      headers: { authorization },
      status,
      set,
    }) => {
      const token: string | undefined =
        typeof authorization === "string"
          ? authorization
          : typeof accessToken?.value === "string"
            ? accessToken.value
            : undefined;
      const jwtUser = await jwt.verify(token);
      if (!jwtUser) {
        set.headers["content-type"] = "application/json";
        return status(401, {
          message: "Unauthorized",
        });
      }
      const newAccessToken = await jwt.sign({ userId: jwtUser.userId });
      const { rawRefreshToken } = await changePassword(
        body,
        jwtUser.userId as string,
      );

      accessToken?.set({
        value: newAccessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60,
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
      });

      refreshToken?.set({
        value: rawRefreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      set.headers["content-type"] = "application/json";
      return { message: "Password updated", accessToken: newAccessToken };
    },
    {
      body: ChangePasswordSchema,
      response: {
        200: z.object({
          message: z.string(),
          accessToken: z.string(),
        }),
        401: z.object({
          message: z.string().default("Unauthorized"),
        }),
        400: z.object({
          message: z.string().default("Current password is incorrect"),
        }),
      },
      detail: {
        summary: "Change Password",
        description: "User change password endpoint",
        tags: ["Auth"],
      },
    },
  )
  .post(
    "/refresh-tokens",
    async ({ cookie: { refreshToken, accessToken }, status, jwt, set }) => {
      if (!refreshToken?.value) {
        return status(401, {
          message: "Unauthorized: No refresh token provided",
        });
      }
      const { userId, newRawToken } = await refreshTokens(
        refreshToken?.value as string,
      );
      const newAccessToken = await jwt.sign({ userId });

      accessToken?.set({
        value: newAccessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60,
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
      });

      refreshToken?.set({
        value: newRawToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      set.headers["content-type"] = "application/json";
      return { accessToken: newAccessToken };
    },
    {
      cookie: z.object({
        refreshToken: z
          .object({
            value: z.string().optional(),
          })
          .optional(),
        accessToken: z
          .object({
            value: z.string().optional(),
          })
          .optional(),
      }),
      response: {
        200: z.object({
          accessToken: z.jwt(),
        }),
        401: z.object({
          message: z.string().default("Unauthorized: Invalid refresh token"),
        }),
      },
      detail: {
        summary: "Refresh Tokens",
        description: "Generate new access and refresh tokens",
        tags: ["Auth"],
      },
    },
  )
  .post(
    "/logout",
    async ({ cookie: { accessToken, refreshToken }, body, set, status }) => {
      // Prefer the refresh token cookie; allow body.refreshToken as fallback.
      const rawRefreshToken: string | undefined =
        typeof refreshToken?.value === "string"
          ? refreshToken.value
          : body && typeof (body as any).refreshToken === "string"
            ? (body as any).refreshToken
            : undefined;
      const allDevices = !!(body && (body as any).allDevices);

      // Revoke token(s) server-side (idempotent)
      await logout(rawRefreshToken, { allDevices });

      // Clear cookies client-side
      accessToken?.set({
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
      });

      refreshToken?.set({
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });

      set.headers["content-type"] = "application/json";
      return status(200, { message: "Logged out" });
    },
    {
      body: z
        .object({
          allDevices: z.boolean().optional(),
        })
        .optional(),
      response: {
        200: z.object({ message: z.string() }),
      },
      detail: {
        summary: "Logout",
        description:
          "Logs out the current session (and optionally all devices)",
        tags: ["Auth"],
      },
    },
  )
  .get(
    "/me",
    async ({
      jwt,
      cookie: { accessToken },
      headers: { authorization },
      status,
    }) => {
      const token: string | undefined =
        typeof authorization === "string"
          ? authorization
          : typeof accessToken?.value === "string"
            ? accessToken.value
            : undefined;
      const user = await jwt.verify(token);
      if (!user) {
        return status(401, { message: "Unauthorized" });
      }
      return await getUser(user?.userId as string);
    },
    {
      response: {
        401: z.object({
          message: z.string().default("Unauthorized"),
        }),
      },
      detail: {
        summary: "Get User Info",
        description: "Retrieve information about the authenticated user",
        tags: ["Auth"],
      },
    },
  );
