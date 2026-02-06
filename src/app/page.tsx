"use client";

const EXAMPLE_PLAN = `[
  {
    "Plan": {
      "Node Type": "Seq Scan",
      "Parallel Aware": false,
      "Async Capable": false,
      "Relation Name": "orders",
      "Alias": "orders",
      "Startup Cost": 0.00,
      "Total Cost": 25000.00,
      "Plan Rows": 500000,
      "Plan Width": 48,
      "Actual Startup Time": 0.015,
      "Actual Total Time": 1245.832,
      "Actual Rows": 156,
      "Actual Loops": 1,
      "Filter": "(customer_id = 42)",
      "Rows Removed by Filter": 987542
    },
    "Planning Time": 0.125,
    "Execution Time": 1289.456,
    "Triggers": []
  }
]`;

import { useAnalysisStore } from "@/store/useAnalysisStore";
import { FindingCard } from "@/components/analysis/FindingCard";
import { PlanTree } from "@/components/analysis/PlanTree";
import { CodeEditor } from "@/components/ui/CodeEditor";
import { LoadingState, SkeletonCard } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { 
    Loader2, Shield, Database, Clock, ChevronRight, ChevronDown, ChevronLeft,
    FileJson, FileText, Sparkles, Copy, Play,
    AlertCircle, AlertTriangle, Info, CheckCircle2, TrendingUp, Activity,
    Menu, X, BarChart3
} from "lucide-react";

export default function Home() {
    const {
        analyze, status, result, error, clear,
        history, loadHistory, deleteFromHistory, setResult
    } = useAnalysisStore();

    const [inputText, setInputText] = useState("");
    const [activeTab, setActiveTab] = useState<'json' | 'text'>('json');
    const [activeResultTab, setActiveResultTab] = useState<'findings' | 'tree'>('findings');
    const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
    const [expandedSeverity, setExpandedSeverity] = useState<{[key: string]: boolean}>({
        critical: true,
        high: true,
        medium: false,
        low: false
    });
    const [showMobileHistory, setShowMobileHistory] = useState(false);
    const [showMobileResults, setShowMobileResults] = useState(false);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleAnalyze = async () => {
        if (!inputText.trim()) return;
        await analyze(inputText);
    };

    const hasResult = status === 'complete' && result;
    const isAnalyzing = status === 'parsing';
    
    // Group findings by severity
    const groupedFindings = hasResult ? {
        critical: result.findings.filter((f: any) => f.impact === 'high' && f.confidence === 'verified'),
        high: result.findings.filter((f: any) => f.impact === 'high' && f.confidence !== 'verified'),
        medium: result.findings.filter((f: any) => f.impact === 'medium'),
        low: result.findings.filter((f: any) => f.impact === 'low')
    } : { critical: [], high: [], medium: [], low: [] };

    return (
        <div className="h-screen flex flex-col" style={{ background: 'var(--bg-app)' }}>
            {/* Header Bar */}
            <header className="h-14 md:h-16 border-b flex items-center px-3 md:px-6 shrink-0" style={{ 
                borderColor: 'var(--border-default)',
                background: 'linear-gradient(to right, #0a0e14, #0f1419)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
                {/* Mobile menu button */}
                <button 
                    onClick={() => setShowMobileHistory(!showMobileHistory)}
                    className="md:hidden p-2 mr-2 rounded-lg"
                    style={{ background: 'var(--bg-elevated)' }}
                >
                    <Menu className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                </button>
                
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center" style={{
                        background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                        boxShadow: '0 0 30px rgba(6, 182, 212, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}>
                        <Database className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1 md:gap-2">
                            <span className="text-lg md:text-xl font-bold gradient-text-cyan">PlanCheck</span>
                            <span className="hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-full" style={{ 
                                background: 'rgba(6, 182, 212, 0.2)',
                                color: 'var(--accent-cyan)',
                                border: '1px solid rgba(6, 182, 212, 0.3)'
                            }}>v2</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ 
                                background: 'rgba(245, 158, 11, 0.2)',
                                color: '#f59e0b',
                                border: '1px solid rgba(245, 158, 11, 0.4)'
                            }}>BETA</span>
                        </div>
                        <span className="hidden md:block text-xs" style={{ color: 'var(--text-tertiary)' }}>PostgreSQL EXPLAIN Analyzer</span>
                    </div>
                </div>
                <div className="flex-1" />
                
                {/* Mobile results button */}
                {hasResult && (
                    <button 
                        onClick={() => setShowMobileResults(true)}
                        className="md:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg mr-2"
                        style={{ background: 'rgba(6, 182, 212, 0.2)', border: '1px solid rgba(6, 182, 212, 0.3)' }}
                    >
                        <BarChart3 className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--accent-cyan)' }}>
                            {result.findings.length}
                        </span>
                    </button>
                )}
                
                <div className="hidden sm:flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg" style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                    <Shield className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--accent-green)' }}>100% Client-Side</span>
                </div>
            </header>

            {/* Main Three-Column Layout */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Mobile History Overlay */}
                {showMobileHistory && (
                    <div 
                        className="md:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setShowMobileHistory(false)}
                    />
                )}
                
                {/* LEFT SIDEBAR - History */}
                <aside className={cn(
                    "w-[280px] border-r flex flex-col z-50",
                    "fixed md:relative inset-y-0 left-0",
                    "transition-transform duration-300 ease-in-out",
                    showMobileHistory ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )} style={{
                    borderColor: 'var(--border-default)',
                    background: 'var(--bg-surface)'
                }}>
                    {/* History Header */}
                    <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5" style={{ color: 'var(--accent-cyan)' }} />
                            <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Plan History</span>
                        </div>
                        <button 
                            onClick={() => setShowMobileHistory(false)}
                            className="p-1 rounded md:hidden"
                            style={{ background: 'var(--bg-elevated)' }}
                        >
                            <X className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        </button>
                        <button 
                            className="p-1 rounded hidden md:block"
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        </button>
                    </div>
                    
                    {/* Search */}
                    <div className="px-4 pt-4 pb-2">
                        <input 
                            type="text" 
                            placeholder="Search history..."
                            className="w-full px-3 py-2 rounded-lg text-sm"
                            style={{
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-default)',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                    </div>
                    
                    {/* Filter */}
                    <div className="px-4 pb-3">
                        <select 
                            value={filterSeverity}
                            onChange={(e) => setFilterSeverity(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-lg text-sm"
                            style={{
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-default)',
                                color: 'var(--text-secondary)',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">All Severities</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                        </select>
                    </div>
                    
                    {/* History List */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                        {history.length === 0 ? (
                            <EmptyState type="history" />
                        ) : (
                            history
                                .filter((item) => {
                                    if (filterSeverity === 'all') return true;
                                    const hasCritical = item.result.findings.some((f: any) => f.impact === 'high' && f.confidence === 'verified');
                                    const hasHigh = item.result.findings.some((f: any) => f.impact === 'high');
                                    const hasMedium = item.result.findings.some((f: any) => f.impact === 'medium');
                                    if (filterSeverity === 'critical') return hasCritical;
                                    if (filterSeverity === 'high') return hasHigh;
                                    if (filterSeverity === 'medium') return hasMedium;
                                    return true;
                                })
                                .slice(0, 10)
                                .map((item) => {
                                const findingCount = item.result.findings.length;
                                const hasCritical = item.result.findings.some((f: any) => f.impact === 'high');
                                
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setResult(item);
                                            setInputText(item.result.rawInput);
                                        }}
                                        className="w-full p-3 rounded-lg text-left transition-all duration-200"
                                        style={{
                                            background: hasCritical ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-elevated)',
                                            border: hasCritical ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = hasCritical ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-hover)';
                                            e.currentTarget.style.borderColor = hasCritical ? 'rgba(239, 68, 68, 0.5)' : 'var(--accent-cyan)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = hasCritical ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-elevated)';
                                            e.currentTarget.style.borderColor = hasCritical ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)';
                                        }}
                                    >
                                        {/* Header: finding count + critical badge */}
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    findingCount === 0 ? "bg-emerald-500" :
                                                    hasCritical ? "bg-red-500 animate-pulse" : "bg-amber-500"
                                                )} />
                                                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {findingCount} finding{findingCount !== 1 ? 's' : ''}
                                                </span>
                                                {hasCritical && (
                                                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{
                                                        background: 'var(--accent-red)',
                                                        color: 'white',
                                                        letterSpacing: '0.05em'
                                                    }}>
                                                        Critical
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Metadata row */}
                                        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                                            <span className="font-mono" style={{ color: 'var(--accent-cyan)' }}>
                                                {item.result.executionTimeMs?.toFixed(0) || '—'}ms
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                    
                    {/* Privacy footer */}
                    <div className="p-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <Shield className="w-3 h-3" />
                            <span>100% client-side</span>
                        </div>
                    </div>
                </aside>
                
                {/* CENTER PANEL - Code Editor */}
                <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-app)' }}>
                    {/* Tabs */}
                    <div className="border-b flex items-center px-4 gap-1" style={{ borderColor: 'var(--border-default)' }}>
                        {[
                            { id: 'json', icon: FileJson, label: 'JSON' },
                            { id: 'text', icon: FileText, label: 'Text' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all"
                                style={{
                                    color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-tertiary)',
                                    borderBottom: activeTab === tab.id ? '2px solid var(--accent-cyan)' : '2px solid transparent'
                                }}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                        
                        <div className="flex-1" />
                        
                        <button 
                            onClick={() => setInputText(EXAMPLE_PLAN)}
                            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 rounded text-xs hover:opacity-80 transition-opacity" 
                            style={{
                                background: 'var(--bg-elevated)',
                                color: 'var(--text-secondary)'
                            }}
                            title="Paste Example"
                        >
                            <Sparkles className="w-3 h-3" />
                            <span className="hidden sm:inline">Paste Example</span>
                        </button>
                        <button 
                            onClick={() => {
                                try {
                                    const parsed = JSON.parse(inputText);
                                    setInputText(JSON.stringify(parsed, null, 2));
                                } catch {
                                    // Not valid JSON, ignore
                                }
                            }}
                            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 rounded text-xs hover:opacity-80 transition-opacity" 
                            style={{
                                background: 'var(--bg-elevated)',
                                color: 'var(--text-secondary)'
                            }}
                            title="Beautify JSON"
                        >
                            <Sparkles className="w-3 h-3" />
                            <span className="hidden sm:inline">Beautify</span>
                        </button>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(inputText);
                            }}
                            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 rounded text-xs hover:opacity-80 transition-opacity" 
                            style={{
                                background: 'var(--bg-elevated)',
                                color: 'var(--text-secondary)'
                            }}
                            title="Copy to clipboard"
                        >
                            <Copy className="w-3 h-3" />
                            <span className="hidden sm:inline">Copy</span>
                        </button>
                    </div>
                    
                    {/* Editor */}
                    <div className="flex-1 min-h-0 overflow-auto">
                        <CodeEditor
                            value={inputText}
                            onChange={setInputText}
                            placeholder="Paste your PostgreSQL EXPLAIN JSON output here..."
                            language={activeTab}
                        />
                    </div>
                    
                    {/* Bottom bar */}
                    <div className="border-t px-3 md:px-4 py-3 md:py-2 flex items-center justify-between gap-3" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
                        <div className="hidden md:flex items-center gap-2 text-xs" style={{ color: '#6b7280' }}>
                            <span style={{ opacity: 0.8 }}>Tip:</span>
                            <code className="px-1.5 py-0.5 rounded text-[11px] font-mono" style={{ 
                                background: 'var(--bg-surface)', 
                                color: 'var(--text-tertiary)',
                                border: '1px solid var(--border-subtle)'
                            }}>
                                EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
                            </code>
                            <span style={{ opacity: 0.8 }}>for best results</span>
                        </div>
                        
                        {/* Mobile: Character count */}
                        <div className="md:hidden text-xs" style={{ color: 'var(--text-muted)' }}>
                            {inputText.length} chars
                        </div>
                        
                        <button
                            onClick={() => { handleAnalyze(); setShowMobileResults(true); }}
                            disabled={!inputText.trim() || isAnalyzing}
                            className="flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base transition-all"
                            style={{
                                background: inputText.trim() ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'var(--bg-elevated)',
                                color: inputText.trim() ? 'white' : 'var(--text-muted)',
                                cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                                boxShadow: inputText.trim() ? '0 4px 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)' : 'none',
                                border: inputText.trim() ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid var(--border-default)'
                            }}
                            onMouseEnter={(e) => {
                                if (inputText.trim()) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 30px rgba(6, 182, 212, 0.6), 0 0 60px rgba(6, 182, 212, 0.3)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (inputText.trim()) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)';
                                }
                            }}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5" />
                                    Analyze Plan
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Results Overlay */}
                {showMobileResults && (
                    <div 
                        className="md:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setShowMobileResults(false)}
                    />
                )}

                {/* RIGHT PANEL - Analysis Results */}
                {hasResult && (
                    <aside className={cn(
                        "w-full md:w-[420px] lg:w-[480px] border-l flex flex-col z-50",
                        "fixed md:relative inset-x-0 bottom-0 md:inset-auto",
                        "max-h-[85vh] md:max-h-none",
                        "rounded-t-2xl md:rounded-none",
                        "transition-transform duration-300 ease-in-out",
                        showMobileResults ? "translate-y-0" : "translate-y-full md:translate-y-0"
                    )} style={{
                        borderColor: 'var(--border-default)',
                        background: 'var(--bg-surface)'
                    }}>
                        {/* Mobile drag handle */}
                        <div className="md:hidden flex justify-center py-2">
                            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-default)' }} />
                        </div>
                        
                        {/* Header with metrics */}
                        <div className="p-4 md:p-6 border-b space-y-3 md:space-y-4" style={{ borderColor: 'var(--border-default)' }}>
                            <div className="flex items-center justify-between">
                                <span className="text-lg md:text-xl font-bold" style={{ color: 'var(--accent-cyan)' }}>Analysis Results</span>
                                <button 
                                    onClick={() => setShowMobileResults(false)}
                                    className="md:hidden p-1 rounded"
                                    style={{ background: 'var(--bg-elevated)' }}
                                >
                                    <X className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                                </button>
                                <span className="hidden md:inline text-sm" style={{ color: 'var(--text-tertiary)' }}>#{result.parsedPlan?.['Node Type'] || 'Plan'}</span>
                            </div>
                            
                            {/* Metrics row - compact layout */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="px-3 py-2.5 rounded-lg text-center" style={{ 
                                    background: 'rgba(6, 182, 212, 0.1)',
                                    border: '1px solid rgba(6, 182, 212, 0.3)'
                                }}>
                                    <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Execution</div>
                                    <div className="text-lg font-bold font-mono" style={{ color: 'var(--accent-cyan)' }}>
                                        {result.executionTimeMs !== null ? `${result.executionTimeMs.toFixed(1)}ms` : '—'}
                                    </div>
                                </div>
                                <div className="px-3 py-2.5 rounded-lg text-center" style={{ 
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    border: '1px solid rgba(139, 92, 246, 0.3)'
                                }}>
                                    <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Planning</div>
                                    <div className="text-lg font-bold font-mono" style={{ color: 'var(--accent-purple)' }}>
                                        {result.planningTimeMs !== null ? `${result.planningTimeMs.toFixed(1)}ms` : '—'}
                                    </div>
                                </div>
                                <div className="px-3 py-2.5 rounded-lg text-center" style={{ 
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.3)'
                                }}>
                                    <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Rows</div>
                                    <div className="text-lg font-bold font-mono" style={{ color: 'var(--accent-orange)' }}>
                                        {(result.parsedPlan?.['Actual Rows'] || result.parsedPlan?.['Plan Rows'] || 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Tabs */}
                        <div className="border-b flex" style={{ borderColor: 'var(--border-default)' }}>
                            <button
                                onClick={() => setActiveResultTab('findings')}
                                className="flex-1 px-5 py-3 text-base font-bold transition-all"
                                style={{
                                    color: activeResultTab === 'findings' ? 'var(--accent-cyan)' : 'var(--text-tertiary)',
                                    borderBottom: activeResultTab === 'findings' ? '2px solid var(--accent-cyan)' : '2px solid transparent'
                                }}
                            >
                                Findings ({result.findings.length})
                            </button>
                            <button
                                onClick={() => setActiveResultTab('tree')}
                                className="flex-1 px-5 py-3 text-base font-bold transition-all"
                                style={{
                                    color: activeResultTab === 'tree' ? 'var(--accent-cyan)' : 'var(--text-tertiary)',
                                    borderBottom: activeResultTab === 'tree' ? '2px solid var(--accent-cyan)' : '2px solid transparent'
                                }}
                            >
                                Plan Tree
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {activeResultTab === 'findings' ? (
                                <div className="p-6 space-y-5">
                                    {/* Critical */}
                                    {groupedFindings.critical.length > 0 && (
                                        <div>
                                            <button
                                                onClick={() => setExpandedSeverity(prev => ({ ...prev, critical: !prev.critical }))}
                                                className="w-full flex items-center justify-between p-4 rounded-xl transition-all"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.08))',
                                                    border: '1px solid rgba(239, 68, 68, 0.4)',
                                                    boxShadow: '0 2px 12px rgba(239, 68, 68, 0.15)'
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                                                        background: 'var(--accent-red)',
                                                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
                                                    }}>
                                                        <AlertCircle className="w-5 h-5 text-white" />
                                                    </div>
                                                    <span className="text-lg font-bold" style={{ color: 'var(--accent-red-bright)' }}>Critical</span>
                                                    <span className="text-sm px-3 py-1.5 rounded-full font-bold" style={{
                                                        background: 'var(--accent-red)',
                                                        color: 'white',
                                                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                                                    }}>
                                                        {groupedFindings.critical.length}
                                                    </span>
                                                </div>
                                                <ChevronDown className={cn(
                                                    "w-5 h-5 transition-transform",
                                                    expandedSeverity.critical && "rotate-180"
                                                )} style={{ color: 'var(--accent-red-bright)' }} />
                                            </button>
                                            {expandedSeverity.critical && (
                                                <div className="mt-3 space-y-3">
                                                    {groupedFindings.critical.map((finding) => (
                                                        <div key={finding.id} className="p-5 rounded-xl" style={{
                                                            background: 'var(--bg-elevated)',
                                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                                                        }}>
                                                            <div className="flex items-start gap-3 mb-3">
                                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{
                                                                    background: 'var(--accent-red)',
                                                                    boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)'
                                                                }}>
                                                                    <AlertCircle className="w-5 h-5 text-white" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                                                        {finding.title}
                                                                    </div>
                                                                    <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                                                        {finding.education.behavior}
                                                                    </div>
                                                                </div>
                                                                <button className="p-2 rounded-lg hover:bg-[var(--bg-hover)]">
                                                                    <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="badge" style={{ 
                                                                    fontSize: '11px', 
                                                                    padding: '4px 10px',
                                                                    background: 'rgba(16, 185, 129, 0.15)',
                                                                    color: 'var(--accent-green)',
                                                                    border: '1px solid rgba(16, 185, 129, 0.3)'
                                                                }}>
                                                                    ✓ {finding.confidence}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* High */}
                                    {groupedFindings.high.length > 0 && (
                                        <div>
                                            <button
                                                onClick={() => setExpandedSeverity(prev => ({ ...prev, high: !prev.high }))}
                                                className="w-full flex items-center justify-between p-5 rounded-xl transition-all"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.08))',
                                                    border: '1px solid rgba(245, 158, 11, 0.4)',
                                                    boxShadow: '0 2px 12px rgba(245, 158, 11, 0.15)'
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                                                        background: 'var(--accent-orange)',
                                                        boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
                                                    }}>
                                                        <AlertTriangle className="w-5 h-5 text-white" />
                                                    </div>
                                                    <span className="text-lg font-bold" style={{ color: 'var(--accent-orange-bright)' }}>High</span>
                                                    <span className="text-sm px-3 py-1.5 rounded-full font-bold" style={{
                                                        background: 'var(--accent-orange)',
                                                        color: 'white',
                                                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                                                    }}>
                                                        {groupedFindings.high.length}
                                                    </span>
                                                </div>
                                                <ChevronDown className={cn(
                                                    "w-5 h-5 transition-transform",
                                                    expandedSeverity.high && "rotate-180"
                                                )} style={{ color: 'var(--accent-orange-bright)' }} />
                                            </button>
                                            {expandedSeverity.high && (
                                                <div className="mt-3 space-y-3">
                                                    {groupedFindings.high.map((finding) => (
                                                        <div key={finding.id} className="p-5 rounded-xl" style={{
                                                            background: 'var(--bg-elevated)',
                                                            border: '1px solid rgba(245, 158, 11, 0.3)',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                                                        }}>
                                                            <div className="flex items-start gap-3 mb-3">
                                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{
                                                                    background: 'var(--accent-orange)',
                                                                    boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)'
                                                                }}>
                                                                    <AlertTriangle className="w-5 h-5 text-white" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                                                        {finding.title}
                                                                    </div>
                                                                    <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                                                        {finding.education.behavior}
                                                                    </div>
                                                                </div>
                                                                <button className="p-2 rounded-lg hover:bg-[var(--bg-hover)]">
                                                                    <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="badge" style={{ 
                                                                    fontSize: '11px', 
                                                                    padding: '4px 10px',
                                                                    background: 'rgba(59, 130, 246, 0.15)',
                                                                    color: 'var(--accent-blue)',
                                                                    border: '1px solid rgba(59, 130, 246, 0.3)'
                                                                }}>
                                                                    {finding.confidence}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Medium */}
                                    {groupedFindings.medium.length > 0 && (
                                        <div>
                                            <button
                                                onClick={() => setExpandedSeverity(prev => ({ ...prev, medium: !prev.medium }))}
                                                className="w-full flex items-center justify-between p-5 rounded-xl transition-all"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(253, 176, 34, 0.12), rgba(253, 176, 34, 0.06))',
                                                    border: '1px solid rgba(253, 176, 34, 0.3)',
                                                    boxShadow: '0 2px 12px rgba(253, 176, 34, 0.1)'
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                                                        background: '#fdb022',
                                                        boxShadow: '0 0 20px rgba(253, 176, 34, 0.3)'
                                                    }}>
                                                        <Info className="w-5 h-5 text-white" />
                                                    </div>
                                                    <span className="text-lg font-bold" style={{ color: '#fdb022' }}>Medium</span>
                                                    <span className="text-sm px-3 py-1.5 rounded-full font-bold" style={{
                                                        background: '#fdb022',
                                                        color: 'white',
                                                        boxShadow: '0 2px 8px rgba(253, 176, 34, 0.2)'
                                                    }}>
                                                        {groupedFindings.medium.length}
                                                    </span>
                                                </div>
                                                <ChevronDown className={cn(
                                                    "w-5 h-5 transition-transform",
                                                    expandedSeverity.medium && "rotate-180"
                                                )} style={{ color: '#fdb022' }} />
                                            </button>
                                            {expandedSeverity.medium && (
                                                <div className="mt-2 space-y-2 pl-2">
                                                    {groupedFindings.medium.map((finding) => (
                                                        <div key={finding.id} className="p-3 rounded-lg" style={{
                                                            background: 'var(--bg-elevated)',
                                                            border: '1px solid var(--border-default)'
                                                        }}>
                                                            <div className="flex items-start gap-2">
                                                                <Info className="w-4 h-4 mt-0.5" style={{ color: '#fdb022' }} />
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                                                        {finding.title}
                                                                    </div>
                                                                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                                        {finding.education.behavior}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Low */}
                                    {groupedFindings.low.length > 0 && (
                                        <div>
                                            <button
                                                onClick={() => setExpandedSeverity(prev => ({ ...prev, low: !prev.low }))}
                                                className="w-full flex items-center justify-between p-3 rounded-lg transition-all"
                                                style={{
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    border: '1px solid rgba(59, 130, 246, 0.3)'
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                                                    <span className="text-sm font-semibold" style={{ color: 'var(--accent-blue)' }}>Low</span>
                                                    <span className="text-xs px-2 py-0.5 rounded" style={{
                                                        background: 'var(--accent-blue)',
                                                        color: 'white'
                                                    }}>
                                                        {groupedFindings.low.length}
                                                    </span>
                                                </div>
                                                <ChevronDown className={cn(
                                                    "w-4 h-4 transition-transform",
                                                    expandedSeverity.low && "rotate-180"
                                                )} style={{ color: 'var(--accent-blue)' }} />
                                            </button>
                                            {expandedSeverity.low && (
                                                <div className="mt-2 space-y-2 pl-2">
                                                    {groupedFindings.low.map((finding) => (
                                                        <div key={finding.id} className="p-3 rounded-lg" style={{
                                                            background: 'var(--bg-elevated)',
                                                            border: '1px solid var(--border-default)'
                                                        }}>
                                                            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                                                {finding.title}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {result.findings.length === 0 && (
                                        <div className="text-center py-12">
                                            <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--accent-green)' }} />
                                            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No Issues Found</p>
                                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Plan looks optimized</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4">
                                    <PlanTree node={result.parsedPlan} findings={result.findings} />
                                </div>
                            )}
                        </div>
                    </aside>
                )}
            </div>
            
            {/* Footer with Attribution */}
            <footer className="h-10 border-t flex items-center justify-center gap-3 md:gap-6 px-3 md:px-6 shrink-0" style={{ 
                borderColor: 'var(--border-default)',
                background: 'var(--bg-surface)'
            }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    © 2026 PlanCheck
                </span>
                <span className="hidden md:inline text-xs" style={{ color: 'var(--text-muted)' }}>•</span>
                {/* Privacy with tooltip - hidden on mobile */}
                <div className="relative group hidden md:block">
                    <button className="flex items-center gap-1 text-xs hover:underline" style={{ color: 'var(--accent-green)' }}>
                        <Shield className="w-3 h-3" />
                        Privacy
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 rounded-lg text-xs w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl" style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-secondary)'
                    }}>
                        <div className="flex items-center gap-2 mb-2 font-semibold" style={{ color: 'var(--accent-green)' }}>
                            <Shield className="w-4 h-4" />
                            Your Data Never Leaves Your Browser
                        </div>
                        <p className="leading-relaxed">
                            All analysis happens 100% client-side. Your EXPLAIN plans are processed locally — no data is sent to any server. History is stored in IndexedDB. We have zero access to your queries.
                        </p>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2" style={{ background: 'var(--bg-elevated)', borderRight: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }} />
                    </div>
                </div>
                {/* Mobile: Simple privacy indicator */}
                <div className="md:hidden flex items-center gap-1 text-xs" style={{ color: 'var(--accent-green)' }}>
                    <Shield className="w-3 h-3" />
                    <span>Private</span>
                </div>
                <span className="hidden md:inline text-xs" style={{ color: 'var(--text-muted)' }}>•</span>
                <a 
                    href="https://github.com/dalibo/pev2" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hidden md:inline text-xs hover:underline"
                    style={{ color: 'var(--accent-cyan)' }}
                >
                    Powered by PEV2
                </a>
                <span className="hidden md:inline text-xs" style={{ color: 'var(--text-muted)' }}>•</span>
                <a 
                    href="mailto:contact@plancheck.dev"
                    className="hidden md:inline text-xs hover:underline"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    contact@plancheck.dev
                </a>
            </footer>
        </div>
    );
}
