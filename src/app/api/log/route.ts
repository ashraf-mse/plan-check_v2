import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // Disable logging in production for security
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ ok: true });
    }

    try {
        const entry = await request.json();
        const { level, module, message, timestamp } = entry;

        const time = new Date(timestamp).toLocaleTimeString();
        const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[36m';
        const reset = '\x1b[0m';

        // Print to server console (CLI)
        console.log(`${color}[${time}] [${level}] [${module}]${reset} ${message}`);

        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
