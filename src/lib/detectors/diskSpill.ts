import { TruthfulDetection } from '@/lib/types/core';

export function diskSpillDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object') return null;

    const sortMethod = node['Sort Method'];
    const diskSpace = node['Sort Space Used'];

    if (typeof sortMethod === 'string' && sortMethod.includes('external merge')) {
        // Sort Space Used is in KB in PostgreSQL
        const spaceKB = typeof diskSpace === 'number' ? diskSpace : 0;
        // Use integer division for clean display - PostgreSQL reports whole KB values
        const spaceMB = Math.floor(spaceKB / 1024);
        const isLargeSpill = spaceKB > 102400; // > 100MB
        
        return {
            id: 'disk_spill',
            title: 'Disk Spill Detected',
            confidence: 'verified',
            impact: 'high',
            evidence: [
                {
                    field: 'Sort Method',
                    value: sortMethod,
                    rawText: `Sort Method: ${sortMethod}`,
                    location: `Node Type: ${node['Node Type'] ?? 'Unknown'}`
                },
                ...(diskSpace ? [{
                    field: 'Sort Space Used',
                    value: diskSpace,
                    rawText: `Sort Space Used: ${spaceKB.toLocaleString()} KB (${spaceMB} MB)`,
                    location: 'Node properties'
                }] : [])
            ],
            education: {
                behavior: spaceKB > 0 
                    ? `External merge sort detected. Temporary disk space used: ${spaceMB} MB.`
                    : "External merge sort detected. Data was written to temporary files.",
                explanation: [
                    `Sort method: ${sortMethod}`,
                    spaceKB > 0 ? `Disk space utilized: ${spaceKB.toLocaleString()} KB (${spaceMB} MB)` : "",
                    "External merge indicates the sort exceeded available work_mem.",
                    "Temporary files were created to complete the sort operation."
                ].filter(Boolean),
                limitations: [
                    "Cannot see current work_mem setting",
                    "Cannot determine if disk-based sort was expected for this workload",
                    "Cannot measure actual I/O latency without system-level metrics"
                ],
                docsLink: "https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-WORK-MEM"
            }
        };
    }

    return null;
}
