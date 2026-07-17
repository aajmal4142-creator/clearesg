import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";

import { isTheme, THEME_BOOT_SCRIPT, type Theme } from "@/lib/theme";

import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  axes: ["SOFT", "WONK", "opsz"],
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
    colorPrimary: "#7A2E2E",
    colorBackground: "#FBF9F5",
    colorText: "#1A1714",
    colorInputBackground: "#F5F2EC",
    colorInputText: "#1A1714",
    borderRadius: "0.25rem",
    fontFamily: "var(--font-inter-tight)",
  },
  elements: {
    card: "bg-surface-1 border border-rule shadow-none",
    headerTitle: "font-display text-ink",
    formButtonPrimary: "bg-accent text-canvas hover:bg-accent-hover",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const raw = jar.get("clearesg-theme")?.value;
  const theme: Theme = isTheme(raw) ? raw : "light";

  const body = (
    <html
      lang="en"
      data-theme={theme}
      className={`${interTight.variable} ${jetbrainsMono.variable} ${fraunces.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <div className="noise-overlay" aria-hidden />
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
