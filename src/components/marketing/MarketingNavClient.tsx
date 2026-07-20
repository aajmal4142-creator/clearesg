"use client";

import Link from "next/link";

import { Assemble, RuleDraw } from "@/components/motion";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { Button } from "@/components/ui/button";

export function MarketingNavClient() {
  return (
    <Assemble layer="chrome" as="header">
      <RuleDraw accent onMount duration={0.4} className="w-full" />
      <div className="border-b border-rule px-6 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/" className="label-caps text-ink">
            ClearESG
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-ink-muted">
            <Link href="/pricing" className="editorial-link">
              Pricing
            </Link>
            <Link href="/glossary" className="hover:text-ink">
              Glossary
            </Link>
            <Link href="/answers" className="hover:text-ink">
              Answers
            </Link>
            <Link href="/tools" className="hover:text-ink">
              Tools
            </Link>
            <Link href="/sign-in" className="hover:text-ink">
              Sign in
            </Link>
            <ThemeToggle />
            <Button asChild size="sm">
              <Link href="/app">Open app</Link>
            </Button>
          </nav>
        </div>
      </div>
    </Assemble>
  );
}
