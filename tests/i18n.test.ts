import { describe, expect, it } from 'vitest';
import { en, id, translate } from '../src/i18n/index.ts';

describe('i18n', () => {
  it('has the same keys in both languages', () => {
    expect(Object.keys(id).sort()).toEqual(Object.keys(en).sort());
  });
  it('keeps the same placeholders in every translation', () => {
    const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const k of Object.keys(en) as (keyof typeof en)[]) expect(vars(id[k]), k).toEqual(vars(en[k]));
  });
  it('interpolates variables', () => {
    expect(translate('en', 'quiz.cardOf', { i: 2, n: 5 })).toBe('Card 2 of 5');
    expect(translate('id', 'quiz.cardOf', { i: 2, n: 5 })).toBe('Kartu 2 dari 5');
  });
});
