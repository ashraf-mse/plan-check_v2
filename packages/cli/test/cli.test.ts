import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { AnalysisManager, parsePlan } from 'pg-plancheck-core';

test('parses a JSON plan and produces deterministic findings', async () => {
  const input = await readFile(new URL('../fixtures/nested-loop.json', import.meta.url), 'utf8');
  const parsed = parsePlan(input);
  const findings = await new AnalysisManager().analyze(parsed);

  assert.equal(parsed.executionTimeMs, 821.4);
  assert.equal(parsed.planningTimeMs, 2.9);
  assert.ok(findings.some(f => f.id.startsWith('row_mismatch_')));
  assert.ok(findings.some(f => f.id.startsWith('nested_loop_')));
});

test('rejects empty input', () => {
  assert.throws(() => parsePlan('   '), /provide PostgreSQL EXPLAIN output/i);
});
