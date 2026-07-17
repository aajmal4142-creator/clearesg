import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://clearesg.com"),
  title: {
    default: "ClearESG",
    template: "%s · ClearESG",
  },
  description:
    "Enterprise ESG software costs six figures and takes six months. ClearESG gets you audit-ready this quarter.",
  openGraph: {
    type: "website",
    siteName: "ClearESG",
    locale: "en_GB",
  },
};

const hasClerk = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

const clerkAppearance = {
  variables: {
    colorPrimary: "#E8E6E1",
    colorBackground: "#0B0D0E",
    colorText: "#E8E6E1",
    colorInputBackground: "#1A1D1F",
    colorInputText: "#E8E6E1",
    borderRadius: "0.25rem",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    card: "bg-slate border border-graphite shadow-none",
    headerTitle: "font-display text-bone",
    formButtonPrimary: "bg-bone text-ink hover:bg-bone/90",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const body = (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}
      suppressHydrationWarning
    >
      {/* Extensions (e.g. ColorZilla cz-shortcut-listen) inject attrs on <body> */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );

  if (!hasClerk) {
    return body;
  }

  return (
    <ClerkProvider appearance={clerkAppearance} afterSignOutUrl="/">
      {body}
    </ClerkProvider>
  );
}
