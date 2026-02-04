import { TruthfulDetection } from '@/lib/types/core';

export function seqScanDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object' || node['Node Type'] !== 'Seq Scan') return null;

    const filter = node['Filter'];
    const relation = node['Relation Name'];
    const rows = node['Actual Rows'] ?? node['Plan Rows'] ?? 0;
    const rowsRemovedRaw = node['Rows Removed by Filter'];
    const actualTime = node['Actual Total Time'] ?? 0;

    // Skip small tables - but consider rowsRemoved for full rejection case
    // A scan that examines millions of rows but returns 0 is still significant
    const rowsRemovedNum = typeof rowsRemovedRaw === 'number' ? rowsRemovedRaw : 0;
    const totalExamined = rows + rowsRemovedNum;
    if (totalExamined < 1000) return null;

    // Determine severity based on row count and time
    const isLargeTable = rows >= 100000;
    const isMediumTable = rows >= 10000;
    const isSlowQuery = actualTime > 1000; // >1 second
    
    // CRITICAL: Distinguish between rowsRemoved === 0 (verified) vs null/undefined (unknown)
    // null means "data unavailable" - we cannot claim zero selectivity
    const rowsRemovedIsZero = rowsRemovedRaw === 0; // Explicitly zero
    const rowsRemovedUnknown = rowsRemovedRaw === null || rowsRemovedRaw === undefined;
    const rowsRemoved = typeof rowsRemovedRaw === 'number' ? rowsRemovedRaw : 0;
    
    // Case 1: No filter at all - scanning everything
    // Case 2: Filter exists but removes exactly 0 rows (verified zero selectivity)
    // Case 3: Filter rejects ALL/most rows (high-effort zero-result scan)
    const hasZeroSelectivity = filter && rowsRemovedIsZero && rows > 10000;
    const noFilter = !filter;
    const hasFullRejection = filter && rowsRemoved > 10000 && rows === 0;
    
    // Case 3: Full rejection - scanned many rows but filter rejected ALL of them
    if (hasFullRejection) {
        const impact = rowsRemoved >= 1000000 || actualTime > 1000 ? 'high' : 'medium';
        
        return {
            id: `full_rejection_${relation}`,
            title: 'High-Effort Zero-Result Scan',
            confidence: 'verified',
            impact,
            evidence: [
                {
                    field: 'Node Type',
                    value: 'Seq Scan',
                    rawText: 'Seq Scan',
                    location: relation ? `Relation: ${relation}` : 'Unknown Relation'
                },
                {
                    field: 'Rows Examined',
                    value: rowsRemoved,
                    rawText: `${rowsRemoved.toLocaleString()} rows scanned`,
                    location: relation || 'Table'
                },
                {
                    field: 'Rows Returned',
                    value: 0,
                    rawText: '0 rows returned (all filtered out)',
                    location: 'Actual Rows'
                },
                {
                    field: 'Filter',
                    value: filter,
                    rawText: `Filter: ${filter}`,
                    location: `Rejected ${rowsRemoved.toLocaleString()} rows (100%)`
                },
                ...(actualTime > 0 ? [{
                    field: 'Execution Time',
                    value: actualTime,
                    rawText: `${actualTime.toFixed(2)}ms`,
                    location: 'Actual Total Time'
                }] : [])
            ],
            education: {
                behavior: `Sequential scan examined ${rowsRemoved.toLocaleString()} rows from "${relation || 'table'}" but returned 0 (filter rejected all).`,
                explanation: [
                    `Filter predicate: ${filter}`,
                    `Rows examined: ${rowsRemoved.toLocaleString()}`,
                    `Rows returned: 0 (100% rejection rate)`,
                    actualTime > 0 ? `Time spent: ${actualTime.toFixed(2)}ms` : ""
                ].filter(Boolean),
                limitations: [
                    "Cannot determine if filter predicate is intentionally exclusive",
                    "Cannot see if an index on the filter column would help",
                    "May be expected behavior for anti-join patterns"
                ],
                docsLink: "https://www.postgresql.org/docs/current/indexes-examine.html"
            }
        };
    }
    
    if (noFilter || hasZeroSelectivity) {
        const impact = (isLargeTable || isSlowQuery) ? 'high' : 'medium';
        
        const title = hasZeroSelectivity 
            ? 'Sequential Scan with Zero-Selectivity Filter'
            : 'Full Sequential Scan';
        
        const filterExplanation = hasZeroSelectivity
            ? [
                `Filter predicate: ${filter}`,
                `Filter selectivity: 0% (0 of ${rows.toLocaleString()} rows rejected)`,
                "Observation: All scanned rows matched the filter condition."
              ]
            : [
                "All rows were read from the relation.",
                "No filter predicate was applied to reduce the result set."
              ];

        return {
            id: hasZeroSelectivity ? `zero_selectivity_${relation}` : 'full_seq_scan',
            title,
            confidence: 'verified',
            impact,
            evidence: [
                {
                    field: 'Node Type',
                    value: 'Seq Scan',
                    rawText: 'Seq Scan',
                    location: relation ? `Relation: ${relation}` : 'Unknown Relation'
                },
                {
                    field: 'Rows Scanned',
                    value: rows,
                    rawText: `${rows.toLocaleString()} rows scanned`,
                    location: relation || 'Table'
                },
                ...(hasZeroSelectivity ? [{
                    field: 'Filter',
                    value: filter,
                    rawText: `Filter: ${filter}`,
                    location: 'Rows Removed: 0'
                }] : []),
                ...(actualTime > 0 ? [{
                    field: 'Execution Time',
                    value: actualTime,
                    rawText: `${actualTime.toFixed(2)}ms`,
                    location: 'Actual Total Time'
                }] : [])
            ],
            education: {
                behavior: `Sequential scan of ${rows.toLocaleString()} rows from "${relation || 'table'}"${hasZeroSelectivity ? ' (filter matched all rows)' : ''}.`,
                explanation: [
                    ...filterExplanation,
                    `Row count: ${rows.toLocaleString()}`,
                    actualTime > 0 ? `Execution duration: ${actualTime.toFixed(2)}ms` : ""
                ].filter(Boolean),
                limitations: [
                    "Cannot see if indexes exist on this table",
                    "Cannot determine if this is intentional (analytics, exports)",
                    "The optimizer may have chosen Seq Scan as the cheapest option"
                ],
                docsLink: "https://www.postgresql.org/docs/current/indexes-examine.html"
            }
        };
    }

    return null;
}
