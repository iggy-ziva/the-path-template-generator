import { NextRequest, NextResponse } from "next/server";
import { getStripe, PRODUCT_PRICE_CENTS } from "@/lib/stripe";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Also accept form-encoded email for non-JS form fallback
    let customerEmail = session?.email;
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      customerEmail = customerEmail ?? (form.get("email") as string | null) ?? undefined;
    } else if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      customerEmail = customerEmail ?? body.email;
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "The Path Template Generator",
              description: "AI-powered funnel template generator — lifetime access",
            },
            unit_amount: PRODUCT_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      metadata: {
        user_email: customerEmail ?? "",
      },
      success_url: `${baseUrl}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?cancelled=true`,
    });

    return NextResponse.redirect(checkoutSession.url!, { status: 303 });
  } catch (err) {
    console.error("Stripe create-session error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
