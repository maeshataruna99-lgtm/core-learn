import { isDue } from './leitner.ts';
import type { Card, CardType, Level, ProgressMap, Track } from './types.ts';
import { LEVELS } from './types.ts';

export interface PracticeFilter {
  tracks?: Track[];
  levels?: Level[];
  types?: CardType[];
}

export function filterCards(cards: Card[], f: PracticeFilter): Card[] {
  return cards.filter(
    (c) =>
      (!f.tracks?.length || f.tracks.includes(c.track)) &&
      (!f.levels?.length || f.levels.includes(c.level)) &&
      (!f.types?.length || f.types.includes(c.type)),
  );
}

const levelRank = (l: Level) => LEVELS.indexOf(l);

/** Learn: beginner to advanced, then the authored teaching order, then flashcards before quiz cards, stable by id. */
export function learnOrder(cards: Card[]): Card[] {
  return [...cards].sort(
    (a, b) =>
      levelRank(a.level) - levelRank(b.level) ||
      (a.order ?? 1000) - (b.order ?? 1000) ||
      Number(b.type === 'flashcard') - Number(a.type === 'flashcard') ||
      a.id.localeCompare(b.id),
  );
}

/** Revise: due (or unseen) first, then most wrong, then lowest box. */
export function reviseOrder(cards: Card[], progress: ProgressMap, now: string): Card[] {
  const key = (c: Card) => {
    const p = progress[c.id];
    return [isDue(p, now) ? 0 : 1, -(p?.wrong ?? 0), p?.box ?? 0] as const;
  };
  return [...cards].sort((a, b) => {
    const [a0, a1, a2] = key(a);
    const [b0, b1, b2] = key(b);
    return a0 - b0 || a1 - b1 || a2 - b2 || a.id.localeCompare(b.id);
  });
}

export function seededShuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = seed >>> 0;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Interview: mixed tracks, shuffled, quiz-type cards only. */
export function interviewSet(cards: Card[], length: number, seed: number): Card[] {
  const quiz = cards.filter((c) => c.type !== 'flashcard');
  return seededShuffle(quiz, seed).slice(0, length);
}
