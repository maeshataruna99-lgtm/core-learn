import { isDue, mastery } from './leitner.ts';
import { learnOrder } from './selection.ts';
import type { Box, Card, CardType, Level, ProgressMap, Track } from './types.ts';
import { LEVELS, TRACKS } from './types.ts';

export interface TopicSummary {
  track: Track;
  topic: string;
  cards: Card[];
  total: number;
  due: number;
  seen: number;
  mastered: number;
  masteryPct: number;
  levels: Record<Level, number>;
  types: Record<CardType, number>;
}

export interface TrackSummary {
  track: Track;
  topics: TopicSummary[];
  total: number;
  due: number;
  seen: number;
  mastered: number;
  masteryPct: number;
  levels: Record<Level, number>;
}

export interface BoxBucket {
  key: 'unseen' | Box;
  count: number;
}

/** Human-readable preview label for a card inside the curriculum outline. */
export function cardTitle(card: Card): string {
  const raw =
    card.type === 'flashcard'
      ? card.front
      : card.type === 'mcq'
        ? card.question
        : card.type === 'output'
          ? card.code.split('\n').find((l) => l.trim()) ?? card.topic
          : card.code.split('\n').find((l) => l.trim()) ?? card.topic;
  const clean = raw.replace(/\s+/g, ' ').trim();
  return clean.length > 64 ? `${clean.slice(0, 61)}...` : clean;
}

/** Turns kebab-case topic slugs like "dto-validation" into "Dto Validation" / readable labels. */
export function formatTopicLabel(topic: string): string {
  return topic
    .split('-')
    .map((w) => (w.length <= 3 && /^(api|di|dto|oop|dsa|sql|jwt|ui|db)$/i.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

export function summarizeTopic(track: Track, topic: string, topicCards: Card[], progress: ProgressMap, now: string): TopicSummary {
  const ordered = learnOrder(topicCards);
  const levels: Record<Level, number> = { beginner: 0, intermediate: 0, advanced: 0 };
  const types: Record<CardType, number> = { flashcard: 0, mcq: 0, output: 0, bugspot: 0 };
  let due = 0;
  let seen = 0;
  let mastered = 0;
  let masterySum = 0;

  for (const c of ordered) {
    levels[c.level]++;
    types[c.type]++;
    const p = progress[c.id];
    if (isDue(p, now)) due++;
    if (p) {
      seen++;
      if (p.box >= 4) mastered++;
      masterySum += mastery(p);
    }
  }

  return {
    track,
    topic,
    cards: ordered,
    total: ordered.length,
    due,
    seen,
    mastered,
    masteryPct: ordered.length ? Math.round((masterySum / ordered.length) * 100) : 0,
    levels,
    types,
  };
}

export function topicSummaries(cards: Card[], track: Track, progress: ProgressMap, now: string): TopicSummary[] {
  const byTopic = new Map<string, Card[]>();
  for (const c of cards) {
    if (c.track !== track) continue;
    const list = byTopic.get(c.topic) ?? [];
    list.push(c);
    byTopic.set(c.topic, list);
  }
  return [...byTopic.entries()].map(([topic, list]) => summarizeTopic(track, topic, list, progress, now));
}

export function trackSummaries(cards: Card[], progress: ProgressMap, now: string): TrackSummary[] {
  return TRACKS.map((tr) => {
    const topics = topicSummaries(cards, tr, progress, now);
    const levels: Record<Level, number> = { beginner: 0, intermediate: 0, advanced: 0 };
    let total = 0;
    let due = 0;
    let seen = 0;
    let mastered = 0;
    let weightedMastery = 0;

    for (const tp of topics) {
      total += tp.total;
      due += tp.due;
      seen += tp.seen;
      mastered += tp.mastered;
      weightedMastery += tp.masteryPct * tp.total;
      for (const lv of LEVELS) levels[lv] += tp.levels[lv];
    }

    return {
      track: tr,
      topics,
      total,
      due,
      seen,
      mastered,
      masteryPct: total ? Math.round(weightedMastery / total) : 0,
      levels,
    };
  }).filter((t) => t.total > 0);
}

export function boxDistribution(cards: Card[], progress: ProgressMap): BoxBucket[] {
  const counts: Record<'unseen' | Box, number> = { unseen: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const c of cards) {
    const box = progress[c.id]?.box;
    if (box) counts[box]++;
    else counts.unseen++;
  }
  return [
    { key: 'unseen', count: counts.unseen },
    { key: 1, count: counts[1] },
    { key: 2, count: counts[2] },
    { key: 3, count: counts[3] },
    { key: 4, count: counts[4] },
    { key: 5, count: counts[5] },
  ];
}
