import { TruthfulDetection } from '@/lib/types/core';

export function rowMismatchDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object') return null;

    const plannedRows = node['Plan Rows'];
    const actualRows = node['Actual Rows'];

    // Ensure both values exist and are valid numbers
    if (typeof plannedRows !== 'number' || typeof actualRows !== 'number') return null;
    if (actualRows <= 0) return null;
    
    // Avoid division by zero - use actualRows as baseline if plannedRows is 0
    const baseline = plannedRows > 0 ? plannedRows : actualRows;
    const diff = Math.abs(actualRows - plannedRows);
    const percent = (diff / baseline) * 100;

    // Threshold: > 10% mismatch AND > 1000 rows absolute diff
    if (percent > 10 && diff > 1000) {
            return {
                id: 'row_count_mismatch',
                title: 'Significant Row Mismatch',
                confidence: 'verified',
                impact: 'medium',
                evidence: [
                    {
                        field: 'Plan Rows',
                        value: plannedRows,
                        rawText: `Plan Rows: ${plannedRows}`,
                        location: `Node Type: ${node['Node Type']}`
                    },
                    {
                        field: 'Actual Rows',
                        value: actualRows,
                        rawText: `Actual Rows: ${actualRows}`,
                        location: `Node Type: ${node['Node Type']}`
                    }
                ],
                education: {
                    behavior: "The optimizer's estimated row count significantly differed from reality.",
                    explanation: [
                        "PostgreSQL chooses join types and scan methods based on row estimates.",
                        `The estimate was off by ${percent.toFixed(1)}% (${diff} rows).`,
                        "Stale statistics or complex join conditions often cause this drift."
                    ],
                    limitations: [
                        "Cannot see if ANALYZE has been run recently",
                        "Do not know the internal cost model parameters",
                        "Cannot determine if this mismatch led to a suboptimal join choice in this specific case"
                    ],
                    docsLink: "https://www.postgresql.org/docs/current/planner-stats.html"
                }
            };
        }

    return null;
}
