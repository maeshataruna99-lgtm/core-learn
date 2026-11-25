import { isValidProgressEntry, migrate } from './storage.ts';
import type { Store } from './types.ts';

export function exportStore(store: Store, now: string): string {
  return JSON.stringify({ ...store, exportedAt: now }, null, 2);
}

export type ImportResult =
  | { ok: true; store: Store; cardCount: number }
  | { ok: false; error: string };

export function parseImport(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Not valid JSON' };
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'Unsupported file or version' };
  }
  const o = raw as Record<string, unknown>;
  if (o.version !== 1 || !o.progress || typeof o.progress !== 'object' || Array.isArray(o.progress)) {
    return { ok: false, error: 'Unsupported file or version' };
  }
  const entries = Object.values(o.progress as Record<string, unknown>);
  if (!entries.every(isValidProgressEntry)) {
    return { ok: false, error: 'Progress data is malformed' };
  }
  const store = migrate(raw);
  if (!store) return { ok: false, error: 'Progress data is malformed' };
  return { ok: true, store, cardCount: entries.length };
}
