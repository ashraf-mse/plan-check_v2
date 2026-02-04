# PlanCheck v2 — Complete Design System Specification (2026)

**Brand Principle**: "Truth First" — Precision, Clarity, Deep Technical Insight

---

## 1. DESIGN PHILOSOPHY

PlanCheck v2 is a premium PostgreSQL EXPLAIN analyzer that communicates trust, technical depth, and professional-grade reliability. The design must:

- **Inspire confidence** through clean, precise visual hierarchy
- **Communicate expertise** with sophisticated, desaturated color palette
- **Provide clarity** through exceptional typography and readable interfaces
- **Enable focus** with purposeful use of space and subtle depth cues
- **Reward interaction** with smooth micro-animations and responsive feedback

---

## 2. COLOR PALETTE

### 2.1 Foundation Colors (Dark-Primary Theme)

```css
/* Background Layers - Progressive Depth */
--bg-app: #0a0e14;           /* Deepest layer - main app background */
--bg-surface: #0f1419;       /* Surface layer - panels, sidebars */
--bg-elevated: #151b23;      /* Elevated elements - cards, dropdowns */
--bg-overlay: #1a2129;       /* Overlays, modals */
--bg-hover: #1f2730;         /* Hover states */
--bg-input: #0d1117;         /* Input fields, code editor */
```

### 2.2 Text Hierarchy

```css
/* High Contrast Text System */
--text-primary: #e6edf3;     /* Primary content - 95% contrast */
--text-secondary: #8b949e;   /* Secondary content - 70% contrast */
--text-tertiary: #6e7681;    /* Tertiary content - 55% contrast */
--text-muted: #484f58;       /* Muted/disabled - 35% contrast */
```

### 2.3 Accent Colors (Single Confident Color + Semantic)

```css
/* Primary Accent - Electric Cyan (Trust & Technology) */
--accent-cyan: #06b6d4;
--accent-cyan-bright: #22d3ee;
--accent-cyan-glow: rgba(6, 182, 212, 0.3);

/* Secondary Accent - Deep Purple (Premium) */
--accent-purple: #8b5cf6;
--accent-purple-bright: #a78bfa;
--accent-purple-glow: rgba(139, 92, 246, 0.3);

/* Semantic Colors */
--accent-green: #10b981;      /* Success, Good Performance */
--accent-orange: #f59e0b;     /* Warning, Medium Severity */
--accent-red: #ef4444;        /* Critical, High Severity */
--accent-blue: #3b82f6;       /* Info, Low Severity */
```

### 2.4 Borders & Dividers

```css
--border-subtle: #21262d;    /* Barely visible dividers */
--border-default: #30363d;   /* Standard borders */
--border-strong: #484f58;    /* Emphasized borders */
```

### 2.5 Shadows & Depth

```css
/* Layered Shadow System */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.6);
--shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.7);

/* Glow Effects for Accents */
--glow-cyan: 0 0 20px var(--accent-cyan-glow), 0 0 40px var(--accent-cyan-glow);
--glow-green: 0 0 20px rgba(16, 185, 129, 0.3);
--glow-orange: 0 0 20px rgba(245, 158, 11, 0.3);
--glow-red: 0 0 20px rgba(239, 68, 68, 0.3);
```

---

## 3. TYPOGRAPHY

### 3.1 Font Stack

```css
/* UI Text - Inter (Modern, Readable, Professional) */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11'; /* Alternate glyphs for clarity */

/* Code/Monospace - JetBrains Mono (Developer-Focused) */
font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', Consolas, monospace;
```

### 3.2 Type Scale

```css
/* Headings */
H1: 28px / 1.3 / 700 (Bold)       /* Page titles */
H2: 20px / 1.4 / 600 (Semibold)   /* Section headers */
H3: 16px / 1.5 / 600 (Semibold)   /* Card titles */
H4: 14px / 1.5 / 600 (Semibold)   /* Subsection headers */

/* Body Text */
Body Large: 15px / 1.6 / 400      /* Primary content */
Body: 14px / 1.6 / 400            /* Standard text */
Body Small: 13px / 1.5 / 400      /* Secondary text */
Caption: 12px / 1.4 / 500         /* Labels, metadata */
Tiny: 11px / 1.3 / 500            /* Badges, tags */

/* Code */
Code: 14px / 1.6 / 400            /* Inline code */
Code Block: 13px / 1.7 / 400      /* Code blocks */
```

### 3.3 Font Weights

- **400 (Regular)**: Body text, descriptions
- **500 (Medium)**: Labels, captions, emphasis
- **600 (Semibold)**: Headings, buttons, important UI
- **700 (Bold)**: Primary headings, brand elements

---

## 4. SPACING SYSTEM

```css
/* 4px Base Unit - Consistent Rhythm */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

**Usage Guidelines**:
- Tight spacing (4-8px): Related elements, inline items
- Medium spacing (12-16px): Card padding, section gaps
- Large spacing (20-32px): Panel padding, major sections
- Extra large (40-64px): Page margins, hero sections

---

## 5. COMPONENT SPECIFICATIONS

### 5.1 Buttons

#### Primary Action Button
```css
background: var(--accent-cyan);
color: white;
padding: 10px 24px;
border-radius: 8px;
font-size: 14px;
font-weight: 600;
transition: all 0.2s ease;

/* Hover */
background: var(--accent-cyan-bright);
box-shadow: var(--glow-cyan);
transform: translateY(-1px);

/* Disabled */
background: var(--bg-elevated);
color: var(--text-muted);
cursor: not-allowed;
```

#### Secondary Button
```css
background: var(--bg-elevated);
color: var(--text-secondary);
border: 1px solid var(--border-default);
padding: 8px 16px;
border-radius: 6px;
font-size: 13px;
font-weight: 500;

/* Hover */
background: var(--bg-hover);
border-color: var(--accent-cyan);
color: var(--accent-cyan);
```

### 5.2 Input Fields

```css
background: var(--bg-input);
border: 1px solid var(--border-default);
border-radius: 8px;
padding: 10px 14px;
color: var(--text-primary);
font-size: 14px;

/* Focus */
border-color: var(--accent-cyan);
outline: 2px solid rgba(6, 182, 212, 0.2);
outline-offset: 0;

/* Placeholder */
color: var(--text-muted);
```

### 5.3 Cards

```css
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-radius: 12px;
padding: 20px;
box-shadow: var(--shadow-md);
transition: all 0.3s ease;

/* Hover */
transform: translateY(-2px);
box-shadow: var(--shadow-lg);
border-color: var(--border-strong);
```

### 5.4 Badges

```css
/* Severity Badge - Critical */
background: rgba(239, 68, 68, 0.15);
color: var(--accent-red-bright);
border: 1px solid rgba(239, 68, 68, 0.3);
padding: 4px 10px;
border-radius: 12px;
font-size: 11px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.5px;

/* Confidence Badge - Verified */
background: rgba(16, 185, 129, 0.15);
color: var(--accent-green);
border: 1px solid rgba(16, 185, 129, 0.3);
```

### 5.5 Glassmorphism (Subtle Depth)

```css
.glass {
    background: rgba(21, 27, 35, 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(139, 148, 158, 0.1);
}
```

---

## 6. LAYOUT ARCHITECTURE

### 6.1 Three-Panel Desktop Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Header (56px) - Logo, Title, Privacy Badge                │
├──────────┬──────────────────────────┬──────────────────────┤
│          │                          │                      │
│  LEFT    │       CENTER             │      RIGHT           │
│  PANEL   │       PANEL              │      PANEL           │
│  (208px) │       (flex-1)           │      (384px)         │
│          │                          │                      │
│ History  │  Code Editor             │  Analysis Results    │
│ Sidebar  │  + Input Tabs            │  + Findings          │
│          │  + Format Tools          │  + Plan Tree         │
│          │  + Analyze Button        │  + Metrics           │
│          │                          │                      │
│ Collapse │  Resizable               │  Collapsible         │
│          │                          │                      │
└──────────┴──────────────────────────┴──────────────────────┘
```

### 6.2 Panel Specifications

#### Left Panel (History Sidebar)
- **Width**: 208px (collapsible to 48px icon-only)
- **Background**: `var(--bg-surface)`
- **Border**: Right border `var(--border-default)`
- **Sections**:
  - Header with collapse button
  - Search input (sticky)
  - Filter dropdown
  - Scrollable history cards
  - Privacy footer

#### Center Panel (Command Center)
- **Width**: Flexible (flex-1)
- **Background**: `var(--bg-app)`
- **Sections**:
  - Tab bar (JSON/Text/YAML/Upload)
  - Code editor with line numbers
  - Bottom toolbar (tips + analyze button)

#### Right Panel (Analysis Dashboard)
- **Width**: 384px (collapsible)
- **Background**: `var(--bg-surface)`
- **Border**: Left border `var(--border-default)`
- **Sections**:
  - Metrics header (execution/planning/cost)
  - Tab switcher (Findings/Plan Tree)
  - Scrollable content area

---

## 7. KEY FEATURE DESIGNS

### 7.1 Plan History Cards

**Visual Structure**:
```
┌─────────────────────────────────┐
│ [Mini Graph Visualization]      │ ← 6 bars showing node distribution
│                                  │
│ ● 3 findings                     │ ← Severity dot + count
│ 🕐 Jan 31, 2026                  │ ← Timestamp
│ [1750ms] [3]                     │ ← Metric badges
└─────────────────────────────────┘
```

**CSS Properties**:
```css
background: var(--bg-elevated);
border: 1px solid var(--border-subtle);
border-radius: 8px;
padding: 12px;
transition: all 0.2s ease;

/* Hover */
background: var(--bg-hover);
border-color: var(--accent-cyan);
transform: translateX(4px);
```

### 7.2 Code Editor (Center Panel)

**Features**:
- Syntax highlighting for JSON/YAML
- Line numbers (left gutter)
- Bracket matching
- Format validation indicator (top-right)
- Character count (bottom-right)
- Paste Example button
- Beautify/Format button

**Implementation**:
```typescript
// Use Monaco Editor or CodeMirror
import Editor from '@monaco-editor/react';

<Editor
  height="100%"
  language="json"
  theme="vs-dark"
  options={{
    minimap: { enabled: false },
    lineNumbers: 'on',
    fontSize: 14,
    fontFamily: 'JetBrains Mono',
    scrollBeyondLastLine: false,
    renderLineHighlight: 'all',
    bracketPairColorization: { enabled: true }
  }}
/>
```

### 7.3 Findings Dashboard (Right Panel)

**Structure**:
```
┌─────────────────────────────────────┐
│ Analysis Results                    │
│ ┌─────┬─────┬─────┐                │
│ │EXEC │PLAN │COST │ ← Metrics Bar  │
│ │175ms│ 8ms │ 450 │                │
│ └─────┴─────┴─────┘                │
├─────────────────────────────────────┤
│ [Findings] [Plan Tree]              │ ← Tabs
├─────────────────────────────────────┤
│ ▼ Critical (2)                      │ ← Collapsible Group
│   ├─ Seq Scan Detected              │
│   └─ Missing Index                  │
│                                     │
│ ▼ High (1)                          │
│   └─ Disk Spill Detected            │
│                                     │
│ ▶ Medium (0)                        │
│ ▶ Low (0)                           │
└─────────────────────────────────────┘
```

### 7.4 Finding Card (Expanded View)

**Sections**:
1. **Header**: Severity badge + confidence indicator + title
2. **Behavior**: Plain English explanation
3. **Evidence**: Code snippets with location
4. **Why This Matters**: Bullet points
5. **What We Cannot Know**: Limitations (highlighted)
6. **Actions**: Copy SQL, View Docs buttons

**CSS**:
```css
border-left: 4px solid var(--severity-color);
border-radius: 12px;
background: var(--bg-elevated);
padding: 20px;
box-shadow: var(--shadow-md);

/* Severity Colors */
.critical { border-left-color: var(--accent-red); }
.high { border-left-color: var(--accent-orange); }
.medium { border-left-color: #fdb022; }
.low { border-left-color: var(--accent-blue); }
```

### 7.5 Interactive Plan Tree

**Node Styling by Type**:
- **Scan**: Cyan (`var(--accent-cyan)`)
- **Join**: Orange (`var(--accent-orange)`)
- **Sort**: Purple (`var(--accent-purple)`)
- **Aggregate**: Green (`var(--accent-green)`)

**Interaction**:
- Clicking a finding highlights corresponding nodes
- Nodes with findings show severity dot
- Hover shows tooltip with full stats
- Expandable/collapsible tree structure

---

## 8. MICRO-INTERACTIONS

### 8.1 Hover Effects

```css
/* Card Hover */
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
transform: translateY(-2px);
box-shadow: var(--shadow-lg);

/* Button Hover */
transition: all 0.15s ease;
transform: translateY(-1px);
filter: brightness(1.1);
```

### 8.2 Loading States

```css
/* Skeleton Screen */
.skeleton {
    background: linear-gradient(
        90deg,
        var(--bg-elevated) 0%,
        var(--bg-hover) 50%,
        var(--bg-elevated) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
```

### 8.3 Empty States

**History Empty State**:
```
     ┌─────────────┐
     │   🕐 Icon   │
     └─────────────┘
   No analysis history
   Run your first analysis
```

**No Findings State**:
```
     ┌─────────────┐
     │   ✓ Icon    │
     └─────────────┘
   No issues detected
   Your query plan looks optimal
```

---

## 9. ANIMATIONS

```css
/* Fade In */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Slide In */
@keyframes slideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
}

/* Pulse (Loading) */
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* Glow (Accent) */
@keyframes glow {
    0%, 100% { box-shadow: 0 0 20px var(--accent-cyan-glow); }
    50% { box-shadow: 0 0 40px var(--accent-cyan-glow); }
}
```

---

## 10. RESPONSIVE DESIGN (Mobile Adaptation)

### 10.1 Breakpoints

```css
/* Desktop First */
@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 768px)  { /* Mobile */ }
```

### 10.2 Mobile Layout (< 768px)

**Single Column Stack**:
```
┌─────────────────────┐
│ Header (Compact)    │
├─────────────────────┤
│ Tab Bar             │
├─────────────────────┤
│ Code Editor         │
│ (Collapsible)       │
├─────────────────────┤
│ Analyze Button      │
├─────────────────────┤
│ Results Panel       │
│ (Full Width)        │
└─────────────────────┘
```

**Changes**:
- History sidebar → Bottom drawer (swipe up)
- Three panels → Vertical stack
- Metrics → Horizontal scroll
- Finding cards → Full width, compact padding

---

## 11. ACCESSIBILITY

### 11.1 Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter**: Activate buttons, expand/collapse
- **Escape**: Close modals, clear focus
- **Arrow Keys**: Navigate findings list

### 11.2 Focus Indicators

```css
*:focus-visible {
    outline: 2px solid var(--accent-cyan);
    outline-offset: 2px;
    border-radius: 4px;
}
```

### 11.3 Color Contrast

All text meets WCAG AA standards:
- Primary text: 95% contrast ratio
- Secondary text: 70% contrast ratio
- Minimum: 4.5:1 for body text

---

## 12. IMPLEMENTATION NOTES

### 12.1 Required Libraries

```json
{
  "@monaco-editor/react": "^4.6.0",
  "react-resizable-panels": "^2.0.0",
  "framer-motion": "^11.0.0",
  "react-syntax-highlighter": "^15.5.0"
}
```

### 12.2 Performance Optimizations

- Use `React.memo` for FindingCard components
- Virtualize history list (react-window)
- Lazy load Plan Tree nodes
- Debounce editor input (300ms)

### 12.3 Browser Support

- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

**CSS Features Used**:
- `backdrop-filter` (glassmorphism)
- CSS Grid & Flexbox
- CSS Custom Properties
- CSS Animations

---

## 13. BRAND ASSETS

### 13.1 Logo

**Icon**: Database symbol in gradient (cyan → purple)
**Text**: "PlanCheck" in gradient, "v2" in cyan accent

```css
.logo-icon {
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
    box-shadow: var(--glow-cyan);
}

.logo-text {
    background: linear-gradient(135deg, var(--accent-cyan-bright), var(--accent-cyan));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
```

### 13.2 Tagline

"Your data never leaves your browser"
- Font: 12px, Medium (500)
- Color: `var(--text-tertiary)`
- Icon: Shield (Lucide)

---

## 14. FINAL CHECKLIST

### Design Completeness
- ✅ Color palette defined with HEX codes
- ✅ Typography scale with font stacks
- ✅ Spacing system (4px base)
- ✅ Component specifications
- ✅ Layout architecture
- ✅ Micro-interactions defined
- ✅ Loading & empty states
- ✅ Mobile responsive design
- ✅ Accessibility guidelines

### Implementation Ready
- ✅ CSS custom properties
- ✅ Component structure
- ✅ Animation keyframes
- ✅ Library recommendations
- ✅ Performance notes

---

**This specification is production-ready and can be handed directly to a frontend engineer for implementation.**
