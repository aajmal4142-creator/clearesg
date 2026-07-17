import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPayload } from "payload";

import type { ReportSnapshot } from "@/lib/reports";
import { rateLimit } from "@/lib/rate-limit";
import config from "@/payload.config";

export default async function LivingReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";
  const limited = await rateLimit(`living:${token}:${ip}`, {
    max: 60,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-bone">
        <p className="label-caps">Living report</p>
        <h1 className="font-display mt-4 text-3xl">Too many requests</h1>
        <p className="mt-4 text-ash">Retry after {limited.retryAfterSec}s.</p>
      </main>
    );
  }

  const payload = await getPayload({ config });
  const found = await payload.find({
    collection: "reports",
    where: {
      and: [{ shareToken: { equals: token } }, { status: { equals: "published" } }],
    },
    limit: 1,
    overrideAccess: true,
  });
  const report = found.docs[0];
  if (!report) notFound();

  if (report.shareExpiresAt && new Date(String(report.shareExpiresAt)) < new Date()) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-bone">
        <p className="label-caps">Living report</p>
        <h1 className="font-display mt-4 text-3xl">Link expired</h1>
        <p className="mt-4 text-ash">Ask the organisation for a new share link.</p>
      </main>
    );
  }

  await payload.update({
    collection: "reports",
    id: report.id,
    data: { viewCount: (report.viewCount ?? 0) + 1 },
    overrideAccess: true,
  });

  const snapshot = report.snapshot as ReportSnapshot | null;
  if (!snapshot) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-bone">
      <p className="label-caps">ClearESG living report</p>
      <h1 className="font-display mt-4 text-4xl">{snapshot.organisationName}</h1>
      <p className="mt-2 text-ash">
        {snapshot.periodLabel} · {snapshot.framework} · v{snapshot.version}
      </p>

      <p className="font-data mt-10 text-5xl">{snapshot.scores.overall}</p>
      <p className="label-caps mt-1">Overall · {snapshot.band}</p>

      <div className="mt-10 grid grid-cols-3 gap-4">
        {(
          [
            ["E", snapshot.scores.e],
            ["S", snapshot.scores.s],
            ["G", snapshot.scores.g],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="border border-graphite p-3">
            <p className="label-caps">{k}</p>
            <p className="font-data mt-2 text-2xl">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 border border-graphite p-4">
        <p className="label-caps mb-3">Emissions tCO2e</p>
        <p className="font-data text-ash">
          S1 {snapshot.emissions.scope1} · S2 {snapshot.emissions.scope2} · S3{" "}
          {snapshot.emissions.scope3} · Total {snapshot.emissions.total}
        </p>
        <p className="font-data mt-2 text-sm text-ash">
          Data quality {snapshot.emissions.dataQualityPct}%
        </p>
      </div>

      <div className="mt-10 border border-graphite p-4">
        <p className="label-caps mb-2">Materiality</p>
        <p className="text-sm text-ash">
          {snapshot.materiality.narrative ?? "No materiality narrative on this version."}
        </p>
      </div>

      <p className="mt-12 text-xs text-ash">{snapshot.disclaimer}</p>
    </main>
  );
}
