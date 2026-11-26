import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, STATUSES, Status } from './dto/create-ticket.dto';
import { ListTicketsQuery } from './dto/list-tickets.query';

const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  OPEN: ['IN_PROGRESS', 'DONE'],
  IN_PROGRESS: ['DONE'],
  DONE: [],
};

// Statuses a ticket may currently have for a move to `next` to be legal.
const allowedFrom = (next: Status): Status[] => STATUSES.filter((s) => ALLOWED_TRANSITIONS[s].includes(next));

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async list({ status, page, limit }: ListTicketsQuery) {
    const where: Prisma.TicketWhereInput = status ? { status } : {};
    // One round trip: rows and total in the same transaction. include avoids N+1 on assignee.
    const [data, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        include: { assignee: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.ticket.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  // A missing assignee raises Prisma P2003, which PrismaExceptionFilter maps to 400.
  create(dto: CreateTicketDto) {
    return this.prisma.ticket.create({ data: dto });
  }

  async updateStatus(id: number, next: Status) {
    // Check and write in ONE statement, so two concurrent requests cannot both pass the check.
    const { count } = await this.prisma.ticket.updateMany({
      where: { id, status: { in: allowedFrom(next) } },
      data: { status: next },
    });

    if (count === 0) {
      // Nothing changed: either the ticket does not exist, or the move is illegal.
      const ticket = await this.prisma.ticket.findUnique({ where: { id } });
      if (!ticket) throw new NotFoundException('Ticket not found');
      throw new ConflictException(`Cannot transition from ${ticket.status} to ${next}`);
    }
    return this.prisma.ticket.findUniqueOrThrow({ where: { id } });
  }

  // A missing ticket raises Prisma P2025, which PrismaExceptionFilter maps to 404.
  async remove(id: number) {
    await this.prisma.ticket.delete({ where: { id } });
  }
}
