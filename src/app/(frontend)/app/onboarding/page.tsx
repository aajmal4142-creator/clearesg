import { AppShell } from "@/components/shell/AppShell";
import { getCurrentContext } from "@/lib/auth";

import { OnboardingWizard } from "./OnboardingWizard";

export default async function OnboardingPage() {
  const ctx = await getCurrentContext();
  return (
    <AppShell
      orgs={ctx.memberships.map((m) => ({
        id: m.organisationId,
        name: m.organisationName,
      }))}
      activeOrgId={ctx.activeOrg?.id ?? null}
    >
      <OnboardingWizard />
    </AppShell>
  );
}
