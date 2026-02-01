"use client";

import { TruthfulDetection } from '@/lib/types/core';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FindingCardProps {
    finding: TruthfulDetection;
}

export function FindingCard({ finding }: FindingCardProps) {
    const impactConfig = {
        low: {
            bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
            border: 'border-blue-200/60',
            badge: 'bg-blue-100 text-blue-700 border-blue-200',
            dot: 'bg-blue-500'
        },
        medium: {
            bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
            border: 'border-amber-200/60',
            badge: 'bg-amber-100 text-amber-700 border-amber-200',
            dot: 'bg-amber-500'
        },
        high: {
            bg: 'bg-gradient-to-br from-red-50 to-red-100/50',
            border: 'border-red-200/60',
            badge: 'bg-red-100 text-red-700 border-red-200',
            dot: 'bg-red-500'
        }
    };

    const confidenceBadge = {
        verified: { label: 'Verified', className: 'bg-green-100 text-green-700 border-green-200' },
        inferred: { label: 'Inferred', className: 'bg-purple-100 text-purple-700 border-purple-200' },
        educational: { label: 'Educational', className: 'bg-gray-100 text-gray-700 border-gray-200' }
    };

    const config = impactConfig[finding.impact];

    return (
        <div className={cn(
            "border rounded-2xl p-7 space-y-6 transition-all hover:shadow-lg card-glow",
            config.bg,
            config.border
        )}>
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                        <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", config.dot)}></div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{finding.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className={cn(
                            "text-xs font-semibold px-3 py-1.5 rounded-lg border",
                            confidenceBadge[finding.confidence].className
                        )}>
                            {confidenceBadge[finding.confidence].label}
                        </span>
                        <span className={cn(
                            "text-xs font-semibold px-3 py-1.5 rounded-lg border",
                            config.badge
                        )}>
                            {finding.impact.charAt(0).toUpperCase() + finding.impact.slice(1)} Impact
                        </span>
                    </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 font-medium pl-5">
                    {finding.education.behavior}
                </p>
            </div>

            {/* Evidence */}
            <div className="space-y-3 pl-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">Evidence</h4>
                <div className="space-y-2">
                    {finding.evidence.map((ev, i) => (
                        <div key={i} className="bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl p-4 space-y-2 shadow-sm">
                            <code className="text-xs font-mono block text-gray-900 font-semibold">
                                {ev.rawText}
                            </code>
                            <p className="text-xs text-gray-600">
                                {ev.location}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Analysis */}
            <div className="space-y-3 pl-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">Analysis</h4>
                <ul className="space-y-2.5 text-sm">
                    {finding.education.explanation.map((item, i) => (
                        <li key={i} className="flex gap-3">
                            <span className="text-gray-400 mt-1.5 font-bold">·</span>
                            <span className="flex-1 leading-relaxed text-gray-700">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Limitations */}
            <div className="space-y-3 pt-4 border-t border-gray-200/60 pl-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">Limitations</h4>
                <ul className="space-y-2 text-xs text-gray-600">
                    {finding.education.limitations.map((lim, i) => (
                        <li key={i} className="flex gap-2">
                            <span className="text-gray-400">·</span>
                            <span>{lim}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Learn More */}
            <div className="pt-2 pl-5">
                <a
                    href={finding.education.docsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                    Read Documentation
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
}
