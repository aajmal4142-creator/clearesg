import { NextResponse } from "next/server";

/**
 * Vercel cron → benchmarks recompute.
 * Protect with CRON_SECRET Authorization: Bearer …
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const origin = new URL(req.url).origin;
  const res = await fetch(`${origin}/api/app/benchmarks/recompute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-clearesg-cron": "1",
    },
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
