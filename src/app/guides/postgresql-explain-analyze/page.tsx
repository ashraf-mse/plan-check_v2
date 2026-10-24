import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Database,
  Gauge, GitBranch, HardDrive, Layers3, MemoryStick, ShieldCheck,
  TableProperties, Terminal, TimerReset
} from "lucide-react";

export const metadata: Metadata = {
  title: "How to Read PostgreSQL EXPLAIN ANALYZE",
  description: "Learn how to read PostgreSQL EXPLAIN ANALYZE: costs, rows, loops, scans, joins, buffers, sorts, memory, triggers, JIT, and practical diagnosis.",
  alternates: { canonical: "https://plancheck.dev/guides/postgresql-explain-analyze" },
  openGraph: {
    title: "How to Read PostgreSQL EXPLAIN ANALYZE",
    description: "A practical evidence-first guide to understanding PostgreSQL execution plans.",
    type: "article",
    url: "https://plancheck.dev/guides/postgresql-explain-analyze",
  },
};

const toc = [
  ["explain-vs-analyze", "EXPLAIN vs EXPLAIN ANALYZE"],
  ["safe-command", "Start with useful output"],
  ["tree", "How to read the plan tree"],
  ["costs", "Startup cost and total cost"],
  ["rows", "Estimated rows vs actual rows"],
  ["loops", "Loops: the number people miss"],
  ["timing", "Actual timing"],
  ["scans", "Scan types"],
  ["joins", "Join types"],
  ["filters", "Filters and discarded work"],
  ["buffers", "BUFFERS and I/O"],
  ["sorts", "Sorts, memory and disk spills"],
  ["parallel", "Parallel execution"],
  ["planning", "Planning vs execution time"],
  ["triggers-jit", "Triggers and JIT"],
  ["walkthrough", "Worked example"],
  ["checklist", "Practical checklist"],
];

const Signal = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/35 p-5">
    <h3 className="font-semibold text-white">{title}</h3>
    <div className="mt-2 text-[15px] leading-7 text-slate-400">{children}</div>
  </div>
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <pre className="mt-5 overflow-x-auto rounded-xl border border-slate-800 bg-[#05090d] p-5 text-sm leading-7 text-cyan-100">
    {children}
  </pre>
);

export default function ExplainAnalyzeGuide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "How to Read PostgreSQL EXPLAIN ANALYZE",
    description: "A complete practical, evidence-first guide to reading PostgreSQL query plans.",
    author: { "@type": "Organization", name: "PlanCheck" },
    publisher: { "@type": "Organization", name: "PlanCheck" },
    mainEntityOfPage: "https://plancheck.dev/guides/postgresql-explain-analyze",
    about: ["PostgreSQL", "EXPLAIN ANALYZE", "query optimization", "database performance"],
  };

  return (
    <main className="min-h-screen bg-[#071015] text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#071015]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Database className="h-5 w-5 text-cyan-300" />PlanCheck
          </Link>
          <div className="flex items-center gap-4">
            <a href="#checklist" className="hidden text-sm text-slate-400 hover:text-white sm:block">Checklist</a>
            <Link href="/analyze" className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950">
              Analyze a plan
            </Link>
          </div>
        </div>
      </nav>

      <article className="mx-auto max-w-6xl px-6 pb-28 pt-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-cyan-300">Practical PostgreSQL guide</p>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            How to read PostgreSQL EXPLAIN ANALYZE
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            A query plan becomes much easier to understand when you stop reading it as a wall of text.
            Follow the evidence: total runtime, repeated work, row estimates, discarded rows, memory and I/O.
            This guide shows you what each important field means and, just as importantly, what it does not prove.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            {["Costs ≠ milliseconds", "Loops matter", "Rows reveal bad estimates", "Buffers reveal I/O", "Node names are not verdicts"].map(x => (
              <span key={x} className="rounded-full border border-slate-700 bg-slate-900/50 px-3 py-1.5 text-slate-300">{x}</span>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
            <div className="flex gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-300" />
              <div>
                <h2 className="text-xl font-semibold">Important: EXPLAIN ANALYZE actually executes the statement</h2>
                <p className="mt-2 leading-7 text-slate-300">
                  For SELECT queries this normally just means the query runs. For INSERT, UPDATE, DELETE and other
                  statements with side effects, those effects happen unless you protect yourself with a transaction
                  and roll it back.
                </p>
                <Code>{`BEGIN;
EXPLAIN (ANALYZE, BUFFERS) UPDATE ...;
ROLLBACK;`}</Code>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900/30 p-5 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">In this guide</p>
            <nav className="mt-4 space-y-1">
              {toc.map(([id,label]) => (
                <a key={id} href={`#${id}`} className="block rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800/60 hover:text-cyan-200">
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 max-w-4xl">
            <section id="explain-vs-analyze" className="scroll-mt-28">
              <p className="text-sm font-semibold uppercase tracking-[.16em] text-cyan-300">01 · Fundamentals</p>
              <h2 className="mt-3 text-3xl font-semibold">EXPLAIN vs EXPLAIN ANALYZE</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Signal title="EXPLAIN">
                  Shows the plan PostgreSQL intends to use: estimated cost, estimated rows, node types and plan structure.
                  The query is planned but not executed.
                </Signal>
                <Signal title="EXPLAIN ANALYZE">
                  Executes the statement and adds measured values such as actual time, actual rows and loops so you can
                  compare the planner's expectations with reality.
                </Signal>
              </div>
              <p className="mt-5 leading-8 text-slate-400">
                Plain EXPLAIN is useful for understanding the planner's decision. EXPLAIN ANALYZE is usually more useful
                for performance diagnosis because it exposes what really happened during execution.
              </p>
            </section>

            <section id="safe-command" className="mt-16 scroll-mt-28">
              <div className="flex items-center gap-3"><Terminal className="h-6 w-6 text-cyan-300"/><h2 className="text-3xl font-semibold">Start with useful output</h2></div>
              <p className="mt-4 leading-8 text-slate-400">
                For a diagnostic plan, include actual execution and buffer information. JSON is easiest for tools and
                structured analysis, while text is convenient for humans. PlanCheck accepts both.
              </p>
              <Code>{`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT ...;`}</Code>
              <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/35 p-4 text-sm leading-7 text-slate-400">
                If exact node timing overhead is a concern during production investigation, PostgreSQL also supports
                disabling per-node timing while still collecting execution information. Use that deliberately; don't
                compare results from different EXPLAIN settings as if they were identical.
              </div>
            </section>

            <section id="tree" className="mt-16 scroll-mt-28">
              <div className="flex items-center gap-3"><GitBranch className="h-6 w-6 text-cyan-300"/><h2 className="text-3xl font-semibold">How to read the plan tree</h2></div>
              <p className="mt-4 leading-8 text-slate-400">
                Indentation represents parent/child relationships. Child nodes produce rows that feed their parent.
                A parent can combine, filter, sort or aggregate those rows. Do not simply add every node's time together:
                parent and child timing can overlap.
              </p>
              <Code>{`Nested Loop
  -> Index Scan on customers
  -> Index Scan on orders`}</Code>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <Signal title="Start at the top">Check total execution time and the final result shape.</Signal>
                <Signal title="Then inspect expensive branches">Look for slow nodes, large loops, spills and discarded rows.</Signal>
                <Signal title="Trace backward">Find the earliest point where reality starts diverging from the estimates.</Signal>
              </div>
            </section>

            <section id="costs" className="mt-16 scroll-mt-28">
              <div className="flex items-center gap-3"><Gauge className="h-6 w-6 text-cyan-300"/><h2 className="text-3xl font-semibold">Startup cost and total cost</h2></div>
              <Code>{`Seq Scan on orders  (cost=0.00..25431.00 rows=500000 width=48)`}</Code>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Signal title="Startup cost">Estimated work required before the node can return its first row.</Signal>
                <Signal title="Total cost">Estimated work required if the node runs to completion.</Signal>
              </div>
              <p className="mt-5 leading-8 text-slate-400">
                These cost values are planner units, <strong className="text-white">not milliseconds</strong>. Their role is
                to compare candidate plans using PostgreSQL's cost model. A cost of 10,000 does not mean 10 seconds.
              </p>
            </section>

            <section id="rows" className="mt-16 scroll-mt-28">
              <div className="flex items-center gap-3"><TableProperties className="h-6 w-6 text-cyan-300"/><h2 className="text-3xl font-semibold">Estimated rows vs actual rows</h2></div>
              <Code>{`Plan Rows:   14
Actual Rows: 28,492`}</Code>
              <p className="mt-5 leading-8 text-slate-400">
                This is one of the strongest signals in a plan. PostgreSQL chooses a strategy before execution using
                estimates. When the estimate is badly wrong, it may choose a join or access method that was sensible for
                the estimate but expensive for the real cardinality.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Signal title="Underestimation">
                  Can make repeated operations such as nested loops look much cheaper than they become.
                </Signal>
                <Signal title="Overestimation">
                  Can discourage access paths that would have been attractive for the actual number of rows.
                </Signal>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-500">
                Common things to investigate include statistics freshness, data skew, correlated columns, expressions,
                casts and parameter-sensitive workloads. A mismatch is evidence of planner uncertainty, not proof of one specific fix.
              </p>
              <Link href="/postgresql-explain/row-estimate-mismatch" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-300">
                Deep dive: row estimate mismatch <ArrowRight className="h-4 w-4"/>
              </Link>
            </section>

            <section id="loops" className="mt-16 scroll-mt-28">
              <div className="flex items-center gap-3"><TimerReset className="h-6 w-6 text-cyan-300"/><h2 className="text-3xl font-semibold">Loops: the number people miss</h2></div>
              <Code>{`Index Scan using orders_customer_idx
(actual time=0.020..0.025 rows=10 loops=10000)`}</Code>
              <p className="mt-5 leading-8 text-slate-400">
                When a node executes more than once, PostgreSQL reports the displayed actual time and row count as
                per-execution averages. The loops value tells you how many executions occurred. A node that takes only
                0.025 ms once can still matter when repeated 10,000 times.
              </p>
              <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
                <p className="font-semibold text-cyan-200">Mental model</p>
                <p className="mt-2 leading-7 text-slate-300">
                  Tiny per-loop cost × huge loop count = potentially significant total work.
                </p>
              </div>
            </section>

            <section id="timing" className="mt-16 scroll-mt-28">
              <h2 className="text-3xl font-semibold">Actual startup time and actual total time</h2>
              <Code>{`actual time=0.128..12.377 rows=582 loops=1`}</Code>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Signal title="Actual startup time">Approximate elapsed time before the node produced its first row.</Signal>
                <Signal title="Actual total time">Approximate elapsed time until the node finished for one execution.</Signal>
              </div>
              <p className="mt-5 leading-8 text-slate-400">
                Actual times are milliseconds of real elapsed time, unlike planner costs. Use them together with rows and
                loops. Do not rank nodes only by their displayed time without understanding the plan hierarchy and repetition.
              </p>
            </section>

            <section id="scans" className="mt-16 scroll-mt-28">
              <div className="flex items-center gap-3"><Layers3 className="h-6 w-6 text-cyan-300"/><h2 className="text-3xl font-semibold">Scan types</h2></div>
              <div className="mt-6 space-y-4">
                <Signal title="Sequential Scan (Seq Scan)">
                  Reads table pages sequentially. This can be exactly right for small tables or queries that need a large
                  fraction of a relation. A Seq Scan is not automatically a problem.
                </Signal>
                <Signal title="Index Scan">
                  Uses an index to find candidate rows, then fetches table rows as needed. Excellent for many selective
                  access patterns, but not automatically better than a sequential scan.
                </Signal>
                <Signal title="Index Only Scan">
                  Can satisfy the query from index data when visibility information allows it. Heap Fetches tells you how
                  often PostgreSQL still had to visit the heap.
                </Signal>
                <Signal title="Bitmap Index Scan + Bitmap Heap Scan">
                  Builds a bitmap of matching locations, then visits heap pages. Useful when many rows match but random
                  index-by-index heap access would be inefficient.
                </Signal>
              </div>
              <Link href="/postgresql-explain/sequential-scan" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-300">
                Deep dive: when a sequential scan is actually a problem <ArrowRight className="h-4 w-4"/>
              </Link>
            </section>

            <section id="joins" className="mt-16 scroll-mt-28">
              <h2 className="text-3xl font-semibold">Join types</h2>
              <div className="mt-6 grid gap-4">
                <Signal title="Nested Loop">
                  For each outer row, PostgreSQL evaluates the inner side. It can be excellent for a small outer input with
                  cheap indexed lookups, but dangerous when the outer side is much larger than estimated.
                </Signal>
                <Signal title="Hash Join">
                  Builds a hash table from one input and probes it with the other. Often effective for equality joins over
                  larger inputs. Memory pressure can force extra batches and I/O.
                </Signal>
                <Signal title="Merge Join">
                  Consumes sorted inputs and advances through them together. It can be attractive when inputs are already
                  ordered or efficient sorting is possible.
                </Signal>
              </div>
              <p className="mt-5 leading-8 text-slate-400">
                There is no universally “best” join type. Diagnose the evidence around cardinality, loops, timing, sort/hash
                work and available access paths rather than treating the node name as a verdict.
              </p>
              <Link href="/postgresql-explain/nested-loop" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-300">
                Deep dive: nested-loop amplification <ArrowRight className="h-4 w-4"/>
              </Link>
            </section>

            <section id="filters" className="mt-16 scroll-mt-28">
              <h2 className="text-3xl font-semibold">Filters and discarded work</h2>
              <Code>{`Filter: (customer_id = 42)
Rows Removed by Filter: 1,399,944
Actual Rows: 56`}</Code>
              <p className="mt-5 leading-8 text-slate-400">
                This tells you that the node did substantial work and rejected almost all of it. That can be a valuable
                clue, especially when the node is slow. But it does not prove an index is missing or that an index would
                be cheaper.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Signal title="Filter">Applied to rows within a node.</Signal>
                <Signal title="Join Filter">Applied while evaluating a join and may expose wasted join combinations.</Signal>
              </div>
              <Link href="/postgresql-explain/rows-removed-by-filter" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-300">
                Deep dive: Rows Removed by Filter <ArrowRight className="h-4 w-4"/>
              </Link>
            </section>

            <section id="buffers" className="mt-16 scroll-mt-28">
              <div className="flex items-center gap-3"><HardDrive className="h-6 w-6 text-cyan-300"/><h2 className="text-3xl font-semibold">BUFFERS and I/O</h2></div>
              <Code>{`Buffers: shared hit=18240 read=912
         temp read=4096 written=4096`}</Code>
              <div className="mt-6 space-y-4">
                <Signal title="shared hit">
                  PostgreSQL needed a shared buffer page and found it already cached, avoiding a physical read for that page.
                </Signal>
                <Signal title="shared read">
                  Shared blocks had to be read into PostgreSQL's buffer cache. This helps identify I/O-heavy parts of the plan.
                </Signal>
                <Signal title="temp read / temp written">
                  Temporary working data was read or written, commonly associated with sorts, hashes, materialization and similar operations.
                </Signal>
              </div>
              <p className="mt-5 leading-8 text-slate-400">
                Buffer counts are especially useful for distinguishing a plan that is CPU/cache heavy from one that is
                doing substantial storage I/O. If I/O timing is enabled, PostgreSQL can also expose time spent on reads and writes.
              </p>
            </section>

            <section id="sorts" className="mt-16 scroll-mt-28">
              <div className="flex items-center gap-3"><MemoryStick className="h-6 w-6 text-cyan-300"/><h2 className="text-3xl font-semibold">Sorts, memory and disk spills</h2></div>
              <Code>{`Sort Method: external merge  Disk: 84240kB`}</Code>
              <p className="mt-5 leading-8 text-slate-400">
                A disk-backed sort is directly observable evidence that the operation did not stay entirely in its available
                memory. That can matter, but “increase work_mem” is not automatically the correct global answer.
              </p>
              <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
                <p className="font-semibold text-amber-200">Check before changing memory settings</p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                  <li>• How many rows enter the sort?</li>
                  <li>• Can earlier filtering reduce the input?</li>
                  <li>• Can an index provide the required order?</li>
                  <li>• How many sorts/hashes can run concurrently?</li>
                  <li>• Is the spill large enough to matter in measured execution time?</li>
                </ul>
              </div>
              <Link href="/postgresql-explain/disk-sort" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-300">
                Deep dive: PostgreSQL disk sorts <ArrowRight className="h-4 w-4"/>
              </Link>
            </section>

            <section id="parallel" className="mt-16 scroll-mt-28">
              <h2 className="text-3xl font-semibold">Parallel execution</h2>
              <Code>{`Gather
  Workers Planned: 4
  Workers Launched: 3
  -> Parallel Seq Scan on events`}</Code>
              <p className="mt-5 leading-8 text-slate-400">
                Parallel plans can divide work across workers. Compare workers planned vs launched, inspect the work under
                Gather/Gather Merge, and remember that parallelism has coordination overhead. More workers are not automatically better.
              </p>
            </section>

            <section id="planning" className="mt-16 scroll-mt-28">
              <h2 className="text-3xl font-semibold">Planning Time vs Execution Time</h2>
              <Code>{`Planning Time:  3.421 ms
Execution Time: 812.774 ms`}</Code>
              <p className="mt-5 leading-8 text-slate-400">
                Planning Time is the time PostgreSQL spent generating and optimizing the plan after parsing/rewriting.
                Execution Time is the executor's total measured runtime and includes executor startup/shutdown and trigger
                execution that occurs during the statement. They diagnose different parts of the query lifecycle.
              </p>
            </section>

            <section id="triggers-jit" className="mt-16 scroll-mt-28">
              <h2 className="text-3xl font-semibold">Triggers and JIT</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Signal title="Trigger time">
                  A query can appear to have a cheap plan while trigger execution dominates total runtime. Always reconcile
                  node timings with total Execution Time when write statements or trigger-heavy workloads are involved.
                </Signal>
                <Signal title="JIT">
                  PostgreSQL can report JIT generation, inlining, optimization and emission time. On short queries, JIT
                  setup overhead can sometimes be large relative to useful execution work.
                </Signal>
              </div>
            </section>

            <section id="walkthrough" className="mt-16 scroll-mt-28">
              <div className="flex items-center gap-3"><BookOpen className="h-6 w-6 text-cyan-300"/><h2 className="text-3xl font-semibold">Worked example: follow the evidence</h2></div>
              <Code>{`Nested Loop  (cost=12.00..310.00 rows=12)
             (actual time=0.20..812.00 rows=48,391 loops=1)
  -> Seq Scan on customers
       (actual rows=48,391 loops=1)
       Filter: (status = 'active')
  -> Index Scan on orders_customer_idx
       (actual time=0.006..0.012 rows=4 loops=48,391)

Planning Time: 2.9 ms
Execution Time: 821.4 ms`}</Code>

              <div className="mt-6 space-y-4">
                <Signal title="Step 1 — Start with total runtime">
                  821 ms establishes that this query is worth investigating in its workload context.
                </Signal>
                <Signal title="Step 2 — Compare estimate with reality">
                  The Nested Loop expected 12 rows but produced 48,391. That is a major cardinality mismatch.
                </Signal>
                <Signal title="Step 3 — Notice repetition">
                  The inner Index Scan ran 48,391 times. Each lookup is individually cheap, but repetition amplifies the work.
                </Signal>
                <Signal title="Step 4 — Avoid jumping to a fix">
                  The plan proves the estimate was wrong and the inner scan repeated heavily. It does not, by itself, prove
                  whether the best fix is statistics, an index change, SQL restructuring, schema changes, or something else.
                </Signal>
                <Signal title="Step 5 — Check next">
                  Investigate the first bad estimate, statistics freshness, data skew and the selectivity of the predicates
                  feeding the Nested Loop before changing the join strategy indirectly.
                </Signal>
              </div>
            </section>

            <section id="checklist" className="mt-16 scroll-mt-28">
              <h2 className="text-3xl font-semibold">A practical EXPLAIN ANALYZE checklist</h2>
              <div className="mt-6 grid gap-3">
                {[
                  "Check total Execution Time and decide whether the query is actually a problem.",
                  "Find slow nodes and nodes executed many times.",
                  "Compare Plan Rows with Actual Rows and locate the first major mismatch.",
                  "Read loops before judging apparently tiny per-node timings.",
                  "Inspect Rows Removed by Filter / Join Filter for discarded work.",
                  "Look for disk-backed sorts, hash batching and temporary I/O.",
                  "Use BUFFERS to identify cache and storage pressure.",
                  "Inspect scan and join choices in context — node names alone are not problems.",
                  "Compare Workers Planned with Workers Launched in parallel plans.",
                  "Reconcile plan-node time with trigger/JIT and overall Execution Time.",
                  "Change the smallest thing supported by evidence, then measure again.",
                ].map((item, i) => (
                  <div key={item} className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/35 p-4">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cyan-400/10 text-xs font-bold text-cyan-300">{i+1}</span>
                    <p className="leading-7 text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-16 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-8 text-center md:p-10">
              <ShieldCheck className="mx-auto h-9 w-9 text-cyan-300"/>
              <h2 className="mt-4 text-3xl font-semibold">You can do this manually. PlanCheck does the first pass for you.</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-400">
                Paste PostgreSQL EXPLAIN output in text or JSON. PlanCheck runs deterministic checks locally, points to the
                evidence behind each finding, and tells you what remains unknown before you make a change.
              </p>
              <Link href="/analyze" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-6 py-3.5 font-semibold text-slate-950">
                Analyze my EXPLAIN plan <ArrowRight className="h-4 w-4"/>
              </Link>
            </section>

            <section className="mt-12 border-t border-slate-800 pt-8">
              <p className="text-sm leading-7 text-slate-500">
                Technical reference: PostgreSQL documentation for EXPLAIN and Using EXPLAIN. PlanCheck intentionally keeps
                recommendations bounded by what an execution plan can actually demonstrate.
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <a className="text-cyan-300 hover:text-cyan-200" href="https://www.postgresql.org/docs/current/sql-explain.html">PostgreSQL EXPLAIN documentation ↗</a>
                <a className="text-cyan-300 hover:text-cyan-200" href="https://www.postgresql.org/docs/current/using-explain.html">Using EXPLAIN ↗</a>
              </div>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
