import { TruthfulDetection } from '@/lib/types/core';

export function nestedLoopDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object' || node['Node Type'] !== 'Nested Loop') return null;

    // In a Nested Loop, the second child (index 1) is the "inner" side that gets looped
    const plans = node['Plans'];
    if (!Array.isArray(plans) || plans.length < 2) return null;

    const innerChild = plans[1];
    if (!innerChild) return null;

    const innerLoops = innerChild['Actual Loops'];
    const innerTime = innerChild['Actual Total Time'] || 0;
    const innerRelation = innerChild['Relation Name'] || innerChild['Node Type'] || 'inner table';
    const threshold = 100; // Flag if inner side is scanned 100+ times

    if (typeof innerLoops === 'number' && innerLoops > threshold) {
        // Calculate severity based on loop count
        const impact = innerLoops >= 1000 ? 'high' : 'medium';
        const innerNodeType = innerChild['Node Type'] || 'scan';
        
        // Get buffer stats if available
        const buffers = innerChild['Buffers'] || {};
        const sharedHit = buffers['Shared Hit'] || 0;
        const sharedRead = buffers['Shared Read'] || 0;
        const totalBuffers = sharedHit + sharedRead;
        
        return {
            id: `nested_loop_${innerRelation}`,
            title: 'High-Iteration Nested Loop',
            confidence: 'verified',
            impact,
            evidence: [
                {
                    field: 'Inner Iterations',
                    value: innerLoops,
                    rawText: `Inner side executed ${innerLoops.toLocaleString()} times`,
                    location: `Nested Loop → ${innerNodeType} on ${innerRelation}`
                },
                ...(innerTime > 0 ? [{
                    field: 'Inner Time',
                    value: innerTime,
                    rawText: `Cumulative inner time: ${innerTime.toFixed(2)}ms`,
                    location: innerRelation
                }] : []),
                ...(totalBuffers > 0 ? [{
                    field: 'Buffer Accesses',
                    value: totalBuffers,
                    rawText: `Buffer accesses: ${totalBuffers.toLocaleString()} (${sharedHit.toLocaleString()} hit, ${sharedRead.toLocaleString()} read)`,
                    location: innerRelation
                }, {
                    field: 'Amplification',
                    value: (totalBuffers / innerLoops).toFixed(1),
                    rawText: `Amplification: ${(totalBuffers / innerLoops).toFixed(1)} buffer touches per iteration`,
                    location: 'Buffer efficiency'
                }] : [])
            ],
            education: {
                behavior: `Nested Loop join with ${innerLoops.toLocaleString()} inner iterations on '${innerRelation}'.`,
                explanation: [
                    `Inner ${innerNodeType} executed ${innerLoops.toLocaleString()} times.`,
                    innerTime > 0 ? `Total inner execution: ${innerTime.toFixed(2)}ms` : "",
                    totalBuffers > 0 ? `Total buffer accesses: ${totalBuffers.toLocaleString()}` : "",
                    "Nested Loop strategy executes inner side once per outer row."
                ].filter(Boolean),
                limitations: [
                    "Cannot determine if this join strategy was intentional (LATERAL, correlated subquery)",
                    "Cannot assess if alternative join methods would fit in memory",
                    "Inner side may be efficiently indexed despite high iteration count"
                ],
                docsLink: "https://www.postgresql.org/docs/current/planner-optimizer.html"
            }
        };
    }

    return null;
}
