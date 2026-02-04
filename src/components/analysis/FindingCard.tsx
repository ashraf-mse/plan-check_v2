"use client";

import { TruthfulDetection } from '@/lib/types/core';
import { ExternalLink, AlertTriangle, ChevronDown, Copy, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface FindingCardProps {
    finding: TruthfulDetection;
    onNodeHighlight?: (nodeId: string) => void;
}

export function FindingCard({ finding, onNodeHighlight }: FindingCardProps) {
    const [expandedSections, setExpandedSections] = useState({
        evidence: true,
        explanation: true,
        limitations: false
    });
    const [copied, setCopied] = useState(false);

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const severityConfig = {
        low: { 
            color: 'var(--accent-blue)', 
            bg: 'rgba(59, 130, 246, 0.1)', 
            border: 'rgba(59, 130, 246, 0.3)',
            glow: 'var(--glow-blue)',
            label: 'Low' 
        },
        medium: { 
            color: 'var(--accent-orange)', 
            bg: 'rgba(245, 158, 11, 0.1)', 
            border: 'rgba(245, 158, 11, 0.3)',
            glow: 'var(--glow-orange)',
            label: 'Medium' 
        },
        high: { 
            color: 'var(--accent-red)', 
            bg: 'rgba(239, 68, 68, 0.1)', 
            border: 'rgba(239, 68, 68, 0.3)',
            glow: 'var(--glow-red)',
            label: 'High' 
        }
    };

    const config = severityConfig[finding.impact];

    return (
        <div className="rounded-xl overflow-hidden transition-all" style={{
            background: 'var(--bg-elevated)',
            border: `1px solid var(--border-default)`,
            borderLeft: `4px solid ${config.color}`,
            boxShadow: 'var(--shadow-md)'
        }}>
            {/* Header with severity indicator */}
            <div className="border-b px-5 py-4 flex items-start justify-between gap-4" style={{
                borderColor: 'var(--border-default)',
                background: 'var(--bg-surface)'
            }}>
                <div className="flex items-start gap-4 flex-1">
                    <div 
                        className="w-1.5 h-full min-h-[56px] rounded-full shrink-0" 
                        style={{ 
                            backgroundColor: config.color,
                            boxShadow: `0 0 10px ${config.color}`
                        }}
                    />
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            {finding.title}
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {finding.education.behavior}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="badge" style={{
                        background: config.bg,
                        color: config.color,
                        border: `1px solid ${config.border}`,
                        fontSize: '11px',
                        padding: '4px 10px'
                    }}>
                        {config.label.toUpperCase()}
                    </span>
                    <span className={cn(
                        "text-xs px-2 py-1 rounded-md font-medium",
                        finding.confidence === 'verified' && "bg-emerald-500/10 text-emerald-400",
                        finding.confidence === 'inferred' && "text-blue-400",
                        finding.confidence === 'educational' && "text-gray-400"
                    )}>
                        {finding.confidence}
                    </span>
                </div>
            </div>
            
            <div className="p-5 space-y-4">
                {/* Evidence Section */}
                <div className="space-y-2">
                    <button
                        onClick={() => toggleSection('evidence')}
                        className="w-full flex items-center justify-between text-left group"
                    >
                        <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Evidence</h4>
                        <ChevronDown 
                            className={cn(
                                "w-4 h-4 transition-transform",
                                expandedSections.evidence && "rotate-180"
                            )} 
                            style={{ color: 'var(--text-tertiary)' }} 
                        />
                    </button>
                    {expandedSections.evidence && (
                        <div className="space-y-2 animate-fadeIn">
                        {finding.evidence.slice(0, 3).map((ev, i) => (
                            <div 
                                key={i} 
                                className="rounded-lg px-4 py-3 border"
                                style={{
                                    background: 'var(--bg-input)',
                                    borderColor: 'var(--border-default)'
                                }}
                            >
                                <code className="text-sm font-mono block" style={{ color: 'var(--text-primary)' }}>
                                    {ev.rawText}
                                </code>
                                <span className="text-xs mt-2 block" style={{ color: 'var(--text-muted)' }}>
                                    {ev.location}
                                </span>
                            </div>
                        ))}
                            {finding.evidence.length > 3 && (
                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                    +{finding.evidence.length - 3} additional occurrences
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Explanation Section */}
                <div className="space-y-2">
                    <button
                        onClick={() => toggleSection('explanation')}
                        className="w-full flex items-center justify-between text-left group"
                    >
                        <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Why This Matters</h4>
                        <ChevronDown 
                            className={cn(
                                "w-4 h-4 transition-transform",
                                expandedSections.explanation && "rotate-180"
                            )} 
                            style={{ color: 'var(--text-tertiary)' }} 
                        />
                    </button>
                    {expandedSections.explanation && (
                        <ul className="space-y-2 animate-fadeIn">
                            {finding.education.explanation.map((item, i) => (
                                <li key={i} className="text-sm leading-relaxed pl-5 relative" style={{ color: 'var(--text-secondary)' }}>
                                    <span className="absolute left-0 top-[0.5em] w-2 h-2 rounded-full" style={{ background: config.color }} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* What We Cannot Determine - EMPHASIZED */}
                <div className="space-y-2">
                    <button
                        onClick={() => toggleSection('limitations')}
                        className="w-full flex items-center justify-between text-left group"
                    >
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" style={{ color: 'var(--accent-orange)' }} />
                            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-orange)' }}>What We Cannot Determine</h4>
                        </div>
                        <ChevronDown 
                            className={cn(
                                "w-4 h-4 transition-transform",
                                expandedSections.limitations && "rotate-180"
                            )} 
                            style={{ color: 'var(--text-tertiary)' }} 
                        />
                    </button>
                    {expandedSections.limitations && (
                        <div className="rounded-xl p-4 space-y-2 animate-fadeIn" style={{
                            background: 'rgba(245, 158, 11, 0.05)',
                            border: '1px solid rgba(245, 158, 11, 0.2)'
                        }}>
                            <ul className="space-y-1.5">
                                {finding.education.limitations.map((lim, i) => (
                                    <li key={i} className="text-sm pl-5 relative leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        <span className="absolute left-0" style={{ color: 'var(--text-muted)' }}>—</span>
                                        {lim}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t flex items-center gap-2 flex-wrap" style={{ borderColor: 'var(--border-default)' }}>
                    <button
                        onClick={() => handleCopy(finding.evidence[0]?.rawText || '')}
                        className="btn-secondary"
                    >
                        {copied ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                Copy Evidence
                            </>
                        )}
                    </button>
                    <a
                        href={finding.education.docsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View Docs
                    </a>
                </div>
            </div>
        </div>
    );
}
