import { TruthfulDetection } from '@/lib/types/core';

/**
 * Detects JIT compilation overhead
 * JIT is beneficial for long-running analytical queries but harmful for short queries
 * due to compilation overhead exceeding potential runtime savings.
 */
export function jitOverheadDetector(node: any): TruthfulDetection | null {
    if (!node || typeof node !== 'object') return null;
    
    const jit = node['JIT'];
    if (!jit) return null;
    
    const timing = jit['Timing'];
    if (!timing || typeof timing['Total'] !== 'number') return null;
    
    const jitTotal = timing['Total'];
    const functions = jit['Functions'] ?? 0;
    
    // Get execution time from node (root node should have Actual Total Time)
    const nodeTime = node['Actual Total Time'] ?? 0;
    
    // Calculate JIT as percentage of total query time
    // Total query time ≈ nodeTime (which already includes JIT overhead in PostgreSQL)
    // Net execution = nodeTime (JIT overhead is part of Execution Time, not additive)
    // But we want to flag when JIT is a significant portion
    const jitPercentage = nodeTime > 0 ? (jitTotal / nodeTime) * 100 : 0;
    
    // Only flag if JIT is >20% of execution time (significant overhead)
    if (jitPercentage < 20) return null;
    
    // Determine impact based on JIT overhead
    let impact: 'low' | 'medium' | 'high';
    if (jitPercentage >= 50 || jitTotal >= 1000) {
        impact = 'high';
    } else if (jitPercentage >= 30 || jitTotal >= 500) {
        impact = 'medium';
    } else {
        impact = 'low';
    }

    const evidence: TruthfulDetection['evidence'] = [
        {
            field: 'JIT Total Time',
            value: `${jitTotal.toFixed(2)} ms`,
            rawText: `JIT compilation: ${jitTotal.toFixed(2)} ms`,
            location: 'JIT'
        },
        {
            field: 'JIT Percentage',
            value: `${jitPercentage.toFixed(1)}%`,
            rawText: `${jitPercentage.toFixed(1)}% of execution time`,
            location: 'JIT'
        }
    ];

    if (functions > 0) {
        evidence.push({
            field: 'Functions Compiled',
            value: functions,
            rawText: `${functions} functions compiled`,
            location: 'JIT'
        });
    }

    // Add breakdown if available
    if (timing['Optimization']) {
        evidence.push({
            field: 'JIT Breakdown',
            value: `Optimization ${timing['Optimization'].toFixed(1)}ms, Inlining ${timing['Inlining']?.toFixed(1) ?? 0}ms, Emission ${timing['Emission']?.toFixed(1) ?? 0}ms, Generation ${timing['Generation']?.toFixed(1) ?? 0}ms`,
            rawText: 'JIT time breakdown',
            location: 'JIT'
        });
    }

    return {
        id: 'jit_compilation_overhead',
        title: 'JIT Compilation Overhead',
        confidence: 'verified',
        impact,
        evidence,
        education: {
            behavior: `JIT compilation consumed ${jitTotal.toFixed(0)} ms (${jitPercentage.toFixed(0)}% of execution time).`,
            explanation: [
                'JIT (Just-In-Time) compilation converts query expressions to native machine code.',
                'For long-running analytical queries (minutes/hours), JIT can provide significant speedups.',
                'For short queries (seconds), JIT compilation overhead often exceeds its performance benefit.',
                `This query spent ${jitPercentage.toFixed(0)}% of its time on JIT compilation.`
            ],
            limitations: [
                'Cannot determine if JIT actually improved execution speed for this query',
                'Cannot measure what execution time would be without JIT'
            ],
            docsLink: 'https://www.postgresql.org/docs/current/jit.html'
        }
    };
}
