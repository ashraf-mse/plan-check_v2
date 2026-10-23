# pg-plancheck-core

Shared deterministic analysis engine for [PlanCheck](https://plancheck.dev).

This package contains PlanCheck's PostgreSQL EXPLAIN parser, analysis manager, and evidence-based detectors. It has no network dependency and does not upload query plans.

## API

```ts
import { parsePlan, AnalysisManager } from "pg-plancheck-core";

const parsed = parsePlan(explainText);
const findings = await new AnalysisManager().analyze(parsed);
```

The package is primarily intended for PlanCheck's web and CLI clients.
