import type { Metadata } from "next";
import Link from "next/link";

import { MarketingFooter, MarketingNav } from "@/components/marketing/chrome";
import { SITE_NAME } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: `Free ESG tools — ${SITE_NAME}`,
  description:
    "Ungated CSRD scope checker and Scope 2 calculator. No email wall — the answer is the marketing.",
  alternates: { canonical: "/tools" },
};

const TOOLS = [
  {
    slug: "csrd-scope",
    name: "CSRD scope checker",
    blurb: "Three inputs → likely in scope or not (educational heuristic).",
  },
  {
    slug: "scope-2",
    name: "Scope 2 calculator",
    blurb: "kWh → tCO2e with a cited illustrative grid factor.",
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="flex min-h-full flex-col bg-canvas text-ink">
      <MarketingNav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <h1 className="font-display text-[48px] text-ink">Tools</h1>
        <p className="mt-4 text-ink-muted">
          Free, ungated, linkable. Each ends with a path to track the number over time in
          ClearESG.
        </p>
        <ul className="mt-10 space-y-4">
          {TOOLS.map((t) => (
            <li key={t.slug} className="border border-rule p-4">
              <Link href={`/tools/${t.slug}`} className="text-ink hover:underline">
                {t.name}
              </Link>
              <p className="mt-2 text-sm text-ink-muted">{t.blurb}</p>
            </li>
          ))}
        </ul>
      </main>
      <MarketingFooter />
    </div>
  );
}
