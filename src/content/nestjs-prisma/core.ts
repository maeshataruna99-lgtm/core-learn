import type { Card } from '../../core/types.ts';

const base = { track: 'nestjs-prisma', stack: 'nestjs' } as const;
const light = 'maeshataruna99-lgtm/core-forge-light';
const simrs = 'maeshataruna99-lgtm/core-forge-simrs';
const nest = 'https://docs.nestjs.com';
const prisma = 'https://www.prisma.io/docs/orm';

export const cards: Card[] = [
  // ---- modules ----
  {
    ...base, topic: 'modules', id: 'nestjs-prisma/modules/exports', type: 'mcq', level: 'beginner', tags: ['modules', 'di'],
    question: 'ModuleB imports ModuleA and injects AService, but Nest says it cannot resolve the dependency. What is most likely missing?',
    options: [
      'ModuleA does not list AService in exports',
      'AService needs @Controller()',
      'ModuleB must list AService in controllers',
      'AService must be a singleton',
    ],
    answerIndex: 0,
    explanation: 'Providers are private to their module. A provider is visible to importing modules only if it is listed in exports.',
    docsUrl: `${nest}/modules#shared-modules`,
  },
  {
    ...base, topic: 'modules', id: 'nestjs-prisma/modules/global-module', type: 'flashcard', level: 'intermediate', tags: ['modules'],
    front: 'When is @Global() on a module a good idea?',
    back: 'Rarely: for truly app-wide infrastructure such as a database client or config. Everything else should be imported explicitly so dependencies stay visible.',
    explanation: 'Global modules hide dependencies; overusing them makes the module graph hard to reason about.',
    docsUrl: `${nest}/modules#global-modules`,
  },
  // ---- di ----
  {
    ...base, topic: 'di', id: 'nestjs-prisma/di/default-scope', type: 'mcq', level: 'beginner', tags: ['di', 'scope'],
    question: 'What is the default scope of a Nest provider?',
    options: ['Singleton, shared for the whole application', 'One instance per request', 'One instance per injection', 'One instance per module import'],
    answerIndex: 0,
    explanation: 'Providers are singletons by default. Request scope creates an instance per request and bubbles up to every provider that depends on it, which costs performance.',
    docsUrl: `${nest}/fundamentals/injection-scopes`,
  },
  {
    ...base, topic: 'di', id: 'nestjs-prisma/di/inject-token', type: 'flashcard', level: 'intermediate', tags: ['di', 'tokens'],
    front: 'Why does core-forge write `@Inject(PrismaClient) private readonly prisma: PrismaClient` instead of just the constructor type?',
    back: 'An explicit @Inject token does not depend on emitted decorator metadata (emitDecoratorMetadata), so it also works with bundlers and test runners that do not emit it.',
    explanation: 'With emitDecoratorMetadata Nest infers the token from the parameter type; explicit tokens are also needed for interfaces and string tokens.',
    source: { repo: light, path: 'apps/api/src/auth/auth.guard.ts' },
    docsUrl: `${nest}/fundamentals/custom-providers`,
  },
  {
    ...base, topic: 'di', id: 'nestjs-prisma/di/use-factory', type: 'mcq', level: 'advanced', tags: ['di', 'providers'],
    question: 'Which custom provider form builds a value from other injected providers (for example config)?',
    options: ['useFactory with inject: [...]', 'useValue', 'useClass only', 'exports'],
    answerIndex: 0,
    explanation: 'useFactory runs a function at startup and can receive other providers through inject. useValue supplies a constant.',
    docsUrl: `${nest}/fundamentals/custom-providers#factory-providers-usefactory`,
  },
  // ---- guards (more) ----
  {
    ...base, topic: 'guards', id: 'nestjs-prisma/guards/401-vs-403', type: 'mcq', level: 'intermediate', tags: ['guards', 'http'],
    question: 'A guard returns false for a logged-in user who lacks permission. Which response does Nest send by default?',
    options: ['403 Forbidden', '401 Unauthorized', '400 Bad Request', '500 Internal Server Error'],
    answerIndex: 0,
    explanation: 'Returning false yields ForbiddenException (403). To signal a missing or invalid credential, throw UnauthorizedException (401), as core-forge does.',
    source: { repo: light, path: 'apps/api/src/auth/auth.guard.ts' },
    docsUrl: `${nest}/guards`,
  },
  {
    ...base, topic: 'guards', id: 'nestjs-prisma/guards/recheck-user', type: 'mcq', level: 'advanced', tags: ['guards', 'auth', 'jwt'],
    question: 'core-forge\'s AuthGuard verifies the access token and then loads the user from the database on every request. Why?',
    options: [
      'So disabled accounts and changed roles take effect immediately instead of when the token expires',
      'Because JWTs cannot be verified without a database',
      'To refresh the token on each call',
      'To count requests per user',
    ],
    answerIndex: 0,
    explanation: 'A signed token stays valid until it expires. Re-checking the account trades one query per request for immediate revocation.',
    source: { repo: light, path: 'apps/api/src/auth/auth.guard.ts' },
    docsUrl: 'https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/',
  },
  // ---- dto-validation ----
  {
    ...base, topic: 'dto-validation', id: 'nestjs-prisma/dto-validation/undecorated-dto', type: 'bugspot', level: 'beginner', tags: ['validation', 'dto'],
    language: 'ts',
    code: `// main.ts: app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
export class CreateUserDto {
  email: string;
  name: string;
}`,
    buggyLines: [3, 4],
    explanation: 'With whitelist: true every property without a class-validator decorator is stripped, so the handler receives an empty object. Decorate each field, for example @IsEmail() and @IsString().',
    source: { repo: light },
    docsUrl: `${nest}/techniques/validation#stripping-properties`,
  },
  {
    ...base, topic: 'dto-validation', id: 'nestjs-prisma/dto-validation/max-length-password', type: 'mcq', level: 'intermediate', tags: ['validation', 'security'],
    question: 'ChangePasswordDto in core-forge uses @MinLength(12) and @MaxLength(128) on the new password. Why is there a maximum?',
    options: [
      'Hashing very long inputs wastes CPU and can be abused for denial of service',
      'Databases cannot store long strings',
      'Passwords over 128 characters are insecure',
      'It makes the DTO faster to parse',
    ],
    answerIndex: 0,
    explanation: 'Every unauthenticated or low-privilege input needs an upper bound. Password hashing is deliberately expensive, so unbounded input is a cheap way to burn server CPU.',
    source: { repo: light, path: 'apps/api/src/account/dto/change-password.dto.ts' },
    docsUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html',
  },
  {
    ...base, topic: 'dto-validation', id: 'nestjs-prisma/dto-validation/transform', type: 'flashcard', level: 'intermediate', tags: ['validation', 'pipes'],
    front: 'What does `transform: true` in ValidationPipe add?',
    back: 'It converts the plain request body into an instance of the DTO class and converts primitives such as route params to the declared types (for example a string id to a number).',
    explanation: 'Without it the handler receives a plain object, so class methods and implicit conversion are not available.',
    docsUrl: `${nest}/techniques/validation#transform-payload-objects`,
  },
  // ---- relations ----
  {
    ...base, topic: 'relations', id: 'nestjs-prisma/relations/select-vs-include', type: 'flashcard', level: 'beginner', tags: ['prisma', 'queries'],
    front: 'Prisma `select` vs `include`',
    back: 'include returns all scalar fields plus the listed relations. select returns only the fields you name (including nested relation selections). You cannot use both at the same level.',
    explanation: 'core-forge\'s guard uses select to fetch just isRoot, disabledAt and the membership role: smaller rows, no accidental data leaks.',
    source: { repo: light, path: 'apps/api/src/auth/auth.guard.ts' },
    docsUrl: `${prisma}/prisma-client/queries/select-fields`,
  },
  {
    ...base, topic: 'relations', id: 'nestjs-prisma/relations/soft-delete-index', type: 'mcq', level: 'intermediate', tags: ['prisma', 'index', 'soft-delete'],
    question: 'The file model has `deletedAt DateTime?` and `@@index([deletedAt])`. What query pattern does the index serve?',
    options: [
      'Filtering active rows with where: { deletedAt: null }',
      'Sorting by name',
      'Joining on uploadedBy',
      'Counting all rows',
    ],
    answerIndex: 0,
    explanation: 'Soft delete keeps rows and marks them with a timestamp. Almost every read then filters on deletedAt, so it is worth indexing (or using a partial index).',
    source: { repo: simrs, path: 'apps/api/prisma/schema/file.prisma' },
    docsUrl: `${prisma}/prisma-schema/data-model/indexes`,
  },
  {
    ...base, topic: 'relations', id: 'nestjs-prisma/relations/updated-at-map', type: 'flashcard', level: 'beginner', tags: ['prisma', 'schema'],
    front: 'What do `@updatedAt` and `@@map("file")` do in a Prisma model?',
    back: '@updatedAt makes Prisma Client set the field to the current time on every update. @@map("file") maps the model to the database table named "file" instead of the model name.',
    explanation: '@updatedAt is maintained by Prisma Client, not a database trigger, so raw SQL updates will not touch it.',
    source: { repo: simrs, path: 'apps/api/prisma/schema/file.prisma' },
    docsUrl: `${prisma}/reference/prisma-schema-reference#updatedat`,
  },
  {
    ...base, topic: 'relations', id: 'nestjs-prisma/relations/composite-index-order', type: 'mcq', level: 'advanced', tags: ['prisma', 'index'],
    question: 'The file model declares `@@index([isTemp, uploadedAt])`. Which query benefits most?',
    options: [
      'where: { isTemp: true, uploadedAt: { lt: cutoff } } to find stale temp uploads',
      'where: { uploadedAt: { lt: cutoff } } only',
      'orderBy: { objectKey: "asc" }',
      'None, composite indexes are ignored by PostgreSQL',
    ],
    answerIndex: 0,
    explanation: 'Equality on the leading column plus a range on the second is the ideal shape for a composite index, such as a cleanup job for temporary files.',
    source: { repo: simrs, path: 'apps/api/prisma/schema/file.prisma' },
    docsUrl: 'https://www.postgresql.org/docs/current/indexes-multicolumn.html',
  },
  // ---- migrations ----
  {
    ...base, topic: 'migrations', id: 'nestjs-prisma/migrations/generate', type: 'flashcard', level: 'beginner', tags: ['prisma'],
    front: 'You changed schema.prisma. What does `prisma generate` do versus `prisma migrate dev`?',
    back: 'generate rebuilds the typed Prisma Client from the schema and touches no database. migrate dev creates a SQL migration, applies it to the dev database, and then runs generate.',
    explanation: 'After pulling someone else\'s schema change you often only need generate (plus migrate deploy) to get the new types.',
    docsUrl: `${prisma}/prisma-client/setup-and-configuration/generating-prisma-client`,
  },
  {
    ...base, topic: 'migrations', id: 'nestjs-prisma/migrations/edit-applied', type: 'mcq', level: 'intermediate', tags: ['prisma', 'migrations'],
    question: 'A migration has already been applied in production. A column name in it was wrong. What is the right fix?',
    options: [
      'Add a new migration that renames the column',
      'Edit the applied migration file',
      'Delete the migrations folder',
      'Run prisma migrate reset in production',
    ],
    answerIndex: 0,
    explanation: 'Applied migrations are history. Prisma stores a checksum, and editing the file causes drift errors. Always move forward with a new migration.',
    docsUrl: `${prisma}/prisma-migrate/understand-prisma-migrate/mental-model`,
  },
];
