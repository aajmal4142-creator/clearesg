import Link from "next/link";

export function MarketingNav() {
  return (
    <header className="border-b border-graphite px-6 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link href="/" className="label-caps text-bone">
          ClearESG
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm text-ash">
          <Link href="/pricing" className="hover:text-bone">
            Pricing
          </Link>
          <Link href="/glossary" className="hover:text-bone">
            Glossary
          </Link>
          <Link href="/answers" className="hover:text-bone">
            Answers
          </Link>
          <Link href="/tools" className="hover:text-bone">
            Tools
          </Link>
          <Link href="/sign-in" className="hover:text-bone">
            Sign in
          </Link>
          <Link
            href="/app"
            className="border border-graphite px-2 py-1 text-bone hover:border-ash"
          >
            Open app
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-graphite px-6 py-8 text-sm text-ash">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:justify-between">
        <p className="label-caps text-bone">ClearESG</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/pricing" className="hover:text-bone">
            Pricing
          </Link>
          <Link href="/csrd/manufacturing" className="hover:text-bone">
            CSRD sectors
          </Link>
          <Link href="/compare/workiva" className="hover:text-bone">
            Compare
          </Link>
          <Link href="/deadlines/ie" className="hover:text-bone">
            Deadlines
          </Link>
          <Link href="/llms.txt" className="hover:text-bone">
            llms.txt
          </Link>
        </div>
        <p className="font-data text-xs">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
