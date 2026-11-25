import type { LabQuiz } from '../../core/lab.ts';

// Multiple-choice quizzes for each SIMRS Rawat Jalan Experimental Learn screen.
export const simrsQuiz: Record<string, LabQuiz[]> = {
  login: [
    {
      q: {
        en: 'Which service issues the JWT HS256 token after submitting the login form?',
        id: 'Layanan mana yang menerbitkan token JWT HS256 setelah form login dikirim?',
      },
      options: [
        { en: 'backend-yii (`POST /system/auth/login`)', id: 'backend-yii (`POST /system/auth/login`)' },
        { en: 'service-node (`POST /api/auth/login`)', id: 'service-node (`POST /api/auth/login`)' },
        { en: 'frontend-react generates it locally in Zustand', id: 'frontend-react membuatnya lokal di Zustand' },
      ],
      answer: 0,
      explain: {
        en: '`backend-yii` is the sole authentication issuer (`JwtService.php`). `service-node` verifies the same HS256 signature and issuer (`simrs-backend`) without issuing tokens.',
        id: '`backend-yii` adalah penerbit autentikasi tunggal (`JwtService.php`). `service-node` memverifikasi tanda tangan HS256 dan issuer yang sama (`simrs-backend`) tanpa menerbitkan token.',
      },
    },
    {
      q: {
        en: 'Besides the JWT token, what else does `/system/auth/login` return so the UI can build role-based navigation?',
        id: 'Selain token JWT, apa lagi yang dikembalikan `/system/auth/login` agar UI bisa membangun navigasi berbasis role?',
      },
      options: [
        { en: 'Raw SQL connection credentials', id: 'Kredensial koneksi SQL mentah' },
        { en: 'User profile, permitted modules/menus, and CRUD permissions map', id: 'Profil user, modul/menu yang diizinkan, dan peta izin CRUD' },
        { en: 'A static hardcoded role switch table', id: 'Tabel switch role statis yang di-hardcode' },
      ],
      answer: 1,
      explain: {
        en: 'The login response includes `{ token, user, modules, permissions }` loaded from `m_user`, `m_module`, `m_menu`, and `m_role_access`.',
        id: 'Respons login berisi `{ token, user, modules, permissions }` yang dimuat dari `m_user`, `m_module`, `m_menu`, dan `m_role_access`.',
      },
    },
    {
      q: {
        en: 'What happens if an already authenticated user visits `/login` directly?',
        id: 'Apa yang terjadi bila pengguna yang sudah login membuka `/login` secara langsung?',
      },
      options: [
        { en: 'It logs them out immediately', id: 'Langsung logout otomatis' },
        { en: 'It redirects them back to their target route (or `/`) via `<Navigate replace />`', id: 'Mengarahkan kembali ke rute tujuan (atau `/`) lewat `<Navigate replace />`' },
        { en: 'It throws a 403 Forbidden page', id: 'Menampilkan halaman 403 Forbidden' },
      ],
      answer: 1,
      explain: {
        en: '`LoginPage.tsx` checks `status === \'authenticated\'` and redirects away from `/login` and `/403` using `<Navigate to={from} replace />`.',
        id: '`LoginPage.tsx` mengecek `status === \'authenticated\'` dan mengalihkan keluar dari `/login` maupun `/403` memakai `<Navigate to={from} replace />`.',
      },
    },
  ],
  pendaftaran: [
    {
      q: {
        en: 'When two clerks register the same patient to the same polyclinic on the same date simultaneously (D.1), what stops the duplicate?',
        id: 'Saat dua petugas mendaftarkan pasien yang sama ke poli dan tanggal yang sama secara bersamaan (D.1), apa yang mencegah duplikat?',
      },
      options: [
        { en: 'Client-side button disable alone', id: 'Hanya menonaktifkan tombol di klien' },
        { en: 'Schedule `FOR UPDATE` lock + partial unique index `WHERE status <> \'batal\'` returning `409 Conflict`', id: 'Row lock `FOR UPDATE` pada jadwal + partial unique index `WHERE status <> \'batal\'` yang membalas `409 Conflict`' },
        { en: 'Deleting the older visit automatically', id: 'Menghapus kunjungan lama secara otomatis' },
      ],
      answer: 1,
      explain: {
        en: 'PostgreSQL enforces `uq_t_kunjungan_pasien_poli_tgl_aktif` on `(pasien_id, poli_id, tgl_kunjungan) WHERE status <> \'batal\'`. In `tests/concurrency/pendaftaran.mjs`, 10 parallel requests produced 1×201 and 9×409.',
        id: 'PostgreSQL menegakkan `uq_t_kunjungan_pasien_poli_tgl_aktif` pada `(pasien_id, poli_id, tgl_kunjungan) WHERE status <> \'batal\'`. Pada `tests/concurrency/pendaftaran.mjs`, 10 request paralel menghasilkan 1×201 dan 9×409.',
      },
    },
    {
      q: {
        en: 'How does the floating `Bantuan` chatbot in the bottom-right corner answer questions?',
        id: 'Bagaimana chatbot `Bantuan` di pojok kanan bawah menjawab pertanyaan?',
      },
      options: [
        { en: 'It calls an external OpenAI/DeepSeek API key', id: 'Memanggil API key OpenAI/DeepSeek eksternal' },
        { en: 'Deterministic regex intent router + permission-checked live lookups + local fuzzy FAQ (no LLM)', id: 'Router intent regex deterministik + lookup live berizin + FAQ fuzzy lokal (tanpa LLM)' },
        { en: 'It queries PostgreSQL directly from the browser', id: 'Menjalankan query PostgreSQL langsung dari browser' },
      ],
      answer: 1,
      explain: {
        en: 'The chatbot uses zero LLMs or API keys: it matches codes (`RM`, `RJ`, `INV`, `RSP`, `LAB`) to live API endpoints and falls back to synonym + Levenshtein search in `knowledge.ts`.',
        id: 'Chatbot bekerja tanpa LLM atau API key: mencocokkan kode (`RM`, `RJ`, `INV`, `RSP`, `LAB`) ke endpoint API live lalu fallback ke pencarian sinonim + Levenshtein di `knowledge.ts`.',
      },
    },
    {
      q: {
        en: 'Why does `SequenceService` run `INSERT ... ON CONFLICT DO NOTHING` then `SELECT ... FOR UPDATE` on `t_sequence_counter`?',
        id: 'Mengapa `SequenceService` menjalankan `INSERT ... ON CONFLICT DO NOTHING` lalu `SELECT ... FOR UPDATE` pada `t_sequence_counter`?',
      },
      options: [
        { en: 'To guarantee unique consecutive queue numbers even under parallel registrations', id: 'Menjamin nomor antrean berurutan unik bahkan saat pendaftaran paralel' },
        { en: 'To generate random UUID strings', id: 'Membuat string UUID acak' },
        { en: 'To cache patient names in memory', id: 'Menyimpan cache nama pasien di memori' },
      ],
      answer: 0,
      explain: {
        en: 'Locking the counter row inside the transaction prevents two parallel visits from reading the same `nilai_terakhir` and issuing duplicate queue numbers.',
        id: 'Mengunci baris counter di dalam transaksi mencegah dua kunjungan paralel membaca `nilai_terakhir` yang sama dan menerbitkan nomor antrean kembar.',
      },
    },
  ],
  antrean: [
    {
      q: {
        en: 'Why does the date range filter default to today (`11/24/2026 s/d 11/24/2026`) on Antrean Poli?',
        id: 'Kenapa filter rentang tanggal bawaan mengarah ke hari ini (`11/24/2026 s/d 11/24/2026`) di Antrean Poli?',
      },
      options: [
        { en: 'The database deletes yesterday\'s visits every midnight', id: 'Database menghapus kunjungan kemarin tiap tengah malam' },
        { en: '`ListQuery.php` enforces default today-date scoping and max 100 rows/page to keep list latency fast', id: '`ListQuery.php` menerapkan batas bawaan hari ini dan maks 100 baris/halaman agar latensi daftar tetap cepat' },
        { en: 'React DatePicker cannot select past dates', id: 'DatePicker React tidak bisa memilih tanggal lampau' },
      ],
      answer: 1,
      explain: {
        en: 'Server-side pagination and default today filtering (`ListQuery.php`) keep worklist p95 latency around 245–316 ms instead of scanning months of historical visits.',
        id: 'Paginasi server dan filter bawaan hari ini (`ListQuery.php`) menjaga latensi p95 daftar kerja di kisaran 245–316 ms tanpa memindai kunjungan berbulan-bulan.',
      },
    },
    {
      q: {
        en: 'Why can a registration clerk no longer pick `selesai` manually from the queue actions?',
        id: 'Kenapa petugas pendaftaran tidak lagi bisa memilih status `selesai` secara manual dari aksi antrean?',
      },
      options: [
        { en: '`selesai` is set automatically and permanently only when the visit\'s invoice becomes `lunas` (D.4)', id: '`selesai` ditetapkan otomatis dan permanen hanya saat invoice kunjungan menjadi `lunas` (D.4)' },
        { en: 'Only `service-node` can update visit statuses', id: 'Hanya `service-node` yang bisa mengubah status kunjungan' },
        { en: 'The `selesai` status was removed from the database', id: 'Status `selesai` sudah dihapus dari database' },
      ],
      answer: 0,
      explain: {
        en: '`ValidasiKunjunganService::selesaikanKarenaLunas()` transitions a visit to `selesai` once its invoice is paid in full, preventing premature closure before billing.',
        id: '`ValidasiKunjunganService::selesaikanKarenaLunas()` mengubah kunjungan menjadi `selesai` begitu invoice lunas, mencegah penutupan dini sebelum billing.',
      },
    },
    {
      q: {
        en: 'What does clicking `Layar Display` open?',
        id: 'Apa yang dibuka saat tombol `Layar Display` diklik?',
      },
      options: [
        { en: 'A waiting-room TV queue board with automatic voice callout (`use-queue-announcement.ts`)', id: 'Papan antrean TV ruang tunggu dengan pengumuman suara otomatis (`use-queue-announcement.ts`)' },
        { en: 'A PDF print preview of all patients', id: 'Pratinjau cetak PDF seluruh pasien' },
        { en: 'The database migration logs', id: 'Log migrasi database' },
      ],
      answer: 0,
      explain: {
        en: '`DisplayAntreanPage.tsx` renders a full-screen waiting room board and pairs with `use-queue-announcement.ts` to announce called queue numbers like `U-001`.',
        id: '`DisplayAntreanPage.tsx` merender papan ruang tunggu layar penuh dan bekerja bersama `use-queue-announcement.ts` untuk memanggil nomor antrean seperti `U-001`.',
      },
    },
  ],
  pemeriksaan: [
    {
      q: {
        en: 'What happens if the doctor tries to add a procedure or prescription after the cashier has locked the visit (`Valid`)?',
        id: 'Apa yang terjadi bila dokter mencoba menambah tindakan atau resep setelah kasir mengunci kunjungan (`Valid`)?',
      },
      options: [
        { en: 'The backend silently creates a second invoice', id: 'Backend diam-diam membuat invoice kedua' },
        { en: '`backend-yii` rejects the write with `409 Conflict` until the cashier clicks `Unvalid`', id: '`backend-yii` menolak perubahan dengan `409 Conflict` sampai kasir menekan `Unvalid`' },
        { en: 'The change is queued in `t_integration_outbox`', id: 'Perubahan dimasukkan ke antrean `t_integration_outbox`' },
      ],
      answer: 1,
      explain: {
        en: 'Creating an invoice sets `t_kunjungan.is_valid = true`. Clinical write services reject edits with `409` while valid so bills never drift silently.',
        id: 'Membuat invoice menandai `t_kunjungan.is_valid = true`. Service penulisan klinis menolak edit dengan `409` selama valid agar tagihan tidak berubah diam-diam.',
      },
    },
    {
      q: {
        en: 'When the doctor submits an order in the `Laboratorium` tab, where do external analyzer results return later?',
        id: 'Saat dokter membuat order di tab `Laboratorium`, ke mana hasil dari alat lab eksternal dikirim kembali?',
      },
      options: [
        { en: 'Directly into React localStorage', id: 'Langsung ke localStorage React' },
        { en: '`POST /api/lab/results` on `service-node`, forwarded idempotently to Yii (or buffered in `t_integration_outbox`)', id: '`POST /api/lab/results` di `service-node`, diteruskan idempoten ke Yii (atau ditampung di `t_integration_outbox`)' },
        { en: 'Emailed to the patient as plain text', id: 'Dikirim email ke pasien sebagai teks biasa' },
      ],
      answer: 1,
      explain: {
        en: 'External lab devices authenticate with `X-Api-Key` on `service-node`. If Yii is temporarily unavailable, `t_integration_outbox` retries with exponential backoff (D.5).',
        id: 'Alat lab eksternal diautentikasi dengan `X-Api-Key` di `service-node`. Bila Yii sedang tidak terjangkau, `t_integration_outbox` melakukan retry eksponensial (D.5).',
      },
    },
    {
      q: {
        en: 'Why do `Tindakan`, `Resep`, and `Laboratorium` tabs snapshot prices onto transaction rows instead of reading master prices at billing time?',
        id: 'Kenapa tab `Tindakan`, `Resep`, dan `Laboratorium` menyimpan snapshot harga ke baris transaksi alih-alih membaca harga master saat billing?',
      },
      options: [
        { en: 'So future master tariff edits never retroactively alter past clinical charges or revenue reports', id: 'Agar perubahan tarif master di masa depan tidak mengubah tagihan klinis atau laporan pendapatan lampau' },
        { en: 'Because PostgreSQL does not support foreign keys to master tables', id: 'Karena PostgreSQL tidak mendukung foreign key ke tabel master' },
        { en: 'To reduce the number of React components', id: 'Untuk mengurangi jumlah komponen React' },
      ],
      answer: 0,
      explain: {
        en: 'Price snapshotting protects accounting integrity across time while letting `service-node` dashboard queries sum immutable transaction subtotals.',
        id: 'Snapshot harga menjaga integritas akuntansi lintas waktu sekaligus memungkinkan query dashboard `service-node` menjumlahkan subtotal transaksi yang tetap.',
      },
    },
  ],
  obat: [
    {
      q: {
        en: 'How does `FarmasiService::serahkan()` prevent negative stock when two prescriptions compete for the last 5 tablets (D.2)?',
        id: 'Bagaimana `FarmasiService::serahkan()` mencegah stok minus saat dua resep berebut 5 tablet terakhir (D.2)?',
      },
      options: [
        { en: 'Ordered `m_obat` updates (`ORDER BY obat_id ASC`) with conditional `WHERE stok >= :qty RETURNING stok` + `CHECK (stok >= 0)`', id: 'Update `m_obat` terurut (`ORDER BY obat_id ASC`) dengan syarat `WHERE stok >= :qty RETURNING stok` + `CHECK (stok >= 0)`' },
        { en: 'Checking `stok > 0` in React before clicking submit', id: 'Mengecek `stok > 0` di React sebelum klik submit' },
        { en: 'Allowing negative stock and reconciling at night', id: 'Mengizinkan stok minus lalu rekonsiliasi malam hari' },
      ],
      answer: 0,
      explain: {
        en: 'Conditional atomic updates guarantee only one competing transaction succeeds (`200`), the loser gets `409 Conflict` and rolls back, and `CHECK (stok >= 0)` seals the DB invariant.',
        id: 'Update atomik bersyarat menjamin hanya satu transaksi yang menang (`200`), yang kalah menerima `409 Conflict` dan rollback, serta `CHECK (stok >= 0)` mengunci invarian DB.',
      },
    },
    {
      q: {
        en: 'Why does `FarmasiService` sort prescription details by `obat_id ASC` before deducting stock?',
        id: 'Kenapa `FarmasiService` mengurutkan detail resep berdasarkan `obat_id ASC` sebelum mengurangi stok?',
      },
      options: [
        { en: 'To display drugs alphabetically in the UI', id: 'Untuk menampilkan obat secara alfabetis di UI' },
        { en: 'To acquire row locks in one consistent order and eliminate circular deadlocks', id: 'Untuk mengambil row lock dalam satu urutan konsisten dan mencegah deadlock melingkar' },
        { en: 'Because PostgreSQL requires `ORDER BY` on every `UPDATE`', id: 'Karena PostgreSQL mewajibkan `ORDER BY` di setiap `UPDATE`' },
      ],
      answer: 1,
      explain: {
        en: 'When two multi-drug prescriptions overlap on `[Drug A, Drug B]` in opposite order, locking in ascending `obat_id` order makes circular lock wait impossible.',
        id: 'Saat dua resep multi-obat saling bersinggungan pada `[Obat A, Obat B]` dengan urutan berlawanan, penguncian berurutan berdasarkan `obat_id` menaik meniadakan tunggu melingkar.',
      },
    },
    {
      q: {
        en: 'What does the `Riwayat Mutasi` action on each drug row display?',
        id: 'Apa yang ditampilkan oleh aksi `Riwayat Mutasi` pada tiap baris obat?',
      },
      options: [
        { en: 'The `t_stok_mutasi` ledger of every stock in/out/adjustment with `stok_sebelum`, `stok_sesudah`, and reference', id: 'Buku besar `t_stok_mutasi` dari setiap mutasi masuk/keluar/penyesuaian beserta `stok_sebelum`, `stok_sesudah`, dan referensi' },
        { en: 'Only deleted drugs from soft-delete', id: 'Hanya obat yang dihapus lewat soft-delete' },
        { en: 'Doctor schedules that prescribed the drug', id: 'Jadwal dokter yang meresepkan obat tersebut' },
      ],
      answer: 0,
      explain: {
        en: 'Every manual stock adjustment (`StokAdjustDialog`) and pharmacy dispensing (`FarmasiService::serahkan`) writes an immutable row to `t_stok_mutasi`.',
        id: 'Setiap penyesuaian stok manual (`StokAdjustDialog`) maupun penyerahan farmasi (`FarmasiService::serahkan`) menulis baris audit ke `t_stok_mutasi`.',
      },
    },
  ],
  billing: [
    {
      q: {
        en: 'On this screen, `INV202611240003` shows `Lunas · Valid (terkunci)` with no `Bayar` or `Unvalid` button. Why?',
        id: 'Di layar ini, `INV202611240003` menampilkan `Lunas · Valid (terkunci)` tanpa tombol `Bayar` atau `Unvalid`. Mengapa?',
      },
      options: [
        { en: 'A paid (`lunas`) invoice permanently closes the visit (`selesai`) so it cannot be unlocked or overpaid', id: 'Invoice `lunas` menutup kunjungan secara permanen (`selesai`) sehingga tidak bisa di-Unvalid atau dibayar lagi' },
        { en: 'The cashier role lacks update permission', id: 'Role kasir tidak punya izin ubah' },
        { en: 'Paid invoices are archived to `service-node`', id: 'Invoice lunas diarsipkan ke `service-node`' },
      ],
      answer: 0,
      explain: {
        en: 'Under D.4, settling an invoice calls `ValidasiKunjunganService::selesaikanKarenaLunas()`, locking both clinical edits and Unvalid with `409 Conflict`.',
        id: 'Pada D.4, pelunasan invoice memanggil `ValidasiKunjunganService::selesaikanKarenaLunas()`, mengunci perubahan klinis maupun Unvalid dengan `409 Conflict`.',
      },
    },
    {
      q: {
        en: 'When the cashier clicks `Bayar` on `INV202611240002` and retries after a network timeout, what prevents a double charge (D.3)?',
        id: 'Saat kasir klik `Bayar` pada `INV202611240002` lalu mengulang setelah timeout jaringan, apa yang mencegah penagihan ganda (D.3)?',
      },
      options: [
        { en: 'One UUID `Idempotency-Key` generated when `BayarDialog` opens, locked and re-checked inside `PembayaranService` after `FOR UPDATE`', id: 'Satu UUID `Idempotency-Key` yang dibuat saat `BayarDialog` dibuka, dikunci dan dicek ulang di `PembayaranService` setelah `FOR UPDATE`' },
        { en: 'A 10-second sleep timer in the browser', id: 'Timer jeda 10 detik di browser' },
        { en: 'Disabling partial payments', id: 'Menonaktifkan pembayaran bertahap' },
      ],
      answer: 0,
      explain: {
        en: '`tests/concurrency/pembayaran.mjs` sent 5 parallel requests with the same key and got `[200, 200, 200, 200, 201]` with exactly 1 payment row and `total_bayar = 40000`.',
        id: '`tests/concurrency/pembayaran.mjs` mengirim 5 request paralel dengan key sama dan mendapat `[200, 200, 200, 200, 201]` dengan tepat 1 baris pembayaran dan `total_bayar = 40000`.',
      },
    },
    {
      q: {
        en: 'What happens to old `t_invoice_item` rows when a doctor cancels a procedure after the cashier clicks `Unvalid`?',
        id: 'Apa yang terjadi pada baris `t_invoice_item` lama saat dokter membatalkan tindakan setelah kasir klik `Unvalid`?',
      },
      options: [
        { en: 'They are hard-deleted with `DELETE FROM t_invoice_item`', id: 'Dihapus permanen dengan `DELETE FROM t_invoice_item`' },
        { en: '`BillingSyncService` marks them `is_void = true` with mandatory `alasan_void` and logs JSONB diffs in `t_audit_log`', id: '`BillingSyncService` menandainya `is_void = true` beserta `alasan_void` wajib dan mencatat diff JSONB di `t_audit_log`' },
        { en: 'The invoice total stays unchanged until manually edited', id: 'Total invoice tetap sama sampai diubah manual' },
      ],
      answer: 1,
      explain: {
        en: 'Soft-voiding preserves financial auditability, enforced by `chk_t_invoice_item_void` and partial unique index `uq_t_invoice_item_aktif WHERE is_void = false`.',
        id: 'Void lembut menjaga jejak audit keuangan, ditegakkan oleh `chk_t_invoice_item_void` dan partial unique index `uq_t_invoice_item_aktif WHERE is_void = false`.',
      },
    },
  ],
  invoice: [
    {
      q: {
        en: 'Look at the patient NIK on `INV202610260001`: `327301******0001`. Why is the middle masked?',
        id: 'Lihat NIK pasien pada `INV202610260001`: `327301******0001`. Mengapa bagian tengahnya disamarkan?',
      },
      options: [
        { en: 'The database only stores 10 digits of NIK', id: 'Database hanya menyimpan 10 digit NIK' },
        { en: 'To protect sensitive PII on printed paper and exported PDF invoices while keeping enough digits to verify identity', id: 'Untuk melindungi data pribadi sensitif di kertas cetak dan PDF ekspor sambil menyisakan digit cukup untuk verifikasi identitas' },
        { en: 'Because the font cannot render digits 7 to 12', id: 'Karena font tidak bisa merender digit 7 sampai 12' },
      ],
      answer: 1,
      explain: {
        en: 'Printable billing sheets frequently leave the hospital with patients or families, so masking middle NIK digits minimizes PII exposure without breaking verification.',
        id: 'Lembar tagihan cetak sering dibawa keluar rumah sakit oleh pasien atau keluarga, jadi menyamarkan digit tengah NIK meminimalkan paparan PII tanpa mengganggu verifikasi.',
      },
    },
    {
      q: {
        en: 'Which four clinical sources feed into an outpatient invoice (`t_invoice_item`)?',
        id: 'Empat sumber klinis apa saja yang masuk ke invoice rawat jalan (`t_invoice_item`)?',
      },
      options: [
        { en: 'Registration fee, Medical procedures, Lab orders, and Prescription drugs', id: 'Biaya pendaftaran, Tindakan medis, Order laboratorium, dan Obat resep' },
        { en: 'Doctor salary, Electricity, Medicine, and Parking', id: 'Gaji dokter, Listrik, Obat, dan Parkir' },
        { en: 'Only procedures and drugs', id: 'Hanya tindakan dan obat' },
      ],
      answer: 0,
      explain: {
        en: '`InvoiceService` gathers active items from registration (`pendaftaran`), `t_tindakan`, `t_order_lab_detail`, and `t_resep_detail`. On this visit, no lab order was placed, so 3 sources sum to Rp 87.000.',
        id: '`InvoiceService` menghimpun item aktif dari pendaftaran, `t_tindakan`, `t_order_lab_detail`, dan `t_resep_detail`. Pada kunjungan ini tidak ada order lab, sehingga 3 sumber berjumlah Rp 87.000.',
      },
    },
    {
      q: {
        en: 'What is the difference between `Export PDF` and `Cetak` in the top toolbar?',
        id: 'Apa perbedaan tombol `Export PDF` dan `Cetak` di toolbar atas?',
      },
      options: [
        { en: '`Export PDF` generates a downloadable PDF via `export-pdf.ts`, while `Cetak` triggers browser `window.print()` with print CSS', id: '`Export PDF` menghasilkan file PDF unduhan lewat `export-pdf.ts`, sedangkan `Cetak` memicu `window.print()` dengan CSS cetak' },
        { en: '`Export PDF` runs on `backend-yii` and `Cetak` runs on `service-node`', id: '`Export PDF` berjalan di `backend-yii` dan `Cetak` berjalan di `service-node`' },
        { en: 'They are identical aliases', id: 'Keduanya alias yang sama persis' },
      ],
      answer: 0,
      explain: {
        en: 'Both live cleanly in `frontend-react`: `exportInvoicePdf()` builds a structured PDF download and `window.print()` uses print styles to hide the sidebar and toolbar.',
        id: 'Keduanya berjalan di `frontend-react`: `exportInvoicePdf()` membangun unduhan PDF terstruktur dan `window.print()` memakai gaya cetak untuk menyembunyikan sidebar dan toolbar.',
      },
    },
  ],
  dashboard: [
    {
      q: {
        en: 'Which backend serves all 7 `/api/dashboard/*` endpoints on this screen, and with which PostgreSQL role?',
        id: 'Backend mana yang melayani seluruh 7 endpoint `/api/dashboard/*` di layar ini, dan memakai role PostgreSQL apa?',
      },
      options: [
        { en: '`backend-yii` using superuser `postgres`', id: '`backend-yii` memakai superuser `postgres`' },
        { en: '`service-node` using read-only role `simrs_readonly` (`SELECT` only)', id: '`service-node` memakai role read-only `simrs_readonly` (khusus `SELECT`)' },
        { en: '`frontend-react` aggregating raw rows in memory', id: '`frontend-react` mengagregasi baris mentah di memori' },
      ],
      answer: 1,
      explain: {
        en: '`service-node/src/lib/db.ts` exposes `readDb()`, which connects as `simrs_readonly` so analytical queries are structurally incapable of mutating clinical or financial tables.',
        id: '`service-node/src/lib/db.ts` menyediakan `readDb()` yang terhubung sebagai `simrs_readonly` sehingga query analitik mustahil mengubah tabel klinis maupun keuangan.',
      },
    },
    {
      q: {
        en: 'Look at `Pendapatan Diterima: Rp 9.943.500` vs `Total tagihan: Rp 11.245.000`. Why are those two numbers different?',
        id: 'Lihat `Pendapatan Diterima: Rp 9.943.500` vs `Total tagihan: Rp 11.245.000`. Mengapa kedua angka itu berbeda?',
      },
      options: [
        { en: 'A rounding bug in JavaScript floats', id: 'Bug pembulatan float JavaScript' },
        { en: '50 invoices are paid in full (`Lunas`), while 5 are partial (`Sebagian`) and 5 are unpaid (`Belum dibayar`), so collected cash is less than total billed', id: '50 invoice sudah `Lunas`, sedangkan 5 `Sebagian` dan 5 `Belum dibayar`, sehingga kas diterima lebih kecil dari total tagihan' },
        { en: 'Voided items were counted twice', id: 'Item void terhitung dua kali' },
      ],
      answer: 1,
      explain: {
        en: 'Cash receipts sum `t_pembayaran.jumlah` by payment date, while billed composition sums active (`is_void = false`) `t_invoice_item.subtotal`—giving finance both cash-basis and accrual-basis visibility.',
        id: 'Penerimaan kas menjumlahkan `t_pembayaran.jumlah` berdasarkan tanggal bayar, sedangkan komposisi tagihan menjumlahkan `t_invoice_item.subtotal` aktif (`is_void = false`)—memberi visibilitas berbasis kas sekaligus akrual.',
      },
    },
    {
      q: {
        en: 'Why did the dashboard SQL queries speed up by 2.5× to 10.8× in `docs/performance.md` (D.6)?',
        id: 'Mengapa query SQL dashboard menjadi 2,5× hingga 10,8× lebih cepat di `docs/performance.md` (D.6)?',
      },
      options: [
        { en: '6 composite/partial PostgreSQL indexes paired with sargable date ranges (`>= $1::date AND < $2::date + 1 day`)', id: '6 index komposit/parsial PostgreSQL dipadukan dengan rentang tanggal sargable (`>= $1::date AND < $2::date + 1 day`)' },
        { en: 'Caching stale results in `localStorage` for 24 hours', id: 'Menyimpan cache hasil basi di `localStorage` selama 24 jam' },
        { en: 'Switching from PostgreSQL to SQLite', id: 'Berpindah dari PostgreSQL ke SQLite' },
      ],
      answer: 0,
      explain: {
        en: 'Migration `m261122_010000_create_dashboard_indexes.php` and sargable range predicates allow PostgreSQL to replace full `Seq Scan` plans with Index / Bitmap Index Scans.',
        id: 'Migrasi `m261122_010000_create_dashboard_indexes.php` dan predikat rentang sargable memungkinkan PostgreSQL mengganti `Seq Scan` penuh dengan Index / Bitmap Index Scan.',
      },
    },
  ],
  rbac: [
    {
      q: {
        en: 'Why does the Dashboard group have two separate rows: `dashboard` and `dashboard-keuangan`?',
        id: 'Mengapa grup Dashboard memiliki dua baris terpisah: `dashboard` dan `dashboard-keuangan`?',
      },
      options: [
        { en: 'So non-finance roles can see operational visit counts without accessing hospital revenue and payment reports', id: 'Agar role non-keuangan bisa melihat jumlah kunjungan operasional tanpa mengakses laporan pendapatan dan pembayaran rumah sakit' },
        { en: 'One is for light mode and one is for dark mode', id: 'Satu untuk light mode dan satu untuk dark mode' },
        { en: 'Because Yii2 only allows one menu per controller', id: 'Karena Yii2 hanya mengizinkan satu menu per controller' },
      ],
      answer: 0,
      explain: {
        en: 'Migration `m261122_040000_add_dashboard_keuangan_menu.php` splits financial metrics behind `dashboard-keuangan:read`, checked in both `DashboardPage.tsx` and `service-node` middleware.',
        id: 'Migrasi `m261122_040000_add_dashboard_keuangan_menu.php` memisahkan metrik keuangan di balik `dashboard-keuangan:read`, dicek baik di `DashboardPage.tsx` maupun middleware `service-node`.',
      },
    },
    {
      q: {
        en: 'After clicking `Simpan` on the Role Access matrix, when do the updated permissions apply on API requests?',
        id: 'Setelah menekan `Simpan` pada matriks Hak Akses Role, kapan izin terbaru mulai berlaku pada request API?',
      },
      options: [
        { en: 'Only after rebuilding Docker containers', id: 'Baru berlaku setelah build ulang container Docker' },
        { en: 'Immediately on the next API request, because Yii `AccessFilter` and Node `auth.ts` read `m_role_access` live', id: 'Langsung pada request API berikutnya, karena `AccessFilter` Yii dan `auth.ts` Node membaca `m_role_access` secara langsung' },
        { en: 'Only after the user\'s JWT expires', id: 'Baru berlaku setelah JWT pengguna kedaluwarsa' },
      ],
      answer: 1,
      explain: {
        en: 'Permissions are not baked statically into the JWT payload, so revoking access takes effect immediately on both backends.',
        id: 'Izin tidak ditanam statis di dalam payload JWT, sehingga pencabutan akses langsung berlaku di kedua backend.',
      },
    },
    {
      q: {
        en: 'What happens in `AccessFilter.php` if a developer adds a new controller action but forgets to map its permission?',
        id: 'Apa yang terjadi di `AccessFilter.php` bila developer menambah action controller baru tetapi lupa memetakan izinnya?',
      },
      options: [
        { en: 'It silently allows everyone (fail-open)', id: 'Diam-diam mengizinkan semua orang (fail-open)' },
        { en: 'It throws `InvalidConfigException` (fail-closed)', id: 'Melempar `InvalidConfigException` (fail-closed)' },
        { en: 'It falls back to `can_delete`', id: 'Fallback ke `can_delete`' },
      ],
      answer: 1,
      explain: {
        en: '`AccessFilter::beforeAction()` explicitly checks `in_array($permission, AccessService::PERMISSIONS, true)` and fails closed with `InvalidConfigException` if unmapped.',
        id: '`AccessFilter::beforeAction()` secara eksplisit mengecek `in_array($permission, AccessService::PERMISSIONS, true)` dan bersifat fail-closed dengan `InvalidConfigException` bila belum dipetakan.',
      },
    },
  ],
  forbidden: [
    {
      q: {
        en: 'Here `Rina Pendaftaran` navigated directly to `/billing`. Which React component intercepted the route and rendered `Akses ditolak`?',
        id: 'Di sini `Rina Pendaftaran` membuka langsung `/billing`. Komponen React mana yang mencegat rute dan merender `Akses ditolak`?',
      },
      options: [
        { en: '`PermissionGuard.tsx` checking `useAuthStore((s) => s.can(menu, action))`', id: '`PermissionGuard.tsx` yang mengecek `useAuthStore((s) => s.can(menu, action))`' },
        { en: '`RequireAuth.tsx`', id: '`RequireAuth.tsx`' },
        { en: '`AppPaginator.tsx`', id: '`AppPaginator.tsx`' },
      ],
      answer: 0,
      explain: {
        en: '`RequireAuth` checks whether a user is logged in; `PermissionGuard` checks the specific `menu` + `action` permission and renders `<ForbiddenPage />` when denied.',
        id: '`RequireAuth` mengecek apakah pengguna sudah login; `PermissionGuard` mengecek izin `menu` + `action` tertentu dan merender `<ForbiddenPage />` bila ditolak.',
      },
    },
    {
      q: {
        en: 'If Rina bypasses the browser UI and sends `GET /transaction/invoice` with curl using her valid JWT, what happens?',
        id: 'Jika Rina melewati UI browser dan mengirim `GET /transaction/invoice` dengan curl memakai JWT-nya yang valid, apa yang terjadi?',
      },
      options: [
        { en: 'She receives all invoices because her JWT is valid', id: 'Ia menerima semua invoice karena JWT-nya valid' },
        { en: '`backend-yii` `AccessFilter` rejects the request with HTTP `403 Forbidden`', id: '`AccessFilter` di `backend-yii` menolak request dengan HTTP `403 Forbidden`' },
        { en: 'She is redirected to `/login`', id: 'Ia dialihkan ke `/login`' },
      ],
      answer: 1,
      explain: {
        en: 'Defense in depth: UI guards improve user experience, while server-side `AccessFilter` (Yii) and `auth.ts` (Node) enforce real authorization on every endpoint.',
        id: 'Pertahanan berlapis: guard UI memperbaiki pengalaman pengguna, sedangkan `AccessFilter` (Yii) dan `auth.ts` (Node) di server menegakkan otorisasi sesungguhnya di tiap endpoint.',
      },
    },
    {
      q: {
        en: 'Why does the sidebar on the left only show `Dashboard` instead of `Billing` or `Sistem`?',
        id: 'Mengapa sidebar di kiri hanya menampilkan `Dashboard`, bukan `Billing` atau `Sistem`?',
      },
      options: [
        { en: '`AppSidebar` builds navigation strictly from the `modules` tree permitted for the logged-in role', id: '`AppSidebar` membangun navigasi murni dari pohon `modules` yang diizinkan untuk role yang sedang login' },
        { en: 'Other menus are hidden on 1440px screens', id: 'Menu lain disembunyikan di layar 1440px' },
        { en: 'The CSS failed to load', id: 'CSS gagal dimuat' },
      ],
      answer: 0,
      explain: {
        en: 'Menu visibility is driven by `m_role_access` returned from `backend-yii`, keeping the interface uncluttered for each hospital role.',
        id: 'Visibilitas menu digerakkan oleh `m_role_access` yang dikirim `backend-yii`, menjaga antarmuka tetap bersih sesuai tiap role rumah sakit.',
      },
    },
  ],
};
