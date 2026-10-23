import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, AlertTriangle, Database, ShieldCheck } from "lucide-react";

type Guide = {
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  observed: string[];
  means: string[];
  checks: string[];
  notAlways: string[];
  example: string;
};

const guides: Record<string, Guide> = {
  "rows-removed-by-filter": {
    title: "Rows Removed by Filter in PostgreSQL EXPLAIN",
    metaTitle: "Rows Removed by Filter: What It Means",
    description: "Understand PostgreSQL's Rows Removed by Filter metric, when it signals wasted work, and what to check before changing an index or query.",
    intro: "Rows Removed by Filter tells you how many rows were read by a plan node but rejected by its filter condition. A large value can reveal expensive work that produces little useful output — but the number needs context.",
    observed: ["The executor visited rows at this node.", "The filter rejected some or all of those rows.", "With EXPLAIN ANALYZE, the value reflects actual execution rather than an estimate."],
    means: ["A high rejection ratio can indicate that a scan is doing substantial work for few returned rows.", "If the node is slow and examines many rows, filter selectivity becomes worth investigating.", "The metric alone does not prove that an index is missing."],
    checks: ["Compare rows returned with rows removed.", "Check the node's actual execution time and loops.", "Verify whether a useful index already exists.", "Check whether the predicate is selective enough for an index to help.", "Compare planner estimates with actual rows."],
    notAlways: ["Small tables may be faster to scan sequentially.", "Analytics queries may intentionally read a large fraction of a table.", "A high count with negligible execution time may not be worth optimizing."],
    example: `Seq Scan on orders
  Filter: (customer_id = 42)
  Rows Removed by Filter: 1,399,944
  Actual Rows: 56
  Actual Total Time: 486.2 ms`
  },
  "sequential-scan": {
    title: "Sequential Scan in PostgreSQL EXPLAIN",
    metaTitle: "PostgreSQL Sequential Scan: When Is It Bad?",
    description: "Learn when a PostgreSQL Seq Scan is healthy, when it becomes expensive, and what evidence to inspect before adding an index.",
    intro: "A Sequential Scan reads table pages in sequence. It is not automatically a problem: PostgreSQL often chooses it correctly when a query needs much of a table or when the relation is small.",
    observed: ["The planner chose a Seq Scan for the relation.", "EXPLAIN ANALYZE shows the real rows and time spent.", "Filters and Rows Removed by Filter show how much scanned work was discarded."],
    means: ["Large scans that return very few rows deserve investigation.", "Fast sequential scans can be perfectly healthy.", "An index is useful only when its access pattern is actually cheaper than reading the table."],
    checks: ["Relation size and actual rows scanned.", "Rows removed by filter.", "Filter selectivity.", "Existing indexes and their column order.", "Whether statistics are current."],
    notAlways: ["Whole-table reporting queries.", "Small relations.", "Queries returning a large percentage of rows."],
    example: `Seq Scan on events
  Actual Rows: 2,450,000
  Rows Removed by Filter: 31
  Actual Total Time: 205.1 ms`
  },
  "row-estimate-mismatch": {
    title: "PostgreSQL Row Estimate Mismatch",
    metaTitle: "PostgreSQL Bad Row Estimates Explained",
    description: "Understand Plan Rows vs Actual Rows in EXPLAIN ANALYZE and why estimation errors can lead PostgreSQL toward poor join and scan choices.",
    intro: "PostgreSQL chooses a plan before executing the query, using estimated row counts. When those estimates differ sharply from reality, the optimizer may choose algorithms that fit the estimate but not the actual workload.",
    observed: ["Plan Rows is the optimizer's expected cardinality.", "Actual Rows is what execution produced.", "Large ratios reveal where the planner's mental model diverged from reality."],
    means: ["Underestimation can make nested loops look cheaper than they become.", "Overestimation can discourage otherwise efficient access paths.", "The cause can involve stale statistics, skew, correlated columns, or expressions."],
    checks: ["Run ANALYZE if statistics may be stale.", "Inspect data skew.", "Consider extended statistics for correlated columns.", "Check expressions and casts in predicates.", "Inspect the first node where estimates diverge materially."],
    notAlways: ["Small absolute row counts can have huge ratios but little cost.", "Parameter-sensitive queries may naturally vary.", "A mismatch is a clue, not proof of the root cause."],
    example: `Nested Loop
  Plan Rows: 14
  Actual Rows: 28,492
  Actual Loops: 1`
  },
  "nested-loop": {
    title: "Nested Loop in PostgreSQL EXPLAIN",
    metaTitle: "PostgreSQL Nested Loop: Slow Query Diagnosis",
    description: "Diagnose slow PostgreSQL Nested Loop plans by checking loops, row estimates, inner-node cost and join selectivity.",
    intro: "Nested Loop is excellent when the outer side is small and the inner lookup is cheap. It becomes dangerous when an underestimated outer relation causes an expensive inner operation to repeat thousands of times.",
    observed: ["The inner branch executes once per outer row or loop.", "Actual Loops exposes how many repetitions occurred.", "Timing and row estimates reveal whether repetition was expected."],
    means: ["A cheap inner lookup repeated many times may dominate runtime.", "Bad cardinality estimates often contribute to unexpected loop amplification.", "The node type alone is not evidence of a bad plan."],
    checks: ["Actual Loops on the inner node.", "Rows produced by the outer node.", "Index access on the inner relation.", "Plan Rows vs Actual Rows before the join.", "Join predicates and data distribution."],
    notAlways: ["Small outer inputs with indexed inner lookups are ideal use cases.", "Nested loops can beat hash joins for highly selective queries.", "Focus on measured time, not the node name."],
    example: `Nested Loop
  Actual Rows: 48,391
  -> Index Scan on customers
  -> Index Scan on orders
       Actual Loops: 48,391`
  },
  "disk-sort": {
    title: "PostgreSQL Disk Sort and work_mem",
    metaTitle: "PostgreSQL Disk Sort: EXPLAIN Diagnosis",
    description: "Learn how to identify external merge disk sorts in PostgreSQL EXPLAIN ANALYZE and what to check before increasing work_mem.",
    intro: "When a sort cannot fit in its available memory, PostgreSQL can spill to temporary disk. EXPLAIN ANALYZE reports the sort method and disk usage, making this one of the more directly measurable performance signals.",
    observed: ["Sort Method can show external merge or another disk-backed method.", "Disk usage shows spill size.", "The sort node's timing and input rows reveal the cost."],
    means: ["Disk I/O can make large sorts substantially slower.", "Increasing work_mem may help, but it applies per sort/hash operation and can multiply across concurrent queries.", "Avoiding or reducing the sort can be better than simply allocating more memory."],
    checks: ["Sort Method and disk usage.", "Rows entering the sort.", "Current work_mem.", "Concurrent query volume.", "Whether an index can satisfy the desired order.", "Whether earlier filtering can reduce sort input."],
    notAlways: ["A small spill with low runtime may not matter.", "Globally increasing work_mem can create memory pressure.", "The safest fix depends on concurrency and query shape."],
    example: `Sort
  Sort Key: created_at DESC
  Sort Method: external merge  Disk: 84240kB
  Actual Rows: 1,201,844`
  }
};

export function generateStaticParams() {
  return Object.keys(guides).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const guide = guides[slug];
    if (!guide) return {};
    return {
      title: guide.metaTitle,
      description: guide.description,
      alternates: { canonical: `https://plancheck.dev/postgresql-explain/${slug}` },
      openGraph: { title: `${guide.metaTitle} | PlanCheck`, description: guide.description, type: "article" }
    };
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides[slug];
  if (!guide) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: guide.title,
    description: guide.description,
    author: { "@type": "Organization", name: "PlanCheck" },
    publisher: { "@type": "Organization", name: "PlanCheck" },
    mainEntityOfPage: `https://plancheck.dev/postgresql-explain/${slug}`
  };

  return (
    <main className="min-h-screen bg-[#071015] text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold"><Database className="h-5 w-5 text-cyan-300"/>PlanCheck</Link>
        <Link href="/analyze" className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950">Analyze your plan</Link>
      </nav>

      <article className="mx-auto max-w-4xl px-6 pb-24 pt-16">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-cyan-300">PostgreSQL EXPLAIN guide</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">{guide.title}</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">{guide.intro}</p>

        <div className="mt-10 rounded-2xl border border-slate-800 bg-[#05090d] p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Example EXPLAIN output</p>
          <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-cyan-100">{guide.example}</pre>
        </div>

        {[
          ["What PostgreSQL is telling you", guide.observed, "cyan"],
          ["What it can mean", guide.means, "violet"],
          ["What to check next", guide.checks, "emerald"],
        ].map(([title, items, tone]: any) => (
          <section key={title} className="mt-12">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <div className="mt-5 space-y-3">
              {items.map((item: string) => <div key={item} className="flex gap-3 rounded-xl border border-slate-800 bg-slate-900/35 p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300"/><p className="leading-7 text-slate-300">{item}</p></div>)}
            </div>
          </section>
        ))}

        <section className="mt-12 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
          <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-300"/><h2 className="text-xl font-semibold">When this is not automatically a problem</h2></div>
          <ul className="mt-4 space-y-2 text-slate-300">{guide.notAlways.map(x => <li key={x}>• {x}</li>)}</ul>
        </section>

        <section className="mt-14 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-8 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-cyan-300"/>
          <h2 className="mt-4 text-3xl font-semibold">Check your actual plan</h2>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-400">PlanCheck analyzes TEXT or JSON locally in your browser. Your SQL and plans are not uploaded.</p>
          <Link href="/analyze" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-6 py-3 font-semibold text-slate-950">Analyze EXPLAIN output <ArrowRight className="h-4 w-4"/></Link>
        </section>
      </article>
    </main>
  );
}
