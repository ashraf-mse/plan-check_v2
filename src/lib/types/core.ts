export type Confidence = 'verified' | 'inferred' | 'educational';
export type Impact = 'low' | 'medium' | 'high';

export interface Evidence {
    field: string;
    value: string | number;
    rawText: string;
    location: string; // JSONPath or descriptive location
}

// "What We Cannot Know" => education.limitations
export interface TruthfulDetection {
    id: string; // e.g., 'disk_spill'
    title: string;
    confidence: Confidence;
    impact: Impact;
    evidence: Evidence[];
    education: {
        behavior: string; // "PostgreSQL performed an external merge sort"
        explanation: string[];
        limitations: string[]; // "We cannot see work_mem"
        docsLink: string;
    };
}

export interface AnalysisResult {
    id: string;
    timestamp: number;
    rawInput: string;
    findings: TruthfulDetection[];
    parsedPlan: any; // Include plan for visualization
    executionTimeMs: number | null;
    planningTimeMs: number | null;
    parserMetadata: {
        source: 'pev2' | 'fallback';
        analysisTimeMs: number; // Renamed from parsingTimeMs to be more accurate
    };
}
