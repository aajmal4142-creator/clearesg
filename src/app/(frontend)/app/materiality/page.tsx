import { redirect } from "next/navigation";
import { getPayload } from "payload";

import { MaterialityWorkshop } from "@/app/(frontend)/app/materiality/MaterialityWorkshop";
import { AppShell } from "@/components/shell/AppShell";
import { getCurrentContext } from "@/lib/auth";
import { BillingDeniedError } from "@/lib/billing";
import { ESRS_TOPICS } from "@/lib/materiality";
import { ensureOpenPeriod } from "@/lib/org/period";
import config from "@/payload.config";

export default async function MaterialityPage() {
  const ctx = await getCurrentContext();
  if (!ctx.activeOrg) redirect("/app/onboarding");
  if (!ctx.activeOrg.onboardedAt) redirect("/app/onboarding");

  const payload = await getPayload({ config });
  let periodId: string;
  try {
    periodId = await ensureOpenPeriod(ctx.activeOrg.id, ctx.activeOrg.plan);
  } catch (err) {
    if (err instanceof BillingDeniedError) redirect("/app/billing");
    throw err;
  }
  const found = await payload.find({
    collection: "materiality-assessments",
    where: {
      and: [
        { organisation: { equals: ctx.activeOrg.id } },
        { period: { equals: periodId } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  });

  return (
    <AppShell
      orgs={ctx.memberships.map((m) => ({
        id: m.organisationId,
        name: m.organisationName,
      }))}
      activeOrgId={ctx.activeOrg.id}
    >
      <MaterialityWorkshop
        initialAssessment={
          found.docs[0]
            ? {
                topics: found.docs[0].topics,
                status: found.docs[0].status,
                narrative: found.docs[0].narrative,
              }
            : null
        }
        topicsCatalog={ESRS_TOPICS}
      />
    </AppShell>
  );
}
