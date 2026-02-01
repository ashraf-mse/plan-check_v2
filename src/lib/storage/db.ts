import { openDB, IDBPDatabase } from 'idb';
import { AnalysisResult } from '@/lib/types/core';

const DB_NAME = 'plancheck_v2_db';
const STORE_NAME = 'analyses';
const DB_VERSION = 1;

export interface StoredAnalysis {
    id: string;
    timestamp: number;
    result: AnalysisResult;
    parsedPlan: any;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
    if (typeof window === 'undefined') return null;

    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            },
        });
    }
    return dbPromise;
}

export async function saveAnalysis(analysis: StoredAnalysis) {
    const db = await getDB();
    if (!db) return;
    await db.put(STORE_NAME, analysis);
}

export async function getHistory(): Promise<StoredAnalysis[]> {
    const db = await getDB();
    if (!db) return [];
    const history = await db.getAll(STORE_NAME);
    // Return sorted by timestamp descending
    return history.sort((a, b) => b.timestamp - a.timestamp);
}

export async function deleteAnalysis(id: string) {
    const db = await getDB();
    if (!db) return;
    await db.delete(STORE_NAME, id);
}

export async function clearHistory() {
    const db = await getDB();
    if (!db) return;
    await db.clear(STORE_NAME);
}
