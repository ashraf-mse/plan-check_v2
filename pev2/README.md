# PEV2 PostgreSQL Explain Parser (Vendored)

This directory contains the vendored PostgreSQL explain parser from [PEV2](https://github.com/dalibo/pev2).

## Structure

```
pev2/
├── parser/
│   ├── enums.ts          # Core enums and property keys
│   ├── interfaces.ts     # TypeScript interfaces and Node/Worker classes
│   ├── plan-service.ts   # Core parsing logic
│   ├── help-service.ts   # Helper descriptions and utilities
│   └── index.ts          # Unified entry point
├── explainParser.worker.ts # Web Worker wrapper
├── license.txt           # Apache 2.0 License
└── README.md             # This file
```

## Usage

### Direct Import

```typescript
import { parseExplainText } from './pev2/parser';

const result = parseExplainText(rawExplainText);
if (result.ok) {
  console.log(result.plan);
}
```

### Web Worker

```typescript
const worker = new Worker(
  new URL('./pev2/explainParser.worker.ts', import.meta.url),
  { type: 'module' }
);

worker.onmessage = (e) => {
  const result = e.data;
  if (result.ok) {
    // Handle result.plan
  }
};

worker.postMessage({ text: rawExplainText });
```

## Attribution

This product includes software developed by Dalibo (https://github.com/dalibo/pev2) licensed under the Apache License 2.0.
