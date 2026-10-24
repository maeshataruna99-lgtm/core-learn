import { DEFAULT_SETTINGS } from './types.ts';
import type { ProgressMap, Settings, Store } from './types.ts';

export const STORE_KEY = 'code-learn:v1';

export function emptyStore(): Store {
  return { version: 1, progress: {}, settings: { ...DEFAULT_SETTINGS }, understood: {} };
}

/** Keep only string -> string entries so a hand-edited or older file cannot poison the store. */
function cleanUnderstood(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return Object.fromEntries(Object.entries(raw).filter(([, v]) => typeof v === 'string')) as Record<string, string>;
}

/** Upgrade stored shapes to the current Store. Returns null if unreadable. */
export function migrate(raw: unknown): Store | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (o.version === 1 && o.progress && typeof o.progress === 'object') {
    return {
      version: 1,
      progress: o.progress as ProgressMap,
      settings: { ...DEFAULT_SETTINGS, ...(o.settings as Partial<Settings>) },
      understood: cleanUnderstood(o.understood),
    };
  }
  return null;
}

export interface KV {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

/** An unreadable store is backed up under another key before reset. */
export function loadStore(kv: KV, now = Date.now()): Store {
  const text = kv.getItem(STORE_KEY);
  if (text === null) return emptyStore();
  try {
    const store = migrate(JSON.parse(text));
    if (store) return store;
  } catch {
    /* fall through to backup */
  }
  kv.setItem(`${STORE_KEY}:backup:${now}`, text);
  return emptyStore();
}

export function saveStore(kv: KV, store: Store): void {
  kv.setItem(STORE_KEY, JSON.stringify(store));
}

/** Drop progress for cards that no longer exist. */
export function pruneUnknown(progress: ProgressMap, ids: Set<string>): ProgressMap {
  return Object.fromEntries(Object.entries(progress).filter(([id]) => ids.has(id)));
}
