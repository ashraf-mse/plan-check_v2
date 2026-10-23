import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Database, Terminal, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Read PostgreSQL EXPLAIN ANALYZE",
  description: "A practical guide to PostgreSQL EXPLAIN ANALYZE: actual vs estimated rows, loops, timing, scans, joins, buffers, sorts and the signals that matter most.",
  alternates: { canonical: "https://plancheck.dev/guides/postgresql-explain-analyze" },
};

const signals = [
  ["Plan Rows vs Actual Rows", "Large differences can reveal where the planner's estimate diverged from reality.", "/postgresql-explain/row-estimate-mismatch"],
  ["Rows Removed by Filter", "Shows work that was performed by a node but discarded by its filter.", "/postgresql-explain/rows-removed-by-filter"],
  ["Sequential Scan", "Healthy for some workloads, expensive for others. Context matters.", "/postgresql-explain/sequential-scan"],
  ["Nested Loop + Actual Loops", "A cheap inner operation can become expensive when repeated thousands of times.", "/postgresql-explain/nested-loop"],
  ["Sort Method + Disk", "External merge or disk usage reveals a sort that spilled beyond available memory.", "/postgresql-explain/disk-sort"],
];

export default function ExplainAnalyzeGuide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "How to Read PostgreSQL EXPLAIN ANALYZE",
    description: "A practical evidence-first guide to reading PostgreSQL query plans.",
    author: { "@type": "Organization", name: "PlanCheck" },
    mainEntityOfPage: "https://plancheck.dev/guides/postgresql-explain-analyze",
  };

  return (
    <main className="min-h-screen bg-[#071015] text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold"><Database className="h-5 w-5 text-cyan-300"/>PlanCheck</Link>
        <Link href="/analyze" className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950">Analyze a plan</Link>
      </nav>

      <article className="mx-auto max-w-4xl px-6 pb-24 pt-16">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-cyan-300">Practical PostgreSQL guide</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">How to read PostgreSQL EXPLAIN ANALYZE</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          EXPLAIN ANALYZE is most useful when you stop treating the plan as a wall of text and instead follow the execution evidence from the most expensive work back to the reason it happened.
        </p>

        <section className="mt-12 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">
          <div className="flex gap-3"><Terminal className="mt-1 h-5 w-5 shrink-0 text-cyan-300"/><div><h2 className="text-xl font-semibold">Start with useful output</h2><p className="mt-2 leading-7 text-slate-300">For diagnosis, include real execution and buffer data. JSON is easiest for tools, but PlanCheck accepts text too.</p></div></div>
          <pre className="mt-5 overflow-x-auto rounded-xl bg-[#05090d] p-4 text-sm text-cyan-100">EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON){"\n"}SELECT ...;</pre>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold">Read the plan in this order</h2>
          <div className="mt-6 space-y-4">
            {[
              ["1. Total execution time", "Establish the scale of the problem before optimizing individual nodes."],
              ["2. Expensive nodes", "Look for nodes that consume meaningful time or repeat many times."],
              ["3. Actual rows and loops", "A node that looks cheap once can dominate runtime when it executes thousands of times."],
              ["4. Estimates vs reality", "Find the first place where Plan Rows and Actual Rows diverge sharply."],
              ["5. Work that was discarded", "Rows removed by filters, join filters, and rechecks expose effort that produced no result."],
              ["6. Memory and I/O signals", "Disk-backed sorts, hash batches, reads and temporary blocks can reveal resource pressure."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/35 p-5">
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-2 leading-7 text-slate-400">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold">Five signals worth understanding</h2>
          <div className="mt-6 grid gap-4">
            {signals.map(([title, copy, href]) => (
              <Link key={href} href={href} className="group rounded-2xl border border-slate-800 bg-slate-900/35 p-5 hover:border-cyan-400/30">
                <div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold group-hover:text-cyan-200">{title}</h3><p className="mt-2 leading-7 text-slate-400">{copy}</p></div><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-600 group-hover:text-cyan-300"/></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold">What EXPLAIN cannot prove by itself</h2>
          <div className="mt-6 space-y-3">
            {[
              "That a missing index is definitely the root cause.",
              "That increasing work_mem globally is safe under your concurrency.",
              "That a sequential scan is wrong merely because it exists.",
              "That one plan is representative of every parameter value or production workload.",
              "That changing SQL is better than fixing statistics, schema, configuration, or data distribution.",
            ].map((item) => <div key={item} className="flex gap-3 rounded-xl border border-slate-800 bg-slate-900/35 p-4"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-400"/><p className="text-slate-300">{item}</p></div>)}
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-8 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-cyan-300"/>
          <h2 className="mt-4 text-3xl font-semibold">Use the plan you already have</h2>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-400">Paste text or JSON. PlanCheck runs deterministic checks locally and shows the evidence behind each finding.</p>
          <Link href="/analyze" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-6 py-3 font-semibold text-slate-950">Analyze EXPLAIN output <ArrowRight className="h-4 w-4"/></Link>
        </section>
      </article>
    </main>
  );
}
