import type { Card } from '../../core/types.ts';

const base = { track: 'security', stack: 'nestjs' } as const;
const light = 'maeshataruna99-lgtm/core-forge-light';
const owasp = 'https://owasp.org/API-Security/editions/2023/en';
const cheat = 'https://cheatsheetseries.owasp.org/cheatsheets';

export const cards: Card[] = [
  // ---- sql-injection ----
  {
    ...base, topic: 'sql-injection', id: 'security/sql-injection/concat-vs-bind', type: 'output', level: 'intermediate', tags: ['injection', 'sql'],
    language: 'js',
    code: `const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(':memory:');
db.exec("CREATE TABLE users (id INTEGER, name TEXT); INSERT INTO users VALUES (1,'ann'),(2,'bob')");
const name = "x' OR '1'='1";
console.log(db.prepare(\`SELECT name FROM users WHERE name = '\${name}'\`).all().length);
console.log(db.prepare('SELECT name FROM users WHERE name = ?').all(name).length);`,
    options: ['0 then 0', '2 then 0', '2 then 2', '0 then 2'],
    answerIndex: 1,
    verifiedOutput: '2\n0',
    explanation: 'Concatenating the input turns the WHERE clause into name = \'x\' OR \'1\'=\'1\', which matches every row. A bound parameter is treated as data, so nothing matches the literal string.',
    docsUrl: `${cheat}/SQL_Injection_Prevention_Cheat_Sheet.html`,
  },
  {
    ...base, topic: 'sql-injection', id: 'security/sql-injection/dynamic-order-by', type: 'mcq', level: 'advanced', tags: ['injection', 'sql'],
    question: 'You build `ORDER BY ${sort}` from a query-string value. Bound parameters cannot be used for column names. What is the safe approach?',
    options: [
      'Map the input to a fixed allowlist of column names and reject anything else',
      'Escape single quotes in the value',
      'Lower-case the value',
      'Wrap it in parentheses',
    ],
    answerIndex: 0,
    explanation: 'Identifiers and keywords cannot be parameterized, so validate them against a closed set you control.',
    docsUrl: `${cheat}/SQL_Injection_Prevention_Cheat_Sheet.html#defense-option-3-allow-list-input-validation`,
  },
  // ---- authn-authz (more) ----
  {
    ...base, topic: 'authn-authz', id: 'security/authn-authz/bola', type: 'bugspot', level: 'intermediate', tags: ['bola', 'authorization'],
    language: 'ts',
    code: `@Get('invoices/:id')
@UseGuards(AuthGuard)
async getInvoice(@Param('id') id: string) {
  return this.prisma.invoice.findUnique({ where: { id } });
}`,
    buggyLines: [4],
    explanation: 'Authentication passes, but nothing checks that the invoice belongs to the caller\'s company. That is Broken Object Level Authorization (OWASP API1). Scope the query: where: { id, companyId: req.user.companyId }.',
    source: { repo: light, path: 'apps/api/src/company/membership/company-admin.guard.ts' },
    docsUrl: `${owasp}/0xa1-broken-object-level-authorization/`,
  },
  {
    ...base, topic: 'authn-authz', id: 'security/authn-authz/jwt-expiry-revocation', type: 'mcq', level: 'intermediate', tags: ['jwt'],
    question: 'Why do access tokens usually have a short lifetime (minutes) paired with a longer-lived refresh token?',
    options: [
      'A stolen access token is only useful briefly, and the refresh token can be revoked server-side',
      'Short tokens are cheaper to sign',
      'Browsers delete long tokens',
      'JWT libraries reject tokens over 1 hour',
    ],
    answerIndex: 0,
    explanation: 'A self-contained JWT cannot be revoked before it expires, so you limit the damage window and keep revocation on the refresh path.',
    source: { repo: light, path: 'apps/api/src/auth/auth.service.ts' },
    docsUrl: `${cheat}/JSON_Web_Token_for_Java_Cheat_Sheet.html`,
  },
  {
    ...base, topic: 'authn-authz', id: 'security/authn-authz/rbac-vs-ownership', type: 'flashcard', level: 'intermediate', tags: ['rbac', 'authorization'],
    front: 'Why is role-based access control (RBAC) alone not enough for authorization?',
    back: 'Roles say what kind of actions a user may do (edit invoices), not which objects (only this company\'s invoices). You also need ownership/tenant checks on every object access.',
    explanation: 'core-forge checks both: a role in the company membership and the company context carried by the token.',
    source: { repo: light, path: 'apps/api/src/auth/auth.guard.ts' },
    docsUrl: `${cheat}/Authorization_Cheat_Sheet.html`,
  },
  {
    ...base, topic: 'authn-authz', id: 'security/authn-authz/jwt-alg-none', type: 'mcq', level: 'advanced', tags: ['jwt'],
    question: 'What is the safe way to verify a JWT on the server?',
    options: [
      'Verify the signature with a fixed, expected algorithm and key, never trusting the alg from the token header',
      'Decode the payload and check the exp claim',
      'Accept whatever algorithm the header declares',
      'Compare the token string with the last one issued',
    ],
    answerIndex: 0,
    explanation: 'Decoding is not verifying. Historic attacks used alg: none or swapped RS256 for HS256, so the verifier must pin the algorithm.',
    docsUrl: `${cheat}/JSON_Web_Token_for_Java_Cheat_Sheet.html`,
  },
  // ---- password-storage (more) ----
  {
    ...base, topic: 'password-storage', id: 'security/password-storage/salt-effect', type: 'output', level: 'intermediate', tags: ['hashing', 'salt'],
    language: 'js',
    code: `const { scryptSync, randomBytes } = require('node:crypto');
const hash = (pw, salt) => scryptSync(pw, salt, 32).toString('hex');
const s1 = randomBytes(16);
const s2 = randomBytes(16);
console.log(hash('pw', s1) === hash('pw', s1), hash('pw', s1) === hash('pw', s2));`,
    options: ['true true', 'true false', 'false true', 'false false'],
    answerIndex: 1,
    verifiedOutput: 'true false',
    explanation: 'The same password and salt always give the same hash (so you can verify), but a different salt gives a different hash. Per-user salts stop attackers reusing one precomputed table for every account.',
    docsUrl: `${cheat}/Password_Storage_Cheat_Sheet.html`,
  },
  {
    ...base, topic: 'password-storage', id: 'security/password-storage/same-error', type: 'mcq', level: 'intermediate', tags: ['login', 'enumeration'],
    question: 'Login fails. Which response is best for the client?',
    options: [
      'The same generic "invalid email or password" message whether the email exists or not',
      '"No account with that email" for unknown emails',
      '"Wrong password" for known emails',
      'The stack trace',
    ],
    answerIndex: 0,
    explanation: 'Distinct messages (or timing differences) let attackers enumerate which emails are registered.',
    docsUrl: `${cheat}/Authentication_Cheat_Sheet.html#authentication-and-error-messages`,
  },
  // ---- input-validation ----
  {
    ...base, topic: 'input-validation', id: 'security/input-validation/mass-assignment', type: 'output', level: 'intermediate', tags: ['mass-assignment', 'validation'],
    language: 'js',
    code: `const body = JSON.parse('{"name":"x","isAdmin":true}');
const pick = ({ name }) => ({ name });
console.log(JSON.stringify(pick(body)));`,
    options: ['{"name":"x","isAdmin":true}', '{"name":"x"}', '{"isAdmin":true}', '{}'],
    answerIndex: 1,
    verifiedOutput: '{"name":"x"}',
    explanation: 'Copying the whole request body into a database write lets a caller set fields like isAdmin (OWASP mass assignment). Pick an explicit allowlist, or use a DTO with ValidationPipe whitelist: true.',
    source: { repo: light },
    docsUrl: `${cheat}/Mass_Assignment_Cheat_Sheet.html`,
  },
  {
    ...base, topic: 'input-validation', id: 'security/input-validation/path-traversal', type: 'bugspot', level: 'advanced', tags: ['path-traversal', 'files'],
    language: 'ts',
    code: `@Get('files/:name')
download(@Param('name') name: string, @Res() res: Response) {
  const file = join(UPLOAD_DIR, name);
  return res.sendFile(file);
}`,
    buggyLines: [3],
    explanation: 'A name such as ../../etc/passwd (URL-encoded) escapes UPLOAD_DIR. Resolve the path and verify it still starts with the upload directory, or look files up by an id that maps to a stored path.',
    docsUrl: 'https://owasp.org/www-community/attacks/Path_Traversal',
  },
  {
    ...base, topic: 'input-validation', id: 'security/input-validation/validate-server-side', type: 'flashcard', level: 'beginner', tags: ['validation'],
    front: 'Why is client-side validation never enough?',
    back: 'Attackers skip the UI and send requests directly. Client checks are for user experience; the server must validate type, length, range and format of every input it accepts.',
    explanation: 'Treat everything that crosses a trust boundary (body, query, headers, files, messages from queues) as untrusted.',
    docsUrl: `${cheat}/Input_Validation_Cheat_Sheet.html`,
  },
  // ---- rate-limiting (more) ----
  {
    ...base, topic: 'rate-limiting', id: 'security/rate-limiting/429-retry-after', type: 'mcq', level: 'intermediate', tags: ['rate-limit', 'http'],
    question: 'Which status code signals "too many requests", and which header tells the client when to retry?',
    options: ['429 with Retry-After', '503 with Location', '403 with Allow', '408 with Expires'],
    answerIndex: 0,
    explanation: '429 Too Many Requests is the standard response, and Retry-After gives a delay in seconds or a date.',
    source: { repo: light, path: 'apps/api/src/rate-limit/api-rate-limit.guard.ts' },
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429',
  },
  {
    ...base, topic: 'rate-limiting', id: 'security/rate-limiting/behind-proxy', type: 'mcq', level: 'advanced', tags: ['rate-limit', 'proxy'],
    question: 'Your API runs behind a reverse proxy and rate limits by req.ip, but every client appears to share one IP. What is missing?',
    options: [
      'Configuring trust proxy so the client IP is read from X-Forwarded-For, only from your own proxy',
      'A bigger limit',
      'Disabling the limiter',
      'Reading X-Forwarded-For from any request',
    ],
    answerIndex: 0,
    explanation: 'Trust forwarded headers only from known proxies; otherwise clients can spoof X-Forwarded-For and dodge the limit.',
    docsUrl: 'https://expressjs.com/en/guide/behind-proxies.html',
  },
  // ---- cors ----
  {
    ...base, topic: 'cors', id: 'security/cors/reflect-origin', type: 'bugspot', level: 'intermediate', tags: ['cors'],
    language: 'ts',
    code: `app.enableCors({
  origin: true,
  credentials: true,
});`,
    buggyLines: [2],
    explanation: 'origin: true reflects whatever Origin the request sends, and credentials: true then lets any website call the API with the user\'s cookies. List the exact allowed origins.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS',
  },
  {
    ...base, topic: 'cors', id: 'security/cors/not-an-auth-mechanism', type: 'mcq', level: 'beginner', tags: ['cors'],
    question: 'What does CORS actually protect?',
    options: [
      'It tells the browser whether a page from another origin may read the response; it does not stop non-browser clients',
      'It blocks all requests from other origins at the network level',
      'It authenticates users',
      'It encrypts traffic',
    ],
    answerIndex: 0,
    explanation: 'curl and server-side code ignore CORS. It relaxes the browser\'s same-origin policy, so you still need real authentication and authorization.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS',
  },
  // ---- security-headers ----
  {
    ...base, topic: 'security-headers', id: 'security/security-headers/helmet', type: 'flashcard', level: 'beginner', tags: ['headers'],
    front: 'What does the helmet middleware do?',
    back: 'It sets protective HTTP response headers in one call: Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, frame protections and more, and removes X-Powered-By.',
    explanation: 'Headers are defense in depth; they limit the damage of bugs such as XSS and clickjacking.',
    source: { repo: light },
    docsUrl: 'https://helmetjs.github.io/',
  },
  {
    ...base, topic: 'security-headers', id: 'security/security-headers/hsts', type: 'mcq', level: 'intermediate', tags: ['headers', 'tls'],
    question: 'What does Strict-Transport-Security (HSTS) tell the browser?',
    options: [
      'Only use HTTPS for this site for the given period, even if the user types http://',
      'Cache the page for a year',
      'Block third-party scripts',
      'Send cookies to all subdomains',
    ],
    answerIndex: 0,
    explanation: 'HSTS prevents downgrade and SSL-stripping attacks after the first secure visit.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security',
  },
  {
    ...base, topic: 'security-headers', id: 'security/security-headers/csp', type: 'mcq', level: 'intermediate', tags: ['headers', 'xss'],
    question: 'Which header limits where scripts and other resources may load from, reducing the impact of XSS?',
    options: ['Content-Security-Policy', 'Referrer-Policy', 'Cache-Control', 'Accept-Language'],
    answerIndex: 0,
    explanation: 'A strict CSP (no unsafe-inline, specific sources) blocks injected scripts even when escaping fails.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP',
  },
  // ---- secrets ----
  {
    ...base, topic: 'secrets', id: 'security/secrets/hardcoded', type: 'bugspot', level: 'beginner', tags: ['secrets', 'jwt'],
    language: 'ts',
    code: `import { sign } from 'jsonwebtoken';

const SECRET = 'supersecret123';

export const issue = (userId: string) =>
  sign({ sub: userId }, SECRET, { expiresIn: '15m' });`,
    buggyLines: [3],
    explanation: 'A secret in source code ends up in git history, logs and builds. Read it from the environment or a secret manager, and rotate it if it was ever committed.',
    docsUrl: `${cheat}/Secrets_Management_Cheat_Sheet.html`,
  },
  {
    ...base, topic: 'secrets', id: 'security/secrets/logging', type: 'bugspot', level: 'intermediate', tags: ['logging', 'secrets'],
    language: 'ts',
    code: `async login(dto: LoginDto) {
  this.logger.log(\`login attempt: \${JSON.stringify(dto)}\`);
  return this.auth.verify(dto.email, dto.password);
}`,
    buggyLines: [2],
    explanation: 'Logging the whole DTO writes plaintext passwords to the logs. Log identifiers only (email or user id), never credentials, tokens or full request bodies.',
    docsUrl: `${cheat}/Logging_Cheat_Sheet.html#data-to-exclude`,
  },
  {
    ...base, topic: 'secrets', id: 'security/secrets/random-tokens', type: 'mcq', level: 'intermediate', tags: ['randomness'],
    question: 'Which source should generate password-reset tokens in Node?',
    options: ['crypto.randomBytes', 'Math.random', 'Date.now', 'A counter'],
    answerIndex: 0,
    explanation: 'Math.random is predictable and not designed for secrets. crypto.randomBytes (or crypto.randomUUID) uses the operating system\'s cryptographically secure generator.',
    docsUrl: 'https://nodejs.org/api/crypto.html#cryptorandombytessize-callback',
  },
  // ---- owasp-api-top-10 ----
  {
    ...base, topic: 'owasp-api-top-10', id: 'security/owasp-api-top-10/unrestricted-resource', type: 'mcq', level: 'beginner', tags: ['owasp'],
    question: 'An endpoint lets clients request ?limit=1000000. Which OWASP API risk is this?',
    options: [
      'Unrestricted resource consumption (API4)',
      'Broken object level authorization (API1)',
      'Security misconfiguration (API8)',
      'Unsafe consumption of APIs (API10)',
    ],
    answerIndex: 0,
    explanation: 'Cap page sizes, payload sizes and request rates so one caller cannot exhaust CPU, memory or bandwidth.',
    docsUrl: `${owasp}/0xa4-unrestricted-resource-consumption/`,
  },
  {
    ...base, topic: 'owasp-api-top-10', id: 'security/owasp-api-top-10/bfla', type: 'mcq', level: 'intermediate', tags: ['owasp', 'authorization'],
    question: 'A normal user can call `DELETE /admin/users/5` because only authentication is checked. Which risk is this?',
    options: [
      'Broken function level authorization (API5)',
      'Broken object level authorization (API1)',
      'Server-side request forgery (API7)',
      'Improper inventory management (API9)',
    ],
    answerIndex: 0,
    explanation: 'Object-level (API1) is about which records you can touch; function-level (API5) is about which operations you may call at all, such as admin endpoints.',
    docsUrl: `${owasp}/0xa5-broken-function-level-authorization/`,
  },
];
