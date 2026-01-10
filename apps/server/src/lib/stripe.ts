import { env } from "@tutribu/env/server";
import stripe from "stripe";

export const stripeClient = new stripe(env.STRIPE_API_KEY, {
  apiVersion: "2025-12-15.clover",
});
