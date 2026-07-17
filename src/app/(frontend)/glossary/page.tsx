import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd, MarketingFooter, MarketingNav } from "@/components/marketing/chrome";
import { GLOSSARY } from "@/lib/marketing/glossary";
import { SITE_NAME } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: `ESG glossary — ${SITE_NAME}`,
  description:
    "Definitions for Scope 3, double materiality, ESRS E1, CSRD, emission factors, VSME, and BRSR — written for citation.",
  alternates: { canonical: "/glossary" },
};

export default function GlossaryIndexPage() {
  return (
    <div className="flex min-h-full flex-col bg-ink text-bone">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          name: "ClearESG ESG glossary",
          hasDefinedTerm: GLOSSARY.map((t) => ({
            "@type": "DefinedTerm",
            name: t.term,
            description: t.answer,
            url: `/glossary/${t.slug}`,
          })),
        }}
      />
      <MarketingNav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <h1 className="font-display text-[48px] text-bone">Glossary</h1>
        <p className="mt-4 text-ash">
          Short, dated definitions written so answer engines can cite them. Each term
          links to related entries and product tools.
        </p>
        <ul className="mt-10 space-y-4">
          {GLOSSARY.map((t) => (
            <li key={t.slug} className="border-b border-graphite pb-4">
              <Link href={`/glossary/${t.slug}`} className="text-bone hover:underline">
                {t.term}
              </Link>
              <p className="mt-2 text-sm text-ash">{t.answer}</p>
            </li>
          ))}
        </ul>
      </main>
      <MarketingFooter />
    </div>
  );
}
