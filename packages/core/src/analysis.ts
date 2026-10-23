import type { ParserResult, TruthfulDetection, Impact } from './types.js';
import { diskSpillDetector } from './detectors/diskSpill.js';
import { seqScanDetector } from './detectors/seqScan.js';
import { rowMismatchDetector } from './detectors/rowMismatch.js';
import { nestedLoopDetector } from './detectors/nestedLoop.js';
import { ineffectiveLimitDetector } from './detectors/ineffectiveLimit.js';
import { missingIndexDetector } from './detectors/missingIndex.js';
import { hashJoinMemoryDetector } from './detectors/hashJoinMemory.js';
import { indexScanHeapFetchesDetector } from './detectors/indexScanHeapFetches.js';
import { parallelQueryDetector } from './detectors/parallelQuery.js';
import { bitmapHeapRecheckDetector } from './detectors/bitmapHeapRecheck.js';
import { sortMemoryDetector } from './detectors/sortMemory.js';
import { joinFilterDetector } from './detectors/joinFilter.js';
import { cteMaterializationDetector } from './detectors/cteMaterialization.js';
import { triggerOverheadDetector } from './detectors/triggerOverhead.js';
import { recursiveExplosionDetector } from './detectors/recursiveExplosion.js';
import { jitOverheadDetector } from './detectors/jitOverhead.js';

type DetectorFunction = (node: any) => TruthfulDetection | null;

export const detectors: DetectorFunction[] = [
  diskSpillDetector,
  seqScanDetector,
  rowMismatchDetector,
  nestedLoopDetector,
  ineffectiveLimitDetector,
  missingIndexDetector,
  hashJoinMemoryDetector,
  indexScanHeapFetchesDetector,
  parallelQueryDetector,
  bitmapHeapRecheckDetector,
  sortMemoryDetector,
  joinFilterDetector,
  cteMaterializationDetector,
  triggerOverheadDetector,
  recursiveExplosionDetector,
  jitOverheadDetector
];

export class AnalysisManager {
  async analyze(parserResult: ParserResult): Promise<TruthfulDetection[]> {
    const raw: TruthfulDetection[] = [];
    const root = this.extractPlanTree(parserResult.plan);
    if (!root) return [];

    const traverse = (node: any) => {
      if (!node || typeof node !== 'object' || typeof node['Node Type'] !== 'string') return;
      for (const detector of detectors) {
        try {
          const finding = detector(node);
          if (finding) raw.push(finding);
        } catch {
          // A detector failure must not stop the rest of the analysis.
        }
      }
      const children = node.Plans || node.Children || node.plans;
      if (Array.isArray(children)) children.forEach(traverse);
    };

    if (Array.isArray(root)) root.forEach(traverse);
    else traverse(root);

    return this.aggregate(raw);
  }

  private extractPlanTree(data: any): any {
    if (!data) return null;
    if (data['Node Type']) return data;
    if (data.content?.Plan) return data.content.Plan;
    if (data.Plan) return data.Plan;
    if (data.plan) return this.extractPlanTree(data.plan);
    if (Array.isArray(data) && data.length) return this.extractPlanTree(data[0]);
    return data;
  }

  private aggregate(findings: TruthfulDetection[]): TruthfulDetection[] {
    const map = new Map<string, TruthfulDetection>();
    const level = (impact: Impact) => ({ low: 1, medium: 2, high: 3 })[impact];

    for (const finding of findings) {
      const current = map.get(finding.id);
      if (!current) {
        map.set(finding.id, { ...finding, evidence: [...finding.evidence] });
        continue;
      }
      const locations = new Set(current.evidence.map(e => e.location));
      for (const evidence of finding.evidence) {
        if (!locations.has(evidence.location)) current.evidence.push(evidence);
      }
      if (level(finding.impact) > level(current.impact)) current.impact = finding.impact;
    }

    const order: Record<Impact, number> = { high: 0, medium: 1, low: 2 };
    return [...map.values()].sort((a, b) => order[a.impact] - order[b.impact]);
  }
}
