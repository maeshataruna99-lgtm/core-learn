import { DEFAULT_SETTINGS } from './types.ts';
import type { CardProgress, ProgressMap, Settings, Store } from './types.ts';

export const STORE_KEY = 'code-learn:v1';

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const THEMES: ReadonlySet<string> = new Set(['system', 'light', 'dark']);
const LANGUAGES: ReadonlySet<string> = new Set(['en', 'id']);

export function emptyStore(): Store {
  return { version: 1, progress: {}, settings: { ...DEFAULT_SETTINGS }, understood: {}, activityDays: [] };
}

export function isValidIsoDate(v: unknown): v is string {
  return typeof v === 'string' && v.length >= 10 && !Number.isNaN(Date.parse(v));
}

export function isValidProgressEntry(p: unknown): p is CardProgress {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return false;
  const x = p as Record<string, unknown>;
  return (
    typeof x.box === 'number' &&
    Number.isInteger(x.box) &&
    x.box >= 1 &&
    x.box <= 5 &&
    isValidIsoDate(x.dueAt) &&
    typeof x.right === 'number' &&
    Number.isInteger(x.right) &&
    x.right >= 0 &&
    typeof x.wrong === 'number' &&
    Number.isInteger(x.wrong) &&
    x.wrong >= 0 &&
    isValidIsoDate(x.lastSeenAt)
  );
}

export function sanitizeSettings(raw: unknown): Settings {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...DEFAULT_SETTINGS };
  const s = raw as Record<string, unknown>;
  return {
    theme: typeof s.theme === 'string' && THEMES.has(s.theme) ? (s.theme as Settings['theme']) : DEFAULT_SETTINGS.theme,
    language:
      typeof s.language === 'string' && LANGUAGES.has(s.language)
        ? (s.language as Settings['language'])
        : DEFAULT_SETTINGS.language,
    quizLength:
      typeof s.quizLength === 'number' && Number.isInteger(s.quizLength) && s.quizLength >= 1 && s.quizLength <= 200
        ? s.quizLength
        : DEFAULT_SETTINGS.quizLength,
    timer: typeof s.timer === 'boolean' ? s.timer : DEFAULT_SETTINGS.timer,
  };
}

/** Keep only string -> string entries so a hand-edited or older file cannot poison the store. */
function cleanUnderstood(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return Object.fromEntries(Object.entries(raw).filter(([, v]) => typeof v === 'string')) as Record<string, string>;
}

function cleanActivityDays(raw: unknown, progress: ProgressMap): string[] {
  if (Array.isArray(raw)) {
    const valid = raw.filter(
      (d): d is string => typeof d === 'string' && DAY_RE.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`)),
    );
    return [...new Set(valid)].sort();
  }
  if (raw === undefined) {
    const derived = Object.values(progress)
      .map((p) => p.lastSeenAt.slice(0, 10))
      .filter((d) => DAY_RE.test(d));
    return [...new Set(derived)].sort();
  }
  return [];
}

/** Upgrade stored shapes to the current Store. Returns null if unreadable or malformed. */
export function migrate(raw: unknown): Store | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (o.version === 1 && o.progress && typeof o.progress === 'object' && !Array.isArray(o.progress)) {
    const entries = Object.entries(o.progress as Record<string, unknown>);
    if (!entries.every(([, v]) => isValidProgressEntry(v))) return null;
    const progress = Object.fromEntries(entries) as ProgressMap;
    return {
      version: 1,
      progress,
      settings: sanitizeSettings(o.settings),
      understood: cleanUnderstood(o.understood),
      activityDays: cleanActivityDays(o.activityDays, progress),
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
