"use client";

import { cn } from "@/lib/utils";
import { TruthfulDetection } from "@/lib/types/core";
import { ChevronRight, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";

interface PlanTreeProps {
    node: any;
    findings: TruthfulDetection[];
    depth?: number;
}

/**
 * Safe number formatter - handles undefined/null/NaN
 */
function formatNumber(value: any): string {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number') {
        if (isNaN(value)) return 'N/A';
        return value.toLocaleString();
    }
    return String(value);
}

/**
 * Safe time formatter - handles undefined/null/NaN
 */
function formatTime(value: any): string {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number') {
        if (isNaN(value)) return 'N/A';
        return `${value.toFixed(2)}ms`;
    }
    return String(value);
}

export function PlanTree({ node, findings, depth = 0 }: PlanTreeProps) {
    const [isExpanded, setIsExpanded] = useState(depth < 3); // Auto-collapse deep nodes

    // Guard against invalid node
    if (!node || typeof node !== 'object') return null;

    const nodeType = node["Node Type"] || "Unknown Node";
    const children = Array.isArray(node.Plans) ? node.Plans : 
                     Array.isArray(node.Children) ? node.Children : 
                     Array.isArray(node.plans) ? node.plans : [];
    const hasChildren = children.length > 0;

    // Safely find related findings
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

    // Compute node stats safely
    const actualRows = node["Actual Rows"];
    const actualTime = node["Actual Total Time"];
    const planRows = node["Plan Rows"];
    const totalCost = node["Total Cost"];
    const sortMethod = node["Sort Method"];
    const relationName = node["Relation Name"];
    const indexName = node["Index Name"];
    const loops = node["Actual Loops"];

    return (
        <div className={cn("relative", depth > 0 && "ml-6 pl-4")}>
            {depth > 0 && (
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-gray-300/80 via-gray-200/60 to-transparent" />
            )}

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "w-full text-left p-4 rounded-xl transition-all",
                    "hover:bg-white/60 hover:shadow-sm",
                    hasFinding && "bg-gradient-to-r from-red-50/80 to-red-100/40 border border-red-200/60 shadow-sm hover:shadow-md"
                )}
            >
                <div className="flex items-start gap-3">
                    {hasChildren ? (
                        <div className="mt-0.5 shrink-0">
                            <ChevronRight
                                className={cn(
                                    "w-4 h-4 text-gray-400 transition-transform",
                                    isExpanded && "rotate-90"
                                )}
                            />
                        </div>
                    ) : (
                        <div className="w-4 shrink-0" />
                    )}

                    <div className="flex-1 min-w-0 space-y-2">
                        {/* Node Header */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-gray-900">
                                {nodeType}
                            </span>

                            {relationName && (
                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md border border-blue-200 font-medium">
                                    {relationName}
                                </span>
                            )}

                            {indexName && (
                                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md border border-purple-200 font-medium">
                                    {indexName}
                                </span>
                            )}

                            {hasFinding && (
                                <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-md font-semibold shadow-sm flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {nodeFindings.length} issue{nodeFindings.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {/* Node Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                            {actualRows !== undefined && (
                                <span className="font-medium">
                                    <span className="text-gray-400 font-normal">Rows:</span> {formatNumber(actualRows)}
                                </span>
                            )}
                            {actualRows === undefined && planRows !== undefined && (
                                <span className="font-medium text-gray-500 italic">
                                    <span className="text-gray-400 font-normal">Est:</span> {formatNumber(planRows)}
                                </span>
                            )}
                            {actualTime !== undefined && (
                                <span className="font-medium">
                                    <span className="text-gray-400 font-normal">Time:</span> {formatTime(actualTime)}
                                </span>
                            )}
                            {totalCost !== undefined && actualTime === undefined && (
                                <span className="font-medium text-gray-500 italic">
                                    <span className="text-gray-400 font-normal">Cost:</span> {formatNumber(totalCost)}
                                </span>
                            )}
                            {loops !== undefined && loops > 1 && (
                                <span className="font-medium text-orange-600">
                                    <span className="text-gray-400 font-normal">Loops:</span> {formatNumber(loops)}
                                </span>
                            )}
                            {sortMethod && (
                                <span className={cn(
                                    "font-medium",
                                    sortMethod.toLowerCase().includes('external') ? "text-red-600" : "text-amber-600"
                                )}>
                                    <span className="text-gray-400 font-normal">Sort:</span> {sortMethod}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </button>

            {isExpanded && hasChildren && (
                <div className="mt-1 space-y-1">
                    {children.map((child: any, idx: number) => (
                        <PlanTree key={idx} node={child} findings={findings} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
