import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

// One place that turns database errors into HTTP errors, so services stay free of Prisma codes.
const MAPPING: Record<string, { status: HttpStatus; message: string }> = {
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Resource not found' },
  P2002: { status: HttpStatus.CONFLICT, message: 'Resource already exists' },
  P2003: { status: HttpStatus.BAD_REQUEST, message: 'Referenced resource does not exist' },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(err: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const mapped = MAPPING[err.code] ?? {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error', // never expose the Prisma message or query
    };
    res.status(mapped.status).json({
      statusCode: mapped.status,
      message: mapped.message,
      error: HttpStatus[mapped.status],
    });
  }
}
