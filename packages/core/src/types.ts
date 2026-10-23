export type Confidence = 'verified' | 'inferred' | 'educational';
export type Impact = 'low' | 'medium' | 'high';

export interface Evidence {
  field: string;
  value: string | number;
  rawText: string;
  location: string;
}

export interface TruthfulDetection {
  id: string;
  title: string;
  confidence: Confidence;
  impact: Impact;
  evidence: Evidence[];
  education: {
    behavior: string;
    explanation: string[];
    limitations: string[];
    docsLink: string;
  };
}

export interface ParserResult {
  source: 'pev2' | 'fallback';
  plan: any;
  analysisTimeMs: number;
  executionTimeMs: number | null;
  planningTimeMs: number | null;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  rawInput: string;
  findings: TruthfulDetection[];
  parsedPlan: any;
  executionTimeMs: number | null;
  planningTimeMs: number | null;
  parserMetadata: {
    source: 'pev2' | 'fallback';
    analysisTimeMs: number;
  };
}
