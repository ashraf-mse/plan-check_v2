# PlanCheck v2 - Right Panel: Analysis Dashboard
## Interactive Findings & Plan Visualization

---

## RIGHT PANEL STRUCTURE

### Overall Layout
```
┌─────────────────────────────────────────┐
│ METRICS BAR (80px)                      │
├─────────────────────────────────────────┤
│                                         │
│ TABBED VIEW                             │
│ ┌─────────┬──────────┬──────────────┐  │
│ │Findings │Plan Tree │ Raw Output   │  │
│ └─────────┴──────────┴──────────────┘  │
│                                         │
│ [Active Tab Content]                    │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

---

## 1. METRICS BAR

### Structure
```jsx
<div className="metrics-bar">
  <div className="metric-card">
    <div className="metric-icon">
      <ClockIcon />
    </div>
    <div className="metric-content">
      <span className="metric-label">Execution Time</span>
      <span className="metric-value">245.32ms</span>
    </div>
  </div>
  
  <div className="metric-card">
    <div className="metric-icon">
      <ZapIcon />
    </div>
    <div className="metric-content">
      <span className="metric-label">Planning Time</span>
      <span className="metric-value">12.45ms</span>
    </div>
  </div>
  
  <div className="metric-card">
    <div className="metric-icon">
      <TrendingUpIcon />
    </div>
    <div className="metric-content">
      <span className="metric-label">Total Cost</span>
      <span className="metric-value">1,247.89</span>
    </div>
  </div>
  
  <div className="metric-card severity">
    <div className="metric-icon" data-severity="high">
      <AlertTriangleIcon />
    </div>
    <div className="metric-content">
      <span className="metric-label">Findings</span>
      <span className="metric-value">3 Issues</span>
    </div>
  </div>
</div>
```

### Styles
```css
.metrics-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
  padding: var(--space-5);
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-default);
}

.metric-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--bg-surface);
  border: 1px solid var(--border-muted);
  border-radius: 10px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--border-default);
    transform: translateY(-2px);
  }
  
  .metric-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-elevated);
    border-radius: 8px;
    
    svg {
      width: 20px;
      height: 20px;
      color: var(--color-primary);
    }
    
    &[data-severity="critical"] {
      background: rgba(248, 81, 73, 0.1);
      svg { color: var(--color-critical); }
    }
    
    &[data-severity="high"] {
      background: rgba(251, 133, 0, 0.1);
      svg { color: var(--color-high); }
    }
  }
  
  .metric-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .metric-label {
      font-size: 11px;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }
    
    .metric-value {
      font-size: var(--text-base);
      font-weight: 700;
      color: var(--text-primary);
      font-family: var(--font-mono);
    }
  }
}
```

---

## 2. TAB NAVIGATION

### Structure
```jsx
<div className="tab-navigation">
  <button className="tab active" data-tab="findings">
    <ListIcon />
    Findings
    <span className="tab-badge">3</span>
  </button>
  
  <button className="tab" data-tab="tree">
    <GitBranchIcon />
    Plan Tree
  </button>
  
  <button className="tab" data-tab="raw">
    <CodeIcon />
    Raw Output
  </button>
</div>
```

### Styles
```css
.tab-navigation {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5) 0;
  background: var(--bg-surface);
  border-bottom: 2px solid var(--border-default);
}

.tab {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  .tab-badge {
    padding: 2px 6px;
    background: var(--bg-elevated);
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-tertiary);
  }
  
  &:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
    border-radius: 8px 8px 0 0;
  }
  
  &.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
    
    .tab-badge {
      background: var(--color-primary);
      color: white;
    }
  }
}
```

---

## 3. FINDINGS TAB

### Structure
```jsx
<div className="findings-container">
  {/* Severity Filter */}
  <div className="findings-header">
    <div className="severity-filters">
      <button className="filter-btn active" data-severity="all">
        All <span className="count">3</span>
      </button>
      <button className="filter-btn" data-severity="critical">
        Critical <span className="count">0</span>
      </button>
      <button className="filter-btn" data-severity="high">
        High <span className="count">2</span>
      </button>
      <button className="filter-btn" data-severity="medium">
        Medium <span className="count">1</span>
      </button>
    </div>
    
    <button className="icon-button" title="Export findings">
      <DownloadIcon />
    </button>
  </div>
  
  {/* Findings List */}
  <div className="findings-list">
    {findings.map(finding => (
      <FindingCard 
        key={finding.id} 
        finding={finding}
        onNodeHighlight={handleNodeHighlight}
      />
    ))}
  </div>
</div>
```

### Enhanced Finding Card
```jsx
<div className="finding-card" data-severity={severity} data-expanded={isExpanded}>
  {/* Severity Bar */}
  <div className="severity-bar" data-severity={severity}></div>
  
  {/* Card Header */}
  <div className="card-header" onClick={toggleExpand}>
    <div className="header-left">
      <div className="severity-badge" data-severity={severity}>
        <AlertIcon />
        {severity}
      </div>
      
      <div className="confidence-badge" data-confidence={confidence}>
        {confidence === 'verified' && <CheckCircleIcon />}
        {confidence === 'inferred' && <InfoIcon />}
        {confidence}
      </div>
    </div>
    
    <button className="expand-button">
      <ChevronDownIcon />
    </button>
  </div>
  
  {/* Card Title */}
  <div className="card-title">
    <h3>{finding.title}</h3>
    <p className="behavior">{finding.education.behavior}</p>
  </div>
  
  {/* Quick Stats */}
  <div className="quick-stats">
    <div className="stat">
      <DatabaseIcon />
      <span>{affectedNodes.length} nodes affected</span>
    </div>
    <div className="stat">
      <ClockIcon />
      <span>~{estimatedImpact}ms potential savings</span>
    </div>
  </div>
  
  {/* Expandable Content */}
  {isExpanded && (
    <div className="card-content">
      {/* Evidence Section */}
      <div className="content-section">
        <div className="section-header">
          <FileTextIcon />
          <h4>Evidence</h4>
        </div>
        
        <div className="evidence-list">
          {finding.evidence.map((ev, i) => (
            <div key={i} className="evidence-item">
              <button 
                className="node-link"
                onClick={() => highlightNode(ev.nodeId)}
              >
                <LinkIcon />
                Jump to node
              </button>
              
              <code className="evidence-code">{ev.rawText}</code>
              <span className="evidence-location">{ev.location}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Explanation Section */}
      <div className="content-section">
        <div className="section-header">
          <BookOpenIcon />
          <h4>Why This Matters</h4>
        </div>
        
        <ul className="explanation-list">
          {finding.education.explanation.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
      
      {/* Limitations Section - EMPHASIZED */}
      <div className="content-section limitations">
        <div className="section-header">
          <AlertTriangleIcon />
          <h4>What We Cannot Determine</h4>
        </div>
        
        <ul className="limitations-list">
          {finding.education.limitations.map((lim, i) => (
            <li key={i}>{lim}</li>
          ))}
        </ul>
      </div>
      
      {/* Actions */}
      <div className="card-actions">
        <button className="action-btn primary">
          <CopyIcon />
          Copy CREATE INDEX
        </button>
        
        <a 
          href={finding.education.docsLink}
          target="_blank"
          className="action-btn secondary"
        >
          <ExternalLinkIcon />
          PostgreSQL Docs
        </a>
      </div>
    </div>
  )}
</div>
```

### Styles
```css
.findings-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-surface);
}

.findings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5);
  border-bottom: 1px solid var(--border-default);
  
  .severity-filters {
    display: flex;
    gap: var(--space-2);
    
    .filter-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: 6px 12px;
      background: transparent;
      border: 1px solid var(--border-default);
      border-radius: 8px;
      font-size: var(--text-xs);
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      
      .count {
        padding: 2px 6px;
        background: var(--bg-elevated);
        border-radius: 10px;
        font-size: 10px;
        font-weight: 600;
      }
      
      &:hover {
        background: var(--bg-hover);
        border-color: var(--border-strong);
      }
      
      &.active {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: white;
        
        .count {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
      }
    }
  }
}

.findings-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.finding-card {
  position: relative;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: var(--space-5);
  transition: all 0.3s var(--ease-out);
  
  /* Glassmorphism */
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  
  .severity-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 12px 0 0 12px;
    
    &[data-severity="critical"] { background: var(--color-critical); }
    &[data-severity="high"] { background: var(--color-high); }
    &[data-severity="medium"] { background: var(--color-medium); }
    &[data-severity="low"] { background: var(--color-low); }
  }
  
  &:hover {
    border-color: var(--border-strong);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  &[data-expanded="true"] {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 1px var(--color-primary-glow);
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
  cursor: pointer;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  
  .severity-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    
    svg {
      width: 12px;
      height: 12px;
    }
    
    &[data-severity="critical"] {
      background: rgba(248, 81, 73, 0.15);
      color: var(--color-critical);
      border: 1px solid rgba(248, 81, 73, 0.3);
    }
    
    &[data-severity="high"] {
      background: rgba(251, 133, 0, 0.15);
      color: var(--color-high);
      border: 1px solid rgba(251, 133, 0, 0.3);
    }
    
    &[data-severity="medium"] {
      background: rgba(253, 176, 34, 0.15);
      color: var(--color-medium);
      border: 1px solid rgba(253, 176, 34, 0.3);
    }
  }
  
  .confidence-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    text-transform: capitalize;
    
    svg {
      width: 12px;
      height: 12px;
    }
    
    &[data-confidence="verified"] {
      background: rgba(63, 185, 80, 0.15);
      color: var(--color-success);
    }
    
    &[data-confidence="inferred"] {
      background: rgba(88, 166, 255, 0.15);
      color: var(--color-info);
    }
  }
  
  .expand-button {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-hover);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    svg {
      width: 16px;
      height: 16px;
      color: var(--text-secondary);
      transition: transform 0.3s ease;
    }
    
    &:hover {
      background: var(--bg-overlay);
    }
    
    [data-expanded="true"] & svg {
      transform: rotate(180deg);
    }
  }
}

.card-title {
  margin-bottom: var(--space-4);
  
  h3 {
    font-size: var(--text-h4);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
    line-height: 1.4;
  }
  
  .behavior {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.6;
  }
}

.quick-stats {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-3);
  background: var(--bg-surface);
  border-radius: 8px;
  
  .stat {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    
    svg {
      width: 14px;
      height: 14px;
      color: var(--text-muted);
    }
  }
}

.card-content {
  margin-top: var(--space-5);
  padding-top: var(--space-5);
  border-top: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  animation: fadeIn 0.3s var(--ease-out);
}

.content-section {
  .section-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
    
    svg {
      width: 16px;
      height: 16px;
      color: var(--color-primary);
    }
    
    h4 {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
  
  &.limitations {
    background: rgba(253, 176, 34, 0.05);
    border: 1px solid rgba(253, 176, 34, 0.2);
    border-radius: 10px;
    padding: var(--space-4);
    
    .section-header {
      svg {
        color: var(--color-medium);
      }
      
      h4 {
        color: var(--color-medium);
      }
    }
  }
}

.evidence-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  
  .evidence-item {
    background: var(--bg-input);
    border: 1px solid var(--border-default);
    border-radius: 8px;
    padding: var(--space-3);
    
    .node-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 4px 10px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      margin-bottom: var(--space-2);
      transition: all 0.2s ease;
      
      svg {
        width: 12px;
        height: 12px;
      }
      
      &:hover {
        background: var(--color-primary-hover);
        transform: translateX(2px);
      }
    }
    
    .evidence-code {
      display: block;
      font-family: var(--font-mono);
      font-size: var(--text-code-inline);
      color: var(--text-primary);
      line-height: 1.6;
      margin-bottom: var(--space-2);
    }
    
    .evidence-location {
      display: block;
      font-size: var(--text-xs);
      color: var(--text-tertiary);
    }
  }
}

.explanation-list,
.limitations-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-left: var(--space-5);
  
  li {
    position: relative;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.6;
    
    &::before {
      content: '';
      position: absolute;
      left: -16px;
      top: 10px;
      width: 4px;
      height: 4px;
      background: var(--color-primary);
      border-radius: 50%;
    }
  }
}

.limitations-list li::before {
  background: var(--color-medium);
}

.card-actions {
  display: flex;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-default);
  
  .action-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 10px 16px;
    border-radius: 8px;
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    
    svg {
      width: 16px;
      height: 16px;
    }
    
    &.primary {
      background: var(--color-primary);
      color: white;
      border: none;
      
      &:hover {
        background: var(--color-primary-hover);
        transform: translateY(-1px);
      }
    }
    
    &.secondary {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-default);
      
      &:hover {
        background: var(--bg-hover);
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
    }
  }
}
```

---

## 4. PLAN TREE TAB

### Interactive Tree Visualization

```jsx
<div className="plan-tree-container">
  {/* Tree Controls */}
  <div className="tree-controls">
    <div className="control-group">
      <button className="control-btn" onClick={expandAll}>
        <MaximizeIcon />
        Expand All
      </button>
      <button className="control-btn" onClick={collapseAll}>
        <MinimizeIcon />
        Collapse All
      </button>
    </div>
    
    <div className="control-group">
      <button className="control-btn" data-active={layout === 'vertical'}>
        <AlignVerticalIcon />
      </button>
      <button className="control-btn" data-active={layout === 'horizontal'}>
        <AlignHorizontalIcon />
      </button>
    </div>
    
    <div className="zoom-controls">
      <button className="control-btn" onClick={zoomOut}>
        <ZoomOutIcon />
      </button>
      <span className="zoom-level">{zoomLevel}%</span>
      <button className="control-btn" onClick={zoomIn}>
        <ZoomInIcon />
      </button>
    </div>
  </div>
  
  {/* Interactive Tree Canvas */}
  <div className="tree-canvas" ref={canvasRef}>
    <ReactFlow
      nodes={planNodes}
      edges={planEdges}
      onNodeClick={handleNodeClick}
      nodeTypes={customNodeTypes}
      fitView
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  </div>
  
  {/* Node Details Panel (appears on click) */}
  {selectedNode && (
    <div className="node-details-panel">
      <div className="panel-header">
        <h4>{selectedNode.type}</h4>
        <button onClick={closeDetails}>
          <XIcon />
        </button>
      </div>
      
      <div className="node-properties">
        {Object.entries(selectedNode.data).map(([key, value]) => (
          <div key={key} className="property-row">
            <span className="property-key">{key}</span>
            <span className="property-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )}
</div>
```

### Custom Node Component
```jsx
function PlanNode({ data, selected }) {
  const nodeTypeConfig = {
    scan: { icon: DatabaseIcon, color: '#58A6FF' },
    join: { icon: GitMergeIcon, color: '#FFA657' },
    sort: { icon: ArrowUpDownIcon, color: '#A371F7' },
    aggregate: { icon: LayersIcon, color: '#3FB950' }
  };
  
  const config = nodeTypeConfig[data.category] || nodeTypeConfig.scan;
  const Icon = config.icon;
  
  return (
    <div 
      className="custom-plan-node" 
      data-selected={selected}
      data-has-finding={data.hasFinding}
    >
      <div className="node-header" style={{ borderLeftColor: config.color }}>
        <Icon />
        <span className="node-type">{data.nodeType}</span>
      </div>
      
      {data.relationName && (
        <div className="node-relation">{data.relationName}</div>
      )}
      
      <div className="node-stats">
        <div className="stat">
          <span className="stat-label">Rows</span>
          <span className="stat-value">{data.actualRows || data.planRows}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Time</span>
          <span className="stat-value">{data.actualTime}ms</span>
        </div>
      </div>
      
      {data.hasFinding && (
        <div className="node-finding-indicator">
          <AlertTriangleIcon />
        </div>
      )}
    </div>
  );
}
```

### Styles
```css
.plan-tree-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-surface);
}

.tree-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-default);
  
  .control-group {
    display: flex;
    gap: var(--space-2);
  }
  
  .control-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 6px 12px;
    background: var(--bg-surface);
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
    
    &[data-active="true"] {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: white;
    }
  }
  
  .zoom-controls {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    
    .zoom-level {
      min-width: 50px;
      text-align: center;
      font-size: var(--text-xs);
      font-family: var(--font-mono);
      color: var(--text-secondary);
    }
  }
}

.tree-canvas {
  flex: 1;
  position: relative;
  background: var(--bg-app);
}

.custom-plan-node {
  min-width: 200px;
  background: var(--bg-elevated);
  border: 2px solid var(--border-default);
  border-radius: 10px;
  padding: var(--space-3);
  transition: all 0.2s ease;
  
  .node-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--border-muted);
    border-left: 4px solid;
    padding-left: var(--space-2);
    margin-bottom: var(--space-3);
    
    svg {
      width: 16px;
      height: 16px;
      color: var(--text-secondary);
    }
    
    .node-type {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text-primary);
    }
  }
  
  .node-relation {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-primary);
    margin-bottom: var(--space-3);
  }
  
  .node-stats {
    display: flex;
    gap: var(--space-4);
    
    .stat {
      display: flex;
      flex-direction: column;
      gap: 2px;
      
      .stat-label {
        font-size: 10px;
        color: var(--text-muted);
        text-transform: uppercase;
      }
      
      .stat-value {
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }
  
  .node-finding-indicator {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: var(--color-high);
    border: 2px solid var(--bg-surface);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
      width: 14px;
      height: 14px;
      color: white;
    }
  }
  
  &:hover {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-glow);
    transform: scale(1.05);
  }
  
  &[data-selected="true"] {
    border-color: var(--color-primary);
    background: var(--color-primary-glow);
    box-shadow: var(--glow-primary);
  }
  
  &[data-has-finding="true"] {
    border-color: var(--color-high);
    background: rgba(251, 133, 0, 0.05);
  }
}

.node-details-panel {
  position: absolute;
  right: var(--space-5);
  top: var(--space-5);
  width: 300px;
  max-height: 80%;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  animation: slideIn 0.3s var(--ease-out);
  
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border-default);
    
    h4 {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--text-primary);
    }
  }
  
  .node-properties {
    padding: var(--space-4);
    max-height: 400px;
    overflow-y: auto;
    
    .property-row {
      display: flex;
      justify-content: space-between;
      padding: var(--space-2) 0;
      border-bottom: 1px solid var(--border-muted);
      
      &:last-child {
        border-bottom: none;
      }
      
      .property-key {
        font-size: var(--text-xs);
        color: var(--text-tertiary);
        font-weight: 500;
      }
      
      .property-value {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--text-primary);
        font-weight: 600;
      }
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

---

This specification provides a complete, production-ready right panel with interactive findings display, sophisticated plan tree visualization, and seamless node-to-finding linking.
