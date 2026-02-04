import { TruthfulDetection } from '@/lib/types/core';

/**
 * Detects trigger time dominance in query execution
 * Triggers can often dominate execution time, especially with bulk operations
 */
export function triggerOverheadDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object') return null;
    
    const triggers = node['Triggers'];
    if (!Array.isArray(triggers) || triggers.length === 0) return null;

    // Calculate total trigger time and calls
    let totalTriggerTime = 0;
    let totalCalls = 0;
    const triggerDetails: string[] = [];

    for (const trigger of triggers) {
        const time = trigger['Time'] || 0;
        const calls = trigger['Calls'] || 0;
        const name = trigger['Trigger Name'] || 'Unknown';
        const relation = trigger['Relation'] || '';
        
        totalTriggerTime += time;
        totalCalls = Math.max(totalCalls, calls); // Usually all triggers have same call count
        
        if (time > 0) {
            triggerDetails.push(`${name}${relation ? ` on ${relation}` : ''}: ${(time / 1000).toFixed(2)}s (${calls.toLocaleString()} calls)`);
        }
    }

    // Only flag if triggers took significant time (>1 second total)
    if (totalTriggerTime < 1000) return null;

    const executionTime = node['Actual Total Time'] || 0;
    const triggerPercentage = executionTime > 0 
        ? Math.round((totalTriggerTime / executionTime) * 100)
        : 0;

    // Determine severity based on trigger dominance
    const impact = triggerPercentage >= 50 ? 'high' : 'medium';

    return {
        id: 'trigger_overhead',
        title: 'Trigger Execution Overhead',
        confidence: 'verified',
        impact,
        evidence: [
            {
                field: 'Total Trigger Time',
                value: totalTriggerTime,
                rawText: `Total trigger time: ${(totalTriggerTime / 1000).toFixed(2)}s`,
                location: `${triggers.length} trigger(s)`
            },
            {
                field: 'Trigger Calls',
                value: totalCalls,
                rawText: `Trigger invocations: ${totalCalls.toLocaleString()}`,
                location: 'Per trigger'
            },
            ...(executionTime > 0 ? [{
                field: 'Time Percentage',
                value: triggerPercentage,
                rawText: `Trigger time: ${triggerPercentage}% of total execution`,
                location: 'Execution breakdown'
            }] : []),
            ...triggerDetails.map((detail, i) => ({
                field: `Trigger ${i + 1}`,
                value: triggers[i]['Time'],
                rawText: detail,
                location: triggers[i]['Relation'] || 'Trigger'
            }))
        ],
        education: {
            behavior: `Triggers consumed ${(totalTriggerTime / 1000).toFixed(2)}s (${triggerPercentage}% of execution) across ${totalCalls.toLocaleString()} invocations.`,
            explanation: [
                `${triggers.length} trigger(s) executed ${totalCalls.toLocaleString()} times each.`,
                `Total trigger overhead: ${(totalTriggerTime / 1000).toFixed(2)} seconds.`,
                triggerPercentage >= 50 
                    ? `Triggers account for ${triggerPercentage}% of execution time.`
                    : "",
                "Each row modification invokes all applicable triggers."
            ].filter(Boolean),
            limitations: [
                "Cannot determine trigger complexity or optimization potential",
                "Cannot assess if triggers are necessary for business logic",
                "Bulk operations amplify trigger overhead proportionally"
            ],
            docsLink: "https://www.postgresql.org/docs/current/trigger-definition.html"
        }
    };
}
