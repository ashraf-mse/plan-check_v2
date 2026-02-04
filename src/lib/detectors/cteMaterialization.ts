import { TruthfulDetection } from '@/lib/types/core';

/**
 * Detects CTE materialization which may add overhead
 * CTEs are materialized by default in PostgreSQL (optimization fence)
 */
export function cteMaterializationDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object') return null;
    
    const nodeType = node['Node Type'];
    if (nodeType !== 'CTE Scan') return null;

    const cteName = node['CTE Name'] || 'unnamed';
    const actualRows = node['Actual Rows'];
    const actualTime = node['Actual Total Time'];

    // Only flag if significant rows/time
    if (typeof actualRows !== 'number' || actualRows < 1000) return null;

    // Scale severity by row count AND execution time
    // High: >100M rows OR >5 seconds execution
    // Medium: >1M rows OR >1 second execution
    // Low: else
    const timeMs = typeof actualTime === 'number' ? actualTime : 0;
    const impact = (actualRows >= 100000000 || timeMs >= 5000) ? 'high' 
                 : (actualRows >= 1000000 || timeMs >= 1000) ? 'medium' 
                 : 'low';

    return {
        id: `cte_materialization_${cteName}`,
        title: 'CTE Materialization Overhead',
        confidence: 'verified',
        impact,
        evidence: [
            {
                field: 'CTE Name',
                value: cteName,
                rawText: `CTE: ${cteName}`,
                location: 'CTE Scan'
            },
            {
                field: 'Rows',
                value: actualRows,
                rawText: `${actualRows.toLocaleString()} rows materialized`,
                location: 'CTE Scan'
            }
        ],
        education: {
            behavior: `The CTE '${cteName}' is materialized to temporary storage (${actualRows.toLocaleString()} rows).`,
            explanation: [
                "PostgreSQL materializes CTEs by default, creating an optimization fence.",
                "This adds I/O overhead but can be beneficial if the CTE is referenced multiple times.",
                "If the CTE is used only once, consider using a subquery or the NOT MATERIALIZED hint (PostgreSQL 12+)."
            ],
            limitations: [
                "Cannot determine how many times the CTE is referenced",
                "Cannot see the original SQL to verify if materialization is intentional",
                "Materialization may be optimal for complex CTEs referenced multiple times"
            ],
            docsLink: "https://www.postgresql.org/docs/current/queries-with.html"
        }
    };
}
