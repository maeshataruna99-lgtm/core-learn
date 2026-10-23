import type { Card } from '../../core/types.ts';

const base = { track: 'security', stack: 'nestjs' } as const;

export const cards: Card[] = [
  {
    ...base, id: 'security/sql-injection/queryraw-template', topic: 'sql-injection', type: 'bugspot', level: 'intermediate', tags: ['injection', 'prisma'],
    language: 'ts',
    code: `async function findByEmail(email: string) {
  return prisma.$queryRawUnsafe(
    \`SELECT id, name FROM users WHERE email = '\${email}'\`,
  );
}`,
    buggyLines: [3],
    fixedCode: `async function findByEmail(email: string) {
  return prisma.$queryRaw(
    Prisma.sql\`SELECT id, name FROM users WHERE email = \${email}\`,
  );
}`,
    explanation: 'Interpolating input into a raw query allows SQL injection (email = "x\' OR 1=1 --"). Use the tagged prisma.$queryRaw`... ${email}` form, which parameterizes values.',
    source: { repo: 'maeshataruna99-lgtm/core-forge-light' },
    docsUrl: 'https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries',
  },
  {
    ...base, id: 'security/authn-authz/authn-vs-authz', topic: 'authn-authz', type: 'mcq', level: 'beginner', tags: ['auth'],
    question: 'A user is logged in but requests another user\'s invoice and gets a 403. Which check failed?',
    options: ['Authorization', 'Authentication', 'Input validation', 'Rate limiting'],
    answerIndex: 0,
    explanation: 'Authentication proves who you are (401 when missing or invalid). Authorization decides what you may do (403 when forbidden).',
    docsUrl: 'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/',
  },
  {
    ...base, id: 'security/password-storage/hash-choice', topic: 'password-storage', type: 'mcq', level: 'beginner', tags: ['passwords'],
    question: 'How should user passwords be stored?',
    options: [
      'Salted hash from a slow algorithm such as argon2 or bcrypt',
      'Encrypted with AES so they can be recovered',
      'Hashed with SHA-256, unsalted',
      'Plain text behind a firewall',
    ],
    answerIndex: 0,
    explanation: 'Slow, salted password hashes resist brute force and rainbow tables. Fast hashes like plain SHA-256 are cheap to crack at scale.',
    source: { repo: 'maeshataruna99-lgtm/core-forge-light' },
    docsUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html',
  },
  {
    ...base, id: 'security/rate-limiting/why-login', topic: 'rate-limiting', type: 'flashcard', level: 'intermediate', tags: ['rate-limit'],
    front: 'Why rate limit the login endpoint more strictly than the rest of the API?',
    back: 'To slow credential stuffing and brute-force guessing. Limit per IP and per account, and return the same response for unknown users and wrong passwords.',
    explanation: 'Login is the one endpoint where an attacker can try unlimited guesses against a real secret.',
    source: { repo: 'maeshataruna99-lgtm/core-forge-light', path: 'apps/api/src/auth/auth-rate-limit.guard.ts' },
    docsUrl: 'https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/',
  },
];
