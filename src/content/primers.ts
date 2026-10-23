import type { Primer } from '../core/types.ts';

// Beginner primers for the cards written before the primer feature existed.
// Keyed by card id so the original card files stay untouched. Every beginner card must appear here
// or carry its own primer (checked in tests/validate.test.ts).
const p = (en: string, id: string): Primer => ({ en, id });

export const primers: Record<string, Primer> = {
  // ---------------- typescript-node ----------------
  'typescript-node/types/unknown-vs-any': p(
    'TypeScript normally checks that you use values correctly. `any` switches that checking off for a value. `unknown` means "I do not know the type yet", and TypeScript makes you check before you use it.',
    'TypeScript biasanya memeriksa apakah kamu memakai nilai dengan benar. `any` mematikan pemeriksaan itu untuk sebuah nilai. `unknown` berarti "aku belum tahu tipenya", dan TypeScript mewajibkan kamu memeriksanya dulu sebelum dipakai.',
  ),
  'typescript-node/types/typeof-null': p(
    '`typeof` tells you what kind of value you have, as text such as "string" or "object". It has one famous oddity: for `null` it says "object".',
    '`typeof` memberi tahu jenis sebuah nilai dalam bentuk teks seperti "string" atau "object". Ada satu keanehan terkenal: untuk `null` hasilnya "object".',
  ),
  'typescript-node/types/default-sort': p(
    '`sort()` puts array items in order. Without a comparison function it converts items to text first, so numbers are compared like words ("10" comes before "9").',
    '`sort()` mengurutkan item array. Tanpa fungsi pembanding, item diubah menjadi teks dulu, sehingga angka dibandingkan seperti kata ("10" muncul sebelum "9").',
  ),
  'typescript-node/error-handling/json-parse-throws': p(
    '`JSON.parse` turns JSON text into a JavaScript value. If the text is not valid JSON it throws an error instead of returning something, and `try/catch` is how you handle that.',
    '`JSON.parse` mengubah teks JSON menjadi nilai JavaScript. Jika teksnya bukan JSON yang valid, ia melempar error alih-alih mengembalikan nilai, dan `try/catch` adalah cara menanganinya.',
  ),
  'typescript-node/error-handling/swallowed-catch': p(
    'Code in `try` runs normally. If something throws, the `catch` block runs instead. A `catch` that does nothing hides the failure, so the rest of the program thinks everything worked.',
    'Kode di dalam `try` berjalan seperti biasa. Jika ada yang melempar error, blok `catch` yang berjalan. `catch` yang kosong menyembunyikan kegagalan, sehingga bagian program lain mengira semuanya berhasil.',
  ),
  'typescript-node/modules/esm-vs-commonjs': p(
    'Big programs are split into many files. JavaScript has two systems for sharing code between files: the newer `import`/`export` (ESM) and the older `require` (CommonJS).',
    'Program besar dipecah menjadi banyak file. JavaScript punya dua sistem untuk berbagi kode antar file: `import`/`export` yang lebih baru (ESM) dan `require` yang lebih lama (CommonJS).',
  ),
  'typescript-node/types/nullish-coalescing': p(
    'A default value is what you use when something is missing. `||` uses the default for any "falsey" value (0, empty text), while `??` only uses it for `null` or `undefined`.',
    'Nilai default adalah nilai yang dipakai saat sesuatu tidak ada. `||` memakai default untuk semua nilai "falsy" (0, teks kosong), sedangkan `??` hanya memakainya untuk `null` atau `undefined`.',
  ),
  'typescript-node/types/assignment-in-if': p(
    'One equals sign `=` stores a value in a variable. Three equals signs `===` compare two values. Mixing them up inside an `if` is a classic beginner bug.',
    'Satu tanda sama dengan `=` menyimpan nilai ke variabel. Tiga tanda sama dengan `===` membandingkan dua nilai. Tertukar keduanya di dalam `if` adalah bug pemula yang klasik.',
  ),
  'typescript-node/utility-types/pick-omit-partial': p(
    'TypeScript can build a new type from an existing one instead of rewriting it. `Partial`, `Pick`, `Omit` and `Required` are ready-made helpers for that.',
    'TypeScript bisa membuat tipe baru dari tipe yang sudah ada tanpa menulis ulang. `Partial`, `Pick`, `Omit`, dan `Required` adalah pembantu siap pakai untuk itu.',
  ),
  'typescript-node/utility-types/record': p(
    'Sometimes an object is used like a dictionary: you look up a value by a key, such as a role name. `Record` describes that kind of object.',
    'Kadang objek dipakai seperti kamus: kamu mencari nilai lewat sebuah kunci, misalnya nama role. `Record` menggambarkan objek semacam itu.',
  ),
  'typescript-node/testing/vitest-mock-fn': p(
    'In a test you often replace a real dependency (like a database) with a fake. A "mock function" is a fake function that remembers how it was called.',
    'Dalam tes, kamu sering mengganti dependency asli (misalnya database) dengan tiruan. "Mock function" adalah fungsi tiruan yang mengingat bagaimana ia dipanggil.',
  ),
  // ---------------- nestjs-prisma ----------------
  'nestjs-prisma/guards/what-is-a-guard': p(
    'A guard is like a bouncer at a door. Before a request reaches your route code, the guard decides whether it may enter.',
    'Guard ibarat penjaga pintu. Sebelum request sampai ke kode route-mu, guard memutuskan apakah request itu boleh masuk.',
  ),
  'nestjs-prisma/dto-validation/whitelist': p(
    'A client can send extra fields you never asked for, such as `isAdmin: true`. "Whitelist" means: keep only the fields that are declared on the DTO and drop the rest.',
    'Client bisa mengirim field tambahan yang tidak kamu minta, misalnya `isAdmin: true`. "Whitelist" berarti: hanya simpan field yang dideklarasikan di DTO dan buang sisanya.',
  ),
  'nestjs-prisma/modules/exports': p(
    'In Nest every module keeps its providers private by default. To let another module use one, the owning module must list it in `exports`.',
    'Di Nest setiap module menyimpan provider-nya secara privat secara default. Agar module lain bisa memakainya, module pemilik harus mendaftarkannya di `exports`.',
  ),
  'nestjs-prisma/di/default-scope': p(
    'Nest creates providers once and shares the same object everywhere. This is called a singleton, and it is the default.',
    'Nest membuat provider sekali saja dan membagikan objek yang sama ke mana-mana. Ini disebut singleton, dan ini adalah default-nya.',
  ),
  'nestjs-prisma/dto-validation/undecorated-dto': p(
    'A DTO field is only checked or kept if it has a validation decorator such as `@IsEmail()`. A field with no decorator is invisible to the validator.',
    'Field DTO hanya diperiksa atau dipertahankan jika punya decorator validasi seperti `@IsEmail()`. Field tanpa decorator tidak terlihat oleh validator.',
  ),
  'nestjs-prisma/relations/select-vs-include': p(
    'When you read a record you can choose what comes back. `select` lists the exact fields you want. `include` adds related records (like a user\'s posts) on top of the normal fields.',
    'Saat membaca sebuah record, kamu bisa memilih apa yang dikembalikan. `select` menyebut field persis yang kamu mau. `include` menambahkan record terkait (misalnya post milik user) di atas field biasa.',
  ),
  'nestjs-prisma/relations/updated-at-map': p(
    'Prisma has small markers you put on a model. Some fill in values for you (`@updatedAt`), and some change names in the database (`@@map`).',
    'Prisma punya penanda kecil yang dipasang pada model. Sebagian mengisi nilai untukmu (`@updatedAt`), sebagian mengubah nama di database (`@@map`).',
  ),
  'nestjs-prisma/migrations/generate': p(
    'Changing `schema.prisma` does not change the database or the code by itself. A "migration" updates the database; "generate" rebuilds the typed client your code uses.',
    'Mengubah `schema.prisma` tidak otomatis mengubah database atau kode. "Migration" memperbarui database; "generate" membangun ulang client bertipe yang dipakai kodemu.',
  ),
  'nestjs-prisma/pipes/parse-int': p(
    'URL parts such as `/users/12` arrive as text. A pipe sits between the request and your handler and can convert or check a value before your code sees it.',
    'Bagian URL seperti `/users/12` datang sebagai teks. Pipe berada di antara request dan handler-mu dan bisa mengubah atau memeriksa nilai sebelum kodemu melihatnya.',
  ),
  'nestjs-prisma/exception-filters/http-exceptions': p(
    'When something goes wrong you can throw a ready-made error such as `NotFoundException`. Nest turns it into the right HTTP status code for the client.',
    'Saat terjadi masalah, kamu bisa melempar error siap pakai seperti `NotFoundException`. Nest mengubahnya menjadi kode status HTTP yang tepat untuk client.',
  ),
  'nestjs-prisma/prisma-queries/find-unique-vs-first': p(
    'Prisma has two ways to fetch one record. One needs a field that is guaranteed unique (like an id). The other accepts any filter and returns the first match.',
    'Prisma punya dua cara mengambil satu record. Satu butuh field yang dijamin unik (seperti id). Yang lain menerima filter apa saja dan mengembalikan hasil pertama yang cocok.',
  ),
  // ---------------- vue3 ----------------
  'vue3/reactivity/ref-vs-reactive': p(
    'Vue only updates the screen for data it can watch. `ref` and `reactive` are the two ways to make data watchable: `ref` wraps a single value, `reactive` wraps a whole object.',
    'Vue hanya memperbarui layar untuk data yang bisa ia pantau. `ref` dan `reactive` adalah dua cara membuat data bisa dipantau: `ref` membungkus satu nilai, `reactive` membungkus satu objek utuh.',
  ),
  'vue3/composition-api/computed-vs-watch': p(
    'A `computed` value is a result worked out from other data (like a total from prices). A `watch` runs code when data changes (like saving to the server).',
    'Nilai `computed` adalah hasil yang dihitung dari data lain (misalnya total dari harga). `watch` menjalankan kode ketika data berubah (misalnya menyimpan ke server).',
  ),
  'vue3/props-emits/one-way-flow': p(
    'In Vue, data flows down from parent to child through props. A child must not change a prop; it asks the parent to change it by sending an event.',
    'Di Vue, data mengalir turun dari parent ke child lewat props. Child tidak boleh mengubah prop; ia meminta parent mengubahnya dengan mengirim event.',
  ),
  'vue3/reactivity/value-in-template': p(
    'A `ref` is a box with `.value` inside. In the script you write `.value`. In the template Vue opens the box for you, so you write only the name.',
    '`ref` adalah kotak dengan `.value` di dalamnya. Di script kamu menulis `.value`. Di template Vue membukakan kotaknya untukmu, jadi kamu cukup menulis namanya.',
  ),
  'vue3/composition-api/script-setup': p(
    '`<script setup>` is the short way to write a component\'s logic. Whatever you declare at its top level can be used directly in the template.',
    '`<script setup>` adalah cara singkat menulis logika komponen. Apa pun yang kamu deklarasikan di tingkat atasnya bisa langsung dipakai di template.',
  ),
  'vue3/props-emits/mutate-prop': p(
    'Props belong to the parent. Changing a prop inside the child does not update the parent and Vue warns about it.',
    'Props milik parent. Mengubah prop di dalam child tidak memperbarui parent dan Vue akan memberi peringatan.',
  ),
  'vue3/router/use-route-vs-router': p(
    'Vue Router gives you two helpers. One tells you where you are right now (the current URL, its parameters). The other lets you go somewhere else.',
    'Vue Router memberi dua pembantu. Satu memberi tahu di mana kamu berada sekarang (URL saat ini dan parameternya). Satunya lagi memungkinkan kamu pindah ke tempat lain.',
  ),
  'vue3/nuxt/auto-imports': p(
    'Nuxt is a framework built on top of Vue. To save typing, it automatically imports many things for you, so you can use them without an `import` line.',
    'Nuxt adalah framework di atas Vue. Untuk menghemat ketikan, ia mengimpor banyak hal secara otomatis, sehingga bisa dipakai tanpa baris `import`.',
  ),
  'vue3/pinia/when-to-use': p(
    'Pinia is Vue\'s shared storage. Data that many unrelated screens need (like the logged-in user) can live there instead of being passed through every component.',
    'Pinia adalah penyimpanan bersama milik Vue. Data yang dibutuhkan banyak layar yang tidak berhubungan (misalnya user yang login) bisa disimpan di sana, bukan dioper lewat setiap komponen.',
  ),
  'vue3/forms/v-model-modifiers': p(
    '`v-model` links a form field to a variable in both directions. Modifiers such as `.number` and `.trim` adjust the value on its way in.',
    '`v-model` menghubungkan field form dengan variabel di kedua arah. Modifier seperti `.number` dan `.trim` menyesuaikan nilai saat masuk.',
  ),
  'vue3/router/query-values-are-strings': p(
    'The query string is the part of a URL after `?`, like `?mode=interview`. It is just text, so Vue Router gives it to you as text (or a list of text).',
    'Query string adalah bagian URL setelah `?`, misalnya `?mode=interview`. Isinya hanya teks, jadi Vue Router memberikannya sebagai teks (atau daftar teks).',
  ),
  // ---------------- java-spring ----------------
  'java-spring/java-basics/string-equality': p(
    'In Java `==` asks "are these the very same object in memory?". `.equals()` asks "do these contain the same text?". For text you almost always want `.equals()`.',
    'Di Java `==` bertanya "apakah ini objek yang sama persis di memori?". `.equals()` bertanya "apakah isi teksnya sama?". Untuk teks, hampir selalu yang kamu butuhkan adalah `.equals()`.',
  ),
  'java-spring/rest-controllers/rest-controller': p(
    'A controller receives HTTP requests. In an API you return data (JSON), not a web page, and `@RestController` is the annotation for that.',
    'Controller menerima request HTTP. Di sebuah API kamu mengembalikan data (JSON), bukan halaman web, dan `@RestController` adalah annotation untuk itu.',
  ),
  'java-spring/spring-boot-basics/constructor-injection': p(
    'Spring can hand a class what it needs in three ways. The recommended one is to ask for it in the constructor, so the class is complete the moment it is created.',
    'Spring bisa memberikan apa yang dibutuhkan sebuah class dengan tiga cara. Yang direkomendasikan adalah memintanya lewat constructor, sehingga class itu sudah lengkap begitu dibuat.',
  ),
  'java-spring/java-basics/integer-division': p(
    'In Java, dividing two whole numbers (`int`) gives a whole number: the decimal part is cut off, not rounded.',
    'Di Java, membagi dua bilangan bulat (`int`) menghasilkan bilangan bulat: bagian desimalnya dipotong, bukan dibulatkan.',
  ),
  'java-spring/spring-boot-basics/spring-boot-application': p(
    'Every Spring Boot project has one main class with `@SpringBootApplication`. That single annotation switches on several features at once.',
    'Setiap proyek Spring Boot punya satu class utama dengan `@SpringBootApplication`. Satu annotation itu mengaktifkan beberapa fitur sekaligus.',
  ),
  'java-spring/spring-boot-basics/profiles': p(
    'Your app runs in different places: your laptop, a test server, production. A profile is a named set of settings for one of those places.',
    'Aplikasimu berjalan di tempat berbeda: laptopmu, server tes, produksi. Profile adalah kumpulan pengaturan bernama untuk salah satu tempat itu.',
  ),
  'java-spring/rest-controllers/status-codes': p(
    'Every HTTP response has a number that says how it went. 2xx means success. `201` specifically means "I created something new".',
    'Setiap respons HTTP punya angka yang menyatakan hasilnya. 2xx berarti sukses. `201` secara khusus berarti "aku membuat sesuatu yang baru".',
  ),
  'java-spring/validation/notblank-vs-notnull': p(
    'Validation annotations check incoming data before your code uses it. Three similar ones differ in how strict they are about empty text.',
    'Annotation validasi memeriksa data masuk sebelum dipakai kodemu. Tiga annotation yang mirip berbeda dalam seberapa ketat mereka terhadap teks kosong.',
  ),
  'java-spring/data-access/derived-queries': p(
    'In Spring Data you can get a database query just by naming a method in a repository interface, such as `findByEmail`. Spring reads the name and builds the query.',
    'Di Spring Data kamu bisa mendapatkan query database hanya dengan menamai method di interface repository, misalnya `findByEmail`. Spring membaca namanya dan membuatkan query-nya.',
  ),
  // ---------------- security ----------------
  'security/authn-authz/authn-vs-authz': p(
    '"Authentication" asks who you are. "Authorization" asks what you may do. A server answers the first with 401 and the second with 403.',
    '"Authentication" menanyakan siapa kamu. "Authorization" menanyakan apa yang boleh kamu lakukan. Server menjawab yang pertama dengan 401 dan yang kedua dengan 403.',
  ),
  'security/password-storage/hash-choice': p(
    'A website must never keep your real password. It keeps a scrambled version (a hash) and compares scrambled versions when you log in.',
    'Situs web tidak boleh menyimpan password aslimu. Ia menyimpan versi acak (hash) dan membandingkan versi acak itu saat kamu login.',
  ),
  'security/input-validation/validate-server-side': p(
    'Anything a user types or sends can be changed by an attacker, even if your web form looked safe. The server must check it again.',
    'Apa pun yang diketik atau dikirim pengguna bisa diubah penyerang, walaupun form web-mu tampak aman. Server harus memeriksanya lagi.',
  ),
  'security/cors/not-an-auth-mechanism': p(
    'Browsers stop a web page from reading data from a different website unless that site agrees. CORS is how a server says who it agrees with.',
    'Browser mencegah halaman web membaca data dari situs lain kecuali situs itu mengizinkan. CORS adalah cara server menyatakan siapa yang ia izinkan.',
  ),
  'security/security-headers/helmet': p(
    'A server can send extra instructions with every response (HTTP headers) that make browsers behave more safely. `helmet` sets a good group of them for you.',
    'Server bisa mengirim instruksi tambahan di setiap respons (HTTP header) yang membuat browser bekerja lebih aman. `helmet` memasang sekelompok header yang baik untukmu.',
  ),
  'security/secrets/hardcoded': p(
    'A secret (password, API key, signing key) written in your source code is copied into git history and every build. Secrets belong outside the code.',
    'Rahasia (password, API key, kunci penandatangan) yang ditulis di kode sumber akan tersalin ke riwayat git dan setiap build. Rahasia harus berada di luar kode.',
  ),
  'security/owasp-api-top-10/unrestricted-resource': p(
    'OWASP publishes a list of the most common API weaknesses. One of them is letting a client ask for too much at once, which can overload your server.',
    'OWASP menerbitkan daftar kelemahan API yang paling umum. Salah satunya adalah membiarkan client meminta terlalu banyak sekaligus, yang bisa membebani servermu.',
  ),
  // ---------------- sql-db ----------------
  'sql-db/indexes/plan-uses-index': p(
    '`EXPLAIN` shows how the database plans to run a query. "SCAN" means it reads every row; "SEARCH ... USING INDEX" means it jumps straight to the matching rows.',
    '`EXPLAIN` menunjukkan bagaimana database berencana menjalankan sebuah query. "SCAN" berarti membaca setiap baris; "SEARCH ... USING INDEX" berarti langsung melompat ke baris yang cocok.',
  ),
  'sql-db/indexes/write-cost': p(
    'An index speeds up searching, but it is an extra structure the database must keep up to date. Nothing in a database is free.',
    'Index mempercepat pencarian, tetapi ia adalah struktur tambahan yang harus selalu diperbarui database. Tidak ada yang gratis di dalam database.',
  ),
  'sql-db/pagination/stable-order': p(
    'Pagination shows data a page at a time with `LIMIT` and `OFFSET`. Without `ORDER BY`, the database may return rows in any order, so pages can overlap or skip.',
    'Pagination menampilkan data satu halaman per kali dengan `LIMIT` dan `OFFSET`. Tanpa `ORDER BY`, database boleh mengembalikan baris dalam urutan apa saja, sehingga halaman bisa tumpang tindih atau terlewat.',
  ),
  'sql-db/transactions/rollback-result': p(
    'A transaction groups steps together. `BEGIN` starts it, `COMMIT` keeps the changes and `ROLLBACK` throws all of them away.',
    'Transaksi mengelompokkan beberapa langkah. `BEGIN` memulainya, `COMMIT` menyimpan perubahan, dan `ROLLBACK` membuang semuanya.',
  ),
  'sql-db/query-semantics/having-vs-where': p(
    '`GROUP BY` collects rows into groups and you can total each group (for example `SUM`). `WHERE` filters rows before grouping; `HAVING` filters the groups afterwards.',
    '`GROUP BY` mengumpulkan baris menjadi kelompok dan setiap kelompok bisa dijumlahkan (misalnya `SUM`). `WHERE` menyaring baris sebelum dikelompokkan; `HAVING` menyaring kelompok setelahnya.',
  ),
  // ---------------- messaging ----------------
  'messaging/why-brokers/decoupling': p(
    'A message broker is a middleman that holds messages between two programs. The sender can drop a message and move on; the receiver picks it up when it is ready.',
    'Message broker adalah perantara yang menahan pesan di antara dua program. Pengirim bisa menaruh pesan lalu melanjutkan pekerjaan; penerima mengambilnya saat siap.',
  ),
  'messaging/why-brokers/at-least-once': p(
    'If a worker crashes before confirming a message, the broker sends it again. That means the same message can arrive more than once.',
    'Jika sebuah worker crash sebelum mengonfirmasi pesan, broker mengirimnya lagi. Artinya pesan yang sama bisa datang lebih dari satu kali.',
  ),
  'messaging/why-brokers/sync-vs-async': p(
    '"Synchronous" means the caller waits for the result. "Asynchronous" means it hands the job off and carries on. Slow jobs such as sending email are good candidates for async.',
    '"Synchronous" berarti pemanggil menunggu hasilnya. "Asynchronous" berarti ia menyerahkan tugas lalu melanjutkan. Tugas lambat seperti mengirim email cocok dibuat async.',
  ),
  'messaging/rabbitmq/publish-to-exchange': p(
    'RabbitMQ has two parts that beginners mix up: the exchange (where messages arrive and are routed) and the queue (where they wait to be processed).',
    'RabbitMQ punya dua bagian yang sering tertukar oleh pemula: exchange (tempat pesan tiba dan diarahkan) dan queue (tempat pesan menunggu diproses).',
  ),
};
