# PlanCheck v2 - Layout & Component Specifications
## Three-Panel Desktop Architecture

---

## MAIN APPLICATION LAYOUT

### Overall Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER BAR (56px fixed)                                         │
├──────────┬──────────────────────────┬──────────────────────────┤
│          │                          │                          │
│  LEFT    │       CENTER PANEL       │      RIGHT PANEL         │
│  PANEL   │    (Command Center)      │   (Analysis Dashboard)   │
│ (History)│                          │                          │
│          │                          │                          │
│ 320px    │      Flex: 1             │        480px             │
│ (resize) │    (min: 480px)          │     (resize)             │
│          │                          │                          │
└──────────┴──────────────────────────┴──────────────────────────┘
```

---

## 1. HEADER BAR

### Specifications
```
Height: 56px
Background: var(--bg-surface)
Border-bottom: 1px solid var(--border-default)
Padding: 0 24px
Z-index: 100
```

### Layout
```jsx
<header className="app-header">
  <div className="header-left">
    <div className="logo">
      <DatabaseIcon />
      <span>PlanCheck</span>
      <span className="version">v2</span>
    </div>
  </div>
  
  <div className="header-center">
    <div className="trust-badge">
      <ShieldCheckIcon />
      <span>Your data never leaves your browser</span>
    </div>
  </div>
  
  <div className="header-right">
    <button className="icon-button">
      <SettingsIcon />
    </button>
    <button className="icon-button">
      <HelpCircleIcon />
    </button>
  </div>
</header>
```

### Styles
```css
.app-header {
  height: 56px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-h4);
  font-weight: 600;
  color: var(--text-primary);
  
  svg {
    width: 24px;
    height: 24px;
    color: var(--color-primary);
  }
  
  .version {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    font-weight: 500;
    padding: 2px 6px;
    background: var(--bg-elevated);
    border-radius: 4px;
  }
}

.trust-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 6px 12px;
  background: rgba(63, 185, 80, 0.1);
  border: 1px solid rgba(63, 185, 80, 0.2);
  border-radius: 6px;
  font-size: var(--text-xs);
  color: var(--color-success);
  
  svg {
    width: 14px;
    height: 14px;
  }
}
```

---

## 2. LEFT PANEL - HISTORY SIDEBAR

### Specifications
```
Default Width: 320px
Collapsed Width: 56px
Min Width: 280px
Max Width: 400px
Background: var(--bg-surface)
Border-right: 1px solid var(--border-default)
Resizable: Yes (drag handle on right edge)
```

### Structure
```jsx
<aside className="history-panel" data-collapsed={isCollapsed}>
  {/* Collapse Toggle */}
  <button className="collapse-toggle" onClick={toggleCollapse}>
    <ChevronLeftIcon />
  </button>
  
  {!isCollapsed && (
    <>
      {/* Header */}
      <div className="panel-header">
        <h2>History</h2>
        <div className="header-actions">
          <button className="icon-button" title="Filter">
            <FilterIcon />
          </button>
          <button className="icon-button" title="Search">
            <SearchIcon />
          </button>
        </div>
      </div>
      
      {/* Search & Filter Bar */}
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search analyses..."
          className="search-input"
        />
      </div>
      
      <div className="filter-chips">
        <button className="chip active">All</button>
        <button className="chip">Critical</button>
        <button className="chip">Today</button>
      </div>
      
      {/* History List */}
      <div className="history-list">
        {history.map(item => (
          <HistoryCard key={item.id} item={item} />
        ))}
      </div>
      
      {/* Empty State */}
      {history.length === 0 && (
        <div className="empty-state">
          <ClockIcon />
          <p>No analysis history yet</p>
          <span>Your analyzed plans will appear here</span>
        </div>
      )}
    </>
  )}
  
  {/* Collapsed State - Icon Only */}
  {isCollapsed && (
    <div className="collapsed-icons">
      <button className="icon-button" title="History">
        <ClockIcon />
      </button>
    </div>
  )}
</aside>
```

### History Card Component
```jsx
<div className="history-card" data-active={isActive}>
  {/* Mini Plan Graph Thumbnail */}
  <div className="card-thumbnail">
    <svg className="mini-graph">
      {/* Simplified tree visualization */}
    </svg>
  </div>
  
  {/* Card Content */}
  <div className="card-content">
    <div className="card-header">
      <span className="severity-dot" data-severity={severity}></span>
      <span className="timestamp">2 hours ago</span>
    </div>
    
    <div className="card-stats">
      <div className="stat">
        <span className="stat-label">Findings</span>
        <span className="stat-value">3</span>
      </div>
      <div className="stat">
        <span className="stat-label">Time</span>
        <span className="stat-value">245ms</span>
      </div>
    </div>
    
    <div className="card-tags">
      <span className="tag">Seq Scan</span>
      <span className="tag">Missing Index</span>
    </div>
  </div>
  
  {/* Hover Actions */}
  <div className="card-actions">
    <button className="icon-button-sm" title="Delete">
      <TrashIcon />
    </button>
  </div>
</div>
```

### Styles
```css
.history-panel {
  width: 320px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width 0.3s var(--ease-out);
  
  &[data-collapsed="true"] {
    width: 56px;
  }
}

.collapse-toggle {
  position: absolute;
  top: 12px;
  right: -12px;
  width: 24px;
  height: 24px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-hover);
    border-color: var(--border-strong);
  }
  
  svg {
    width: 14px;
    height: 14px;
    color: var(--text-secondary);
    transition: transform 0.3s ease;
  }
  
  [data-collapsed="true"] & svg {
    transform: rotate(180deg);
  }
}

.panel-header {
  padding: var(--space-6) var(--space-6) var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  h2 {
    font-size: var(--text-h3);
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .header-actions {
    display: flex;
    gap: var(--space-2);
  }
}

.search-bar {
  padding: 0 var(--space-6) var(--space-4);
  
  .search-input {
    width: 100%;
    height: 36px;
    padding: 0 var(--space-3) 0 36px;
    background: var(--bg-input);
    border: 1px solid var(--border-default);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: var(--text-sm);
    background-image: url("data:image/svg+xml,..."); /* Search icon */
    background-repeat: no-repeat;
    background-position: 12px center;
    
    &:focus {
      border-color: var(--border-focus);
      outline: none;
    }
    
    &::placeholder {
      color: var(--text-muted);
    }
  }
}

.filter-chips {
  display: flex;
  gap: var(--space-2);
  padding: 0 var(--space-6) var(--space-4);
  overflow-x: auto;
  
  .chip {
    padding: 4px 12px;
    background: transparent;
    border: 1px solid var(--border-default);
    border-radius: 16px;
    font-size: var(--text-xs);
    color: var(--text-secondary);
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--bg-hover);
      border-color: var(--border-strong);
    }
    
    &.active {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: white;
    }
  }
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--space-4) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.history-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-muted);
  border-radius: 10px;
  padding: var(--space-4);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  .card-thumbnail {
    width: 100%;
    height: 60px;
    background: var(--bg-input);
    border-radius: 6px;
    margin-bottom: var(--space-3);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    
    .mini-graph {
      width: 90%;
      height: 90%;
      opacity: 0.6;
    }
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-2);
    
    .severity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      
      &[data-severity="critical"] { background: var(--color-critical); }
      &[data-severity="high"] { background: var(--color-high); }
      &[data-severity="medium"] { background: var(--color-medium); }
      &[data-severity="low"] { background: var(--color-low); }
    }
    
    .timestamp {
      font-size: var(--text-xs);
      color: var(--text-tertiary);
    }
  }
  
  .card-stats {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-3);
    
    .stat {
      display: flex;
      flex-direction: column;
      gap: 2px;
      
      .stat-label {
        font-size: 10px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .stat-value {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--text-primary);
        font-family: var(--font-mono);
      }
    }
  }
  
  .card-tags {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    
    .tag {
      padding: 2px 8px;
      background: var(--bg-hover);
      border-radius: 4px;
      font-size: 11px;
      color: var(--text-tertiary);
    }
  }
  
  .card-actions {
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  &:hover {
    background: var(--bg-overlay);
    border-color: var(--border-default);
    transform: translateX(4px);
    
    .card-actions {
      opacity: 1;
    }
  }
  
  &[data-active="true"] {
    border-color: var(--color-primary);
    background: rgba(14, 165, 233, 0.05);
  }
}
```

---

## 3. CENTER PANEL - COMMAND CENTER

### Specifications
```
Min Width: 480px
Flex: 1 (grows to fill available space)
Background: var(--bg-app)
Padding: 32px
```

### Structure
```jsx
<main className="command-center">
  {/* Header Section */}
  <div className="center-header">
    <h1>Analyze Execution Plan</h1>
    <p className="subtitle">
      Paste your PostgreSQL EXPLAIN output to identify performance bottlenecks
    </p>
  </div>
  
  {/* Format Tabs */}
  <div className="format-tabs">
    <button className="tab active" data-format="json">
      <FileJsonIcon />
      JSON
    </button>
    <button className="tab" data-format="text">
      <FileTextIcon />
      Text
    </button>
    <button className="tab" data-format="yaml">
      <FileCodeIcon />
      YAML
    </button>
    <button className="tab" data-format="upload">
      <UploadIcon />
      Upload
    </button>
  </div>
  
  {/* Code Editor */}
  <div className="editor-container">
    <div className="editor-toolbar">
      <div className="toolbar-left">
        <button className="toolbar-button">
          <WandIcon />
          Format
        </button>
        <button className="toolbar-button">
          <FileIcon />
          Paste Example
        </button>
      </div>
      
      <div className="toolbar-right">
        <span className="char-count">1,247 characters</span>
        <div className="validation-status valid">
          <CheckCircleIcon />
          Valid JSON
        </div>
      </div>
    </div>
    
    <div className="code-editor">
      {/* Monaco Editor or CodeMirror integration */}
      <CodeEditor
        value={inputText}
        onChange={setInputText}
        language={selectedFormat}
        options={{
          lineNumbers: true,
          minimap: false,
          fontSize: 14,
          fontFamily: 'JetBrains Mono',
          theme: 'plancheck-dark',
          bracketPairColorization: true,
          formatOnPaste: true
        }}
      />
    </div>
  </div>
  
  {/* Action Bar */}
  <div className="action-bar">
    <button className="btn-primary" onClick={handleAnalyze}>
      <PlayIcon />
      Analyze Plan
    </button>
    
    <button className="btn-secondary" onClick={handleClear}>
      <XIcon />
      Clear
    </button>
    
    <div className="action-info">
      <InfoIcon />
      Analysis runs locally in your browser
    </div>
  </div>
  
  {/* Error Display */}
  {error && (
    <div className="error-banner">
      <AlertCircleIcon />
      <div className="error-content">
        <strong>Parse Error</strong>
        <p>{error}</p>
      </div>
      <button className="icon-button" onClick={clearError}>
        <XIcon />
      </button>
    </div>
  )}
</main>
```

### Styles
```css
.command-center {
  flex: 1;
  min-width: 480px;
  background: var(--bg-app);
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  overflow-y: auto;
}

.center-header {
  h1 {
    font-size: var(--text-display);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
    letter-spacing: -0.02em;
  }
  
  .subtitle {
    font-size: var(--text-base);
    color: var(--text-secondary);
    line-height: 1.6;
  }
}

.format-tabs {
  display: flex;
  gap: var(--space-2);
  padding: 4px;
  background: var(--bg-surface);
  border-radius: 10px;
  border: 1px solid var(--border-default);
  
  .tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: 10px 16px;
    background: transparent;
    border: none;
    border-radius: 8px;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    
    svg {
      width: 16px;
      height: 16px;
    }
    
    &:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    
    &.active {
      background: var(--color-primary);
      color: white;
      box-shadow: 0 2px 8px var(--color-primary-glow);
    }
  }
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  overflow: hidden;
  min-height: 400px;
  
  &:focus-within {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px var(--color-primary-glow);
  }
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-default);
  
  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  
  .toolbar-button {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 6px 12px;
    background: transparent;
    border: 1px solid var(--border-default);
    border-radius: 6px;
    font-size: var(--text-xs);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    
    svg {
      width: 14px;
      height: 14px;
    }
    
    &:hover {
      background: var(--bg-hover);
      border-color: var(--border-strong);
      color: var(--text-primary);
    }
  }
  
  .char-count {
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--text-tertiary);
  }
  
  .validation-status {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: var(--text-xs);
    font-weight: 500;
    
    svg {
      width: 14px;
      height: 14px;
    }
    
    &.valid {
      background: rgba(63, 185, 80, 0.1);
      color: var(--color-success);
    }
    
    &.invalid {
      background: rgba(248, 81, 73, 0.1);
      color: var(--color-critical);
    }
  }
}

.code-editor {
  flex: 1;
  overflow: hidden;
  
  /* Monaco/CodeMirror will inject here */
}

.action-bar {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  
  .btn-primary {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    height: 48px;
    padding: 0 var(--space-6);
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: var(--text-base);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px var(--color-primary-glow);
    
    svg {
      width: 18px;
      height: 18px;
    }
    
    &:hover {
      background: var(--color-primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px var(--color-primary-glow);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &:disabled {
      background: var(--bg-hover);
      color: var(--text-muted);
      cursor: not-allowed;
      box-shadow: none;
    }
  }
  
  .btn-secondary {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    height: 48px;
    padding: 0 var(--space-5);
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border-default);
    border-radius: 10px;
    font-size: var(--text-base);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    svg {
      width: 16px;
      height: 16px;
    }
    
    &:hover {
      background: var(--bg-hover);
      border-color: var(--border-strong);
      color: var(--text-primary);
    }
  }
  
  .action-info {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-left: auto;
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
}

.error-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  background: rgba(248, 81, 73, 0.1);
  border: 1px solid rgba(248, 81, 73, 0.3);
  border-radius: 10px;
  
  > svg {
    width: 20px;
    height: 20px;
    color: var(--color-critical);
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  .error-content {
    flex: 1;
    
    strong {
      display: block;
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-critical);
      margin-bottom: 4px;
    }
    
    p {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.5;
    }
  }
}
```

---

## 4. RIGHT PANEL - ANALYSIS DASHBOARD

### Specifications
```
Default Width: 480px
Min Width: 400px
Max Width: 600px
Background: var(--bg-surface)
Border-left: 1px solid var(--border-default)
Resizable: Yes
```

### Structure - See next file for complete RIGHT PANEL specification...

---

This layout provides a professional, three-panel architecture optimized for desktop workflows with sophisticated input handling and visual history management.
