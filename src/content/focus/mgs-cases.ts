import type { FocusTopic } from '../../core/focus.ts';

// Learn-by-project cases from the core-learn-technical repo (docs/cases/NN-<id>.md).
// Each topic id is `mgs-case-<id>`, matching the case id there. Code paths are relative to that repo.
export const mgsCaseTopics: FocusTopic[] = [
  {
    id: 'mgs-case-race-condition-status-update',
    title: { en: 'Case 01: Race condition on a status change', id: 'Kasus 01: Race condition saat ganti status' },
    what: {
      en: 'Tickets may only move OPEN -> IN_PROGRESS -> DONE. Two requests move the same OPEN ticket at the same moment and both succeed. Read-then-write leaves a gap: both read OPEN, both pass the check, both write.',
      id: 'Ticket hanya boleh bergerak OPEN -> IN_PROGRESS -> DONE. Dua request memindahkan ticket OPEN yang sama di saat bersamaan dan keduanya berhasil. Baca-lalu-tulis meninggalkan celah: keduanya membaca OPEN, lolos cek, lalu menulis.',
    },
    why: {
      en: 'Putting the allowed current statuses in the WHERE of one updateMany makes the check and the write one atomic statement. It needs no lock or transaction and behaves the same on SQLite and Postgres.',
      id: 'Menaruh status saat ini yang diizinkan di WHERE satu updateMany membuat cek dan tulis menjadi satu statement atomik. Tidak butuh lock atau transaksi, dan perilakunya sama di SQLite maupun Postgres.',
    },
    tellIt: {
      en: 'I make the check part of the write: updateMany where id and status in allowedFrom(next). The database changes at most one row. Zero rows means one extra read: no row is 404, another status is 409. A test fires two identical PATCH calls and expects exactly one 200 and one 409, and a read-then-write version fails that test.',
      id: 'Saya jadikan cek bagian dari penulisan: updateMany dengan where id dan status in allowedFrom(next). Database mengubah paling banyak satu baris. Nol baris berarti satu baca tambahan: tidak ada baris = 404, status lain = 409. Satu test mengirim dua PATCH identik dan mengharapkan tepat satu 200 dan satu 409, dan versi baca-lalu-tulis gagal di test itu.',
    },
    flow: [
      { en: 'NEXT_STATUS holds the state machine; allowedFrom(next) lists the statuses that may move to next.', id: 'NEXT_STATUS memegang state machine; allowedFrom(next) mendaftar status yang boleh pindah ke next.' },
      { en: 'updateMany({ where: { id, status: { in: allowedFrom(next) } } }) writes only when the move is legal.', id: 'updateMany({ where: { id, status: { in: allowedFrom(next) } } }) hanya menulis bila perpindahannya sah.' },
      { en: 'count === 0: findUnique decides 404 (missing) or 409 (wrong state).', id: 'count === 0: findUnique memutuskan 404 (tidak ada) atau 409 (state salah).' },
      { en: 'Proof: Promise.all of two PATCH calls returns [200, 409]; the mutation check makes it fail for read-then-write.', id: 'Bukti: Promise.all dua PATCH menghasilkan [200, 409]; uji mutasi membuatnya gagal untuk baca-lalu-tulis.' },
    ],
    snippets: [
      {
        title: { en: 'Check and write in one statement', id: 'Cek dan tulis dalam satu statement' },
        language: 'ts',
        code: `const { count } = await this.prisma.ticket.updateMany({
  where: { id, status: { in: allowedFrom(next) } },
  data: { status: next },
});
if (count === 0) {
  const current = await this.prisma.ticket.findUnique({ where: { id }, select: { status: true } });
  if (!current) throw new NotFoundException('Ticket not found');
  throw new ConflictException(\`Cannot move ticket from \${current.status} to \${next}\`);
}`,
      },
    ],
    code: ['docs/cases/01-race-condition-status-update.md', 'part2-api/src/tickets/tickets.service.ts', 'part2-api/test/tickets.spec.ts', 'docs/decisions/003-atomic-status-update.md'],
    questions: [
      { q: { en: 'Why not wrap the read and the write in $transaction instead?', id: 'Kenapa tidak membungkus baca dan tulis dalam $transaction saja?' },
        a: { en: 'A transaction alone does not stop two readers from seeing OPEN unless the isolation level or a row lock prevents it, and that differs per database. A condition in the WHERE of one statement is atomic everywhere and needs no lock.',
          id: 'Transaksi saja tidak mencegah dua pembaca melihat OPEN kecuali isolation level atau row lock mencegahnya, dan itu berbeda per database. Kondisi di WHERE satu statement atomik di mana saja dan tidak butuh lock.' } },
      { q: { en: 'What does this fix cost?', id: 'Apa biaya perbaikan ini?' },
        a: { en: 'updateMany returns only a count, so the success path needs a second read to return the row. The 404/409 read runs after the write was refused, so it cannot cause a wrong change; at worst the status in the 409 message is stale.',
          id: 'updateMany hanya mengembalikan count, jadi jalur sukses butuh baca kedua untuk mengembalikan baris. Baca 404/409 berjalan setelah penulisan ditolak, jadi tidak bisa menyebabkan perubahan salah; paling buruk status di pesan 409 sudah usang.' } },
    ],
  },
  {
    id: 'mgs-case-error-leak',
    title: { en: 'Case 02: Database errors leaking to the client', id: 'Kasus 02: Error database bocor ke klien' },
    what: {
      en: 'A client sends an assignee that does not exist or deletes a ticket twice, and gets a 500 naming tables and constraints, or a stack trace. Prisma throws coded errors (P2025, P2002, P2003) with schema details, and unhandled errors carry file paths and library versions.',
      id: 'Klien mengirim assignee yang tidak ada atau menghapus ticket dua kali, lalu mendapat 500 yang menyebut tabel dan constraint, atau stack trace. Prisma melempar error berkode (P2025, P2002, P2003) berisi detail schema, dan error yang tidak ditangani membawa path file dan versi library.',
    },
    why: {
      en: 'Two global filters keep the mapping in one reviewed place, give every endpoint the same error shape, and keep services free of Prisma codes. Nothing from the database reaches the client.',
      id: 'Dua filter global menaruh pemetaan di satu tempat yang direview, memberi semua endpoint bentuk error yang sama, dan menjaga service bebas dari kode Prisma. Tidak ada detail database yang sampai ke klien.',
    },
    tellIt: {
      en: 'PrismaExceptionFilter maps P2025 to 404, P2002 to 409 and P2003 to 400 with generic messages, and logs any other code before a generic 500. AllExceptionsFilter keeps HttpException status and message and turns everything else into a 500, with the stack in the server log only. Both use errorBody(), so every error is { statusCode, error, message }.',
      id: 'PrismaExceptionFilter memetakan P2025 ke 404, P2002 ke 409, dan P2003 ke 400 dengan pesan generik, dan mencatat kode lain sebelum 500 generik. AllExceptionsFilter mempertahankan status dan pesan HttpException dan mengubah sisanya menjadi 500, dengan stack hanya di log server. Keduanya memakai errorBody(), jadi semua error berbentuk { statusCode, error, message }.',
    },
    flow: [
      { en: 'configureApp registers the catch-all first and the Prisma filter last, because Nest tries the last registered global filter first.', id: 'configureApp mendaftarkan catch-all lebih dulu dan filter Prisma terakhir, karena Nest mencoba filter global yang terakhir didaftarkan lebih dulu.' },
      { en: 'Services just call Prisma: remove() is one delete, and a missing id becomes 404 through P2025.', id: 'Service cukup memanggil Prisma: remove() hanya satu delete, dan id yang tidak ada menjadi 404 lewat P2025.' },
      { en: 'Proof: unit tests per code, a body without email/User/Table/P2002, and an HTTP test for P2003 -> 400.', id: 'Bukti: unit test per kode, body tanpa email/User/Table/P2002, dan test HTTP untuk P2003 -> 400.' },
    ],
    snippets: [
      {
        title: { en: 'One mapping, generic messages', id: 'Satu pemetaan, pesan generik' },
        language: 'ts',
        code: `const KNOWN_ERRORS = {
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Resource not found' },
  P2002: { status: HttpStatus.CONFLICT, message: 'Resource already exists' },
  P2003: { status: HttpStatus.BAD_REQUEST, message: 'Related resource does not exist' },
};
app.useGlobalFilters(new AllExceptionsFilter(), new PrismaExceptionFilter());`,
      },
    ],
    code: ['docs/cases/02-error-leak.md', 'part2-api/src/common/filters/prisma-exception.filter.ts', 'part2-api/src/common/filters/all-exceptions.filter.ts', 'part2-api/test/prisma-exception.filter.spec.ts'],
    questions: [
      { q: { en: 'Why map Prisma errors in a filter instead of try/catch in each service method?', id: 'Kenapa error Prisma dipetakan di filter, bukan try/catch di tiap method service?' },
        a: { en: 'One reviewed place gives every endpoint the same answer, services keep only business rules, and no method can forget the mapping or leak a message by accident.',
          id: 'Satu tempat yang direview memberi semua endpoint jawaban yang sama, service hanya memegang aturan bisnis, dan tidak ada method yang bisa lupa memetakan atau tidak sengaja membocorkan pesan.' } },
      { q: { en: 'What is the downside of a global mapping?', id: 'Apa kelemahan pemetaan global?' },
        a: { en: 'It is the same for every endpoint. When one endpoint needs a different meaning, throw a specific HttpException in the service. Generic messages also mean debugging relies on the server log.',
          id: 'Pemetaannya sama untuk semua endpoint. Bila satu endpoint butuh makna lain, lempar HttpException spesifik di service. Pesan generik juga berarti debugging bergantung pada log server.' } },
    ],
  },
  {
    id: 'mgs-case-mass-assignment',
    title: { en: 'Case 03: Mass assignment', id: 'Kasus 03: Mass assignment' },
    what: {
      en: 'The create endpoint expects title and priority. A caller also sends status: "DONE" or their own assigneeId, and the server saves it, because the request body goes straight into the ORM.',
      id: 'Endpoint create mengharapkan title dan priority. Pemanggil ikut mengirim status: "DONE" atau assigneeId miliknya, dan server menyimpannya, karena body request langsung masuk ke ORM.',
    },
    why: {
      en: 'An allowlist (the DTO) fails closed: a field nobody declared can never be written. Rejecting with 400 instead of silently dropping makes the contract explicit and probing visible.',
      id: 'Allowlist (DTO) gagal secara aman: field yang tidak dideklarasikan tidak pernah bisa ditulis. Menolak dengan 400, bukan membuang diam-diam, membuat kontrak jelas dan percobaan terlihat.',
    },
    tellIt: {
      en: 'The global ValidationPipe uses whitelist and forbidNonWhitelisted, and CreateTicketDto declares only title, priority and assigneeId, so { title, status: "DONE" } is a 400 and no row is created. In the framework-free review code the fix is the same idea: UPDATABLE_FIELDS allows only title, anything else is a 400, plus an ownership check.',
      id: 'ValidationPipe global memakai whitelist dan forbidNonWhitelisted, dan CreateTicketDto hanya mendeklarasikan title, priority, dan assigneeId, jadi { title, status: "DONE" } dibalas 400 dan tidak ada baris dibuat. Di kode review tanpa framework idenya sama: UPDATABLE_FIELDS hanya mengizinkan title, selain itu 400, ditambah cek kepemilikan.',
    },
    flow: [
      { en: 'whitelist: true strips fields the DTO does not declare.', id: 'whitelist: true membuang field yang tidak dideklarasikan DTO.' },
      { en: 'forbidNonWhitelisted: true turns that into a 400 with "property status should not exist".', id: 'forbidNonWhitelisted: true mengubahnya menjadi 400 dengan "property status should not exist".' },
      { en: 'Proof: the vulnerable updateTicket lets the owner reassign and close the ticket; the fixed one answers 400 and the row is unchanged.', id: 'Bukti: updateTicket versi rentan membiarkan pemilik memindah assignee dan menutup ticket; versi fixed membalas 400 dan baris tidak berubah.' },
    ],
    snippets: [
      {
        title: { en: 'Vulnerable vs fixed', id: 'Rentan vs fixed' },
        language: 'ts',
        code: `// vulnerable: every key the client sends becomes a column write
await prisma.ticket.update({ where: { id }, data: body });

// fixed (Nest): only DTO fields pass, extras are a 400
new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });`,
      },
    ],
    code: ['docs/cases/03-mass-assignment.md', 'part2-api/src/configure-app.ts', 'part2-api/src/tickets/dto/create-ticket.dto.ts', 'part3-review/fixed/ticket-service.ts'],
    questions: [
      { q: { en: 'whitelist: true already drops unknown fields. Why also forbidNonWhitelisted?', id: 'whitelist: true sudah membuang field asing. Kenapa perlu forbidNonWhitelisted juga?' },
        a: { en: 'Dropping silently hides the attempt and the client bug. A 400 tells the client its request is wrong and makes probing visible.',
          id: 'Membuang diam-diam menyembunyikan percobaan dan bug klien. 400 memberi tahu klien bahwa request-nya salah dan membuat percobaan terlihat.' } },
      { q: { en: 'What does the allowlist cost?', id: 'Apa biaya allowlist?' },
        a: { en: 'Clients that send harmless extra fields break, and every new editable field must be added. Forgetting fails closed with a 400, which is the safe direction.',
          id: 'Klien yang mengirim field tambahan yang tidak berbahaya akan gagal, dan tiap field baru yang boleh diubah harus ditambahkan. Kalau lupa, hasilnya 400, yang merupakan arah aman.' } },
    ],
  },
  {
    id: 'mgs-case-n-plus-one',
    title: { en: 'Case 04: N+1 queries and sensitive field leak', id: 'Kasus 04: N+1 query dan kebocoran field sensitif' },
    what: {
      en: 'The ticket list gets slower as the table grows, and every response carries each assignee passwordHash. The code loads all tickets with no limit, then runs one user query per ticket in a loop, and returns the whole user row.',
      id: 'Daftar ticket makin lambat seiring tabel membesar, dan tiap respons membawa passwordHash tiap assignee. Kodenya memuat semua ticket tanpa batas, lalu menjalankan satu query user per ticket di dalam loop, dan mengembalikan seluruh baris user.',
    },
    why: {
      en: 'Loading the relation in the same findMany with an explicit select fixes speed and the leak at once, and a page cap bounds the response size whatever the table size.',
      id: 'Memuat relasi di findMany yang sama dengan select eksplisit memperbaiki kecepatan dan kebocoran sekaligus, dan batas halaman membatasi ukuran respons berapa pun ukuran tabel.',
    },
    tellIt: {
      en: 'I load the assignee with select { id, name } inside findMany and cap the page at 50. A test counts SQL statements with Prisma query events: the vulnerable list runs at least 7 queries for 6 tickets and returns passwordHash; the fixed one runs at most 2 and never returns it.',
      id: 'Saya memuat assignee dengan select { id, name } di dalam findMany dan membatasi halaman di 50. Satu test menghitung statement SQL dengan query event Prisma: daftar rentan menjalankan minimal 7 query untuk 6 ticket dan mengembalikan passwordHash; versi fixed paling banyak 2 dan tidak pernah mengembalikannya.',
    },
    flow: [
      { en: 'Part 2: WITH_ASSIGNEE = { assignee: { select: { id: true, name: true } } } on every ticket query.', id: 'Part 2: WITH_ASSIGNEE = { assignee: { select: { id: true, name: true } } } di semua query ticket.' },
      { en: 'Part 2 rejects limit above MAX_PAGE_SIZE (50) with 400; Part 3 uses take: Math.min(limit, 50).', id: 'Part 2 menolak limit di atas MAX_PAGE_SIZE (50) dengan 400; Part 3 memakai take: Math.min(limit, 50).' },
      { en: 'findMany and count run in one $transaction so meta.total matches the page.', id: 'findMany dan count berjalan dalam satu $transaction agar meta.total cocok dengan halaman.' },
    ],
    snippets: [
      {
        title: { en: 'Prove it by counting queries', id: 'Buktikan dengan menghitung query' },
        language: 'ts',
        code: `const prisma = new PrismaClient({ log: [{ emit: 'event', level: 'query' }] });
let queryCount = 0;
prisma.$on('query', () => { queryCount++; });

queryCount = 0;
await fixed.listTickets(prisma, 10);
expect(queryCount).toBeLessThanOrEqual(2); // constant, whatever the row count`,
      },
    ],
    code: ['docs/cases/04-n-plus-one.md', 'part2-api/src/tickets/tickets.service.ts', 'part3-review/fixed/ticket-service.ts', 'part3-review/test/review.spec.ts'],
    questions: [
      { q: { en: 'How do you prove an N+1 fix in a test instead of by reading the code?', id: 'Bagaimana membuktikan perbaikan N+1 di test, bukan dengan membaca kode?' },
        a: { en: 'Count queries. Create several rows, enable Prisma query events, call the function and assert the count stays constant as rows are added.',
          id: 'Hitung query. Buat beberapa baris, aktifkan query event Prisma, panggil fungsinya, lalu pastikan jumlahnya tetap saat baris ditambah.' } },
      { q: { en: 'Is include with select a SQL join?', id: 'Apakah include dengan select adalah SQL join?' },
        a: { en: 'Not in Prisma by default: it runs a second batched query with an IN list. The cost is 2 queries, constant in N, instead of 1 + N.',
          id: 'Secara default di Prisma bukan: ia menjalankan query kedua yang di-batch dengan daftar IN. Biayanya 2 query, tetap terhadap N, bukan 1 + N.' } },
    ],
  },
  {
    id: 'mgs-case-transaction-audit-log',
    title: { en: 'Case 05: Two writes without a transaction', id: 'Kasus 05: Dua penulisan tanpa transaksi' },
    what: {
      en: 'Closing a ticket must also write an audit row. The audit insert fails, yet the ticket is DONE, there is no audit trail, and the client gets 200. The two writes are independent, and an empty catch swallows the error.',
      id: 'Menutup ticket harus juga menulis baris audit. Insert audit gagal, tetapi ticket sudah DONE, tidak ada jejak audit, dan klien mendapat 200. Kedua penulisan berdiri sendiri, dan empty catch menelan error-nya.',
    },
    why: {
      en: 'A transaction makes both writes commit or roll back together, and logging plus a 5xx makes a failure visible instead of silent data loss.',
      id: 'Transaksi membuat kedua penulisan commit atau rollback bersama, dan log plus 5xx membuat kegagalan terlihat, bukan kehilangan data diam-diam.',
    },
    tellIt: {
      en: 'The fixed closeTicket checks the ticket exists and the caller may close it, then runs update and auditLog.create in prisma.$transaction. On failure it logs with ticketId and actorId and returns a generic 500. The test forces the audit insert to fail with a foreign key error: vulnerable says 200 with the ticket DONE, fixed says 500 with the ticket still OPEN.',
      id: 'closeTicket versi fixed mengecek ticket ada dan pemanggil boleh menutupnya, lalu menjalankan update dan auditLog.create di prisma.$transaction. Saat gagal ia mencatat log dengan ticketId dan actorId lalu mengembalikan 500 generik. Test memaksa insert audit gagal dengan error foreign key: versi rentan bilang 200 dengan ticket DONE, versi fixed bilang 500 dengan ticket tetap OPEN.',
    },
    flow: [
      { en: '404 when the ticket is missing, 403 when the caller is neither assignee nor admin.', id: '404 bila ticket tidak ada, 403 bila pemanggil bukan assignee maupun admin.' },
      { en: '$transaction([update, auditLog.create]): both commit or both roll back.', id: '$transaction([update, auditLog.create]): keduanya commit atau keduanya rollback.' },
      { en: 'catch: console.error with context, then { status: 500, body: { message: "Internal server error" } }.', id: 'catch: console.error dengan konteks, lalu { status: 500, body: { message: "Internal server error" } }.' },
    ],
    snippets: [
      {
        title: { en: 'Atomic writes, visible failure', id: 'Penulisan atomik, kegagalan terlihat' },
        language: 'ts',
        code: `try {
  await prisma.$transaction([
    prisma.ticket.update({ where: { id }, data: { status: 'DONE' } }),
    prisma.auditLog.create({ data: { ticketId: id, actorId: actor.id, action: 'CLOSE' } }),
  ]);
} catch (err) {
  console.error('closeTicket failed', { ticketId: id, actorId: actor.id, err });
  return { status: 500, body: { message: 'Internal server error' } };
}`,
      },
    ],
    code: ['docs/cases/05-transaction-audit-log.md', 'part3-review/vulnerable/ticket-service.ts', 'part3-review/fixed/ticket-service.ts', 'part3-review/test/review.spec.ts'],
    questions: [
      { q: { en: 'What is wrong with an empty catch that returns 200?', id: 'Apa yang salah dengan empty catch yang mengembalikan 200?' },
        a: { en: 'The client believes the write succeeded, the data is silently inconsistent, and there is no log to investigate. Log the error and return a 5xx so the failure is visible.',
          id: 'Klien mengira penulisan berhasil, data tidak konsisten diam-diam, dan tidak ada log untuk diselidiki. Catat error-nya dan kembalikan 5xx agar kegagalan terlihat.' } },
      { q: { en: 'When is the batch form of $transaction not enough?', id: 'Kapan bentuk batch $transaction tidak cukup?' },
        a: { en: 'When one write needs the result of another. Then use the interactive form $transaction(async (tx) => ...), and keep it short because it holds locks.',
          id: 'Saat satu penulisan butuh hasil penulisan lain. Pakai bentuk interaktif $transaction(async (tx) => ...), dan buat singkat karena ia menahan lock.' } },
    ],
  },
  {
    id: 'mgs-case-fail-fast-config',
    title: { en: 'Case 06: Bad config found too late', id: 'Kasus 06: Config salah ketahuan terlambat' },
    what: {
      en: 'The API starts with a missing DATABASE_URL and only fails on the first request, long after the deploy looked healthy. In the review code a live webhook secret is written in the source, so everyone with repo access has it.',
      id: 'API menyala dengan DATABASE_URL kosong dan baru gagal di request pertama, lama setelah deploy terlihat sehat. Di kode review, secret webhook live ditulis di source, jadi semua yang punya akses repo memilikinya.',
    },
    why: {
      en: 'Validating every variable once, before the app starts, turns a late runtime failure into an immediate startup error with a clear message, and keeps secrets out of git.',
      id: 'Memvalidasi semua variabel sekali, sebelum app menyala, mengubah kegagalan runtime yang terlambat menjadi error startup seketika dengan pesan jelas, dan menjauhkan secret dari git.',
    },
    tellIt: {
      en: 'validateEnv checks DATABASE_URL is a SQLite file URL and PORT is 1-65535, and throws one message that names the variables but never their values. main.ts calls it before NestFactory.create and exits with code 1. In the review code, loadConfig reads WEBHOOK_SECRET from the environment, requires 32+ characters, and signatures are compared with timingSafeEqual.',
      id: 'validateEnv mengecek DATABASE_URL adalah URL file SQLite dan PORT 1-65535, lalu melempar satu pesan yang menyebut nama variabel tetapi tidak pernah nilainya. main.ts memanggilnya sebelum NestFactory.create dan keluar dengan kode 1. Di kode review, loadConfig membaca WEBHOOK_SECRET dari environment, mewajibkan 32+ karakter, dan signature dibandingkan dengan timingSafeEqual.',
    },
    flow: [
      { en: 'EnvSchema (class-validator) lists every variable the app needs.', id: 'EnvSchema (class-validator) mendaftar semua variabel yang dibutuhkan app.' },
      { en: 'bootstrap() validates first, then opens the DB and the port; .catch exits 1.', id: 'bootstrap() memvalidasi dulu, baru membuka DB dan port; .catch keluar dengan kode 1.' },
      { en: 'Proof: env.spec covers defaults and each failure; the review test checks the secret is gone from the fixed source.', id: 'Bukti: env.spec mencakup default dan tiap kegagalan; test review mengecek secret sudah hilang dari source fixed.' },
    ],
    snippets: [
      {
        title: { en: 'Fail before opening the port', id: 'Gagal sebelum membuka port' },
        language: 'ts',
        code: `async function bootstrap(): Promise<void> {
  const env = validateEnv(process.env); // throws: "Invalid environment: DATABASE_URL must be ..."
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(env.PORT);
}
bootstrap().catch((err) => { console.error(err.message); process.exit(1); });`,
      },
    ],
    code: ['docs/cases/06-fail-fast-config.md', 'part2-api/src/config/env.ts', 'part2-api/src/main.ts', 'part2-api/test/env.spec.ts'],
    questions: [
      { q: { en: 'Why should a config error message name the variable but not its value?', id: 'Kenapa pesan error config menyebut nama variabel tetapi bukan nilainya?' },
        a: { en: 'Startup errors end up in logs and CI output. The name is enough to fix it; the value may be a secret.',
          id: 'Error startup berakhir di log dan output CI. Nama sudah cukup untuk memperbaikinya; nilainya bisa saja secret.' } },
      { q: { en: 'Does env validation prove the database is reachable?', id: 'Apakah validasi env membuktikan database bisa dijangkau?' },
        a: { en: 'No, only the format. /health checks the database at runtime with SELECT 1 and answers 503 when it is down.',
          id: 'Tidak, hanya formatnya. /health mengecek database saat runtime dengan SELECT 1 dan membalas 503 bila mati.' } },
    ],
  },
  {
    id: 'mgs-case-sql-injection',
    title: { en: 'Case 07: SQL injection through raw queries', id: 'Kasus 07: SQL injection lewat raw query' },
    what: {
      en: "A search box sends ' UNION SELECT id, passwordHash FROM User -- and the response lists every password hash as ticket titles. The code builds SQL text with a template string and passes it to $queryRawUnsafe, so the quote in the input closes the string literal.",
      id: "Kotak pencarian mengirim ' UNION SELECT id, passwordHash FROM User -- dan respons menampilkan semua hash password sebagai judul ticket. Kodenya menyusun teks SQL dengan template string lalu mengirimnya ke $queryRawUnsafe, sehingga tanda kutip di input menutup string literal.",
    },
    why: {
      en: 'The tagged $queryRaw sends every interpolated value as a bound parameter. SQL text and value travel separately, so the value is always data, whatever characters it contains.',
      id: '$queryRaw versi tagged mengirim tiap nilai interpolasi sebagai parameter terikat. Teks SQL dan nilai dikirim terpisah, sehingga nilai selalu dianggap data, apa pun karakternya.',
    },
    tellIt: {
      en: 'I replace $queryRawUnsafe with the tagged $queryRaw and add LIMIT 50; when a model method like findMany with contains can express the query, I use that instead. The test runs the UNION payload against both: the vulnerable one returns hash-of-alice, the fixed one returns an empty list and a normal search still works.',
      id: 'Saya mengganti $queryRawUnsafe dengan $queryRaw versi tagged dan menambah LIMIT 50; bila method model seperti findMany dengan contains bisa mengekspresikan query-nya, saya pakai itu. Test menjalankan payload UNION ke keduanya: versi rentan mengembalikan hash-of-alice, versi fixed mengembalikan daftar kosong dan pencarian normal tetap jalan.',
    },
    snippets: [
      {
        title: { en: 'Unsafe string vs bound parameter', id: 'String tidak aman vs parameter terikat' },
        language: 'ts',
        code: `// vulnerable
prisma.$queryRawUnsafe(\`SELECT id, title FROM Ticket WHERE title LIKE '%\${q}%'\`);

// fixed
const pattern = \`%\${q}%\`;
prisma.$queryRaw\`SELECT id, title FROM Ticket WHERE title LIKE \${pattern} LIMIT 50\`;`,
      },
    ],
    code: ['docs/cases/07-sql-injection.md', 'part3-review/vulnerable/ticket-service.ts', 'part3-review/fixed/ticket-service.ts', 'part3-review/test/review.spec.ts'],
    questions: [
      { q: { en: 'What is the difference between $queryRaw and $queryRawUnsafe?', id: 'Apa beda $queryRaw dan $queryRawUnsafe?' },
        a: { en: '$queryRaw is a tagged template that turns each ${} into a bound parameter. $queryRawUnsafe takes a plain string, so anything interpolated into it becomes SQL text.',
          id: '$queryRaw adalah tagged template yang mengubah tiap ${} menjadi parameter terikat. $queryRawUnsafe menerima string biasa, jadi apa pun yang diinterpolasi menjadi teks SQL.' } },
      { q: { en: 'What can parameters not protect?', id: 'Apa yang tidak bisa dilindungi parameter?' },
        a: { en: 'Identifiers such as table or column names cannot be parameters; map them through an allowlist. LIKE wildcards in the input (% and _) still act as wildcards unless escaped.',
          id: 'Identifier seperti nama tabel atau kolom tidak bisa menjadi parameter; petakan lewat allowlist. Wildcard LIKE di input (% dan _) tetap bertindak sebagai wildcard kecuali di-escape.' } },
    ],
  },
  {
    id: 'mgs-case-idor',
    title: { en: "Case 08: IDOR, reading someone else's record", id: 'Kasus 08: IDOR, membaca record orang lain' },
    what: {
      en: "Bob is logged in, changes the ticket id in the URL, and reads, updates or closes Alice's ticket. The handler receives the caller but never checks that the record belongs to them.",
      id: 'Bob sudah login, mengganti id ticket di URL, lalu membaca, mengubah, atau menutup ticket milik Alice. Handler menerima data pemanggil tetapi tidak pernah mengecek bahwa record itu miliknya.',
    },
    why: {
      en: 'The client is under the attacker control, so ownership must be checked on the server where the data is loaded. One shared rule keeps every handler consistent.',
      id: 'Klien berada di bawah kendali penyerang, jadi kepemilikan harus dicek di server tempat data dimuat. Satu aturan bersama menjaga semua handler konsisten.',
    },
    tellIt: {
      en: 'canAccess(actor, ticket) allows an admin or the assignee. getTicket, updateTicket and closeTicket load the record, answer 404 when it is missing, then 403 when canAccess is false. The test shows the vulnerable getTicket gives Bob 200 for Alice ticket, and the fixed one gives Bob 403, Alice 200 and an admin 200.',
      id: 'canAccess(actor, ticket) mengizinkan admin atau assignee. getTicket, updateTicket, dan closeTicket memuat record, membalas 404 bila tidak ada, lalu 403 bila canAccess bernilai false. Test menunjukkan getTicket versi rentan memberi Bob 200 untuk ticket Alice, dan versi fixed memberi Bob 403, Alice 200, dan admin 200.',
    },
    snippets: [
      {
        title: { en: 'One ownership rule', id: 'Satu aturan kepemilikan' },
        language: 'ts',
        code: `function canAccess(actor: Actor, ticket: { assigneeId: number }): boolean {
  return actor.role === 'ADMIN' || ticket.assigneeId === actor.id;
}
if (!ticket) return { status: 404, body: { message: 'Not found' } };
if (!canAccess(actor, ticket)) return { status: 403, body: { message: 'Forbidden' } };`,
      },
    ],
    code: ['docs/cases/08-idor.md', 'part3-review/vulnerable/ticket-service.ts', 'part3-review/fixed/ticket-service.ts', 'part3-review/test/review.spec.ts'],
    questions: [
      { q: { en: 'The UI already hides other users tickets. Why check on the server?', id: 'UI sudah menyembunyikan ticket user lain. Kenapa tetap cek di server?' },
        a: { en: 'Anyone can call the API directly with any id. Only the server, where the record is loaded, can decide who may see it.',
          id: 'Siapa pun bisa memanggil API langsung dengan id apa pun. Hanya server, tempat record dimuat, yang bisa memutuskan siapa yang boleh melihatnya.' } },
      { q: { en: '403 or 404 for a record the caller may not see?', id: '403 atau 404 untuk record yang tidak boleh dilihat pemanggil?' },
        a: { en: '403 is clearer but reveals that the record exists; 404 hides that. Pick one rule and apply it everywhere. A query scoped by owner (where: { id, assigneeId: actor.id }) is another way to keep the check in one place.',
          id: '403 lebih jelas tetapi membuka bahwa record itu ada; 404 menyembunyikannya. Pilih satu aturan dan terapkan di mana-mana. Query yang dibatasi pemilik (where: { id, assigneeId: actor.id }) adalah cara lain menjaga cek di satu tempat.' } },
    ],
  },
  {
    id: 'mgs-case-stack-trace-leak',
    title: { en: 'Case 09: Stack trace and database error sent to the client', id: 'Kasus 09: Stack trace dan error database dikirim ke klien' },
    what: {
      en: 'A client assigns a ticket to a user id that does not exist and gets a 500 with the raw Prisma message ("Foreign key constraint violated...") and a stack trace full of server file paths. The handler catches every error and returns { error: String(err), stack: err.stack }.',
      id: 'Klien meng-assign ticket ke id user yang tidak ada dan mendapat 500 berisi pesan Prisma mentah ("Foreign key constraint violated...") dan stack trace penuh path file server. Handler menangkap semua error dan mengembalikan { error: String(err), stack: err.stack }.',
    },
    why: {
      en: 'The stack and the database text map the system for an attacker: tables, constraints, library versions and folders. Splitting known client errors (400) from unexpected ones (logged, generic 500) keeps the response useful and the detail on the server.',
      id: 'Stack dan teks database memetakan sistem bagi penyerang: tabel, constraint, versi library, dan folder. Memisahkan error klien yang dikenal (400) dari yang tidak terduga (dicatat, 500 generik) membuat respons tetap berguna dan detailnya tetap di server.',
    },
    tellIt: {
      en: 'In the fixed assignTicket, Prisma P2003 becomes 400 "Assignee does not exist", and anything else is logged with ticketId, actorId and the error, then answered with a generic 500. The test shows the vulnerable body contains "Foreign key constraint" and a ticket-service.ts stack frame; the fixed one returns only the generic message, and a forced SQLITE_BUSY error reaches the logger, not the client. Part 2 does the same for every endpoint with its global filters.',
      id: 'Di assignTicket versi fixed, Prisma P2003 menjadi 400 "Assignee does not exist", dan error lain dicatat bersama ticketId, actorId, dan error-nya, lalu dijawab 500 generik. Test menunjukkan body versi rentan memuat "Foreign key constraint" dan frame stack ticket-service.ts; versi fixed hanya mengembalikan pesan generik, dan error SQLITE_BUSY yang dipaksa sampai ke logger, bukan ke klien. Part 2 melakukan hal yang sama untuk semua endpoint lewat filter global.',
    },
    flow: [
      { en: 'Check 404 and ownership (403) before writing.', id: 'Cek 404 dan kepemilikan (403) sebelum menulis.' },
      { en: 'catch: P2003 (foreign key) is the caller\'s mistake, so 400 with a generic message.', id: 'catch: P2003 (foreign key) adalah kesalahan pemanggil, jadi 400 dengan pesan generik.' },
      { en: 'Anything else: console.error with context, then 500 "Internal server error".', id: 'Selain itu: console.error dengan konteks, lalu 500 "Internal server error".' },
    ],
    snippets: [
      {
        title: { en: 'Vulnerable vs fixed catch', id: 'catch rentan vs fixed' },
        language: 'ts',
        code: `// vulnerable
} catch (err) {
  return { status: 500, body: { error: String(err), stack: (err as Error).stack } };
}

// fixed
} catch (err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
    return { status: 400, body: { message: 'Assignee does not exist' } };
  }
  console.error('assignTicket failed', { ticketId: id, actorId: actor.id, err });
  return { status: 500, body: { message: 'Internal server error' } };
}`,
      },
    ],
    code: ['docs/cases/09-stack-trace-leak.md', 'part3-review/vulnerable/ticket-service.ts', 'part3-review/fixed/ticket-service.ts', 'part3-review/test/review.spec.ts'],
    questions: [
      { q: { en: 'Why is returning err.stack dangerous even when the message looks harmless?', id: 'Kenapa mengembalikan err.stack berbahaya walau pesannya terlihat tidak berbahaya?' },
        a: { en: 'The stack lists file paths, module names and library versions. That tells an attacker how the server is built and which known vulnerabilities to try. Log it, never send it.',
          id: 'Stack mendaftar path file, nama modul, dan versi library. Itu memberi tahu penyerang bagaimana server dibangun dan celah mana yang bisa dicoba. Catat di log, jangan pernah dikirim.' } },
      { q: { en: 'Generic messages make client debugging harder. How do you keep it traceable?', id: 'Pesan generik menyulitkan debugging di klien. Bagaimana menjaga agar tetap bisa dilacak?' },
        a: { en: 'Return a request id in the response and write the same id in the server log next to the full error. Support can find the detail without the client ever seeing it.',
          id: 'Kembalikan request id di respons dan tulis id yang sama di log server di samping error lengkapnya. Tim support bisa menemukan detailnya tanpa klien pernah melihatnya.' } },
    ],
  },
  {
    id: 'mgs-case-magic-numbers',
    title: { en: 'Case 10: Magic numbers hiding a bug', id: 'Kasus 10: Magic number menyembunyikan bug' },
    what: {
      en: 'Low-priority tickets breach their response target a few hours after creation, although the policy says 72 hours. The code adds raw milliseconds: 14400000, 86400000 and 25920000. The last one is 7.2 hours, one zero short of 259200000.',
      id: 'Ticket prioritas rendah melewati target respons beberapa jam setelah dibuat, padahal kebijakannya 72 jam. Kodenya menambahkan milidetik mentah: 14400000, 86400000, dan 25920000. Yang terakhir adalah 7,2 jam, kurang satu nol dari 259200000.',
    },
    why: {
      en: 'A reviewer cannot check a number they cannot read. Naming the unit (HOUR_MS) and the policy (SLA_HOURS) makes the code read like the requirement, so a wrong value stands out.',
      id: 'Reviewer tidak bisa mengecek angka yang tidak bisa dibaca. Memberi nama unit (HOUR_MS) dan kebijakan (SLA_HOURS) membuat kode terbaca seperti requirement-nya, sehingga nilai yang salah langsung terlihat.',
    },
    tellIt: {
      en: 'The fixed slaDueAt is one line: createdAt plus SLA_HOURS[priority] times HOUR_MS, with SLA_HOURS = { HIGH: 4, MEDIUM: 24, LOW: 72 } typed as a Record over every priority. The test measures hours between createdAt and the due date: the vulnerable LOW target is exactly 7.2, the fixed ones are 4, 24 and 72.',
      id: 'slaDueAt versi fixed hanya satu baris: createdAt ditambah SLA_HOURS[priority] dikali HOUR_MS, dengan SLA_HOURS = { HIGH: 4, MEDIUM: 24, LOW: 72 } bertipe Record untuk setiap priority. Test mengukur jam antara createdAt dan due date: target LOW versi rentan tepat 7,2, versi fixed 4, 24, dan 72.',
    },
    snippets: [
      {
        title: { en: 'Raw milliseconds vs named policy', id: 'Milidetik mentah vs kebijakan bernama' },
        language: 'ts',
        code: `// vulnerable: which one is wrong?
return new Date(createdAt.getTime() + 25920000);

// fixed
const HOUR_MS = 60 * 60 * 1000;
export const SLA_HOURS: Readonly<Record<Priority, number>> = { HIGH: 4, MEDIUM: 24, LOW: 72 };
return new Date(createdAt.getTime() + SLA_HOURS[priority] * HOUR_MS);`,
      },
    ],
    code: ['docs/cases/10-magic-numbers.md', 'part3-review/vulnerable/ticket-service.ts', 'part3-review/fixed/ticket-service.ts', 'part3-review/test/review.spec.ts'],
    questions: [
      { q: { en: 'Is every number literal a magic number?', id: 'Apakah setiap literal angka adalah magic number?' },
        a: { en: 'No. 0, 1 or 60 * 60 * 1000 written as a formula are clear. A magic number is a value whose meaning or unit you cannot tell from the code, like 25920000 or 0.15.',
          id: 'Tidak. 0, 1, atau 60 * 60 * 1000 yang ditulis sebagai rumus sudah jelas. Magic number adalah nilai yang makna atau unitnya tidak bisa dibaca dari kode, seperti 25920000 atau 0.15.' } },
      { q: { en: 'Does a named constant prove the value is right?', id: 'Apakah konstanta bernama membuktikan nilainya benar?' },
        a: { en: 'No, it only makes it reviewable. The test against the written policy (4, 24, 72 hours) is what proves it.',
          id: 'Tidak, ia hanya membuatnya bisa direview. Test terhadap kebijakan tertulis (4, 24, 72 jam) yang membuktikannya.' } },
    ],
  },
];
