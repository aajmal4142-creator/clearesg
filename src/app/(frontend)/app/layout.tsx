import { BrandVars } from "@/components/brand/BrandVars";
import { getCurrentContext } from "@/lib/auth";

/**
 * All /app routes require identity + Membership context.
 * Auth is enforced here (resource-level), not in proxy.ts.
 * White-label CSS vars injected from active org brand.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getCurrentContext();
  return (
    <>
      <BrandVars primaryColor={ctx.activeOrg?.brand.primaryColor ?? null} />
      {children}
    </>
  );
}
