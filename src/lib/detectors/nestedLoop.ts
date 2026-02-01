import { TruthfulDetection } from '@/lib/types/core';

export function nestedLoopDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object' || node['Node Type'] !== 'Nested Loop') return null;

    const loops = node['Actual Loops'];
    const threshold = 1000;

    if (typeof loops === 'number' && loops > threshold) {
        return {
            id: 'high_freq_nested_loop',
            title: 'High-Frequency Nested Loop',
            confidence: 'verified',
            impact: 'high',
            evidence: [
                {
                    field: 'Actual Loops',
                    value: loops,
                    rawText: `Actual Loops: ${loops}`,
                    location: `Node Type: ${node['Node Type']}`
                }
            ],
            education: {
                behavior: "A Nested Loop join was executed a high number of times.",
                explanation: [
                    "Nested loops are efficient for small sets but degrade exponentially as the 'inner' side grows.",
                    `This join was repeated ${loops} times, which suggests the outer relation is larger than optimal for this join type.`
                ],
                limitations: [
                    "Cannot see if the inner side is indexed (though likely, or it would be even slower)",
                    "Do not know if a Hash Join would have been feasible due to memory/type constraints"
                ],
                docsLink: "https://www.postgresql.org/docs/current/planner-optimizer.html"
            }
        };
    }

    return null;
}
