import assert from 'node:assert/strict';
import type { Transaction } from './part1-algorithm.ts';

/**
 * PEMBAHASAN & SOLUSI OPTIMAL PART 1
 * Jalankan: node practice-mgs/part1-solutions.ts
 */

// 1. HashMap Aggregation + Multi-key Sort
// Waktu: O(N + U log U), Ruang: O(U) di mana U = jumlah user unik.
export function summarizePaidTransactions(
  transactions: Transaction[],
): Array<{ userId: string; total: number }> {
  if (!transactions.length) return [];

  const totals = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.status !== 'PAID' || tx.amount <= 0) continue;
    totals.set(tx.userId, (totals.get(tx.userId) ?? 0) + tx.amount);
  }

  return Array.from(totals.entries())
    .map(([userId, total]) => ({ userId, total }))
    .sort((a, b) => (b.total !== a.total ? b.total - a.total : a.userId.localeCompare(b.userId)));
}

// 2. Sliding Window Log per User
// Waktu: O(1) amortized per panggilan (tiap timestamp masuk dan keluar maksimal 1x).
export class RateLimiter {
  private readonly logs = new Map<string, number[]>();
  private readonly limit: number;
  private readonly windowSec: number;

  constructor(limit: number, windowSec: number) {
    if (limit <= 0 || windowSec <= 0) {
      throw new Error('limit and windowSec must be positive');
    }
    this.limit = limit;
    this.windowSec = windowSec;
  }

  isAllowed(userId: string, timestampSec: number): boolean {
    const minValid = timestampSec - this.windowSec + 1;
    const timestamps = this.logs.get(userId) ?? [];

    // Buang timestamp yang sudah keluar dari window aktif
    let firstValidIdx = 0;
    while (firstValidIdx < timestamps.length && timestamps[firstValidIdx]! < minValid) {
      firstValidIdx++;
    }
    if (firstValidIdx > 0) {
      timestamps.splice(0, firstValidIdx);
    }

    if (timestamps.length >= this.limit) {
      this.logs.set(userId, timestamps);
      return false;
    }

    timestamps.push(timestampSec);
    this.logs.set(userId, timestamps);
    return true;
  }
}

// 3. Stack Matching
// Waktu: O(N), Ruang: O(N)
export function isBalancedBrackets(input: string): boolean {
  const pairs: Record<string, string> = {
    ')': '(',
    '}': '{',
    ']': '[',
  };
  const openers = new Set(['(', '{', '[']);
  const stack: string[] = [];

  for (const ch of input) {
    if (openers.has(ch)) {
      stack.push(ch);
      continue;
    }
    const expected = pairs[ch];
    if (expected) {
      if (stack.pop() !== expected) return false;
    }
  }

  return stack.length === 0;
}

if (process.argv[1]?.endsWith('part1-solutions.ts')) {
  assert.deepEqual(
    summarizePaidTransactions([
      { userId: 'u2', amount: 50000, status: 'PAID' },
      { userId: 'u1', amount: 30000, status: 'PAID' },
      { userId: 'u1', amount: 70000, status: 'PAID' },
      { userId: 'u2', amount: 90000, status: 'PENDING' },
      { userId: 'u3', amount: -1000, status: 'PAID' },
      { userId: 'u4', amount: 50000, status: 'PAID' },
    ]),
    [
      { userId: 'u1', total: 100000 },
      { userId: 'u2', total: 50000 },
      { userId: 'u4', total: 50000 },
    ],
  );

  const limiter = new RateLimiter(2, 10);
  assert.equal(limiter.isAllowed('alice', 1), true);
  assert.equal(limiter.isAllowed('alice', 5), true);
  assert.equal(limiter.isAllowed('alice', 10), false);
  assert.equal(limiter.isAllowed('alice', 11), true);
  assert.equal(limiter.isAllowed('bob', 10), true);

  assert.equal(isBalancedBrackets('({[a + b]})'), true);
  assert.equal(isBalancedBrackets('([)]'), false);
  assert.equal(isBalancedBrackets('((('), false);
  assert.equal(isBalancedBrackets(''), true);

  console.log('Part 1 Solutions: Terverifikasi!');
}
