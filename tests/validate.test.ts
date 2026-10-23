import { describe, expect, it } from 'vitest';
import { allCards } from '../src/content/index.ts';
import { validateCards } from '../src/core/validate.ts';
import type { Card } from '../src/core/types.ts';

const mcq = (over: Record<string, unknown> = {}): Card =>
  ({
    id: 'vue3/t/x', track: 'vue3', topic: 't', level: 'beginner', tags: [], explanation: 'e',
    type: 'mcq', question: 'q', options: ['a', 'b', 'c', 'd'], answerIndex: 0, ...over,
  }) as Card;

describe('content validator', () => {
  it('accepts the shipped content', () => {
    expect(validateCards(allCards)).toEqual([]);
  });
  it('rejects bad structure', () => {
    expect(validateCards([mcq(), mcq()])).toContainEqual(expect.stringContaining('duplicate id'));
    expect(validateCards([mcq({ options: ['a', 'b'] })])[0]).toMatch(/4 options/);
    expect(validateCards([mcq({ answerIndex: 4 })])[0]).toMatch(/answerIndex/);
    expect(validateCards([mcq({ id: 'Bad Id' })])[0]).toMatch(/id must be/);
    expect(validateCards([mcq({ explanation: ' ' })])[0]).toMatch(/explanation/);
    expect(validateCards([mcq({ docsUrl: 'not a url' })])[0]).toMatch(/docsUrl/);
    expect(validateCards([mcq({ track: 'nope' })]).join()).toMatch(/unknown track/);
  });
  it('requires both languages in a primer, on beginner cards only', () => {
    const primer = { en: 'Basics.', id: 'Dasar.' };
    expect(validateCards([mcq({ primer })])).toEqual([]);
    expect(validateCards([mcq({ primer: { en: 'Basics.', id: ' ' } })])[0]).toMatch(/both en and id/);
    expect(validateCards([mcq({ primer: { en: 'Same', id: 'Same' } })])[0]).toMatch(/identical/);
    expect(validateCards([mcq({ primer, level: 'advanced' })])[0]).toMatch(/only for beginner/);
  });
  it('gives every shipped beginner foundation card a primer', () => {
    const foundations = allCards.filter((c) => c.id.includes('/foundations/') || /\/(spring-basics|layers|jpa-basics|jpql)\//.test(c.id));
    expect(foundations.length).toBeGreaterThan(60);
    expect(foundations.filter((c) => !c.primer).map((c) => c.id)).toEqual([]);
  });
  it('checks bugspot line range', () => {
    const bug = { type: 'bugspot', language: 'ts', code: 'a\nb', buggyLines: [3], question: undefined, options: undefined };
    expect(validateCards([mcq(bug)]).join()).toMatch(/outside 1\.\.2/);
  });
});
