import type { Metadata } from "next";
import Link from "next/link";

import { Gauge } from "@/components/gauge/Gauge";
import { JsonLd, MarketingFooter, MarketingNav } from "@/components/marketing/chrome";
import { Reveal } from "@/components/marketing/Reveal";
import {
  organizationJsonLd,
  SITE_NAME,
  SITE_TAGLINE,
  softwareApplicationJsonLd,
} from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: `${SITE_NAME} — precision instrument for mandatory disclosure`,
  description: SITE_TAGLINE,
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-ink text-bone">
      <JsonLd data={[organizationJsonLd, softwareApplicationJsonLd()]} />
      <MarketingNav />
      <main>
        <section className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="label-caps mb-6 text-ash">ClearESG</p>
            <h1 className="font-display text-[48px] leading-none text-bone md:text-[64px]">
              Precision instrument for mandatory disclosure.
            </h1>
            <p className="mt-6 max-w-xl text-ash">
              Enterprise ESG software costs six figures and takes six months. ClearESG
              gets you audit-ready this quarter — collect once, derive ESRS views, publish
              a living report.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className="border border-graphite bg-slate px-4 py-2 text-sm text-bone hover:border-ash"
              >
                Start free
              </Link>
              <Link
                href="/tools/csrd-scope"
                className="border border-graphite px-4 py-2 text-sm text-ash hover:border-ash hover:text-bone"
              >
                CSRD scope checker
              </Link>
              <Link
                href="/pricing"
                className="border border-graphite px-4 py-2 text-sm text-ash hover:border-ash hover:text-bone"
              >
                Pricing
              </Link>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <Gauge score={72} previousScore={61} size={320} />
          </div>
        </section>

        <Reveal className="border-t border-graphite">
          <section className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="font-display text-[40px] text-bone">Built as equipment</h2>
            <p className="mt-4 max-w-2xl text-ash">
              Achromatic chrome. The only saturated colour on screen is a measurement.
              Geist Mono for every number. Factors from a versioned registry — missing
              data is marked missing, never silently zero.
            </p>
            <ul className="mt-8 grid gap-4 text-sm text-ash md:grid-cols-3">
              <li className="border border-graphite p-4">
                <p className="label-caps text-bone">Collect</p>
                <p className="mt-2">
                  18 core metrics, evidence vault, supplier request chains.
                </p>
              </li>
              <li className="border border-graphite p-4">
                <p className="label-caps text-bone">Derive</p>
                <p className="mt-2">
                  Approved E1–E5 mappings only — no invented raw→ESRS bridges.
                </p>
              </li>
              <li className="border border-graphite p-4">
                <p className="label-caps text-bone">Publish</p>
                <p className="mt-2">
                  Living report links, watermarked Free PDF, version diffs.
                </p>
              </li>
            </ul>
          </section>
        </Reveal>
      </main>
      <MarketingFooter />
    </div>
  );
}
