import { TruthfulDetection } from '@/lib/types/core';

/**
 * Detects joins with high rows removed by join filter
 * This often indicates a missing or incorrect join condition
 */
export function joinFilterDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object') return null;
    
    const nodeType = node['Node Type'];
    if (!nodeType) return null;

    // Check for join node types
    const isJoin = nodeType.includes('Join') || 
                   nodeType.includes('Nested Loop') ||
                   nodeType === 'Merge Join' ||
                   nodeType === 'Hash Join';
    
    if (!isJoin) return null;

    const rowsRemovedByJoinFilter = node['Rows Removed by Join Filter'];
    const actualRows = node['Actual Rows'];

    // Only trigger if significant rows were removed
    if (typeof rowsRemovedByJoinFilter !== 'number' || rowsRemovedByJoinFilter <= 0) return null;
    
    const outputRows = typeof actualRows === 'number' ? actualRows : 0;
    const totalProcessed = outputRows + rowsRemovedByJoinFilter;
    
    if (totalProcessed < 1000) return null; // Skip small joins

    const filterRatio = rowsRemovedByJoinFilter / totalProcessed;

    // Flag if more than 50% of joined rows were filtered away
    if (filterRatio > 0.5 && rowsRemovedByJoinFilter > 10000) {
        const joinFilter = node['Join Filter'];
        const hashCond = node['Hash Cond'];
        const mergeCond = node['Merge Cond'];

        return {
            id: 'join_filter_high_removal',
            title: 'Excessive Join Filter Removal',
            confidence: 'inferred',
            impact: filterRatio > 0.9 ? 'high' : 'medium',
            evidence: [
                {
                    field: 'Rows Removed by Join Filter',
                    value: rowsRemovedByJoinFilter,
                    rawText: `Rows Removed by Join Filter: ${rowsRemovedByJoinFilter.toLocaleString()}`,
                    location: `Node Type: ${nodeType}`
                },
                {
                    field: 'Actual Rows',
                    value: outputRows,
                    rawText: `Actual Rows Output: ${outputRows.toLocaleString()}`,
                    location: `Node Type: ${nodeType}`
                },
                {
                    field: 'Filter Ratio',
                    value: filterRatio,
                    rawText: `${(filterRatio * 100).toFixed(1)}% of joined rows were discarded`,
                    location: 'Computed'
                },
                ...(joinFilter ? [{
                    field: 'Join Filter',
                    value: joinFilter,
                    rawText: `Join Filter: ${joinFilter}`,
                    location: 'Node properties'
                }] : []),
                ...(hashCond ? [{
                    field: 'Hash Cond',
                    value: hashCond,
                    rawText: `Hash Cond: ${hashCond}`,
                    location: 'Node properties'
                }] : []),
                ...(mergeCond ? [{
                    field: 'Merge Cond',
                    value: mergeCond,
                    rawText: `Merge Cond: ${mergeCond}`,
                    location: 'Node properties'
                }] : [])
            ],
            education: {
                behavior: `The ${nodeType} produced ${totalProcessed.toLocaleString()} rows but ${(filterRatio * 100).toFixed(1)}% were discarded by a Join Filter.`,
                explanation: [
                    "Join Filters are applied after the join operation, meaning PostgreSQL first joins all matching rows then filters them.",
                    "High removal rates suggest the filter condition could potentially be moved to the join condition itself.",
                    "If the filter can be converted to a join condition, PostgreSQL can skip non-matching rows earlier.",
                    "This pattern often occurs with complex join conditions or when WHERE clauses reference both tables."
                ],
                limitations: [
                    "Cannot determine if the filter can be converted to a join condition",
                    "Some filters must remain as post-join filters due to NULL handling or expression complexity",
                    "Cannot see if indexes exist that would help with a different join strategy"
                ],
                docsLink: "https://www.postgresql.org/docs/current/planner-optimizer.html"
            }
        };
    }

    return null;
}
