import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd, MarketingFooter, MarketingNav } from "@/components/marketing/chrome";
import { ANSWERS, answerBySlug } from "@/lib/marketing/answers";
import { absoluteUrl, SITE_NAME } from "@/lib/marketing/site";

type Props = { params: Promise<{ question: string }> };

export function generateStaticParams() {
  return ANSWERS.map((a) => ({ question: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { question } = await params;
  const a = answerBySlug(question);
  if (!a) return { title: SITE_NAME };
  return {
    title: `${a.question} — ${SITE_NAME}`,
    description: a.answer,
    alternates: { canonical: `/answers/${a.slug}` },
  };
}

export default async function AnswerPage({ params }: Props) {
  const { question } = await params;
  const a = answerBySlug(question);
  if (!a) notFound();

  return (
    <div className="flex min-h-full flex-col bg-ink text-bone">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: a.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: a.answer,
              },
            },
          ],
          dateModified: a.updatedAt,
          url: absoluteUrl(`/answers/${a.slug}`),
        }}
      />
      <MarketingNav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <p className="label-caps text-ash">Answers</p>
        <h1 className="mt-2 font-display text-[40px] leading-tight text-bone">
          {a.question}
        </h1>
        <p className="mt-6 text-bone">{a.answer}</p>
        <p className="mt-2 font-data text-xs text-ash">Updated {a.updatedAt}</p>
        {a.sections.map((s) => (
          <section key={s.h2} className="mt-10">
            <h2 className="text-lg text-bone">{s.h2}</h2>
            <p className="mt-3 text-ash">{s.body}</p>
          </section>
        ))}
        <h2 className="mt-12 text-sm text-bone">Related</h2>
        <ul className="mt-2 space-y-2 text-sm text-ash">
          {a.related.map((r) => (
            <li key={r}>
              <Link href={`/answers/${r}`} className="hover:text-bone">
                {r}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/glossary/csrd" className="hover:text-bone">
              CSRD glossary
            </Link>
          </li>
          <li>
            <Link href="/app" className="hover:text-bone">
              Open ClearESG
            </Link>
          </li>
        </ul>
      </main>
      <MarketingFooter />
    </div>
  );
}
