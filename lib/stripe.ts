import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiVersion: "2025-04-30.basil" as any,
    });
  }
  return _stripe;
}

export const PRODUCT_PRICE_CENTS = 37900; // $379.00
