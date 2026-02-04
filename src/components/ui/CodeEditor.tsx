"use client";

import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    language?: 'json' | 'text' | 'yaml';
}

export function CodeEditor({ value, onChange, placeholder, language = 'json' }: CodeEditorProps) {
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (language === 'json' && value.trim()) {
            try {
                JSON.parse(value);
                setIsValid(true);
            } catch {
                setIsValid(false);
            }
        } else {
            setIsValid(null);
        }
    }, [value, language]);

    useEffect(() => {
        if (textareaRef.current && lineNumbersRef.current) {
            const lineCount = value.split('\n').length;
            const lineNumbers = Array.from({ length: Math.max(lineCount, 20) }, (_, i) => i + 1);
            lineNumbersRef.current.innerHTML = lineNumbers.map(n => `<div>${n}</div>`).join('');
        }
    }, [value]);

    const handleScroll = () => {
        if (textareaRef.current && lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    const charCount = value.length;

    return (
        <div className="relative h-full flex" style={{ background: 'var(--bg-input)' }}>
            {/* Line Numbers */}
            <div 
                ref={lineNumbersRef}
                className="w-12 py-4 pr-3 text-right overflow-hidden select-none shrink-0"
                style={{ 
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    fontFamily: 'JetBrains Mono, monospace',
                    background: 'var(--bg-surface)',
                    borderRight: '1px solid var(--border-default)'
                }}
            >
                {Array.from({ length: 20 }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                ))}
            </div>

            {/* Editor */}
            <div className="flex-1 relative">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onScroll={handleScroll}
                    placeholder={placeholder}
                    className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none code-scroll"
                    style={{
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        lineHeight: '1.6',
                        tabSize: 2
                    }}
                    spellCheck={false}
                />

                {/* Validation Indicator */}
                {isValid !== null && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{
                        background: isValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${isValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                    }}>
                        {isValid ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                                <span className="text-xs font-medium" style={{ color: 'var(--accent-green)' }}>Valid JSON</span>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-4 h-4" style={{ color: 'var(--accent-red)' }} />
                                <span className="text-xs font-medium" style={{ color: 'var(--accent-red)' }}>Invalid JSON</span>
                            </>
                        )}
                    </div>
                )}

                {/* Character Count */}
                <div className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-mono" style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-tertiary)',
                    border: '1px solid var(--border-default)'
                }}>
                    {charCount.toLocaleString()} chars
                </div>
            </div>
        </div>
    );
}
