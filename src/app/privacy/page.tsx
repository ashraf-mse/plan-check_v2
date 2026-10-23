import type { Metadata } from "next";
import Link from "next/link";
import { Database, LockKeyhole } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How PlanCheck handles PostgreSQL query plans and product analytics.",
  alternates: { canonical: "https://plancheck.dev/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#071015] text-slate-100">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold"><Database className="h-5 w-5 text-cyan-300"/>PlanCheck</Link>
        <Link href="/analyze" className="text-sm text-cyan-300">Open analyzer</Link>
      </nav>
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-16">
        <LockKeyhole className="h-8 w-8 text-cyan-300"/>
        <h1 className="mt-5 text-5xl font-semibold tracking-tight">Privacy by design</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">PlanCheck is designed so you can analyze a PostgreSQL execution plan without sending the plan to PlanCheck for processing.</p>

        <h2 className="mt-12 text-2xl font-semibold">Your query plans</h2>
        <p className="mt-3 leading-8 text-slate-400">In production, parsing and analysis run in your browser. The application does not upload your SQL text, EXPLAIN plan, relation names, predicates, or finding evidence to a PlanCheck analysis server. Local history is stored in your browser using IndexedDB.</p>

        <h2 className="mt-10 text-2xl font-semibold">Product analytics</h2>
        <p className="mt-3 leading-8 text-slate-400">PlanCheck may use privacy-conscious product analytics to understand whether the site is being used successfully. When richer analytics are configured, events are limited to coarse interaction metadata such as analyzer views, whether an analysis completed, input format, input-size bucket, and finding counts. SQL text and plan contents are never included in those events.</p>

        <h2 className="mt-10 text-2xl font-semibold">Development logging</h2>
        <p className="mt-3 leading-8 text-slate-400">The codebase contains development-only logging used while running PlanCheck locally. That proxy logging is disabled in production.</p>

        <h2 className="mt-10 text-2xl font-semibold">Before sharing a plan</h2>
        <p className="mt-3 leading-8 text-slate-400">If you copy a PlanCheck result into an issue, chat, email, or third-party service, review it first. Execution plans can contain table names, predicates, literals, or other information that your organization treats as sensitive.</p>

        <p className="mt-12 text-sm text-slate-500">Last updated: October 23, 2026.</p>
      </article>
    </main>
  );
}
