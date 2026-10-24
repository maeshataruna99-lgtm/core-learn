import type { Track } from './types.ts';

export const WIKI_CATEGORIES = [
  'languages', 'frameworks', 'web', 'data', 'concurrency', 'caching', 'reliability', 'scaling', 'messaging', 'architecture', 'ops',
] as const;
export type WikiCategory = (typeof WIKI_CATEGORIES)[number];

export type Lang = 'en' | 'id';
/** Both languages are required for every piece of wiki text. */
export interface Bi { en: string; id: string }

export interface WikiEntry {
  /** Lowercase slug, unique across the wiki. */
  id: string;
  /** The term itself; technical terms stay in English in both languages. */
  term: string;
  category: WikiCategory;
  /** 1-2 sentences, assumes zero knowledge. */
  meaning: Bi;
  /** A simple real-world comparison. */
  analogy: Bi;
  /** 2-4 short points worth remembering. */
  keyPoints: Bi[];
  /** Ids of other wiki entries. */
  related: string[];
  /** Existing card topics where the learner can practise this term. */
  topics?: { track: Track; topic: string }[];
  docsUrl?: string;
  source?: { repo: string; path?: string };
}

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

/** Case-insensitive search over the term, its meaning and its key points in the chosen language. Term matches rank first. */
export function searchWiki(entries: WikiEntry[], query: string, category: WikiCategory | null, lang: Lang): WikiEntry[] {
  const q = norm(query.trim());
  const inCat = entries.filter((e) => !category || e.category === category);
  if (!q) return [...inCat].sort((a, b) => a.term.localeCompare(b.term));
  const scored: [number, WikiEntry][] = [];
  for (const e of inCat) {
    const term = norm(e.term);
    const body = norm([e.meaning[lang], ...e.keyPoints.map((k) => k[lang])].join(' '));
    const score = term === q ? 0 : term.startsWith(q) ? 1 : term.includes(q) ? 2 : body.includes(q) ? 3 : -1;
    if (score >= 0) scored.push([score, e]);
  }
  return scored.sort((a, b) => a[0] - b[0] || a[1].term.localeCompare(b[1].term)).map(([, e]) => e);
}

/** Terms to quiz on: not yet understood first (original order), then the understood ones when asked. */
export function quizPool(entries: WikiEntry[], understood: Record<string, string>, category: WikiCategory | null, includeKnown: boolean): WikiEntry[] {
  const inCat = entries.filter((e) => !category || e.category === category);
  const todo = inCat.filter((e) => !understood[e.id]);
  return includeKnown ? [...todo, ...inCat.filter((e) => understood[e.id])] : todo;
}

/** Structural checks for the shipped wiki data; returns human-readable errors. */
export function validateWiki(entries: WikiEntry[], knownTopics?: Set<string>): string[] {
  const errors: string[] = [];
  const ids = new Set(entries.map((e) => e.id));
  const seen = new Set<string>();
  const bi = (e: WikiEntry, label: string, v: Bi | undefined) => {
    if (!v?.en?.trim() || !v?.id?.trim()) errors.push(`${e.id}: ${label} needs non-empty en and id text`);
  };
  for (const e of entries) {
    const err = (m: string) => errors.push(`${e.id}: ${m}`);
    if (seen.has(e.id)) err('duplicate id');
    seen.add(e.id);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id)) err('id must be a lowercase slug');
    if (!e.term?.trim()) err('empty term');
    if (!WIKI_CATEGORIES.includes(e.category)) err(`unknown category "${e.category}"`);
    bi(e, 'meaning', e.meaning);
    bi(e, 'analogy', e.analogy);
    if (!Array.isArray(e.keyPoints) || e.keyPoints.length < 2 || e.keyPoints.length > 4) err('needs 2-4 keyPoints');
    else e.keyPoints.forEach((k, i) => bi(e, `keyPoints[${i}]`, k));
    for (const f of ['meaning', 'analogy'] as const) {
      if (e[f]?.en && e[f]?.id && e[f].en.trim() === e[f].id.trim()) err(`${f} en and id are identical (untranslated?)`);
    }
    if (e.meaning?.en && e.meaning.en.length > 420) err('meaning is too long for a basic definition (max 420 chars)');
    for (const r of e.related ?? []) {
      if (r === e.id) err('related points at itself');
      else if (!ids.has(r)) err(`related id "${r}" does not exist`);
    }
    if (new Set(e.related).size !== e.related?.length) err('duplicate related id');
    if (knownTopics) {
      for (const t of e.topics ?? []) if (!knownTopics.has(`${t.track}/${t.topic}`)) err(`topic ${t.track}/${t.topic} has no cards`);
    }
    if (e.docsUrl) {
      try {
        if (new URL(e.docsUrl).protocol !== 'https:') err('docsUrl must be https');
      } catch {
        err('docsUrl is not a valid URL');
      }
    }
  }
  return errors;
}
