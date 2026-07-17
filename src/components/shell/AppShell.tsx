import Link from "next/link";

import { OrgSwitcher } from "@/components/shell/OrgSwitcher";

type ShellOrg = { id: string; name: string };

export function AppShell({
  children,
  orgs,
  activeOrgId,
}: {
  children: React.ReactNode;
  orgs: ShellOrg[];
  activeOrgId: string | null;
}) {
  return (
    <div className="flex min-h-full flex-col bg-ink text-bone">
      <header className="flex items-center justify-between border-b border-graphite px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/app" className="label-caps text-bone">
            ClearESG
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm text-ash">
            <Link href="/app" className="hover:text-bone">
              Runway
            </Link>
            <Link href="/app/data" className="hover:text-bone">
              Data
            </Link>
            <Link href="/app/suppliers" className="hover:text-bone">
              Suppliers
            </Link>
            <Link href="/app/materiality" className="hover:text-bone">
              Materiality
            </Link>
            <Link href="/app/reports" className="hover:text-bone">
              Reports
            </Link>
            <Link href="/app/consultant" className="hover:text-bone">
              Clients
            </Link>
            <Link href="/app/benchmarks" className="hover:text-bone">
              Benchmarks
            </Link>
            <Link href="/app/billing" className="hover:text-bone">
              Billing
            </Link>
            <Link href="/app/onboarding" className="hover:text-bone">
              Baseline
            </Link>
          </nav>
        </div>
        <OrgSwitcher orgs={orgs} activeOrgId={activeOrgId} />
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
