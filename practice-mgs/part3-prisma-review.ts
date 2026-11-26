/**
 * PART 3B: PRISMA & NESTJS CODE REVIEW CHALLENGE (Target: 15-20 menit)
 *
 * Tugas: Temukan minimal 6 celah keamanan & performa khas Prisma pada service ini
 * sebelum membuka `part3-prisma-review-fixed.ts`.
 *
 * Format catatan review:
 *   [Severity] Masalah -> Dampak -> Perbaikan
 */

export interface PrismaLike {
  $queryRawUnsafe: <T = unknown>(query: string) => Promise<T>;
  $queryRaw: <T = unknown>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<T>;
  $transaction: <T>(ops: Array<Promise<T>>) => Promise<T[]>;
  ticket: {
    findMany: (args?: Record<string, unknown>) => Promise<Array<Record<string, unknown>>>;
    findUnique: (args: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
    update: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
    updateMany: (args: Record<string, unknown>) => Promise<{ count: number }>;
  };
  user: {
    findUnique: (args: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
  };
  auditLog: {
    create: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  };
}

export class VulnerableTicketReportService {
  private readonly prisma: PrismaLike;

  constructor(prisma: PrismaLike) {
    this.prisma = prisma;
  }

  // ISSUE 1: SQL Injection lewat $queryRawUnsafe + interpolasi string langsung
  async searchTickets(keyword: string) {
    return this.prisma.$queryRawUnsafe(
      `SELECT * FROM Ticket WHERE title LIKE '%${keyword}%' ORDER BY createdAt DESC`,
    );
  }

  // ISSUE 2: Unbounded query (tanpa take/limit)
  // ISSUE 3: N+1 query (memanggil prisma.user.findUnique di dalam loop)
  // ISSUE 4: Sensitive data leak (mengembalikan seluruh object user termasuk passwordHash)
  async listTicketsWithAssignees() {
    const tickets = await this.prisma.ticket.findMany();
    const result: Array<Record<string, unknown>> = [];

    for (const ticket of tickets) {
      const assignee = ticket.assigneeId
        ? await this.prisma.user.findUnique({ where: { id: ticket.assigneeId } })
        : null;
      result.push({ ...ticket, assignee });
    }
    return result;
  }

  // ISSUE 5: IDOR — tidak memverifikasi apakah actor pemilik ticket atau ADMIN
  // ISSUE 6: Tanpa $transaction — jika auditLog.create gagal, status ticket sudah terlanjur berubah
  async closeTicket(ticketId: number, actor: { id: number; role: string }) {
    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'DONE' },
    });

    await this.prisma.auditLog.create({
      data: { ticketId, actorId: actor.id, action: 'CLOSE' },
    });

    return updated;
  }
}
