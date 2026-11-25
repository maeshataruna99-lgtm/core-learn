import { describe, expect, it } from 'vitest';
import { labProjects } from '../src/content/lab/index.ts';
import { labTours } from '../src/content/lab/tours.ts';
import { cameraFor, cropStyle, isInside, validateLab, validateTours } from '../src/core/lab.ts';

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
  it('gives every real-run and simrs screen a quiz', () => {
    for (const id of ['cde-real', 'simrs']) {
      const proj = labProjects.find((p) => p.id === id)!;
      for (const s of proj.screens) expect(s.quiz?.length, `${id}/${s.id}`).toBeGreaterThanOrEqual(3);
    }
  });

  it('rejects an answer index outside the options', () => {
    const p = labProjects.find((x) => x.id === 'cde-real')!;
    const [first, ...rest] = p.screens;
    const q = first!.quiz![0]!;
    const broken = { ...p, screens: [{ ...first!, quiz: [{ ...q, answer: q.options.length }] }, ...rest] };
    expect(validateLab([broken]).join()).toMatch(/answer out of range/);
  });
});

describe('lab tours', () => {
  it('ships a user and a developer tour whose steps point at captured boxes', () => {
    expect(validateTours(labTours, labProjects)).toEqual([]);
    expect(new Set(labTours.map((x) => x.audience))).toEqual(new Set(['user', 'dev']));
  });

  it('rejects steps on unknown screens or boxes', () => {
    const t = labTours[0]!;
    const bad = { ...t, steps: [{ ...t.steps[1]!, box: 'nope' }, { ...t.steps[1]!, screen: 'nope' }] };
    const errors = validateTours([bad], labProjects).join('\n');
    expect(errors).toMatch(/box "nope" missing/);
    expect(errors).toMatch(/unknown screen "nope"/);
  });
});

describe('lab camera', () => {
  const cap = { width: 1000, height: 2000 };
  it('zooms onto a small box and centres it, never past the image edges', () => {
    const c = cameraFor({ x: 45, y: 45, w: 10, h: 2 }, cap, 800, 500, true);
    expect(c.s).toBeGreaterThan(1);
    expect(c.s).toBeLessThanOrEqual(2.4);
    // Box centre lands in the middle of the frame.
    expect(800 * 0.5 * c.s + c.tx).toBeCloseTo(400);
    expect(c.tx).toBeLessThanOrEqual(0);
    expect(c.tx).toBeGreaterThanOrEqual(800 - 800 * c.s);
  });

  it('keeps scale 1 without zoom or without a box', () => {
    expect(cameraFor({ x: 0, y: 90, w: 10, h: 5 }, cap, 800, 500, false).s).toBe(1);
    expect(cameraFor(null, cap, 800, 500, true)).toEqual({ s: 1, tx: 0, ty: 0 });
  });

  it('clamps a box at the bottom so the image still fills the frame', () => {
    const c = cameraFor({ x: 0, y: 95, w: 100, h: 5 }, cap, 800, 500, false);
    expect(c.ty).toBe(500 - 1600);
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
