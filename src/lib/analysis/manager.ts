import { TruthfulDetection } from '@/lib/types/core';
import { ParserResult } from '@/lib/parser/manager';
import { diskSpillDetector } from '@/lib/detectors/diskSpill';
import { seqScanDetector } from '@/lib/detectors/seqScan';
import { rowMismatchDetector } from '@/lib/detectors/rowMismatch';
import { nestedLoopDetector } from '@/lib/detectors/nestedLoop';
import { ineffectiveLimitDetector } from '@/lib/detectors/ineffectiveLimit';
import { missingIndexDetector } from '@/lib/detectors/missingIndex';
import { hashJoinMemoryDetector } from '@/lib/detectors/hashJoinMemory';
import { indexScanHeapFetchesDetector } from '@/lib/detectors/indexScanHeapFetches';
import { parallelQueryDetector } from '@/lib/detectors/parallelQuery';
import { bitmapHeapRecheckDetector } from '@/lib/detectors/bitmapHeapRecheck';
import { sortMemoryDetector } from '@/lib/detectors/sortMemory';
import { joinFilterDetector } from '@/lib/detectors/joinFilter';
import Logger from '@/lib/utils/logger';

// Type for detector functions
type DetectorFunction = (node: any) => TruthfulDetection | null;

// Registry of all detectors
const DETECTORS: DetectorFunction[] = [
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
    joinFilterDetector
];

export class AnalysisManager {
    async analyze(parserResult: ParserResult): Promise<TruthfulDetection[]> {
        const rawFindings: TruthfulDetection[] = [];
        let nodeCount = 0;

        Logger.info('Analysis', 'Analysis started', { source: parserResult.source });

        // Extract the plan tree - handle all possible formats
        const planTree = this.extractPlanTree(parserResult.plan);
        
        if (!planTree) {
            Logger.warn('Analysis', 'No valid plan tree found');
            return [];
        }

        // Traverse the plan tree
        const traverse = (node: any, path: string = 'root') => {
            if (!node || typeof node !== 'object') return;
            
            // Skip if this doesn't look like a plan node
            if (!this.isValidPlanNode(node)) {
                Logger.debug('Analysis', 'Skipping invalid node', { path });
                return;
            }

            nodeCount++;

            // Run all detectors on this node
            for (const detector of DETECTORS) {
                try {
                    const finding = detector(node);
                    if (finding) {
                        Logger.debug('Analysis', `Detector triggered: ${finding.id}`, { 
                            nodeType: node['Node Type'],
                            path 
                        });
                        rawFindings.push(finding);
                    }
                } catch (err: any) {
                    Logger.error('Analysis', 'Detector execution failed', {
                        detector: detector.name || 'unknown',
                        error: err.message,
                        nodeType: node['Node Type'],
                        path
                    });
                }
            }

            // Traverse children - handle multiple property names
            const children = node.Plans || node.Children || node.plans;
            if (Array.isArray(children)) {
                children.forEach((child, idx) => {
                    traverse(child, `${path}.Plans[${idx}]`);
                });
            }
        };

        // Handle array of plans (multiple queries)
        if (Array.isArray(planTree)) {
            planTree.forEach((plan, idx) => {
                const tree = this.extractPlanTree(plan);
                if (tree) traverse(tree, `plan[${idx}]`);
            });
        } else {
            traverse(planTree);
        }

        Logger.info('Analysis', 'Tree traversal complete', { 
            nodesProcessed: nodeCount, 
            rawFindingsCount: rawFindings.length 
        });

        // Aggregate findings by ID with impact-based sorting
        const aggregated = this.aggregateFindings(rawFindings);

        Logger.info('Analysis', 'Aggregation complete', { 
            uniqueFindingsCount: aggregated.length 
        });

        return aggregated;
    }

    /**
     * Extract the plan tree from various possible structures
     */
    private extractPlanTree(data: any): any {
        if (!data) return null;

        // Already a valid plan node
        if (data['Node Type']) {
            return data;
        }

        // PEV2 IPlan structure
        if (data.content?.Plan) {
            return data.content.Plan;
        }

        // Standard EXPLAIN JSON format
        if (data.Plan) {
            return data.Plan;
        }

        // Lowercase variant
        if (data.plan) {
            return this.extractPlanTree(data.plan);
        }

        // Array format
        if (Array.isArray(data) && data.length > 0) {
            return this.extractPlanTree(data[0]);
        }

        return data;
    }

    /**
     * Check if a node looks like a valid plan node
     */
    private isValidPlanNode(node: any): boolean {
        if (!node || typeof node !== 'object') return false;
        
        // Must have Node Type to be a valid plan node
        return typeof node['Node Type'] === 'string';
    }

    /**
     * Aggregate findings by ID and sort by impact
     */
    private aggregateFindings(rawFindings: TruthfulDetection[]): TruthfulDetection[] {
        const aggregated = new Map<string, TruthfulDetection>();

        for (const f of rawFindings) {
            if (aggregated.has(f.id)) {
                const existing = aggregated.get(f.id)!;
                // Merge evidence, avoiding duplicates
                const existingLocations = new Set(existing.evidence.map(e => e.location));
                for (const ev of f.evidence) {
                    if (!existingLocations.has(ev.location)) {
                        existing.evidence.push(ev);
                    }
                }
                // Upgrade impact if new finding has higher impact
                if (this.impactLevel(f.impact) > this.impactLevel(existing.impact)) {
                    existing.impact = f.impact;
                }
            } else {
                aggregated.set(f.id, { ...f, evidence: [...f.evidence] });
            }
        }

        // Sort by impact (high -> medium -> low)
        const impactOrder = { high: 0, medium: 1, low: 2 };
        return Array.from(aggregated.values())
            .sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);
    }

    private impactLevel(impact: 'low' | 'medium' | 'high'): number {
        return { low: 1, medium: 2, high: 3 }[impact];
    }
}
