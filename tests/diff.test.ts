import { describe, expect, it } from 'vitest';
import { changedLines, checkFix } from '../src/core/diff.ts';

describe('changedLines', () => {
  it('reports replaced lines by their original number', () => {
    expect(changedLines('a\nb\nc', 'a\nX\nc')).toEqual([2]);
  });
  it('ignores pure insertions', () => {
    expect(changedLines('a\nb', 'a\nnew\nb')).toEqual([]);
  });
  it('reports deleted lines', () => {
    expect(changedLines('a\nb\nc', 'a\nc')).toEqual([2]);
  });
  it('ignores trailing whitespace', () => {
    expect(changedLines('a  \nb', 'a\nb')).toEqual([]);
  });
});

describe('checkFix', () => {
  it('accepts a fix that changes a buggy line', () => {
    expect(checkFix('a\nbad\nc', 'a\ngood\nc', [2])).toBeNull();
  });
  it('rejects identical code', () => {
    expect(checkFix('a\nb', 'a\nb', [2])).toMatch(/identical/);
  });
  it('rejects a fix that misses the buggy line', () => {
    expect(checkFix('a\nbad\nc', 'X\nbad\nc', [2])).toMatch(/none of the buggy lines/);
  });
  it('rejects a fix that rewrites unrelated code', () => {
    const before = 'bad\n1\n2\n3\n4';
    expect(checkFix(before, 'good\nA\nB\nC\nD', [1])).toMatch(/outside the buggy lines/);
  });
});
