import type { FocusTopic } from '../../core/focus.ts';

// Study material for SIMRS Rawat Jalan (Outpatient Hospital Information System).
// Facts, table names, constraints, benchmarks, and test counts follow the repo's docs, proof-book evidence, and code.
// Topic ids start with "simrs-" because progress keys share one namespace with the other Focus projects.

export const simrsTopics: FocusTopic[] = [
  {
    id: 'simrs-overview',
    title: { en: 'Overview, outpatient workflow & stack', id: 'Gambaran umum, alur rawat jalan & stack' },
    what: {
      en: 'SIMRS Rawat Jalan is a full-stack outpatient hospital information system built with four containerized services: `frontend-react` (React 19, TypeScript, Vite 8, Tailwind, shadcn/ui, Zustand, i18next on :5173), `backend-yii` (PHP 8.3 + Yii2 2.0 REST API on :8080), `service-node` (Node.js 24, Express 5, TypeScript, Zod, pg on :3000), and PostgreSQL 16 (:5432). It covers the complete outpatient lifecycle: patient registration and polyclinic queue, doctor examination (SOAP, ICD-10 diagnosis, procedures, prescriptions, lab orders), external lab result ingestion, pharmacy dispensing with stock mutation, invoice billing with Valid/Unvalid lock and partial/full payment, operational/financial dashboards, and dynamic RBAC.',
      id: 'SIMRS Rawat Jalan adalah sistem informasi rumah sakit rawat jalan full-stack dengan empat layanan berbasis container: `frontend-react` (React 19, TypeScript, Vite 8, Tailwind, shadcn/ui, Zustand, i18next di :5173), `backend-yii` (REST API PHP 8.3 + Yii2 2.0 di :8080), `service-node` (Node.js 24, Express 5, TypeScript, Zod, pg di :3000), dan PostgreSQL 16 (:5432). Sistem mencakup seluruh siklus rawat jalan: pendaftaran pasien dan antrean poli, pemeriksaan dokter (SOAP, diagnosis ICD-10, tindakan, resep, order lab), penerimaan hasil lab eksternal, penyerahan farmasi beserta mutasi stok, penagihan invoice dengan kunci Valid/Unvalid serta pembayaran bertahap/lunas, dashboard operasional & keuangan, serta RBAC dinamis.',
    },
    why: {
      en: 'Hospital outpatient transactions combine strict ACID invariants (no double-booked queues, no negative drug stock, no double payment, auditable billing revisions) with asynchronous external device pushes and heavy reporting queries. Putting all transactional writes in one authoritative backend (`backend-yii`) while isolating external lab retries and read-only analytics in `service-node` keeps business rules in a single place without letting reporting or external outages block clinical work.',
      id: 'Transaksi rawat jalan rumah sakit memadukan invarian ACID yang ketat (antrean tidak ganda, stok obat tidak minus, pembayaran tidak ganda, revisi tagihan teraudit) dengan kiriman alat eksternal asinkron dan query laporan berat. Menaruh seluruh penulisan transaksi di satu backend otoritatif (`backend-yii`) sambil mengisolasi retry lab eksternal dan analitik read-only di `service-node` menjaga aturan bisnis tetap satu sumber tanpa membiarkan laporan atau gangguan eksternal menghambat pelayanan klinis.',
    },
    tellIt: {
      en: 'Open with the end-to-end patient journey (registration → queue → doctor exam → lab & pharmacy → billing → dashboard), then name the four containers and state the core rule: Yii2 is the single writer for business data, Node handles outbox integration and read-only analytics, and PostgreSQL enforces the final safety net.',
      id: 'Buka dengan perjalanan pasien dari ujung ke ujung (pendaftaran → antrean → pemeriksaan dokter → lab & farmasi → billing → dashboard), lalu sebut keempat container dan aturan intinya: Yii2 adalah penulis tunggal data bisnis, Node menangani integrasi outbox dan analitik read-only, dan PostgreSQL menjadi pengaman integritas terakhir.',
    },
    flow: [
      {
        en: 'Registration staff registers a patient to a polyclinic doctor schedule (`POST /transaction/pendaftaran`), locking quota and issuing an atomic queue number (`U-001`, `RJ...`).',
        id: 'Petugas pendaftaran mendaftarkan pasien ke jadwal dokter poli (`POST /transaction/pendaftaran`), mengunci kuota dan menerbitkan nomor antrean atomik (`U-001`, `RJ...`).',
      },
      {
        en: 'Polyclinic queue calls the patient (with optional TV display & voice announcement) and doctor records SOAP exam, ICD-10 diagnosis, procedures, prescriptions, and lab orders.',
        id: 'Antrean poli memanggil pasien (dengan layar display TV & pengumuman suara opsional) lalu dokter mencatat pemeriksaan SOAP, diagnosis ICD-10, tindakan, resep, dan order lab.',
      },
      {
        en: 'External lab devices push results to `service-node` (`POST /api/lab/results`), which forwards idempotently to Yii or queues into `t_integration_outbox` for exponential retry; pharmacy dispenses prescriptions with atomic stock deduction.',
        id: 'Alat lab eksternal mengirim hasil ke `service-node` (`POST /api/lab/results`), yang meneruskan secara idempoten ke Yii atau menampung di `t_integration_outbox` untuk retry eksponensial; farmasi menyerahkan resep dengan pengurangan stok atomik.',
      },
      {
        en: 'Cashier generates an invoice from four cost sources (registration, procedures, lab, drugs), validates the visit, takes idempotent partial/full payment, and management reviews indexed read-only dashboards on Node.',
        id: 'Kasir membuat invoice dari empat sumber biaya (pendaftaran, tindakan, lab, obat), memvalidasi kunjungan, memproses pembayaran bertahap/lunas yang idempoten, dan manajemen memantau dashboard read-only terindeks di Node.',
      },
    ],
    code: [
      'README.md',
      'docker-compose.yml',
      'docs/architecture.md',
      'database/erd.md',
    ],
    questions: [
      {
        q: { en: 'Walk me through the architecture and end-to-end flow of SIMRS Rawat Jalan.', id: 'Jelaskan arsitektur dan alur end-to-end SIMRS Rawat Jalan.' },
        a: {
          en: 'The system runs four Docker services: a React 19 SPA, a Yii2 PHP 8.3 core API, an Express 5 TypeScript support service, and PostgreSQL 16. A visit starts at registration with quota locking and atomic queue numbering, moves through polyclinic queue and doctor clinical documentation (SOAP, ICD-10, procedures, prescriptions, lab orders), branches into pharmacy dispensing and external lab result delivery, and closes at cashier billing with Valid/Unvalid locking and idempotent payment. Verification is backed by 250 automated tests (134 PHPUnit, 38 Node Vitest, 78 React Vitest), 45 Newman E2E assertions, and 3 concurrency stress scripts.',
          id: 'Sistem menjalankan empat layanan Docker: SPA React 19, core API Yii2 PHP 8.3, service pendukung Express 5 TypeScript, dan PostgreSQL 16. Kunjungan dimulai dari pendaftaran dengan penguncian kuota dan penomoran antrean atomik, lanjut ke antrean poli dan pencatatan klinis dokter (SOAP, ICD-10, tindakan, resep, order lab), bercabang ke penyerahan farmasi dan pengiriman hasil lab eksternal, lalu ditutup di billing kasir dengan kunci Valid/Unvalid dan pembayaran idempoten. Pembuktian didukung 250 test otomatis (134 PHPUnit, 38 Node Vitest, 78 React Vitest), 45 asersi E2E Newman, dan 3 skrip uji konkurensi.',
        },
      },
      {
        q: { en: 'Why enforce constraints in PostgreSQL when the Yii2 services already validate every request?', id: 'Kenapa tetap memasang constraint di PostgreSQL padahal service Yii2 sudah memvalidasi setiap request?' },
        a: {
          en: 'Application-level checks alone have race windows under concurrent requests and can be bypassed by bugs, scripts, or future services. PostgreSQL acts as the last line of defense: partial unique indexes stop duplicate active visits and duplicate active invoice items, `CHECK (stok >= 0)` makes negative drug stock impossible, `CHECK (total_bayar <= total)` blocks overpayment, and `simrs_readonly` guarantees Node analytics cannot mutate business tables.',
          id: 'Validasi di lapisan aplikasi saja punya celah race condition saat request paralel dan bisa terlewati oleh bug, skrip, atau layanan baru. PostgreSQL menjadi pertahanan terakhir: partial unique index mencegah kunjungan aktif ganda dan item invoice aktif ganda, `CHECK (stok >= 0)` membuat stok obat minus mustahil terjadi, `CHECK (total_bayar <= total)` memblokir overpayment, dan `simrs_readonly` menjamin analitik Node tidak bisa mengubah tabel bisnis.',
        },
      },
    ],
  },
  {
    id: 'simrs-yii-vs-node',
    title: { en: 'Yii2 vs Node.js boundary & single writer', id: 'Batas tanggung jawab Yii2 vs Node.js & single writer' },
    what: {
      en: 'Both backends share one PostgreSQL 16 database, but ownership is strictly split: `backend-yii` owns all database migrations, authentication, RBAC management, master data, clinical/billing transactions, and audit logs. `service-node` never writes to business tables (`m_*`, `t_*`); it only owns `t_integration_outbox` for external lab delivery retries and serves 7 read-only dashboard endpoints via a separate PostgreSQL role `simrs_readonly`.',
      id: 'Kedua backend berbagi satu database PostgreSQL 16, tetapi kepemilikannya dipisah tegas: `backend-yii` memiliki seluruh migrasi database, autentikasi, manajemen RBAC, master data, transaksi klinis/billing, dan audit log. `service-node` tidak pernah menulis ke tabel bisnis (`m_*`, `t_*`); ia hanya memiliki `t_integration_outbox` untuk retry pengiriman hasil lab eksternal dan melayani 7 endpoint dashboard read-only lewat role PostgreSQL terpisah `simrs_readonly`.',
    },
    why: {
      en: 'In polyglot backends that share a database, the biggest failure mode is duplicated business logic drifting apart (for example, calculating lab abnormal flags or invoice totals differently in two languages). Making Yii2 the single writer forces Node to forward lab results through Yii HTTP endpoints (`PUT /transaction/hasil-lab/{detailId}`) and forces dashboard queries to aggregate only Yii-locked snapshots through a `SELECT`-only DB user.',
      id: 'Pada backend poliglot yang berbagi database, kegagalan terbesar adalah duplikasi business logic yang saling menyimpang (misalnya menghitung flag lab abnormal atau total invoice secara berbeda di dua bahasa). Menjadikan Yii2 sebagai single writer memaksa Node meneruskan hasil lab lewat endpoint HTTP Yii (`PUT /transaction/hasil-lab/{detailId}`) dan memaksa query dashboard hanya mengagregasi snapshot yang sudah dikunci Yii lewat user DB khusus `SELECT`.',
    },
    tellIt: {
      en: 'State the three anti-duplication mechanisms: single writer for business tables, HTTP forwarding from Node to Yii for lab mutations, and database-level `simrs_readonly` isolation for Node dashboard queries—plus a unified JSON envelope `{ success, message, data, meta?, errors? }` across both backends.',
      id: 'Sebut tiga mekanisme pencegah duplikasi: single writer untuk tabel bisnis, penerusan HTTP dari Node ke Yii untuk mutasi hasil lab, dan isolasi level database `simrs_readonly` untuk query dashboard Node—ditambah amplop JSON seragam `{ success, message, data, meta?, errors? }` di kedua backend.',
    },
    flow: [
      {
        en: '`backend-yii` owns all migrations in `backend-yii/migrations/` (including `t_integration_outbox` and dashboard indexes) so schema evolution has one timeline.',
        id: '`backend-yii` memiliki seluruh migrasi di `backend-yii/migrations/` (termasuk `t_integration_outbox` dan index dashboard) agar evolusi skema punya satu linimasa.',
      },
      {
        en: 'For lab result writes, `service-node` validates shape with Zod and forwards via `yii-client.ts` to Yii `OrderLabService::simpanHasil()`, where normal/high/low flags and order completion rules live.',
        id: 'Untuk penulisan hasil lab, `service-node` memvalidasi bentuk payload dengan Zod lalu meneruskannya lewat `yii-client.ts` ke `OrderLabService::simpanHasil()` di Yii, tempat aturan flag normal/tinggi/rendah dan status selesai berada.',
      },
      {
        en: 'For dashboard reads, `service-node` connects via `readDb()` using `DB_READONLY_USER=simrs_readonly` (provisioned by `database/init/02-create-readonly-user.sql`), summing only non-void snapshots (`is_void = false`).',
        id: 'Untuk pembacaan dashboard, `service-node` terhubung lewat `readDb()` memakai `DB_READONLY_USER=simrs_readonly` (dibuat oleh `database/init/02-create-readonly-user.sql`), hanya menjumlahkan snapshot aktif (`is_void = false`).',
      },
    ],
    code: [
      'docs/yii-vs-node.md',
      'database/init/02-create-readonly-user.sql',
      'service-node/src/lib/db.ts',
      'service-node/src/lib/yii-client.ts',
      'backend-yii/common/ApiResponse.php',
    ],
    questions: [
      {
        q: { en: 'How do you prevent business logic duplication between Yii2 and Node.js?', id: 'Bagaimana mencegah duplikasi business logic antara Yii2 dan Node.js?' },
        a: {
          en: 'Three rules enforce it. First, any mutation of clinical, stock, or billing state lives strictly in `backend-yii`: for instance, `OrderLabService::hitungFlag()` computes abnormal flags in Yii, while Node only validates the incoming webhook with Zod and forwards it over HTTP. Second, Node dashboard queries sum already-computed snapshot columns (`t_pembayaran.jumlah`, `t_invoice.total`, `t_invoice_item.subtotal WHERE is_void = false`) instead of recalculating tariffs. Third, `readDb()` connects with PostgreSQL role `simrs_readonly` (`SELECT` only), making accidental writes structurally impossible.',
          id: 'Tiga aturan menegakkannya. Pertama, setiap mutasi state klinis, stok, atau billing hanya ada di `backend-yii`: misalnya `OrderLabService::hitungFlag()` menghitung flag abnormal di Yii, sedangkan Node hanya memvalidasi webhook masuk dengan Zod lalu meneruskannya lewat HTTP. Kedua, query dashboard Node hanya menjumlahkan kolom snapshot yang sudah dihitung (`t_pembayaran.jumlah`, `t_invoice.total`, `t_invoice_item.subtotal WHERE is_void = false`) alih-alih menghitung ulang tarif. Ketiga, `readDb()` memakai role PostgreSQL `simrs_readonly` (khusus `SELECT`), sehingga penulisan tidak sengaja mustahil secara struktural.',
        },
      },
      {
        q: { en: 'When a new feature is requested, how do you decide whether it belongs in Yii2 or Node.js?', id: 'Saat ada fitur baru, bagaimana memutuskan apakah masuk ke Yii2 atau Node.js?' },
        a: {
          en: 'If the feature creates or mutates business entities, requires cross-table ACID transactions, generates document numbers, changes clinical status, or writes audit logs, it goes to `backend-yii`. If it is an asynchronous external integration needing webhook buffering/outbox retries, or a read-only analytical/reporting aggregation over indexed tables, it goes to `service-node`.',
          id: 'Bila fitur membuat atau mengubah entitas bisnis, butuh transaksi ACID lintas tabel, menerbitkan nomor dokumen, mengubah status klinis, atau mencatat audit log, maka masuk ke `backend-yii`. Bila berupa integrasi eksternal asinkron yang butuh buffer webhook/retry outbox, atau agregasi analitik/pelaporan read-only di atas tabel terindeks, maka masuk ke `service-node`.',
        },
      },
    ],
  },
  {
    id: 'simrs-auth-rbac',
    title: { en: 'Shared JWT HS256 & dynamic RBAC matrix', id: 'JWT HS256 bersama & matriks RBAC dinamis' },
    what: {
      en: 'Authentication is issued solely by `backend-yii` (`POST /system/auth/login`) as a JWT HS256 signed with a shared secret and issuer (`simrs-backend`). Permissions are stored dynamically in PostgreSQL (`m_role`, `m_module`, `m_menu`, `m_module_menu`, `m_role_access`) with four flags per menu (`can_read`, `can_create`, `can_update`, `can_delete`), including a dedicated `dashboard-keuangan` menu that separates financial revenue charts from general operational counts.',
      id: 'Autentikasi hanya diterbitkan oleh `backend-yii` (`POST /system/auth/login`) berupa JWT HS256 yang ditandatangani dengan secret dan issuer bersama (`simrs-backend`). Hak akses disimpan dinamis di PostgreSQL (`m_role`, `m_module`, `m_menu`, `m_module_menu`, `m_role_access`) dengan empat flag per menu (`can_read`, `can_create`, `can_update`, `can_delete`), termasuk menu khusus `dashboard-keuangan` yang memisahkan grafik pendapatan keuangan dari angka operasional umum.',
    },
    why: {
      en: 'Hardcoding role names like `if (role === "kasir")` breaks whenever a hospital creates custom roles or adjusts privileges. Checking `m_role_access` dynamically at every layer—UI (`PermissionGuard.tsx` + sidebar filtering), Yii (`JwtAuth` + `AccessFilter.php`), and Node (`auth.ts` verifying JWT + querying `m_role_access` via `simrs_readonly`)—means permission edits take effect immediately without re-issuing tokens or redeploying.',
      id: 'Meng-hardcode nama role seperti `if (role === "kasir")` mudah rusak ketika rumah sakit membuat role kustom atau mengubah hak akses. Memeriksa `m_role_access` secara dinamis di setiap lapisan—UI (`PermissionGuard.tsx` + filter sidebar), Yii (`JwtAuth` + `AccessFilter.php`), dan Node (`auth.ts` memverifikasi JWT + mengecek `m_role_access` via `simrs_readonly`)—membuat perubahan izin langsung berlaku tanpa menerbitkan ulang token atau deploy ulang.',
    },
    tellIt: {
      en: 'Walk the three enforcement layers: React hides unauthorized menus and renders `ForbiddenPage` via `PermissionGuard`, Yii `AccessFilter` maps every controller action to `menu:permission` (throwing config error if unmapped), and Node independently verifies the same HS256 JWT and checks `m_role_access` in PostgreSQL.',
      id: 'Jelaskan tiga lapis penegakan: React menyembunyikan menu tak berizin dan merender `ForbiddenPage` lewat `PermissionGuard`, `AccessFilter` Yii memetakan tiap action controller ke `menu:permission` (melempar error konfigurasi bila belum dipetakan), dan Node secara independen memverifikasi JWT HS256 yang sama lalu mengecek `m_role_access` di PostgreSQL.',
    },
    flow: [
      {
        en: 'User logs in at `LoginPage.tsx` → `POST /system/auth/login` verifies password hash against `m_user`, loads active modules/menus and `m_role_access`, and returns `{ token, user, modules, permissions }`.',
        id: 'Pengguna masuk di `LoginPage.tsx` → `POST /system/auth/login` memverifikasi hash password di `m_user`, memuat modul/menu aktif dan `m_role_access`, lalu mengembalikan `{ token, user, modules, permissions }`.',
      },
      {
        en: 'Every Yii API request passes `JwtAuth` (validating HS256 signature, issuer, expiry, and active user) followed by `AccessFilter::beforeAction()`, which rejects unauthorized actions with HTTP `403`.',
        id: 'Setiap request API Yii melewati `JwtAuth` (memvalidasi tanda tangan HS256, issuer, kedaluwarsa, dan status aktif user) diikuti `AccessFilter::beforeAction()`, yang menolak aksi tak berizin dengan HTTP `403`.',
      },
      {
        en: 'Node dashboard requests pass `service-node/src/middleware/auth.ts`, which verifies the same HS256 JWT and checks `dashboard:read` (and `dashboard-keuangan:read` for revenue/payment endpoints) via `readDb()`; external lab pushes authenticate separately with `X-Api-Key`.',
        id: 'Request dashboard Node melewati `service-node/src/middleware/auth.ts`, yang memverifikasi JWT HS256 yang sama dan mengecek `dashboard:read` (serta `dashboard-keuangan:read` untuk endpoint pendapatan/pembayaran) via `readDb()`; push lab eksternal diautentikasi terpisah dengan `X-Api-Key`.',
      },
    ],
    code: [
      'backend-yii/common/JwtService.php',
      'backend-yii/common/JwtAuth.php',
      'backend-yii/common/AccessFilter.php',
      'service-node/src/middleware/auth.ts',
      'frontend-react/src/routes/PermissionGuard.tsx',
      'frontend-react/src/modules/system/role-access/RoleAccessPage.tsx',
    ],
    questions: [
      {
        q: { en: 'If an admin revokes billing access from a role, how fast does it take effect?', id: 'Kalau admin mencabut akses billing dari sebuah role, seberapa cepat efeknya berlaku?' },
        a: {
          en: 'Immediately on the next API call, even while the user still holds a valid JWT. The JWT carries user and role identity, not a frozen snapshot of permissions: both Yii `AccessFilter` and Node `auth.ts` check `m_role_access` live in PostgreSQL. On the UI side, `PermissionGuard` is a UX convenience, never the security boundary.',
          id: 'Langsung pada panggilan API berikutnya, bahkan saat pengguna masih memegang JWT yang valid. JWT membawa identitas user dan role, bukan snapshot izin yang beku: baik `AccessFilter` Yii maupun `auth.ts` Node memeriksa `m_role_access` secara langsung di PostgreSQL. Di sisi UI, `PermissionGuard` hanyalah kenyamanan UX, bukan batas keamanan.',
        },
      },
      {
        q: { en: 'Why is there a separate `dashboard-keuangan` permission instead of using `dashboard` for everything?', id: 'Kenapa ada izin terpisah `dashboard-keuangan` alih-alih memakai `dashboard` untuk semua?' },
        a: {
          en: 'Operational staff (like registration or doctors) may need visit counts per polyclinic without seeing hospital revenue figures. Splitting `dashboard-keuangan` lets both `DashboardPage.tsx` (skipping `getPendapatan` and `getPembayaran` calls) and `service-node` (returning 403 on financial routes) enforce least-privilege access cleanly.',
          id: 'Staf operasional (seperti pendaftaran atau dokter) mungkin butuh jumlah kunjungan per poli tanpa boleh melihat angka pendapatan rumah sakit. Memisahkan `dashboard-keuangan` membuat `DashboardPage.tsx` (melewati panggilan `getPendapatan` dan `getPembayaran`) serta `service-node` (mengembalikan 403 di route keuangan) menegakkan prinsip least-privilege dengan bersih.',
        },
      },
    ],
  },
  {
    id: 'simrs-d1-registration',
    title: { en: 'D.1 Registration concurrency, quota & atomic queues', id: 'D.1 Konkurensi pendaftaran, kuota & antrean atomik' },
    what: {
      en: 'Scenario D.1 prevents three simultaneous-registration hazards: registering the same patient twice to the same polyclinic on the same day, overselling a doctor schedule quota, and issuing duplicate queue numbers (`U-001`, `RJ202611240001`). It combines row locking on `m_jadwal_dokter` (`FOR UPDATE`), atomic counters in `SequenceService` (`t_sequence_counter`), and two PostgreSQL unique indexes.',
      id: 'Skenario D.1 mencegah tiga bahaya pendaftaran bersamaan: mendaftarkan pasien yang sama dua kali ke poli dan tanggal yang sama, melampaui kuota jadwal dokter, serta menerbitkan nomor antrean kembar (`U-001`, `RJ202611240001`). Solusinya memadukan row lock pada `m_jadwal_dokter` (`FOR UPDATE`), counter atomik di `SequenceService` (`t_sequence_counter`), dan dua unique index PostgreSQL.',
    },
    why: {
      en: 'A plain `SELECT COUNT(*) + 1` or `MAX(no_antrean) + 1` fails under concurrent transactions because two workers read the same count before either commits. Locking the schedule row serializes quota checks per schedule, `SequenceService` locks the counter row (`INSERT ... ON CONFLICT DO NOTHING` then `SELECT ... FOR UPDATE`), and a partial unique index `WHERE status <> \'batal\'` blocks duplicate active visits while still allowing re-registration after cancellation.',
      id: 'Query biasa `SELECT COUNT(*) + 1` atau `MAX(no_antrean) + 1` gagal pada transaksi paralel karena dua worker membaca angka yang sama sebelum salah satunya commit. Mengunci baris jadwal menyerialkan cek kuota per jadwal, `SequenceService` mengunci baris counter (`INSERT ... ON CONFLICT DO NOTHING` lalu `SELECT ... FOR UPDATE`), dan partial unique index `WHERE status <> \'batal\'` memblokir kunjungan aktif ganda sambil tetap mengizinkan daftar ulang setelah batal.',
    },
    tellIt: {
      en: 'Explain the three layers in order: schedule `FOR UPDATE` for quota, `SequenceService` for gap-safe atomic queue numbering, and the two PostgreSQL indexes (`uq_t_kunjungan_pasien_poli_tgl_aktif` partial unique + `uq_t_kunjungan_antrean`), then quote the concurrency proof: 10 parallel requests for the same patient yielded 1×201 and 9×409, and 10 parallel patients got distinct sequential numbers `[2..11]`.',
      id: 'Jelaskan tiga lapis berurutan: `FOR UPDATE` pada jadwal untuk kuota, `SequenceService` untuk penomoran antrean atomik, dan dua index PostgreSQL (partial unique `uq_t_kunjungan_pasien_poli_tgl_aktif` + `uq_t_kunjungan_antrean`), lalu kutip bukti konkurensinya: 10 request paralel pasien sama menghasilkan 1×201 dan 9×409, dan 10 pasien paralel mendapat nomor berurutan unik `[2..11]`.',
    },
    flow: [
      {
        en: '`PendaftaranService::daftar()` opens a DB transaction, locks `m_jadwal_dokter` (`FOR UPDATE`), and checks active visit count against `kuota`.',
        id: '`PendaftaranService::daftar()` membuka transaksi DB, mengunci `m_jadwal_dokter` (`FOR UPDATE`), lalu mengecek jumlah kunjungan aktif terhadap `kuota`.',
      },
      {
        en: '`SequenceService::next()` runs `INSERT INTO t_sequence_counter ... ON CONFLICT DO NOTHING` followed by `SELECT nilai_terakhir ... FOR UPDATE` and increments atomically for both `no_kunjungan` and `no_antrean` (prefixed per poli via `m_poli.prefix_antrean`).',
        id: '`SequenceService::next()` menjalankan `INSERT INTO t_sequence_counter ... ON CONFLICT DO NOTHING` diikuti `SELECT nilai_terakhir ... FOR UPDATE` dan menaikkan nilai secara atomik untuk `no_kunjungan` maupun `no_antrean` (berprefiks per poli lewat `m_poli.prefix_antrean`).',
      },
      {
        en: 'PostgreSQL verifies `uq_t_kunjungan_pasien_poli_tgl_aktif` (`WHERE status <> \'batal\'`) and `uq_t_kunjungan_antrean`; any duplicate or full-quota violation returns HTTP `409 Conflict`.',
        id: 'PostgreSQL memverifikasi `uq_t_kunjungan_pasien_poli_tgl_aktif` (`WHERE status <> \'batal\'`) dan `uq_t_kunjungan_antrean`; pelanggaran duplikat atau kuota penuh mengembalikan HTTP `409 Conflict`.',
      },
    ],
    code: [
      'backend-yii/modules/transaction/pendaftaran/PendaftaranService.php',
      'backend-yii/common/SequenceService.php',
      'backend-yii/migrations/m261121_123000_create_t_kunjungan_and_status_log_tables.php',
      'tests/concurrency/pendaftaran.mjs',
    ],
    questions: [
      {
        q: { en: 'Why use a partial unique index instead of a regular unique constraint on `(pasien_id, poli_id, tgl_kunjungan)`?', id: 'Kenapa memakai partial unique index bukan unique constraint biasa pada `(pasien_id, poli_id, tgl_kunjungan)`?' },
        a: {
          en: 'A regular unique constraint would prevent a patient from re-registering to the same clinic on the same day if their earlier visit was cancelled due to a typo or schedule change. Adding `WHERE status <> \'batal\'` enforces at most one active visit per patient, polyclinic, and day while still permitting re-registration after cancellation, verified by `PendaftaranServiceTest`.',
          id: 'Unique constraint biasa akan melarang pasien mendaftar ulang ke poli yang sama di hari yang sama bila kunjungan sebelumnya dibatalkan karena salah input atau ganti jadwal. Menambahkan `WHERE status <> \'batal\'` menegakkan maksimal satu kunjungan aktif per pasien, poli, dan hari sambil tetap mengizinkan daftar ulang setelah batal, yang teruji di `PendaftaranServiceTest`.',
        },
      },
      {
        q: { en: 'What did `tests/concurrency/pendaftaran.mjs` prove?', id: 'Apa yang dibuktikan oleh `tests/concurrency/pendaftaran.mjs`?' },
        a: {
          en: 'Sending 10 parallel registration requests for the same patient produced exactly 1 `201 Created` and 9 `409 Conflict`. Sending 10 parallel requests for distinct patients on the same schedule produced unique consecutive queue numbers `[2, 3, 4, 5, 6, 7, 8, 9, 10, 11]` with zero duplicates and without exceeding quota.',
          id: 'Mengirim 10 request pendaftaran paralel untuk pasien yang sama menghasilkan tepat 1 `201 Created` dan 9 `409 Conflict`. Mengirim 10 request paralel untuk pasien berbeda pada jadwal yang sama menghasilkan nomor antrean berurutan unik `[2, 3, 4, 5, 6, 7, 8, 9, 10, 11]` tanpa duplikat dan tidak melewati kuota.',
        },
      },
    ],
  },
  {
    id: 'simrs-clinical-flow',
    title: { en: 'Clinical exam, ICD-10, orders & price snapshots', id: 'Pemeriksaan klinis, ICD-10, order & snapshot tarif' },
    what: {
      en: 'Doctors work from `WorklistPage.tsx` into the 8-tab `PemeriksaanPage.tsx`: Anamnesis, Vital Signs, Physical Exam, ICD-10 Diagnosis (primary/secondary), Medical Procedures (`TindakanPanel`), Prescriptions (`ResepPanel`), Lab Orders (`OrderLabPanel`), and Longitudinal Medical History (`RiwayatMedisList`). Every procedure, prescription detail, and lab order snapshots its master price/tariff at order time.',
      id: 'Dokter bekerja dari `WorklistPage.tsx` masuk ke `PemeriksaanPage.tsx` yang punya 8 tab: Anamnesis, Tanda Vital, Pemeriksaan Fisik, Diagnosis ICD-10 (primer/sekunder), Tindakan Medis (`TindakanPanel`), Resep (`ResepPanel`), Order Laboratorium (`OrderLabPanel`), dan Riwayat Rekam Medis (`RiwayatMedisList`). Setiap tindakan, detail resep, dan order lab menyimpan snapshot harga/tarif master pada saat dibuat.',
    },
    why: {
      en: 'Hospital master tariffs (`m_tindakan.tarif`, `m_obat.harga`, `m_pemeriksaan_lab.tarif`) change over time. If historical visits or invoices joined live master prices, updating a drug price next month would silently rewrite past invoices and revenue reports. Snapshotting unit price and subtotal on transaction rows preserves historical accounting accuracy.',
      id: 'Tarif master rumah sakit (`m_tindakan.tarif`, `m_obat.harga`, `m_pemeriksaan_lab.tarif`) berubah seiring waktu. Jika kunjungan atau invoice lama melakukan join langsung ke harga master terbaru, mengubah harga obat bulan depan akan diam-diam mengubah invoice lama dan laporan pendapatan. Menyimpan snapshot harga satuan dan subtotal di baris transaksi menjaga akurasi akuntansi historis.',
    },
    tellIt: {
      en: 'Highlight the clinical data model (`t_pemeriksaan`, `t_diagnosis` referencing `m_icd10`, `t_tindakan`, `t_resep`/`t_resep_detail`, `t_order_lab`/`t_order_lab_detail`), the price snapshot rule, and how clinical mutations hook into `BillingSyncService` and `AuditLogBehavior`.',
      id: 'Soroti model data klinis (`t_pemeriksaan`, `t_diagnosis` merujuk `m_icd10`, `t_tindakan`, `t_resep`/`t_resep_detail`, `t_order_lab`/`t_order_lab_detail`), aturan snapshot harga, dan bagaimana mutasi klinis terhubung ke `BillingSyncService` serta `AuditLogBehavior`.',
    },
    flow: [
      {
        en: 'Doctor opens a waiting/in-progress visit from `WorklistPage` and saves SOAP fields (`t_pemeriksaan`) plus ICD-10 diagnoses (`t_diagnosis`, audited via `AuditLog::catat`).',
        id: 'Dokter membuka kunjungan menunggu/diperiksa dari `WorklistPage` dan menyimpan catatan SOAP (`t_pemeriksaan`) beserta diagnosis ICD-10 (`t_diagnosis`, diaudit lewat `AuditLog::catat`).',
      },
      {
        en: 'Adding procedures (`TindakanKunjunganService`), prescriptions (`ResepService`), or lab orders (`OrderLabService`) snapshots master tariffs onto the transaction rows and checks that the visit is neither cancelled nor cashier-validated (`is_valid = true`).',
        id: 'Penambahan tindakan (`TindakanKunjunganService`), resep (`ResepService`), atau order lab (`OrderLabService`) menyalin snapshot tarif master ke baris transaksi dan memastikan kunjungan belum batal serta belum dikunci validasi kasir (`is_valid = true`).',
      },
      {
        en: 'If an invoice already exists and the cashier has unlocked it (`Unvalid`), changes automatically trigger `BillingSyncService::sinkronkan()` to void stale items and insert updated ones.',
        id: 'Jika invoice sudah terbit dan kasir telah membuka kuncinya (`Unvalid`), perubahan otomatis memicu `BillingSyncService::sinkronkan()` untuk menandai void item lama dan memasukkan item baru.',
      },
    ],
    code: [
      'frontend-react/src/modules/transaction/pemeriksaan/PemeriksaanPage.tsx',
      'backend-yii/modules/transaction/pemeriksaan/PemeriksaanService.php',
      'backend-yii/modules/transaction/tindakan/TindakanKunjunganService.php',
      'backend-yii/modules/transaction/resep/ResepService.php',
      'backend-yii/modules/transaction/lab/OrderLabService.php',
    ],
    questions: [
      {
        q: { en: 'Why snapshot tariffs on `t_tindakan`, `t_resep_detail`, and `t_order_lab_detail` instead of joining master tables?', id: 'Kenapa menyimpan snapshot tarif di `t_tindakan`, `t_resep_detail`, dan `t_order_lab_detail` alih-alih join ke tabel master?' },
        a: {
          en: 'Because master prices are mutable while billed visits are immutable financial history. Snapshotting the unit price at transaction time ensures invoices, printed receipts, and Node dashboard revenue queries always reflect what the patient was actually charged on that date, even after master tariff updates.',
          id: 'Karena harga master bisa berubah sedangkan kunjungan yang ditagih adalah riwayat keuangan yang tidak boleh berubah. Menyimpan snapshot harga satuan saat transaksi memastikan invoice, bukti bayar tercetak, dan query pendapatan dashboard Node selalu mencerminkan biaya sebenarnya pada tanggal tersebut, meski tarif master diperbarui kemudian.',
        },
      },
      {
        q: { en: 'What prevents a doctor from adding new orders after the cashier has finalized billing?', id: 'Apa yang mencegah dokter menambah order baru setelah kasir memfinalkan tagihan?' },
        a: {
          en: 'Creating an invoice marks `t_kunjungan.is_valid = true`. Every clinical write service checks `ValidasiKunjunganService` and rejects mutations with `409 Conflict` while valid. If an extra procedure or drug is genuinely needed before full payment, the cashier must explicitly click Unvalid; once paid (`lunas`), the visit becomes permanently `selesai` and cannot be unlocked.',
          id: 'Membuat invoice menandai `t_kunjungan.is_valid = true`. Setiap service penulisan klinis memeriksa `ValidasiKunjunganService` dan menolak mutasi dengan `409 Conflict` selama valid. Bila tindakan atau obat tambahan memang diperlukan sebelum lunas, kasir harus menekan Unvalid secara eksplisit; begitu `lunas`, kunjungan menjadi `selesai` permanen dan tidak bisa dibuka lagi.',
        },
      },
    ],
  },
  {
    id: 'simrs-d2-pharmacy-stock',
    title: { en: 'D.2 Pharmacy dispensing & atomic stock deduction', id: 'D.2 Penyerahan farmasi & pengurangan stok atomik' },
    what: {
      en: 'Scenario D.2 guarantees drug inventory never goes negative and prescriptions are never dispensed twice, even when two prescriptions compete for the last 5 tablets or a pharmacist double-clicks "Serahkan". `FarmasiService::serahkan()` wraps all items in one transaction, enforces consistent lock ordering (`t_kunjungan → t_resep → m_obat ORDER BY obat_id ASC`), uses conditional atomic updates (`UPDATE m_obat SET stok = stok - :qty WHERE id = :id AND stok >= :qty RETURNING stok`), and logs every change in `t_stok_mutasi`.',
      id: 'Skenario D.2 menjamin stok obat tidak pernah minus dan resep tidak pernah diserahkan dua kali, bahkan saat dua resep berebut 5 tablet terakhir atau apoteker mengklik "Serahkan" dua kali bersamaan. `FarmasiService::serahkan()` membungkus semua item dalam satu transaksi, menegakkan urutan lock konsisten (`t_kunjungan → t_resep → m_obat ORDER BY obat_id ASC`), memakai update atomik bersyarat (`UPDATE m_obat SET stok = stok - :qty WHERE id = :id AND stok >= :qty RETURNING stok`), dan mencatat tiap mutasi di `t_stok_mutasi`.',
    },
    why: {
      en: 'Checking stock in PHP and then subtracting in a second query suffers from lost updates under concurrency, while locking drugs in arbitrary line order causes deadlocks when Prescription A has `[Drug 1, Drug 2]` and Prescription B has `[Drug 2, Drug 1]`. Sorting by `obat_id ASC` eliminates circular lock waits, conditional `WHERE stok >= :qty` makes the deduction atomic, and PostgreSQL `CHECK (stok >= 0)` seals the invariant.',
      id: 'Mengecek stok di PHP lalu menguranginya di query kedua rawan lost update saat konkurensi, sedangkan mengunci obat sesuai urutan baris acak memicu deadlock bila Resep A berisi `[Obat 1, Obat 2]` dan Resep B berisi `[Obat 2, Obat 1]`. Mengurutkan berdasarkan `obat_id ASC` meniadakan circular lock wait, `WHERE stok >= :qty` membuat pengurangan atomik, dan `CHECK (stok >= 0)` di PostgreSQL mengunci invarian tersebut.',
    },
    tellIt: {
      en: 'Walk through the exact lock hierarchy (`t_kunjungan` → `t_resep` → `m_obat` sorted by `obat_id`), the conditional `UPDATE ... RETURNING stok`, the `t_stok_mutasi` audit entry, and cite `tests/concurrency/stok-obat.mjs`: two 5-tablet recipes competing for stock 5 produced `[200, 409]` with final stock `0` and 1 out-mutation; 5 parallel clicks on the same recipe produced 1×200 and 4×409.',
      id: 'Jelaskan hierarki lock-nya (`t_kunjungan` → `t_resep` → `m_obat` urut `obat_id`), `UPDATE ... RETURNING stok` bersyarat, pencatatan `t_stok_mutasi`, lalu kutip `tests/concurrency/stok-obat.mjs`: dua resep 5 tablet berebut stok 5 menghasilkan `[200, 409]` dengan stok akhir `0` dan 1 mutasi keluar; 5 klik paralel pada resep sama menghasilkan 1×200 dan 4×409.',
    },
    flow: [
      {
        en: 'Pharmacist moves prescription from `baru` → `diproses` (`PUT /transaction/farmasi/{id}/proses`), locking parent `t_kunjungan` first so a concurrent visit cancellation cannot race.',
        id: 'Apoteker mengubah resep dari `baru` → `diproses` (`PUT /transaction/farmasi/{id}/proses`), mengunci induk `t_kunjungan` dulu agar tidak balapan dengan pembatalan kunjungan.',
      },
      {
        en: 'On `PUT /transaction/farmasi/{id}/serahkan`, `FarmasiService` sorts `t_resep_detail` by `obat_id ASC` and executes `UPDATE m_obat SET stok = stok - :qty WHERE id = :id AND stok >= :qty RETURNING stok`.',
        id: 'Saat `PUT /transaction/farmasi/{id}/serahkan`, `FarmasiService` mengurutkan `t_resep_detail` berdasarkan `obat_id ASC` dan mengeksekusi `UPDATE m_obat SET stok = stok - :qty WHERE id = :id AND stok >= :qty RETURNING stok`.',
      },
      {
        en: 'If any single drug returns `false` (insufficient stock), `ConflictHttpException` (409) rolls back every prior drug deduction in the same prescription so stock stays completely atomic.',
        id: 'Bila satu obat saja mengembalikan `false` (stok kurang), `ConflictHttpException` (409) me-rollback seluruh pengurangan obat sebelumnya di resep yang sama sehingga stok tetap atomik sepenuhnya.',
      },
      {
        en: 'Every successful deduction inserts a `t_stok_mutasi` ledger row (`jenis = \'keluar\'`, `stok_sebelum`, `stok_sesudah`, `referensi`) and marks the prescription `diserahkan`.',
        id: 'Setiap pengurangan sukses menyisipkan baris buku besar `t_stok_mutasi` (`jenis = \'keluar\'`, `stok_sebelum`, `stok_sesudah`, `referensi`) dan menandai resep `diserahkan`.',
      },
    ],
    code: [
      'backend-yii/modules/transaction/resep/FarmasiService.php',
      'backend-yii/migrations/m261121_114000_create_m_obat_and_t_stok_mutasi_tables.php',
      'frontend-react/src/modules/master/obat/ObatPage.tsx',
      'frontend-react/src/modules/transaction/resep/FarmasiPage.tsx',
      'tests/concurrency/stok-obat.mjs',
    ],
    questions: [
      {
        q: { en: 'How do you prevent deadlocks when two pharmacists dispense multi-drug prescriptions concurrently?', id: 'Bagaimana mencegah deadlock saat dua apoteker menyerahkan resep multi-obat secara bersamaan?' },
        a: {
          en: 'Consistent lock ordering across the entire transaction. First `kunciDenganKunjungan()` locks `t_kunjungan` then `t_resep` (matching `AntreanService::ubahStatus()` so visit cancellation and dispensing cannot deadlock each other). Then `t_resep_detail` is queried with `orderBy([\'obat_id\' => SORT_ASC])`, so every transaction acquires row locks on `m_obat` in strictly ascending primary-key order.',
          id: 'Urutan lock yang konsisten di seluruh transaksi. Pertama `kunciDenganKunjungan()` mengunci `t_kunjungan` lalu `t_resep` (sama seperti `AntreanService::ubahStatus()` agar pembatalan kunjungan dan penyerahan tidak saling deadlock). Lalu `t_resep_detail` diambil dengan `orderBy([\'obat_id\' => SORT_ASC])`, sehingga tiap transaksi selalu mengambil row lock pada `m_obat` dalam urutan primary key menaik.',
        },
      },
      {
        q: { en: 'Why subtract stock on `serahkan` instead of when the doctor writes the prescription?', id: 'Kenapa stok dikurangi saat `serahkan`, bukan saat dokter menulis resep?' },
        a: {
          en: 'A doctor may revise or cancel a prescription before the patient picks up medicine at the pharmacy, or the patient may buy externally. Deducting only on physical dispensing (`serahkan`) keeps physical shelf counts aligned with `m_obat.stok`, while `t_stok_mutasi` records the exact before/after audit trail for both dispensing and manual stock adjustments.',
          id: 'Dokter bisa merevisi atau membatalkan resep sebelum pasien mengambil obat di farmasi, atau pasien bisa menebus di luar. Mengurangi stok hanya saat penyerahan fisik (`serahkan`) menjaga stok rak fisik selaras dengan `m_obat.stok`, sementara `t_stok_mutasi` mencatat jejak audit sebelum/sesudah untuk penyerahan maupun penyesuaian stok manual.',
        },
      },
    ],
  },
  {
    id: 'simrs-d3-d4-billing',
    title: { en: 'D.3 & D.4 Idempotent payment, Valid/Unvalid lock & audit', id: 'D.3 & D.4 Pembayaran idempoten, kunci Valid/Unvalid & audit' },
    what: {
      en: 'D.3 prevents double payments and overpayments using a mandatory client-generated UUID `Idempotency-Key` (`BayarDialog.tsx`), row locking on `t_invoice` (`FOR UPDATE`), re-checking `idempotency_key` after acquiring the lock, and PostgreSQL constraints (`uq_t_pembayaran_idempotency_key`, `CHECK (total_bayar <= total)`). D.4 handles post-invoice clinical edits safely via the cashier Valid/Unvalid visit lock, soft-voiding changed `t_invoice_item` rows with mandatory `alasan_void`, and recording before/after JSONB snapshots in `t_audit_log`.',
      id: 'D.3 mencegah pembayaran ganda dan overpayment lewat UUID `Idempotency-Key` wajib dari klien (`BayarDialog.tsx`), row lock `t_invoice` (`FOR UPDATE`), pengecekan ulang `idempotency_key` setelah lock didapat, dan constraint PostgreSQL (`uq_t_pembayaran_idempotency_key`, `CHECK (total_bayar <= total)`). D.4 menangani perubahan klinis pasca-invoice secara aman lewat kunci Valid/Unvalid kasir, void lembut pada `t_invoice_item` dengan `alasan_void` wajib, serta pencatatan snapshot JSONB lama/baru di `t_audit_log`.',
    },
    why: {
      en: 'Cashier networks drop mid-response and users click Pay twice: without `Idempotency-Key`, a retry charges the patient twice. Similarly, deleting old invoice rows on revision destroys financial audit trails, whereas marking `is_void = true` with `alasan_void` keeps an append-only ledger while `uq_t_invoice_item_aktif WHERE is_void = false` prevents active duplicates. Locking the visit (`is_valid = true`) stops silent clinical edits after a bill is quoted.',
      id: 'Jaringan kasir bisa putus di tengah respons dan petugas bisa mengklik Bayar dua kali: tanpa `Idempotency-Key`, retry akan menagih pasien dua kali. Demikian pula, menghapus baris invoice lama saat revisi menghancurkan jejak audit keuangan, sedangkan menandai `is_void = true` beserta `alasan_void` menjaga buku besar tetap utuh sambil `uq_t_invoice_item_aktif WHERE is_void = false` mencegah duplikat aktif. Mengunci kunjungan (`is_valid = true`) mencegah perubahan klinis diam-diam setelah tagihan dikutip.',
    },
    tellIt: {
      en: 'Connect D.3 and D.4 into one clean cashier narrative: one UUID per Pay dialog handles double clicks/retries (`[200,200,200,200,201]` in 5 parallel calls); different keys racing the remaining balance yield `[201,409,409,409,409]`; Valid/Unvalid gates clinical revisions with void reasons and 6 JSONB audit entries; and once `lunas`, the visit transitions permanently to `selesai`.',
      id: 'Satukan D.3 dan D.4 menjadi satu narasi kasir: satu UUID per dialog Bayar menangani klik ganda/retry (`[200,200,200,200,201]` dari 5 panggilan paralel); key berbeda yang berebut sisa tagihan menghasilkan `[201,409,409,409,409]`; Valid/Unvalid mengawal revisi klinis dengan alasan void dan 6 entri audit JSONB; dan begitu `lunas`, kunjungan berpindah permanen ke `selesai`.',
    },
    flow: [
      {
        en: 'Before issuing an invoice or clicking Valid, cashier receives red warnings from `GET /transaction/invoice/peringatan` if lab orders, prescriptions, or exam are incomplete.',
        id: 'Sebelum membuat invoice atau menekan Valid, kasir melihat peringatan merah dari `GET /transaction/invoice/peringatan` bila order lab, resep, atau pemeriksaan belum tuntas.',
      },
      {
        en: 'Opening `BayarDialog` generates one UUID `Idempotency-Key` (`pembayaranApi.buatIdempotencyKey()`); retries reuse the exact same key until the dialog closes.',
        id: 'Membuka `BayarDialog` membuat satu UUID `Idempotency-Key` (`pembayaranApi.buatIdempotencyKey()`); retry mengirim key persis sama hingga dialog ditutup.',
      },
      {
        en: '`PembayaranService::bayar()` locks `t_invoice FOR UPDATE`, re-checks `idempotency_key` (returning existing payment with HTTP `200` on replay, or `409` if reused on another invoice), rejects overpayment, and marks the visit permanently `selesai` once `lunas`.',
        id: '`PembayaranService::bayar()` mengunci `t_invoice FOR UPDATE`, mengecek ulang `idempotency_key` (mengembalikan pembayaran lama HTTP `200` saat replay, atau `409` bila dipakai di invoice lain), menolak overpayment, dan menandai kunjungan `selesai` permanen begitu `lunas`.',
      },
      {
        en: 'If revision is needed before `lunas`, cashier clicks Unvalid → doctor edits → `BillingSyncService::sinkronkan()` voids old items with `alasan_void` (rolling back `409` if new `total < total_bayar`) → `AuditLogBehavior` writes `data_lama`/`data_baru` JSONB.',
        id: 'Bila perlu revisi sebelum `lunas`, kasir klik Unvalid → dokter ubah → `BillingSyncService::sinkronkan()` menandai void item lama dengan `alasan_void` (rollback `409` bila `total < total_bayar`) → `AuditLogBehavior` mencatat JSONB `data_lama`/`data_baru`.',
      },
    ],
    code: [
      'backend-yii/modules/transaction/pembayaran/PembayaranService.php',
      'backend-yii/modules/transaction/pembayaran/BillingSyncService.php',
      'backend-yii/modules/transaction/pembayaran/ValidasiKunjunganService.php',
      'backend-yii/common/AuditLogBehavior.php',
      'frontend-react/src/modules/transaction/pembayaran/BillingPage.tsx',
      'frontend-react/src/modules/transaction/pembayaran/BayarDialog.tsx',
      'tests/concurrency/pembayaran.mjs',
    ],
    questions: [
      {
        q: { en: 'Why re-check `idempotency_key` inside the transaction AFTER `SELECT ... FOR UPDATE` on `t_invoice`?', id: 'Kenapa mengecek ulang `idempotency_key` di dalam transaksi SETELAH `SELECT ... FOR UPDATE` pada `t_invoice`?' },
        a: {
          en: 'When 5 parallel requests arrive with the same `Idempotency-Key`, all 5 pass any pre-lock check before the winner inserts its row. Serializing on the `t_invoice` row lock means the 4 waiting requests wake up right after the winner commits, immediately see the committed `idempotency_key`, roll back cleanly, and return the winner\'s payment with HTTP `200` instead of crashing or double-charging.',
          id: 'Saat 5 request paralel masuk dengan `Idempotency-Key` yang sama, kelimanya lolos pengecekan pra-lock sebelum pemenang menyisipkan barisnya. Penyerialan lewat row lock `t_invoice` membuat 4 request yang menunggu bangun tepat setelah pemenang commit, langsung melihat `idempotency_key` yang sudah tersimpan, rollback dengan bersih, dan mengembalikan pembayaran pemenang dengan HTTP `200` tanpa error atau penagihan ganda.',
        },
      },
      {
        q: { en: 'What happens if a clinical revision reduces the invoice total below what the patient has already paid?', id: 'Apa yang terjadi kalau revisi klinis menurunkan total invoice di bawah jumlah yang sudah dibayar pasien?' },
        a: {
          en: '`BillingSyncService::sinkronkan()` detects `totalBaru < total_bayar` inside the transaction, throws `409 Conflict`, and rolls back both the clinical change and invoice sync atomically. If `totalBaru == total_bayar`, the invoice automatically settles to `lunas` and transitions the visit to `selesai`. Both cases are covered in `BillingSyncServiceTest`.',
          id: '`BillingSyncService::sinkronkan()` mendeteksi `totalBaru < total_bayar` di dalam transaksi, melempar `409 Conflict`, dan me-rollback perubahan klinis maupun sinkronisasi invoice secara atomik. Bila `totalBaru == total_bayar`, invoice otomatis berubah menjadi `lunas` dan kunjungan berpindah ke `selesai`. Kedua kasus diuji di `BillingSyncServiceTest`.',
        },
      },
    ],
  },
  {
    id: 'simrs-d5-lab-outbox',
    title: { en: 'D.5 External lab integration: Outbox & retry worker', id: 'D.5 Integrasi lab eksternal: Outbox & retry worker' },
    what: {
      en: 'Scenario D.5 decouples external laboratory analyzers from `backend-yii` availability. External systems push results to `service-node` (`POST /api/lab/results` with `X-Api-Key` and `idempotency_key`). Node validates the payload with Zod and attempts synchronous forwarding to Yii (`PUT /transaction/hasil-lab/{detailId}`). If Yii is unreachable, times out, or returns 5xx, Node persists the event in `t_integration_outbox` (`status = \'pending\'`), returns `202 Accepted`, and `outbox.worker.ts` retries with exponential backoff using `FOR UPDATE SKIP LOCKED`.',
      id: 'Skenario D.5 memisahkan alat laboratorium eksternal dari ketersediaan `backend-yii`. Sistem eksternal mengirim hasil ke `service-node` (`POST /api/lab/results` dengan `X-Api-Key` dan `idempotency_key`). Node memvalidasi payload dengan Zod lalu mencoba meneruskan langsung ke Yii (`PUT /transaction/hasil-lab/{detailId}`). Bila Yii mati, timeout, atau mengembalikan 5xx, Node menyimpan pesan ke `t_integration_outbox` (`status = \'pending\'`), membalas `202 Accepted`, dan `outbox.worker.ts` mengirim ulang dengan exponential backoff memakai `FOR UPDATE SKIP LOCKED`.',
    },
    why: {
      en: 'External lab machines rarely implement reliable long-term retries when the core hospital API restarts or deploys. Without a durable outbox, results vanish; without `FOR UPDATE SKIP LOCKED`, scaling to two Node workers causes duplicate deliveries; and without Yii-side `t_order_lab_detail.idempotency_key`, a timeout after Yii committed would fail or overwrite on retry.',
      id: 'Alat lab eksternal jarang punya retry jangka panjang yang andal saat core API rumah sakit restart atau deploy. Tanpa outbox yang persisten, hasil bisa hilang; tanpa `FOR UPDATE SKIP LOCKED`, menjalankan dua worker Node menyebabkan pengiriman ganda; dan tanpa `t_order_lab_detail.idempotency_key` di Yii, timeout setelah Yii commit akan gagal atau menimpa saat retry.',
    },
    tellIt: {
      en: 'Trace the failure simulation from `evidence/D5-outbox-retry.txt`: stop `simrs-yii`, push a lab result to `:3000/api/lab/results` → `202 Accepted` queued in `t_integration_outbox`, start `simrs-yii` → worker claims row with `FOR UPDATE SKIP LOCKED` + 60s lease, delivers to Yii, marks `terkirim`, and re-sending the same key produces zero duplicates.',
      id: 'Telusuri simulasi gangguan di `evidence/D5-outbox-retry.txt`: hentikan `simrs-yii`, kirim hasil lab ke `:3000/api/lab/results` → `202 Accepted` masuk `t_integration_outbox`, hidupkan `simrs-yii` → worker mengambil baris dengan `FOR UPDATE SKIP LOCKED` + lease 60 detik, mengirim ke Yii, menandai `terkirim`, dan pengiriman ulang key sama tidak membuat duplikat.',
    },
    flow: [
      {
        en: 'External lab sends `POST /api/lab/results` with `X-Api-Key` and `idempotency_key`; Node validates with Zod and forwards to Yii `PUT /transaction/hasil-lab/{detailId}` using a service-account JWT.',
        id: 'Lab eksternal mengirim `POST /api/lab/results` dengan `X-Api-Key` dan `idempotency_key`; Node memvalidasi dengan Zod lalu meneruskan ke Yii `PUT /transaction/hasil-lab/{detailId}` memakai JWT akun layanan.',
      },
      {
        en: 'On network error or Yii 5xx, `outbox.ts` stores the payload in `t_integration_outbox` (`status = \'pending\'`, unique `idempotency_key`) and responds `202 Accepted` so the lab device does not lose the result.',
        id: 'Saat gangguan jaringan atau Yii 5xx, `outbox.ts` menyimpan payload ke `t_integration_outbox` (`status = \'pending\'`, `idempotency_key` unik) dan membalas `202 Accepted` agar alat lab tidak kehilangan hasil.',
      },
      {
        en: '`outbox.worker.ts` periodically locks due rows with `SELECT ... WHERE status = \'pending\' AND retry_berikutnya <= CURRENT_TIMESTAMP FOR UPDATE SKIP LOCKED`, shifts `retry_berikutnya` by +60s as a lease, then delivers and updates status (`terkirim`, exponential next retry, or `gagal`).',
        id: '`outbox.worker.ts` secara periodik mengunci baris jatuh tempo dengan `SELECT ... WHERE status = \'pending\' AND retry_berikutnya <= CURRENT_TIMESTAMP FOR UPDATE SKIP LOCKED`, menggeser `retry_berikutnya` +60 detik sebagai lease, lalu mengirim dan memperbarui status (`terkirim`, jadwal retry eksponensial, atau `gagal`).',
      },
      {
        en: 'Yii `OrderLabService::simpanHasil()` enforces unique `idempotency_key` on `t_order_lab_detail`: exact replay returns `200` (`duplikat: true`), while reusing a key with different result text returns `409 Conflict`.',
        id: '`OrderLabService::simpanHasil()` di Yii menegakkan `idempotency_key` unik pada `t_order_lab_detail`: replay identik membalas `200` (`duplikat: true`), sedangkan pemakaian ulang key dengan isi hasil berbeda membalas `409 Conflict`.',
      },
    ],
    code: [
      'service-node/src/modules/lab/lab.service.ts',
      'service-node/src/modules/lab/outbox.ts',
      'service-node/src/modules/lab/outbox.worker.ts',
      'backend-yii/modules/transaction/lab/OrderLabService.php',
      'service-node/tests/lab-integration.test.ts',
    ],
    questions: [
      {
        q: { en: 'Why does `outbox.worker.ts` commit a 60-second lease on `retry_berikutnya` before calling Yii over HTTP?', id: 'Kenapa `outbox.worker.ts` men-commit lease 60 detik pada `retry_berikutnya` sebelum memanggil Yii lewat HTTP?' },
        a: {
          en: 'Holding a PostgreSQL transaction open across an external HTTP call exhausts DB connections if Yii is slow or hanging. Instead, the worker locks due rows with `FOR UPDATE SKIP LOCKED`, pushes `retry_berikutnya` forward 60 seconds, commits immediately to release the DB connection, and then performs the HTTP delivery. If the Node process crashes mid-flight, the row becomes due again after 60 seconds.',
          id: 'Menahan transaksi PostgreSQL tetap terbuka selama panggilan HTTP eksternal akan menghabiskan koneksi DB bila Yii lambat atau macet. Sebagai gantinya, worker mengunci baris jatuh tempo dengan `FOR UPDATE SKIP LOCKED`, menggeser `retry_berikutnya` maju 60 detik, langsung commit untuk melepas koneksi DB, lalu menjalankan pengiriman HTTP. Bila proses Node crash di tengah jalan, baris otomatis jatuh tempo lagi setelah 60 detik.',
        },
      },
      {
        q: { en: 'What if the external lab sends a 4xx business error (like an invalid `detail_id`) — does it retry in the outbox?', id: 'Bagaimana bila lab eksternal mengirim error bisnis 4xx (seperti `detail_id` tidak valid) — apakah ikut di-retry di outbox?' },
        a: {
          en: 'No. Only transient transport failures, timeouts, and 5xx server errors belong in the retry queue. Deterministic 4xx validation or conflict errors from Yii are returned directly to the caller because retrying an invalid payload would never succeed.',
          id: 'Tidak. Hanya kegagalan transport sementara, timeout, dan error server 5xx yang masuk antrean retry. Error validasi atau konflik 4xx yang deterministik dari Yii langsung dikembalikan ke pemanggil karena mengulang payload tidak valid tidak akan pernah berhasil.',
        },
      },
    ],
  },
  {
    id: 'simrs-d6-performance',
    title: { en: 'D.6 Indexing, sargable SQL & runtime tuning', id: 'D.6 Indexing, SQL sargable & tuning runtime' },
    what: {
      en: 'Scenario D.6 optimizes both analytical dashboards and operational transaction lists. Migration `m261122_010000_create_dashboard_indexes.php` adds 6 composite and partial indexes, all Node dashboard queries use sargable date predicates (`dibayar_at >= $1::date AND dibayar_at < ($2::date + INTERVAL \'1 day\')`), all Yii transaction lists enforce server-side pagination and default today-date filtering via `ListQuery.php` (max 100 rows/page), and PHP runs with OPcache, realpath cache, and Yii schema cache enabled.',
      id: 'Skenario D.6 mengoptimasi dashboard analitik sekaligus daftar transaksi operasional. Migrasi `m261122_010000_create_dashboard_indexes.php` menambah 6 index komposit dan parsial, seluruh query dashboard Node memakai predikat tanggal sargable (`dibayar_at >= $1::date AND dibayar_at < ($2::date + INTERVAL \'1 day\')`), seluruh daftar transaksi Yii menerapkan paginasi server dan filter bawaan hari ini lewat `ListQuery.php` (maks 100 baris/halaman), dan PHP dijalankan dengan OPcache, realpath cache, serta Yii schema cache aktif.',
    },
    why: {
      en: 'Wrapping timestamp columns in `DATE(dibayar_at) = ...` disables B-tree indexes and forces full sequential scans. Similarly, returning unbounded rows on busy hospital queues or running PHP without OPcache/schema cache turns simple list endpoints into multi-second bottlenecks. Benchmarking on 15,000 synthetic rows proved 2.5× to 10.8× faster SQL plans and cut Yii list endpoint p95 latency from 1.4–3.2s down to 0.23–0.37s.',
      id: 'Membungkus kolom timestamp dengan `DATE(dibayar_at) = ...` mematikan B-tree index dan memaksa sequential scan penuh. Demikian juga, mengembalikan baris tanpa batas pada antrean rumah sakit atau menjalankan PHP tanpa OPcache/schema cache mengubah endpoint daftar sederhana menjadi bottleneck multi-detik. Benchmark pada 15.000 baris sintetis membuktikan plan SQL 2,5× hingga 10,8× lebih cepat dan menurunkan p95 endpoint daftar Yii dari 1,4–3,2 detik menjadi 0,23–0,37 detik.',
    },
    tellIt: {
      en: 'Quote the measured before/after numbers from `docs/performance.md` and `evidence/D6-performa.txt`: 6 targeted indexes + sargable ranges gave Q1 2.5×, Q2 6.7×, Q3 10.8×, Q4 visit scan 8.6× speedup; OPcache + realpath + schema cache + `ListQuery` pagination cut Yii list p95 from 1.4–3.2s to 245–316ms.',
      id: 'Kutip angka terukur sebelum/sesudah dari `docs/performance.md` dan `evidence/D6-performa.txt`: 6 index terarah + rentang sargable memberi percepatan Q1 2,5×, Q2 6,7×, Q3 10,8×, scan kunjungan Q4 8,6×; OPcache + realpath + schema cache + paginasi `ListQuery` memangkas p95 daftar Yii dari 1,4–3,2 detik menjadi 245–316 ms.',
    },
    flow: [
      {
        en: 'Add 6 strategic PostgreSQL indexes: `idx_t_kunjungan_tgl_poli`, `idx_t_invoice_status`, `idx_t_pembayaran_dibayar_at`, `idx_t_tindakan_kunjungan_status`, `idx_t_resep_kunjungan_status`, and partial `idx_t_invoice_item_invoice_sumber_aktif` (`WHERE is_void = false`).',
        id: 'Tambahkan 6 index PostgreSQL strategis: `idx_t_kunjungan_tgl_poli`, `idx_t_invoice_status`, `idx_t_pembayaran_dibayar_at`, `idx_t_tindakan_kunjungan_status`, `idx_t_resep_kunjungan_status`, serta parsial `idx_t_invoice_item_invoice_sumber_aktif` (`WHERE is_void = false`).',
      },
      {
        en: 'Write sargable half-open date intervals (`>= $1::date AND < ($2::date + INTERVAL \'1 day\')`) in `service-node/src/modules/dashboard/dashboard.service.ts` so PostgreSQL picks Index / Bitmap Index Scans.',
        id: 'Tulis interval tanggal half-open yang sargable (`>= $1::date AND < ($2::date + INTERVAL \'1 day\')`) di `service-node/src/modules/dashboard/dashboard.service.ts` agar PostgreSQL memilih Index / Bitmap Index Scan.',
      },
      {
        en: 'Enable PHP OPcache + `realpath_cache_size` (`php-performance.ini`), Yii `enableSchemaCache` (`config/web.php`), and `ListQuery.php` server pagination across all 5 operational worklists.',
        id: 'Aktifkan PHP OPcache + `realpath_cache_size` (`php-performance.ini`), Yii `enableSchemaCache` (`config/web.php`), dan paginasi server `ListQuery.php` di seluruh 5 daftar kerja operasional.',
      },
    ],
    code: [
      'backend-yii/migrations/m261122_010000_create_dashboard_indexes.php',
      'service-node/src/modules/dashboard/dashboard.service.ts',
      'backend-yii/common/ListQuery.php',
      'backend-yii/docker/php-performance.ini',
      'docs/performance.md',
      'scripts/bench-api.mjs',
    ],
    questions: [
      {
        q: { en: 'What makes a date filter sargable in PostgreSQL, and why does it matter for the dashboard?', id: 'Apa yang membuat filter tanggal sargable di PostgreSQL, dan kenapa penting untuk dashboard?' },
        a: {
          en: 'A predicate is sargable (Search ARGument ABLE) when the indexed column sits bare on one side of the comparison: `dibayar_at >= $1::date AND dibayar_at < ($2::date + INTERVAL \'1 day\')`. Writing `DATE(dibayar_at) BETWEEN $1 AND $2` wraps the column in a function, preventing PostgreSQL from using `idx_t_pembayaran_dibayar_at` and forcing a full table scan. With sargable predicates plus the 6 indexes, `EXPLAIN (ANALYZE, BUFFERS)` on 15,000 rows showed up to 10.8× speedup.',
          id: 'Predikat disebut sargable (Search ARGument ABLE) ketika kolom berindeks berdiri polos di satu sisi perbandingan: `dibayar_at >= $1::date AND dibayar_at < ($2::date + INTERVAL \'1 day\')`. Menulis `DATE(dibayar_at) BETWEEN $1 AND $2` membungkus kolom dengan fungsi sehingga PostgreSQL tidak bisa memakai `idx_t_pembayaran_dibayar_at` dan terpaksa full table scan. Dengan predikat sargable dan 6 index, `EXPLAIN (ANALYZE, BUFFERS)` pada 15.000 baris menunjukkan percepatan hingga 10,8×.',
        },
      },
      {
        q: { en: 'Why did Yii list endpoints still take 1.4–3.2 seconds before runtime tuning, and what fixed them?', id: 'Kenapa endpoint daftar Yii sempat memakan 1,4–3,2 detik sebelum tuning runtime, dan apa yang memperbaikinya?' },
        a: {
          en: 'On Docker bind mounts, PHP was re-parsing vendor/framework files and Yii was querying PostgreSQL `information_schema` on every request to inspect table schemas, while operational lists lacked default date bounds. Enabling OPcache + realpath cache (`php-performance.ini`), Yii `enableSchemaCache`, and `ListQuery.php` (default today\'s date range, max 100 rows/page) dropped p95 across all 5 worklist endpoints to 245–316 ms (`scripts/bench-api.mjs`).',
          id: 'Di Docker bind mount, PHP mem-parse ulang file vendor/framework dan Yii meng-query `information_schema` PostgreSQL di tiap request untuk membaca skema tabel, sementara daftar operasional belum punya batas tanggal bawaan. Mengaktifkan OPcache + realpath cache (`php-performance.ini`), Yii `enableSchemaCache`, dan `ListQuery.php` (default rentang hari ini, maks 100 baris/halaman) menurunkan p95 di seluruh 5 endpoint worklist menjadi 245–316 ms (`scripts/bench-api.mjs`).',
        },
      },
    ],
  },
  {
    id: 'simrs-frontend-ux',
    title: { en: 'React 19 shell, i18n, exports & rule-based chatbot', id: 'Shell React 19, i18n, ekspor & chatbot berbasis aturan' },
    what: {
      en: '`frontend-react` is a modular React 19 + TypeScript + shadcn/ui + Tailwind SPA organized by domain (`system/`, `master/`, `transaction/`, `dashboard/`, `chatbot/`). It ships a module-switching sidebar (`AppSidebar`), global `Ctrl+K` command search (`AppCommandSearch`), full ID/EN i18n (`i18next` with key-parity tests), light/dark theme toggle, TV queue display with voice announcement (`use-queue-announcement.ts`), client-side PDF & Excel export (`export-pdf.ts`, `export-excel.ts`), and an `Alt+H` help chatbot (`ChatbotWidget.tsx`) that runs entirely without an LLM.',
      id: '`frontend-react` adalah SPA modular React 19 + TypeScript + shadcn/ui + Tailwind yang disusun per domain (`system/`, `master/`, `transaction/`, `dashboard/`, `chatbot/`). Aplikasi dilengkapi sidebar pemilih modul (`AppSidebar`), pencarian menu global `Ctrl+K` (`AppCommandSearch`), i18n ID/EN penuh (`i18next` dengan test kesetaraan kunci), toggle tema terang/gelap, layar display antrean TV dengan pengumuman suara (`use-queue-announcement.ts`), ekspor PDF & Excel di klien (`export-pdf.ts`, `export-excel.ts`), serta chatbot bantuan `Alt+H` (`ChatbotWidget.tsx`) yang berjalan tanpa LLM.',
    },
    why: {
      en: 'Hospital front-desk and clinical staff work fast with keyboard shortcuts and mixed roles. Keeping the help chatbot deterministic (regex intent detection for `RM...`/`RJ...`/`INV...`/`RSP...`/`LAB...`, live permission-filtered API lookups via `Promise.allSettled`, and local synonym + Levenshtein fuzzy FAQ search) avoids API keys, latency, and hallucinations while storing serializable JSON messages in per-user `sessionStorage` so switching ID ↔ EN live-translates existing chat history.',
      id: 'Petugas loket dan klinis rumah sakit bekerja cepat dengan pintasan keyboard dan role beragam. Menjaga chatbot bantuan tetap deterministik (deteksi intent regex untuk `RM...`/`RJ...`/`INV...`/`RSP...`/`LAB...`, lookup API live terfilter izin via `Promise.allSettled`, dan pencarian FAQ lokal bersinonim + fuzzy Levenshtein) menghindari API key, latensi, dan halusinasi, sambil menyimpan pesan JSON serializable di `sessionStorage` per user sehingga ganti bahasa ID ↔ EN langsung menerjemahkan riwayat chat yang sudah tampil.',
    },
    tellIt: {
      en: 'Highlight three practical UX engineering details: unified API error/envelope handling (`api-client.ts` + `use-crud.ts`), zero-LLM permission-aware chatbot with `AbortController` race guards and language-reactive `sessionStorage` history, and masked NIK on printable invoices (`InvoicePrintPage.tsx` + `export-pdf.ts`).',
      id: 'Soroti tiga detail rekayasa UX praktis: penanganan amplop/error API seragam (`api-client.ts` + `use-crud.ts`), chatbot sadar-izin tanpa LLM dengan race guard `AbortController` dan riwayat `sessionStorage` yang reaktif terhadap bahasa, serta masking NIK pada invoice cetak (`InvoicePrintPage.tsx` + `export-pdf.ts`).',
    },
    flow: [
      {
        en: '`AppLayout` renders `AppSidebar` (filtered by active module from JWT permissions), `AppHeader` (breadcrumbs, `Ctrl+K` command palette, ID/EN locale toggle, dark/light theme), `<Outlet />`, and floating `ChatbotWidget` (`Alt+H`).',
        id: '`AppLayout` merender `AppSidebar` (difilter per modul aktif dari izin JWT), `AppHeader` (breadcrumb, palet perintah `Ctrl+K`, toggle bahasa ID/EN, tema gelap/terang), `<Outlet />`, dan `ChatbotWidget` mengambang (`Alt+H`).',
      },
      {
        en: 'Data tables reuse `use-crud.ts` + `AppDataTable` + `AppFilterBar` + `AppPaginator`, keeping query parameters, server pagination, and toast errors consistent across all 8 master screens and 5 transaction queues.',
        id: 'Tabel data memakai ulang `use-crud.ts` + `AppDataTable` + `AppFilterBar` + `AppPaginator`, menjaga parameter query, paginasi server, dan error toast konsisten di semua 8 layar master dan 5 antrean transaksi.',
      },
      {
        en: 'In `ChatbotWidget`, typing a pattern (`RM000001`, `INV...`, `stok obat paracetamol`) routes to live API lookups (`lookups.ts` using `Promise.allSettled`), while free questions score local FAQ articles via synonym expansion and Levenshtein distance 1–2 (`knowledge.ts`).',
        id: 'Di `ChatbotWidget`, mengetik pola (`RM000001`, `INV...`, `stok obat paracetamol`) diarahkan ke lookup API live (`lookups.ts` dengan `Promise.allSettled`), sedangkan pertanyaan bebas memberi skor artikel FAQ lokal lewat perluasan sinonim dan jarak Levenshtein 1–2 (`knowledge.ts`).',
      },
    ],
    code: [
      'frontend-react/src/components/layout/AppLayout.tsx',
      'frontend-react/src/components/AppCommandSearch.tsx',
      'frontend-react/src/hooks/use-crud.ts',
      'frontend-react/src/modules/chatbot/ChatbotWidget.tsx',
      'frontend-react/src/modules/chatbot/knowledge.ts',
      'frontend-react/src/lib/export-pdf.ts',
      'frontend-react/src/lib/export-excel.ts',
    ],
    questions: [
      {
        q: { en: 'How does the built-in help chatbot work without an LLM, and why store structured JSON instead of rendered strings?', id: 'Bagaimana chatbot bantuan bekerja tanpa LLM, dan kenapa menyimpan JSON terstruktur bukan string hasil render?' },
        a: {
          en: 'It combines a regex intent router (detecting `RM`, `RJ`, `INV`, `RSP`, `LAB` codes and commands like `stok obat ...`), permission-filtered live lookups using `Promise.allSettled` (so partial data still displays if one API fails), and a local knowledge scorer with hospital synonyms and Levenshtein distance 1–2 typo tolerance. Storing serializable message payloads in per-user `sessionStorage` (`simrs.chatbot.v1.<userId>`, capped at 30 messages) lets switching ID ↔ EN re-render the entire chat history in the new language immediately and clears cleanly on logout.',
          id: 'Ia memadukan router intent regex (mendeteksi kode `RM`, `RJ`, `INV`, `RSP`, `LAB` dan perintah seperti `stok obat ...`), lookup live terfilter izin memakai `Promise.allSettled` (agar data parsial tetap tampil bila satu API gagal), serta pemberi skor basis pengetahuan lokal dengan sinonim rumah sakit dan toleransi typo jarak Levenshtein 1–2. Menyimpan payload pesan serializable di `sessionStorage` per user (`simrs.chatbot.v1.<userId>`, maks 30 pesan) membuat penggantian bahasa ID ↔ EN langsung merender ulang seluruh riwayat chat dalam bahasa baru dan bersih otomatis saat logout.',
        },
      },
      {
        q: { en: 'Can the chatbot leak data from a module the logged-in user is not allowed to access?', id: 'Apakah chatbot bisa membocorkan data dari modul yang tidak boleh diakses pengguna yang sedang login?' },
        a: {
          en: 'No. In the UI, `ChatbotWidget` hides categories and action links when `authStore.can(menu, \'read\')` is false. More importantly, every lookup calls the normal authenticated Yii2 and Node.js endpoints with the user\'s Bearer JWT, so `AccessFilter` and Node `auth.ts` still enforce `403 Forbidden` on the server.',
          id: 'Tidak. Di UI, `ChatbotWidget` menyembunyikan kategori dan tautan aksi saat `authStore.can(menu, \'read\')` bernilai false. Yang lebih penting, setiap lookup memanggil endpoint terautentikasi Yii2 dan Node.js biasa dengan Bearer JWT pengguna, sehingga `AccessFilter` dan `auth.ts` Node tetap menegakkan `403 Forbidden` di server.',
        },
      },
    ],
  },
  {
    id: 'simrs-testing-evidence',
    title: { en: 'Verification strategy: 250 tests, concurrency & proof book', id: 'Strategi pengujian: 250 test, konkurensi & proof book' },
    what: {
      en: 'Quality is verified across four layers: unit/integration tests on every service (134 PHPUnit tests / 446 assertions in `backend-yii`, 38 Vitest tests in `service-node`, 78 Vitest tests in `frontend-react` including i18n key-parity), a 35-request / 45-assertion Postman/Newman end-to-end collection, three live HTTP concurrency scripts (`tests/concurrency/pendaftaran.mjs`, `stok-obat.mjs`, `pembayaran.mjs`), and reproducible proof-book scripts capturing DB counts, `EXPLAIN ANALYZE`, outbox outage recovery, and 1440px UI screenshots.',
      id: 'Kualitas diverifikasi di empat lapis: test unit/integrasi di tiap layanan (134 test PHPUnit / 446 asersi di `backend-yii`, 38 test Vitest di `service-node`, 78 test Vitest di `frontend-react` termasuk kesetaraan kunci i18n), koleksi E2E Postman/Newman 35 request / 45 asersi, tiga skrip uji konkurensi HTTP langsung (`tests/concurrency/pendaftaran.mjs`, `stok-obat.mjs`, `pembayaran.mjs`), serta skrip proof-book yang merekam jumlah baris DB, `EXPLAIN ANALYZE`, pemulihan gangguan outbox, dan screenshot UI 1440px.',
    },
    why: {
      en: 'Unit tests against mocks cannot prove PostgreSQL row locking, partial unique indexes, or Docker network outages. Running real concurrency scripts against the containerized stack and stopping `simrs-yii` mid-delivery turns claims like "race-safe" and "outbox-resilient" into repeatable, inspectable evidence.',
      id: 'Unit test dengan mock tidak bisa membuktikan row lock PostgreSQL, partial unique index, atau gangguan jaringan Docker. Menjalankan skrip konkurensi nyata ke stack container dan mematikan `simrs-yii` di tengah pengiriman mengubah klaim seperti "aman dari race condition" dan "tahan gagal outbox" menjadi bukti nyata yang dapat diulang dan diaudit.',
    },
    tellIt: {
      en: 'Group your proof into four quick numbers: 250 automated tests across PHP/Node/React, 45 Newman E2E assertions, 3 live concurrency scripts (D.1–D.4) plus a real `docker stop simrs-yii` outbox test (D.5), and `EXPLAIN (ANALYZE, BUFFERS)` + `bench-api.mjs` (D.6). Mention honestly that the dataset is seeded synthetic data running locally in Docker.',
      id: 'Kelompokkan bukti dalam empat angka cepat: 250 test otomatis lintas PHP/Node/React, 45 asersi E2E Newman, 3 skrip konkurensi langsung (D.1–D.4) ditambah tes nyata `docker stop simrs-yii` untuk outbox (D.5), serta `EXPLAIN (ANALYZE, BUFFERS)` + `bench-api.mjs` (D.6). Sebut jujur bahwa datanya adalah data seed sintetis yang berjalan lokal di Docker.',
    },
    flow: [
      {
        en: 'CI (`.github/workflows/ci.yml`) runs PHPUnit, Node Vitest, React Vitest, ESLint, Prettier, PHP-CS-Fixer, and TypeScript builds on every push.',
        id: 'CI (`.github/workflows/ci.yml`) menjalankan PHPUnit, Node Vitest, React Vitest, ESLint, Prettier, PHP-CS-Fixer, dan build TypeScript di setiap push.',
      },
      {
        en: 'Dedicated test database (`database/init/01-create-test-database.sql`) keeps PHPUnit and Node integration suites isolated from dev seed data.',
        id: 'Database test terpisah (`database/init/01-create-test-database.sql`) menjaga suite integrasi PHPUnit dan Node terisolasi dari data seed pengembangan.',
      },
      {
        en: 'End-to-end and stress verification runs Newman (`postman/simrs.collection.json`), `tests/concurrency/*.mjs`, and `scripts/bench-api.mjs` against the live Docker Compose stack.',
        id: 'Verifikasi E2E dan stress menjalankan Newman (`postman/simrs.collection.json`), `tests/concurrency/*.mjs`, dan `scripts/bench-api.mjs` langsung ke stack Docker Compose.',
      },
    ],
    code: [
      '.github/workflows/ci.yml',
      'postman/simrs.collection.json',
      'tests/concurrency/pendaftaran.mjs',
      'tests/concurrency/stok-obat.mjs',
      'tests/concurrency/pembayaran.mjs',
      'docs/test-cases.md',
    ],
    questions: [
      {
        q: { en: 'What would you add before deploying SIMRS Rawat Jalan to a real hospital production environment?', id: 'Apa yang akan ditambahkan sebelum men-deploy SIMRS Rawat Jalan ke lingkungan produksi rumah sakit sungguhan?' },
        a: {
          en: 'First, security hardening: HTTPS/TLS termination, short-lived access tokens with refresh token rotation/revocation, secret management outside `.env`, and rate limiting on login and external webhook endpoints. Second, clinical compliance: SATUSEHAT/BPJS bridging adapters, encrypted backups with point-in-time recovery, and immutable off-box audit log shipping. Third, observability: centralized structured logs, Prometheus/OpenTelemetry metrics on outbox queue depth and DB lock wait times, and horizontal scaling behind a load balancer.',
          id: 'Pertama, pengerasan keamanan: terminasi HTTPS/TLS, access token berumur pendek dengan rotasi/pencabutan refresh token, manajemen secret di luar `.env`, dan rate limiting di endpoint login serta webhook eksternal. Kedua, kepatuhan klinis: adapter bridging SATUSEHAT/BPJS, backup terenkripsi dengan point-in-time recovery, dan pengiriman audit log immutable ke luar server. Ketiga, observabilitas: log terstruktur terpusat, metrik Prometheus/OpenTelemetry untuk kedalaman antrean outbox dan waktu tunggu lock DB, serta penskalaan horizontal di balik load balancer.',
        },
      },
      {
        q: { en: 'How do you keep PHPUnit and Node integration tests from corrupting local development data?', id: 'Bagaimana menjaga PHPUnit dan integration test Node agar tidak merusak data pengembangan lokal?' },
        a: {
          en: '`database/init/01-create-test-database.sql` provisions a dedicated test database inside PostgreSQL when the container initializes. Both PHPUnit (`backend-yii/tests/TestCase.php`) and Node Vitest (`service-node/tests/test-db.ts`) target that test database, and `scripts/reset-db.sh` resets and re-seeds the dev database cleanly with `SystemSeeder`, `Icd10Seeder`, and `DummySeeder`.',
          id: '`database/init/01-create-test-database.sql` membuat database test tersendiri di PostgreSQL saat container pertama kali diinisialisasi. Baik PHPUnit (`backend-yii/tests/TestCase.php`) maupun Node Vitest (`service-node/tests/test-db.ts`) mengarah ke database test tersebut, dan `scripts/reset-db.sh` mereset serta mengisi ulang database dev dengan `SystemSeeder`, `Icd10Seeder`, dan `DummySeeder`.',
        },
      },
    ],
  },
];
