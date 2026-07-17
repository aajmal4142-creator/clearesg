import { redirect } from "next/navigation";
import { getPayload } from "payload";

import { BillingClient } from "@/app/(frontend)/app/billing/BillingClient";
import { AppShell } from "@/components/shell/AppShell";
import { getCurrentContext } from "@/lib/auth";
import { getUsageMeters, normalizePlan } from "@/lib/billing";
import config from "@/payload.config";

export default async function BillingPage() {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg) redirect("/app/onboarding");
  if (!ctx.activeOrg.onboardedAt) redirect("/app/onboarding");

  const payload = await getPayload({ config });
  const org = await payload.findByID({
    collection: "organisations",
    id: ctx.activeOrg.id,
    depth: 0,
    overrideAccess: true,
  });

  const usage = await getUsageMeters(org.id, org.plan);

  return (
    <AppShell
      orgs={ctx.memberships.map((m) => ({
        id: m.organisationId,
        name: m.organisationName,
      }))}
      activeOrgId={ctx.activeOrg.id}
    >
      <BillingClient
        initial={{
          plan: normalizePlan(org.plan),
          subscriptionStatus: org.subscriptionStatus ?? "none",
          usage,
        }}
      />
    </AppShell>
  );
}
