"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { OrgSwitcher } from "@/components/shell/OrgSwitcher";
import { Assemble } from "@/components/ui/metric";

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
    <div className="flex min-h-full flex-col bg-canvas text-ink">
      <Assemble layer="chrome" as="header">
        <div className="flex items-center justify-between border-b border-rule px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/app" className="label-caps text-ink">
              ClearESG
            </Link>
            <nav className="flex flex-wrap gap-4 text-sm text-ink-muted">
              <Link href="/app" className="hover:text-accent">
                Runway
              </Link>
              <Link href="/app/data" className="hover:text-accent">
                Data
              </Link>
              <Link href="/app/suppliers" className="hover:text-accent">
                Suppliers
              </Link>
              <Link href="/app/materiality" className="hover:text-accent">
                Materiality
              </Link>
              <Link href="/app/reports" className="hover:text-accent">
                Reports
              </Link>
              <Link href="/app/consultant" className="hover:text-accent">
                Clients
              </Link>
              <Link href="/app/benchmarks" className="hover:text-accent">
                Benchmarks
              </Link>
              <Link href="/app/billing" className="hover:text-accent">
                Billing
              </Link>
              <Link href="/app/onboarding" className="hover:text-accent">
                Baseline
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <OrgSwitcher orgs={orgs} activeOrgId={activeOrgId} />
          </div>
        </div>
      </Assemble>
      <div className="flex-1">{children}</div>
    </div>
  );
}
