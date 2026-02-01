"use client";

import { useAnalysisStore } from "@/store/useAnalysisStore";
import { SplitPane } from "@/components/layout/SplitPane";
import { FindingCard } from "@/components/analysis/FindingCard";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Trash2, Clock, Mail, Shield, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { PlanTree } from "@/components/analysis/PlanTree";
import { PersistenceModal } from "@/components/analysis/PersistenceModal";
import { cn } from "@/lib/utils";

export default function Home() {
    const {
        analyze, status, result, error, clear,
        history, loadHistory, deleteFromHistory, setResult
    } = useAnalysisStore();

    const [inputText, setInputText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleAnalyze = async () => {
        if (!inputText.trim()) return;
        await analyze(inputText);
    };

    const leftPane = (
        <div className="h-full flex flex-col bg-white/50 backdrop-blur-xl">
            {/* Header */}
            <div className="px-8 py-8 border-b border-gray-200/60">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <div className="w-5 h-5 border-2 border-white rounded-md" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">PlanCheck</h1>
                    </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">Intelligent PostgreSQL query plan analysis</p>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-8 space-y-6 overflow-hidden">
                {/* Input Section */}
                <div className="flex flex-col gap-5">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Execution Plan
                        </label>
                        <Textarea
                            placeholder="Paste your EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) output here..."
                            className="min-h-[260px] font-mono text-xs resize-none bg-white/80 backdrop-blur-sm border-gray-200/80 shadow-sm focus:shadow-md focus:border-blue-300 transition-all rounded-xl"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleAnalyze}
                            disabled={status === 'parsing' || !inputText.trim()}
                            className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all rounded-xl"
                        >
                            {status === 'parsing' ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2 fill-white" />
                                    Analyze Plan
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => { setInputText(""); clear(); }}
                            className="h-11 rounded-xl border-gray-300 hover:bg-gray-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>

                    {error && (
                        <div className="text-sm text-red-700 p-4 bg-red-50 border border-red-200 rounded-xl card-glow">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* History Section */}
                {history.length > 0 && (
                    <div className="flex-1 flex flex-col min-h-0 pt-6 border-t border-gray-200/60">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            Recent Analyses
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        setResult(item);
                                        setInputText(item.result.rawInput);
                                    }}
                                    className="w-full text-left p-4 rounded-xl border border-gray-200/60 bg-white/60 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                                {item.result.findings.length > 0 ? (
                                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                                ) : (
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                )}
                                                {item.result.findings.length} finding{item.result.findings.length !== 1 ? 's' : ''}
                                            </div>
                                            <div className="text-xs text-gray-500 font-medium">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteFromHistory(item.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Info */}
                <div className="pt-6 border-t border-gray-200/60 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>Analysis runs locally in your browser</span>
                    </div>
                    <a href="mailto:feedback@plancheck.app" className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 transition-colors">
                        <Mail className="w-4 h-4" />
                        <span>Send feedback</span>
                    </a>
                </div>
            </div>
        </div>
    );

    const rightPane = (
        <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50/50 to-white">
            <PersistenceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={(email) => console.log("Saving for email:", email)}
            />

            {status === 'idle' && !result && (
                <div className="h-full flex items-center justify-center p-12">
                    <div className="text-center space-y-6 max-w-lg">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-3xl"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/40">
                                <Play className="w-10 h-10 text-white fill-white" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                                Paste a query plan to begin
                            </h2>
                            <p className="text-base text-gray-600 leading-relaxed">
                                Analyze PostgreSQL execution plans to identify performance issues and optimization opportunities.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-sm text-green-700 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            No data leaves your browser
                        </div>
                    </div>
                </div>
            )}

            {status === 'parsing' && (
                <div className="h-full flex items-center justify-center p-12">
                    <div className="text-center space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-3xl blur-3xl animate-pulse"></div>
                            <div className="relative">
                                <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto stroke-[2.5]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Analyzing plan</h2>
                            <p className="text-sm text-gray-600">Parsing execution tree and running detectors...</p>
                        </div>
                    </div>
                </div>
            )}

            {status === 'complete' && result && (
                <div className="p-10 space-y-10">
                    {/* Results Header */}
                    <div className="flex items-start justify-between gap-6 pb-8 border-b border-gray-200/60">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Analysis Results
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100 italic">
                                    Query took {result.executionTimeMs !== null ? `${result.executionTimeMs.toFixed(2)}ms` : 'unknown time'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    {result.findings.length > 0 ? (
                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    )}
                                    {result.findings.length} issue{result.findings.length !== 1 ? 's' : ''}
                                </span>
                                <span className="text-gray-400">·</span>
                                <span className="text-xs text-gray-400 italic">Analysis: {result.parserMetadata.analysisTimeMs.toFixed(0)}ms</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsModalOpen(true)}
                            className="rounded-xl border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                        >
                            Save & Share
                        </Button>
                    </div>

                    {/* Execution Plan Tree */}
                    <div className="space-y-5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Execution Plan
                        </h3>
                        <div className="border border-gray-200/80 rounded-2xl p-8 bg-white card-glow">
                            <PlanTree node={result.parsedPlan} findings={result.findings} />
                        </div>
                    </div>

                    {/* Findings */}
                    {result.findings.length > 0 ? (
                        <div className="space-y-5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                Performance Issues
                            </h3>
                            <div className="space-y-5">
                                {result.findings.map((finding) => (
                                    <FindingCard key={finding.id} finding={finding} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-green-200 rounded-2xl p-16 text-center bg-green-50/50">
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-green-500/30">
                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All clear!</h3>
                                    <p className="text-sm text-gray-600">No performance issues detected in this query plan.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <main className="h-full">
            <SplitPane left={leftPane} right={rightPane} />
        </main>
    );
}
