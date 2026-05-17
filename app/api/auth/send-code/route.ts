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
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const supabase = await getServiceClient();

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

    // Send email (skip in dev if RESEND_API_KEY not set)
    if (process.env.RESEND_API_KEY) {
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
