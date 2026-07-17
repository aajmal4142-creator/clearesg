import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd, MarketingFooter, MarketingNav } from "@/components/marketing/chrome";
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
    <div className="flex min-h-full flex-col bg-ink text-bone">
      <JsonLd data={softwareApplicationJsonLd()} />
      <MarketingNav />
      <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
        <h1 className="font-display text-[48px] text-bone">Pricing</h1>
        <p className="mt-4 max-w-2xl text-ash">
          Free is real: full insight, watermarked output. Paid unlocks clean PDF, periods,
          evidence, and consultant tooling. Prices in EUR; India (INR / Razorpay) remains
          an open commercial decision.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {ROWS.map(({ plan, points }) => (
            <div key={plan} className="border border-graphite p-5">
              <p className="label-caps text-ash">{PLAN_LIMITS[plan].label}</p>
              <p className="mt-2 font-data text-3xl text-bone">
                €{PLAN_LIMITS[plan].priceEur}
                <span className="text-base text-ash">/mo</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-ash">
                {points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="mt-6 inline-block border border-graphite bg-slate px-3 py-2 text-sm text-bone hover:border-ash"
              >
                Start
              </Link>
            </div>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
