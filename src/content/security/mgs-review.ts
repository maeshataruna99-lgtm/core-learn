import type { Card } from '../../core/types.ts';

export const cards: Card[] = [
  {
    id: 'security/code-review/idor-missing-owner',
    track: 'security',
    stack: 'nestjs',
    topic: 'code-review',
    type: 'bugspot',
    level: 'intermediate',
    tags: ['idor', 'authz', 'mgs-live-coding'],
    language: 'ts',
    code: `function getInvoice(
  invoice: { id: number; userId: number; total: number },
  actor: { id: number; role: string },
) {
  const canView = Boolean(actor);
  if (!canView) return { status: 403, error: 'FORBIDDEN' };
  return { status: 200, data: invoice };
}`,
    buggyLines: [5],
    fixedCode: `function getInvoice(
  invoice: { id: number; userId: number; total: number },
  actor: { id: number; role: string },
) {
  const canView = actor.role === 'ADMIN' || invoice.userId === actor.id;
  if (!canView) return { status: 403, error: 'FORBIDDEN' };
  return { status: 200, data: invoice };
}`,
    explanation: 'Checking only authentication without ownership lets any logged-in user read another user\'s invoice (IDOR). Always verify ownership or an admin role on the server before returning the record.',
    source: { repo: 'maeshataruna99-lgtm/core-learn', path: 'practice-mgs/part3-code-review.ts' },
    docsUrl: 'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/',
    proof: {
      harness: `/* CODE_HERE */
const res = getInvoice({ id: 1, userId: 10, total: 50000 }, { id: 99, role: 'USER' });
console.log(res.status);`,
      buggyOutput: '200',
      fixedOutput: '403',
    },
  },
  {
    id: 'security/code-review/mass-assignment-profile',
    track: 'security',
    stack: 'nestjs',
    topic: 'code-review',
    type: 'bugspot',
    level: 'intermediate',
    tags: ['mass-assignment', 'validation', 'mgs-live-coding'],
    language: 'ts',
    code: `function updateProfile(
  user: { name: string; role: string },
  body: Record<string, unknown>,
) {
  return { ...user, ...body };
}`,
    buggyLines: [5],
    fixedCode: `function updateProfile(
  user: { name: string; role: string },
  body: Record<string, unknown>,
) {
  const name = typeof body.name === 'string' ? body.name.trim() : user.name;
  return { ...user, name };
}`,
    explanation: 'Spreading raw request body into a domain object lets an attacker send { role: "ADMIN" } (Mass Assignment). Allowlist editable fields explicitly, or enable NestJS ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }).',
    source: { repo: 'maeshataruna99-lgtm/core-learn', path: 'practice-mgs/part3-code-review.ts' },
    docsUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html',
    proof: {
      harness: `/* CODE_HERE */
const updated = updateProfile({ name: 'Alice', role: 'USER' }, { name: 'Ali', role: 'ADMIN' });
console.log(updated.role);`,
      buggyOutput: 'ADMIN',
      fixedOutput: 'USER',
    },
  },
  {
    id: 'security/code-review/error-stack-leak',
    track: 'security',
    stack: 'nestjs',
    topic: 'code-review',
    type: 'bugspot',
    level: 'intermediate',
    tags: ['error-handling', 'info-leak', 'mgs-live-coding'],
    language: 'ts',
    code: `function toErrorResponse(err: Error) {
  return { status: 500, body: { error: err.message, stack: err.stack } };
}`,
    buggyLines: [2],
    fixedCode: `function toErrorResponse(err: Error) {
  void err;
  return { status: 500, body: { code: 'INTERNAL_ERROR', message: 'Internal server error' } };
}`,
    explanation: 'Returning err.message or err.stack exposes file paths, library versions, and SQL details to attackers. Log the error on the server and return a generic 500 payload with a stable error code.',
    source: { repo: 'maeshataruna99-lgtm/core-learn', path: 'practice-mgs/part3-code-review.ts' },
    docsUrl: 'https://owasp.org/www-community/Improper_Error_Handling',
    proof: {
      harness: `/* CODE_HERE */
const err = new Error('SQLITE_CONSTRAINT: users.email');
const res = toErrorResponse(err);
console.log(JSON.stringify(res.body).includes('SQLITE'));`,
      buggyOutput: 'true',
      fixedOutput: 'false',
    },
  },
  {
    id: 'security/code-review/prisma-raw-unsafe',
    track: 'security',
    stack: 'nestjs',
    topic: 'code-review',
    type: 'bugspot',
    level: 'intermediate',
    tags: ['injection', 'prisma', 'mgs-live-coding'],
    language: 'ts',
    code: `function searchTickets(
  prisma: { $queryRawUnsafe: (q: string) => string; $queryRaw: (s: TemplateStringsArray, v: string) => string },
  keyword: string,
) {
  return prisma.$queryRawUnsafe(\`SELECT id FROM Ticket WHERE title LIKE '%\${keyword}%'\`);
}`,
    buggyLines: [5],
    fixedCode: `function searchTickets(
  prisma: { $queryRawUnsafe: (q: string) => string; $queryRaw: (s: TemplateStringsArray, v: string) => string },
  keyword: string,
) {
  return prisma.$queryRaw\`SELECT id FROM Ticket WHERE title LIKE \${\`%\${keyword}%\`}\`;
}`,
    explanation: 'Prisma $queryRawUnsafe sends a plain concatenated string to the database, enabling SQL injection. Use tagged template $queryRaw so interpolated values travel as bound parameters.',
    source: { repo: 'maeshataruna99-lgtm/core-learn', path: 'practice-mgs/part3-prisma-review.ts' },
    docsUrl: 'https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries',
    proof: {
      harness: `/* CODE_HERE */
const db = {
  $queryRawUnsafe: (q: string) => 'UNSAFE:' + q,
  $queryRaw: (_s: TemplateStringsArray, v: string) => 'PARAM:' + v,
};
console.log(searchTickets(db, "' OR 1=1 --").split(':')[0]);`,
      buggyOutput: 'UNSAFE',
      fixedOutput: 'PARAM',
    },
  },
  {
    id: 'nestjs-prisma/concurrency/atomic-status-update',
    track: 'nestjs-prisma',
    stack: 'nestjs',
    topic: 'concurrency',
    type: 'bugspot',
    level: 'advanced',
    tags: ['concurrency', 'prisma', 'state-machine', 'mgs-live-coding'],
    language: 'ts',
    code: `async function closeTicket(
  db: { read: () => Promise<string>; write: (s: string) => Promise<void>; updateIf: (from: string, to: string) => Promise<number> },
) {
  const status = await db.read();
  if (status !== 'OPEN') return 409;
  await db.write('DONE');
  return 200;
}`,
    buggyLines: [4, 5, 6],
    fixedCode: `async function closeTicket(
  db: { read: () => Promise<string>; write: (s: string) => Promise<void>; updateIf: (from: string, to: string) => Promise<number> },
) {
  const count = await db.updateIf('OPEN', 'DONE');
  if (count === 0) return 409;
  return 200;
}`,
    explanation: 'Read-then-write has a race window: two concurrent requests both read OPEN and both write DONE. Combine the check and write into one conditional update (Prisma updateMany with status in the where clause) so only one wins and the other gets 409.',
    source: { repo: 'maeshataruna99-lgtm/core-learn', path: 'practice-mgs/api/src/tickets/tickets.service.ts' },
    docsUrl: 'https://www.prisma.io/docs/orm/prisma-client/queries/transactions',
    proof: {
      harness: `/* CODE_HERE */
let current = 'OPEN';
const db = {
  read: async () => { const s = current; await Promise.resolve(); return s; },
  write: async (next: string) => { current = next; },
  updateIf: async (from: string, to: string) => {
    if (current !== from) return 0;
    current = to;
    return 1;
  },
};
const results = await Promise.all([closeTicket(db), closeTicket(db)]);
console.log(results.sort().join(','));`,
      buggyOutput: '200,200',
      fixedOutput: '200,409',
    },
  },
];
