"use client";

import { cn } from "@/lib/utils";
import { TruthfulDetection } from "@/lib/types/core";
import { ChevronRight, Database, GitMerge, ArrowUpDown, Layers, Zap, AlertTriangle } from "lucide-react";
import { useState, useMemo } from "react";

interface PlanTreeProps {
    node: any;
    findings: TruthfulDetection[];
    depth?: number;
}

function formatNumber(value: any): string {
    if (value === undefined || value === null) return '—';
    if (typeof value === 'number') {
        if (isNaN(value)) return '—';
        return value.toLocaleString();
    }
    return String(value);
}

function formatTime(value: any): string {
    if (value === undefined || value === null) return '—';
    if (typeof value === 'number') {
        if (isNaN(value)) return '—';
        return `${value.toFixed(2)}ms`;
    }
    return String(value);
}

// Get node category and color
function getNodeStyle(nodeType: string) {
    const type = nodeType.toLowerCase();
    if (type.includes('scan')) {
        return {
            icon: Database,
            color: 'var(--accent-cyan)',
            bg: 'rgba(6, 182, 212, 0.1)',
            border: 'rgba(6, 182, 212, 0.3)',
            label: 'SCAN'
        };
    }
    if (type.includes('join')) {
        return {
            icon: GitMerge,
            color: 'var(--accent-orange)',
            bg: 'rgba(245, 158, 11, 0.1)',
            border: 'rgba(245, 158, 11, 0.3)',
            label: 'JOIN'
        };
    }
    if (type.includes('sort')) {
        return {
            icon: ArrowUpDown,
            color: 'var(--accent-purple)',
            bg: 'rgba(139, 92, 246, 0.1)',
            border: 'rgba(139, 92, 246, 0.3)',
            label: 'SORT'
        };
    }
    if (type.includes('aggregate') || type.includes('group')) {
        return {
            icon: Layers,
            color: 'var(--accent-green)',
            bg: 'rgba(16, 185, 129, 0.1)',
            border: 'rgba(16, 185, 129, 0.3)',
            label: 'AGG'
        };
    }
    return {
        icon: Zap,
        color: 'var(--accent-blue)',
        bg: 'rgba(59, 130, 246, 0.1)',
        border: 'rgba(59, 130, 246, 0.3)',
        label: 'OTHER'
    };
}

export function PlanTree({ node, findings, depth = 0 }: PlanTreeProps) {
    const [isExpanded, setIsExpanded] = useState(depth < 4);

    if (!node || typeof node !== 'object') return null;

    const nodeType = node["Node Type"] || "Unknown";
    const nodeStyle = getNodeStyle(nodeType);
    const NodeIcon = nodeStyle.icon;
    
    const children = Array.isArray(node.Plans) ? node.Plans : 
                     Array.isArray(node.Children) ? node.Children : 
                     Array.isArray(node.plans) ? node.plans : [];
    const hasChildren = children.length > 0;

    const nodeFindings = useMemo(() => {
        if (!Array.isArray(findings)) return [];
        return findings.filter(f => {
            if (!f?.evidence || !Array.isArray(f.evidence)) return false;
            return f.evidence.some(ev => {
                if (!ev?.location) return false;
                const location = String(ev.location);
                if (location.includes(nodeType)) return true;
                const relationName = node["Relation Name"];
                if (relationName && location.includes(String(relationName))) return true;
                return false;
            });
        });
    }, [findings, nodeType, node]);
    
    const hasFinding = nodeFindings.length > 0;
    const highSeverity = nodeFindings.some(f => f.impact === 'high');

    const actualRows = node["Actual Rows"];
    const actualTime = node["Actual Total Time"];
    const planRows = node["Plan Rows"];
    const relationName = node["Relation Name"];
    const indexName = node["Index Name"];
    const loops = node["Actual Loops"];

    return (
        <div className={cn("relative", depth > 0 && "ml-4")}>
            {/* Connector lines */}
            {depth > 0 && (
                <>
                    <div className="absolute left-[-10px] top-0 bottom-0 w-px bg-[#3f3f46]" />
                    <div className="absolute left-[-10px] top-[12px] w-[10px] h-px bg-[#3f3f46]" />
                </>
            )}

            <div
                onClick={() => hasChildren && setIsExpanded(!isExpanded)}
                className={cn(
                    "group flex items-start gap-3 py-2 px-3 -mx-3 rounded-lg transition-all",
                    hasChildren && "cursor-pointer",
                    hasFinding && "ring-2",
                    highSeverity && "ring-red-500/30",
                    hasFinding && !highSeverity && "ring-amber-500/30"
                )}
                style={{
                    background: hasFinding ? (highSeverity ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)') : 'transparent'
                }}
                onMouseEnter={(e) => {
                    if (hasChildren) {
                        e.currentTarget.style.background = hasFinding ? 
                            (highSeverity ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)') : 
                            'var(--bg-hover)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (hasChildren) {
                        e.currentTarget.style.background = hasFinding ? 
                            (highSeverity ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)') : 
                            'transparent';
                    }
                }}
            >
                {/* Expand/collapse indicator */}
                <div className={cn(
                    "w-5 h-5 flex items-center justify-center shrink-0 mt-1 rounded transition-all",
                    hasChildren && "hover:bg-[var(--bg-hover)]"
                )}>
                    {hasChildren ? (
                        <ChevronRight
                            className={cn(
                                "w-4 h-4 transition-transform duration-200",
                                isExpanded && "rotate-90"
                            )}
                            style={{ color: isExpanded ? 'var(--accent-cyan)' : 'var(--text-tertiary)' }}
                        />
                    ) : (
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--border-default)' }} />
                    )}
                </div>
                
                {/* Node Icon */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{
                    background: nodeStyle.bg,
                    border: `1px solid ${nodeStyle.border}`
                }}>
                    <NodeIcon className="w-4 h-4" style={{ color: nodeStyle.color }} />
                </div>

                {/* Node content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        {/* Severity dot */}
                        {hasFinding && (
                            <span className={cn(
                                "w-2 h-2 rounded-full shrink-0",
                                highSeverity ? "bg-red-500" : "bg-amber-500"
                            )} />
                        )}
                        
                        {/* Node type */}
                        <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {nodeType}
                        </span>

                        {/* Finding indicator badge */}
                        {hasFinding && (
                            <span className="badge badge-warning flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {nodeFindings.length} {nodeFindings.length === 1 ? 'issue' : 'issues'}
                            </span>
                        )}

                        {/* Relation name */}
                        {relationName && (
                            <span className="text-sm font-mono px-2 py-0.5 rounded" style={{ 
                                color: nodeStyle.color,
                                background: nodeStyle.bg,
                                border: `1px solid ${nodeStyle.border}`
                            }}>
                                {relationName}
                            </span>
                        )}
                        {indexName && !relationName && (
                            <span className="text-sm text-[#888] font-mono">
                                {indexName}
                            </span>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-sm mt-1.5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>ROWS</span>
                            <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {formatNumber(actualRows)}
                            </span>
                        </div>
                        <div className="w-px h-3" style={{ background: 'var(--border-default)' }} />
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>TIME</span>
                            <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {formatTime(actualTime)}
                            </span>
                        </div>
                        {loops && loops > 1 && (
                            <>
                                <div className="w-px h-3" style={{ background: 'var(--border-default)' }} />
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>LOOPS</span>
                                    <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {formatNumber(loops)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Children */}
            {isExpanded && hasChildren && (
                <div className="mt-0.5">
                    {children.map((child: any, idx: number) => (
                        <PlanTree key={idx} node={child} findings={findings} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
