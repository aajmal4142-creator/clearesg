import { AppShell } from "@/components/shell/AppShell";
import { getCurrentContext } from "@/lib/auth";

/** Server wrapper — lifts shell into layout with real Membership context. */
export async function AppShellServer({ children }: { children: React.ReactNode }) {
  const ctx = await getCurrentContext();
  const orgs = ctx.memberships.map((m) => ({
    id: m.organisationId,
    name: m.organisationName || m.organisationId,
  }));

  return (
    <AppShell
      orgs={orgs}
      activeOrgId={ctx.activeOrg?.id ?? null}
      role={ctx.role}
      orgType={ctx.activeOrg?.type ?? null}
      onboarded={Boolean(ctx.activeOrg?.onboardedAt)}
    >
      {children}
    </AppShell>
  );
}
