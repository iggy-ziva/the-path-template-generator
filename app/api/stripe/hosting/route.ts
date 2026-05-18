import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSession } from "@/lib/session";

const HOSTING_PRICE_CENTS = 149900; // $1,499

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const body = await req.json().catch(() => ({}));
    const funnelId: string = body.funnelId ?? "";
    const customerEmail = session?.email ?? body.email;

    const checkoutSession = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Ziva Funnel Hosting & Setup",
              description:
                "Full technical setup of your AI-generated funnel: domain connection, payment processor, email integrations and platform configuration. We contact you within 24 hours to collect API keys.",
            },
            unit_amount: HOSTING_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      metadata: {
        order_type: "hosting",
        user_email: customerEmail ?? "",
        funnel_id: funnelId,
      },
      success_url: `${baseUrl}/hosting/thank-you`,
      cancel_url: `${baseUrl}/app/preview/${funnelId}`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Hosting checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
