# PlanCheck

**Evidence-based PostgreSQL EXPLAIN analysis — free, private, and deterministic.**

PlanCheck helps developers understand why a PostgreSQL query is slow without pretending the execution plan proves more than it actually does.

**Live:** https://plancheck.dev

## Why PlanCheck

Many query-plan tools visualize PostgreSQL output. Generic AI can explain it, but may recommend fixes that the plan cannot prove are appropriate.

PlanCheck takes a stricter approach:

1. **Observe** what PostgreSQL actually reported.
2. **Interpret** what that evidence commonly means.
3. **Show the evidence** behind every finding.
4. **State limitations** when the plan cannot prove the root cause.
5. **Suggest what to check next** before changing SQL, indexes, or configuration.

Your EXPLAIN plan is analyzed in the browser. The production analyzer does not upload your SQL or plan contents to a server.

## What it detects

PlanCheck currently includes deterministic checks for:

- Sequential scan waste
- High-effort zero-result scans
- Row-estimate mismatches
- Nested-loop amplification
- Disk sort spills
- Hash join memory pressure
- Bitmap heap rechecks
- Ineffective LIMITs
- Excessive index-scan heap fetches
- Parallel-query issues
- Join-filter waste
- CTE materialization
- Trigger overhead
- Recursive-query explosions
- JIT overhead
- Missing-index signals

Each detector is intentionally bounded: a finding distinguishes what is **verified**, what is **inferred**, and what remains unknown from EXPLAIN alone.

## Supported input

PlanCheck accepts common PostgreSQL EXPLAIN output in both **JSON** and **text** form.

Recommended:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT ...;
```

Plain text `EXPLAIN ANALYZE` output is also supported.

## Example

```text
HIGH  Row Estimate Mismatch

Estimated rows: 14
Actual rows:    28,492

Interpretation
The planner expected far fewer rows than execution produced.
That mismatch can influence join and scan choices.

Check next
- Statistics freshness
- Data skew
- Extended statistics
- Predicate selectivity
```

## Architecture

The analyzer is intentionally deterministic.

```text
src/lib/parser/       Parse and normalize EXPLAIN output
src/lib/detectors/    Independent evidence-based detectors
src/lib/analysis/     Traverse plans and aggregate findings
src/components/       Analysis and visualization UI
src/store/            Local analysis state/history
```

Analysis history is stored locally in IndexedDB.

## Privacy

PlanCheck's production analyzer runs client-side. Query plans are not sent to the PlanCheck server for analysis.

Product analytics, when configured, contain only coarse interaction metadata such as whether an analysis succeeded and the number of findings — never SQL text, plan contents, relation names, predicates, or evidence values.

See the live privacy page for the current policy.

## CLI

PlanCheck is published on npm as [`pg-plancheck`](https://www.npmjs.com/package/pg-plancheck) and uses the same deterministic detector engine as the web application.

Run it without installing:

```bash
npx pg-plancheck analyze plan.json
```

Or install it globally:

```bash
npm install -g pg-plancheck
plancheck analyze plan.json
```

Useful examples:

```bash
cat explain.txt | npx pg-plancheck analyze -
npx pg-plancheck analyze plan.json --json
npx pg-plancheck analyze plan.json --min-severity high
npx pg-plancheck analyze plan.json --fail-on high
```

`--fail-on` exits with code 1 when a finding at or above the selected severity is present, which makes the CLI useful in scripts and CI.

The CLI runs locally and does not upload plans.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Production build:

```bash
npm run build
```

## Roadmap

Near-term:

- More high-value PostgreSQL diagnostic guides
- Analyzer UX and evidence improvements
- Before/after plan comparison
- Plan regression detection
- CI / GitHub integration

The long-term goal is to move from **"why is this query slow?"** to **"did this change introduce a PostgreSQL performance regression?"**

## Contributing

Issues and focused pull requests are welcome. For detector changes, include realistic EXPLAIN examples and preserve the evidence-first rule: do not turn an assumption into a verified claim.

## License

PlanCheck is licensed under the [Apache License 2.0](LICENSE).

The analyzer, shared core, and CLI may be used, modified, and distributed under Apache-2.0. Future hosted services or commercial features may be offered separately without changing the license of the open-source code published in this repository.


## IndexNow

PlanCheck hosts an IndexNow verification key at the site root and includes a release helper that discovers that key file automatically.

Submit only URLs that were added, materially updated, or removed:

```bash
npm run indexnow -- \
  https://plancheck.dev/postgresql-explain \
  https://plancheck.dev/guides/postgresql-explain-analyze
```

IndexNow is a freshness notification, not a guarantee that a URL will be crawled or indexed.
