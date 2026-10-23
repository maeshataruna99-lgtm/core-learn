import { checkFix } from './diff.ts';
import { LEVELS, TRACKS } from './types.ts';
import type { Card } from './types.ts';

const ID_RE = /^[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/;

export function validateCards(cards: Card[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const c of cards) {
    const err = (msg: string) => errors.push(`${c.id}: ${msg}`);
    if (seen.has(c.id)) err('duplicate id');
    seen.add(c.id);
    if (!ID_RE.test(c.id)) err('id must be <track>/<topic>/<slug>');
    else {
      const [track, topic] = c.id.split('/');
      if (track !== c.track) err(`id track "${track}" does not match track "${c.track}"`);
      if (topic !== c.topic) err(`id topic "${topic}" does not match topic "${c.topic}"`);
    }
    if (!TRACKS.includes(c.track)) err(`unknown track "${c.track}"`);
    if (!LEVELS.includes(c.level)) err(`unknown level "${c.level}"`);
    if (!c.explanation?.trim()) err('empty explanation');
    if (c.docsUrl) {
      try {
        const u = new URL(c.docsUrl);
        if (u.protocol !== 'https:' && u.protocol !== 'http:') err('docsUrl must be http(s)');
      } catch {
        err('docsUrl is not a valid URL');
      }
    }
    switch (c.type) {
      case 'flashcard':
        if (!c.front.trim() || !c.back.trim()) err('flashcard needs front and back');
        break;
      case 'mcq':
      case 'output':
        if (c.options.length !== 4) err('needs exactly 4 options');
        if (new Set(c.options).size !== c.options.length) err('options must be distinct');
        if (!Number.isInteger(c.answerIndex) || c.answerIndex < 0 || c.answerIndex > 3) err('answerIndex out of range');
        if (c.type === 'mcq' && !c.question.trim()) err('empty question');
        if (c.type === 'output' && !c.code.trim()) err('empty code');
        break;
      case 'bugspot': {
        const lines = c.code.split('\n').length;
        if (c.buggyLines.length === 0) err('buggyLines is empty');
        for (const n of c.buggyLines) if (!Number.isInteger(n) || n < 1 || n > lines) err(`buggy line ${n} outside 1..${lines}`);
        if (!c.fixedCode?.trim()) err('bugspot needs fixedCode');
        else {
          const problem = checkFix(c.code, c.fixedCode, c.buggyLines);
          if (problem) err(problem);
        }
        if (c.proof && c.proof.buggyOutput.trim() === c.proof.fixedOutput.trim()) err('proof outputs must differ');
        break;
      }
    }
  }
  return errors;
}
