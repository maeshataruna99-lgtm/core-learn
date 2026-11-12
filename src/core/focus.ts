import type { CvQuestion } from './mycv.ts';
import type { Bi } from './wiki.ts';

/** One part of the project in focus, with what is needed to explain and defend it in an interview. */
export interface FocusTopic {
  id: string;
  title: Bi;
  /** The concept in plain words. */
  what: Bi;
  /** Why the project uses this approach or tool instead of the obvious alternative. */
  why?: Bi;
  /** How to explain this part out loud. */
  tellIt: Bi;
  /** The steps this part runs through, in order. */
  flow?: Bi[];
  /** Repo-relative paths that show it in the project's code. */
  code: string[];
  /** Asked in this order during the interview simulation. */
  questions: CvQuestion[];
}

/** One project studied in the Focus tab. */
export interface FocusProject {
  id: string;
  title: Bi;
  intro: Bi;
  /** GitHub repository URL; code paths link to its main branch. */
  repo: string;
  topics: FocusTopic[];
}

/** The understood-map key for a focus topic, kept apart from wiki term ids. Topic ids are unique across projects. */
export const focusKey = (id: string) => `focus:${id}`;

export const focusQuestions = (topics: FocusTopic[]) => topics.flatMap((t) => t.questions.map((q) => ({ ...q, topic: t.title })));

export function validateFocus(projects: FocusProject[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const p of projects) {
    if (seen.has(p.id)) errors.push(`${p.id}: duplicate project id`);
    seen.add(p.id);
    if (!p.title?.en?.trim() || !p.title?.id?.trim() || !p.intro?.en?.trim() || !p.intro?.id?.trim()) errors.push(`${p.id}: project needs en and id title and intro`);
    if (!p.repo?.startsWith('https://')) errors.push(`${p.id}: repo must be an https URL`);
  }
  // Topic ids are checked across all projects because progress keys share one namespace.
  return errors.concat(validateTopics(projects.flatMap((p) => p.topics)));
}

export function validateTopics(topics: FocusTopic[]): string[] {
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
    if (t.why) bi(t.id, 'why', t.why);
    t.flow?.forEach((step, i) => bi(t.id, `flow[${i}]`, step));
    if (!t.questions?.length) errors.push(`${t.id}: needs at least one question`);
    t.questions?.forEach((q, i) => {
      bi(t.id, `questions[${i}].q`, q.q);
      bi(t.id, `questions[${i}].a`, q.a);
    });
    for (const p of t.code ?? []) if (p.startsWith('/') || p.includes('..')) errors.push(`${t.id}: bad code path "${p}"`);
  }
  return errors;
}

/** A flashcard for the swipe deck: a concept card per topic, then its interview questions. */
export interface FocusCard {
  kind: 'concept' | 'question';
  front: Bi;
  back: Bi;
  topic: Bi;
}

export const focusCards = (topics: FocusTopic[]): FocusCard[] =>
  topics.flatMap((t) => [
    {
      kind: 'concept' as const,
      front: t.title,
      back: t.why ? { en: `${t.what.en}\n\n${t.why.en}`, id: `${t.what.id}\n\n${t.why.id}` } : t.what,
      topic: t.title,
    },
    ...t.questions.map((q) => ({ kind: 'question' as const, front: q.q, back: q.a, topic: t.title })),
  ]);
