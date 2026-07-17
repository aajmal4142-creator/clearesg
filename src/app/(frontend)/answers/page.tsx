import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd, MarketingFooter, MarketingNav } from "@/components/marketing/chrome";
import { ANSWERS } from "@/lib/marketing/answers";
import { SITE_NAME } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: `Answers — ${SITE_NAME}`,
  description:
    "Answer-first pages for CSRD scope, double materiality, Scope 2 calculation, and filing questions — written for AEO citation.",
  alternates: { canonical: "/answers" },
};

export default function AnswersIndexPage() {
  return (
    <div className="flex min-h-full flex-col bg-ink text-bone">
      <MarketingNav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <h1 className="font-display text-[48px] text-bone">Answers</h1>
        <p className="mt-4 text-ash">
          One question per page. The first paragraph stands alone so answer engines can
          lift it.
        </p>
        <ul className="mt-10 space-y-6">
          {ANSWERS.map((a) => (
            <li key={a.slug}>
              <Link href={`/answers/${a.slug}`} className="text-bone hover:underline">
                {a.question}
              </Link>
              <p className="mt-2 text-sm text-ash">{a.answer}</p>
            </li>
          ))}
        </ul>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: ANSWERS.map((a, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `/answers/${a.slug}`,
              name: a.question,
            })),
          }}
        />
      </main>
      <MarketingFooter />
    </div>
  );
}
