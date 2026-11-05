import type { CvQuestion } from './mycv.ts';
import type { Bi } from './wiki.ts';

/** One part of the project in focus, with what is needed to explain and defend it in an interview. */
export interface FocusTopic {
  id: string;
  title: Bi;
  /** The concept in plain words. */
  what: Bi;
  /** How to explain this part out loud. */
  tellIt: Bi;
  /** Repo-relative paths that show it in the project's code. */
  code: string[];
  /** Asked in this order during the interview simulation. */
  questions: CvQuestion[];
}

export const FOCUS_REPO = 'https://github.com/maeshataruna99-lgtm/core-ai-automation';

/** The understood-map key for a focus topic, kept apart from wiki term ids. */
export const focusKey = (id: string) => `focus:${id}`;

export const focusQuestions = (topics: FocusTopic[]) => topics.flatMap((t) => t.questions.map((q) => ({ ...q, topic: t.title })));

export function validateFocus(topics: FocusTopic[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const bi = (id: string, label: string, v: Bi | undefined) => {
    if (!v?.en?.trim() || !v?.id?.trim()) errors.push(`${id}: ${label} needs non-empty en and id text`);
  };
  for (const t of topics) {
    if (seen.has(t.id)) errors.push(`${t.id}: duplicate id`);
    seen.add(t.id);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.id)) errors.push(`${t.id}: id must be a lowercase slug`);
    bi(t.id, 'title', t.title);
    bi(t.id, 'what', t.what);
    bi(t.id, 'tellIt', t.tellIt);
    if (!t.questions?.length) errors.push(`${t.id}: needs at least one question`);
    t.questions?.forEach((q, i) => {
      bi(t.id, `questions[${i}].q`, q.q);
      bi(t.id, `questions[${i}].a`, q.a);
    });
    for (const p of t.code ?? []) if (p.startsWith('/') || p.includes('..')) errors.push(`${t.id}: bad code path "${p}"`);
  }
  return errors;
}
