import { describe, expect, it } from 'vitest';
import { allCards } from '../src/content/index.ts';
import { wikiEntries } from '../src/content/wiki/index.ts';
import { emptyStore, migrate } from '../src/core/storage.ts';
import { quizPool, searchWiki, validateWiki } from '../src/core/wiki.ts';
import type { WikiEntry } from '../src/core/wiki.ts';

const e = (over: Partial<WikiEntry> = {}): WikiEntry => ({
  id: 'a', term: 'Alpha', category: 'data',
  meaning: { en: 'm', id: 'n' }, analogy: { en: 'x', id: 'y' },
  keyPoints: [{ en: '1', id: '2' }, { en: '3', id: '4' }], related: [], ...over,
});
const topics = new Set(allCards.map((c) => `${c.track}/${c.topic}`));

describe('wiki data', () => {
  it('ships valid content', () => {
    expect(validateWiki(wikiEntries, topics)).toEqual([]);
  });
  it('covers the required terms', () => {
    const ids = new Set(wikiEntries.map((x) => x.id));
    for (const id of ['java', 'jvm', 'spring-boot', 'jpa', 'hibernate', 'maven', 'rabbitmq', 'redis', 'postgresql', 'docker', 'nodejs',
      'typescript', 'nestjs', 'prisma', 'vue', 'rest-api', 'http', 'json', 'api', 'orm']) expect(ids.has(id), id).toBe(true);
    expect(wikiEntries.length).toBeGreaterThanOrEqual(70);
    expect(ids.has('kafka')).toBe(false);
  });
  it('covers all 50 requested interview topics', () => {
    const topics = ['race-condition', 'deadlock', 'database-transaction', 'acid', 'isolation-levels', 'optimistic-locking', 'pessimistic-locking',
      'connection-pooling', 'n-plus-one', 'database-index', 'query-optimization', 'explain-analyze', 'foreign-key', 'unique-constraint',
      'database-migration', 'zero-downtime-migration', 'read-replica', 'replication-lag', 'sharding', 'partitioning', 'cache-invalidation',
      'redis-eviction', 'cache-stampede', 'distributed-cache', 'idempotency', 'retry', 'exponential-backoff', 'jitter', 'circuit-breaker',
      'rate-limiting', 'load-balancing', 'horizontal-scaling', 'vertical-scaling', 'reverse-proxy', 'message-queue', 'dead-letter-queue',
      'background-worker', 'job-scheduling', 'event-driven-architecture', 'webhook-verification', 'webhook-retries', 'eventual-consistency',
      'distributed-transaction', 'outbox-pattern', 'cqrs', 'event-sourcing', 'backpressure', 'graceful-shutdown', 'health-check', 'distributed-tracing'];
    expect(topics).toHaveLength(50);
    const ids = new Set(wikiEntries.map((x) => x.id));
    expect(topics.filter((id) => !ids.has(id))).toEqual([]);
  });
  it('rejects bad entries', () => {
    expect(validateWiki([e(), e()])).toContainEqual(expect.stringContaining('duplicate id'));
    expect(validateWiki([e({ meaning: { en: 'm', id: ' ' } })]).join()).toMatch(/meaning needs/);
    expect(validateWiki([e({ related: ['ghost'] })]).join()).toMatch(/does not exist/);
    expect(validateWiki([e({ related: ['a'] })]).join()).toMatch(/itself/);
    expect(validateWiki([e({ keyPoints: [{ en: '1', id: '2' }] })]).join()).toMatch(/2-4/);
    expect(validateWiki([e({ keyPoints: [{ en: '1', id: '' }, { en: '3', id: '4' }] })]).join()).toMatch(/keyPoints\[0\]/);
    expect(validateWiki([e({ meaning: { en: 'same', id: 'same' } })]).join()).toMatch(/identical/);
    expect(validateWiki([e({ docsUrl: 'nope' })]).join()).toMatch(/docsUrl/);
    expect(validateWiki([e({ docsUrl: 'http://x.com' })]).join()).toMatch(/https/);
    expect(validateWiki([e({ id: 'Bad Id' })]).join()).toMatch(/slug/);
    expect(validateWiki([e({ topics: [{ track: 'vue3', topic: 'nope' }] })], topics).join()).toMatch(/no cards/);
  });
});

describe('wiki search and quiz', () => {
  const list = [
    e({ id: 'redis', term: 'Redis', meaning: { en: 'An in-memory store', id: 'Penyimpan di memori' } }),
    e({ id: 'cache', term: 'Cache', category: 'caching', meaning: { en: 'Keeps copies, often in Redis', id: 'Menyimpan salinan' } }),
    e({ id: 'queue', term: 'Message Queue', category: 'messaging' }),
  ];
  it('ranks term matches before body matches', () => {
    expect(searchWiki(list, 'redis', null, 'en').map((x) => x.id)).toEqual(['redis', 'cache']);
  });
  it('is case and accent insensitive, and searches the chosen language', () => {
    expect(searchWiki(list, 'MESSAGE', null, 'en').map((x) => x.id)).toEqual(['queue']);
    expect(searchWiki(list, 'memori', null, 'id').map((x) => x.id)).toEqual(['redis']);
    expect(searchWiki(list, 'memori', null, 'en')).toEqual([]);
  });
  it('filters by category and lists alphabetically when the query is empty', () => {
    expect(searchWiki(list, '', null, 'en').map((x) => x.id)).toEqual(['cache', 'queue', 'redis']);
    expect(searchWiki(list, '', 'messaging', 'en').map((x) => x.id)).toEqual(['queue']);
  });
  it('quizzes unknown terms first and can include known ones', () => {
    const known = { redis: '2026-01-01T00:00:00.000Z' };
    expect(quizPool(list, known, null, false).map((x) => x.id)).toEqual(['cache', 'queue']);
    expect(quizPool(list, known, null, true).map((x) => x.id)).toEqual(['cache', 'queue', 'redis']);
    expect(quizPool(list, known, 'caching', false).map((x) => x.id)).toEqual(['cache']);
  });
});

describe('store migration for the wiki', () => {
  it('adds understood to a store saved before the wiki existed', () => {
    const old = { version: 1, progress: {}, settings: { language: 'id' } };
    expect(migrate(old)).toEqual({ ...emptyStore(), settings: { ...emptyStore().settings, language: 'id' } });
    expect(migrate(old)?.understood).toEqual({});
  });
  it('keeps valid understood entries and drops junk', () => {
    const s = migrate({ version: 1, progress: {}, understood: { redis: '2026-01-01T00:00:00.000Z', bad: 5 } });
    expect(s?.understood).toEqual({ redis: '2026-01-01T00:00:00.000Z' });
    expect(migrate({ version: 1, progress: {}, understood: [1] })?.understood).toEqual({});
  });
});
