import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSession } from "@/lib/session";

const DESIGN_SERVICE_PRICE_CENTS = 200000; // $2,000

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const contentType = req.headers.get("content-type") ?? "";
    let themeSlug = "";
    let themeLabel = "";
    let customerEmail = session?.email;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      themeSlug = (form.get("theme_slug") as string) ?? "";
      themeLabel = (form.get("theme_label") as string) ?? themeSlug;
      customerEmail = customerEmail ?? (form.get("email") as string | null) ?? undefined;
    } else if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      themeSlug = body.theme_slug ?? "";
      themeLabel = body.theme_label ?? themeSlug;
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
              name: `Ziva Design Service — ${themeLabel || themeSlug} Theme`,
              description:
                "Complete Figma file customisation: brand colours, fonts, copy & images. Production-ready to hand to a developer. Hosting and technical setup not included.",
            },
            unit_amount: DESIGN_SERVICE_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      metadata: {
        order_type: "design_service",
        user_email: customerEmail ?? "",
        theme_slug: themeSlug,
        theme_label: themeLabel || themeSlug,
      },
      success_url: `${baseUrl}/design-service/thank-you?theme=${encodeURIComponent(themeLabel || themeSlug)}`,
      cancel_url: `${baseUrl}/themes/${themeSlug}`,
    });

    return NextResponse.redirect(checkoutSession.url!, { status: 303 });
  } catch (err) {
    console.error("Design service checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
