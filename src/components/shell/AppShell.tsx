"use client";

import Link from "next/link";
import { Menu, PanelLeft, PanelLeftClose, X } from "lucide-react";
import { useId, useState } from "react";

import { Assemble, RuleDraw } from "@/components/motion";
import { AppNav } from "@/components/shell/AppNav";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { OrgSwitcher } from "@/components/shell/OrgSwitcher";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import type { NavBadges } from "@/components/shell/navConfig";
import { useSidebarChrome } from "@/components/shell/useSidebarChrome";
import type { MembershipRole } from "@/lib/access/membership";
import { cn } from "@/lib/utils";

type ShellOrg = { id: string; name: string };

export type AppShellProps = {
  children: React.ReactNode;
  orgs: ShellOrg[];
  activeOrgId: string | null;
  role: MembershipRole | null;
  orgType: "company" | "consultancy" | null;
  onboarded: boolean;
  badges?: NavBadges;
  activeOrgName?: string | null;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CE";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function roleLabel(role: MembershipRole | null): string {
  if (role === "owner") return "Owner";
  if (role === "admin") return "Can approve";
  if (role === "contributor") return "Can edit data";
  if (role === "viewer") return "View only";
  return "Member";
}

export function AppShell({
  children,
  orgs,
  activeOrgId,
  role,
  orgType,
  onboarded,
  badges = { requests: 0, questionnaires: 0 },
  activeOrgName,
}: AppShellProps) {
  const { collapsed, width, dragging, toggle, onDragStart } = useSidebarChrome();
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelId = useId();
  const orgName =
    activeOrgName ?? orgs.find((o) => o.id === activeOrgId)?.name ?? "Organisation";

  const sidebarInner = (
    <>
      <div
        className={cn(
          "flex items-center gap-2 border-b border-rule px-3 py-3",
          collapsed && "flex-col gap-3",
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            "label-caps min-w-0 truncate text-ink",
            collapsed && "text-center text-[10px]",
          )}
          title="ClearESG"
        >
          {collapsed ? "CE" : "ClearESG"}
        </Link>
        <button
          type="button"
          onClick={toggle}
          className="ml-auto rounded-[4px] p-1.5 text-ink-muted hover:bg-surface-2 hover:text-ink"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title="Toggle sidebar ([)"
        >
          {collapsed ? (
            <PanelLeft className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>
      </div>

      <div className={cn("border-b border-rule px-3 py-3", collapsed && "px-2")}>
        <div className={cn("flex items-center gap-2", collapsed && "flex-col")}>
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-[4px] bg-accent text-xs font-medium text-canvas"
            title={orgName}
          >
            {initials(orgName)}
          </div>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">{orgName}</p>
              <p className="label-caps text-[10px] text-ink-muted">{roleLabel(role)}</p>
            </div>
          ) : null}
        </div>
        {!collapsed ? (
          <div className="mt-3">
            <OrgSwitcher orgs={orgs} activeOrgId={activeOrgId} compact />
          </div>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4">
        <AppNav
          orgType={orgType}
          onboarded={onboarded}
          role={role}
          collapsed={collapsed}
          badges={badges}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      <div
        className={cn(
          "mt-auto flex items-center border-t border-rule px-3 py-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed ? (
          <p className="text-[11px] text-ink-muted">
            <span className="font-data">⌘K</span> search
          </p>
        ) : null}
        <ThemeToggle />
      </div>
    </>
  );

  return (
    <div className="flex min-h-full bg-canvas text-ink">
      {/* Desktop sidebar */}
      <Assemble
        layer="chrome"
        as="aside"
        className="relative z-30 hidden shrink-0 flex-col border-r border-rule bg-canvas lg:flex"
        style={{ width }}
      >
        <RuleDraw accent onMount duration={0.35} className="w-full" />
        {sidebarInner}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          className={cn(
            "absolute top-0 right-0 z-10 h-full w-1.5 cursor-col-resize touch-none",
            "after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-rule",
            "hover:after:bg-rule-strong active:after:bg-accent",
            dragging && "after:bg-accent",
          )}
          onPointerDown={(e) => {
            e.preventDefault();
            onDragStart(e.clientX);
          }}
        />
      </Assemble>

      {/* Mobile top bar + drawer */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-40 flex items-center justify-between gap-3 border-b border-rule px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-[4px] border border-rule bg-surface-1 p-2 text-ink"
              aria-expanded={mobileOpen}
              aria-controls={panelId}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
            <Link href="/dashboard" className="label-caps text-ink">
              ClearESG
            </Link>
          </div>
          <ThemeToggle />
        </header>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-ink/25"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <div
              id={panelId}
              className="absolute inset-y-0 left-0 flex w-[min(100%,280px)] flex-col border-r border-rule bg-canvas shadow-[0_16px_40px_-20px_rgba(26,23,20,0.35)]"
            >
              {sidebarInner}
            </div>
          </div>
        ) : null}

        <div className="min-w-0 flex-1">{children}</div>
      </div>

      <CommandPalette orgType={orgType} onboarded={onboarded} />
    </div>
  );
}
