import { describe, expect, it } from 'vitest';
import { labProjects } from '../src/content/lab/index.ts';
import { cropStyle, isInside, validateLab } from '../src/core/lab.ts';

describe('lab data', () => {
  it('ships valid projects where every spot has a captured box', () => {
    expect(validateLab(labProjects)).toEqual([]);
  });

  it('rejects unknown parts, missing boxes and unplaced parts', () => {
    const p = labProjects[0]!;
    const [first, ...rest] = p.screens;
    const broken = { ...p, screens: [{ ...first!, spots: [{ part: 'nope', box: 'nope' }] }, ...rest] };
    const errors = validateLab([broken]).join('\n');
    expect(errors).toMatch(/unknown part "nope"/);
    expect(errors).toMatch(/box "nope" missing/);
    expect(errors).toMatch(/brand: part is not placed/);
  });
});

describe('lab quiz', () => {
  it('gives every real-run screen a quiz', () => {
    const real = labProjects.find((p) => p.id === 'cde-real')!;
    for (const s of real.screens) expect(s.quiz?.length, s.id).toBeGreaterThanOrEqual(3);
  });

  it('rejects an answer index outside the options', () => {
    const p = labProjects.find((x) => x.id === 'cde-real')!;
    const [first, ...rest] = p.screens;
    const q = first!.quiz![0]!;
    const broken = { ...p, screens: [{ ...first!, quiz: [{ ...q, answer: q.options.length }] }, ...rest] };
    expect(validateLab([broken]).join()).toMatch(/answer out of range/);
  });
});

describe('lab geometry', () => {
  const box = { x: 10, y: 20, w: 30, h: 40 };
  it('hit-tests clicks against a box in percent', () => {
    expect(isInside(box, 10, 20)).toBe(true);
    expect(isInside(box, 40, 60)).toBe(true);
    expect(isInside(box, 41, 30)).toBe(false);
    expect(isInside(box, 20, 19.9)).toBe(false);
  });

  it('crops to the box plus margin', () => {
    const s = cropStyle('/a.jpg', box, { width: 1000, height: 1000 }, 0);
    expect(s.backgroundSize).toBe(`${(100 / 30) * 100}% auto`);
    expect(s.backgroundPosition).toBe(`${(10 / 70) * 100}% ${(20 / 60) * 100}%`);
    expect(Number(s.aspectRatio)).toBeCloseTo(0.75);
    // A full-width box must not divide by zero.
    expect(cropStyle('/a.jpg', { x: 0, y: 0, w: 100, h: 50 }, { width: 10, height: 10 }, 0).backgroundPosition).toBe('0% 0%');
  });
});
