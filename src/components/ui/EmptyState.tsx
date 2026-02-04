"use client";

import { Clock, CheckCircle2, FileJson, Sparkles } from 'lucide-react';

interface EmptyStateProps {
    type: 'history' | 'findings' | 'input';
    onAction?: () => void;
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
    const configs = {
        history: {
            icon: Clock,
            title: 'No Analysis History',
            description: 'Run your first query plan analysis to see it appear here',
            actionLabel: null
        },
        findings: {
            icon: CheckCircle2,
            title: 'No Issues Detected',
            description: 'Your query plan looks optimal. No performance concerns found.',
            actionLabel: null
        },
        input: {
            icon: FileJson,
            title: 'Ready to Analyze',
            description: 'Paste your PostgreSQL EXPLAIN output to get started',
            actionLabel: 'Paste Example'
        }
    };

    const config = configs[type];
    const Icon = config.icon;

    return (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{
                background: type === 'findings' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-surface)',
                border: `1px solid ${type === 'findings' ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`
            }}>
                <Icon 
                    className="w-6 h-6" 
                    style={{ 
                        color: type === 'findings' ? 'var(--accent-green)' : 'var(--text-muted)' 
                    }} 
                />
            </div>
            <h3 className="text-base font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {config.title}
            </h3>
            <p className="text-sm max-w-[200px]" style={{ color: 'var(--text-muted)' }}>
                {config.description}
            </p>
            {config.actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--accent-cyan)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                        e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-default)';
                        e.currentTarget.style.background = 'var(--bg-elevated)';
                    }}
                >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    {config.actionLabel}
                </button>
            )}
        </div>
    );
}
