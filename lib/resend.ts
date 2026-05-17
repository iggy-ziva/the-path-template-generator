import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
  }
  return _resend;
}

export async function sendVerificationEmail(email: string, code: string) {
  const from = process.env.RESEND_FROM_EMAIL ?? "noreply@thepath.com";
  await getResend().emails.send({
    from,
    to: email,
    subject: "Your sign-in code for The Path",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #0f0e0c;">Your sign-in code</h1>
        <p style="color: #666; margin-bottom: 32px;">Enter this code to sign in to The Path. It expires in 15 minutes.</p>
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 48px; font-weight: 800; letter-spacing: 0.2em; color: #0f0e0c;">${code}</span>
        </div>
        <p style="font-size: 13px; color: #999;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
