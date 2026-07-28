"use client";

import { Button } from "@/components/ui/button";
import { dashboardUrl } from "@/lib/marketing/site";

type Variant = "acid" | "editorial";

/** Marketing chrome CTAs — product lives on the dashboard app. */
export function MarketingAuthActions({ variant = "acid" }: { variant?: Variant }) {
  const signInClass =
    variant === "acid"
      ? "hidden text-sm text-ink-muted hover:text-ink sm:inline"
      : "hover:text-ink";

  return (
    <>
      <a href={dashboardUrl("/sign-in")} className={signInClass}>
        Sign in
      </a>
      <Button
        asChild
        size="sm"
        className={variant === "acid" ? "rounded-full px-4" : undefined}
      >
        <a href={dashboardUrl("/")}>Open workspace</a>
      </Button>
    </>
  );
}
