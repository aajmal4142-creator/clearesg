import type { Metadata } from "next";
import Link from "next/link";

import { HairlineRule, Reveal, StrikeReveal } from "@/components/marketing/Reveal";
import { LiveHeroGauge } from "@/components/marketing/LiveHeroGauge";
import { JsonLd, MarketingFooter, MarketingNav } from "@/components/marketing/chrome";
import { Button } from "@/components/ui/button";
import { Metric } from "@/components/ui/metric";
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

const GAPS: Array<{ gap: string; answer: string; figure: number; unit: string }> = [
  {
    gap: "Everyone sells a dashboard. Nobody sells a deadline.",
    answer: "Compliance Runway — days to filing, collection rate, projected miss.",
    figure: 87,
    unit: "days",
  },
  {
    gap: "Scope 3 is where everyone gives up.",
    answer: "Supplier request chains — tokenised links, six fields, no account.",
    figure: 90,
    unit: "% of footprint",
  },
  {
    gap: "Double materiality is a consultancy service.",
    answer: "Guided workshop with impact × financial scoring and an audit trail.",
    figure: 40,
    unit: "k€ avoided",
  },
  {
    gap: "Auditors reject reports with no evidence trail.",
    answer: "Evidence vault — every figure clickable to invoice, hash, uploader.",
    figure: 1,
    unit: "click back",
  },
  {
    gap: "Emission factors are hardcoded and stale.",
    answer: "Versioned factor registry — source, year, region, pinned on publish.",
    figure: 2024,
    unit: "factor year",
  },
  {
    gap: "CSRD and BRSR treated as separate products.",
    answer: "Enter once, map everywhere — frameworks are views over datapoints.",
    figure: 1,
    unit: "canonical model",
  },
  {
    gap: "Consultant tooling is an afterthought.",
    answer: "Command centre — clients by deadline risk, white-label, templates.",
    figure: 20,
    unit: "SMEs per consultant",
  },
  {
    gap: "Onboarding starts with a blank form.",
    answer: "60-second baseline — estimated footprint, then replace with measured.",
    figure: 60,
    unit: "seconds",
  },
  {
    gap: "No competitor shows how you compare.",
    answer: "Sector benchmarking — percentile vs cohort, gated at n≥8.",
    figure: 71,
    unit: "th percentile",
  },
  {
    gap: "Reports are a dead PDF.",
    answer: "Living report — signed link, evidence trail, versioned microsite.",
    figure: 1,
    unit: "shareable link",
  },
  {
    gap: "Data quality is invisible.",
    answer: "Confidence score — measured / calculated / estimated / missing.",
    figure: 4,
    unit: "qualities",
  },
  {
    gap: "Nobody explains why the number moved.",
    answer: "Narrative engine — deterministic plain-English change explanations.",
    figure: 1,
    unit: "sentence per delta",
  },
];

const ANTI = [
  "Full-fat carbon accounting for heavy industry",
  "Real-time IoT sensor ingestion",
  "Live assurance marketplace in v1",
  "An AI chatbot that guesses regulation",
];

export default function Home() {
  return (
    <div className="surface-0 flex min-h-full flex-col text-bone">
      <JsonLd data={[organizationJsonLd, softwareApplicationJsonLd()]} />
      <MarketingNav />
      <main>
        <section className="relative mx-auto grid max-w-5xl gap-12 overflow-hidden px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="label-caps mb-6">ClearESG</p>
            <h1 className="font-display ml-[-0.04em] text-[clamp(2.75rem,7vw,6rem)] leading-[1.02] tracking-[-0.04em] text-bone max-md:tracking-[-0.02em]">
              Enterprise ESG software costs six figures and takes six months.
              <br className="hidden md:block" /> ClearESG gets you audit-ready this
              quarter.
            </h1>
            <p className="measure-prose mt-8 text-ash">
              Precision instrument for mandatory disclosure. Collect once, derive ESRS
              views, publish a living report — achromatic chrome, colour only for data.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/sign-up">Start free</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/tools/csrd-scope">CSRD scope checker</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/pricing">Pricing</Link>
              </Button>
            </div>
          </div>
          <LiveHeroGauge />
        </section>

        <HairlineRule className="mx-auto max-w-5xl" />

        <Reveal delay={0.06}>
          <section className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="display-48 text-bone">Built as equipment</h2>
            <p className="measure-prose mt-4 text-ash">
              Achromatic chrome. The only saturated colour on screen is a measurement.
              Geist Mono for every number. Factors from a versioned registry — missing
              data is marked missing, never silently zero.
            </p>
            <ul className="mt-10 grid gap-3 md:grid-cols-3">
              {(["Collect", "Derive", "Publish"] as const).map((label, i) => (
                <Reveal key={label} delay={0.06 + i * 0.06}>
                  <li className="surface-1 panel-hover rounded-[4px] p-4">
                    <p className="label-caps text-bone">{label}</p>
                    <p className="mt-2 text-sm text-ash">
                      {label === "Collect"
                        ? "18 core metrics, evidence vault, supplier request chains."
                        : label === "Derive"
                          ? "Approved E1–E5 mappings only — no invented raw→ESRS bridges."
                          : "Living report links, watermarked Free PDF, version diffs."}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ul>
          </section>
        </Reveal>

        <HairlineRule className="mx-auto max-w-5xl" delay={0.05} />

        <section className="mx-auto max-w-5xl px-6 py-16">
          <Reveal>
            <h2 className="display-48 text-bone">Twelve gaps. Twelve answers.</h2>
            <p className="measure-prose mt-4 text-ash">
              What the market leaves blank — and what ClearESG ships as product.
            </p>
          </Reveal>
          <ul className="mt-10 space-y-3">
            {GAPS.map((g, i) => (
              <Reveal key={g.gap} delay={i * 0.06}>
                <li className="surface-1 rounded-[4px] px-4 py-4">
                  <p className="text-sm text-ash">{g.gap}</p>
                  <p className="mt-2 text-bone">{g.answer}</p>
                  <div className="mt-3">
                    <Metric
                      value={g.figure}
                      unit={g.unit}
                      size="lg"
                      tone="signal"
                      animate={false}
                    />
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>

        <HairlineRule className="mx-auto max-w-5xl" />

        <section className="mx-auto max-w-5xl px-6 py-16">
          <Reveal>
            <h2 className="display-48 text-bone">Deliberately not building</h2>
            <p className="measure-prose mt-4 text-ash">
              Confidence is more attractive than a feature list.
            </p>
          </Reveal>
          <ul className="mt-8 space-y-3 text-sm">
            {ANTI.map((item, i) => (
              <StrikeReveal key={item} delay={i * 0.06}>
                {item}
              </StrikeReveal>
            ))}
          </ul>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
