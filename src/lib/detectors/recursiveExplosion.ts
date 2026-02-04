import { TruthfulDetection } from '@/lib/types/core';

/**
 * Detects recursive iteration explosion in WorkTable Scans
 * High loop counts with high filter rejection indicate pathological recursion
 */
export function recursiveExplosionDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object') return null;
    
    // Only check WorkTable Scan nodes (used in recursive CTEs)
    if (node['Node Type'] !== 'WorkTable Scan') return null;

    const loops = node['Actual Loops'] ?? 1;
    const rowsPerLoop = node['Actual Rows'] ?? 0;
    const rowsRemoved = node['Rows Removed by Filter'] ?? 0;
    const actualTime = node['Actual Total Time'] ?? 0;
    const filter = node['Filter'];

    // Calculate total impact
    const totalRowsProcessed = rowsPerLoop * loops;
    const totalRowsRemoved = rowsRemoved * loops;
    const totalRowsExamined = totalRowsProcessed + totalRowsRemoved;

    // Threshold: flag if loops > 10,000 (indicates deep recursion)
    if (loops < 10000) return null;

    // Calculate rejection rate if filter exists
    const rejectionRate = totalRowsExamined > 0 
        ? totalRowsRemoved / totalRowsExamined 
        : 0;

    // Determine severity based on loop count and time
    let impact: 'high' | 'medium' | 'low';
    if (loops >= 50000 || actualTime > 1000) {
        impact = 'high';
    } else {
        impact = 'medium';
    }

    const evidence: any[] = [
        {
            field: 'Recursive Iterations',
            value: loops,
            rawText: `${loops.toLocaleString()} iterations`,
            location: 'WorkTable Scan'
        },
        {
            field: 'Rows Per Iteration',
            value: rowsPerLoop,
            rawText: `${rowsPerLoop.toLocaleString()} rows per loop`,
            location: 'Actual Rows'
        },
        {
            field: 'Total Rows Processed',
            value: totalRowsProcessed,
            rawText: `${totalRowsProcessed.toLocaleString()} total rows (${rowsPerLoop} × ${loops.toLocaleString()})`,
            location: 'Computed'
        }
    ];

    if (filter && totalRowsRemoved > 0) {
        evidence.push({
            field: 'Filter Rejection',
            value: rejectionRate,
            rawText: `${(rejectionRate * 100).toFixed(3)}% rejected (${totalRowsRemoved.toLocaleString()} rows)`,
            location: 'Filter'
        });
    }

    if (actualTime > 0) {
        evidence.push({
            field: 'Execution Time',
            value: actualTime,
            rawText: `${actualTime.toFixed(2)} ms`,
            location: 'Actual Total Time'
        });
    }

    return {
        id: 'recursive_iteration_explosion',
        title: 'Recursive Iteration Explosion',
        confidence: 'verified',
        impact,
        evidence,
        education: {
            behavior: `A WorkTable Scan is executing ${loops.toLocaleString()} iterations, processing ${totalRowsProcessed.toLocaleString()} total rows.`,
            explanation: [
                `In recursive CTEs, the WorkTable Scan reads from the previous iteration's results.`,
                `${loops.toLocaleString()} iterations indicates extremely deep recursion - typically hierarchies should be much shallower.`,
                rejectionRate > 0.99 
                    ? `${(rejectionRate * 100).toFixed(3)}% of rows are being rejected by the filter, indicating the join condition matches very few rows per iteration.`
                    : `Each iteration processes ${rowsPerLoop} rows, which compounds to ${totalRowsProcessed.toLocaleString()} total.`,
                `This pattern often indicates: circular references in data, missing CYCLE detection, or an unbounded recursive query.`
            ],
            limitations: [
                "Cannot determine if CYCLE detection is configured.",
                "Cannot see the actual recursive CTE query structure.",
                "Data quality issues (circular references) require data inspection."
            ],
            docsLink: "https://www.postgresql.org/docs/current/queries-with.html#QUERIES-WITH-CYCLE"
        }
    };
}
