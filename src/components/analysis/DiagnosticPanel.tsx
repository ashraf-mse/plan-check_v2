"use client";

import { useAnalysisStore } from "@/store/useAnalysisStore";
import { cn } from "@/lib/utils";
import { Terminal, ChevronDown, ChevronRight, AlertCircle, Info, AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";

export function DiagnosticPanel() {
    const { logs, clearLogs } = useAnalysisStore();
    const [isExpanded, setIsExpanded] = useState(false);

    if (logs.length === 0) return null;

    const getIcon = (level: string) => {
        switch (level) {
            case 'ERROR': return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
            case 'WARN': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
            default: return <Info className="w-3.5 h-3.5 text-blue-400" />;
        }
    };

    return (
        <div className={cn(
            "rounded-2xl overflow-hidden transition-all duration-500",
            isExpanded ? "glass-dark shadow-2xl" : "bg-slate-900 border border-slate-800 shadow-lg"
        )}>
            <div
                role="button"
                tabIndex={0}
                onClick={() => setIsExpanded(!isExpanded)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsExpanded(!isExpanded); }}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shadow-inner">
                        <Terminal className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Diagnostic Stream</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200">System Logs</span>
                            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                                {logs.length} entries
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={(e) => { e.stopPropagation(); clearLogs(); }}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all group"
                        title="Clear Logs"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-1 rounded-full bg-slate-800/50">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="max-h-80 overflow-y-auto bg-black/40 backdrop-blur-xl font-mono scrollbar-thin scrollbar-thumb-slate-800 p-2">
                    <div className="space-y-1">
                        {logs.map((log, idx) => (
                            <div key={idx} className="text-[10px] flex gap-3 py-2 px-3 hover:bg-white/5 rounded-xl transition-all group border border-transparent hover:border-white/5">
                                <span className="text-slate-600 shrink-0 select-none font-medium">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 2 })}
                                </span>
                                <div className="shrink-0 mt-0.5">{getIcon(log.level)}</div>
                                <div className="flex-1 overflow-hidden space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "font-black tracking-tighter",
                                            log.level === 'ERROR' ? "text-red-400" :
                                                log.level === 'WARN' ? "text-amber-400" :
                                                    "text-blue-400"
                                        )}>
                                            {log.module}
                                        </span>
                                        <span className="text-slate-300 font-medium break-words leading-relaxed text-[11px]">{log.message}</span>
                                    </div>
                                    {log.data && (
                                        <div className="p-2 rounded-lg bg-black/40 text-[9px] text-slate-500 group-hover:text-slate-400 overflow-x-auto border border-white/5">
                                            {typeof log.data === 'object' ? (
                                                <pre className="whitespace-pre-wrap">{JSON.stringify(log.data, null, 2)}</pre>
                                            ) : log.data}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
