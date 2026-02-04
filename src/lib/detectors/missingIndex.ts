import { TruthfulDetection } from '@/lib/types/core';

export function missingIndexDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object' || node['Node Type'] !== 'Seq Scan') return null;

    const filter = node['Filter'];
    if (!filter) return null;

    // Require Rows Removed by Filter to be present
    const rowsRemoved = node['Rows Removed by Filter'];
    if (typeof rowsRemoved !== 'number' || rowsRemoved === 0) return null;

    // Require Actual Rows to calculate true selectivity
    // Without Actual Rows, we cannot determine what percentage was filtered
    const actualRows = node['Actual Rows'];
    if (typeof actualRows !== 'number') return null;

    // Skip IS NULL anchor queries that return few rows
    // These are often intentional root lookups in recursive CTEs (e.g., finding root managers)
    // Pattern: "column IS NULL" returning 1-10 rows is expected behavior, not a missing index
    if (filter.match(/IS\s+NULL/i) && actualRows <= 10) {
        return null;
    }

    const totalRows = actualRows + rowsRemoved;

    // Guard against small tables
    if (totalRows <= 1000) return null;

    // Calculate filter selectivity: what percentage was removed
    const filterRatio = rowsRemoved / totalRows;

    // Trigger if more than 90% of rows are filtered out
    // This indicates an index could help skip most of the table
    if (filterRatio > 0.9) {
        const percentage = (filterRatio * 100).toFixed(1);
        const relation = node['Relation Name'];

        return {
            id: 'missing_index',
            title: 'Missing Index Opportunity',
            confidence: 'inferred',
            impact: 'high',
            evidence: [
                {
                    field: 'Filter Ratio',
                    value: filterRatio,
                    rawText: `${percentage}% of rows filtered out (${rowsRemoved.toLocaleString()} of ${totalRows.toLocaleString()})`,
                    location: relation ? `Relation: ${relation}` : 'Seq Scan'
                },
                {
                    field: 'Filter',
                    value: filter,
                    rawText: `Filter: ${filter}`,
                    location: 'Node properties'
                }
            ],
            education: {
                behavior: `PostgreSQL is performing a Sequential Scan on ${relation || 'the table'} but filtering out almost all rows (${percentage}%).`,
                explanation: [
                    `A Sequential Scan reads the entire table from disk or memory.`,
                    `Since ${percentage}% of the data is being discarded by a filter, an index on the columns used in the filter could allow PostgreSQL to skip most of the table.`,
                    `The filter being used is: ${filter}`
                ],
                limitations: [
                    "We cannot see which indexes already exist on this table.",
                    "An index might already exist but be ignored due to low selectivity or other optimizer choices.",
                    "Adding an index has a write-performance cost that must be balanced."
                ],
                docsLink: "https://www.postgresql.org/docs/current/indexes-examine.html"
            }
        };
    }

    return null;
}
