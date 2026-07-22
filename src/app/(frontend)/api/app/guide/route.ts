import { getPayload } from "payload";
import { NextResponse } from "next/server";

import { getCurrentContext } from "@/lib/auth";
import config from "@/payload.config";

const STEP_IDS = ["sector", "baseline", "top3", "supplier", "publish"] as const;

/** Org-scoped first-report checklist — no localStorage. */
export async function GET() {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg) {
    return NextResponse.json(
      { error: "No active organisation. Finish onboarding or switch organisation." },
      { status: 403 },
    );
  }
  const payload = await getPayload({ config });
  const org = await payload.findByID({
    collection: "organisations",
    id: ctx.activeOrg.id,
    depth: 0,
    overrideAccess: true,
  });
  const raw = org.guideProgress;
  const done: Record<string, boolean> =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, boolean>)
      : {};
  return NextResponse.json({ done });
}

export async function PUT(req: Request) {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg || !ctx.role) {
    return NextResponse.json(
      { error: "No active organisation. Finish onboarding or switch organisation." },
      { status: 403 },
    );
  }
  if (ctx.role === "viewer") {
    return NextResponse.json(
      { error: "Viewers cannot update the guide checklist" },
      { status: 403 },
    );
  }

  const body = (await req.json()) as { done?: Record<string, boolean> };
  const next: Record<string, boolean> = {};
  for (const id of STEP_IDS) {
    next[id] = Boolean(body.done?.[id]);
  }

  const payload = await getPayload({ config });
  await payload.update({
    collection: "organisations",
    id: ctx.activeOrg.id,
    data: { guideProgress: next },
    overrideAccess: true,
  });

  return NextResponse.json({ ok: true, done: next });
}
