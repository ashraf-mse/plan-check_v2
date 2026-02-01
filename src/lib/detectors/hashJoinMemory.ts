import { TruthfulDetection } from '@/lib/types/core';

/**
 * Detects Hash Join memory pressure issues
 * Triggers when Hash Batches > 1, indicating data spilled to disk
 */
export function hashJoinMemoryDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object') return null;
    
    const nodeType = node['Node Type'];
    if (!nodeType || !nodeType.toLowerCase().includes('hash')) return null;

    // Check for Hash Join or Hash node with batching
    const batches = node['Hash Batches'] ?? node['Batches'];
    const buckets = node['Hash Buckets'] ?? node['Buckets'];
    const memoryUsage = node['Memory Usage'] ?? node['Peak Memory Usage'];

    // Hash Batches > 1 means data spilled to disk
    if (typeof batches === 'number' && batches > 1) {
        return {
            id: 'hash_join_memory_pressure',
            title: 'Hash Join Memory Pressure',
            confidence: 'verified',
            impact: 'high',
            evidence: [
                {
                    field: 'Hash Batches',
                    value: batches,
                    rawText: `Hash Batches: ${batches} (spilled to disk)`,
                    location: `Node Type: ${nodeType}`
                },
                ...(typeof buckets === 'number' ? [{
                    field: 'Hash Buckets',
                    value: buckets,
                    rawText: `Hash Buckets: ${buckets}`,
                    location: `Node Type: ${nodeType}`
                }] : []),
                ...(typeof memoryUsage === 'number' ? [{
                    field: 'Memory Usage',
                    value: memoryUsage,
                    rawText: `Memory Usage: ${memoryUsage}kB`,
                    location: `Node Type: ${nodeType}`
                }] : [])
            ],
            education: {
                behavior: `The Hash Join used ${batches} batches, meaning data had to be written to temporary files on disk.`,
                explanation: [
                    "When a Hash Join's hash table exceeds work_mem, PostgreSQL splits the operation into multiple batches.",
                    "Each batch beyond the first requires writing intermediate data to disk and re-reading it.",
                    "This significantly increases I/O overhead and slows down the join operation.",
                    "Consider increasing work_mem for this session or optimizing the join to reduce the hash table size."
                ],
                limitations: [
                    "Cannot see the current work_mem setting",
                    "Cannot determine if increasing work_mem would fit in available RAM",
                    "The actual I/O penalty depends on storage speed"
                ],
                docsLink: "https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-WORK-MEM"
            }
        };
    }

    return null;
}
