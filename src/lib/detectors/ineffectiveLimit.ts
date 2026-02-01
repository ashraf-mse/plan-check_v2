import { TruthfulDetection } from '@/lib/types/core';

export function ineffectiveLimitDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object' || node['Node Type'] !== 'Limit') return null;

    const child = node.Plans?.[0] || node.Children?.[0];
    if (!child || child['Node Type'] !== 'Sort') return null;

    const sortMethod = child['Sort Method'];
    if (typeof sortMethod !== 'string') return null;

    // Check if Sort is processing significant rows - avoid false positives on small sorts
    const sortRows = typeof child['Actual Rows'] === 'number' ? child['Actual Rows'] : 
                     (typeof child['Plan Rows'] === 'number' ? child['Plan Rows'] : 0);
    
    // Only flag if sorting more than 10000 rows (quicksort is fine for small sets)
    const isQuicksort = sortMethod.toLowerCase().includes('quicksort');
    const isExternalSort = sortMethod.toLowerCase().includes('external');
    
    // For quicksort, only flag if it's sorting a lot of rows
    // For external sorts, always flag as they indicate memory pressure
    const shouldFlag = isExternalSort || (isQuicksort && sortRows > 10000);

    if (shouldFlag) {
        return {
            id: 'ineffective_limit',
            title: 'Ineffective LIMIT',
            confidence: 'inferred',
            impact: 'medium',
            evidence: [
                {
                    field: 'Sort Method',
                    value: sortMethod,
                    rawText: `Child Sort Method: ${sortMethod}`,
                    location: `Child of Limit Node (Type: ${child['Node Type']})`
                }
            ],
            education: {
                behavior: "The LIMIT clause is being applied after a full sort operation.",
                explanation: [
                    "PostgreSQL is sorting the entire result set before discarding most of it.",
                    "An efficient 'top-N' sort (e.g., using a heap) was not used, likely due to sort memory constraints or complex expressions."
                ],
                limitations: [
                    "Cannot see effective work_mem during sort",
                    "Do not know if the sort key is indexed",
                    "Cannot determine if Top-N heapsort was actually available for this query plan"
                ],
                docsLink: "https://www.postgresql.org/docs/current/queries-limit.html"
            }
        };
    }

    return null;
}
