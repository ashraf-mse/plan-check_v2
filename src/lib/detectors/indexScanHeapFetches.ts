import { TruthfulDetection } from '@/lib/types/core';

/**
 * Detects Index Scan with excessive heap fetches
 * This indicates an opportunity for an Index-Only Scan
 */
export function indexScanHeapFetchesDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object') return null;
    
    const nodeType = node['Node Type'];
    if (nodeType !== 'Index Scan' && nodeType !== 'Bitmap Heap Scan') return null;

    const heapFetches = node['Heap Fetches'];
    const actualRows = node['Actual Rows'];
    const indexName = node['Index Name'];
    const relation = node['Relation Name'];

    // Only check if we have both values
    if (typeof heapFetches !== 'number' || typeof actualRows !== 'number') return null;
    if (actualRows <= 100) return null; // Skip small result sets

    // If heap fetches is close to or higher than actual rows, it's not using index-only
    const fetchRatio = heapFetches / actualRows;

    if (fetchRatio > 0.5 && heapFetches > 1000) {
        return {
            id: 'index_scan_heap_fetches',
            title: 'Index Scan with High Heap Fetches',
            confidence: 'inferred',
            impact: 'medium',
            evidence: [
                {
                    field: 'Heap Fetches',
                    value: heapFetches,
                    rawText: `Heap Fetches: ${heapFetches.toLocaleString()}`,
                    location: relation ? `Table: ${relation}` : `Node Type: ${nodeType}`
                },
                {
                    field: 'Actual Rows',
                    value: actualRows,
                    rawText: `Actual Rows: ${actualRows.toLocaleString()}`,
                    location: indexName ? `Index: ${indexName}` : 'Index Scan'
                },
                {
                    field: 'Fetch Ratio',
                    value: fetchRatio,
                    rawText: `Fetch Ratio: ${(fetchRatio * 100).toFixed(1)}% of rows required heap access`,
                    location: 'Computed'
                }
            ],
            education: {
                behavior: `The index scan on ${relation || 'the table'} required ${heapFetches.toLocaleString()} heap fetches to retrieve ${actualRows.toLocaleString()} rows.`,
                explanation: [
                    "Heap fetches occur when the index doesn't contain all required columns (not a covering index).",
                    "Each heap fetch is a random I/O operation to retrieve the full row from the table.",
                    "An Index-Only Scan could avoid these fetches if the index included all needed columns.",
                    "Consider creating a covering index with INCLUDE clause to store additional columns."
                ],
                limitations: [
                    "Cannot see which columns are being selected",
                    "Cannot determine if a covering index already exists",
                    "Index-Only Scans also require the visibility map to be up-to-date (run VACUUM)"
                ],
                docsLink: "https://www.postgresql.org/docs/current/indexes-index-only-scans.html"
            }
        };
    }

    return null;
}
