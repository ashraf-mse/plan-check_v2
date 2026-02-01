"use client";

import * as React from "react";

interface SplitPaneProps {
    left: React.ReactNode;
    right: React.ReactNode;
}

export function SplitPane({ left, right }: SplitPaneProps) {
    return (
        <div className="h-screen w-screen flex overflow-hidden">
            {/* Left Panel - Always visible, 40% width */}
            <div className="w-2/5 h-full border-r-2 border-gray-300 bg-white flex-shrink-0 overflow-hidden">
                {left}
            </div>

            {/* Right Panel - Takes remaining 60% */}
            <div className="w-3/5 h-full bg-gray-50 flex-shrink-0 overflow-hidden">
                {right}
            </div>
        </div>
    );
}
