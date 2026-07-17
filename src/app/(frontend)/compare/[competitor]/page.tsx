import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd, MarketingFooter, MarketingNav } from "@/components/marketing/chrome";
import { COMPETITORS, competitorBySlug } from "@/lib/marketing/programmatic";
import { absoluteUrl, SITE_NAME } from "@/lib/marketing/site";

type Props = { params: Promise<{ competitor: string }> };

export function generateStaticParams() {
  return COMPETITORS.map((c) => ({ competitor: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { competitor } = await params;
  const c = competitorBySlug(competitor);
  if (!c) return { title: SITE_NAME };
  return {
    title: `ClearESG vs ${c.name} — ${SITE_NAME}`,
    description: c.answer,
    alternates: { canonical: `/compare/${c.slug}` },
  };
}

export default async function ComparePage({ params }: Props) {
  const { competitor } = await params;
  const c = competitorBySlug(competitor);
  if (!c) notFound();

  return (
    <div className="flex min-h-full flex-col bg-ink text-bone">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `ClearESG vs ${c.name}`,
          description: c.answer,
          dateModified: c.updatedAt,
          url: absoluteUrl(`/compare/${c.slug}`),
        }}
      />
      <MarketingNav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <p className="label-caps text-ash">Compare</p>
        <h1 className="mt-2 font-display text-[40px] text-bone">ClearESG vs {c.name}</h1>
        <p className="mt-6 text-bone">{c.answer}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-sm text-bone">Where {c.name} wins</h2>
            <ul className="mt-3 space-y-2 text-sm text-ash">
              {c.whereTheyWin.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm text-bone">Where ClearESG wins</h2>
            <ul className="mt-3 space-y-2 text-sm text-ash">
              {c.whereWeWin.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-10 text-sm text-ash">
          <Link href="/pricing" className="text-bone underline">
            Pricing
          </Link>
          {" · "}
          <Link href="/compare/persefoni" className="text-bone underline">
            vs Persefoni
          </Link>
          {" · "}
          <Link href="/compare/greenly" className="text-bone underline">
            vs Greenly
          </Link>
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
