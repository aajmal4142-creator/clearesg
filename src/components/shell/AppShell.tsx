"use client";

import Link from "next/link";

import { Assemble, RuleDraw } from "@/components/motion";
import { AppNav } from "@/components/shell/AppNav";
import { OrgSwitcher } from "@/components/shell/OrgSwitcher";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import type { MembershipRole } from "@/lib/access/membership";

type ShellOrg = { id: string; name: string };

export type AppShellProps = {
  children: React.ReactNode;
  orgs: ShellOrg[];
  activeOrgId: string | null;
  role: MembershipRole | null;
  orgType: "company" | "consultancy" | null;
  onboarded: boolean;
};

export function AppShell({
  children,
  orgs,
  activeOrgId,
  role,
  orgType,
  onboarded,
}: AppShellProps) {
  return (
    <div className="flex min-h-full flex-col bg-canvas text-ink">
      <Assemble layer="chrome" as="header" className="relative z-40">
        <RuleDraw accent onMount duration={0.4} className="w-full" />
        <div className="border-b border-rule px-6 py-3">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-6">
              <Link href="/app" className="label-caps shrink-0 text-ink">
                ClearESG
              </Link>
              <AppNav orgType={orgType} onboarded={onboarded} role={role} />
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <ThemeToggle />
              <OrgSwitcher orgs={orgs} activeOrgId={activeOrgId} />
            </div>
          </div>
        </div>
      </Assemble>
      <div className="flex-1">{children}</div>
    </div>
  );
}
