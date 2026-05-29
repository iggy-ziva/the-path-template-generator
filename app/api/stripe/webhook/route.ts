import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { sendDesignServiceNotification, sendHostingNotification } from "@/lib/resend";
import Stripe from "stripe";

async function getServiceClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email ?? session.metadata?.user_email;
    const orderType = session.metadata?.order_type;

    if (email && session.payment_status === "paid") {
      if (orderType === "design_service") {
        await sendDesignServiceNotification({
          customerEmail: email,
          themeLabel: session.metadata?.theme_label ?? session.metadata?.theme_slug ?? "Unknown",
        }).catch((err) => console.error("Design service notification error:", err));
      } else if (orderType === "hosting") {
        const funnelId = session.metadata?.funnel_id ?? "";
        await sendHostingNotification({
          customerEmail: email,
          funnelId,
        }).catch((err) => console.error("Hosting notification error:", err));
      } else {
        // Standard template purchase — grant access in Supabase
        const supabase = await getServiceClient();
        await supabase
          .from("users")
          .upsert(
            {
              email: email.toLowerCase(),
              has_paid: true,
              stripe_customer_id: session.customer as string | null,
            },
            { onConflict: "email" }
          );
      }
    }
  }

  return NextResponse.json({ received: true });
}
