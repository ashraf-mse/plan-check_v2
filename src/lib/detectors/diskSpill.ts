import { TruthfulDetection } from '@/lib/types/core';

export function diskSpillDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object') return null;

    const sortMethod = node['Sort Method'];
    const diskSpace = node['Sort Space Used'];

    if (typeof sortMethod === 'string' && sortMethod.includes('external merge')) {
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
                    rawText: `Sort Space Used: ${diskSpace}`,
                    location: 'Node properties'
                }] : [])
            ],
            education: {
                behavior: "PostgreSQL performed an external merge sort, spilling data to disk.",
                explanation: [
                    "The operation required more memory than `work_mem` allowed.",
                    "PostgreSQL resorted to writing intermediate results to temporary files on disk."
                ],
                limitations: [
                    "Cannot see work_mem setting",
                    "Do not know if spill was expected",
                    "Cannot determine exact I/O penalty without Buffers"
                ],
                docsLink: "https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-WORK-MEM"
            }
        };
    }

    return null;
}
