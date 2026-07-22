"use client";

import type { ReactNode } from "react";

import { Assemble, RuleDraw } from "@/components/motion";
import { cn } from "@/lib/utils";

type PageFrameProps = {
  eyebrow: string;
  title: string;
  help?: string;
  children: ReactNode;
  /** 280px metadata / evidence / factor rail */
  rail?: ReactNode;
  className?: string;
  actions?: ReactNode;
  /** Full primary width (data grid) — still pairs with rail when set */
  wide?: boolean;
};

/**
 * Shared /app page chrome — label-caps → Fraunces H1 → help → accent rule → content.
 * Optional 66ch primary + 280px rail (BUILD_PLAN §3).
 */
export function PageFrame({
  eyebrow,
  title,
  help,
  children,
  rail,
  className,
  actions,
  wide = false,
}: PageFrameProps) {
  return (
    <Assemble layer="structure" className={cn("px-6 py-8", className)}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="label-caps text-accent">{eyebrow}</p>
            <h1 className="font-display mt-2 text-3xl text-ink md:text-4xl">{title}</h1>
            {help ? (
              <p className="mt-2 max-w-[66ch] text-sm leading-relaxed text-ink-muted">
                {help}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
        <RuleDraw accent onMount duration={0.45} className="mt-4 mb-8 h-0.5" />

        {rail ? (
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-0">
            <div className={cn("min-w-0 flex-1", !wide && "lg:max-w-[66ch]")}>
              {children}
            </div>
            <aside className="w-full shrink-0 border-t border-rule pt-6 lg:w-[280px] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
              {rail}
            </aside>
          </div>
        ) : (
          <div className={wide ? undefined : "max-w-[66ch]"}>{children}</div>
        )}
      </div>
    </Assemble>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-t border-rule py-10">
      <p className="font-display text-xl text-ink">{title}</p>
      <p className="mt-2 max-w-[66ch] text-sm text-ink-muted">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function StatusLine({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "error" | "ok";
  children: ReactNode;
}) {
  return (
    <p
      role="status"
      className={cn(
        "mt-3 text-sm",
        tone === "error" && "text-rust",
        tone === "ok" && "text-signal",
        tone === "neutral" && "text-ink-muted",
      )}
    >
      {children}
    </p>
  );
}

export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 rounded-[4px] bg-surface-2" />
      ))}
    </div>
  );
}
