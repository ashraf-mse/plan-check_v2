import { TruthfulDetection } from '@/lib/types/core';

/**
 * Detects parallel query efficiency issues
 * Triggers when workers planned != workers launched
 */
export function parallelQueryDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object') return null;
    
    const nodeType = node['Node Type'];
    if (!nodeType) return null;

    // Look for Gather or Gather Merge nodes
    if (!nodeType.includes('Gather')) return null;

    const workersPlanned = node['Workers Planned'];
    const workersLaunched = node['Workers Launched'];

    // Only check if we have both values
    if (typeof workersPlanned !== 'number') return null;
    
    // Workers Launched might be undefined if plan wasn't ANALYZE'd
    if (typeof workersLaunched !== 'number') return null;

    // Check for mismatch
    if (workersLaunched < workersPlanned) {
        const missing = workersPlanned - workersLaunched;
        
        return {
            id: 'parallel_query_worker_shortage',
            title: 'Parallel Query Worker Shortage',
            confidence: 'verified',
            impact: workersLaunched === 0 ? 'high' : 'medium',
            evidence: [
                {
                    field: 'Workers Planned',
                    value: workersPlanned,
                    rawText: `Workers Planned: ${workersPlanned}`,
                    location: `Node Type: ${nodeType}`
                },
                {
                    field: 'Workers Launched',
                    value: workersLaunched,
                    rawText: `Workers Launched: ${workersLaunched} (${missing} missing)`,
                    location: `Node Type: ${nodeType}`
                }
            ],
            education: {
                behavior: `PostgreSQL planned to use ${workersPlanned} parallel workers but only launched ${workersLaunched}.`,
                explanation: [
                    "The query optimizer expected parallel execution but couldn't get all requested workers.",
                    "This typically happens when max_parallel_workers or max_parallel_workers_per_gather is too low.",
                    "Other concurrent queries may have already consumed the available worker pool.",
                    workersLaunched === 0 
                        ? "No workers were launched at all - the query ran entirely in serial mode."
                        : `Only ${workersLaunched} of ${workersPlanned} workers were available.`
                ],
                limitations: [
                    "Cannot see current max_parallel_workers setting",
                    "Cannot determine how many workers were in use by other queries",
                    "Cannot measure the actual performance impact of reduced parallelism"
                ],
                docsLink: "https://www.postgresql.org/docs/current/parallel-query.html"
            }
        };
    }

    return null;
}
