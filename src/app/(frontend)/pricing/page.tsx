import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd, MarketingFooter, MarketingNav } from "@/components/marketing/chrome";
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
    <div className="surface-0 flex min-h-full flex-col text-bone">
      <JsonLd data={softwareApplicationJsonLd()} />
      <MarketingNav />
      <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
        <h1 className="display-48 text-bone">Pricing</h1>
        <p className="measure-prose mt-4 text-ash">
          Free is real: full insight, watermarked output. Paid unlocks clean PDF, periods,
          evidence, and consultant tooling. Prices in EUR; India (INR / Razorpay) remains
          an open commercial decision.
        </p>
        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {ROWS.map(({ plan, points }) => (
            <div key={plan} className="surface-1 panel-hover rounded-[4px] p-5">
              <p className="label-caps">{PLAN_LIMITS[plan].label}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-data text-ash">€</span>
                <Metric
                  value={PLAN_LIMITS[plan].priceEur}
                  size="xl"
                  decimals={0}
                  animate={false}
                />
                <span className="label-caps">/mo</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-ash">
                {points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <Button asChild className="mt-6" size="sm">
                <Link href="/sign-up">Start</Link>
              </Button>
            </div>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
