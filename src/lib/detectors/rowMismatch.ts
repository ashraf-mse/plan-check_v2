import { TruthfulDetection } from '@/lib/types/core';

export function rowMismatchDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object') return null;

    const plannedRows = node['Plan Rows'];
    const actualRows = node['Actual Rows'];
    const nodeType = node['Node Type'] || 'Unknown';
    const relationName = node['Relation Name'];

    // Ensure both values exist and are valid numbers
    if (typeof plannedRows !== 'number' || typeof actualRows !== 'number') return null;
    if (plannedRows <= 0 || actualRows <= 0) return null;
    
    // Calculate ratio - how many times off
    const ratio = actualRows > plannedRows 
        ? actualRows / plannedRows 
        : plannedRows / actualRows;
    
    const isUnderestimate = actualRows > plannedRows;
    const direction = isUnderestimate ? 'underestimation' : 'overestimation';
    
    // Thresholds: 2× = medium, 10× = high  
    if (ratio < 2) return null;
    
    // Determine severity based on ratio magnitude
    const impact = ratio >= 10 ? 'high' : 'medium';
    const ratioText = ratio >= 1000 
        ? `${(ratio / 1000).toFixed(1)}k×` 
        : `${Math.round(ratio)}×`;
    
    // Build location string
    const location = relationName 
        ? `${nodeType} on ${relationName}`
        : nodeType;

    // Unique ID per node to prevent aggregation
    const nodeId = relationName || nodeType;
    
    return {
        id: `row_mismatch_${nodeId}`,
        title: `Row Estimation Error (${ratioText})`,
        confidence: 'verified',
        impact,
        evidence: [
            {
                field: 'Actual Rows',
                value: actualRows,
                rawText: `Actual: ${actualRows.toLocaleString()} rows`,
                location
            },
            {
                field: 'Plan Rows',
                value: plannedRows,
                rawText: `Estimated: ${plannedRows.toLocaleString()} rows`,
                location
            }
        ],
        education: {
            behavior: `At ${location}: ${actualRows.toLocaleString()} actual vs ${plannedRows.toLocaleString()} estimated (${ratioText} ${direction}).`,
            explanation: [
                `PostgreSQL expected ${plannedRows.toLocaleString()} rows but got ${actualRows.toLocaleString()} (${ratioText} ${direction}).`,
                isUnderestimate 
                    ? "Underestimates can cause the planner to choose inefficient join strategies or skip parallel execution."
                    : "Overestimates can cause unnecessary memory allocation or overly aggressive parallelization.",
                "This typically indicates stale or missing statistics on the table."
            ],
            limitations: [
                "Cannot determine when ANALYZE was last run",
                "Cannot see if extended statistics would help",
                "The chosen plan may still be optimal despite the mismatch"
            ],
            docsLink: "https://www.postgresql.org/docs/current/planner-stats.html"
        }
    };
}
