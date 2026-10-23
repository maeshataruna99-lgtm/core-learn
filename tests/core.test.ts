import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { BOX_DAYS, isDue, nextBox, review, streak } from '../src/core/leitner.ts';
import { filterCards, interviewSet, learnOrder, reviseOrder } from '../src/core/selection.ts';
import { emptyStore, loadStore, migrate, pruneUnknown, STORE_KEY } from '../src/core/storage.ts';
import { exportStore, parseImport } from '../src/core/exportImport.ts';
import { isCorrect } from '../src/core/answers.ts';
import type { Box, Card, CardProgress, ProgressMap } from '../src/core/types.ts';

const NOW = '2026-10-23T08:00:00.000Z';
const box = fc.constantFrom<Box>(1, 2, 3, 4, 5);

const mk = (id: string, over: Partial<Card> = {}): Card =>
  ({
    id, track: 'vue3', topic: 't', level: 'beginner', tags: [], explanation: 'x',
    type: 'flashcard', front: 'f', back: 'b', ...over,
  }) as Card;

describe('leitner', () => {
  it('wrong answer always returns to box 1', () => {
    fc.assert(fc.property(box, (b) => nextBox(b, false) === 1));
  });
  it('correct answer moves up one box, capped at 5', () => {
    fc.assert(fc.property(box, (b) => nextBox(b, true) === Math.min(5, b + 1)));
  });
  it('box stays in 1..5 over any answer sequence', () => {
    fc.assert(
      fc.property(fc.array(fc.boolean()), (answers) => {
        let p: CardProgress | undefined;
        for (const a of answers) p = review(p, a, NOW);
        return !p || (p.box >= 1 && p.box <= 5 && p.right + p.wrong === answers.length);
      }),
    );
  });
  it('schedules dueAt by the box interval', () => {
    const p = review({ box: 2, dueAt: NOW, right: 1, wrong: 0, lastSeenAt: NOW }, true, NOW);
    expect(p.box).toBe(3);
    expect(new Date(p.dueAt).getTime() - new Date(NOW).getTime()).toBe(BOX_DAYS[3] * 86_400_000);
  });
  it('unseen cards are due; future ones are not', () => {
    expect(isDue(undefined, NOW)).toBe(true);
    expect(isDue({ box: 1, dueAt: '2027-01-01T00:00:00.000Z', right: 0, wrong: 0, lastSeenAt: NOW }, NOW)).toBe(false);
  });
});

describe('streak', () => {
  it('counts consecutive days ending today', () => {
    expect(streak(['2026-10-21', '2026-10-22', '2026-10-23'], '2026-10-23')).toBe(3);
  });
  it('survives a day not yet studied (ends yesterday)', () => {
    expect(streak(['2026-10-21', '2026-10-22'], '2026-10-23')).toBe(2);
  });
  it('breaks on a gap', () => {
    expect(streak(['2026-10-19', '2026-10-23'], '2026-10-23')).toBe(1);
    expect(streak(['2026-10-19'], '2026-10-23')).toBe(0);
  });
});

describe('selection', () => {
  const cards = [
    mk('a/1', { level: 'advanced' }),
    mk('a/2', { level: 'beginner', type: 'mcq', question: 'q', options: ['1', '2', '3', '4'], answerIndex: 0 } as Partial<Card>),
    mk('a/3', { level: 'beginner' }),
    mk('b/1', { track: 'security' }),
  ];
  it('filters by track, level and type', () => {
    expect(filterCards(cards, { tracks: ['security'] }).map((c) => c.id)).toEqual(['b/1']);
    expect(filterCards(cards, { types: ['mcq'] }).map((c) => c.id)).toEqual(['a/2']);
    expect(filterCards(cards, {})).toHaveLength(4);
  });
  it('learn order: level asc, flashcards first', () => {
    expect(learnOrder(cards).map((c) => c.id)).toEqual(['a/3', 'b/1', 'a/2', 'a/1']);
  });
  it('learn order honours an authored order within a level', () => {
    const seq = [mk('x/3', { order: 2 }), mk('x/2', { order: 1 }), mk('x/1')];
    expect(learnOrder(seq).map((c) => c.id)).toEqual(['x/2', 'x/3', 'x/1']);
  });
  it('revise order: due and weakest first', () => {
    const progress: ProgressMap = {
      'a/1': { box: 5, dueAt: '2027-01-01T00:00:00.000Z', right: 5, wrong: 0, lastSeenAt: NOW },
      'a/3': { box: 1, dueAt: '2026-01-01T00:00:00.000Z', right: 0, wrong: 4, lastSeenAt: NOW },
    };
    const ids = reviseOrder(cards, progress, NOW).map((c) => c.id);
    expect(ids[0]).toBe('a/3');
    expect(ids[ids.length - 1]).toBe('a/1');
  });
  it('interview set is quiz-only, bounded and deterministic per seed', () => {
    const quiz = Array.from({ length: 30 }, (_, i) =>
      mk(`q/${i}`, { type: 'mcq', question: 'q', options: ['1', '2', '3', '4'], answerIndex: 0 } as Partial<Card>));
    const set = interviewSet([...cards, ...quiz], 20, 7);
    expect(set).toHaveLength(20);
    expect(set.every((c) => c.type !== 'flashcard')).toBe(true);
    expect(interviewSet([...cards, ...quiz], 20, 7).map((c) => c.id)).toEqual(set.map((c) => c.id));
  });
});

describe('answers', () => {
  it('checks each card type', () => {
    expect(isCorrect(mk('x'), true)).toBe(true);
    expect(isCorrect(mk('x'), false)).toBe(false);
    const bug = mk('y', { type: 'bugspot', language: 'ts', code: 'a\nb', buggyLines: [2] } as Partial<Card>);
    expect(isCorrect(bug, 2)).toBe(true);
    expect(isCorrect(bug, 1)).toBe(false);
  });
});

describe('storage', () => {
  const memory = (init?: string) => {
    const m = new Map<string, string>();
    if (init !== undefined) m.set(STORE_KEY, init);
    return { m, getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
  };
  it('starts empty', () => {
    expect(loadStore(memory())).toEqual(emptyStore());
  });
  it('backs up an unreadable store before reset', () => {
    const kv = memory('{not json');
    expect(loadStore(kv, 123)).toEqual(emptyStore());
    expect(kv.m.get(`${STORE_KEY}:backup:123`)).toBe('{not json');
  });
  it('fills missing settings on migrate', () => {
    expect(migrate({ version: 1, progress: {} })?.settings.quizLength).toBe(10);
    expect(migrate({ version: 99 })).toBeNull();
  });
  it('ignores progress for removed cards', () => {
    const p: ProgressMap = { keep: { box: 1, dueAt: NOW, right: 0, wrong: 0, lastSeenAt: NOW } };
    expect(Object.keys(pruneUnknown({ ...p, gone: p.keep! }, new Set(['keep'])))).toEqual(['keep']);
  });
});

describe('export / import', () => {
  const progressArb = fc.dictionary(
    fc.stringMatching(/^[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/),
    fc.record({
      box,
      dueAt: fc.constant(NOW),
      right: fc.nat(100),
      wrong: fc.nat(100),
      lastSeenAt: fc.constant(NOW),
    }),
  );
  it('round-trips any progress', () => {
    fc.assert(
      fc.property(progressArb, (progress) => {
        const store = { ...emptyStore(), progress };
        const res = parseImport(exportStore(store, NOW));
        return res.ok && JSON.stringify(res.store) === JSON.stringify(store) && res.cardCount === Object.keys(progress).length;
      }),
    );
  });
  it('rejects invalid files', () => {
    expect(parseImport('nope').ok).toBe(false);
    expect(parseImport('{"version":2,"progress":{}}').ok).toBe(false);
    expect(parseImport('{"version":1,"progress":{"a/b/c":{"box":9}}}').ok).toBe(false);
  });
});
