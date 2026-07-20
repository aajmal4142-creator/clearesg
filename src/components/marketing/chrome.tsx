import Link from "next/link";

import { MarketingNavClient } from "@/components/marketing/MarketingNavClient";
import { Metric } from "@/components/ui/metric";

export function MarketingNav() {
  return <MarketingNavClient />;
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
