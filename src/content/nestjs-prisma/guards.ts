import type { Card } from '../../core/types.ts';

const base = { track: 'nestjs-prisma', stack: 'nestjs' } as const;
const guardSource = { repo: 'maeshataruna99-lgtm/core-forge-light', path: 'apps/api/src/auth/auth.guard.ts' };

export const cards: Card[] = [
  {
    ...base, id: 'nestjs-prisma/guards/what-is-a-guard', topic: 'guards', type: 'flashcard', level: 'beginner', tags: ['guards', 'auth'],
    front: 'What does a NestJS guard do, and what does canActivate return?',
    back: 'A guard decides whether a request may reach the route handler. canActivate returns boolean (or a Promise/Observable of it); false rejects with 403.',
    explanation: 'Guards run after middleware and before interceptors and pipes, which makes them the right place for authorization checks.',
    source: guardSource,
    docsUrl: 'https://docs.nestjs.com/guards',
  },
  {
    ...base, id: 'nestjs-prisma/guards/execution-order', topic: 'guards', type: 'mcq', level: 'intermediate', tags: ['request-lifecycle'],
    question: 'In the NestJS request lifecycle, which order is correct?',
    options: [
      'Middleware, guards, interceptors, pipes, handler',
      'Guards, middleware, pipes, interceptors, handler',
      'Pipes, guards, middleware, handler, interceptors',
      'Interceptors, middleware, guards, pipes, handler',
    ],
    answerIndex: 0,
    explanation: 'Middleware runs first, then guards, then interceptors (pre-handler), then pipes, then the route handler.',
    docsUrl: 'https://docs.nestjs.com/faq/request-lifecycle',
  },
  {
    ...base, id: 'nestjs-prisma/guards/public-guard-bug', topic: 'guards', type: 'bugspot', level: 'intermediate', tags: ['guards', 'auth'],
    language: 'ts',
    code: `@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization;
    return token !== undefined;
  }
}`,
    buggyLines: [6],
    explanation: 'Checking only that a header exists lets any string through. The guard must verify the token (signature, expiry) and attach the user to the request.',
    source: guardSource,
    docsUrl: 'https://docs.nestjs.com/guards#authorization-guard',
  },
  {
    ...base, id: 'nestjs-prisma/dto-validation/whitelist', topic: 'dto-validation', type: 'mcq', level: 'beginner', tags: ['validation'],
    question: 'What does ValidationPipe({ whitelist: true }) do?',
    options: [
      'Strips properties that have no validation decorator from the payload',
      'Allows only whitelisted IP addresses',
      'Skips validation for listed routes',
      'Logs invalid requests instead of rejecting them',
    ],
    answerIndex: 0,
    explanation: 'whitelist removes unknown properties, which protects against mass assignment. Add forbidNonWhitelisted to reject them with 400 instead.',
    source: { repo: 'maeshataruna99-lgtm/core-forge-light' },
    docsUrl: 'https://docs.nestjs.com/techniques/validation#stripping-properties',
  },
  {
    ...base, id: 'nestjs-prisma/relations/transaction', topic: 'relations', type: 'mcq', level: 'intermediate', tags: ['prisma', 'transactions'],
    question: 'When should you wrap several Prisma writes in prisma.$transaction?',
    options: [
      'When they must all succeed or all roll back together',
      'Whenever you use more than one model',
      'Only for read queries',
      'To make queries run in parallel faster',
    ],
    answerIndex: 0,
    explanation: '$transaction gives atomicity: if any operation throws, every write in the transaction is rolled back.',
    source: { repo: 'maeshataruna99-lgtm/core-forge-simrs' },
    docsUrl: 'https://www.prisma.io/docs/orm/prisma-client/queries/transactions',
  },
  {
    ...base, id: 'nestjs-prisma/migrations/dev-vs-deploy', topic: 'migrations', type: 'flashcard', level: 'intermediate', tags: ['prisma', 'migrations'],
    front: 'prisma migrate dev vs prisma migrate deploy',
    back: 'dev creates and applies migrations against a development database (and may reset it). deploy only applies existing, committed migrations and is what you run in CI/production.',
    explanation: 'Never run migrate dev against production: it can prompt to reset the database.',
    source: { repo: 'maeshataruna99-lgtm/core-forge-simrs', path: 'apps/api/prisma/schema/schema.prisma' },
    docsUrl: 'https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production',
  },
];
