import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, Search, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "PostgreSQL EXPLAIN Reference",
  description: "Evidence-first PostgreSQL EXPLAIN reference: row estimates, scans, nested loops, filters, disk sorts and practical query-plan diagnosis.",
  alternates: { canonical: "https://plancheck.dev/postgresql-explain" },
  openGraph: {
    title: "PostgreSQL EXPLAIN Reference | PlanCheck",
    description: "Practical, evidence-first explanations of the PostgreSQL EXPLAIN signals that matter.",
    type: "website",
    url: "https://plancheck.dev/postgresql-explain",
  },
};

const topics = [
  {
    title: "Rows Removed by Filter",
    href: "/postgresql-explain/rows-removed-by-filter",
    question: "What does Rows Removed by Filter mean?",
    answer: "It counts rows examined by a plan node but rejected by its filter. A large number can reveal wasted work, but it does not by itself prove that an index is missing."
  },
  {
    title: "Sequential Scan",
    href: "/postgresql-explain/sequential-scan",
    question: "Is a PostgreSQL Seq Scan always bad?",
    answer: "No. Sequential scans are often correct for small tables or queries that need a large fraction of a relation. Judge them by measured work, selectivity, table size and execution time."
  },
  {
    title: "Row Estimate Mismatch",
    href: "/postgresql-explain/row-estimate-mismatch",
    question: "Why do Plan Rows and Actual Rows differ?",
    answer: "PostgreSQL chooses a plan using estimates before execution. Stale statistics, skew, correlated columns, expressions and parameter-sensitive workloads can make those estimates diverge from reality."
  },
  {
    title: "Nested Loop",
    href: "/postgresql-explain/nested-loop",
    question: "When does a Nested Loop become expensive?",
    answer: "A Nested Loop can become expensive when an inner operation repeats far more times than expected. Actual Loops and row-estimate errors are key evidence."
  },
  {
    title: "Disk Sort",
    href: "/postgresql-explain/disk-sort",
    question: "What does external merge Disk mean?",
    answer: "It means the sort used temporary disk storage instead of remaining entirely in its available memory. The right response depends on sort size, concurrency, query shape and whether the sort can be reduced or avoided."
  },
];

const faqs = [
  {
    q: "What is PostgreSQL EXPLAIN ANALYZE?",
    a: "EXPLAIN shows the plan PostgreSQL intends to use. EXPLAIN ANALYZE also executes the statement and reports measured values such as actual rows, loops and timing."
  },
  {
    q: "Are EXPLAIN costs milliseconds?",
    a: "No. Startup Cost and Total Cost are planner cost units used to compare candidate plans. Actual Time values from EXPLAIN ANALYZE are measured in milliseconds."
  },
  {
    q: "What should I look at first in an EXPLAIN ANALYZE plan?",
    a: "Start with total Execution Time, then inspect expensive or highly repeated nodes, compare Plan Rows with Actual Rows, check discarded work, memory or disk spills, and buffer activity."
  },
  {
    q: "Does PlanCheck upload my SQL or EXPLAIN plan?",
    a: "PlanCheck analyzes plans in the browser. The production analyzer does not upload SQL text or EXPLAIN plan contents to a PlanCheck analysis server."
  }
];

export default function ExplainReferencePage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "PostgreSQL EXPLAIN Reference",
      description: "Evidence-first PostgreSQL EXPLAIN reference from PlanCheck.",
      url: "https://plancheck.dev/postgresql-explain",
      isPartOf: { "@type": "WebSite", name: "PlanCheck", url: "https://plancheck.dev" }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a }
      }))
    }
  ];

  return (
    <main className="min-h-screen bg-[#071015] text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold"><Database className="h-5 w-5 text-cyan-300"/>PlanCheck</Link>
        <Link href="/analyze" className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950">Analyze a plan</Link>
      </nav>

      <section className="mx-auto max-w-5xl px-6 pb-20 pt-16">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-cyan-300">PostgreSQL EXPLAIN reference</p>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight md:text-6xl">Understand what your query plan is actually telling you.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          PlanCheck's reference focuses on evidence, boundaries, and the signals that change diagnosis:
          estimated vs actual rows, loops, discarded work, scans, joins, memory and I/O.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/guides/postgresql-explain-analyze" className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950">
            Read the complete EXPLAIN guide <ArrowRight className="h-4 w-4"/>
          </Link>
          <Link href="/analyze" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white">
            Analyze my plan
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map(topic => (
            <Link key={topic.href} href={topic.href} className="group rounded-2xl border border-slate-800 bg-slate-900/35 p-6 hover:border-cyan-400/30">
              <Search className="h-5 w-5 text-cyan-300"/>
              <h2 className="mt-4 text-xl font-semibold group-hover:text-cyan-200">{topic.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">{topic.answer}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm text-cyan-300">Read reference <ArrowRight className="h-4 w-4"/></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-950/40">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-3xl font-semibold">Common PostgreSQL EXPLAIN questions</h2>
          <div className="mt-8 space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-slate-800 bg-slate-900/35 p-6">
                <h3 className="font-semibold text-white">{q}</h3>
                <p className="mt-3 leading-7 text-slate-400">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <ShieldCheck className="mx-auto h-8 w-8 text-cyan-300"/>
        <h2 className="mt-4 text-3xl font-semibold">Evidence first, recommendations second.</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-400">
          PlanCheck separates what PostgreSQL measured from what the plan merely suggests, so you can investigate the right thing without turning assumptions into facts.
        </p>
      </section>
    </main>
  );
}
