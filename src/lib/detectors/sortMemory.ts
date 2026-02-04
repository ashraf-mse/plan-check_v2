import { TruthfulDetection } from '@/lib/types/core';

/**
 * Detects Sort operations using disk instead of memory
 * Complementary to diskSpill but specifically for Sort Space Type
 */
export function sortMemoryDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object') return null;
    
    const nodeType = node['Node Type'];
    if (nodeType !== 'Sort') return null;

    const sortSpaceType = node['Sort Space Type'];
    const sortSpaceUsed = node['Sort Space Used'];
    const sortMethod = node['Sort Method'];
    const sortKey = node['Sort Key'];

    // Check if sort is using disk, but ONLY if it's not an external merge (which diskSpill handles)
    // This detector handles cases where Sort Space Type is Disk but method is NOT external merge
    const isExternalMerge = typeof sortMethod === 'string' && sortMethod.toLowerCase().includes('external');
    
    // Skip if external merge - that's handled by diskSpillDetector to avoid duplicates
    if (isExternalMerge) return null;
    
    // Only fire for Disk storage without external merge (rare edge cases)
    if (sortSpaceType === 'Disk') {
        const spaceKB = typeof sortSpaceUsed === 'number' ? sortSpaceUsed : 0;
        const spaceMB = (spaceKB / 1024).toFixed(2);

        return {
            id: 'sort_disk_usage',
            title: 'Sort Using Disk Storage',
            confidence: 'verified',
            impact: spaceKB > 102400 ? 'high' : 'medium', // > 100MB is high impact
            evidence: [
                {
                    field: 'Sort Space Type',
                    value: sortSpaceType || 'Disk (external)',
                    rawText: `Sort Space Type: ${sortSpaceType || 'Disk'}`,
                    location: `Node Type: ${nodeType}`
                },
                ...(typeof sortSpaceUsed === 'number' ? [{
                    field: 'Sort Space Used',
                    value: sortSpaceUsed,
                    rawText: `Sort Space Used: ${spaceKB.toLocaleString()}kB (${spaceMB}MB)`,
                    location: `Node Type: ${nodeType}`
                }] : []),
                ...(sortMethod ? [{
                    field: 'Sort Method',
                    value: sortMethod,
                    rawText: `Sort Method: ${sortMethod}`,
                    location: `Node Type: ${nodeType}`
                }] : []),
                ...(sortKey ? [{
                    field: 'Sort Key',
                    value: Array.isArray(sortKey) ? sortKey.join(', ') : sortKey,
                    rawText: `Sort Key: ${Array.isArray(sortKey) ? sortKey.join(', ') : sortKey}`,
                    location: 'Sort properties'
                }] : [])
            ],
            education: {
                behavior: `The Sort operation spilled ${spaceMB}MB to disk because it exceeded available memory.`,
                explanation: [
                    "PostgreSQL's work_mem setting limits how much memory each sort operation can use.",
                    "When sort data exceeds work_mem, PostgreSQL writes temporary files to disk.",
                    "Disk-based sorts are significantly slower than in-memory sorts due to I/O overhead.",
                    spaceKB > 102400 
                        ? "This sort used over 100MB of disk space - consider significantly increasing work_mem for this query."
                        : "Consider increasing work_mem for this session to keep the sort in memory."
                ],
                limitations: [
                    "Cannot see the current work_mem setting",
                    "Cannot determine if this query can be rewritten to avoid sorting",
                    "Cannot see if an index could provide pre-sorted data"
                ],
                docsLink: "https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-WORK-MEM"
            }
        };
    }

    return null;
}
