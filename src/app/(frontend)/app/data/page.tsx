import { redirect } from "next/navigation";
import { getPayload } from "payload";

import { DataWizard } from "@/app/(frontend)/app/data/DataWizard";
import { AppShell } from "@/components/shell/AppShell";
import { getCurrentContext } from "@/lib/auth";
import config from "@/payload.config";

export default async function DataPage() {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg) redirect("/app/onboarding");

  const payload = await getPayload({ config });
  const periods = await payload.find({
    collection: "reporting-periods",
    where: {
      and: [
        { organisation: { equals: ctx.activeOrg.id } },
        { status: { equals: "open" } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  });

  const initial: Record<string, { value: number | null; quality: string }> = {};
  if (periods.docs[0]) {
    const dps = await payload.find({
      collection: "datapoints",
      where: {
        and: [
          { organisation: { equals: ctx.activeOrg.id } },
          { period: { equals: periods.docs[0].id } },
        ],
      },
      limit: 100,
      overrideAccess: true,
    });
    for (const dp of dps.docs) {
      initial[dp.metricKey] = {
        value: typeof dp.value === "number" ? dp.value : null,
        quality: dp.quality,
      };
    }
  }

  return (
    <AppShell
      orgs={ctx.memberships.map((m) => ({
        id: m.organisationId,
        name: m.organisationName,
      }))}
      activeOrgId={ctx.activeOrg.id}
    >
      <DataWizard initial={initial} />
    </AppShell>
  );
}
