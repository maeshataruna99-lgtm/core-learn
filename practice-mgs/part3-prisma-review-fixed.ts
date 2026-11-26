import assert from 'node:assert/strict';
import type { PrismaLike } from './part3-prisma-review.ts';

/**
 * PART 3B: HASIL PERBAIKAN PRISMA CODE REVIEW (CLEAN & SECURE)
 * Jalankan: node practice-mgs/part3-prisma-review-fixed.ts
 */

const MAX_LIMIT = 50;

export class SafeTicketReportService {
  private readonly prisma: PrismaLike;

  constructor(prisma: PrismaLike) {
    this.prisma = prisma;
  }

  // FIX 1: Pakai tagged template $queryRaw (parameterized) + batas panjang keyword & LIMIT
  async searchTickets(keyword: string) {
    const clean = keyword.trim().slice(0, 100);
    if (!clean) return [];
    const pattern = `%${clean}%`;
    return this.prisma.$queryRaw`
      SELECT id, title, priority, status, assigneeId, createdAt
      FROM Ticket
      WHERE title LIKE ${pattern}
      ORDER BY createdAt DESC
      LIMIT ${MAX_LIMIT}
    `;
  }

  // FIX 2, 3, 4: Satu query dengan include + explicit select (tanpa passwordHash) + pagination cap
  async listTicketsWithAssignees(page = 1, limit = 20) {
    const safePage = Math.max(1, Math.trunc(page));
    const safeLimit = Math.min(MAX_LIMIT, Math.max(1, Math.trunc(limit)));

    return this.prisma.ticket.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        assignee: {
          select: { id: true, name: true }, // passwordHash tidak pernah ikut terambil
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });
  }

  // FIX 5 & 6: Verifikasi kepemilikan (cegah IDOR) + bungkus update & auditLog dalam $transaction
  async closeTicket(ticketId: number, actor: { id: number; role: string }) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, assigneeId: true, status: true },
    });
    if (!ticket) {
      throw new Error('NOT_FOUND');
    }
    if (actor.role !== 'ADMIN' && ticket.assigneeId !== actor.id) {
      throw new Error('FORBIDDEN');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'DONE' },
      }),
      this.prisma.auditLog.create({
        data: { ticketId, actorId: actor.id, action: 'CLOSE' },
      }),
    ]);

    return updated;
  }
}

// ============================================================================
// SELF-TEST (Verifikasi perbaikan tanpa perlu koneksi DB)
// ============================================================================
if (process.argv[1]?.endsWith('part3-prisma-review-fixed.ts')) {
  (async () => {
    let rawUnsafeCalled = false;
    let userFindUniqueCalls = 0;
    let txUsed = false;
    let capturedRawValues: unknown[] = [];
    let capturedFindManyArgs: Record<string, unknown> | undefined;

    const mockPrisma: PrismaLike = {
      $queryRawUnsafe: async () => {
        rawUnsafeCalled = true;
        return [] as never;
      },
      $queryRaw: async (_strings, ...values) => {
        capturedRawValues = values;
        return [{ id: 1, title: 'Fix auth' }] as never;
      },
      $transaction: async (ops) => {
        txUsed = true;
        return Promise.all(ops);
      },
      ticket: {
        findMany: async (args) => {
          capturedFindManyArgs = args;
          return [{ id: 1, title: 'Fix auth', assignee: { id: 10, name: 'Alice' } }];
        },
        findUnique: async () => ({ id: 1, assigneeId: 10, status: 'OPEN' }),
        update: async () => ({ id: 1, status: 'DONE' }),
        updateMany: async () => ({ count: 1 }),
      },
      user: {
        findUnique: async () => {
          userFindUniqueCalls++;
          return { id: 10, name: 'Alice', passwordHash: 'secret-hash' };
        },
      },
      auditLog: {
        create: async () => ({ id: 99 }),
      },
    };

    const service = new SafeTicketReportService(mockPrisma);

    // 1. Parameterized query digunakan, bukan $queryRawUnsafe
    await service.searchTickets("x' OR '1'='1");
    assert.equal(rawUnsafeCalled, false);
    assert.equal(capturedRawValues[0], "%x' OR '1'='1%");
    assert.equal(capturedRawValues[1], MAX_LIMIT);

    // 2. Tidak ada N+1 & limit dibatasi ke MAX_LIMIT
    await service.listTicketsWithAssignees(1, 500);
    assert.equal(userFindUniqueCalls, 0);
    assert.equal(capturedFindManyArgs?.take, MAX_LIMIT);

    // 3. IDOR ditolak untuk non-owner non-admin
    await assert.rejects(() => service.closeTicket(1, { id: 20, role: 'USER' }), /FORBIDDEN/);

    // 4. Owner diizinkan dan menulis lewat $transaction
    const closed = await service.closeTicket(1, { id: 10, role: 'USER' });
    assert.equal(closed.status, 'DONE');
    assert.equal(txUsed, true);

    console.log('Part 3B Prisma Review Fixed: Terverifikasi!');
  })().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
