import type { ParserResult } from './types.js';

const now = () => typeof performance !== 'undefined' ? performance.now() : Date.now();

export function parsePlan(input: string): ParserResult {
  const started = now();
  const text = input.trim();
  if (!text) throw new Error('Please provide PostgreSQL EXPLAIN output.');

  const timing = extractTiming(text);
  const json = tryJson(text);
  if (json) {
    return {
      source: 'fallback',
      plan: json.plan,
      executionTimeMs: json.executionTime ?? timing.executionTime,
      planningTimeMs: json.planningTime ?? timing.planningTime,
      analysisTimeMs: now() - started
    };
  }

  const plan = parseText(text);
  if (!plan) throw new Error('Unable to parse the input. Use PostgreSQL EXPLAIN text or JSON output.');

  if (!plan['Triggers']) {
    const triggers = extractTriggers(text);
    if (triggers.length) plan['Triggers'] = triggers;
  }
  if (!plan['JIT']) {
    const jit = extractJit(text);
    if (jit) plan['JIT'] = jit;
  }

  return {
    source: 'fallback',
    plan,
    executionTimeMs: timing.executionTime,
    planningTimeMs: timing.planningTime,
    analysisTimeMs: now() - started
  };
}

function extractTiming(text: string) {
  const planning = text.match(/^\s*Planning Time:\s*([\d.]+)\s*ms/im);
  const execution = text.match(/^\s*Execution Time:\s*([\d.]+)\s*ms/im);
  return {
    planningTime: planning ? Number(planning[1]) : null,
    executionTime: execution ? Number(execution[1]) : null
  };
}

function cleanJsonText(text: string): string {
  return text
    .replace(/^\s*QUERY PLAN\s*[-=]*\s*\n/im, '')
    .replace(/\n?\s*\(\d+\s+rows?\)\s*$/i, '')
    .replace(/""/g, '"')
    .trim();
}

function tryJson(text: string): { plan: any; executionTime: number | null; planningTime: number | null } | null {
  const cleaned = cleanJsonText(text);
  const match = cleaned.match(/[\[\{][\s\S]*[\]\}]/);
  if (!match) return null;
  try {
    const data = JSON.parse(match[0]);
    const root = Array.isArray(data) ? data[0] : data;
    if (!root) return null;
    const plan = root.Plan || root.plan || (root['Node Type'] ? root : null);
    if (!plan) return null;
    return {
      plan,
      executionTime: typeof root['Execution Time'] === 'number'
        ? root['Execution Time']
        : typeof plan['Actual Total Time'] === 'number' ? plan['Actual Total Time'] : null,
      planningTime: typeof root['Planning Time'] === 'number'
        ? root['Planning Time']
        : typeof plan['Planning Time'] === 'number' ? plan['Planning Time'] : null
    };
  } catch {
    return null;
  }
}

function parseText(text: string): any | null {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  const nodes: Array<{ indent: number; node: any }> = [];
  let root: any = null;
  let current: any = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(Planning Time|Execution Time):/i.test(trimmed) || trimmed === 'JIT:' || trimmed === 'Triggers:') continue;

    if (isNodeLine(line)) {
      const node = parseNodeLine(line);
      if (!node) continue;
      const indent = nodeIndent(line);

      while (nodes.length && nodes[nodes.length - 1].indent >= indent) nodes.pop();
      if (nodes.length) {
        const parent = nodes[nodes.length - 1].node;
        if (!Array.isArray(parent.Plans)) parent.Plans = [];
        parent.Plans.push(node);
      } else if (!root) {
        root = node;
      }

      nodes.push({ indent, node });
      current = node;
      continue;
    }

    if (current) parsePropertyLine(trimmed, current);
  }

  return root;
}

function isNodeLine(line: string): boolean {
  const t = line.trim().replace(/^->\s*/, '');
  return /\(cost=[\d.]+\.\.[\d.]+\s+rows=\d+\s+width=\d+\)/i.test(t);
}

function nodeIndent(line: string): number {
  const arrow = line.indexOf('->');
  return arrow >= 0 ? arrow : Math.max(0, line.search(/\S/));
}

function parseNodeLine(line: string): any | null {
  const t = line.trim().replace(/^->\s*/, '');
  const costAt = t.indexOf('  (cost=');
  const altCostAt = t.indexOf(' (cost=');
  const cut = costAt >= 0 ? costAt : altCostAt;
  const prefix = (cut >= 0 ? t.slice(0, cut) : t).trim();
  if (!prefix) return null;

  const node: any = {};
  const using = prefix.match(/^(.+?)\s+using\s+(\S+)\s+on\s+(\S+)/i);
  const on = prefix.match(/^(.+?)\s+on\s+(\S+)/i);

  if (using) {
    node['Node Type'] = using[1].trim();
    node['Index Name'] = using[2];
    node['Relation Name'] = using[3];
  } else if (on) {
    node['Node Type'] = on[1].trim();
    node['Relation Name'] = on[2];
  } else {
    node['Node Type'] = prefix;
  }

  const cost = t.match(/cost=([\d.]+)\.\.([\d.]+)\s+rows=(\d+)\s+width=(\d+)/i);
  if (cost) {
    node['Startup Cost'] = Number(cost[1]);
    node['Total Cost'] = Number(cost[2]);
    node['Plan Rows'] = Number(cost[3]);
    node['Plan Width'] = Number(cost[4]);
  }

  const actual = t.match(/actual time=([\d.]+)\.\.([\d.]+)\s+rows=(\d+)\s+loops=(\d+)/i);
  if (actual) {
    node['Actual Startup Time'] = Number(actual[1]);
    node['Actual Total Time'] = Number(actual[2]);
    node['Actual Rows'] = Number(actual[3]);
    node['Actual Loops'] = Number(actual[4]);
  } else if (/never executed/i.test(t)) {
    node['Actual Rows'] = 0;
    node['Actual Loops'] = 0;
  }

  return node;
}

function parsePropertyLine(line: string, node: any): void {
  let m: RegExpMatchArray | null;

  if ((m = line.match(/^Filter:\s*(.+)$/i))) node['Filter'] = m[1];
  else if ((m = line.match(/^Rows Removed by Filter:\s*(\d+)/i))) node['Rows Removed by Filter'] = Number(m[1]);
  else if ((m = line.match(/^Rows Removed by Index Recheck:\s*(\d+)/i))) node['Rows Removed by Index Recheck'] = Number(m[1]);
  else if ((m = line.match(/^Rows Removed by Join Filter:\s*(\d+)/i))) node['Rows Removed by Join Filter'] = Number(m[1]);
  else if ((m = line.match(/^(Index Cond|Recheck Cond|Join Filter|Hash Cond|Merge Cond):\s*(.+)$/i))) node[m[1]] = m[2];
  else if ((m = line.match(/^Sort Key:\s*(.+)$/i))) node['Sort Key'] = m[1].split(',').map(v => v.trim());
  else if ((m = line.match(/^Sort Method:\s*(.+?)\s+Disk:\s*(\d+)kB/i))) {
    node['Sort Method'] = m[1];
    node['Sort Space Used'] = Number(m[2]);
    node['Sort Space Type'] = 'Disk';
  } else if ((m = line.match(/^Sort Method:\s*(.+?)(?:\s+Memory:\s*(\d+)kB)?$/i))) {
    node['Sort Method'] = m[1].trim();
    if (m[2]) {
      node['Sort Space Used'] = Number(m[2]);
      node['Sort Space Type'] = 'Memory';
    }
  } else if ((m = line.match(/^Heap Fetches:\s*(\d+)/i))) node['Heap Fetches'] = Number(m[1]);
  else if ((m = line.match(/^Workers\s+(Planned|Launched):\s*(\d+)/i))) node[`Workers ${m[1]}`] = Number(m[2]);
  else if ((m = line.match(/^Buckets:\s*(\d+)/i))) node['Buckets'] = Number(m[1]);
  else if ((m = line.match(/^Batches:\s*(\d+)/i))) node['Batches'] = Number(m[1]);
  else if ((m = line.match(/^Memory Usage:\s*(\d+)kB/i))) node['Memory Usage'] = Number(m[1]);
  else if ((m = line.match(/^Buffers:\s*(.+)$/i))) parseBuffers(m[1], node);
}

function parseBuffers(value: string, node: any): void {
  const shared = value.match(/shared\s+(?:hit=(\d+))?\s*(?:read=(\d+))?\s*(?:dirtied=(\d+))?\s*(?:written=(\d+))?/i);
  if (shared) {
    if (shared[1]) node['Shared Hit Blocks'] = Number(shared[1]);
    if (shared[2]) node['Shared Read Blocks'] = Number(shared[2]);
    if (shared[3]) node['Shared Dirtied Blocks'] = Number(shared[3]);
    if (shared[4]) node['Shared Written Blocks'] = Number(shared[4]);
  }
  const temp = value.match(/temp\s+(?:read=(\d+))?\s*(?:written=(\d+))?/i);
  if (temp) {
    if (temp[1]) node['Temp Read Blocks'] = Number(temp[1]);
    if (temp[2]) node['Temp Written Blocks'] = Number(temp[2]);
  }
}

function extractTriggers(text: string): any[] {
  const out: any[] = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.trim().match(/^(?:Trigger\s+)?(.+?):\s*time=([\d.]+)\s+calls=(\d+)/i);
    if (m) out.push({ 'Trigger Name': m[1], Time: Number(m[2]), Calls: Number(m[3]) });
  }
  return out;
}

function extractJit(text: string): any | null {
  const lines = text.split(/\r?\n/);
  let active = false;
  const jit: any = {};

  for (const line of lines) {
    const t = line.trim();
    if (t === 'JIT:') { active = true; continue; }
    if (!active) continue;
    if (/^(Planning Time|Execution Time):/i.test(t)) break;

    let m: RegExpMatchArray | null;
    if ((m = t.match(/^Functions:\s*(\d+)/i))) jit.Functions = Number(m[1]);
    else if ((m = t.match(/^Options:\s*(.+)/i))) jit.Options = m[1];
    else if ((m = t.match(/^Timing:\s*Generation\s+([\d.]+)\s*ms.*Inlining\s+([\d.]+)\s*ms.*Optimization\s+([\d.]+)\s*ms.*Emission\s+([\d.]+)\s*ms.*Total\s+([\d.]+)\s*ms/i))) {
      jit.Timing = {
        Generation: Number(m[1]),
        Inlining: Number(m[2]),
        Optimization: Number(m[3]),
        Emission: Number(m[4]),
        Total: Number(m[5])
      };
    }
  }

  return jit.Functions || jit.Timing ? jit : null;
}
