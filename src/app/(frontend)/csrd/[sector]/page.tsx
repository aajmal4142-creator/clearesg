import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd, MarketingFooter, MarketingNav } from "@/components/marketing/chrome";
import { CSRD_SECTORS, sectorBySlug } from "@/lib/marketing/programmatic";
import { absoluteUrl, SITE_NAME } from "@/lib/marketing/site";

type Props = { params: Promise<{ sector: string }> };

export function generateStaticParams() {
  return CSRD_SECTORS.map((s) => ({ sector: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sector } = await params;
  const s = sectorBySlug(sector);
  if (!s) return { title: SITE_NAME };
  return {
    title: `CSRD compliance for ${s.name} — ${SITE_NAME}`,
    description: s.answer,
    alternates: { canonical: `/csrd/${s.slug}` },
  };
}

export default async function CsrdSectorPage({ params }: Props) {
  const { sector } = await params;
  const s = sectorBySlug(sector);
  if (!s) notFound();

  return (
    <div className="flex min-h-full flex-col bg-ink text-bone">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `CSRD compliance for ${s.name}`,
          description: s.answer,
          dateModified: s.updatedAt,
          author: { "@type": "Organization", name: SITE_NAME },
          url: absoluteUrl(`/csrd/${s.slug}`),
        }}
      />
      <MarketingNav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <p className="label-caps text-ash">CSRD · NACE {s.nace}</p>
        <h1 className="mt-2 font-display text-[40px] text-bone">
          CSRD compliance for {s.name}
        </h1>
        <p className="mt-6 text-bone">{s.answer}</p>
        <h2 className="mt-10 text-lg text-bone">Focus topics</h2>
        <ul className="mt-3 space-y-2 font-data text-sm text-ash">
          {s.focusTopics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-ash">
          <Link href="/tools/csrd-scope" className="text-bone underline">
            Run the scope checker
          </Link>
          {" · "}
          <Link href="/glossary/esrs-e1" className="text-bone underline">
            ESRS E1
          </Link>
          {" · "}
          <Link href="/sign-up" className="text-bone underline">
            Start free
          </Link>
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
