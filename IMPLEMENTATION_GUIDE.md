# PlanCheck v2 - Implementation Guide
## Technical Implementation Details & Component Library

---

## TECHNOLOGY STACK

### Core Framework
```json
{
  "framework": "Next.js 14+ (App Router)",
  "language": "TypeScript 5.0+",
  "styling": "Tailwind CSS 3.4+ with CSS Variables",
  "state": "Zustand 4.0+",
  "visualization": "React Flow 11+ (Plan Tree)",
  "code-editor": "Monaco Editor (VS Code engine)",
  "icons": "Lucide React",
  "animations": "Framer Motion 10+"
}
```

### Dependencies
```bash
npm install react-flow-renderer @monaco-editor/react framer-motion lucide-react zustand
npm install -D tailwindcss postcss autoprefixer @types/node
```

---

## CSS VARIABLES IMPLEMENTATION

### globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Primary Colors */
    --color-primary: 14 165 233;
    --color-primary-hover: 2 132 199;
    --color-primary-light: 56 189 248;
    
    /* Backgrounds */
    --bg-app: 10 14 20;
    --bg-surface: 15 20 25;
    --bg-elevated: 21 27 35;
    --bg-overlay: 26 33 41;
    --bg-hover: 31 39 48;
    --bg-input: 13 17 23;
    
    /* Text */
    --text-primary: 230 237 243;
    --text-secondary: 139 148 158;
    --text-tertiary: 110 118 129;
    --text-muted: 72 79 88;
    
    /* Semantic */
    --color-critical: 248 81 73;
    --color-high: 251 133 0;
    --color-medium: 253 176 34;
    --color-low: 110 118 129;
    --color-success: 63 185 80;
    --color-warning: 210 153 34;
    --color-info: 88 166 255;
    
    /* Borders */
    --border-default: 48 54 61;
    --border-muted: 33 38 45;
    --border-strong: 72 79 88;
    
    /* Shadows */
    --shadow-sm: 0 2px 4px rgb(0 0 0 / 0.3);
    --shadow-md: 0 4px 8px rgb(0 0 0 / 0.4);
    --shadow-lg: 0 8px 16px rgb(0 0 0 / 0.5);
    --shadow-xl: 0 12px 24px rgb(0 0 0 / 0.6);
  }
}

@layer utilities {
  .glass {
    background: rgba(21, 27, 35, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(139, 148, 158, 0.1);
  }
  
  .text-balance {
    text-wrap: balance;
  }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgb(var(--bg-surface));
}

::-webkit-scrollbar-thumb {
  background: rgb(var(--border-default));
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgb(var(--border-strong));
}
```

### tailwind.config.js
```javascript
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
        'primary-light': 'rgb(var(--color-primary-light) / <alpha-value>)',
        
        bg: {
          app: 'rgb(var(--bg-app) / <alpha-value>)',
          surface: 'rgb(var(--bg-surface) / <alpha-value>)',
          elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
          overlay: 'rgb(var(--bg-overlay) / <alpha-value>)',
          hover: 'rgb(var(--bg-hover) / <alpha-value>)',
          input: 'rgb(var(--bg-input) / <alpha-value>)',
        },
        
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--text-tertiary) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
        },
        
        severity: {
          critical: 'rgb(var(--color-critical) / <alpha-value>)',
          high: 'rgb(var(--color-high) / <alpha-value>)',
          medium: 'rgb(var(--color-medium) / <alpha-value>)',
          low: 'rgb(var(--color-low) / <alpha-value>)',
        },
        
        status: {
          success: 'rgb(var(--color-success) / <alpha-value>)',
          warning: 'rgb(var(--color-warning) / <alpha-value>)',
          info: 'rgb(var(--color-info) / <alpha-value>)',
        },
        
        border: {
          DEFAULT: 'rgb(var(--border-default) / <alpha-value>)',
          muted: 'rgb(var(--border-muted) / <alpha-value>)',
          strong: 'rgb(var(--border-strong) / <alpha-value>)',
        },
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'glow-primary': '0 0 20px rgba(14, 165, 233, 0.15)',
        'glow-critical': '0 0 20px rgba(248, 81, 73, 0.3)',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
```

---

## COMPONENT ARCHITECTURE

### Main Layout Component
```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'PlanCheck v2 - PostgreSQL EXPLAIN Analyzer',
  description: 'Truth-first PostgreSQL execution plan analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-bg-app text-text-primary">
        {children}
      </body>
    </html>
  )
}
```

### Three-Panel Layout
```typescript
// src/components/layout/ThreePanelLayout.tsx
'use client'

import { useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { HistoryPanel } from './HistoryPanel'
import { CommandCenter } from './CommandCenter'
import { AnalysisPanel } from './AnalysisPanel'
import { Header } from './Header'

export function ThreePanelLayout() {
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false)
  
  return (
    <div className="h-screen flex flex-col bg-bg-app">
      <Header />
      
      <PanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - History */}
        <Panel
          defaultSize={20}
          minSize={isHistoryCollapsed ? 5 : 18}
          maxSize={30}
          collapsible
          onCollapse={() => setIsHistoryCollapsed(true)}
          onExpand={() => setIsHistoryCollapsed(false)}
        >
          <HistoryPanel isCollapsed={isHistoryCollapsed} />
        </Panel>
        
        <PanelResizeHandle className="w-px bg-border hover:bg-border-strong transition-colors" />
        
        {/* Center Panel - Command Center */}
        <Panel defaultSize={50} minSize={35}>
          <CommandCenter />
        </Panel>
        
        <PanelResizeHandle className="w-px bg-border hover:bg-border-strong transition-colors" />
        
        {/* Right Panel - Analysis */}
        <Panel defaultSize={30} minSize={25} maxSize={40}>
          <AnalysisPanel />
        </Panel>
      </PanelGroup>
    </div>
  )
}
```

### Monaco Editor Integration
```typescript
// src/components/editor/CodeEditor.tsx
'use client'

import { useRef, useEffect } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: 'json' | 'text' | 'yaml'
  readOnly?: boolean
}

export function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  
  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current = editor
    
    // Define custom theme
    monaco.editor.defineTheme('plancheck-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'FF7B72' },
        { token: 'string', foreground: 'A5D6FF' },
        { token: 'number', foreground: '79C0FF' },
        { token: 'comment', foreground: '8B949E', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#0D1117',
        'editor.foreground': '#E6EDF3',
        'editor.lineHighlightBackground': '#151B23',
        'editorLineNumber.foreground': '#484F58',
        'editorLineNumber.activeForeground': '#8B949E',
        'editor.selectionBackground': '#1F6FEB40',
        'editor.inactiveSelectionBackground': '#1F6FEB20',
      },
    })
    
    monaco.editor.setTheme('plancheck-dark')
  }
  
  function handleEditorChange(value: string | undefined) {
    onChange(value || '')
  }
  
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        formatOnPaste: true,
        formatOnType: true,
        bracketPairColorization: { enabled: true },
        padding: { top: 16, bottom: 16 },
      }}
    />
  )
}
```

### React Flow Plan Tree
```typescript
// src/components/visualization/PlanTreeVisualization.tsx
'use client'

import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { PlanNode } from './PlanNode'

const nodeTypes = {
  planNode: PlanNode,
}

interface PlanTreeVisualizationProps {
  planData: any
  findings: any[]
  onNodeClick?: (nodeId: string) => void
}

export function PlanTreeVisualization({ 
  planData, 
  findings,
  onNodeClick 
}: PlanTreeVisualizationProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => 
    convertPlanToFlow(planData, findings), 
    [planData, findings]
  )
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    onNodeClick?.(node.id)
  }, [onNodeClick])
  
  return (
    <div className="w-full h-full bg-bg-app">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Strict}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background color="rgb(var(--border-muted))" gap={16} />
        <Controls className="bg-bg-elevated border border-border rounded-lg" />
        <MiniMap 
          className="bg-bg-elevated border border-border rounded-lg"
          nodeColor={(node) => {
            if (node.data.hasFinding) return 'rgb(var(--color-high))'
            return 'rgb(var(--color-primary))'
          }}
        />
      </ReactFlow>
    </div>
  )
}

function convertPlanToFlow(planData: any, findings: any[]) {
  const nodes: Node[] = []
  const edges: Edge[] = []
  let nodeId = 0
  
  function traverse(node: any, parentId: string | null, depth: number, xOffset: number) {
    const currentId = `node-${nodeId++}`
    const hasFinding = findings.some(f => 
      f.evidence.some((e: any) => e.location.includes(node['Node Type']))
    )
    
    nodes.push({
      id: currentId,
      type: 'planNode',
      position: { x: xOffset, y: depth * 150 },
      data: {
        nodeType: node['Node Type'],
        relationName: node['Relation Name'],
        actualRows: node['Actual Rows'],
        planRows: node['Plan Rows'],
        actualTime: node['Actual Total Time'],
        hasFinding,
        category: categorizeNode(node['Node Type']),
      },
    })
    
    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${currentId}`,
        source: parentId,
        target: currentId,
        type: 'smoothstep',
        style: { 
          stroke: hasFinding ? 'rgb(var(--color-high))' : 'rgb(var(--border-default))',
          strokeWidth: 2,
        },
      })
    }
    
    const children = node.Plans || node.Children || []
    const childSpacing = 300
    let childOffset = xOffset - (children.length - 1) * childSpacing / 2
    
    children.forEach((child: any) => {
      traverse(child, currentId, depth + 1, childOffset)
      childOffset += childSpacing
    })
  }
  
  traverse(planData, null, 0, 0)
  return { nodes, edges }
}

function categorizeNode(nodeType: string): string {
  if (nodeType.includes('Scan')) return 'scan'
  if (nodeType.includes('Join')) return 'join'
  if (nodeType.includes('Sort')) return 'sort'
  if (nodeType.includes('Aggregate')) return 'aggregate'
  return 'other'
}
```

### Custom Plan Node
```typescript
// src/components/visualization/PlanNode.tsx
import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { Database, GitMerge, ArrowUpDown, Layers, AlertTriangle } from 'lucide-react'

const nodeIcons = {
  scan: Database,
  join: GitMerge,
  sort: ArrowUpDown,
  aggregate: Layers,
  other: Database,
}

const nodeColors = {
  scan: '#58A6FF',
  join: '#FFA657',
  sort: '#A371F7',
  aggregate: '#3FB950',
  other: '#8B949E',
}

export const PlanNode = memo(({ data }: { data: any }) => {
  const Icon = nodeIcons[data.category as keyof typeof nodeIcons]
  const color = nodeColors[data.category as keyof typeof nodeColors]
  
  return (
    <div 
      className={`
        min-w-[200px] bg-bg-elevated border-2 rounded-lg p-3 
        transition-all duration-200 hover:scale-105
        ${data.hasFinding 
          ? 'border-severity-high bg-severity-high/5' 
          : 'border-border hover:border-primary'
        }
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div 
        className="flex items-center gap-2 pb-2 mb-3 border-b border-border-muted"
        style={{ borderLeftColor: color, borderLeftWidth: 4, paddingLeft: 8 }}
      >
        <Icon className="w-4 h-4 text-text-secondary" />
        <span className="text-sm font-semibold text-text-primary">
          {data.nodeType}
        </span>
      </div>
      
      {data.relationName && (
        <div className="text-xs font-mono text-primary mb-3">
          {data.relationName}
        </div>
      )}
      
      <div className="flex gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-text-muted uppercase">Rows</span>
          <span className="text-sm font-mono font-semibold text-text-primary">
            {data.actualRows?.toLocaleString() || data.planRows?.toLocaleString() || '—'}
          </span>
        </div>
        
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-text-muted uppercase">Time</span>
          <span className="text-sm font-mono font-semibold text-text-primary">
            {data.actualTime ? `${data.actualTime.toFixed(2)}ms` : '—'}
          </span>
        </div>
      </div>
      
      {data.hasFinding && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-severity-high border-2 border-bg-surface rounded-full flex items-center justify-center">
          <AlertTriangle className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
})

PlanNode.displayName = 'PlanNode'
```

---

## STATE MANAGEMENT

### Zustand Store
```typescript
// src/store/useAnalysisStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AnalysisState {
  // Input
  inputText: string
  selectedFormat: 'json' | 'text' | 'yaml'
  
  // Analysis
  status: 'idle' | 'parsing' | 'analyzing' | 'complete' | 'error'
  result: AnalysisResult | null
  error: string | null
  
  // History
  history: HistoryItem[]
  
  // UI State
  selectedNodeId: string | null
  highlightedFindingId: string | null
  activeTab: 'findings' | 'tree' | 'raw'
  
  // Actions
  setInputText: (text: string) => void
  setSelectedFormat: (format: 'json' | 'text' | 'yaml') => void
  analyze: (input: string) => Promise<void>
  clear: () => void
  selectNode: (nodeId: string | null) => void
  highlightFinding: (findingId: string | null) => void
  setActiveTab: (tab: 'findings' | 'tree' | 'raw') => void
  addToHistory: (item: HistoryItem) => void
  deleteFromHistory: (id: string) => void
  loadFromHistory: (id: string) => void
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      inputText: '',
      selectedFormat: 'json',
      status: 'idle',
      result: null,
      error: null,
      history: [],
      selectedNodeId: null,
      highlightedFindingId: null,
      activeTab: 'findings',
      
      setInputText: (text) => set({ inputText: text }),
      
      setSelectedFormat: (format) => set({ selectedFormat: format }),
      
      analyze: async (input) => {
        set({ status: 'parsing', error: null })
        
        try {
          // Parse the plan
          const parsedPlan = await parsePlan(input)
          
          set({ status: 'analyzing' })
          
          // Run analysis
          const result = await analyzePlan(parsedPlan)
          
          set({ 
            status: 'complete', 
            result,
          })
          
          // Add to history
          get().addToHistory({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            result,
            rawInput: input,
          })
        } catch (error) {
          set({ 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Analysis failed',
          })
        }
      },
      
      clear: () => set({ 
        inputText: '', 
        result: null, 
        error: null, 
        status: 'idle',
        selectedNodeId: null,
        highlightedFindingId: null,
      }),
      
      selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
      
      highlightFinding: (findingId) => set({ highlightedFindingId: findingId }),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      addToHistory: (item) => set((state) => ({ 
        history: [item, ...state.history].slice(0, 50) // Keep last 50
      })),
      
      deleteFromHistory: (id) => set((state) => ({
        history: state.history.filter(item => item.id !== id)
      })),
      
      loadFromHistory: (id) => {
        const item = get().history.find(h => h.id === id)
        if (item) {
          set({
            inputText: item.rawInput,
            result: item.result,
            status: 'complete',
          })
        }
      },
    }),
    {
      name: 'plancheck-storage',
      partialize: (state) => ({ history: state.history }),
    }
  )
)
```

---

## LOADING & EMPTY STATES

### Skeleton Loader
```typescript
// src/components/ui/Skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div 
      className={`
        bg-gradient-to-r from-bg-elevated via-bg-hover to-bg-elevated
        bg-[length:200%_100%] animate-shimmer rounded-lg
        ${className}
      `}
    />
  )
}

export function FindingCardSkeleton() {
  return (
    <div className="bg-bg-elevated border border-border rounded-lg p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-16 h-6" />
        <Skeleton className="w-20 h-6" />
      </div>
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-3/4 h-4" />
      <div className="flex gap-3">
        <Skeleton className="w-24 h-8" />
        <Skeleton className="w-24 h-8" />
      </div>
    </div>
  )
}
```

### Empty State
```typescript
// src/components/ui/EmptyState.tsx
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-16 text-center">
      <div className="w-24 h-24 mb-6 text-text-muted opacity-60">
        {icon}
      </div>
      
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-text-tertiary max-w-md mb-6">
        {description}
      </p>
      
      {action}
    </div>
  )
}
```

---

## KEYBOARD SHORTCUTS

```typescript
// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react'

export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd/Ctrl + K: Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        // Focus search input
      }
      
      // Cmd/Ctrl + Enter: Analyze
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        // Trigger analysis
      }
      
      // Escape: Clear selection
      if (e.key === 'Escape') {
        // Clear node/finding selection
      }
      
      // Arrow keys: Navigate findings
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        // Navigate through findings list
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
```

---

## MOBILE RESPONSIVE ADAPTATION

```typescript
// src/components/layout/MobileLayout.tsx
'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, History } from 'lucide-react'

export function MobileLayout() {
  const [activeView, setActiveView] = useState<'input' | 'results'>('input')
  
  return (
    <div className="h-screen flex flex-col bg-bg-app">
      {/* Mobile Header */}
      <header className="h-14 border-b border-border bg-bg-surface flex items-center justify-between px-4">
        <Sheet>
          <SheetTrigger>
            <Menu className="w-6 h-6" />
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <HistoryPanel />
          </SheetContent>
        </Sheet>
        
        <span className="font-semibold">PlanCheck</span>
        
        <button className="p-2">
          <History className="w-5 h-5" />
        </button>
      </header>
      
      {/* Mobile Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'input' ? (
          <CommandCenter onAnalyze={() => setActiveView('results')} />
        ) : (
          <AnalysisPanel onBack={() => setActiveView('input')} />
        )}
      </div>
    </div>
  )
}
```

---

This implementation guide provides complete, production-ready code for building the PlanCheck v2 interface with all specified features and interactions.
