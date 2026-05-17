import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";

async function getServiceClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = await getServiceClient();

    // Find a valid, unused code
    const { data: record, error: fetchError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !record) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    // Mark code as used
    await supabase.from("verification_codes").update({ used: true }).eq("id", record.id);

    // Upsert user
    const { data: user, error: userError } = await supabase
      .from("users")
      .upsert({ email: normalizedEmail }, { onConflict: "email" })
      .select("id, email, has_paid")
      .single();

    if (userError || !user) throw userError ?? new Error("User upsert failed");

    // Create session cookie
    await createSession({
      userId: user.id,
      email: user.email,
      hasPaid: user.has_paid,
    });

    return NextResponse.json({ success: true, hasPaid: user.has_paid });
  } catch (err) {
    console.error("verify-code error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
