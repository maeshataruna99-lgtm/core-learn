import type { FocusTopic } from '../../core/focus.ts';

// Simulasi technical test Backend Developer (PT Mega Giga Solusindo / PLN Icon+): live coding 90 menit.
// Topic ids start with "mgs-" because progress keys share one namespace with the other projects.

export const mgsTopics: FocusTopic[] = [
  {
    id: 'mgs-plan',
    title: { en: 'The 90-minute game plan', id: 'Rencana 90 menit' },
    what: { en: 'The test is live coding with no discussion: algorithm logic, a small REST API in a framework of your choice, then a code review for security holes and quality. The examiner judges problem solving, backend fundamentals and clean, safe code.',
      id: 'Tesnya live coding tanpa diskusi: logika algoritma, REST API sederhana dengan framework pilihan, lalu code review untuk celah keamanan dan kualitas kode. Penguji menilai problem solving, fundamental backend, dan kode yang bersih serta aman.' },
    why: { en: 'With no one to ask, clarity of the code is your only voice. A fixed time budget stops one part from eating the others.',
      id: 'Tanpa lawan bicara, kejelasan kode adalah satu-satunya suaramu. Budget waktu yang tetap mencegah satu bagian memakan bagian lain.' },
    tellIt: { en: 'Run the clock: 5 min read, 20 min algorithm, 40 min API, 25 min review. Write assumptions as short comments. Make it work first, then make it fast.',
      id: 'Jalankan jam: 5 menit baca, 20 menit algoritma, 40 menit API, 25 menit review. Tulis asumsi sebagai komentar singkat. Buat jalan dulu, baru cepat.' },
    flow: [
      { en: '00-05: read everything, note input, output, constraints and edge cases.', id: '00-05: baca semua, catat input, output, constraint, dan edge case.' },
      { en: '05-25: algorithm. Edge cases first, correct solution, then optimise.', id: '05-25: algoritma. Edge case dulu, solusi benar, lalu optimasi.' },
      { en: '25-65: REST API. Validation, service, store, router, error handler. Core endpoints before extras.', id: '25-65: REST API. Validation, service, store, router, error handler. Endpoint inti sebelum tambahan.' },
      { en: '65-90: review. Security first, then quality and performance. Write each finding as problem, impact, fix.', id: '65-90: review. Security dulu, lalu kualitas dan performa. Tulis tiap temuan sebagai masalah, dampak, perbaikan.' },
    ],
    snippets: [
      {
        title: { en: 'Fast NestJS + Prisma commands (< 4 min)', id: 'Perintah cepat NestJS + Prisma (< 4 mnt)' },
        language: 'bash',
        code: `# Scaffold & deps (if no starter is provided)
npx @nestjs/cli new api --package-manager npm
cd api && npm i @prisma/client class-validator class-transformer
npm i -D prisma && npx prisma init --datasource-provider sqlite

# Migrate, seed & verify
npx prisma migrate dev --name init
npx prisma db seed
npm test`,
      },
    ],
    code: ['README.md', 'docs/rehearsal-log.md'],
    questions: [
      { q: { en: 'You are stuck on the algorithm at minute 20. What do you do?', id: 'Kamu buntu di algoritma pada menit 20. Apa yang dilakukan?' },
        a: { en: 'Submit the brute-force version that is correct, note its complexity in a comment, and move on. A working API and a thorough review are worth more than a perfect algorithm. If time remains at the end, return and optimise.',
          id: 'Kumpulkan versi brute-force yang benar, catat kompleksitasnya di komentar, lalu lanjut. API yang jalan dan review yang teliti lebih berharga daripada algoritma sempurna. Kalau sisa waktu di akhir, kembali dan optimasi.' } },
    ],
  },
  {
    id: 'mgs-algo',
    title: { en: 'Part 1: algorithm patterns', id: 'Part 1: pola algoritma' },
    what: { en: 'Three patterns cover most backend-flavoured puzzles: HashMap aggregation with a multi-key sort, a sliding window log (rate limiter), and a stack for matching brackets.',
      id: 'Tiga pola mencakup sebagian besar soal bernuansa backend: agregasi HashMap dengan sort multi-key, sliding window log (rate limiter), dan stack untuk mencocokkan bracket.' },
    why: { en: 'Each turns a nested loop into one pass: Map gives O(1) lookup, a window drops old timestamps once each, a stack remembers the latest unmatched opener.',
      id: 'Masing-masing mengubah nested loop menjadi satu pass: Map memberi lookup O(1), window membuang timestamp lama sekali saja, stack mengingat pembuka terakhir yang belum cocok.' },
    tellIt: { en: 'Say the edge cases out loud in comments: empty input, non-positive amounts, wrong status, ties in sorting. Then state the complexity.',
      id: 'Sebut edge case di komentar: input kosong, nominal tidak positif, status salah, seri saat sorting. Lalu sebut kompleksitasnya.' },
    flow: [
      { en: 'Summary: skip non-PAID and amount <= 0, sum per user in a Map, sort by total desc then userId asc. O(N + U log U).', id: 'Ringkasan: lewati non-PAID dan amount <= 0, jumlahkan per user di Map, sort total turun lalu userId naik. O(N + U log U).' },
      { en: 'Rate limiter: per-user timestamp list, drop entries before ts - window + 1, reject when length >= limit, record only allowed requests.', id: 'Rate limiter: daftar timestamp per user, buang entri sebelum ts - window + 1, tolak saat length >= limit, catat hanya request yang diizinkan.' },
      { en: 'Brackets: push openers, on a closer pop and compare, valid only if the stack ends empty. O(N).', id: 'Bracket: push pembuka, saat penutup pop lalu bandingkan, valid hanya jika stack kosong di akhir. O(N).' },
    ],
    snippets: [
      {
        title: { en: 'Pattern 1: HashMap aggregation + deterministic sort', id: 'Pola 1: Agregasi HashMap + sort deterministik' },
        language: 'ts',
        code: `const totals = new Map<string, number>();
for (const tx of transactions) {
  if (tx.status !== 'PAID' || tx.amount <= 0) continue;
  totals.set(tx.userId, (totals.get(tx.userId) ?? 0) + tx.amount);
}
return [...totals.entries()]
  .map(([userId, total]) => ({ userId, total }))
  .sort((a, b) => (b.total !== a.total ? b.total - a.total : a.userId.localeCompare(b.userId)));`,
      },
      {
        title: { en: 'Pattern 2: Sliding window rate limiter', id: 'Pola 2: Sliding window rate limiter' },
        language: 'ts',
        code: `const minValid = timestampSec - this.windowSec + 1;
const logs = this.store.get(userId) ?? [];
while (logs.length && logs[0]! < minValid) logs.shift();
if (logs.length >= this.limit) return false; // never record rejected hits
logs.push(timestampSec);
this.store.set(userId, logs);
return true;`,
      },
    ],
    code: ['part1-algorithm/src/summarize-payments.ts', 'part1-algorithm/src/rate-limiter.ts', 'part1-algorithm/src/brackets.ts', 'part1-algorithm/test/rate-limiter.test.ts'],
    questions: [
      { q: { en: 'Why must a rejected request not be recorded in the rate limiter?', id: 'Mengapa request yang ditolak tidak boleh dicatat di rate limiter?' },
        a: { en: 'If rejected hits were recorded, a client that keeps retrying would keep the window full forever and never recover. Recording only allowed requests means the window empties as time passes.',
          id: 'Kalau hit yang ditolak dicatat, klien yang terus mencoba akan membuat window penuh selamanya dan tidak pernah pulih. Dengan hanya mencatat yang diizinkan, window mengosong seiring waktu.' } },
      { q: { en: 'What is the weakness of an in-memory rate limiter in production?', id: 'Apa kelemahan rate limiter in-memory di produksi?' },
        a: { en: 'State lives in one process: it resets on restart and is not shared between instances, so the real limit is limit times instance count. A shared store such as Redis fixes it, using sorted sets or atomic counters.',
          id: 'State hidup di satu proses: reset saat restart dan tidak dibagi antar instance, jadi limit sebenarnya adalah limit dikali jumlah instance. Store bersama seperti Redis memperbaikinya, memakai sorted set atau counter atomik.' } },
      { q: { en: 'Why sort ties by userId?', id: 'Mengapa seri diurutkan dengan userId?' },
        a: { en: 'Without a tie-breaker the order depends on insertion order, so output is not deterministic and tests become flaky.',
          id: 'Tanpa tie-breaker urutan bergantung pada urutan insert, sehingga output tidak deterministik dan test jadi tidak stabil.' } },
    ],
  },
  {
    id: 'mgs-api',
    title: { en: 'Part 2: clean REST API', id: 'Part 2: REST API yang bersih' },
    what: { en: 'A NestJS ticket API with list (filter and pagination), create, status update and delete. DTOs with class-validator hold the input rules, the service holds business rules and talks to Prisma, the controller only routes. Nest exceptions give the status codes.',
      id: 'API ticket NestJS dengan list (filter dan pagination), create, update status, dan delete. DTO dengan class-validator memegang aturan input, service memegang aturan bisnis dan berbicara ke Prisma, controller hanya routing. Exception Nest memberi status code.' },
    why: { en: 'Examiners look for validation, correct status codes and a uniform error shape far more than for extra features.',
      id: 'Penguji mencari validasi, status code yang benar, dan bentuk error yang seragam, jauh lebih dari fitur tambahan.' },
    tellIt: { en: 'Build the happy path first, then add validation, then the state machine for status. Say why each status code is used.',
      id: 'Bangun happy path dulu, lalu validasi, lalu state machine untuk status. Jelaskan alasan tiap status code.' },
    flow: [
      { en: 'POST /tickets: the global ValidationPipe checks the DTO (title 3-100 chars, optional priority) and returns 201.', id: 'POST /tickets: ValidationPipe global memeriksa DTO (title 3-100 karakter, priority opsional) dan mengembalikan 201.' },
      { en: 'whitelist and forbidNonWhitelisted reject unknown fields with 400, which stops mass assignment.', id: 'whitelist dan forbidNonWhitelisted menolak field asing dengan 400, yang menghentikan mass assignment.' },
      { en: 'GET /tickets?status=&page=&limit= filters, caps limit at 50, and returns data plus meta (total, totalPages).', id: 'GET /tickets?status=&page=&limit= memfilter, membatasi limit maksimal 50, dan mengembalikan data plus meta (total, totalPages).' },
      { en: 'PATCH /tickets/:id/status follows OPEN -> IN_PROGRESS -> DONE. The check and the write are one updateMany with the allowed current statuses in the where clause; zero rows changed means 404 or 409 (ConflictException).', id: 'PATCH /tickets/:id/status mengikuti OPEN -> IN_PROGRESS -> DONE. Pengecekan dan penulisan adalah satu updateMany dengan status saat ini yang diizinkan di klausa where; nol baris berubah berarti 404 atau 409 (ConflictException).' },
      { en: 'Routes live under /api/v1; /health stays at the root for probes and also checks the database.', id: 'Route ada di bawah /api/v1; /health tetap di root untuk probe dan ikut mengecek database.' },
      { en: 'A global PrismaExceptionFilter maps P2025 to 404, P2002 to 409, P2003 to 400, and hides database details.', id: 'PrismaExceptionFilter global memetakan P2025 ke 404, P2002 ke 409, P2003 ke 400, dan menyembunyikan detail database.' },
    ],
    snippets: [
      {
        title: { en: 'Global guardrails (prefix, validation, Prisma filter)', id: 'Guardrails global (prefix, validasi, filter Prisma)' },
        language: 'ts',
        code: `app.setGlobalPrefix('api/v1', { exclude: ['health'] });
app.useGlobalFilters(new PrismaExceptionFilter());
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,            // strip unknown fields
    forbidNonWhitelisted: true, // reject mass assignment with 400
    transform: true,            // coerce query strings to numbers
  }),
);`,
      },
      {
        title: { en: 'Atomic status update (no race condition)', id: 'Update status atomik (anti race condition)' },
        language: 'ts',
        code: `const { count } = await this.prisma.ticket.updateMany({
  where: { id, status: { in: allowedFrom(next) } },
  data: { status: next },
});
if (count === 0) {
  const exists = await this.prisma.ticket.findUnique({ where: { id } });
  if (!exists) throw new NotFoundException('Ticket not found');
  throw new ConflictException(\`Cannot transition from \${exists.status} to \${next}\`);
}`,
      },
    ],
    code: ['part2-api/src/tickets/tickets.service.ts', 'part2-api/src/tickets/tickets.controller.ts', 'part2-api/src/tickets/dto/create-ticket.dto.ts', 'part2-api/src/configure-app.ts', 'part2-api/src/common/filters/prisma-exception.filter.ts', 'part2-api/test/tickets.spec.ts'],
    questions: [
      { q: { en: 'When do you return 400, 404 and 409?', id: 'Kapan mengembalikan 400, 404, dan 409?' },
        a: { en: '400 when the request itself is malformed or fails validation. 404 when the target resource does not exist. 409 when the request is valid but conflicts with the current state, such as moving a DONE ticket back to OPEN.',
          id: '400 saat request itu sendiri salah bentuk atau gagal validasi. 404 saat resource target tidak ada. 409 saat request valid tetapi bertentangan dengan state saat ini, misalnya memindahkan ticket DONE kembali ke OPEN.' } },
      { q: { en: 'Two requests change the same ticket at once. How do you keep the state machine safe?', id: 'Dua request mengubah ticket yang sama bersamaan. Bagaimana menjaga state machine tetap aman?' },
        a: { en: 'Read-then-write is a race: both requests read OPEN, both pass the check, both write. I make the check part of the write: updateMany with the allowed current statuses in the where clause. The database applies one change and the other updates zero rows, which I turn into 409. A test fires two identical PATCH calls and expects exactly one 200 and one 409.',
          id: 'Baca-lalu-tulis adalah race: kedua request membaca OPEN, lolos pengecekan, dan menulis. Saya menjadikan pengecekan bagian dari penulisan: updateMany dengan status saat ini yang diizinkan di klausa where. Database menerapkan satu perubahan dan yang lain mengubah nol baris, yang saya ubah menjadi 409. Satu test mengirim dua PATCH identik dan mengharapkan tepat satu 200 dan satu 409.' } },
      { q: { en: 'Why map database errors in a filter instead of in each service?', id: 'Mengapa error database dipetakan di filter, bukan di tiap service?' },
        a: { en: 'Services stay free of Prisma error codes and focus on business rules, the mapping lives in one reviewed place, and every endpoint answers the same way. The filter also hides database messages from clients, which would otherwise reveal table and query details.',
          id: 'Service bebas dari kode error Prisma dan fokus pada aturan bisnis, pemetaan ada di satu tempat yang direview, dan semua endpoint menjawab dengan cara sama. Filter juga menyembunyikan pesan database dari klien, yang kalau tidak akan membuka detail tabel dan query.' } },
      { q: { en: 'Why version the API with /api/v1 and keep /health outside it?', id: 'Mengapa API diberi versi /api/v1 dan /health dibiarkan di luarnya?' },
        a: { en: 'A version prefix lets you ship a breaking change as /v2 while old clients keep working. Health checks are for infrastructure such as load balancers and Kubernetes probes, which should not change when the API version does.',
          id: 'Prefix versi memungkinkan perubahan yang merusak dirilis sebagai /v2 sementara klien lama tetap jalan. Health check untuk infrastruktur seperti load balancer dan probe Kubernetes, yang tidak boleh berubah saat versi API berubah.' } },
      { q: { en: 'Why keep the controller thin?', id: 'Mengapa controller dibuat tipis?' },
        a: { en: 'The controller only maps HTTP to a service call. Rules and database access live in the service, so they can be tested and reused without HTTP, and swapping the database touches one layer. Pagination is capped (limit max 50) so one request cannot pull the whole table.',
          id: 'Controller hanya memetakan HTTP ke pemanggilan service. Aturan dan akses database ada di service, sehingga bisa dites dan dipakai ulang tanpa HTTP, dan mengganti database hanya menyentuh satu lapisan. Pagination dibatasi (limit maksimal 50) agar satu request tidak menarik seluruh tabel.' } },
      { q: { en: 'Why never send err.stack to the client?', id: 'Mengapa err.stack tidak boleh dikirim ke klien?' },
        a: { en: 'It reveals file paths, library versions and query text that help an attacker. Log the detail on the server and return a generic message plus a stable error code.',
          id: 'Stack membocorkan path file, versi library, dan teks query yang membantu penyerang. Catat detailnya di server dan kembalikan pesan generik beserta error code yang stabil.' } },
    ],
  },
  {
    id: 'mgs-prisma',
    title: { en: 'Prisma: schema, migration, seed', id: 'Prisma: schema, migrasi, seed' },
    what: { en: 'Prisma is the ORM. The schema file is the source of truth for tables, relations and indexes. A migration is a versioned SQL file generated from a schema change, and a seed fills the database with starting data.',
      id: 'Prisma adalah ORM. File schema adalah sumber kebenaran untuk tabel, relasi, dan index. Migrasi adalah file SQL berversi yang dihasilkan dari perubahan schema, dan seed mengisi database dengan data awal.' },
    why: { en: 'Migrations make schema changes reviewable and repeatable on every machine. A seed makes a fresh database usable in one command. SQLite needs no server, so a reviewer can run everything instantly.',
      id: 'Migrasi membuat perubahan schema bisa direview dan diulang di setiap mesin. Seed membuat database baru siap dipakai dengan satu perintah. SQLite tidak butuh server, jadi reviewer bisa menjalankan semuanya seketika.' },
    tellIt: { en: 'Name the three commands and what each does: migrate dev creates and applies a migration, migrate deploy applies existing ones, db seed loads data. Mention the seed is idempotent.',
      id: 'Sebut tiga perintah dan fungsinya: migrate dev membuat dan menerapkan migrasi, migrate deploy menerapkan yang sudah ada, db seed memuat data. Sebut bahwa seed bersifat idempotent.' },
    flow: [
      { en: 'Edit prisma/schema.prisma (model User, model Ticket with @@index and a relation).', id: 'Edit prisma/schema.prisma (model User, model Ticket dengan @@index dan relasi).' },
      { en: 'npx prisma migrate dev --name init: writes prisma/migrations/<time>_init/migration.sql, applies it, regenerates the client.', id: 'npx prisma migrate dev --name init: menulis prisma/migrations/<waktu>_init/migration.sql, menerapkannya, dan membuat ulang client.' },
      { en: 'prisma/seed.ts uses upsert on the unique email, and seeds tickets only when the table is empty.', id: 'prisma/seed.ts memakai upsert pada email yang unik, dan mengisi ticket hanya saat tabel kosong.' },
      { en: 'Tests run migrate deploy against a separate test.db, then clean tables before each test.', id: 'Test menjalankan migrate deploy ke test.db terpisah, lalu membersihkan tabel sebelum tiap test.' },
    ],
    snippets: [
      {
        title: { en: 'Idempotent seed with upsert', id: 'Seed idempotent dengan upsert' },
        language: 'ts',
        code: `const alice = await prisma.user.upsert({
  where: { email: 'alice@example.com' },
  update: {},
  create: { name: 'Alice', email: 'alice@example.com' },
});
if ((await prisma.ticket.count()) === 0) {
  await prisma.ticket.createMany({
    data: [{ title: 'Fix login rate limit', priority: 'HIGH', assigneeId: alice.id }],
  });
}`,
      },
    ],
    code: ['part2-api/prisma/schema.prisma', 'part2-api/prisma/seed.ts', 'part2-api/src/tickets/tickets.service.ts', 'part2-api/test/prisma-schema.spec.ts'],
    questions: [
      { q: { en: 'migrate dev versus migrate deploy: when do you use each?', id: 'migrate dev versus migrate deploy: kapan memakai masing-masing?' },
        a: { en: 'migrate dev is for development: it diffs the schema, creates a new migration file, applies it and may reset a drifted database. migrate deploy only applies migrations that already exist, never creates or resets, so it is the one for CI and production.',
          id: 'migrate dev untuk development: membandingkan schema, membuat file migrasi baru, menerapkannya, dan bisa mereset database yang menyimpang. migrate deploy hanya menerapkan migrasi yang sudah ada, tidak pernah membuat atau mereset, sehingga dipakai untuk CI dan produksi.' } },
      { q: { en: 'Why must a seed be idempotent?', id: 'Mengapa seed harus idempotent?' },
        a: { en: 'It gets run repeatedly: on every reset, in CI and by new teammates. Without idempotency, each run duplicates rows or fails on a unique constraint. Upsert on a unique key, or a guard like count equals zero, makes a rerun safe.',
          id: 'Seed dijalankan berulang: tiap reset, di CI, dan oleh anggota tim baru. Tanpa idempotensi, tiap run menduplikasi baris atau gagal pada unique constraint. Upsert pada unique key, atau guard seperti count sama dengan nol, membuat run ulang aman.' } },
      { q: { en: 'How do you avoid the N+1 query problem with Prisma?', id: 'Bagaimana menghindari masalah N+1 query dengan Prisma?' },
        a: { en: 'Load relations in the same query with include or select instead of querying the assignee inside a loop. The ticket list uses include with a select of two fields, so it is one query for rows plus one count, run in a single transaction.',
          id: 'Muat relasi dalam query yang sama dengan include atau select, bukan query assignee di dalam loop. Daftar ticket memakai include dengan select dua field, jadi hanya satu query untuk baris ditambah satu count, dijalankan dalam satu transaksi.' } },
      { q: { en: 'Why add @@index([status, createdAt])?', id: 'Mengapa menambah @@index([status, createdAt])?' },
        a: { en: 'The list filters by status and sorts by newest. A composite index on those columns lets the database find and order rows without scanning the whole table. The cost is slower writes and more storage, so index only columns that queries actually use.',
          id: 'Daftar memfilter berdasarkan status dan mengurutkan terbaru. Index komposit pada kolom itu membuat database menemukan dan mengurutkan baris tanpa memindai seluruh tabel. Biayanya penulisan lebih lambat dan storage lebih besar, jadi index hanya kolom yang benar-benar dipakai query.' } },
    ],
  },
  {
    id: 'mgs-review',
    title: { en: 'Part 3: code review checklist', id: 'Part 3: checklist code review' },
    what: { en: 'Two review files cover general backend flaws and Prisma-specific traps: hardcoded secret, SQL injection ($queryRawUnsafe), missing ownership check (IDOR), unbounded queries, N+1 findUnique loops, sensitive field leaks, mass assignment, missing $transaction, leaked stack traces, swallowed errors and magic numbers.',
      id: 'Dua file review mencakup celah backend umum dan jebakan khas Prisma: secret hardcoded, SQL injection ($queryRawUnsafe), tidak ada cek kepemilikan (IDOR), query tanpa batas, loop N+1 findUnique, kebocoran field sensitif, mass assignment, tanpa $transaction, stack trace bocor, error ditelan, dan magic number.' },
    why: { en: 'Security findings carry the most weight, so scan for them first, then quality.',
      id: 'Temuan security paling berbobot, jadi pindai itu dulu, lalu kualitas.' },
    tellIt: { en: 'For each finding write three short parts: problem, impact, fix. Keep the order: critical security, then quality and performance.',
      id: 'Untuk tiap temuan tulis tiga bagian singkat: masalah, dampak, perbaikan. Jaga urutan: security kritis, lalu kualitas dan performa.' },
    flow: [
      { en: 'Secrets: read from environment and fail at startup when missing.', id: 'Secret: baca dari environment dan gagal saat startup bila tidak ada.' },
      { en: 'Injection: parameterised queries only, never string interpolation.', id: 'Injection: hanya parameterised query, jangan interpolasi string.' },
      { en: 'Authorisation: check that the record belongs to the caller, unless the role allows more.', id: 'Otorisasi: cek record milik pemanggil, kecuali role mengizinkan lebih.' },
      { en: 'Mass assignment: allowlist the fields a user may change.', id: 'Mass assignment: allowlist field yang boleh diubah user.' },
      { en: 'Errors: log on the server, return a generic 500, never an empty catch that reports success.', id: 'Error: catat di server, kembalikan 500 generik, jangan empty catch yang melaporkan sukses.' },
    ],
    snippets: [
      {
        title: { en: 'Top 4 review fixes (SQLi, IDOR, N+1, Transaction)', id: '4 perbaikan review utama (SQLi, IDOR, N+1, Transaksi)' },
        language: 'ts',
        code: `// 1. SQLi: use tagged $queryRaw, never $queryRawUnsafe with user input
await prisma.$queryRaw\`SELECT id, title FROM Ticket WHERE title LIKE \${\`%\${q}%\`} LIMIT 50\`;

// 2. IDOR: check ownership or role before reading/mutating
if (actor.role !== 'ADMIN' && ticket.assigneeId !== actor.id) throw new ForbiddenException();

// 3. N+1 + secret leak: eager load with explicit select + pagination cap
await prisma.ticket.findMany({
  take: Math.min(limit, 50),
  select: { id: true, title: true, assignee: { select: { id: true, name: true } } },
});

// 4. Multi-write integrity: wrap state change + audit log in $transaction
await prisma.$transaction([
  prisma.ticket.update({ where: { id }, data: { status: 'DONE' } }),
  prisma.auditLog.create({ data: { ticketId: id, actorId: actor.id, action: 'CLOSE' } }),
]);`,
      },
    ],
    code: ['part3-review/vulnerable/ticket-service.ts', 'part3-review/fixed/ticket-service.ts', 'part3-review/test/review.spec.ts', 'docs/review-findings.md'],
    questions: [
      { q: { en: 'What is the difference between Prisma $queryRaw and $queryRawUnsafe?', id: 'Apa bedanya Prisma $queryRaw dan $queryRawUnsafe?' },
        a: { en: '$queryRaw is a tagged template that sends interpolated values as SQL parameters, blocking SQL injection. $queryRawUnsafe accepts a plain string, so interpolating user input into it opens SQL injection. Always prefer Prisma model methods or $queryRaw.',
          id: '$queryRaw adalah tagged template yang mengirim nilai interpolasi sebagai parameter SQL sehingga mencegah SQL injection. $queryRawUnsafe menerima string biasa, sehingga interpolasi input user membuka SQL injection. Selalu pilih method model Prisma atau $queryRaw.' } },
      { q: { en: 'Why wrap an entity update and an audit log insert in prisma.$transaction?', id: 'Mengapa update entity dan insert audit log harus dibungkus dalam prisma.$transaction?' },
        a: { en: 'Without a transaction, if the audit log insert fails after the ticket update succeeds, the database ends up with a closed ticket and no audit trail. A transaction makes both commit together or both roll back.',
          id: 'Tanpa transaksi, jika insert audit log gagal setelah update ticket berhasil, database berakhir dengan ticket tertutup tanpa jejak audit. Transaksi memastikan keduanya commit bersamaan atau keduanya rollback.' } },
      { q: { en: 'What is IDOR and how do you prevent it?', id: 'Apa itu IDOR dan bagaimana mencegahnya?' },
        a: { en: 'Insecure Direct Object Reference: a user changes an id in the URL and reads someone else\'s record because the server only checks login, not ownership. Prevent it by checking, on the server, that the record belongs to the caller or that the caller has an admin role.',
          id: 'Insecure Direct Object Reference: user mengubah id di URL dan membaca record orang lain karena server hanya cek login, bukan kepemilikan. Cegah dengan mengecek di server bahwa record milik pemanggil atau pemanggil berperan admin.' } },
      { q: { en: 'Why do parameterised queries stop SQL injection?', id: 'Mengapa parameterised query menghentikan SQL injection?' },
        a: { en: 'The SQL text and the values travel separately, so the database treats the value as data and never as part of the command, whatever characters it contains.',
          id: 'Teks SQL dan nilainya dikirim terpisah, sehingga database memperlakukan nilai sebagai data dan bukan bagian perintah, apa pun karakternya.' } },
      { q: { en: 'What is wrong with an empty catch that returns 200?', id: 'Apa yang salah dengan empty catch yang mengembalikan 200?' },
        a: { en: 'The client believes the write succeeded when it failed, data is silently lost, and nothing is logged to investigate. Log the error and return a 5xx so the failure is visible.',
          id: 'Klien mengira penulisan berhasil padahal gagal, data hilang diam-diam, dan tidak ada log untuk diselidiki. Catat error dan kembalikan 5xx agar kegagalan terlihat.' } },
    ],
  },
];
