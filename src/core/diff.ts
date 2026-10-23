/** 1-based numbers of `before` lines that are not kept in `after` (longest-common-subsequence diff). */
export function changedLines(before: string, after: string): number[] {
  const a = before.split('\n').map((l) => l.trimEnd());
  const b = after.split('\n').map((l) => l.trimEnd());
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }
  const kept = new Set<number>();
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      kept.add(i);
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) i++;
    else j++;
  }
  return a.map((_, idx) => idx).filter((idx) => !kept.has(idx)).map((idx) => idx + 1);
}

/** A fix is acceptable when it changes at least one buggy line and touches at most 2 other lines. */
export function checkFix(code: string, fixedCode: string, buggyLines: number[]): string | null {
  if (code.trimEnd() === fixedCode.trimEnd()) return 'fixedCode is identical to code';
  const changed = changedLines(code, fixedCode);
  if (!buggyLines.some((n) => changed.includes(n))) {
    return `fix changes lines [${changed}] but none of the buggy lines [${buggyLines}]`;
  }
  const extra = changed.filter((n) => !buggyLines.includes(n));
  if (extra.length > 2) return `fix also changes ${extra.length} lines outside the buggy lines: [${extra}]`;
  return null;
}
