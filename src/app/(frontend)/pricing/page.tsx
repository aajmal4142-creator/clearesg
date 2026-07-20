import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd, MarketingFooter, MarketingNav } from "@/components/marketing/chrome";
import { InkChild, InkReveal, InkStagger, RuleDraw } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Metric } from "@/components/ui/metric";
import { PLAN_LIMITS } from "@/lib/billing/plans";
import { SITE_NAME, softwareApplicationJsonLd } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: `Pricing — ${SITE_NAME}`,
  description:
    "ClearESG plans: Free €0 (watermarked PDF), Pro €49/mo, Consultant €199/mo. EUR list prices; India INR/Razorpay is an open decision.",
  alternates: { canonical: "/pricing" },
};

const ROWS: Array<{ plan: keyof typeof PLAN_LIMITS; points: string[] }> = [
  {
    plan: "free",
    points: [
      "Full calculation engine",
      "1 reporting period",
      "3 suppliers",
      "Watermarked PDF",
    ],
  },
  {
    plan: "pro",
    points: ["Unlimited periods", "Clean PDF", "Evidence vault", "10 suppliers"],
  },
  {
    plan: "consultant",
    points: [
      "Everything in Pro",
      "White-label brand",
      "Bulk nudge + templates",
      "10 clients (+€15/client after)",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-full flex-col bg-canvas text-ink">
      <JsonLd data={softwareApplicationJsonLd()} />
      <MarketingNav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <InkReveal onMount layer="structure">
          <RuleDraw accent onMount duration={0.45} className="mb-4" />
          <h1 className="display-40 text-ink">Pricing</h1>
          <p className="measure-prose mt-6 text-ink-muted">
            Free is real: full insight, watermarked output. Paid unlocks clean PDF,
            periods, evidence, and consultant tooling. Prices in EUR; India (INR /
            Razorpay) remains an open commercial decision.
          </p>
        </InkReveal>
        <InkStagger className="mt-12 space-y-0" delayChildren={0.08}>
          {ROWS.map(({ plan, points }, i) => (
            <InkChild key={plan} index={i} className="section-rule py-8">
              <p className="label-caps">{PLAN_LIMITS[plan].label}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-data text-ink-muted">€</span>
                <Metric value={PLAN_LIMITS[plan].priceEur} size="xl" decimals={0} />
                <span className="label-caps">/mo</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-ink-muted">
                {points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <Button asChild className="mt-6" size="sm">
                <Link href="/sign-up">Start</Link>
              </Button>
            </InkChild>
          ))}
        </InkStagger>
      </main>
      <MarketingFooter />
    </div>
  );
}
