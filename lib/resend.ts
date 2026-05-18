import * as postmark from "postmark";

let _client: postmark.ServerClient | null = null;

function getClient(): postmark.ServerClient {
  if (!_client) {
    _client = new postmark.ServerClient(
      process.env.POSTMARK_API_KEY ?? "postmark-placeholder"
    );
  }
  return _client;
}

export async function sendDesignServiceNotification({
  customerEmail,
  themeLabel,
}: {
  customerEmail: string;
  themeLabel: string;
}) {
  const from = process.env.POSTMARK_FROM_EMAIL ?? "noreply@ziva.marketing";
  await getClient().sendEmail({
    From: from,
    To: "hello@ziva.marketing",
    ReplyTo: customerEmail,
    Subject: `New design service order — ${themeLabel} Theme`,
    HtmlBody: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
        <h1 style="font-size: 22px; font-weight: 700; color: #2E2E2E; margin-bottom: 8px;">New design service order</h1>
        <p style="color: #8A7A6A; margin-bottom: 24px;">A customer has purchased the Ziva design service. Details below.</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #F5EEE0; color: #8A7A6A; font-size: 13px; width: 40%;">Customer email</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #F5EEE0; font-weight: 600; color: #2E2E2E; font-size: 13px;">${customerEmail}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #F5EEE0; color: #8A7A6A; font-size: 13px;">Theme</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #F5EEE0; font-weight: 600; color: #2E2E2E; font-size: 13px;">${themeLabel}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #8A7A6A; font-size: 13px;">Amount paid</td>
            <td style="padding: 10px 0; font-weight: 600; color: #FF007E; font-size: 13px;">$2,000</td>
          </tr>
        </table>
        <p style="font-size: 13px; color: #8A7A6A;">Reply to this email to contact the customer directly. Aim to make contact within 48 hours.</p>
        <hr style="border: none; border-top: 1px solid #F5EEE0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #C8B8A4;">The Path · Ziva Marketing internal notification</p>
      </div>
    `,
    MessageStream: "outbound",
  });
}

export async function sendHostingNotification({
  customerEmail,
  funnelId,
}: {
  customerEmail: string;
  funnelId: string;
}) {
  const from = process.env.POSTMARK_FROM_EMAIL ?? "noreply@ziva.marketing";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://template-gen.ziva.marketing";
  await getClient().sendEmail({
    From: from,
    To: "development@ziva.marketing",
    ReplyTo: customerEmail,
    Subject: `New hosting order — Funnel setup request`,
    HtmlBody: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
        <h1 style="font-size: 22px; font-weight: 700; color: #2E2E2E; margin-bottom: 8px;">New funnel hosting order</h1>
        <p style="color: #8A7A6A; margin-bottom: 24px;">A customer has purchased funnel hosting &amp; setup. Contact them within 24 hours.</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #F5EEE0; color: #8A7A6A; font-size: 13px; width: 40%;">Customer email</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #F5EEE0; font-weight: 600; color: #2E2E2E; font-size: 13px;">${customerEmail}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #F5EEE0; color: #8A7A6A; font-size: 13px;">Funnel ID</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #F5EEE0; font-weight: 600; color: #2E2E2E; font-size: 13px;">${funnelId}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #F5EEE0; color: #8A7A6A; font-size: 13px;">Preview link</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #F5EEE0; font-size: 13px;"><a href="${appUrl}/app/preview/${funnelId}" style="color: #FF007E;">${appUrl}/app/preview/${funnelId}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #8A7A6A; font-size: 13px;">Amount paid</td>
            <td style="padding: 10px 0; font-weight: 600; color: #FF007E; font-size: 13px;">$1,499</td>
          </tr>
        </table>
        <p style="font-size: 13px; color: #8A7A6A;">Reply to this email to contact the customer. Collect API keys for Stripe, email platform, webinar tool, and domain credentials.</p>
        <hr style="border: none; border-top: 1px solid #F5EEE0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #C8B8A4;">The Path · Ziva Marketing internal notification</p>
      </div>
    `,
    MessageStream: "outbound",
  });
}

export async function sendVerificationEmail(email: string, code: string) {
  const from = process.env.POSTMARK_FROM_EMAIL ?? "noreply@ziva.marketing";
  await getClient().sendEmail({
    From: from,
    To: email,
    Subject: "Your sign-in code for The Path",
    HtmlBody: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #2E2E2E;">Your sign-in code</h1>
        <p style="color: #8A7A6A; margin-bottom: 32px;">Enter this code to sign in to The Path. It expires in 15 minutes.</p>
        <div style="text-align: center; margin: 32px 0; padding: 24px; background: #FCF8EF; border-radius: 12px;">
          <span style="font-size: 48px; font-weight: 800; letter-spacing: 0.2em; color: #2E2E2E;">${code}</span>
        </div>
        <p style="font-size: 13px; color: #C8B8A4;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #F5EEE0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #C8B8A4;">The Path · by Ziva Marketing</p>
      </div>
    `,
    MessageStream: "outbound",
  });
}
