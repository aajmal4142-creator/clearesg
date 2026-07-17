import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Metric } from "@/components/ui/metric";
import { ThemeToggle } from "@/components/shell/ThemeToggle";

export function MarketingNav() {
  return (
    <header className="border-b border-rule px-6 py-3">
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
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-rule px-6 py-8 text-sm text-ink-muted">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 md:flex-row md:justify-between">
        <p className="label-caps text-ink">ClearESG</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/pricing" className="editorial-link">
            Pricing
          </Link>
          <Link href="/csrd/manufacturing" className="hover:text-ink">
            CSRD sectors
          </Link>
          <Link href="/compare/workiva" className="hover:text-ink">
            Compare
          </Link>
          <Link href="/deadlines/ie" className="hover:text-ink">
            Deadlines
          </Link>
          <Link href="/llms.txt" className="hover:text-ink">
            llms.txt
          </Link>
        </div>
        <p className="font-data text-xs">
          © <Metric value={new Date().getFullYear()} size="sm" animate={false} />
        </p>
      </div>
    </footer>
  );
}

export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
