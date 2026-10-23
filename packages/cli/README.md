# pg-plancheck

PlanCheck in your terminal: deterministic, evidence-based PostgreSQL EXPLAIN analysis.

## Run without installing

```bash
npx pg-plancheck analyze plan.json
```

Text plans work too:

```bash
npx pg-plancheck analyze explain.txt
```

Pipe from stdin:

```bash
cat plan.json | npx pg-plancheck analyze -
```

## Install

```bash
npm install -g pg-plancheck
plancheck analyze plan.json
```

## Useful flags

```bash
plancheck analyze plan.json --json
plancheck analyze plan.json --min-severity high
plancheck analyze plan.json --fail-on high
```

`--fail-on` makes the process exit with code 1 when a finding at or above that impact level is present, making it useful in scripts and CI.

The CLI runs locally. It does not send the plan to PlanCheck.
