import assert from 'node:assert/strict';

/**
 * PART 1: LOGIKA ALGORITMA (Target: 20-25 menit)
 *
 * Petunjuk:
 * 1. Kerjakan 3 fungsi di bawah ini.
 * 2. Jalankan: node practice-mgs/part1-algorithm.ts
 * 3. Jangan intip part1-solutions.ts sebelum mencoba minimal 15 menit.
 */

export interface Transaction {
  userId: string;
  amount: number; // bilangan bulat (Rupiah), bisa <= 0 jika invalid
  status: 'PAID' | 'PENDING' | 'FAILED';
}

/**
 * Soal 1: Ringkasan Transaksi per User
 * Hitung total nominal transaksi yang berstatus 'PAID' dan valid (amount > 0) per userId.
 * Kembalikan array terurut menurun berdasarkan total (jika seri, urutkan userId ascending).
 */
export function summarizePaidTransactions(
  transactions: Transaction[],
): Array<{ userId: string; total: number }> {
  // TODO: Implementasi di sini (Target kompleksitas: O(N log U))
  void transactions;
  return [];
}

/**
 * Soal 2: Sliding Window Rate Limiter
 * Kembalikan true jika request pada `timestampSec` masih diizinkan,
 * dengan aturan maksimal `limit` request dalam `windowSec` detik terakhir
 * (inklusif: [timestampSec - windowSec + 1, timestampSec]).
 * Jika diizinkan, catat timestamp tersebut; jika ditolak, jangan catat.
 */
export class RateLimiter {
  private readonly limit: number;
  private readonly windowSec: number;

  constructor(limit: number, windowSec: number) {
    this.limit = limit;
    this.windowSec = windowSec;
  }

  isAllowed(userId: string, timestampSec: number): boolean {
    // TODO: Implementasi di sini (Gunakan Map<string, number[]>)
    void userId;
    void timestampSec;
    void this.limit;
    void this.windowSec;
    return false;
  }
}

/**
 * Soal 3: Validasi Bracket / Template Config
 * Cek apakah semua tanda kurung '()', '{}', '[]' pada string tertutup dengan urutan yang benar.
 * Abaikan karakter selain bracket (misal huruf/angka/spasi).
 */
export function isBalancedBrackets(input: string): boolean {
  // TODO: Implementasi di sini (Gunakan Stack, O(N))
  void input;
  return false;
}

// ============================================================================
// TEST SUITE (Otomatis berjalan saat file dieksekusi)
// ============================================================================
if (process.argv[1]?.endsWith('part1-algorithm.ts')) {
  // Test Soal 1
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
  assert.deepEqual(summarizePaidTransactions([]), []);

  // Test Soal 2
  const limiter = new RateLimiter(2, 10);
  assert.equal(limiter.isAllowed('alice', 1), true);
  assert.equal(limiter.isAllowed('alice', 5), true);
  assert.equal(limiter.isAllowed('alice', 10), false); // window [1..10] sudah 2
  assert.equal(limiter.isAllowed('alice', 11), true); // timestamp 1 keluar dari window [2..11]
  assert.equal(limiter.isAllowed('bob', 10), true); // user terpisah

  // Test Soal 3
  assert.equal(isBalancedBrackets('({[a + b]})'), true);
  assert.equal(isBalancedBrackets('([)]'), false);
  assert.equal(isBalancedBrackets('((('), false);
  assert.equal(isBalancedBrackets(''), true);

  console.log('Part 1: Semua test lulus!');
}
