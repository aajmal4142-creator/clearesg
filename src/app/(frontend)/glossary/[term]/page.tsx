import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd, MarketingFooter, MarketingNav } from "@/components/marketing/chrome";
import { GLOSSARY, glossaryBySlug } from "@/lib/marketing/glossary";
import { absoluteUrl, SITE_NAME } from "@/lib/marketing/site";

type Props = { params: Promise<{ term: string }> };

export function generateStaticParams() {
  return GLOSSARY.map((t) => ({ term: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { term: slug } = await params;
  const t = glossaryBySlug(slug);
  if (!t) return { title: SITE_NAME };
  return {
    title: `${t.term} — ${SITE_NAME} glossary`,
    description: t.answer,
    alternates: { canonical: `/glossary/${t.slug}` },
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const { term: slug } = await params;
  const t = glossaryBySlug(slug);
  if (!t) notFound();

  return (
    <div className="flex min-h-full flex-col bg-ink text-bone">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          name: t.term,
          description: t.answer,
          url: absoluteUrl(`/glossary/${t.slug}`),
          dateModified: t.updatedAt,
        }}
      />
      <MarketingNav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <p className="label-caps text-ash">Glossary</p>
        <h1 className="mt-2 font-display text-[48px] text-bone">{t.term}</h1>
        <p className="mt-6 text-bone">{t.answer}</p>
        <p className="mt-2 font-data text-xs text-ash">Updated {t.updatedAt}</p>
        {t.body.map((para) => (
          <p key={para.slice(0, 24)} className="mt-6 text-ash">
            {para}
          </p>
        ))}
        <h2 className="mt-10 text-sm text-bone">Related</h2>
        <ul className="mt-2 flex flex-wrap gap-3 text-sm text-ash">
          {t.related.map((r) => (
            <li key={r}>
              <Link href={`/glossary/${r}`} className="hover:text-bone">
                {r}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/tools/csrd-scope" className="hover:text-bone">
              CSRD scope checker
            </Link>
          </li>
          <li>
            <Link href="/pricing" className="hover:text-bone">
              Pricing
            </Link>
          </li>
        </ul>
      </main>
      <MarketingFooter />
    </div>
  );
}
