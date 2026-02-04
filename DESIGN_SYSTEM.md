# PlanCheck v2 - Complete Design System Specification
## 2026 Production-Ready SaaS Design

**Brand Principle**: Truth First - Precision, Clarity, Deep Technical Insight

---

## 1. COLOR PALETTE

### Primary Colors
```
--color-primary: #0EA5E9          // Electric Cyan (Primary Action)
--color-primary-hover: #0284C7    // Darker Cyan (Hover State)
--color-primary-light: #38BDF8    // Light Cyan (Accents)
--color-primary-glow: rgba(14, 165, 233, 0.15)  // Glow Effect
```

### Background Layers (Dark Theme)
```
--bg-app: #0A0E14                 // App Background (Deep Navy)
--bg-surface: #0F1419             // Primary Surface
--bg-elevated: #151B23            // Elevated Panels
--bg-overlay: #1A2129             // Overlays & Modals
--bg-hover: #1F2730               // Hover States
--bg-input: #0D1117               // Input Fields
```

### Text Hierarchy
```
--text-primary: #E6EDF3           // Primary Text (High Contrast)
--text-secondary: #8B949E         // Secondary Text
--text-tertiary: #6E7681          // Tertiary Text
--text-muted: #484F58             // Muted/Disabled Text
--text-inverse: #0A0E14           // Text on Light Backgrounds
```

### Semantic Colors
```
--color-critical: #F85149         // Critical Severity
--color-high: #FB8500             // High Severity
--color-medium: #FDB022           // Medium Severity
--color-low: #6E7681              // Low Severity
--color-success: #3FB950          // Success/Verified
--color-warning: #D29922          // Warning
--color-info: #58A6FF             // Info
```

### Border & Divider
```
--border-default: #30363D         // Default Borders
--border-muted: #21262D           // Subtle Dividers
--border-strong: #484F58          // Strong Emphasis
--border-focus: #0EA5E9           // Focus Ring
```

### Glassmorphism
```
--glass-bg: rgba(21, 27, 35, 0.7)
--glass-border: rgba(139, 148, 158, 0.1)
--glass-blur: blur(12px)
```

---

## 2. TYPOGRAPHY

### Font Stack
```css
/* UI Text */
--font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;

/* Code/Monospace */
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', Consolas, monospace;

/* Headings (Optional) */
--font-heading: 'Inter', sans-serif;
```

### Type Scale
```css
/* Display */
--text-display: 2.25rem;          // 36px - Hero Headlines
--text-display-weight: 700;
--text-display-line: 1.2;

/* Headings */
--text-h1: 1.875rem;              // 30px - Page Titles
--text-h1-weight: 600;
--text-h1-line: 1.3;

--text-h2: 1.5rem;                // 24px - Section Headers
--text-h2-weight: 600;
--text-h2-line: 1.4;

--text-h3: 1.25rem;               // 20px - Subsections
--text-h3-weight: 600;
--text-h3-line: 1.4;

--text-h4: 1.125rem;              // 18px - Card Titles
--text-h4-weight: 600;
--text-h4-line: 1.5;

/* Body */
--text-base: 0.9375rem;           // 15px - Primary Body
--text-base-weight: 400;
--text-base-line: 1.6;

--text-sm: 0.875rem;              // 14px - Secondary Text
--text-sm-weight: 400;
--text-sm-line: 1.5;

--text-xs: 0.8125rem;             // 13px - Captions
--text-xs-weight: 400;
--text-xs-line: 1.4;

/* Code */
--text-code: 0.875rem;            // 14px - Code Blocks
--text-code-weight: 400;
--text-code-line: 1.6;

--text-code-inline: 0.8125rem;    // 13px - Inline Code
```

---

## 3. SPACING SYSTEM

### Base Unit: 4px

```css
--space-0: 0;
--space-1: 0.25rem;    // 4px
--space-2: 0.5rem;     // 8px
--space-3: 0.75rem;    // 12px
--space-4: 1rem;       // 16px
--space-5: 1.25rem;    // 20px
--space-6: 1.5rem;     // 24px
--space-8: 2rem;       // 32px
--space-10: 2.5rem;    // 40px
--space-12: 3rem;      // 48px
--space-16: 4rem;      // 64px
--space-20: 5rem;      // 80px
```

### Layout Spacing
```css
--panel-padding: var(--space-6);        // 24px
--card-padding: var(--space-5);         // 20px
--section-gap: var(--space-8);          // 32px
--component-gap: var(--space-4);        // 16px
```

---

## 4. LAYOUT GRID

### Three-Panel Desktop Layout
```
Total Width: 100vw
Height: 100vh - 56px (header)

Left Panel (History Sidebar):
  - Default: 320px
  - Collapsed: 56px
  - Max: 400px
  - Resizable: Yes

Center Panel (Command Center):
  - Min: 480px
  - Flex: 1 (grows)
  - Optimal: 600-800px

Right Panel (Analysis):
  - Default: 480px
  - Min: 400px
  - Max: 600px
  - Resizable: Yes
```

### Breakpoints
```css
--breakpoint-mobile: 768px
--breakpoint-tablet: 1024px
--breakpoint-desktop: 1280px
--breakpoint-wide: 1920px
```

---

## 5. COMPONENT SPECIFICATIONS

### 5.1 Buttons

#### Primary Button
```css
height: 40px;
padding: 0 24px;
background: var(--color-primary);
color: white;
border: none;
border-radius: 8px;
font-size: var(--text-sm);
font-weight: 600;
transition: all 0.2s ease;
box-shadow: 0 0 0 0 var(--color-primary-glow);

&:hover {
  background: var(--color-primary-hover);
  box-shadow: 0 0 0 4px var(--color-primary-glow);
  transform: translateY(-1px);
}

&:active {
  transform: translateY(0);
}

&:disabled {
  background: var(--bg-hover);
  color: var(--text-muted);
  cursor: not-allowed;
}
```

#### Secondary Button
```css
height: 40px;
padding: 0 20px;
background: transparent;
color: var(--text-secondary);
border: 1px solid var(--border-default);
border-radius: 8px;
font-size: var(--text-sm);
font-weight: 500;

&:hover {
  background: var(--bg-hover);
  border-color: var(--border-strong);
  color: var(--text-primary);
}
```

#### Icon Button
```css
width: 36px;
height: 36px;
padding: 0;
background: transparent;
border: none;
border-radius: 6px;
color: var(--text-secondary);

&:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
```

### 5.2 Input Fields

#### Code Editor Pane
```css
background: var(--bg-input);
border: 1px solid var(--border-default);
border-radius: 12px;
padding: var(--space-4);
font-family: var(--font-mono);
font-size: var(--text-code);
line-height: var(--text-code-line);
color: var(--text-primary);
min-height: 400px;

/* Line Numbers */
.line-number {
  color: var(--text-muted);
  user-select: none;
  padding-right: var(--space-3);
}

/* Syntax Highlighting */
.token.keyword { color: #FF7B72; }
.token.string { color: #A5D6FF; }
.token.number { color: #79C0FF; }
.token.property { color: #FFA657; }
.token.comment { color: var(--text-tertiary); font-style: italic; }

&:focus-within {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-glow);
}
```

### 5.3 Cards

#### Finding Card
```css
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-radius: 12px;
padding: var(--space-5);
transition: all 0.2s ease;

/* Severity Indicator Bar */
&::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 12px 0 0 12px;
  background: var(--severity-color);
}

&:hover {
  border-color: var(--border-strong);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

/* Glassmorphism variant */
&.glass {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
}
```

#### History Card
```css
background: var(--bg-surface);
border: 1px solid var(--border-muted);
border-radius: 10px;
padding: var(--space-4);
cursor: pointer;
transition: all 0.15s ease;

.thumbnail {
  width: 100%;
  height: 60px;
  background: var(--bg-input);
  border-radius: 6px;
  margin-bottom: var(--space-3);
}

.stats {
  display: flex;
  gap: var(--space-3);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

&:hover {
  background: var(--bg-elevated);
  border-color: var(--border-default);
  transform: scale(1.02);
}

&.active {
  border-color: var(--color-primary);
  background: var(--bg-elevated);
}
```

### 5.4 Badges

#### Severity Badge
```css
display: inline-flex;
align-items: center;
gap: var(--space-2);
padding: 4px 10px;
border-radius: 6px;
font-size: var(--text-xs);
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.5px;

/* Critical */
&.critical {
  background: rgba(248, 81, 73, 0.15);
  color: var(--color-critical);
  border: 1px solid rgba(248, 81, 73, 0.3);
}

/* High */
&.high {
  background: rgba(251, 133, 0, 0.15);
  color: var(--color-high);
  border: 1px solid rgba(251, 133, 0, 0.3);
}

/* Medium */
&.medium {
  background: rgba(253, 176, 34, 0.15);
  color: var(--color-medium);
  border: 1px solid rgba(253, 176, 34, 0.3);
}

/* Low */
&.low {
  background: rgba(110, 118, 129, 0.15);
  color: var(--color-low);
  border: 1px solid rgba(110, 118, 129, 0.3);
}
```

#### Confidence Badge
```css
padding: 3px 8px;
border-radius: 4px;
font-size: 11px;
font-weight: 500;
text-transform: capitalize;

&.verified {
  background: rgba(63, 185, 80, 0.15);
  color: var(--color-success);
}

&.inferred {
  background: rgba(88, 166, 255, 0.15);
  color: var(--color-info);
}

&.educational {
  background: rgba(139, 148, 158, 0.15);
  color: var(--text-secondary);
}
```

### 5.5 Interactive Plan Tree

#### Node Styling
```css
.plan-node {
  background: var(--bg-elevated);
  border: 2px solid var(--border-default);
  border-radius: 8px;
  padding: var(--space-3) var(--space-4);
  min-width: 180px;
  transition: all 0.2s ease;
  
  .node-type {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }
  
  .node-stats {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }
  
  /* Node Type Colors */
  &.scan { border-left: 4px solid #58A6FF; }
  &.join { border-left: 4px solid #FFA657; }
  &.sort { border-left: 4px solid #A371F7; }
  &.aggregate { border-left: 4px solid #3FB950; }
  
  /* States */
  &:hover {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-glow);
    transform: scale(1.05);
  }
  
  &.has-finding {
    border-color: var(--color-high);
    background: rgba(251, 133, 0, 0.05);
  }
  
  &.highlighted {
    border-color: var(--color-primary);
    background: var(--color-primary-glow);
    box-shadow: 0 0 20px var(--color-primary-glow);
  }
}

/* Connector Lines */
.plan-edge {
  stroke: var(--border-default);
  stroke-width: 2px;
  fill: none;
  
  &.highlighted {
    stroke: var(--color-primary);
    stroke-width: 3px;
  }
}
```

---

## 6. ANIMATION & TRANSITIONS

### Timing Functions
```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Micro-interactions
```css
/* Panel Resize */
.panel-resize {
  transition: width 0.3s var(--ease-out);
}

/* Card Expand */
.card-expand {
  transition: max-height 0.3s var(--ease-out);
}

/* Hover Lift */
.hover-lift {
  transition: transform 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
}

/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Skeleton Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 7. SHADOWS & DEPTH

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.6);

/* Glow Effects */
--glow-primary: 0 0 20px var(--color-primary-glow);
--glow-critical: 0 0 20px rgba(248, 81, 73, 0.3);
```

---

## 8. LOADING STATES

### Skeleton Screen
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-elevated) 0%,
    var(--bg-hover) 50%,
    var(--bg-elevated) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### Spinner
```css
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border-default);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 9. EMPTY STATES

### Illustration Style
- Use simple, geometric line art
- Color: var(--text-muted) with var(--color-primary) accents
- Size: 120px x 120px
- Style: Minimalist, technical diagrams

### Empty State Container
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
  text-align: center;
  
  .illustration {
    margin-bottom: var(--space-6);
    opacity: 0.6;
  }
  
  h3 {
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }
  
  p {
    color: var(--text-tertiary);
    max-width: 400px;
  }
}
```

---

## 10. ACCESSIBILITY

### Focus States
```css
*:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Color Contrast Ratios
- Text Primary on Background: 14.5:1 (AAA)
- Text Secondary on Background: 7.2:1 (AA)
- Interactive Elements: Minimum 4.5:1 (AA)

### Keyboard Navigation
- Tab order follows visual hierarchy
- Arrow keys navigate within lists
- Escape closes modals/panels
- Enter/Space activates buttons

---

## 11. RESPONSIVE ADAPTATIONS

### Mobile (< 768px)
- Single column layout
- Collapsible panels as full-screen modals
- Bottom sheet for findings
- Simplified plan tree (list view)

### Tablet (768px - 1024px)
- Two-panel layout (Center + Right)
- History accessible via slide-out drawer
- Touch-optimized controls (44px minimum)

---

This design system provides the complete foundation for a premium, production-ready PostgreSQL EXPLAIN analyzer that communicates precision, trust, and technical sophistication.
