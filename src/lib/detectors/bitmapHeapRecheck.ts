import { TruthfulDetection } from '@/lib/types/core';

/**
 * Detects Bitmap Heap Scan with lossy pages causing recheck
 * This indicates the bitmap exceeded work_mem and became lossy
 */
export function bitmapHeapRecheckDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object') return null;
    
    const nodeType = node['Node Type'];
    if (nodeType !== 'Bitmap Heap Scan') return null;

    const rowsRemovedByRecheck = node['Rows Removed by Index Recheck'];
    const actualRows = node['Actual Rows'];
    const relation = node['Relation Name'];
    const recheckCond = node['Recheck Cond'];

    // Only trigger if significant rows were removed by recheck
    if (typeof rowsRemovedByRecheck !== 'number' || rowsRemovedByRecheck <= 0) return null;
    
    const totalRows = (typeof actualRows === 'number' ? actualRows : 0) + rowsRemovedByRecheck;
    if (totalRows < 1000) return null; // Skip small result sets

    const recheckRatio = rowsRemovedByRecheck / totalRows;

    // Flag if more than 10% of rows were rechecked away
    if (recheckRatio > 0.1) {
        return {
            id: 'bitmap_heap_lossy_recheck',
            title: 'Bitmap Heap Scan Lossy Pages',
            confidence: 'verified',
            impact: recheckRatio > 0.5 ? 'high' : 'medium',
            evidence: [
                {
                    field: 'Rows Removed by Index Recheck',
                    value: rowsRemovedByRecheck,
                    rawText: `Rows Removed by Index Recheck: ${rowsRemovedByRecheck.toLocaleString()}`,
                    location: relation ? `Table: ${relation}` : 'Bitmap Heap Scan'
                },
                {
                    field: 'Recheck Ratio',
                    value: recheckRatio,
                    rawText: `${(recheckRatio * 100).toFixed(1)}% of scanned rows were filtered by recheck`,
                    location: 'Computed'
                },
                ...(recheckCond ? [{
                    field: 'Recheck Cond',
                    value: recheckCond,
                    rawText: `Recheck Cond: ${recheckCond}`,
                    location: 'Node properties'
                }] : [])
            ],
            education: {
                behavior: `The Bitmap Heap Scan on ${relation || 'the table'} had to recheck ${rowsRemovedByRecheck.toLocaleString()} rows and discard them.`,
                explanation: [
                    "When a bitmap index scan exceeds work_mem, it becomes 'lossy' - storing only page numbers instead of exact row locations.",
                    "Lossy pages require PostgreSQL to re-read the entire page and recheck every row against the original condition.",
                    "This ${(recheckRatio * 100).toFixed(1)}% recheck overhead indicates significant extra I/O and CPU work.",
                    "Increasing work_mem can help keep the bitmap exact rather than lossy."
                ],
                limitations: [
                    "Cannot see the current work_mem setting",
                    "Cannot determine the exact bitmap size",
                    "Cannot measure how much of the bitmap was lossy vs exact"
                ],
                docsLink: "https://www.postgresql.org/docs/current/indexes-bitmap-scans.html"
            }
        };
    }

    return null;
}
