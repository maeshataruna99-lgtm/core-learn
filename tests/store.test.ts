// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { useStore } from '../src/composables/useStore.ts';
import { overallMasteryPct, trackSummaries } from '../src/core/curriculum.ts';
import { parseImport } from '../src/core/exportImport.ts';
import { loadStore, migrate, STORE_KEY } from '../src/core/storage.ts';
import type { Card, ProgressMap } from '../src/core/types.ts';

describe('Fase 1: storage validation, streak persistence, and raw mastery aggregation', () => {
  beforeEach(() => {
    localStorage.clear();
    const { reset, refreshClock } = useStore();
    reset();
    refreshClock(new Date('2026-11-25T10:00:00.000Z'));
  });

  it('D-03: rejects malformed progress entries, float boxes, arrays, and invalid dates in migrate/parseImport', () => {
    const badPayloads = [
      '{"version":1,"progress":[]}',
      '{"version":1,"progress":{"a":{"box":2.5,"dueAt":"2026-11-26T00:00:00.000Z","right":1,"wrong":0,"lastSeenAt":"2026-11-25T00:00:00.000Z"}}}',
      '{"version":1,"progress":{"a":{"box":1,"dueAt":"not-a-date","right":1,"wrong":0,"lastSeenAt":"2026-11-25T00:00:00.000Z"}}}',
      '{"version":1,"progress":{"a":{"box":1,"dueAt":"2026-11-26T00:00:00.000Z","right":-1,"wrong":0,"lastSeenAt":"2026-11-25T00:00:00.000Z"}}}',
      '{"version":1,"progress":{"a":{"box":1,"dueAt":"2026-11-26T00:00:00.000Z","right":1,"wrong":0}}}',
    ];
    for (const raw of badPayloads) {
      expect(parseImport(raw).ok).toBe(false);
      expect(migrate(JSON.parse(raw))).toBeNull();
    }

    // Corrupted localStorage backs up safely instead of crashing
    const m = new Map<string, string>([[STORE_KEY, badPayloads[4]!]]);
    const kv = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
    const recovered = loadStore(kv, 999);
    expect(recovered.progress).toEqual({});
    expect(m.get(`${STORE_KEY}:backup:999`)).toBe(badPayloads[4]);
  });

  it('D-03: sanitizes corrupted settings fields safely on migrate', () => {
    const res = migrate({
      version: 1,
      progress: {},
      settings: { theme: 'neon', language: 'fr', quizLength: -5, timer: 'yes' },
    });
    expect(res).not.toBeNull();
    expect(res!.settings).toEqual({ theme: 'system', language: 'en', quizLength: 10, timer: false });
  });

  it('D-03: property test — arbitrary malformed JSON never crashes migrate or parseImport', () => {
    fc.assert(
      fc.property(fc.jsonValue(), (val) => {
        const migrated = migrate(val);
        const imported = parseImport(JSON.stringify(val));
        return (migrated === null || typeof migrated.version === 'number') && typeof imported.ok === 'boolean';
      }),
    );
  });

  it('D-04: preserves multi-day streak when re-reviewing the exact same card on consecutive days', () => {
    const { cards, answer, streak, store } = useStore();
    const card = cards[0]!;
    answer(card, true, new Date(2026, 10, 23, 9, 0, 0));
    expect(streak.value).toBe(1);
    answer(card, true, new Date(2026, 10, 24, 9, 0, 0));
    expect(streak.value).toBe(2);
    answer(card, false, new Date(2026, 10, 25, 9, 0, 0));
    expect(streak.value).toBe(3);
    expect(store.activityDays).toEqual(['2026-11-23', '2026-11-24', '2026-11-25']);
  });

  it('D-05a: computes track and overall mastery from raw card mastery without double/triple rounding drift', () => {
    const mk = (id: string, topic: string): Card => ({
      id,
      track: 'vue3',
      topic,
      level: 'beginner',
      tags: [],
      type: 'flashcard',
      front: 'f',
      back: 'b',
      explanation: 'e',
    });
    // 3 topics of 3 cards each; 1 card at box 1 (mastery 0.2) per topic -> topic pct = Math.round(0.2/3*100) = 7%.
    // True overall/track mastery = 0.6 / 9 = 6.666% -> Math.round = 7%, while with 1 card at box 2 (0.4) in 1 of 3 topics:
    // Better drift case: 5 topics of 7 cards each, 1 card at box 1 (0.2) in each topic:
    // topic pct = round(0.2/7*100) = round(2.857) = 3%; weighted rounded = 3%
    // 10 topics of 3 cards each, 1 card at box 1 (0.2) in 1 topic? Let's construct exact drift:
    // 2 topics of 3 cards: topic A has 1 card box 1 (0.2/3 = 6.67% -> 7%), topic B has 1 card box 1 (6.67% -> 7%).
    // Actually 3 topics of 6 cards, each with 1 card box 1 (0.2/6 = 3.33% -> 3%) and 1 card box 2 (0.4/6 = 6.67% -> 7%):
    // Let's use 2 topics of 41 cards? No, simpler: 3 topics of 3 cards each, 1 card box 1 (0.2) + 1 card box 1 (0.2) -> 0.4/3 = 13.33% -> 13%
    // 3 topics * (0.4) = 1.2 / 9 = 13.33% -> 13%.
    // Drift case: 4 topics of 3 cards each, each has 2 cards at box 1? Wait:
    // 3 topics of 3 cards: each topic has 1 card at box 2 (0.4 / 3 = 13.33% -> 13%) -> total 1.2/9 = 13.33%.
    // Take 2 topics: T1 has 3 cards, 1 at box 2 (0.4/3 = 13.33% -> 13%); T2 has 3 cards, 1 at box 2 (13.33% -> 13%).
    // Take 5 topics of 3 cards each, 1 card at box 1 (0.2/3 = 6.67% -> 7%) in each? 1.0/15 = 6.67% -> 7%.
    // Exact drift case: 2 topics of 7 cards each, 1 card at box 1 (0.2/7 = 2.86% -> 3%)? Wait: 0.4/14 = 2.86% -> 3%.
    // Different sizes! T1 has 2 cards, 0 seen (0%); T2 has 3 cards, 1 box 1 (0.2/3=6.67%->7%), T3 has 3 cards, 1 box 1 (6.67%->7%), T4 has 3 cards, 1 box 1 (6.67%->7%).
    // Raw sum = 0.6 / 11 = 5.4545% -> 5%. Rounded weighted = (0 + 7*3 + 7*3 + 7*3)/11 = 63/11 = 5.727% -> 6%!
    const cards: Card[] = [
      mk('t1/1', 't1'), mk('t1/2', 't1'),
      mk('t2/1', 't2'), mk('t2/2', 't2'), mk('t2/3', 't2'),
      mk('t3/1', 't3'), mk('t3/2', 't3'), mk('t3/3', 't3'),
      mk('t4/1', 't4'), mk('t4/2', 't4'), mk('t4/3', 't4'),
    ];
    const progress: ProgressMap = {
      't2/1': { box: 1, dueAt: '2026-11-26T00:00:00.000Z', right: 0, wrong: 1, lastSeenAt: '2026-11-25T00:00:00.000Z' },
      't3/1': { box: 1, dueAt: '2026-11-26T00:00:00.000Z', right: 0, wrong: 1, lastSeenAt: '2026-11-25T00:00:00.000Z' },
      't4/1': { box: 1, dueAt: '2026-11-26T00:00:00.000Z', right: 0, wrong: 1, lastSeenAt: '2026-11-25T00:00:00.000Z' },
    };
    const [track] = trackSummaries(cards, progress, '2026-11-25T00:00:00.000Z');
    expect(track!.masteryPct).toBe(5);
    expect(overallMasteryPct(cards, progress)).toBe(5);
  });
});
