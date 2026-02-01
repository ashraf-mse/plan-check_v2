import { create } from 'zustand';
import { AnalysisResult } from '@/lib/types/core';
import { ParserManager } from '@/lib/parser/manager';
import { AnalysisManager } from '@/lib/analysis/manager';
import { saveAnalysis, getHistory, deleteAnalysis, StoredAnalysis } from '@/lib/storage/db';
import Logger, { LogEntry } from '@/lib/utils/logger';

interface AnalysisState {
    status: 'idle' | 'parsing' | 'complete' | 'error';
    result: AnalysisResult | null;
    parsedPlan: any | null;
    error: string | null;
    history: StoredAnalysis[];
    logs: LogEntry[];

    analyze: (text: string) => Promise<void>;
    loadHistory: () => Promise<void>;
    deleteFromHistory: (id: string) => Promise<void>;
    clear: () => void;
    setResult: (stored: StoredAnalysis) => void;
    addLog: (entry: LogEntry) => void;
    clearLogs: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => {
    // Subscribe to logger for store-based log visibility
    Logger.subscribe((entry) => {
        set((state) => ({
            logs: [...state.logs, entry].slice(-50) // Keep last 50 logs for UI performance
        }));
    });

    return {
        status: 'idle',
        result: null,
        parsedPlan: null,
        error: null,
        history: [],
        logs: Logger.getEntries(),

        addLog: (entry) => set((state) => ({ logs: [...state.logs, entry].slice(-50) })),
        clearLogs: () => {
            Logger.clear();
            set({ logs: [] });
        },

        analyze: async (text: string) => {
            Logger.info('Analysis', 'Starting new analysis session', { inputLength: text.length });
            set({ status: 'parsing', error: null, result: null, parsedPlan: null });

            const parser = new ParserManager();
            const analyzer = new AnalysisManager();

            try {
                const parseRes = await parser.parse(text);
                const findings = await analyzer.analyze(parseRes);

                const analysisResult: AnalysisResult = {
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    rawInput: text,
                    findings,
                    parsedPlan: parseRes.plan,
                    executionTimeMs: parseRes.executionTimeMs,
                    planningTimeMs: parseRes.planningTimeMs,
                    parserMetadata: {
                        source: parseRes.source,
                        analysisTimeMs: parseRes.analysisTimeMs
                    }
                };

                const storedAnalysis: StoredAnalysis = {
                    id: analysisResult.id,
                    timestamp: analysisResult.timestamp,
                    result: analysisResult,
                    parsedPlan: parseRes.plan
                };

                await saveAnalysis(storedAnalysis);
                Logger.info('Analysis', 'Analysis completed and saved to history', {
                    findingsCount: findings.length,
                    analysisTime: parseRes.analysisTimeMs,
                    source: parseRes.source
                });

                const updatedHistory = await getHistory();

                set({
                    status: 'complete',
                    result: analysisResult,
                    parsedPlan: parseRes.plan,
                    history: updatedHistory
                });
            } catch (err: any) {
                Logger.error('Analysis', 'Analysis failed', { error: err.message });
                set({ status: 'error', error: err.message || 'Analysis failed' });
            }
        },

        loadHistory: async () => {
            const history = await getHistory();
            set({ history });
        },

        deleteFromHistory: async (id: string) => {
            await deleteAnalysis(id);
            const history = await getHistory();
            set({ history });
        },

        setResult: (stored: StoredAnalysis) => {
            Logger.info('Analysis', 'Loaded analysis from history', { id: stored.id });
            set({
                status: 'complete',
                result: stored.result,
                parsedPlan: stored.parsedPlan,
                error: null
            });
        },

        clear: () => {
            Logger.info('Analysis', 'State cleared');
            set({ status: 'idle', result: null, parsedPlan: null, error: null });
        }
    };
});
