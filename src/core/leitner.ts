import type { Box, CardProgress } from './types.ts';

export const BOX_DAYS: Record<Box, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
const DAY_MS = 86_400_000;

export function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * DAY_MS).toISOString();
}

export function nextBox(box: Box, correct: boolean): Box {
  if (!correct) return 1;
  return Math.min(5, box + 1) as Box;
}

export function review(prev: CardProgress | undefined, correct: boolean, now: string): CardProgress {
  const box = nextBox(prev?.box ?? 1, correct);
  return {
    box,
    dueAt: addDays(now, BOX_DAYS[box]),
    right: (prev?.right ?? 0) + (correct ? 1 : 0),
    wrong: (prev?.wrong ?? 0) + (correct ? 0 : 1),
    lastSeenAt: now,
  };
}

/** Mastery 0..1 derived from the box; unseen cards are 0. */
export function mastery(p: CardProgress | undefined): number {
  return p ? p.box / 5 : 0;
}

export function isDue(p: CardProgress | undefined, now: string): boolean {
  return !p || p.dueAt <= now;
}

/** Format a Date into the user's local calendar day (YYYY-MM-DD). */
export function localDay(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

const dayBefore = (d: string): string | null => {
  if (!DAY_RE.test(d)) return null;
  const ms = Date.parse(`${d}T00:00:00Z`);
  if (Number.isNaN(ms)) return null;
  return new Date(ms - DAY_MS).toISOString().slice(0, 10);
};

/** Consecutive days (ending today or yesterday) with at least one review. Days are YYYY-MM-DD. */
export function streak(seenDays: string[], today: string): number {
  if (!DAY_RE.test(today)) return 0;
  const days = new Set(seenDays.filter((d) => DAY_RE.test(d)));
  let cursor: string | null = days.has(today) ? today : dayBefore(today);
  let n = 0;
  while (cursor && days.has(cursor)) {
    n++;
    cursor = dayBefore(cursor);
  }
  return n;
}
