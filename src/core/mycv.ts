import type { Track } from './types.ts';
import type { Bi } from './wiki.ts';

export const CV_SECTIONS = ['experience', 'projects', 'skills'] as const;
export type CvSection = (typeof CV_SECTIONS)[number];

export interface CvQuestion {
  q: Bi;
  /** What a good answer covers. Generic technical content: the learner adds their own project facts. */
  a: Bi;
}

/** One claim from the CV, with everything needed to be able to explain it in an interview. */
export interface CvItem {
  id: string;
  section: CvSection;
  title: Bi;
  /** What the CV says, in the author's own words (no contact details). */
  cv: Bi;
  /** How to tell it: a simple structure for answering "tell me about this". */
  tellIt: Bi;
  /** Wiki term ids to learn first. */
  wiki: string[];
  /** Existing card topics to practise. */
  topics: { track: Track; topic: string }[];
  questions: CvQuestion[];
}

/** The understood-map key for a CV item, kept apart from wiki term ids. */
export const cvKey = (id: string) => `cv:${id}`;

export function validateCv(items: CvItem[], wikiIds: Set<string>, knownTopics: Set<string>): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const bi = (id: string, label: string, v: Bi | undefined) => {
    if (!v?.en?.trim() || !v?.id?.trim()) errors.push(`${id}: ${label} needs non-empty en and id text`);
  };
  for (const it of items) {
    const err = (m: string) => errors.push(`${it.id}: ${m}`);
    if (seen.has(it.id)) err('duplicate id');
    seen.add(it.id);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(it.id)) err('id must be a lowercase slug');
    if (!CV_SECTIONS.includes(it.section)) err(`unknown section "${it.section}"`);
    bi(it.id, 'title', it.title);
    bi(it.id, 'cv', it.cv);
    bi(it.id, 'tellIt', it.tellIt);
    if (!it.questions?.length) err('needs at least one question');
    it.questions?.forEach((q, i) => {
      bi(it.id, `questions[${i}].q`, q.q);
      bi(it.id, `questions[${i}].a`, q.a);
    });
    for (const w of it.wiki ?? []) if (!wikiIds.has(w)) err(`wiki id "${w}" does not exist`);
    if (new Set(it.wiki).size !== it.wiki?.length) err('duplicate wiki id');
    for (const t of it.topics ?? []) if (!knownTopics.has(`${t.track}/${t.topic}`)) err(`topic ${t.track}/${t.topic} has no cards`);
    // The CV holds personal contact details; they must never end up in the public app.
    const text = JSON.stringify(it);
    if (/@[a-z0-9-]+\.[a-z]{2,}|\b0\d{9,12}\b|linkedin\.com/i.test(text)) err('contains what looks like contact details');
  }
  return errors;
}
