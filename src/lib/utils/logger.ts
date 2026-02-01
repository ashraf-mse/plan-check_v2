export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface LogEntry {
    timestamp: number;
    level: LogLevel;
    module: string;
    message: string;
    data?: any;
}

class Logger {
    private static entries: LogEntry[] = [];
    private static maxEntries = 1000;
    private static listeners: ((entry: LogEntry) => void)[] = [];

    static log(level: LogLevel, module: string, message: string, data?: any) {
        const entry: LogEntry = {
            timestamp: Date.now(),
            level,
            module,
            message,
            data
        };

        this.entries.push(entry);
        if (this.entries.length > this.maxEntries) {
            this.entries.shift();
        }

        // Always log to console for dev tools visibility
        const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
        console[consoleMethod](`[${new Date(entry.timestamp).toISOString()}] [${level}] [${module}] ${message}`, data || '');

        // Proxy to server CLI in development
        if (process.env.NODE_ENV === 'development') {
            fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry),
            }).catch(() => { /* mute proxy failures to avoid feedback loops */ });
        }

        this.listeners.forEach(l => l(entry));
    }

    static info(module: string, message: string, data?: any) { this.log('INFO', module, message, data); }
    static warn(module: string, message: string, data?: any) { this.log('WARN', module, message, data); }
    static error(module: string, message: string, data?: any) { this.log('ERROR', module, message, data); }
    static debug(module: string, message: string, data?: any) { this.log('DEBUG', module, message, data); }

    static subscribe(listener: (entry: LogEntry) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    static getEntries() {
        return [...this.entries];
    }

    static clear() {
        this.entries = [];
    }
}

export default Logger;
