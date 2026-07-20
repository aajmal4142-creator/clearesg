"use client";

import Link from "next/link";

import { LiveHeroGauge } from "@/components/marketing/LiveHeroGauge";
import { InkReveal, RuleDraw } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { heroStage } from "@/lib/motion";

/**
 * Hero print assembly: chrome rules → masthead ink → Gauge sweep → controls.
 * One metaphor — a regulatory report being printed live.
 */
export function MarketingHero() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <RuleDraw
        accent
        onMount
        delay={heroStage.chromeRules}
        duration={0.45}
        className="mb-8"
      />
      <InkReveal onMount delay={heroStage.masthead} layer="structure">
        <p className="label-caps mb-6">ClearESG</p>
        <h1 className="display-80 text-ink">
          Enterprise ESG software costs six figures and takes six months.
          <br />
          ClearESG gets you audit-ready this quarter.
        </h1>
        <p className="measure-prose mt-8 text-ink-muted">
          Collect once, derive ESRS views, publish a living report. Built like an annual
          report — warm paper, oxblood chrome, colour reserved for measurements that
          matter.
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
      </InkReveal>
      <div className="mt-16 flex justify-center">
        <LiveHeroGauge />
      </div>
    </section>
  );
}
