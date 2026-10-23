import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { PostHogProvider } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://plancheck.dev"),
  title: {
    default: "PlanCheck — PostgreSQL EXPLAIN Analyzer",
    template: "%s | PlanCheck",
  },
  description: "Evidence-based PostgreSQL EXPLAIN analysis. Find slow scans, bad estimates, join issues, disk spills, trigger overhead and more — free, private and browser-based.",
  keywords: [
    "PostgreSQL EXPLAIN analyzer",
    "EXPLAIN ANALYZE",
    "Postgres query optimization",
    "PostgreSQL performance",
    "query plan analyzer",
    "Postgres slow query",
  ],
  alternates: { canonical: "https://plancheck.dev" },
  openGraph: {
    type: "website",
    url: "https://plancheck.dev",
    siteName: "PlanCheck",
    title: "PlanCheck — Find what's actually slowing your PostgreSQL query",
    description: "Paste EXPLAIN ANALYZE output and get evidence-based PostgreSQL diagnostics. No signup. Nothing uploaded.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlanCheck — PostgreSQL EXPLAIN Analyzer",
    description: "Evidence-based PostgreSQL query plan diagnostics. Free, private and deterministic.",
  },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-[#071015] text-slate-100`}>
        <PostHogProvider>{children}</PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
