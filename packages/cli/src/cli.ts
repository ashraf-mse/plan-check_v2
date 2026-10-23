#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { AnalysisManager, parsePlan, type Impact, type TruthfulDetection } from 'pg-plancheck-core';

const VERSION = '0.1.0';
const impactRank: Record<Impact, number> = { low: 1, medium: 2, high: 3 };

function color(code: number, value: string, enabled: boolean) {
  return enabled ? `\x1b[${code}m${value}\x1b[0m` : value;
}

function usage() {
  return `
PlanCheck CLI v${VERSION}
Evidence-based PostgreSQL EXPLAIN analysis.

Usage:
  plancheck analyze <file|->
  plancheck <file|->
  cat plan.json | plancheck analyze -

Options:
  --json                    Output machine-readable JSON
  --min-severity <level>    Show findings at or above: low | medium | high
  --fail-on <level>         Exit 1 if a finding at or above the level exists
  --no-color                Disable ANSI colors
  -h, --help                Show help
  -v, --version             Show version

Examples:
  plancheck analyze plan.json
  plancheck analyze explain.txt --min-severity medium
  plancheck analyze plan.json --json
  plancheck analyze plan.json --fail-on high
`.trim();
}

function parseArgs(argv: string[]) {
  const args = [...argv];
  let command = 'analyze';
  if (args[0] && !args[0].startsWith('-') && args[0] === 'analyze') {
    command = args.shift()!;
  }

  let input: string | undefined;
  let json = false;
  let noColor = false;
  let help = false;
  let version = false;
  let minSeverity: Impact = 'low';
  let failOn: Impact | null = null;

  while (args.length) {
    const arg = args.shift()!;
    if (arg === '--json') json = true;
    else if (arg === '--no-color') noColor = true;
    else if (arg === '-h' || arg === '--help') help = true;
    else if (arg === '-v' || arg === '--version') version = true;
    else if (arg === '--min-severity' || arg === '--severity') {
      minSeverity = parseImpact(args.shift(), arg);
    } else if (arg === '--fail-on') {
      failOn = parseImpact(args.shift(), arg);
    } else if (arg.startsWith('-') && arg !== '-') {
      throw new Error(`Unknown option: ${arg}`);
    } else if (!input) input = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }

  return { command, input, json, noColor, help, version, minSeverity, failOn };
}

function parseImpact(value: string | undefined, option: string): Impact {
  if (value === 'low' || value === 'medium' || value === 'high') return value;
  throw new Error(`${option} requires low, medium, or high.`);
}

async function readInput(input?: string): Promise<string> {
  if (!input || input === '-') {
    if (process.stdin.isTTY && !input) {
      throw new Error('Provide a plan file or pipe EXPLAIN output on stdin.');
    }
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString('utf8');
  }
  return readFile(input, 'utf8');
}

function findingPayload(f: TruthfulDetection) {
  return {
    id: f.id,
    title: f.title,
    impact: f.impact,
    confidence: f.confidence,
    behavior: f.education.behavior,
    explanation: f.education.explanation,
    limitations: f.education.limitations,
    evidence: f.evidence.map(e => ({
      field: e.field,
      value: e.value,
      location: e.location
    })),
    docs: f.education.docsLink
  };
}

function formatMs(value: number | null) {
  return value === null ? 'n/a' : value < 1 ? `${value.toFixed(3)} ms` : `${value.toFixed(2)} ms`;
}

function printText(
  findings: TruthfulDetection[],
  executionMs: number | null,
  planningMs: number | null,
  analysisMs: number,
  useColor: boolean
) {
  const high = findings.filter(f => f.impact === 'high').length;
  const medium = findings.filter(f => f.impact === 'medium').length;
  const low = findings.filter(f => f.impact === 'low').length;

  console.log(color(36, 'PlanCheck', useColor) + ` v${VERSION}`);
  console.log('Evidence-based PostgreSQL EXPLAIN analysis');
  console.log('');
  console.log(`Execution: ${formatMs(executionMs)}`);
  console.log(`Planning:  ${formatMs(planningMs)}`);
  console.log(`Analysis:  ${formatMs(analysisMs)}`);
  console.log(`Findings:  ${high} high · ${medium} medium · ${low} low`);

  if (!findings.length) {
    console.log('');
    console.log(color(32, '✓ No findings matched the selected severity.', useColor));
    return;
  }

  for (const finding of findings) {
    console.log('');
    const label = finding.impact.toUpperCase();
    const code = finding.impact === 'high' ? 31 : finding.impact === 'medium' ? 33 : 36;
    console.log(`${color(code, label, useColor)}  ${finding.title}  ${color(90, `[${finding.confidence}]`, useColor)}`);
    console.log('─'.repeat(Math.min(76, Math.max(32, finding.title.length + 16))));
    console.log(finding.education.behavior);

    if (finding.evidence.length) {
      console.log('');
      console.log(color(90, 'Evidence', useColor));
      for (const evidence of finding.evidence.slice(0, 8)) {
        console.log(`  • ${evidence.field}: ${String(evidence.value)}`);
      }
      if (finding.evidence.length > 8) {
        console.log(`  • … ${finding.evidence.length - 8} more evidence item(s)`);
      }
    }

    if (finding.education.explanation.length) {
      console.log('');
      console.log(color(90, 'Why it matters', useColor));
      for (const line of finding.education.explanation) console.log(`  • ${line}`);
    }

    if (finding.education.limitations.length) {
      console.log('');
      console.log(color(90, 'Boundary', useColor));
      for (const line of finding.education.limitations) console.log(`  • ${line}`);
    }

    if (finding.education.docsLink) {
      console.log('');
      console.log(color(90, `Docs: ${finding.education.docsLink}`, useColor));
    }
  }
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error((error as Error).message);
    console.error('');
    console.error(usage());
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    console.log(usage());
    return;
  }
  if (options.version) {
    console.log(VERSION);
    return;
  }
  if (options.command !== 'analyze') {
    console.error(`Unknown command: ${options.command}`);
    process.exitCode = 2;
    return;
  }

  try {
    const input = await readInput(options.input);
    const parsed = parsePlan(input);
    const allFindings = await new AnalysisManager().analyze(parsed);
    const visible = allFindings.filter(f => impactRank[f.impact] >= impactRank[options.minSeverity]);

    if (options.json) {
      console.log(JSON.stringify({
        tool: 'PlanCheck',
        version: VERSION,
        executionTimeMs: parsed.executionTimeMs,
        planningTimeMs: parsed.planningTimeMs,
        analysisTimeMs: parsed.analysisTimeMs,
        findingCount: visible.length,
        findings: visible.map(findingPayload)
      }, null, 2));
    } else {
      const useColor = !options.noColor && !process.env.NO_COLOR && process.stdout.isTTY;
      printText(visible, parsed.executionTimeMs, parsed.planningTimeMs, parsed.analysisTimeMs, useColor);
    }

    if (options.failOn && allFindings.some(f => impactRank[f.impact] >= impactRank[options.failOn!])) {
      process.exitCode = 1;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`PlanCheck: ${message}`);
    process.exitCode = 2;
  }
}

await main();
