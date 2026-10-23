import { migrate } from './storage.ts';
import type { Store } from './types.ts';

export function exportStore(store: Store, now: string): string {
  return JSON.stringify({ ...store, exportedAt: now }, null, 2);
}

export type ImportResult =
  | { ok: true; store: Store; cardCount: number }
  | { ok: false; error: string };

const isProgress = (p: unknown): boolean => {
  if (!p || typeof p !== 'object') return false;
  const x = p as Record<string, unknown>;
  return (
    typeof x.box === 'number' && x.box >= 1 && x.box <= 5 &&
    typeof x.dueAt === 'string' && typeof x.right === 'number' &&
    typeof x.wrong === 'number' && typeof x.lastSeenAt === 'string'
  );
};

export function parseImport(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Not valid JSON' };
  }
  const store = migrate(raw);
  if (!store) return { ok: false, error: 'Unsupported file or version' };
  const entries = Object.values(store.progress);
  if (!entries.every(isProgress)) return { ok: false, error: 'Progress data is malformed' };
  return { ok: true, store, cardCount: entries.length };
}
