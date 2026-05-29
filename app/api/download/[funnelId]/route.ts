import { NextRequest, NextResponse } from "next/server";

/** @deprecated Use GET /api/wizard/export/[funnelId] for exact preview parity. */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ funnelId: string }> },
) {
  const { funnelId } = await ctx.params;
  const url = new URL(req.url);
  url.pathname = `/api/wizard/export/${funnelId}`;
  return NextResponse.redirect(url, 307);
}
