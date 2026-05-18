import { NextRequest, NextResponse } from "next/server";
import { generateOTP } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/resend";

// Use service client (bypasses RLS) for write operations
async function getServiceClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email address required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = await getServiceClient();

    // Gate: only allow sign-in if a paid purchase exists for this email
    const { data: existingUser } = await supabase
      .from("users")
      .select("has_paid")
      .eq("email", normalizedEmail)
      .single();

    if (!existingUser || !existingUser.has_paid) {
      return NextResponse.json(
        { error: "no_purchase", message: "No purchase found for this email address." },
        { status: 403 }
      );
    }

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Invalidate any existing codes for this email
    await supabase
      .from("verification_codes")
      .update({ used: true })
      .eq("email", normalizedEmail)
      .eq("used", false);

    // Insert new code
    const { error } = await supabase.from("verification_codes").insert({
      email: normalizedEmail,
      code,
      expires_at: expiresAt,
      used: false,
    });

    if (error) throw error;

    // Send email (skip in dev if POSTMARK_API_KEY not set)
    if (process.env.POSTMARK_API_KEY) {
      await sendVerificationEmail(normalizedEmail, code);
    } else {
      console.log(`[DEV] Verification code for ${normalizedEmail}: ${code}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send-code error:", err);
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
  }
}
