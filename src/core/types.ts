export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Track =
  | 'typescript-node' | 'nestjs-prisma' | 'vue3' | 'java-spring'
  | 'security' | 'sql-db' | 'messaging' | 'cs-basics';

export const TRACKS: Track[] = [
  'typescript-node', 'nestjs-prisma', 'vue3', 'java-spring', 'security', 'sql-db', 'messaging', 'cs-basics',
];
export const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];

/** A short beginner explanation of the concept, shown before the question. Both languages are required. */
export interface Primer { en: string; id: string }

export interface CardBase {
  id: string;
  /** "Learn the basics first": plain-language background for someone who has never met the concept. */
  primer?: Primer;
  /** Teaching sequence within a topic in Learn mode (lower first). Cards without one keep the default order. */
  order?: number;
  track: Track;
  stack?: string;
  topic: string;
  level: Level;
  tags: string[];
  explanation: string;
  source?: { repo: string; path?: string };
  docsUrl?: string;
}

export interface Flashcard extends CardBase { type: 'flashcard'; front: string; back: string }
export interface Mcq extends CardBase { type: 'mcq'; question: string; options: string[]; answerIndex: number }
export interface OutputCard extends CardBase {
  type: 'output'; language: string; code: string; options: string[]; answerIndex: number;
  /** Real stdout captured by running the code; checked by scripts/verify-output.ts. */
  verifiedOutput?: string;
}
export interface BugProof {
  /** Runnable .mts module containing the marker comment "CODE_HERE" (see scripts/verify-bugs.ts) where the card code goes. */
  harness: string;
  /** Real stdout of harness+code, and of harness+fixedCode; they must differ. */
  buggyOutput: string;
  fixedOutput: string;
}
export interface BugSpot extends CardBase {
  type: 'bugspot'; language: string; code: string; buggyLines: number[];
  /** The code with the bug fixed. Must change a buggy line and little else (checked by diff). */
  fixedCode: string;
  /** Optional behavioural proof, executed by scripts/verify-bugs.ts. */
  proof?: BugProof;
}
export type Card = Flashcard | Mcq | OutputCard | BugSpot;
export type CardType = Card['type'];

export type Box = 1 | 2 | 3 | 4 | 5;
export interface CardProgress {
  box: Box;
  dueAt: string;
  right: number;
  wrong: number;
  lastSeenAt: string;
}
export type ProgressMap = Record<string, CardProgress>;

export interface Settings {
  theme: 'system' | 'light' | 'dark';
  language: 'en' | 'id';
  quizLength: number;
  timer: boolean;
}
export const DEFAULT_SETTINGS: Settings = { theme: 'system', language: 'en', quizLength: 10, timer: false };

export interface Store {
  version: 1;
  progress: ProgressMap;
  settings: Settings;
}
