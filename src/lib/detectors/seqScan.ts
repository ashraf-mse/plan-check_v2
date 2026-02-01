import { TruthfulDetection } from '@/lib/types/core';

export function seqScanDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object' || node['Node Type'] !== 'Seq Scan') return null;

    const filter = node['Filter'];
    const relation = node['Relation Name'];
    const rows = node['Actual Rows'] ?? node['Plan Rows'] ?? 0;

    // Truthful Check: Seq Scan without a Filter on a non-trivial relation
    if (!filter && rows > 1000) {
        return {
            id: 'unfiltered_seq_scan',
            title: 'Unfiltered Seq Scan',
            confidence: 'verified',
            impact: 'medium',
            evidence: [
                {
                    field: 'Node Type',
                    value: 'Seq Scan',
                    rawText: 'Seq Scan',
                    location: relation ? `Relation: ${relation}` : 'Unknown Relation'
                },
                {
                    field: 'Filter',
                    value: 'None',
                    rawText: 'Filter: [Empty]',
                    location: 'Node properties'
                },
                {
                    field: 'Rows',
                    value: rows,
                    rawText: `Rows: ${rows}`,
                    location: 'Estimated or actual rows'
                }
            ],
            education: {
                behavior: "PostgreSQL is scanning the entire table without any filter predicates.",
                explanation: [
                    "This operation reads every block of the relation from disk or buffer cache.",
                    "If the table is large, this will be significantly slower than an Index Scan.",
                    "Even if an index exists, the optimizer may choose a Seq Scan if it expects to return a large percentage of the table."
                ],
                limitations: [
                    "Cannot see if indexes exist on this table",
                    "Do not know if the table resides entirely in RAM (Buffer Cache)",
                    "Cannot determine if a Seq Scan is actually cheaper for this specific data distribution"
                ],
                docsLink: "https://www.postgresql.org/docs/current/indexes-examine.html"
            }
        };
    }

    return null;
}
