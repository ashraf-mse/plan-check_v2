import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Database, LockKeyhole,
  ScanSearch, ShieldCheck, TerminalSquare, Zap, Search, Gauge, BrainCircuit
} from "lucide-react";

const detectors = [
  "Sequential scan waste","Row-estimate mismatch","Nested-loop amplification",
  "Disk sort spills","Hash memory pressure","Bitmap rechecks",
  "Ineffective LIMITs","Heap fetch overhead","Join-filter waste",
  "CTE materialization","Trigger overhead","JIT overhead",
  "Parallel-query issues","Recursive explosions","Missing-index signals","Sort memory pressure"
];

const guides = [
  ["Rows Removed by Filter","/postgresql-explain/rows-removed-by-filter"],
  ["Sequential Scan","/postgresql-explain/sequential-scan"],
  ["Row Estimate Mismatch","/postgresql-explain/row-estimate-mismatch"],
  ["Nested Loop","/postgresql-explain/nested-loop"],
  ["Disk Sort Spill","/postgresql-explain/disk-sort"],
];

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PlanCheck",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: "https://plancheck.dev",
    description: "Evidence-based PostgreSQL EXPLAIN analysis with deterministic performance diagnostics.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "PostgreSQL EXPLAIN ANALYZE parsing",
      "Deterministic performance diagnostics",
      "Text and JSON input",
      "Client-side analysis",
      "Plan visualization"
    ]
  };

  return (
    <main className="min-h-screen bg-[#071015] text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="absolute inset-x-0 top-0 h-[680px] bg-[radial-gradient(circle_at_50%_-20%,rgba(34,211,238,.22),transparent_42%),radial-gradient(circle_at_85%_20%,rgba(139,92,246,.12),transparent_30%)] pointer-events-none" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-white">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
            <Database className="h-5 w-5 text-cyan-300" />
          </div>
          <span>PlanCheck</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/guides/postgresql-explain-analyze" className="hidden text-sm text-slate-400 hover:text-white md:block">Guide</Link>
          <a href="https://github.com/ashraf-mse/plan-check_v2" className="hidden text-sm text-slate-400 hover:text-white sm:block">GitHub</a>
          <Link href="/analyze" className="rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium hover:border-cyan-400/40">Open analyzer</Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 text-center lg:pt-28">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
          <ShieldCheck className="h-4 w-4" /> Evidence-based PostgreSQL diagnostics
        </div>
        <h1 className="mx-auto max-w-5xl text-balance text-5xl font-semibold tracking-[-0.04em] text-white md:text-7xl">
          Your PostgreSQL query is slow. <span className="text-cyan-300">Find out why.</span>
        </h1>
        <p className="mx-auto mt-7 max-w-3xl text-pretty text-lg leading-8 text-slate-300 md:text-xl">
          Paste an EXPLAIN ANALYZE plan. PlanCheck finds expensive scans, bad row estimates,
          disk spills, inefficient joins, trigger overhead and more — using deterministic rules,
          not AI guesses.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/analyze" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-200">
            Analyze a plan — free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/analyze?example=1" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-6 py-3.5 font-semibold text-white hover:border-slate-500">
            See an example
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400"/>No signup</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400"/>TEXT + JSON</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400"/>Runs in your browser</span>
          <span className="flex items-center gap-1.5"><LockKeyhole className="h-4 w-4 text-emerald-400"/>Plans never leave your device</span>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b151b] shadow-2xl shadow-cyan-950/20">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-red-300">High impact</p><h2 className="mt-1 text-xl font-semibold">High-Effort Zero-Result Scan</h2></div>
            <span className="rounded-lg bg-red-400/10 px-3 py-1 text-sm text-red-300">Verified</span>
          </div>
          <div className="grid gap-0 md:grid-cols-3">
            <div className="border-b border-slate-800 p-6 md:border-b-0 md:border-r"><p className="text-sm text-slate-500">Rows examined</p><p className="mt-2 text-3xl font-semibold">1,399,944</p></div>
            <div className="border-b border-slate-800 p-6 md:border-b-0 md:border-r"><p className="text-sm text-slate-500">Rows returned</p><p className="mt-2 text-3xl font-semibold">0</p></div>
            <div className="p-6"><p className="text-sm text-slate-500">Work discarded</p><p className="mt-2 text-3xl font-semibold text-red-300">100%</p></div>
          </div>
          <div className="grid gap-6 border-t border-slate-800 p-6 md:grid-cols-2">
            <div><p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">What happened</p><p className="mt-2 leading-7 text-slate-300">The scan examined almost 1.4M rows and the filter rejected every one. The work is measurable directly from the plan.</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wider text-violet-300">What to check next</p><p className="mt-2 leading-7 text-slate-300">Verify index availability, predicate selectivity, and planner estimates before changing the query or schema.</p></div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800/80 bg-slate-950/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-cyan-300">Why PlanCheck</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">It tells you what the plan proves — and what it doesn’t.</h2>
            <p className="mt-5 max-w-xl leading-8 text-slate-400">
              Generic AI advice can sound confident even when an EXPLAIN plan cannot support the claim.
              PlanCheck separates observation, interpretation, and next checks so you can optimize without pretending.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [ScanSearch,"Observed","Facts PostgreSQL actually reported in the execution plan."],
              [BrainCircuit,"Interpreted","Why those facts commonly matter for performance."],
              [Search,"Next checks","What to verify before you change indexes, SQL, or configuration."],
              [ShieldCheck,"Bounded","Limitations are explicit when the plan cannot prove something."]
            ].map(([Icon,title,copy]: any)=>(
              <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <Icon className="h-5 w-5 text-cyan-300"/><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center"><p className="text-sm font-semibold uppercase tracking-[.18em] text-cyan-300">Already built in</p><h2 className="mt-4 text-4xl font-semibold">16+ deterministic performance checks</h2></div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {detectors.map((d)=><div key={d} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-300"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400"/>{d}</div>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-[#0b151b] p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <TerminalSquare className="h-8 w-8 text-cyan-300"/>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[.18em] text-cyan-300">Coming next</p>
              <h2 className="mt-3 text-4xl font-semibold">PlanCheck in your terminal.</h2>
              <p className="mt-4 leading-8 text-slate-400">The web app is the fastest way to diagnose a plan. The CLI will bring the same engine into local workflows, CI and plan-regression checks.</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-[#05090d] p-5 font-mono text-sm">
              <p className="text-slate-500">$ npx plancheck analyze plan.json</p>
              <p className="mt-5 text-emerald-300">✓ Analysis complete</p>
              <p className="mt-3 text-slate-300">2 high-impact findings</p>
              <p className="mt-1 text-slate-300">3 medium-impact findings</p>
              <p className="mt-5 text-cyan-300">$ plancheck compare before.json after.json</p>
              <p className="mt-3 text-red-300">✕ Regression: execution +183%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex items-end justify-between gap-6"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-cyan-300">PostgreSQL EXPLAIN library</p><h2 className="mt-3 text-3xl font-semibold">Understand the numbers behind your plan.</h2></div></div>
        <Link href="/guides/postgresql-explain-analyze" className="mt-8 flex items-center justify-between gap-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5 hover:border-cyan-400/40">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Start here</p><h3 className="mt-1 text-xl font-semibold">How to read PostgreSQL EXPLAIN ANALYZE</h3><p className="mt-2 text-sm text-slate-400">A practical walkthrough of rows, loops, estimates, scans, joins, sorts and the signals that matter.</p></div>
          <ArrowRight className="h-5 w-5 shrink-0 text-cyan-300"/>
        </Link>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {guides.map(([title,href])=><Link key={href} href={href} className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-5 hover:border-cyan-400/30"><Gauge className="h-5 w-5 text-cyan-300"/><h3 className="mt-4 font-semibold group-hover:text-cyan-200">{title}</h3><span className="mt-4 inline-flex items-center gap-1 text-sm text-slate-500">Read guide <ArrowRight className="h-3.5 w-3.5"/></span></Link>)}
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-950/50">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
          <Zap className="h-8 w-8 text-cyan-300"/>
          <h2 className="mt-5 text-4xl font-semibold">Stop guessing at query plans.</h2>
          <p className="mt-4 max-w-2xl text-lg text-slate-400">Paste the plan. See the evidence. Know what to investigate next.</p>
          <Link href="/analyze" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-6 py-3.5 font-semibold text-slate-950 hover:bg-cyan-200">Analyze a PostgreSQL plan <ArrowRight className="h-4 w-4"/></Link>
          <div className="mt-10 flex flex-wrap justify-center gap-5 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300">Privacy</Link>
            <Link href="/guides/postgresql-explain-analyze" className="hover:text-slate-300">EXPLAIN guide</Link>
            <a href="https://github.com/ashraf-mse/plan-check_v2" className="hover:text-slate-300">GitHub</a>
          </div>
        </div>
      </section>
    </main>
  );
}
