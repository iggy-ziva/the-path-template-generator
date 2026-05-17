import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSession, createSession } from "@/lib/session";

async function getServiceClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) return NextResponse.redirect(`${baseUrl}/pricing`);

    const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);
    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.redirect(`${baseUrl}/pricing?payment_failed=true`);
    }

    const email = checkoutSession.customer_email ?? checkoutSession.metadata?.user_email;
    if (!email) return NextResponse.redirect(`${baseUrl}/pricing`);

    const supabase = await getServiceClient();

    // Upsert user and mark as paid
    const { data: user } = await supabase
      .from("users")
      .upsert(
        {
          email: email.toLowerCase(),
          has_paid: true,
          stripe_customer_id: checkoutSession.customer as string | null,
        },
        { onConflict: "email" }
      )
      .select("id, email, has_paid")
      .single();

    if (user) {
      // Refresh session with has_paid = true
      const currentSession = await getSession();
      if (currentSession && currentSession.email === email.toLowerCase()) {
        await createSession({ ...currentSession, hasPaid: true });
      } else {
        // Create a new session for the email
        await createSession({ userId: user.id, email: user.email, hasPaid: true });
      }
    }

    return NextResponse.redirect(`${baseUrl}/app/wizard`);
  } catch (err) {
    console.error("Stripe success handler error:", err);
    return NextResponse.redirect(`${baseUrl}/pricing`);
  }
}
