"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";

import type { MembershipRole } from "@/lib/access/membership";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  /** Exact match for home; otherwise prefix */
  exact?: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

function buildGroups(opts: {
  orgType: "company" | "consultancy" | null;
  onboarded: boolean;
}): NavGroup[] {
  const work: NavItem[] = [
    { href: "/app", label: "Runway", exact: true },
    { href: "/app/data", label: "Data" },
    { href: "/app/suppliers", label: "Suppliers" },
    { href: "/app/materiality", label: "Materiality" },
    { href: "/app/reports", label: "Reports" },
  ];

  const collaborate: NavItem[] = [
    { href: "/app/requests", label: "Requests" },
    { href: "/app/questionnaires", label: "Questionnaires" },
  ];
  if (opts.orgType === "consultancy") {
    collaborate.push({ href: "/app/consultant", label: "Clients" });
  }

  const assure: NavItem[] = [
    { href: "/app/guide", label: "Guide" },
    { href: "/app/audit", label: "Audit" },
    { href: "/app/benchmarks", label: "Benchmarks" },
  ];

  const account: NavItem[] = [{ href: "/app/billing", label: "Billing" }];
  if (!opts.onboarded) {
    account.push({ href: "/app/onboarding", label: "Baseline" });
  }

  return [
    { id: "work", label: "Work", items: work },
    { id: "collaborate", label: "Collaborate", items: collaborate },
    { id: "assure", label: "Assure", items: assure },
    { id: "account", label: "Account", items: account },
  ];
}

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppNav({
  orgType,
  onboarded,
  role: _role,
}: {
  orgType: "company" | "consultancy" | null;
  onboarded: boolean;
  role: MembershipRole | null;
}) {
  const pathname = usePathname();
  const groups = buildGroups({ orgType, onboarded });
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <>
      <nav className="hidden items-start gap-6 lg:flex" aria-label="Product">
        {groups.map((group) => (
          <div key={group.id} className="flex flex-col gap-1">
            <span className="label-caps text-[10px] text-ink-muted">{group.label}</span>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
              {group.items.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "border-b border-transparent pb-0.5 transition-colors",
                      active ? "border-accent text-ink" : "text-ink-muted hover:text-ink",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="lg:hidden">
        <button
          type="button"
          className="rounded-[4px] border border-rule bg-surface-1 px-3 py-1.5 text-sm text-ink"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
        {open ? (
          <div
            id={panelId}
            className="absolute left-0 right-0 top-full z-50 border-b border-rule bg-canvas px-6 py-4 shadow-none"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-4">
              {groups.map((group) => (
                <div key={group.id}>
                  <p className="label-caps mb-2 text-ink-muted">{group.label}</p>
                  <div className="flex flex-col gap-2">
                    {group.items.map((item) => {
                      const active = isActive(pathname, item);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "text-sm",
                            active ? "text-accent" : "text-ink-muted",
                          )}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
