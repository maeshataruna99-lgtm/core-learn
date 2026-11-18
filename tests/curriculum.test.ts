import { describe, expect, it } from 'vitest';
import { allCards } from '../src/content/index.ts';
import { boxDistribution, cardTitle, formatTopicLabel, topicSummaries, trackSummaries } from '../src/core/curriculum.ts';
import type { ProgressMap } from '../src/core/types.ts';

describe('curriculum helpers', () => {
  it('formats topic slugs cleanly', () => {
    expect(formatTopicLabel('dto-validation')).toBe('DTO Validation');
    expect(formatTopicLabel('n-plus-one')).toBe('N Plus One');
    expect(formatTopicLabel('sql-injection')).toBe('SQL Injection');
  });

  it('aggregates track and topic summaries from progress', () => {
    const now = '2026-11-18T10:00:00.000Z';
    const tsTopics = topicSummaries(allCards, 'typescript-node', {}, now);
    expect(tsTopics.length).toBeGreaterThan(0);
    const first = tsTopics[0]!;
    const card = first.cards[0]!;
    const progress: ProgressMap = {
      [card.id]: { box: 5, dueAt: '2026-12-18T10:00:00.000Z', right: 3, wrong: 0, lastSeenAt: now },
    };
    const updated = trackSummaries(allCards, progress, now);
    const tsTrack = updated.find((t) => t.track === 'typescript-node')!;
    expect(tsTrack.seen).toBe(1);
    expect(tsTrack.mastered).toBe(1);
    expect(tsTrack.due).toBe(tsTrack.total - 1);
  });

  it('computes box distribution summing to total cards', () => {
    const progress: ProgressMap = {
      [allCards[0]!.id]: { box: 2, dueAt: '2026-11-20T00:00:00.000Z', right: 1, wrong: 0, lastSeenAt: '2026-11-18T00:00:00.000Z' },
    };
    const buckets = boxDistribution(allCards, progress);
    const sum = buckets.reduce((acc, b) => acc + b.count, 0);
    expect(sum).toBe(allCards.length);
    expect(buckets.find((b) => b.key === 2)?.count).toBe(1);
  });

  it('produces non-empty preview titles for every shipped card', () => {
    for (const c of allCards) {
      expect(cardTitle(c).length).toBeGreaterThan(0);
    }
  });
});
