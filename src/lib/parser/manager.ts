import Logger from '@/lib/utils/logger';

export interface ParserResult {
    source: 'pev2' | 'fallback';
    plan: any;
    analysisTimeMs: number;
    executionTimeMs: number | null;
    planningTimeMs: number | null;
}

export class ParserManager {
    async parse(text: string): Promise<ParserResult> {
        const start = performance.now();
        const trimmed = text.trim();

        if (!trimmed) {
            Logger.error('Parser', 'Empty input provided');
            throw new Error('Please paste an EXPLAIN plan to analyze.');
        }

        Logger.info('Parser', 'Parsing started', { length: trimmed.length });

        // CRITICAL: Extract timing from original JSON BEFORE any processing
        // This ensures we get the raw values without any PEV2 modifications
        const rawTiming = this.extractTimingFromRawJson(trimmed);
        
        // DEBUG: Console output for verification
        console.log('=== PARSER DEBUG ===');
        console.log('Extracted executionTime:', rawTiming.executionTime);
        console.log('Extracted planningTime:', rawTiming.planningTime);
        console.log('===================');
        
        Logger.debug('Parser', 'Raw timing extraction', {
            executionTime: rawTiming.executionTime,
            planningTime: rawTiming.planningTime
        });

        // Try PEV2 worker first
        try {
            const result = await this.parseWithWorker(trimmed, 10000);
            
            if (result.ok && result.plan) {
                // PEV2 returns IPlan structure - extract the actual plan tree
                const planTree = this.extractPlanTree(result.plan);
                
                // PEV2 doesn't extract triggers from TEXT format - do it ourselves
                if (planTree && !planTree['Triggers']) {
                    const triggers = this.extractTriggersFromText(trimmed);
                    if (triggers.length > 0) {
                        planTree['Triggers'] = triggers;
                    }
                }
                
                // PEV2 doesn't extract JIT from TEXT format - do it ourselves
                if (planTree && !planTree['JIT']) {
                    const jit = this.extractJITFromText(trimmed);
                    if (jit) {
                        planTree['JIT'] = jit;
                    }
                }

                Logger.info('Parser', 'Worker parsing successful', { 
                    time: performance.now() - start,
                    hasContent: !!planTree,
                    executionTime: rawTiming.executionTime,
                    planningTime: rawTiming.planningTime
                });
                
                return {
                    source: 'pev2',
                    plan: planTree,
                    analysisTimeMs: performance.now() - start,
                    executionTimeMs: rawTiming.executionTime,
                    planningTimeMs: rawTiming.planningTime
                };
            }
            throw new Error('PEV2 returned invalid result');
        } catch (err: any) {
            Logger.warn('Parser', 'Worker parsing failed. Falling back.', { error: err.message });
            return this.fallbackParse(trimmed, start);
        }
    }

    /**
     * Extract timing values directly from raw text (JSON or TEXT format)
     * This bypasses PEV2 processing to get accurate timing data
     */
    private extractTimingFromRawJson(text: string): { executionTime: number | null; planningTime: number | null } {
        let executionTime: number | null = null;
        let planningTime: number | null = null;

        // Try TEXT format first (lines like "Planning Time: 12.450 ms")
        const planningTextMatch = text.match(/^\s*Planning Time:\s*([\d.]+)\s*ms/im);
        if (planningTextMatch) {
            planningTime = parseFloat(planningTextMatch[1]);
        }
        
        const executionTextMatch = text.match(/^\s*Execution Time:\s*([\d.]+)\s*ms/im);
        if (executionTextMatch) {
            executionTime = parseFloat(executionTextMatch[1]);
        }

        // If we found timing from text format, return early
        if (executionTime !== null || planningTime !== null) {
            return { executionTime, planningTime };
        }

        try {
            // Clean up the text for JSON parsing
            let cleaned = text.trim();
            cleaned = cleaned.replace(/^\s*QUERY PLAN\s*[-=]*\s*\n/im, '');
            cleaned = cleaned.replace(/\n?\s*\(\d+\s+rows?\)\s*$/i, '');
            cleaned = cleaned.replace(/""/g, '"');

            // Find JSON
            const jsonMatch = cleaned.match(/[\[\{][\s\S]*[\]\}]/);
            if (!jsonMatch) {
                return { executionTime, planningTime };
            }

            const parsed = JSON.parse(jsonMatch[0]);
            const root = Array.isArray(parsed) ? parsed[0] : parsed;

            // Standard format: timing at root level
            if (typeof root['Execution Time'] === 'number') {
                executionTime = root['Execution Time'];
            }
            if (typeof root['Planning Time'] === 'number') {
                planningTime = root['Planning Time'];
            }

            // Non-standard: timing inside Plan object
            const plan = root.Plan || root.plan || root;
            if (executionTime === null && typeof plan['Actual Total Time'] === 'number') {
                executionTime = plan['Actual Total Time'];
            }
            if (planningTime === null && typeof plan['Planning Time'] === 'number') {
                planningTime = plan['Planning Time'];
            }

            Logger.debug('Parser', 'extractTimingFromRawJson result', {
                executionTime,
                planningTime,
                rootKeys: Object.keys(root),
                planKeys: plan ? Object.keys(plan).slice(0, 10) : []
            });

            return { executionTime, planningTime };
        } catch (err) {
            Logger.warn('Parser', 'Failed to extract timing from raw JSON', { error: (err as Error).message });
            return { executionTime: null, planningTime: null };
        }
    }

    /**
     * Extract the actual plan tree from various possible structures
     */
    private extractPlanTree(data: any): any {
        if (!data) return null;

        // PEV2 IPlan structure: { content: { Plan: {...} } }
        if (data.content?.Plan) {
            return data.content.Plan;
        }

        // Direct Plan property (standard EXPLAIN JSON)
        if (data.Plan) {
            return data.Plan;
        }

        // Lowercase plan property
        if (data.plan) {
            return this.extractPlanTree(data.plan);
        }

        // Array format: [{ Plan: {...} }]
        if (Array.isArray(data) && data.length > 0) {
            return this.extractPlanTree(data[0]);
        }

        // Direct node (has Node Type)
        if (data['Node Type']) {
            return data;
        }

        return data;
    }

    /**
     * Extract execution time from various plan formats
     */
    private extractExecutionTime(data: any): number | null {
        if (!data) return null;

        // Direct property
        if (typeof data['Execution Time'] === 'number') {
            return data['Execution Time'];
        }

        // PEV2 content structure
        if (data.content?.['Execution Time'] !== undefined) {
            return data.content['Execution Time'];
        }

        // From Plan's Actual Total Time (root node)
        const plan = this.extractPlanTree(data);
        if (plan?.['Actual Total Time'] !== undefined) {
            return plan['Actual Total Time'];
        }

        // Array format
        if (Array.isArray(data) && data[0]?.['Execution Time'] !== undefined) {
            return data[0]['Execution Time'];
        }

        return null;
    }

    /**
     * Extract planning time from various plan formats
     * PostgreSQL EXPLAIN JSON can have Planning Time at root level OR inside Plan object
     */
    private extractPlanningTime(data: any): number | null {
        if (!data) return null;

        // Direct property at root level (standard format)
        if (typeof data['Planning Time'] === 'number') {
            return data['Planning Time'];
        }

        // PEV2 content structure
        if (typeof data.content?.['Planning Time'] === 'number') {
            return data.content['Planning Time'];
        }

        // Inside Plan object (some EXPLAIN formats)
        if (typeof data.Plan?.['Planning Time'] === 'number') {
            return data.Plan['Planning Time'];
        }

        // Inside content.Plan (PEV2 with nested Plan)
        if (typeof data.content?.Plan?.['Planning Time'] === 'number') {
            return data.content.Plan['Planning Time'];
        }

        // Array format
        if (Array.isArray(data)) {
            if (typeof data[0]?.['Planning Time'] === 'number') {
                return data[0]['Planning Time'];
            }
            if (typeof data[0]?.Plan?.['Planning Time'] === 'number') {
                return data[0].Plan['Planning Time'];
            }
        }

        return null;
    }

    private parseWithWorker(text: string, timeoutMs: number): Promise<any> {
        return new Promise((resolve, reject) => {
            const workerUrl = new URL('../../workers/explainParser.worker.ts', import.meta.url);
            Logger.debug('Parser', 'Initializing Web Worker', { url: workerUrl.toString() });

            const worker = new Worker(workerUrl);

            const timer = setTimeout(() => {
                Logger.error('Parser', 'Worker parsing timed out', { timeoutMs });
                worker.terminate();
                reject(new Error('Timeout'));
            }, timeoutMs);

            worker.onmessage = (e) => {
                clearTimeout(timer);
                worker.terminate();
                if (e.data.type === 'result') {
                    if (e.data.payload.ok) {
                        resolve(e.data.payload);
                    } else {
                        Logger.error('Parser', 'Worker reported parsing error', { error: e.data.payload.error });
                        reject(new Error(e.data.payload.error));
                    }
                } else {
                    Logger.error('Parser', 'Worker sent unexpected message type', { type: e.data.type });
                    reject(new Error(e.data.payload));
                }
            };

            worker.onerror = (e) => {
                clearTimeout(timer);
                worker.terminate();
                Logger.error('Parser', 'Web Worker crash/error', { error: e.message });
                reject(new Error('Worker error'));
            };

            worker.postMessage(text);
        });
    }

    private fallbackParse(text: string, startTime: number): ParserResult {
        Logger.info('Parser', 'Executing fallback parser');

        // Try JSON parse with multiple format support
        const jsonResult = this.tryJsonParse(text);
        if (jsonResult) {
            Logger.info('Parser', 'Fallback JSON parse successful');
            return {
                source: 'fallback',
                plan: jsonResult.plan,
                analysisTimeMs: performance.now() - startTime,
                executionTimeMs: jsonResult.executionTime,
                planningTimeMs: jsonResult.planningTime
            };
        }

        // Try text format parsing
        const textResult = this.tryTextParse(text);
        if (textResult) {
            Logger.info('Parser', 'Fallback text parse successful', {
                executionTime: textResult.executionTime,
                planningTime: textResult.planningTime
            });
            return {
                source: 'fallback',
                plan: textResult.plan,
                analysisTimeMs: performance.now() - startTime,
                executionTimeMs: textResult.executionTime,
                planningTimeMs: textResult.planningTime
            };
        }

        Logger.warn('Parser', 'All parsing methods failed');
        return {
            source: 'fallback',
            plan: {
                "Node Type": "Parse Error",
                "Description": "Unable to parse the input. Please ensure it's valid EXPLAIN output."
            },
            analysisTimeMs: performance.now() - startTime,
            executionTimeMs: null,
            planningTimeMs: null
        };
    }

    /**
     * Attempt to parse as JSON with support for multiple formats
     */
    private tryJsonParse(text: string): { plan: any; executionTime: number | null; planningTime: number | null } | null {
        // Clean up common issues
        let cleaned = text.trim();
        
        // Remove QUERY PLAN header if present
        cleaned = cleaned.replace(/^\s*QUERY PLAN\s*[-=]*\s*\n/im, '');
        
        // Remove row count footer
        cleaned = cleaned.replace(/\n?\s*\(\d+\s+rows?\)\s*$/i, '');
        
        // Handle pgAdmin double quotes
        cleaned = cleaned.replace(/""/g, '"');

        // Try to find JSON array or object
        const jsonMatch = cleaned.match(/[\[\{][\s\S]*[\]\}]/);
        if (!jsonMatch) return null;

        try {
            const data = JSON.parse(jsonMatch[0]);
            
            // Handle array format [{ "Plan": {...} }]
            const root = Array.isArray(data) ? data[0] : data;
            
            if (!root) return null;

            // Extract plan tree
            let plan = null;
            if (root.Plan) {
                plan = root.Plan;
            } else if (root.plan) {
                plan = root.plan;
            } else if (root['Node Type']) {
                plan = root;
            }

            if (!plan) return null;

            // Planning Time and Execution Time can be at root OR inside Plan
            const planningTime = root['Planning Time'] ?? plan['Planning Time'] ?? null;
            const executionTime = root['Execution Time'] ?? plan['Actual Total Time'] ?? null;
            
            return {
                plan,
                executionTime,
                planningTime
            };
        } catch {
            return null;
        }
    }

    /**
     * Parse text format EXPLAIN output
     */
    private tryTextParse(text: string): { plan: any; executionTime: number | null; planningTime: number | null } | null {
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length === 0) return null;

        // Check if it looks like text format EXPLAIN
        const nodePattern = /^\s*(?:->\s*)?([A-Z][a-zA-Z\s]+)(?:\s+on\s+|\s+using\s+|\s*\()/i;
        const hasNodes = lines.some(l => nodePattern.test(l));
        
        if (!hasNodes) return null;

        // Extract Planning Time and Execution Time from text format
        // Format: "Planning Time: 12.450 ms" or "Execution Time: 8560.125 ms"
        let planningTime: number | null = null;
        let executionTime: number | null = null;
        
        for (const line of lines) {
            const planningMatch = line.match(/^\s*Planning Time:\s*([\d.]+)\s*ms/i);
            if (planningMatch) {
                planningTime = parseFloat(planningMatch[1]);
            }
            
            const executionMatch = line.match(/^\s*Execution Time:\s*([\d.]+)\s*ms/i);
            if (executionMatch) {
                executionTime = parseFloat(executionMatch[1]);
            }
        }

        // Build a simplified tree from text format
        const plan = this.parseTextNode(lines, 0);
        
        return { plan, executionTime, planningTime };
    }

    /**
     * Parse a single node from text format
     */
    private parseTextNode(lines: string[], startIndex: number): any {
        if (startIndex >= lines.length) return null;

        const line = lines[startIndex];
        const indent = line.search(/\S/);
        
        // Extract node type
        const nodeMatch = line.match(/(?:->\s*)?([A-Z][a-zA-Z\s]+?)(?:\s+on\s+(\S+)|\s+using\s+(\S+)|\s*\()/i);
        
        const node: any = {
            "Node Type": nodeMatch ? nodeMatch[1].trim() : "Unknown",
        };

        // Extract relation name
        if (nodeMatch?.[2]) {
            node["Relation Name"] = nodeMatch[2];
        }
        
        // Extract index name
        if (nodeMatch?.[3]) {
            node["Index Name"] = nodeMatch[3];
        }

        // Extract cost/rows/time from parentheses
        const costMatch = line.match(/cost=(\d+\.?\d*)\.\.([\d.]+)\s+rows=(\d+)\s+width=(\d+)/i);
        if (costMatch) {
            node["Startup Cost"] = parseFloat(costMatch[1]);
            node["Total Cost"] = parseFloat(costMatch[2]);
            node["Plan Rows"] = parseInt(costMatch[3]);
            node["Plan Width"] = parseInt(costMatch[4]);
        }

        // Standard format: actual time=X..Y rows=N loops=M
        const actualMatch = line.match(/actual time=([\d.]+)\.\.([\d.]+)\s+rows=(\d+)\s+loops=(\d+)/i);
        if (actualMatch) {
            node["Actual Startup Time"] = parseFloat(actualMatch[1]);
            node["Actual Total Time"] = parseFloat(actualMatch[2]);
            node["Actual Rows"] = parseInt(actualMatch[3]);
            node["Actual Loops"] = parseInt(actualMatch[4]);
        } else {
            // Abbreviated format: actual time... rows=N loops=M (or with custom annotations)
            const abbreviatedMatch = line.match(/actual time[^)]*rows=(\d+)\s+loops=(\d+)/i);
            if (abbreviatedMatch) {
                node["Actual Rows"] = parseInt(abbreviatedMatch[1]);
                node["Actual Loops"] = parseInt(abbreviatedMatch[2]);
            }
            
            // Try to extract time from annotations like [EXECUTED - 8.4s]
            const annotationTimeMatch = line.match(/\[EXECUTED\s*-\s*([\d.]+)s\]/i);
            if (annotationTimeMatch) {
                node["Actual Total Time"] = parseFloat(annotationTimeMatch[1]) * 1000; // Convert to ms
            }
        }

        // Check for "never executed"
        if (line.includes('never executed')) {
            node["Actual Rows"] = 0;
            node["Actual Loops"] = 0;
        }

        // Parse additional properties from subsequent lines
        let i = startIndex + 1;
        while (i < lines.length) {
            const nextLine = lines[i];
            const nextIndent = nextLine.search(/\S/);
            
            // If we hit a child node (starts with ->) or same/lower indent, stop
            if (nextLine.trim().startsWith('->') || nextIndent <= indent) {
                break;
            }

            // Parse property lines
            this.parsePropertyLine(nextLine, node);
            i++;
        }

        // Find and parse children
        const children: any[] = [];
        while (i < lines.length) {
            const nextLine = lines[i];
            const nextIndent = nextLine.search(/\S/);
            
            if (nextIndent <= indent && !nextLine.trim().startsWith('->')) {
                break;
            }

            if (nextLine.trim().startsWith('->') || nextIndent > indent) {
                const child = this.parseTextNode(lines, i);
                if (child) {
                    children.push(child);
                    // Skip processed lines
                    i = this.findNextSiblingIndex(lines, i, nextIndent);
                    continue;
                }
            }
            i++;
        }

        if (children.length > 0) {
            node["Plans"] = children;
        }

        // Continue parsing property lines after children (for Triggers section)
        // Triggers appear after Plans in text format
        while (i < lines.length) {
            const nextLine = lines[i];
            const nextIndent = nextLine.search(/\S/);
            
            // Stop if we hit lower indent (back to parent level)
            if (nextIndent < indent) {
                break;
            }
            
            // Skip "Triggers:" header line
            if (nextLine.trim() === 'Triggers:') {
                i++;
                continue;
            }
            
            // Parse trigger and other property lines
            this.parsePropertyLine(nextLine, node);
            i++;
        }

        return node;
    }

    private parsePropertyLine(line: string, node: any): void {
        const trimmed = line.trim();
        
        // Filter
        const filterMatch = trimmed.match(/^Filter:\s*(.+)$/i);
        if (filterMatch) {
            node["Filter"] = filterMatch[1];
            return;
        }

        // Rows Removed by Filter
        const rowsRemovedMatch = trimmed.match(/^Rows Removed by Filter:\s*(\d+)/i);
        if (rowsRemovedMatch) {
            node["Rows Removed by Filter"] = parseInt(rowsRemovedMatch[1]);
            return;
        }

        // Sort Key
        const sortKeyMatch = trimmed.match(/^Sort Key:\s*(.+)$/i);
        if (sortKeyMatch) {
            node["Sort Key"] = sortKeyMatch[1].split(',').map(s => s.trim());
            return;
        }

        // Sort Method
        const sortMethodMatch = trimmed.match(/^Sort Method:\s*([^\s]+)(?:\s+Memory:\s*(\d+)kB)?/i);
        if (sortMethodMatch) {
            node["Sort Method"] = sortMethodMatch[1];
            if (sortMethodMatch[2]) {
                node["Sort Space Used"] = parseInt(sortMethodMatch[2]);
                node["Sort Space Type"] = "Memory";
            }
            return;
        }

        // External sort
        const extSortMatch = trimmed.match(/^Sort Method:\s*(.+?)\s+Disk:\s*(\d+)kB/i);
        if (extSortMatch) {
            node["Sort Method"] = extSortMatch[1];
            node["Sort Space Used"] = parseInt(extSortMatch[2]);
            node["Sort Space Type"] = "Disk";
            return;
        }

        // Hash Buckets/Batches
        const hashMatch = trimmed.match(/^(?:Buckets|Batches|Memory Usage):\s*(\d+)/i);
        if (hashMatch) {
            const key = trimmed.split(':')[0].trim();
            node[key] = parseInt(hashMatch[1]);
            return;
        }

        // Heap Fetches
        const heapMatch = trimmed.match(/^Heap Fetches:\s*(\d+)/i);
        if (heapMatch) {
            node["Heap Fetches"] = parseInt(heapMatch[1]);
            return;
        }

        // Workers
        const workersMatch = trimmed.match(/^Workers\s+(Planned|Launched):\s*(\d+)/i);
        if (workersMatch) {
            node[`Workers ${workersMatch[1]}`] = parseInt(workersMatch[2]);
            return;
        }

        // Buffers
        const buffersMatch = trimmed.match(/^Buffers:\s*(.+)$/i);
        if (buffersMatch) {
            this.parseBuffers(buffersMatch[1], node);
            return;
        }

        // Index Cond / Recheck Cond / Join Filter
        const condMatch = trimmed.match(/^(Index Cond|Recheck Cond|Join Filter|Hash Cond):\s*(.+)$/i);
        if (condMatch) {
            node[condMatch[1]] = condMatch[2];
            return;
        }

        // Rows Removed by Index Recheck
        const recheckMatch = trimmed.match(/^Rows Removed by Index Recheck:\s*(\d+)/i);
        if (recheckMatch) {
            node["Rows Removed by Index Recheck"] = parseInt(recheckMatch[1]);
            return;
        }

        // Rows Removed by Join Filter
        const joinFilterMatch = trimmed.match(/^Rows Removed by Join Filter:\s*(\d+)/i);
        if (joinFilterMatch) {
            node["Rows Removed by Join Filter"] = parseInt(joinFilterMatch[1]);
            return;
        }

        // Trigger line format: "trigger_name: time=XXX.XXX calls=N"
        const triggerMatch = trimmed.match(/^(\w+):\s*time=([\d.]+)\s+calls=(\d+)/i);
        if (triggerMatch) {
            if (!node["Triggers"]) {
                node["Triggers"] = [];
            }
            node["Triggers"].push({
                "Trigger Name": triggerMatch[1],
                "Time": parseFloat(triggerMatch[2]),
                "Calls": parseInt(triggerMatch[3])
            });
            return;
        }
    }

    private parseBuffers(bufferStr: string, node: any): void {
        const sharedMatch = bufferStr.match(/shared\s+(?:hit=(\d+))?\s*(?:read=(\d+))?\s*(?:dirtied=(\d+))?\s*(?:written=(\d+))?/i);
        if (sharedMatch) {
            if (sharedMatch[1]) node["Shared Hit Blocks"] = parseInt(sharedMatch[1]);
            if (sharedMatch[2]) node["Shared Read Blocks"] = parseInt(sharedMatch[2]);
            if (sharedMatch[3]) node["Shared Dirtied Blocks"] = parseInt(sharedMatch[3]);
            if (sharedMatch[4]) node["Shared Written Blocks"] = parseInt(sharedMatch[4]);
        }

        const tempMatch = bufferStr.match(/temp\s+(?:read=(\d+))?\s*(?:written=(\d+))?/i);
        if (tempMatch) {
            if (tempMatch[1]) node["Temp Read Blocks"] = parseInt(tempMatch[1]);
            if (tempMatch[2]) node["Temp Written Blocks"] = parseInt(tempMatch[2]);
        }
    }

    private findNextSiblingIndex(lines: string[], currentIndex: number, currentIndent: number): number {
        for (let i = currentIndex + 1; i < lines.length; i++) {
            const line = lines[i];
            const indent = line.search(/\S/);
            if (indent <= currentIndent || line.trim().startsWith('->')) {
                return i;
            }
        }
        return lines.length;
    }

    /**
     * Extract triggers from TEXT format EXPLAIN output
     * Format: "trigger_name: time=XXX.XXX calls=N"
     */
    private extractTriggersFromText(text: string): any[] {
        const triggers: any[] = [];
        const lines = text.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            // Match: trigger_name: time=XXX.XXX calls=N
            const match = trimmed.match(/^(\w+):\s*time=([\d.]+)\s+calls=(\d+)/i);
            if (match) {
                triggers.push({
                    "Trigger Name": match[1],
                    "Time": parseFloat(match[2]),
                    "Calls": parseInt(match[3])
                });
            }
        }
        
        return triggers;
    }

    /**
     * Extract JIT information from TEXT format EXPLAIN output
     * Format:
     *   JIT:
     *     Functions: 12
     *     Options: Inlining true, Optimization true, Expressions true, Deforming true
     *     Timing: Generation 45.230 ms, Inlining 125.450 ms, Optimization 450.125 ms, Emission 89.230 ms, Total 710.035 ms
     */
    private extractJITFromText(text: string): any | null {
        const lines = text.split('\n');
        let inJIT = false;
        const jit: any = {};
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            if (trimmed === 'JIT:') {
                inJIT = true;
                continue;
            }
            
            if (!inJIT) continue;
            
            // Exit JIT section on non-indented line or new section
            if (!line.match(/^\s+/) && trimmed !== '') {
                break;
            }
            
            // Functions: N
            const functionsMatch = trimmed.match(/^Functions:\s*(\d+)/i);
            if (functionsMatch) {
                jit['Functions'] = parseInt(functionsMatch[1]);
                continue;
            }
            
            // Options: Inlining true, Optimization true, ...
            const optionsMatch = trimmed.match(/^Options:\s*(.+)/i);
            if (optionsMatch) {
                jit['Options'] = optionsMatch[1];
                continue;
            }
            
            // Timing: Generation X ms, Inlining X ms, Optimization X ms, Emission X ms, Total X ms
            const timingMatch = trimmed.match(/^Timing:\s*Generation\s+([\d.]+)\s*ms.*Inlining\s+([\d.]+)\s*ms.*Optimization\s+([\d.]+)\s*ms.*Emission\s+([\d.]+)\s*ms.*Total\s+([\d.]+)\s*ms/i);
            if (timingMatch) {
                jit['Timing'] = {
                    'Generation': parseFloat(timingMatch[1]),
                    'Inlining': parseFloat(timingMatch[2]),
                    'Optimization': parseFloat(timingMatch[3]),
                    'Emission': parseFloat(timingMatch[4]),
                    'Total': parseFloat(timingMatch[5])
                };
                continue;
            }
        }
        
        // Only return if we found meaningful JIT data
        if (jit['Functions'] || jit['Timing']) {
            return jit;
        }
        return null;
    }
}
