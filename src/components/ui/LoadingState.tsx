"use client";

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = "Analyzing query plan..." }: LoadingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="relative">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{
                    background: 'var(--bg-elevated)',
                    border: '2px solid var(--accent-cyan)',
                    boxShadow: 'var(--glow-cyan)'
                }}>
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
                </div>
            </div>
            <p className="mt-6 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {message}
            </p>
            <div className="mt-4 flex gap-2">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{
                            background: 'var(--accent-cyan)',
                            animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="rounded-xl overflow-hidden" style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            padding: '20px'
        }}>
            <div className="flex items-start gap-4 mb-4">
                <div className="skeleton w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-3/4 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-2/3 rounded" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-5/6 rounded" />
            </div>
        </div>
    );
}
