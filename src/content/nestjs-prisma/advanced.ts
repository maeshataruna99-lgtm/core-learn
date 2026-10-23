import type { Card } from '../../core/types.ts';

const base = { track: 'nestjs-prisma', stack: 'nestjs' } as const;
const light = 'maeshataruna99-lgtm/core-forge-light';
const nest = 'https://docs.nestjs.com';
const prisma = 'https://www.prisma.io/docs/orm';

export const cards: Card[] = [
  // ---- interceptors ----
  {
    ...base, topic: 'interceptors', id: 'nestjs-prisma/interceptors/what-they-wrap', type: 'mcq', level: 'intermediate', tags: ['interceptors', 'rxjs'],
    question: 'What can a NestJS interceptor do that a guard cannot?',
    options: [
      'Run logic before and after the handler, and transform or time out the response stream',
      'Reject a request before routing',
      'Register providers',
      'Change the HTTP method',
    ],
    answerIndex: 0,
    explanation: 'An interceptor receives a CallHandler and returns an RxJS Observable, so it wraps the handler: it can measure time, map the result, catch errors or end the request early. A guard only answers yes or no beforehand.',
    docsUrl: `${nest}/interceptors`,
  },
  {
    ...base, topic: 'interceptors', id: 'nestjs-prisma/interceptors/promise-not-cancelled', type: 'mcq', level: 'advanced', tags: ['interceptors', 'timeouts'],
    question: 'core-forge\'s RequestTimeoutInterceptor answers 503 after 30 seconds, but a promise-based handler is still running. Why is that?',
    options: [
      'A JavaScript promise cannot be cancelled, so the interceptor can only stop waiting for it',
      'Nest keeps handlers alive on purpose',
      'The 503 is sent only after the handler finishes',
      'RxJS timeouts do not work with async functions',
    ],
    answerIndex: 0,
    explanation: 'The response ends, but the work continues. That is why the interceptor still observes the late result, discards it and logs how long the handler really took, and why database waits need their own limits (pool and transaction timeouts).',
    source: { repo: light, path: 'apps/api/src/common/request-timeout.interceptor.ts' },
    docsUrl: `${nest}/interceptors#more-operators`,
  },
  {
    ...base, topic: 'interceptors', id: 'nestjs-prisma/interceptors/exempt-uploads', type: 'flashcard', level: 'intermediate', tags: ['interceptors', 'uploads'],
    front: 'Why does core-forge exempt POST /uploads from its 30-second request timeout?',
    back: 'Uploads stream a file body over slow connections, so a fixed short limit would abort legitimate requests. They rely on the reverse proxy\'s own limits instead.',
    explanation: 'Match the timeout to the route\'s real behaviour. The interceptor keys the exemption on "METHOD route-pattern", not on the raw path, so path values never leak into logs.',
    source: { repo: light, path: 'apps/api/src/common/request-timeout.interceptor.ts' },
    docsUrl: `${nest}/interceptors`,
  },
  // ---- pipes ----
  {
    ...base, topic: 'pipes', id: 'nestjs-prisma/pipes/parse-int', type: 'flashcard', level: 'beginner', tags: ['pipes'],
    front: 'What does `@Param("id", ParseIntPipe) id: number` do for an invalid id like "abc"?',
    back: 'ParseIntPipe transforms "12" to 12 and throws a BadRequestException (400) for a value that is not an integer, before your handler runs.',
    explanation: 'Pipes do two jobs: transformation and validation. Without it the handler would receive the string "abc".',
    docsUrl: `${nest}/pipes#transformation-use-case`,
  },
  {
    ...base, topic: 'pipes', id: 'nestjs-prisma/pipes/forbid-non-whitelisted', type: 'mcq', level: 'intermediate', tags: ['pipes', 'validation'],
    question: 'core-forge uses `new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })`. A client sends an extra property "isAdmin". What happens?',
    options: [
      'The request is rejected with 400 because the property is not whitelisted',
      'The property is silently removed',
      'The property is kept',
      'The server crashes',
    ],
    answerIndex: 0,
    explanation: 'whitelist alone strips unknown properties silently. Adding forbidNonWhitelisted turns that into an error, which makes mass-assignment attempts visible instead of quietly ignored.',
    source: { repo: light, path: 'apps/api/src/main.ts' },
    docsUrl: `${nest}/techniques/validation#stripping-properties`,
  },
  // ---- exception-filters ----
  {
    ...base, topic: 'exception-filters', id: 'nestjs-prisma/exception-filters/http-exceptions', type: 'mcq', level: 'beginner', tags: ['errors', 'http'],
    question: 'A service throws `new NotFoundException("Invoice not found")`. What does the client receive by default?',
    options: ['404 with a JSON body containing the message', '500 Internal Server Error', '200 with null', '400 Bad Request'],
    answerIndex: 0,
    explanation: 'Nest\'s built-in exception layer turns HttpException subclasses into matching status codes and a JSON body. Unknown errors become 500 with a generic message.',
    docsUrl: `${nest}/exception-filters#built-in-http-exceptions`,
  },
  {
    ...base, topic: 'exception-filters', id: 'nestjs-prisma/exception-filters/prisma-error-codes', type: 'mcq', level: 'intermediate', tags: ['prisma', 'errors'],
    question: 'Creating a user with an email that already exists throws a PrismaClientKnownRequestError. Which code and HTTP status should you map it to?',
    options: ['P2002 (unique constraint) to 409 Conflict', 'P2025 (record not found) to 404', 'P1001 (cannot reach database) to 400', 'P2002 to 500'],
    answerIndex: 0,
    explanation: 'P2002 means a unique constraint failed, which is a conflict with existing data. P2025 is "record to update/delete not found". Mapping known codes in an exception filter keeps database details out of responses.',
    docsUrl: `${prisma}/reference/error-reference#p2002`,
  },
  // ---- lifecycle ----
  {
    ...base, topic: 'lifecycle', id: 'nestjs-prisma/lifecycle/shutdown-hooks', type: 'mcq', level: 'intermediate', tags: ['lifecycle', 'deployment'],
    question: 'Why does core-forge call `app.enableShutdownHooks()`?',
    options: [
      'So SIGTERM from a rollout lets in-flight requests finish and Prisma/Redis close cleanly',
      'To reload the app when files change',
      'To disable graceful shutdown',
      'To enable logging',
    ],
    answerIndex: 0,
    explanation: 'Without shutdown hooks Nest ignores termination signals, so connections are cut mid-request. With them, OnModuleDestroy and similar hooks run, which is where a database client disconnects.',
    source: { repo: light, path: 'apps/api/src/main.ts' },
    docsUrl: `${nest}/fundamentals/lifecycle-events#application-shutdown`,
  },
  {
    ...base, topic: 'lifecycle', id: 'nestjs-prisma/lifecycle/module-init-vs-bootstrap', type: 'flashcard', level: 'intermediate', tags: ['lifecycle'],
    front: 'OnModuleInit vs OnApplicationBootstrap',
    back: 'onModuleInit runs once a module\'s own dependencies are resolved. onApplicationBootstrap runs after every module has initialized and before the app starts listening, so it is safe to rely on other modules being ready.',
    explanation: 'Use onModuleInit for local setup (connect a client) and onApplicationBootstrap for work that needs the whole graph, such as seeding data.',
    docsUrl: `${nest}/fundamentals/lifecycle-events`,
  },
  // ---- testing ----
  {
    ...base, topic: 'testing', id: 'nestjs-prisma/testing/mock-raw-query', type: 'mcq', level: 'advanced', tags: ['testing', 'prisma', 'security'],
    question: 'core-forge\'s test reads `prisma.$queryRaw.mock.calls[0]` as `[strings, ...values]`. What does that prove?',
    options: [
      'User input was passed as separate values, not concatenated into the SQL text',
      'The query returned rows',
      'The database is running',
      'The query is fast',
    ],
    answerIndex: 0,
    explanation: 'A tagged template call receives the SQL fragments and the interpolated values separately. Asserting that the values arrive in the second part is a unit test for "this query is parameterized".',
    source: { repo: light, path: 'apps/api/src/access/member-names.test.ts' },
    docsUrl: `${prisma}/prisma-client/using-raw-sql/raw-queries`,
  },
  {
    ...base, topic: 'testing', id: 'nestjs-prisma/testing/override-provider', type: 'flashcard', level: 'intermediate', tags: ['testing', 'di'],
    front: 'How do you replace a real provider with a fake in a Nest test?',
    back: 'Build a test module with Test.createTestingModule({ imports: [AppModule] }).overrideProvider(PrismaClient).useValue(fake), then compile() it.',
    explanation: 'Explicit injection tokens, as core-forge uses, make overriding straightforward because the token is the class itself.',
    docsUrl: `${nest}/fundamentals/testing#overriding-globally-registered-enhancers`,
  },
  // ---- config ----
  {
    ...base, topic: 'config', id: 'nestjs-prisma/config/fail-fast-env', type: 'mcq', level: 'intermediate', tags: ['config', 'deployment'],
    question: 'core-forge\'s `trustedProxyHops()` throws at startup if TRUST_PROXY_HOPS is not an integer from 0 to 5. Why fail at boot?',
    options: [
      'A wrong value silently keys rate limits to a proxy address, so a bad configuration should stop the deployment',
      'Because exceptions are faster than defaults',
      'Because Express requires it',
      'To make tests pass',
    ],
    answerIndex: 0,
    explanation: 'Validate configuration once, at startup, and crash loudly. A misconfigured proxy count would otherwise quietly weaken the rate limiter in production.',
    source: { repo: light, path: 'apps/api/src/main.ts' },
    docsUrl: 'https://expressjs.com/en/guide/behind-proxies.html',
  },
  // ---- prisma-queries ----
  {
    ...base, topic: 'prisma-queries', id: 'nestjs-prisma/prisma-queries/transaction-timeout', type: 'mcq', level: 'advanced', tags: ['prisma', 'transactions'],
    question: 'An interactive Prisma transaction runs for 8 seconds with default options. What happens?',
    options: [
      'It times out (default 5 seconds) and is rolled back',
      'It commits normally',
      'It waits forever',
      'Prisma retries it automatically',
    ],
    answerIndex: 0,
    explanation: 'Interactive transactions default to maxWait 2 s (to get a connection) and timeout 5 s. Keep them short, never call slow external services inside one, and raise the limits deliberately when needed.',
    source: { repo: light },
    docsUrl: `${prisma}/reference/prisma-client-reference`,
  },
  {
    ...base, topic: 'prisma-queries', id: 'nestjs-prisma/prisma-queries/find-unique-vs-first', type: 'flashcard', level: 'beginner', tags: ['prisma', 'queries'],
    front: 'findUnique vs findFirst in Prisma',
    back: 'findUnique requires a unique field (@id, @unique or @@unique) in where and returns at most one record. findFirst accepts any filter and ordering and returns the first match.',
    explanation: 'Filtering by id plus companyId for tenant scoping needs findFirst (or a compound unique), because that combination is not unique unless you declare it.',
    docsUrl: `${prisma}/reference/prisma-client-reference#findunique`,
  },
  // ---- guards (more) ----
  {
    ...base, topic: 'guards', id: 'nestjs-prisma/guards/global-guard-no-di', type: 'mcq', level: 'advanced', tags: ['guards', 'di'],
    question: 'main.ts registers `app.useGlobalGuards(new ApiRateLimitGuard())`. What limitation does that registration style have?',
    options: [
      'A guard created outside a module cannot have dependencies injected',
      'It only runs on GET routes',
      'It runs after the handler',
      'It disables other guards',
    ],
    answerIndex: 0,
    explanation: 'To inject providers into a global guard, register it in a module with the APP_GUARD token instead. The rate-limit guard works because it builds its own store and needs nothing from the container.',
    source: { repo: light, path: 'apps/api/src/rate-limit/api-rate-limit.guard.ts' },
    docsUrl: `${nest}/guards#binding-guards`,
  },
];
