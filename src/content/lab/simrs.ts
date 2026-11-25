import type { LabPart, LabProject, LabScreen } from '../../core/lab.ts';
import { simrsQuiz } from './simrsQuiz.ts';
import { simrsShots } from './simrsShots.generated.ts';

// Screen-by-screen interactive tour of SIMRS Rawat Jalan.
// Screenshots come from the live Docker stack proof-book captures (1440px viewport) with seeded hospital data.
const F = 'frontend-react/src';
const Y = 'backend-yii';
const N = 'service-node/src';

export const simrsParts: LabPart[] = [
  {
    id: 'loginCard',
    title: { en: 'Login card & session redirect', id: 'Kartu login & redirect sesi' },
    what: {
      en: 'Centered authentication card for hospital staff. If a valid session already exists, it redirects straight back to the intended route.',
      id: 'Kartu autentikasi terpusat untuk petugas rumah sakit. Bila sesi valid sudah ada, halaman langsung mengarahkan kembali ke rute tujuan.',
    },
    why: {
      en: 'Keeping `/login` decoupled from `AppLayout` avoids flashing an empty sidebar before permissions arrive, while stripping `/login` and `/403` from `location.state.from` prevents redirect loops.',
      id: 'Memisahkan `/login` dari `AppLayout` mencegah sidebar kosong berkedip sebelum izin datang, sementara menyaring `/login` dan `/403` dari `location.state.from` mencegah loop redirect.',
    },
    component: 'LoginPage (Card)',
    focus: 'simrs-auth-rbac',
    files: [
      {
        path: `${F}/modules/system/auth/LoginPage.tsx`,
        role: { en: 'Guards authenticated users away from `/login` and renders the form card.', id: 'Mengarahkan pengguna yang sudah login keluar dari `/login` dan merender kartu form.' },
        lang: 'tsx',
        code: `if (status === 'authenticated') {\n  const rawFrom = (location.state as { from?: string } | null)?.from;\n  const from = rawFrom && rawFrom !== '/login' && rawFrom !== '/403' ? rawFrom : '/';\n  return <Navigate to={from} replace />;\n}`,
      },
      { path: `${F}/routes/RequireAuth.tsx`, role: { en: 'Redirects unauthenticated visits to `/login` while remembering `from`.', id: 'Mengalihkan kunjungan tanpa sesi ke `/login` sambil menyimpan rute asal.' } },
    ],
  },
  {
    id: 'loginFields',
    title: { en: 'Zod-validated credential inputs', id: 'Input kredensial tervalidasi Zod' },
    what: {
      en: 'Username and password inputs managed by React Hook Form with a Zod schema, surfacing inline errors and API 401 failures cleanly.',
      id: 'Input username dan password yang dikelola React Hook Form dengan skema Zod, menampilkan error inline maupun kegagalan 401 dari API secara rapi.',
    },
    why: {
      en: 'Client-side Zod validation catches empty credentials instantly without a network round-trip, while `backend-yii` still verifies password hashes and active account flags in `m_user`.',
      id: 'Validasi Zod di klien menangkap kredensial kosong secara instan tanpa round-trip jaringan, sementara `backend-yii` tetap memverifikasi hash password dan status aktif di `m_user`.',
    },
    component: 'LoginPage (useForm + zodResolver)',
    files: [
      {
        path: `${F}/modules/system/auth/LoginPage.tsx`,
        role: { en: 'Wires `useForm<LoginValues>` with `zodResolver(schema)`.', id: 'Menyambungkan `useForm<LoginValues>` dengan `zodResolver(schema)`.' },
        lang: 'tsx',
        code: `const {\n  handleSubmit,\n  setError,\n  formState: { errors, isSubmitting },\n} = useForm<LoginValues>({\n  resolver: zodResolver(schema),\n  defaultValues: { username: '', password: '' },\n});`,
      },
      { path: `${Y}/modules/system/auth/LoginForm.php`, role: { en: 'Server-side Yii2 validation and password hash check.', id: 'Validasi sisi server Yii2 dan pengecekan hash password.' } },
    ],
  },
  {
    id: 'loginSubmit',
    title: { en: 'Sign-in button (JWT HS256)', id: 'Tombol Masuk (JWT HS256)' },
    what: {
      en: 'Calls `POST /system/auth/login` on `backend-yii`, receives a JWT HS256 plus permitted modules and CRUD flags, and stores them in `useAuthStore`.',
      id: 'Memanggil `POST /system/auth/login` di `backend-yii`, menerima JWT HS256 beserta modul dan flag CRUD yang diizinkan, lalu menyimpannya di `useAuthStore`.',
    },
    why: {
      en: 'One issuer (`backend-yii`) signs tokens with a shared secret and issuer (`simrs-backend`), so both Yii and `service-node` can verify the exact same Bearer token without duplicating auth logic.',
      id: 'Satu penerbit (`backend-yii`) menandatangani token dengan secret dan issuer bersama (`simrs-backend`), sehingga Yii dan `service-node` sama-sama bisa memverifikasi Bearer token yang identik tanpa menduplikasi logika auth.',
    },
    component: 'LoginPage (Button[type="submit"])',
    focus: 'simrs-auth-rbac',
    files: [
      { path: `${Y}/modules/system/auth/AuthService.php`, role: { en: 'Verifies user, builds module/menu tree, and issues JWT.', id: 'Memverifikasi user, menyusun pohon modul/menu, dan menerbitkan JWT.' } },
      { path: `${Y}/common/JwtService.php`, role: { en: 'Signs and verifies HS256 tokens with issuer `simrs-backend`.', id: 'Menandatangani dan memverifikasi token HS256 dengan issuer `simrs-backend`.' } },
      { path: `${F}/lib/auth-store.ts`, role: { en: 'Zustand store holding token, user, modules, and `can(menu, action)`.', id: 'Store Zustand penyimpan token, user, modul, dan `can(menu, action)`.' } },
    ],
  },
  {
    id: 'localeToggle',
    title: { en: 'ID / EN language toggle', id: 'Tombol bahasa ID / EN' },
    what: {
      en: 'Switches the entire app between Bahasa Indonesia and English using `i18next`, even before login.',
      id: 'Mengganti seluruh aplikasi antara Bahasa Indonesia dan Inggris memakai `i18next`, bahkan sebelum login.',
    },
    why: {
      en: 'Locale parity between `id.json` and `en.json` is enforced automatically by `tests/i18n.test.tsx`, so switching language never leaves missing translation keys.',
      id: 'Kesetaraan kunci antara `id.json` dan `en.json` dijaga otomatis oleh `tests/i18n.test.tsx`, sehingga mengganti bahasa tidak pernah menyisakan kunci terjemahan hilang.',
    },
    component: 'AppLocaleToggle',
    focus: 'simrs-frontend-ux',
    files: [
      { path: `${F}/components/AppLocaleToggle.tsx`, role: { en: 'Toggles `i18n.changeLanguage` between `id` and `en`.', id: 'Mengganti `i18n.changeLanguage` antara `id` dan `en`.' } },
      { path: `${F}/lib/i18n.ts`, role: { en: 'Initializes `i18next` and persists user choice.', id: 'Menginisialisasi `i18next` dan menyimpan pilihan pengguna.' } },
    ],
  },
  {
    id: 'sidebar',
    title: { en: 'Role-driven navigation sidebar', id: 'Sidebar navigasi berbasis role' },
    what: {
      en: 'Dark left navigation rail showing brand identity, module switcher, menus for the active module, and logged-in staff identity.',
      id: 'Panel navigasi kiri gelap yang menampilkan identitas brand, pemilih modul, daftar menu untuk modul aktif, dan identitas petugas yang login.',
    },
    why: {
      en: 'Menus come directly from `m_role_access` returned by `backend-yii`. Roles only see the modules they are allowed to open, keeping clinical screens focused.',
      id: 'Daftar menu datang langsung dari `m_role_access` yang dikembalikan `backend-yii`. Tiap role hanya melihat modul yang boleh dibuka sehingga layar klinis tetap fokus.',
    },
    component: 'AppSidebar',
    focus: 'simrs-auth-rbac',
    files: [
      { path: `${F}/components/layout/AppSidebar.tsx`, role: { en: 'Renders active module menus and logout footer.', id: 'Merender menu modul aktif dan footer keluar.' } },
      { path: `${F}/components/layout/AppLayout.tsx`, role: { en: 'Composes `AppSidebar`, `AppHeader`, `<Outlet />`, and `ChatbotWidget`.', id: 'Menyusun `AppSidebar`, `AppHeader`, `<Outlet />`, dan `ChatbotWidget`.' } },
    ],
  },
  {
    id: 'moduleSwitcher',
    title: { en: 'Active module switcher', id: 'Pemilih modul aktif' },
    what: {
      en: 'Compact dropdown (`MODUL AKTIF`) that switches between permitted hospital modules (Dashboard, Pendaftaran, Pelayanan Medis, Farmasi, Laboratorium, Billing, Master Data, Sistem).',
      id: 'Dropdown ringkas (`MODUL AKTIF`) untuk berpindah antar modul rumah sakit yang diizinkan (Dashboard, Pendaftaran, Pelayanan Medis, Farmasi, Laboratorium, Billing, Master Data, Sistem).',
    },
    why: {
      en: 'An 8-module hospital system has 22 menus; grouping them under a module switcher prevents a tall, scrolling sidebar while keeping current-module navigation one click away.',
      id: 'Sistem rumah sakit 8 modul memiliki 22 menu; mengelompokkannya di balik pemilih modul mencegah sidebar terlalu panjang sambil menjaga navigasi modul aktif tetap satu klik.',
    },
    component: 'AppSidebar (module selector)',
    focus: 'simrs-frontend-ux',
    files: [
      { path: `${F}/components/layout/AppSidebar.tsx`, role: { en: 'Displays the module dropdown and switches `activeModule`.', id: 'Menampilkan dropdown modul dan mengganti `activeModule`.' } },
      { path: `${F}/lib/menu.ts`, role: { en: 'Matches routes to modules and flattens permitted menu items.', id: 'Mencocokkan rute ke modul dan meratakan item menu yang diizinkan.' } },
    ],
  },
  {
    id: 'commandSearch',
    title: { en: 'Global command search (Ctrl+K)', id: 'Pencarian menu global (Ctrl+K)' },
    what: {
      en: 'Header search button and `Ctrl+K` / `Cmd+K` dialog that jumps to any permitted screen across all modules without touching the mouse.',
      id: 'Tombol pencarian di header dan dialog `Ctrl+K` / `Cmd+K` untuk melompat ke layar mana pun yang diizinkan lintas modul tanpa menyentuh mouse.',
    },
    why: {
      en: 'Administrators and multi-role staff switch between master tables and transaction queues frequently. Grouping `flattenModuleMenus(modules)` ensures users can only search menus they have permission to open.',
      id: 'Administrator dan staf multi-role sering berpindah antara tabel master dan antrean transaksi. Mengelompokkan `flattenModuleMenus(modules)` memastikan pengguna hanya bisa mencari menu yang diizinkan.',
    },
    component: 'AppCommandSearch',
    focus: 'simrs-frontend-ux',
    files: [
      {
        path: `${F}/components/AppCommandSearch.tsx`,
        role: { en: 'Groups permitted menus by module and binds `Ctrl+K` / `Cmd+K`.', id: 'Mengelompokkan menu berizin per modul dan mengikat pintasan `Ctrl+K` / `Cmd+K`.' },
        lang: 'tsx',
        code: `const grouped = useMemo(() => {\n  const flat = flattenModuleMenus(modules);\n  const map = new Map<string, { nama: string; items: FlatMenuEntry[] }>();\n  for (const entry of flat) {\n    const group = map.get(entry.moduleKode) ?? { nama: entry.moduleNama, items: [] };\n    group.items.push(entry);\n    map.set(entry.moduleKode, group);\n  }`,
      },
    ],
  },
  {
    id: 'headerControls',
    title: { en: 'Locale & theme toggles', id: 'Toggle bahasa & tema' },
    what: {
      en: 'Top-right controls for switching ID/EN language and light/dark appearance inside the authenticated shell.',
      id: 'Kontrol kanan atas untuk mengganti bahasa ID/EN dan tampilan terang/gelap di dalam shell terautentikasi.',
    },
    why: {
      en: 'Theme state lives in `ThemeProvider` synced with Tailwind dark classes, while switching locale dynamically re-renders both page labels and existing `ChatbotWidget` session messages.',
      id: 'State tema tinggal di `ThemeProvider` yang sinkron dengan class dark Tailwind, sementara ganti bahasa langsung merender ulang label halaman maupun riwayat pesan `ChatbotWidget`.',
    },
    component: 'AppLocaleToggle + AppThemeToggle',
    files: [
      { path: `${F}/components/AppThemeToggle.tsx`, role: { en: 'Switches light/dark theme via `theme-provider.tsx`.', id: 'Mengganti tema terang/gelap lewat `theme-provider.tsx`.' } },
      { path: `${F}/components/AppLocaleToggle.tsx`, role: { en: 'Switches ID/EN language live.', id: 'Mengganti bahasa ID/EN secara langsung.' } },
    ],
  },
  {
    id: 'patientPicker',
    title: { en: 'Patient search & quick create', id: 'Pencarian pasien & tambah cepat' },
    what: {
      en: 'Step 1 card on Registration: search patients by Medical Record No (`RM000041`), NIK, or name, or click `Pasien Baru` to register a new patient inline without leaving the workflow.',
      id: 'Kartu Langkah 1 di Pendaftaran: cari pasien berdasarkan No. RM (`RM000041`), NIK, atau nama, atau klik `Pasien Baru` untuk mendaftarkan pasien baru tanpa keluar dari alur.',
    },
    why: {
      en: 'Front-desk queues slow down when clerks must switch to Master Data just to add a walk-in patient. Embedding `PasienForm` in a modal lets clerks create and immediately select the new patient.',
      id: 'Antrean loket melambat bila petugas harus pindah ke Master Data hanya untuk menambah pasien baru. Menyematkan `PasienForm` di modal memungkinkan petugas membuat lalu langsung memilih pasien baru.',
    },
    component: 'PendaftaranPage (Step 1 Card)',
    focus: 'simrs-d1-registration',
    examples: [
      { file: 'B2-pendaftaran.png', value: 'Adi Kusuma · RM000041 · 3273011000000041\nAdi Santoso · RM000001 · 3273011000000001' },
    ],
    files: [
      { path: `${F}/modules/transaction/pendaftaran/PendaftaranPage.tsx`, role: { en: 'Renders debounced patient search and inline `PasienForm` dialog.', id: 'Merender pencarian pasien ter-debounce dan dialog `PasienForm` inline.' } },
      { path: `${Y}/modules/master/pasien/PasienService.php`, role: { en: 'Generates unique `RM` numbers via `SequenceService` and validates NIK.', id: 'Menerbitkan nomor `RM` unik via `SequenceService` dan memvalidasi NIK.' } },
    ],
  },
  {
    id: 'scheduleForm',
    title: { en: 'Polyclinic schedule & guarantor selector', id: 'Pemilih jadwal poli & penjamin' },
    what: {
      en: 'Step 2 card: pick visit date, filter polyclinic, choose an active doctor schedule showing its quota (`Kuota 30`), and select guarantor (`Umum / Pribadi`, BPJS, Insurance).',
      id: 'Kartu Langkah 2: pilih tanggal kunjungan, filter poli, pilih jadwal dokter aktif beserta kuotanya (`Kuota 30`), dan pilih penjamin (`Umum / Pribadi`, BPJS, Asuransi).',
    },
    why: {
      en: 'Showing practice hours and quota right in the dropdown guides clerks before submitting, while `backend-yii` still locks `m_jadwal_dokter FOR UPDATE` to enforce the true quota under concurrency.',
      id: 'Menampilkan jam praktik dan kuota langsung di dropdown membantu petugas sebelum submit, sementara `backend-yii` tetap mengunci `m_jadwal_dokter FOR UPDATE` untuk menegakkan kuota sesungguhnya saat konkurensi.',
    },
    component: 'PendaftaranPage (Step 2 Card)',
    focus: 'simrs-d1-registration',
    examples: [
      { file: 'B2-pendaftaran.png', value: 'dr. Budi Santoso — Poli Umum (08:00-14:00, Kuota 30)\nPenjamin: Umum / Pribadi' },
    ],
    files: [
      { path: `${F}/modules/transaction/pendaftaran/PendaftaranPage.tsx`, role: { en: 'Loads schedules by date and polyclinic.', id: 'Memuat jadwal berdasarkan tanggal dan poli.' } },
      { path: `${Y}/modules/master/jadwal/JadwalDokterService.php`, role: { en: 'Serves active practice schedules by day of week.', id: 'Menyajikan jadwal praktik aktif sesuai hari.' } },
    ],
  },
  {
    id: 'registerSubmit',
    title: { en: 'Register visit (D.1 lock + atomic queue)', id: 'Daftarkan kunjungan (lock D.1 + antrean atomik)' },
    what: {
      en: 'Submits `POST /transaction/pendaftaran` to create `t_kunjungan`, reserve a schedule quota slot, and issue a unique polyclinic-prefixed queue number.',
      id: 'Mengirim `POST /transaction/pendaftaran` untuk membuat `t_kunjungan`, mengunci slot kuota jadwal, dan menerbitkan nomor antrean berprefiks poli yang unik.',
    },
    why: {
      en: 'Combines schedule row lock, `SequenceService` counter lock, and PostgreSQL partial unique index `uq_t_kunjungan_pasien_poli_tgl_aktif WHERE status <> \'batal\'` so parallel clicks never create duplicate visits or queue numbers.',
      id: 'Memadukan row lock jadwal, lock counter `SequenceService`, dan partial unique index PostgreSQL `uq_t_kunjungan_pasien_poli_tgl_aktif WHERE status <> \'batal\'` agar klik paralel tidak pernah membuat kunjungan atau nomor antrean ganda.',
    },
    component: 'PendaftaranPage (Submit Button)',
    focus: 'simrs-d1-registration',
    examples: [
      {
        file: 'evidence/konkurensi-pendaftaran.txt',
        value: '[D.1 Pasien Sama] 201 Created = 1, 409 Conflict = 9\n[D.1 Nomor Antrean Paralel] no_antrean = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]',
        note: { en: 'Measured against live Docker PostgreSQL + Yii2 with 10 concurrent HTTP requests.', id: 'Diukur langsung pada Docker PostgreSQL + Yii2 dengan 10 request HTTP paralel.' },
      },
    ],
    files: [
      {
        path: `${Y}/common/SequenceService.php`,
        role: { en: 'Locks `t_sequence_counter` row `FOR UPDATE` before incrementing.', id: 'Mengunci baris `t_sequence_counter` dengan `FOR UPDATE` sebelum menaikkan counter.' },
        lang: 'php',
        code: `$db->createCommand(\n    'INSERT INTO t_sequence_counter (kode, periode, nilai_terakhir, created_by)\n     VALUES (:kode, :periode, 0, :user)\n     ON CONFLICT (kode, periode) DO NOTHING',\n    [':kode' => $kode, ':periode' => $periode, ':user' => $userId]\n)->execute();\n\n$current = $db->createCommand(\n    'SELECT nilai_terakhir FROM t_sequence_counter WHERE kode = :kode AND periode = :periode FOR UPDATE',`,
      },
      { path: `${Y}/modules/transaction/pendaftaran/PendaftaranService.php`, role: { en: 'Validates quota under lock and inserts `t_kunjungan`.', id: 'Memvalidasi kuota di bawah lock dan menyisipkan `t_kunjungan`.' } },
    ],
  },
  {
    id: 'chatbotTrigger',
    title: { en: 'Zero-LLM help chatbot (`Alt+H`)', id: 'Chatbot bantuan tanpa LLM (`Alt+H`)' },
    what: {
      en: 'Floating `Bantuan` button on every authenticated screen. Opens a permission-aware assistant that looks up patients, bills, schedules, drug stock, pharmacy/lab queues, and FAQ articles without any LLM or API key.',
      id: 'Tombol `Bantuan` mengambang di setiap layar terautentikasi. Membuka asisten sadar-izin untuk mencari pasien, tagihan, jadwal, stok obat, antrean farmasi/lab, dan artikel FAQ tanpa LLM atau API key.',
    },
    why: {
      en: 'Deterministic regex intent routing (`RM`, `RJ`, `INV`, `RSP`, `LAB`), `Promise.allSettled` live lookups, and synonym + Levenshtein FAQ search avoid external costs and hallucinations while keeping chat history language-reactive in per-user `sessionStorage`.',
      id: 'Routing intent regex deterministik (`RM`, `RJ`, `INV`, `RSP`, `LAB`), lookup live `Promise.allSettled`, dan pencarian FAQ sinonim + Levenshtein menghindari biaya eksternal dan halusinasi sambil menjaga riwayat chat reaktif bahasa di `sessionStorage` per user.',
    },
    component: 'ChatbotWidget',
    focus: 'simrs-frontend-ux',
    files: [
      {
        path: `${F}/modules/chatbot/ChatbotWidget.tsx`,
        role: { en: 'Binds `Alt+H` / `Escape` shortcuts and manages conversation state.', id: 'Mengikat pintasan `Alt+H` / `Escape` dan mengelola state percakapan.' },
        lang: 'tsx',
        code: `} else if (event.altKey && event.key.toLowerCase() === 'h') {\n  event.preventDefault();\n  setOpen((prev) => !prev);\n}`,
      },
      { path: `${F}/modules/chatbot/knowledge.ts`, role: { en: 'Hospital synonym dictionary, Levenshtein fuzzy matcher, and intent router.', id: 'Kamus sinonim rumah sakit, pencocok fuzzy Levenshtein, dan router intent.' } },
      { path: `${F}/modules/chatbot/lookups.ts`, role: { en: 'Live API lookup handlers with `Promise.allSettled` partial-result fallback.', id: 'Handler lookup API live dengan fallback hasil parsial `Promise.allSettled`.' } },
    ],
  },
  {
    id: 'displayButton',
    title: { en: 'Waiting-room TV display launcher', id: 'Peluncur layar display ruang tunggu' },
    what: {
      en: 'Opens `/antrean/display` (`DisplayAntreanPage`), a full-screen waiting room board that highlights active called queue numbers and speaks callouts via Web Speech / audio.',
      id: 'Membuka `/antrean/display` (`DisplayAntreanPage`), papan ruang tunggu layar penuh yang menyorot nomor antrean aktif dan membacakan panggilan lewat suara.',
    },
    why: {
      en: 'Separating the clerk control table from the public TV board keeps patient PII off the waiting room screen while reusing the same `Antrean` API feed.',
      id: 'Memisahkan tabel kontrol petugas dari papan TV publik menjaga PII pasien tidak tampil di ruang tunggu sambil memakai feed API `Antrean` yang sama.',
    },
    component: 'AntreanPage (Layar Display button)',
    focus: 'simrs-frontend-ux',
    files: [
      { path: `${F}/modules/transaction/antrean/DisplayAntreanPage.tsx`, role: { en: 'Full-screen queue board for waiting-room displays.', id: 'Papan antrean layar penuh untuk monitor ruang tunggu.' } },
      { path: `${F}/hooks/use-queue-announcement.ts`, role: { en: 'Speaks called queue numbers (`U-001`) when status transitions.', id: 'Membacakan nomor antrean (`U-001`) saat status berpindah.' } },
    ],
  },
  {
    id: 'filterBar',
    title: { en: 'Server-filtered query bar (`ListQuery`)', id: 'Bar filter server (`ListQuery`)' },
    what: {
      en: 'Search input, default-today date range (`11/24/2026 s/d 11/24/2026`), polyclinic filter, and status filter backed by server-side SQL parameters.',
      id: 'Kotak pencarian, rentang tanggal bawaan hari ini (`11/24/2026 s/d 11/24/2026`), filter poli, dan filter status yang diproses langsung oleh parameter SQL di server.',
    },
    why: {
      en: 'Defaulting operational queues to today (`hariIni()`) and capping `per_page <= 100` in `ListQuery.php` stops busy clinics from downloading thousands of old visits on every page load.',
      id: 'Membatasi antrean operasional secara bawaan ke hari ini (`hariIni()`) dan mematok `per_page <= 100` di `ListQuery.php` mencegah klinik sibuk mengunduh ribuan kunjungan lama setiap memuat halaman.',
    },
    component: 'AppFilterBar + AppDateRange',
    focus: 'simrs-d6-performance',
    examples: [
      { file: 'evidence/D6-performa.txt', value: 'Antrean poli: median 241ms · p95 297ms (20 req)' },
    ],
    files: [
      {
        path: `${F}/modules/transaction/antrean/AntreanPage.tsx`,
        role: { en: 'Initializes `useCrud` with today\'s date bounds.', id: 'Menginisialisasi `useCrud` dengan batas tanggal hari ini.' },
        lang: 'tsx',
        code: `} = useCrud(pendaftaranApi.listAntrean, {\n  q: '',\n  poli_id: '' as number | '',\n  status: '' as KunjunganStatus | '',\n  tanggal_dari: hariIni(),\n  tanggal_sampai: hariIni(),\n});`,
      },
      { path: `${Y}/common/ListQuery.php`, role: { en: 'Normalizes pagination, sorting, and default date range across all worklists.', id: 'Menormalisasi paginasi, pengurutan, dan rentang tanggal bawaan di semua worklist.' } },
    ],
  },
  {
    id: 'queueTable',
    title: { en: 'Polyclinic queue table', id: 'Tabel antrean poli' },
    what: {
      en: 'Lists active visits with prefixed queue number (`U-001`), visit ID (`RJ202611240001`), patient RM, doctor, visit date, and status badge (`Menunggu`).',
      id: 'Menampilkan kunjungan aktif beserta nomor antrean berprefiks (`U-001`), nomor kunjungan (`RJ202611240001`), No. RM pasien, dokter, tanggal kunjungan, dan badge status (`Menunggu`).',
    },
    why: {
      en: 'Queue prefixes come from `m_poli.prefix_antrean` (e.g. `U` for Poli Umum), while settled visits (`selesai`) disappear automatically from operational queues once paid in full.',
      id: 'Prefiks antrean datang dari `m_poli.prefix_antrean` (misal `U` untuk Poli Umum), sedangkan kunjungan yang sudah `selesai` otomatis hilang dari antrean operasional begitu lunas.',
    },
    component: 'AppDataTable (AntreanPage)',
    focus: 'simrs-d1-registration',
    examples: [
      { file: 'B2-antrean.png', value: 'U-001 · RJ202611240001 · Indah Santoso (RM000009) · Poli Umum · dr. Budi Santoso · Menunggu' },
    ],
    files: [
      { path: `${F}/components/AppDataTable.tsx`, role: { en: 'Reusable sortable table component shared across master and transaction screens.', id: 'Komponen tabel sortable reusable yang dipakai bersama di layar master dan transaksi.' } },
      { path: `${Y}/modules/transaction/antrean/AntreanService.php`, role: { en: 'Queries active queues and enforces valid status transitions.', id: 'Mengambil antrean aktif dan menegakkan transisi status yang sah.' } },
    ],
  },
  {
    id: 'queueActions',
    title: { en: 'Call / Examine & Cancel actions', id: 'Aksi Panggil / Periksa & Batalkan' },
    what: {
      en: 'Transitions a waiting visit to `diperiksa` (`Panggil / Periksa`) or `batal` (`Batalkan`), logging every change in `t_kunjungan_status_log`.',
      id: 'Mengubah kunjungan menunggu ke `diperiksa` (`Panggil / Periksa`) atau `batal` (`Batalkan`), sambil mencatat setiap perubahan di `t_kunjungan_status_log`.',
    },
    why: {
      en: 'Notice there is no manual `Selesai` button: `selesai` is reserved exclusively for `ValidasiKunjunganService::selesaikanKarenaLunas()` when billing is paid, and `AntreanService` locks `t_kunjungan` in the same order as `FarmasiService` to prevent deadlocks.',
      id: 'Perhatikan tidak ada tombol `Selesai` manual: `selesai` khusus ditetapkan oleh `ValidasiKunjunganService::selesaikanKarenaLunas()` saat tagihan lunas, dan `AntreanService` mengunci `t_kunjungan` dengan urutan sama seperti `FarmasiService` untuk mencegah deadlock.',
    },
    component: 'AntreanPage (row actions)',
    focus: 'simrs-d3-d4-billing',
    files: [
      { path: `${Y}/modules/transaction/antrean/AntreanService.php`, role: { en: 'Validates state transitions and writes `t_kunjungan_status_log`.', id: 'Memvalidasi transisi status dan menulis `t_kunjungan_status_log`.' } },
      { path: `${F}/modules/transaction/antrean/AntreanPage.tsx`, role: { en: 'Calls `ubahStatusAntrean(id, targetStatus)` with confirmation on cancel.', id: 'Memanggil `ubahStatusAntrean(id, targetStatus)` dengan konfirmasi saat batal.' } },
    ],
  },
  {
    id: 'paginator',
    title: { en: 'Server-side paginator', id: 'Paginator sisi server' },
    what: {
      en: 'Shows total rows (`Halaman 1 dari 1 (1 data)`) and page-size selector (`20`), synced with the unified `meta` pagination envelope returned by `backend-yii`.',
      id: 'Menampilkan total baris (`Halaman 1 dari 1 (1 data)`) dan pemilih jumlah baris (`20`), sinkron dengan amplop paginasi `meta` seragam dari `backend-yii`.',
    },
    why: {
      en: 'Pairing `AppPaginator` with `use-crud.ts` and `ListQuery.php` guarantees bounded memory and predictable query cost across all 13 list pages.',
      id: 'Memasangkan `AppPaginator` dengan `use-crud.ts` dan `ListQuery.php` menjamin memori terkendali dan biaya query terprediksi di seluruh 13 halaman daftar.',
    },
    component: 'AppPaginator',
    focus: 'simrs-d6-performance',
    files: [
      { path: `${F}/components/AppPaginator.tsx`, role: { en: 'Renders page navigation and per-page selector.', id: 'Merender navigasi halaman dan pemilih baris per halaman.' } },
      { path: `${F}/hooks/use-crud.ts`, role: { en: 'Shared hook managing `page`, `perPage`, `filters`, and reload state.', id: 'Hook bersama pengelola `page`, `perPage`, `filters`, dan state muat ulang.' } },
    ],
  },
  {
    id: 'patientHeader',
    title: { en: 'Active patient & visit banner', id: 'Header identitas pasien & kunjungan' },
    what: {
      en: 'Displays back-link to `Worklist Pemeriksaan`, patient full name (`Indah Santoso`), `RM000009`, visit ID (`RJ202611240001`), polyclinic, attending doctor, and live visit status badge (`Menunggu`).',
      id: 'Menampilkan tautan balik ke `Worklist Pemeriksaan`, nama pasien (`Indah Santoso`), `RM000009`, nomor kunjungan (`RJ202611240001`), poli, dokter pemeriksa, dan badge status kunjungan (`Menunggu`).',
    },
    why: {
      en: 'Keeping patient identity pinned above all 8 clinical tabs prevents wrong-patient charting errors while switching between SOAP notes, prescriptions, and lab orders.',
      id: 'Menjaga identitas pasien tetap terlihat di atas seluruh 8 tab klinis mencegah kesalahan pencatatan lintas pasien saat berpindah antara SOAP, resep, dan order lab.',
    },
    component: 'PemeriksaanPage (header)',
    focus: 'simrs-clinical-flow',
    files: [
      { path: `${F}/modules/transaction/pemeriksaan/PemeriksaanPage.tsx`, role: { en: 'Loads visit detail and displays patient/doctor banner.', id: 'Memuat detail kunjungan dan menampilkan banner pasien/dokter.' } },
    ],
  },
  {
    id: 'clinicalTabs',
    title: { en: '8-tab clinical workspace', id: 'Workspace klinis 8 tab' },
    what: {
      en: 'Unified doctor chart spanning `Anamnesis`, `Tanda Vital`, `Pemeriksaan Fisik`, `Diagnosis` (ICD-10), `Tindakan`, `Resep`, `Laboratorium`, and `Riwayat` (longitudinal medical history).',
      id: 'Rekam klinis dokter terpadu berisi `Anamnesis`, `Tanda Vital`, `Pemeriksaan Fisik`, `Diagnosis` (ICD-10), `Tindakan`, `Resep`, `Laboratorium`, dan `Riwayat` (riwayat medis longitudinal).',
    },
    why: {
      en: 'Keeping every clinical order under one visit screen lets doctors review history while ordering procedures, prescriptions, and labs—and every order snapshots master tariffs immediately and respects the cashier `Valid` lock.',
      id: 'Menyatukan semua order klinis di satu layar kunjungan memudahkan dokter meninjau riwayat sambil membuat tindakan, resep, dan lab—dan setiap order langsung menyimpan snapshot tarif master serta menghormati kunci `Valid` kasir.',
    },
    component: 'PemeriksaanPage (TabsList)',
    focus: 'simrs-clinical-flow',
    files: [
      {
        path: `${F}/modules/transaction/pemeriksaan/PemeriksaanPage.tsx`,
        role: { en: 'Composes `TindakanPanel`, `ResepPanel`, `OrderLabPanel`, and `RiwayatMedisList`.', id: 'Menyusun `TindakanPanel`, `ResepPanel`, `OrderLabPanel`, dan `RiwayatMedisList`.' },
        lang: 'tsx',
        code: `import { RiwayatMedisList } from './RiwayatMedisList';\nimport { OrderLabPanel } from '@/modules/transaction/lab/OrderLabPanel';\nimport { ResepPanel } from '@/modules/transaction/resep/ResepPanel';\nimport { TindakanPanel } from '@/modules/transaction/tindakan/TindakanPanel';`,
      },
      { path: `${Y}/modules/transaction/lab/OrderLabService.php`, role: { en: 'Creates lab orders and computes normal/high/low result flags on Yii.', id: 'Membuat order lab dan menghitung flag hasil normal/tinggi/rendah di Yii.' } },
    ],
  },
  {
    id: 'examForm',
    title: { en: 'SOAP clinical form', id: 'Formulir klinis SOAP' },
    what: {
      en: 'Structured charting inputs for chief complaint (`Keluhan utama`) and `Anamnesis`, paired with vital signs and physical exam fields on adjacent tabs.',
      id: 'Input pencatatan terstruktur untuk `Keluhan utama` dan `Anamnesis`, dipadukan dengan tanda vital dan pemeriksaan fisik di tab sebelahnya.',
    },
    why: {
      en: 'Persisting clinical notes in `t_pemeriksaan` with `AuditLogBehavior` attached guarantees every post-creation edit records `data_lama` and `data_baru` JSONB diffs in `t_audit_log`.',
      id: 'Menyimpan catatan klinis di `t_pemeriksaan` yang dipasangi `AuditLogBehavior` menjamin setiap pengubahan pasca-buat mencatat diff JSONB `data_lama` dan `data_baru` di `t_audit_log`.',
    },
    component: 'PemeriksaanPage (TabsContent)',
    focus: 'simrs-clinical-flow',
    files: [
      { path: `${Y}/modules/transaction/pemeriksaan/PemeriksaanService.php`, role: { en: 'Saves SOAP notes and ICD-10 diagnoses while checking visit lock state.', id: 'Menyimpan catatan SOAP dan diagnosis ICD-10 sambil mengecek kunci kunjungan.' } },
      { path: `${Y}/common/AuditLogBehavior.php`, role: { en: 'Automatically writes JSONB before/after audit rows on ActiveRecord changes.', id: 'Otomatis menulis baris audit JSONB sebelum/sesudah pada perubahan ActiveRecord.' } },
    ],
  },
  {
    id: 'saveExam',
    title: { en: 'Save examination button', id: 'Tombol Simpan Pemeriksaan' },
    what: {
      en: 'Persists clinical notes to `PUT /transaction/pemeriksaan/{kunjunganId}`, rejecting edits with `409 Conflict` if the visit is already validated by cashier or cancelled.',
      id: 'Menyimpan catatan klinis ke `PUT /transaction/pemeriksaan/{kunjunganId}`, menolak perubahan dengan `409 Conflict` bila kunjungan sudah divalidasi kasir atau dibatalkan.',
    },
    why: {
      en: 'Enforcing the `is_valid` check inside Yii services ensures even direct API calls cannot alter clinical records after billing lock.',
      id: 'Menegakkan pengecekan `is_valid` di dalam service Yii memastikan panggilan API langsung pun tidak dapat mengubah rekam klinis setelah dikunci kasir.',
    },
    component: 'PemeriksaanPage (Submit Button)',
    focus: 'simrs-d3-d4-billing',
    files: [
      { path: `${Y}/modules/transaction/pemeriksaan/PemeriksaanController.php`, role: { en: 'Maps `PUT /transaction/pemeriksaan/{id}` with `AccessFilter` (`pemeriksaan:update`).', id: 'Memetakan `PUT /transaction/pemeriksaan/{id}` dengan `AccessFilter` (`pemeriksaan:update`).' } },
      { path: `${Y}/modules/transaction/pembayaran/ValidasiKunjunganService.php`, role: { en: 'Guards clinical mutations against validated or completed visits.', id: 'Melindungi mutasi klinis terhadap kunjungan yang sudah valid atau selesai.' } },
    ],
  },
  {
    id: 'userBadge',
    title: { en: 'Signed-in staff identity & logout', id: 'Identitas petugas aktif & keluar' },
    what: {
      en: 'Sidebar footer showing the active account name and role (`dr. Budi Santoso · Dokter` or `Rina Pendaftaran · Petugas Pendaftaran`) plus the `Keluar` button.',
      id: 'Footer sidebar yang menampilkan nama dan role akun aktif (`dr. Budi Santoso · Dokter` atau `Rina Pendaftaran · Petugas Pendaftaran`) beserta tombol `Keluar`.',
    },
    why: {
      en: 'Logout clears both the auth token in `useAuthStore` and the user\'s scoped `sessionStorage` chatbot history (`simrs.chatbot.v1.<userId>`), preventing shared clinic workstations from leaking another staff member\'s queries.',
      id: 'Logout membersihkan token di `useAuthStore` sekaligus riwayat chatbot `sessionStorage` milik user tersebut (`simrs.chatbot.v1.<userId>`), mencegah komputer klinik bersama membocorkan pencarian petugas lain.',
    },
    component: 'AppSidebar (SidebarFooter)',
    focus: 'simrs-auth-rbac',
    files: [
      { path: `${F}/components/layout/AppSidebar.tsx`, role: { en: 'Displays active user name, role, and logout trigger.', id: 'Menampilkan nama user aktif, role, dan tombol keluar.' } },
      { path: `${F}/modules/chatbot/chatbot.storage.ts`, role: { en: 'Clears per-user `sessionStorage` chat state on logout.', id: 'Membersihkan state chat `sessionStorage` per user saat logout.' } },
    ],
  },
  {
    id: 'sidebarMenus',
    title: { en: '8 Master Data entities', id: '8 entitas Master Data' },
    what: {
      en: 'Sidebar menu list under Master Data: Pasien, Dokter, Poli, Jadwal Praktik, Tindakan & Tarif, Obat & Stok, Pemeriksaan Lab, and ICD-10.',
      id: 'Daftar menu di bawah Master Data: Pasien, Dokter, Poli, Jadwal Praktik, Tindakan & Tarif, Obat & Stok, Pemeriksaan Lab, dan ICD-10.',
    },
    why: {
      en: 'Every master table uses soft delete in `backend-yii` (`CrudService.php`) so retiring a drug, procedure, or doctor never breaks foreign keys on historical visits or invoices.',
      id: 'Setiap tabel master memakai soft delete di `backend-yii` (`CrudService.php`) sehingga menonaktifkan obat, tindakan, atau dokter tidak pernah merusak foreign key pada kunjungan atau invoice lampau.',
    },
    component: 'AppSidebar (Master Data group)',
    focus: 'simrs-yii-vs-node',
    files: [
      { path: `${Y}/common/CrudService.php`, role: { en: 'Shared CRUD + soft-delete base used by master services.', id: 'Dasar CRUD + soft-delete bersama yang dipakai service master.' } },
      { path: `${Y}/modules/master/Module.php`, role: { en: 'Registers all 8 master-data controllers.', id: 'Mendaftarkan seluruh 8 controller master data.' } },
    ],
  },
  {
    id: 'addDrugBtn',
    title: { en: 'Add drug modal trigger', id: 'Tombol Tambah Obat' },
    what: {
      en: 'Opens `ObatForm` dialog to create a new drug in `m_obat` with unique code, unit (`tablet`, `kapsul`, `sachet`), unit price, and initial stock.',
      id: 'Membuka dialog `ObatForm` untuk menambah obat baru di `m_obat` dengan kode unik, satuan (`tablet`, `kapsul`, `sachet`), harga satuan, dan stok awal.',
    },
    why: {
      en: 'Only rendered when `can(\'master-obat\', \'create\')` is true; backend `AccessFilter` independently enforces `master-obat:create`.',
      id: 'Hanya dirender saat `can(\'master-obat\', \'create\')` bernilai true; `AccessFilter` backend tetap menegakkan `master-obat:create` secara independen.',
    },
    component: 'ObatPage (+ Tambah Obat)',
    files: [
      { path: `${F}/modules/master/obat/ObatPage.tsx`, role: { en: 'Gates button visibility on `can(\'master-obat\', \'create\')` and opens `ObatForm`.', id: 'Membatasi visibilitas tombol pada `can(\'master-obat\', \'create\')` dan membuka `ObatForm`.' } },
      { path: `${F}/modules/master/obat/ObatForm.tsx`, role: { en: 'Validated form dialog for creating/editing drugs.', id: 'Dialog form tervalidasi untuk membuat/mengubah obat.' } },
    ],
  },
  {
    id: 'drugTable',
    title: { en: 'Drug catalog & live stock table', id: 'Tabel katalog obat & stok aktif' },
    what: {
      en: 'Displays the 10 seeded drugs (`m_obat`) with code (`OBT004` Amlodipine 5mg, `OBT001` Paracetamol 500mg), unit price, live stock count, and active badge.',
      id: 'Menampilkan 10 obat hasil seed (`m_obat`) beserta kode (`OBT004` Amlodipine 5mg, `OBT001` Paracetamol 500mg), harga satuan, jumlah stok aktif, dan badge status.',
    },
    why: {
      en: 'PostgreSQL enforces `CHECK (stok >= 0)` on `m_obat`, while `FarmasiService::serahkan()` deducts stock with ordered conditional updates (`WHERE stok >= :qty RETURNING stok`) so stock can never drift negative under concurrency (D.2).',
      id: 'PostgreSQL menegakkan `CHECK (stok >= 0)` pada `m_obat`, sementara `FarmasiService::serahkan()` mengurangi stok lewat update bersyarat terurut (`WHERE stok >= :qty RETURNING stok`) agar stok tidak pernah minus saat konkurensi (D.2).',
    },
    component: 'ObatPage (AppDataTable)',
    focus: 'simrs-d2-pharmacy-stock',
    examples: [
      {
        file: 'evidence/konkurensi-stok-obat.txt',
        value: '[D.2 Dua Resep] status = [200, 409], stok akhir = 0, mutasi keluar = 1\n[D.2 Resep Sama] sukses = 1, stok akhir = 8',
      },
    ],
    files: [
      {
        path: `${Y}/modules/transaction/resep/FarmasiService.php`,
        role: { en: 'Deducts drug stock atomically in `obat_id ASC` order to prevent deadlocks and negative stock.', id: 'Mengurangi stok obat secara atomik dalam urutan `obat_id ASC` untuk mencegah deadlock dan stok minus.' },
        lang: 'php',
        code: `$details = ResepDetail::find()->with('obat')->where(['resep_id' => $resep->id])->orderBy(['obat_id' => SORT_ASC])->all();\nforeach ($details as $detail) {\n    $stokSesudah = $db->createCommand(\n        'UPDATE m_obat SET stok = stok - :qty, updated_at = CURRENT_TIMESTAMP, updated_by = :user\n         WHERE id = :id AND stok >= :qty RETURNING stok',\n        [':qty' => $detail->jumlah, ':user' => $userId, ':id' => $detail->obat_id]\n    )->queryScalar();`,
      },
    ],
  },
  {
    id: 'stockActions',
    title: { en: 'Stock adjustment & mutation ledger', id: 'Penyesuaian stok & riwayat mutasi' },
    what: {
      en: 'Row actions to adjust inventory (`Sesuaikan Stok`), inspect the full `t_stok_mutasi` audit ledger (`Riwayat Mutasi`), edit drug metadata, or soft-delete.',
      id: 'Aksi per baris untuk menyesuaikan stok (`Sesuaikan Stok`), meninjau buku besar audit `t_stok_mutasi` (`Riwayat Mutasi`), mengubah metadata obat, atau soft-delete.',
    },
    why: {
      en: 'Every change to `m_obat.stok`—whether manual restock or pharmacy dispensing—writes an append-only row (`stok_sebelum`, `stok_sesudah`, `referensi`) to `t_stok_mutasi`, guarded by `CHECK (stok_sesudah >= 0)`.',
      id: 'Setiap perubahan `m_obat.stok`—baik restock manual maupun penyerahan farmasi—menulis baris append-only (`stok_sebelum`, `stok_sesudah`, `referensi`) ke `t_stok_mutasi`, dijaga `CHECK (stok_sesudah >= 0)`.',
    },
    component: 'StokAdjustDialog + StokMutasiDialog',
    focus: 'simrs-d2-pharmacy-stock',
    files: [
      { path: `${F}/modules/master/obat/StokAdjustDialog.tsx`, role: { en: 'Modal for manual stock in/out adjustment with reason.', id: 'Modal penyesuaian stok masuk/keluar manual beserta keterangan.' } },
      { path: `${F}/modules/master/obat/StokMutasiDialog.tsx`, role: { en: 'Displays immutable `t_stok_mutasi` history for one drug.', id: 'Menampilkan riwayat `t_stok_mutasi` yang tak dapat diubah untuk satu obat.' } },
      { path: `${Y}/modules/master/obat/ObatService.php`, role: { en: 'Wraps stock adjustment and mutation ledger insert in one DB transaction.', id: 'Membungkus penyesuaian stok dan insert buku besar mutasi dalam satu transaksi DB.' } },
    ],
  },
  {
    id: 'billingTabs',
    title: { en: 'Three billing views', id: 'Tiga tampilan billing' },
    what: {
      en: 'Switches between `Daftar Tagihan` (issued invoices), `Belum Ditagih` (visits awaiting invoice creation), and `Riwayat Pembayaran` (cash & non-cash receipts).',
      id: 'Berpindah antara `Daftar Tagihan` (invoice terbit), `Belum Ditagih` (kunjungan menunggu pembuatan invoice), dan `Riwayat Pembayaran` (penerimaan tunai & non-tunai).',
    },
    why: {
      en: 'Separating unbilled visits from issued invoices lets cashiers review clinical completeness warnings (`GET /transaction/invoice/peringatan`) before locking a visit into an invoice.',
      id: 'Memisahkan kunjungan belum ditagih dari invoice terbit memungkinkan kasir meninjau peringatan kelengkapan klinis (`GET /transaction/invoice/peringatan`) sebelum mengunci kunjungan ke invoice.',
    },
    component: 'BillingPage (Tabs)',
    focus: 'simrs-d3-d4-billing',
    files: [
      { path: `${F}/modules/transaction/pembayaran/BillingPage.tsx`, role: { en: 'Coordinates invoice list, unbilled visits, and payment history tabs.', id: 'Mengelola tab daftar tagihan, belum ditagih, dan riwayat pembayaran.' } },
    ],
  },
  {
    id: 'invoiceTable',
    title: { en: 'Outpatient invoice ledger', id: 'Daftar tagihan rawat jalan' },
    what: {
      en: 'Lists invoices with total billed, already paid, remaining balance (`Sisa Tagihan`), status, and actions (`Detail`, `Cetak`, `Valid`, `Bayar`).',
      id: 'Menampilkan daftar invoice beserta total tagihan, sudah dibayar, sisa tagihan, status, dan tombol aksi (`Detail`, `Cetak`, `Valid`, `Bayar`).',
    },
    why: {
      en: 'Notice `INV202611240003` (Rp 215.000, `Lunas`) stays visible here even though its visit is now `selesai` and removed from clinical/pharmacy/lab worklists.',
      id: 'Perhatikan `INV202611240003` (Rp 215.000, `Lunas`) tetap tampil di sini walaupun kunjungannya sudah `selesai` dan keluar dari worklist klinis/farmasi/lab.',
    },
    component: 'BillingPage (AppDataTable)',
    focus: 'simrs-d3-d4-billing',
    examples: [
      { file: 'B7-billing.png', value: 'INV202611240003 · Adi Kusuma (RM000041) · Rp 215.000 · Lunas · Valid (terkunci)\nINV202611240002 · Joko Santoso (RM000010) · Rp 305.000 · Belum Dibayar · Belum valid' },
    ],
    files: [
      { path: `${Y}/modules/transaction/pembayaran/InvoiceService.php`, role: { en: 'Aggregates registration, procedure, lab, and drug items into `t_invoice`.', id: 'Menghimpun item pendaftaran, tindakan, lab, dan obat menjadi `t_invoice`.' } },
      { path: `${Y}/modules/transaction/pembayaran/BillingSyncService.php`, role: { en: 'Voids changed items (`is_void = true`, `alasan_void`) and recalculates total safely.', id: 'Menandai void item berubah (`is_void = true`, `alasan_void`) dan menghitung ulang total dengan aman.' } },
    ],
  },
  {
    id: 'validasiStatus',
    title: { en: 'Payment & validation lock status', id: 'Status pembayaran & kunci validasi' },
    what: {
      en: 'Pairs invoice payment status (`Lunas` / `Sebagian` / `Belum Dibayar`) with visit lock status (`Valid (terkunci)` vs `Belum valid`).',
      id: 'Memasangkan status pembayaran invoice (`Lunas` / `Sebagian` / `Belum Dibayar`) dengan status kunci kunjungan (`Valid (terkunci)` vs `Belum valid`).',
    },
    why: {
      en: 'Once an invoice is `Lunas`, `ValidasiKunjunganService::selesaikanKarenaLunas()` permanently locks the visit as `selesai`, preventing retroactive clinical edits or Unvalid calls (`409`).',
      id: 'Begitu invoice `Lunas`, `ValidasiKunjunganService::selesaikanKarenaLunas()` mengunci kunjungan secara permanen sebagai `selesai`, mencegah edit klinis retroaktif atau Unvalid (`409`).',
    },
    component: 'BillingPage (status badges)',
    focus: 'simrs-d3-d4-billing',
    examples: [
      { file: 'evidence/konkurensi-pembayaran.txt', value: '[D.4 Validasi] batal tindakan saat valid = 409, setelah Unvalid dibuka\n[D.4 Lunas] status kunjungan = selesai, diagnosis = 409, unvalid = 409' },
    ],
    files: [
      { path: `${Y}/modules/transaction/pembayaran/ValidasiKunjunganService.php`, role: { en: 'Manages Valid/Unvalid state, cashier warnings, and permanent `selesai` transition.', id: 'Mengelola status Valid/Unvalid, peringatan kasir, dan transisi permanen ke `selesai`.' } },
    ],
  },
  {
    id: 'validasiButton',
    title: { en: 'Cashier Valid / Unvalid toggle (D.4)', id: 'Tombol Valid / Unvalid kasir (D.4)' },
    what: {
      en: 'Locks (`Valid`) or temporarily unlocks (`Unvalid`) a visit for clinical revisions before full settlement, showing red warnings if labs or prescriptions are still pending.',
      id: 'Mengunci (`Valid`) atau membuka sementara (`Unvalid`) kunjungan untuk revisi klinis sebelum lunas, sambil menampilkan peringatan merah bila lab atau resep belum tuntas.',
    },
    why: {
      en: 'Gives hospitals a controlled audit workflow: doctors can only revise an invoiced visit when the cashier explicitly unlocks it, and `BillingSyncService` voids replaced lines with `alasan_void` and JSONB audit logs.',
      id: 'Memberi rumah sakit alur audit terkontrol: dokter hanya bisa merevisi kunjungan ber-invoice bila kasir membukanya secara eksplisit, dan `BillingSyncService` menandai void baris lama dengan `alasan_void` serta audit log JSONB.',
    },
    component: 'ValidasiDialog + BillingPage',
    focus: 'simrs-d3-d4-billing',
    files: [
      {
        path: `${Y}/modules/transaction/pembayaran/BillingSyncService.php`,
        role: { en: 'Diffs active `t_invoice_item` rows by `(sumber, referensi_id)` and voids stale entries.', id: 'Membandingkan baris `t_invoice_item` aktif berdasarkan `(sumber, referensi_id)` dan mem-void entri usang.' },
        lang: 'php',
        code: `$aktifList = InvoiceItem::find()\n    ->where(['invoice_id' => $invoiceId, 'is_void' => false])\n    ->orderBy(['id' => SORT_ASC])\n    ->all();\n\n$aktifMap = [];\nforeach ($aktifList as $item) {\n    $aktifMap[$item->sumber . ':' . $item->referensi_id] = $item;\n}`,
      },
      { path: `${F}/modules/transaction/pembayaran/ValidasiDialog.tsx`, role: { en: 'Shows pending lab/pharmacy/exam warnings before confirming Valid.', id: 'Menampilkan peringatan lab/farmasi/pemeriksaan tertunda sebelum konfirmasi Valid.' } },
    ],
  },
  {
    id: 'payButton',
    title: { en: 'Pay button & UUID `Idempotency-Key` (D.3)', id: 'Tombol Bayar & UUID `Idempotency-Key` (D.3)' },
    what: {
      en: 'Opens `BayarDialog` for partial or full cash/non-cash payment and generates one fresh UUID `Idempotency-Key` per dialog session.',
      id: 'Membuka `BayarDialog` untuk pembayaran tunai/non-tunai bertahap atau lunas sekaligus membuat satu UUID `Idempotency-Key` baru per sesi dialog.',
    },
    why: {
      en: 'If a network timeout causes the cashier to retry, the exact same `Idempotency-Key` is sent. `PembayaranService` locks `t_invoice FOR UPDATE`, re-checks the key after the lock, and returns the winning payment (`200`) instead of double-charging.',
      id: 'Bila timeout jaringan membuat kasir mengulang, `Idempotency-Key` yang persis sama dikirim ulang. `PembayaranService` mengunci `t_invoice FOR UPDATE`, mengecek ulang key setelah lock, lalu mengembalikan pembayaran pemenang (`200`) tanpa menagih dua kali.',
    },
    component: 'BillingPage + BayarDialog',
    focus: 'simrs-d3-d4-billing',
    examples: [
      {
        file: 'evidence/konkurensi-pembayaran.txt',
        value: '[D.3 Idempotency Paralel] status = [200, 200, 200, 200, 201], unik no_pembayaran = 1, total_bayar = 40000\n[D.3 Race Sisa Tagihan] status = [201, 409, 409, 409, 409], total_bayar = 100000, status_invoice = lunas',
      },
    ],
    files: [
      {
        path: `${F}/modules/transaction/pembayaran/BillingPage.tsx`,
        role: { en: 'Generates one `Idempotency-Key` when opening `BayarDialog`.', id: 'Membuat satu `Idempotency-Key` saat membuka `BayarDialog`.' },
        lang: 'tsx',
        code: `const bukaBayar = (inv: Invoice) => {\n  setPayInvoice(inv);\n  setIdempotencyKey(pembayaranApi.buatIdempotencyKey());\n  setPayOpen(true);\n};`,
      },
      {
        path: `${Y}/modules/transaction/pembayaran/PembayaranService.php`,
        role: { en: 'Re-checks `idempotency_key` after `t_invoice FOR UPDATE` lock and blocks overpayment.', id: 'Mengecek ulang `idempotency_key` setelah lock `t_invoice FOR UPDATE` dan menolak overpayment.' },
        lang: 'php',
        code: `if (($lama = Pembayaran::findOne(['idempotency_key' => $key])) !== null) {\n    $tx->rollBack();\n\n    return $this->hasilIdempoten($lama, $validated);\n}`,
      },
    ],
  },
  {
    id: 'printToolbar',
    title: { en: 'Invoice export & print toolbar', id: 'Toolbar ekspor & cetak invoice' },
    what: {
      en: 'Provides quick navigation back to Billing, structured PDF download (`Export PDF`), and browser print (`Cetak`). Hidden automatically in `@media print`.',
      id: 'Menyediakan navigasi balik ke Billing, unduhan PDF terstruktur (`Export PDF`), dan cetak browser (`Cetak`). Otomatis tersembunyi di `@media print`.',
    },
    why: {
      en: 'Generating PDFs on the client via `export-pdf.ts` keeps `backend-yii` free of heavy headless-browser rendering overhead while still giving cashiers an archival file.',
      id: 'Membuat PDF di klien lewat `export-pdf.ts` membebaskan `backend-yii` dari beban rendering headless browser sambil tetap memberi kasir file arsip.',
    },
    component: 'InvoicePrintPage (toolbar)',
    focus: 'simrs-frontend-ux',
    files: [
      { path: `${F}/modules/transaction/pembayaran/InvoicePrintPage.tsx`, role: { en: 'Wires `exportInvoicePdf()` and `window.print()`.', id: 'Menyambungkan `exportInvoicePdf()` dan `window.print()`.' } },
      { path: `${F}/lib/export-pdf.ts`, role: { en: 'Builds formatted outpatient invoice, receipt, and dashboard PDFs.', id: 'Membangun PDF invoice rawat jalan, bukti bayar, dan laporan dashboard.' } },
    ],
  },
  {
    id: 'invoiceSheet',
    title: { en: 'Printable outpatient invoice', id: 'Lembar invoice rawat jalan cetak' },
    what: {
      en: 'A4-styled official outpatient bill (`INV202610260001`, `Lunas`) with hospital header, masked patient identity, itemized charges, payment receipts, and dual signature lines.',
      id: 'Tagihan rawat jalan resmi bergaya A4 (`INV202610260001`, `Lunas`) dengan kop rumah sakit, identitas pasien tersamar, rincian biaya, riwayat pembayaran, dan garis tanda tangan ganda.',
    },
    why: {
      en: 'Reusing the same React sheet for screen preview and `@media print` guarantees what the cashier verifies on screen matches the printed paper copy.',
      id: 'Memakai lembar React yang sama untuk pratinjau layar dan `@media print` menjamin apa yang diverifikasi kasir di layar persis sama dengan cetakan kertas.',
    },
    component: 'InvoicePrintPage (sheet)',
    files: [
      { path: `${F}/modules/transaction/pembayaran/InvoicePrintPage.tsx`, role: { en: 'Renders the print-ready invoice document.', id: 'Merender dokumen invoice siap cetak.' } },
      { path: `${F}/modules/transaction/pembayaran/BuktiBayarPrintPage.tsx`, role: { en: 'Companion printable payment receipt per `PAY...` transaction.', id: 'Halaman cetak bukti bayar pendamping untuk tiap transaksi `PAY...`.' } },
    ],
  },
  {
    id: 'patientMask',
    title: { en: 'Masked patient PII block', id: 'Blok identitas pasien dengan masking NIK' },
    what: {
      en: 'Displays `No. RM`, `Pasien`, `No. Kunjungan`, `Tanggal`, `Poli & Dokter`, and partially masked NIK (`327301******0001`).',
      id: 'Menampilkan `No. RM`, `Pasien`, `No. Kunjungan`, `Tanggal`, `Poli & Dokter`, serta NIK yang disamarkan sebagian (`327301******0001`).',
    },
    why: {
      en: 'Printed receipts leave the hospital in patients\' hands; masking middle NIK digits reduces identity-theft exposure while keeping prefix and suffix recognizable for verification.',
      id: 'Kwitansi cetak dibawa keluar rumah sakit oleh pasien; menyamarkan digit tengah NIK mengurangi risiko penyalahgunaan identitas sambil tetap bisa diverifikasi lewat awalan dan akhiran.',
    },
    component: 'InvoicePrintPage (patient metadata)',
    examples: [
      { file: 'B7-invoice-cetak.png', value: 'RM000001 · Adi Santoso · NIK 327301******0001 · Poli Umum / dr. Budi Santoso' },
    ],
    files: [
      { path: `${F}/modules/transaction/pembayaran/InvoicePrintPage.tsx`, role: { en: 'Formats patient info and masked NIK on the invoice.', id: 'Memformat informasi pasien dan NIK tersamar pada invoice.' } },
      { path: `${F}/lib/format.ts`, role: { en: 'Shared Rupiah, date, and masking formatters.', id: 'Formatter bersama untuk Rupiah, tanggal, dan masking.' } },
    ],
  },
  {
    id: 'costBreakdown',
    title: { en: '4-source itemized cost breakdown', id: 'Rincian biaya dari 4 sumber' },
    what: {
      en: 'Lists active (`is_void = false`) invoice items grouped by source (`Pendaftaran`, `Tindakan`, `Obat`, and `Laboratorium` when ordered) with snapshotted quantity, unit price, and subtotal.',
      id: 'Mendaftar item invoice aktif (`is_void = false`) berdasarkan sumber (`Pendaftaran`, `Tindakan`, `Obat`, serta `Laboratorium` bila ada) lengkap dengan jumlah, harga snapshot, dan subtotal.',
    },
    why: {
      en: 'Prices come from transaction snapshots locked at clinical order time, so this invoice always stays Rp 87.000 even if `Paracetamol 500mg` changes price later in Master Obat.',
      id: 'Harga berasal dari snapshot transaksi yang dikunci saat order klinis, sehingga invoice ini selalu tetap Rp 87.000 meski harga `Paracetamol 500mg` berubah nanti di Master Obat.',
    },
    component: 'InvoicePrintPage (items table)',
    focus: 'simrs-clinical-flow',
    examples: [
      { file: 'B7-invoice-cetak.png', value: 'Pendaftaran Rp 25.000 + Tindakan Rp 50.000 + Obat (8 × Rp 1.500) Rp 12.000 = Rp 87.000 (Sisa Rp 0)' },
    ],
    files: [
      { path: `${Y}/modules/transaction/pembayaran/InvoiceService.php`, role: { en: 'Builds `t_invoice_item` rows from all 4 outpatient cost sources.', id: 'Menyusun baris `t_invoice_item` dari keempat sumber biaya rawat jalan.' } },
    ],
  },
  {
    id: 'paymentHistory',
    title: { en: 'Recorded payment receipts', id: 'Riwayat pembayaran tercatat' },
    what: {
      en: 'Lists every settled payment transaction (`PAY202610260001`), timestamp, payment method (`Tunai` / `Non-Tunai`), reference number, cashier name (`Sari Kasir`), and amount.',
      id: 'Menampilkan setiap transaksi pembayaran tercatat (`PAY202610260001`), waktu bayar, metode (`Tunai` / `Non-Tunai`), nomor referensi, nama kasir (`Sari Kasir`), dan nominal.',
    },
    why: {
      en: 'Supporting multiple rows in `t_pembayaran` per invoice allows partial/split payments (e.g. cash + transfer) while keeping every receipt traceable to a specific cashier.',
      id: 'Mendukung banyak baris `t_pembayaran` per invoice memungkinkan pembayaran bertahap/gabungan (misal tunai + transfer) sambil menjaga setiap penerimaan terlacak ke kasir tertentu.',
    },
    component: 'InvoicePrintPage (payment history)',
    focus: 'simrs-d3-d4-billing',
    files: [
      { path: `${Y}/modules/transaction/pembayaran/Pembayaran.php`, role: { en: 'ActiveRecord model for `t_pembayaran` with unique `idempotency_key`.', id: 'Model ActiveRecord untuk `t_pembayaran` dengan `idempotency_key` unik.' } },
    ],
  },
  {
    id: 'exportButtons',
    title: { en: 'Dashboard PDF & Excel export', id: 'Ekspor PDF & Excel dashboard' },
    what: {
      en: 'Exports the currently filtered operational and financial dashboard period to formatted PDF (`export-pdf.ts`) or multi-sheet Excel (`export-excel.ts`).',
      id: 'Mengekspor periode dashboard operasional dan keuangan yang sedang difilter ke PDF terformat (`export-pdf.ts`) atau Excel multi-sheet (`export-excel.ts`).',
    },
    why: {
      en: 'Hospital management often attaches period summaries to monthly reports. Respecting the `dashboard-keuangan` permission ensures non-finance exports omit revenue sheets.',
      id: 'Manajemen rumah sakit sering melampirkan ringkasan periode ke laporan bulanan. Menghormati izin `dashboard-keuangan` memastikan ekspor non-keuangan tidak menyertakan lembar pendapatan.',
    },
    component: 'DashboardPage (export actions)',
    focus: 'simrs-frontend-ux',
    files: [
      { path: `${F}/lib/export-pdf.ts`, role: { en: 'Generates summary PDF report.', id: 'Menghasilkan laporan PDF ringkasan.' } },
      { path: `${F}/lib/export-excel.ts`, role: { en: 'Generates downloadable Excel workbook.', id: 'Menghasilkan workbook Excel siap unduh.' } },
    ],
  },
  {
    id: 'dashboardFilters',
    title: { en: 'Sargable period & dimension filters', id: 'Filter periode & dimensi sargable' },
    what: {
      en: 'Date range (`Dari Tanggal`–`Sampai Tanggal`), doctor selector, guarantor selector, `Terapkan` button, and quick presets (`Hari Ini`, `7 Hari`, `30 Hari`, `Bulan Ini`).',
      id: 'Rentang tanggal (`Dari Tanggal`–`Sampai Tanggal`), pemilih dokter, pemilih penjamin, tombol `Terapkan`, dan preset cepat (`Hari Ini`, `7 Hari`, `30 Hari`, `Bulan Ini`).',
    },
    why: {
      en: 'Query parameters flow into `service-node` SQL using half-open sargable intervals (`>= $1::date AND < ($2::date + INTERVAL \'1 day\')`), letting PostgreSQL use B-tree indexes instead of sequential scans.',
      id: 'Parameter query mengalir ke SQL `service-node` memakai interval half-open yang sargable (`>= $1::date AND < ($2::date + INTERVAL \'1 day\')`), memungkinkan PostgreSQL memakai B-tree index alih-alih sequential scan.',
    },
    component: 'DashboardPage (filter card)',
    focus: 'simrs-d6-performance',
    files: [
      { path: `${N}/modules/dashboard/dashboard.service.ts`, role: { en: 'Runs 7 sargable read-only analytical queries via `readDb()`.', id: 'Menjalankan 7 query analitik read-only sargable lewat `readDb()`.' } },
      { path: `${Y}/migrations/m261122_010000_create_dashboard_indexes.php`, role: { en: 'Creates 6 composite & partial indexes powering these filters.', id: 'Membuat 6 index komposit & parsial yang menggerakkan filter ini.' } },
    ],
  },
  {
    id: 'kpiGrid',
    title: { en: '4 read-only KPI summary cards', id: '4 kartu ringkasan KPI read-only' },
    what: {
      en: 'Shows `Total Kunjungan` (61), `Total Tindakan` (73), `Pendapatan Diterima` (Rp 9.943.500 out of Rp 11.245.000 billed), and `Status Invoice` (50 Lunas · 5 Sebagian · 5 Belum dibayar).',
      id: 'Menampilkan `Total Kunjungan` (61), `Total Tindakan` (73), `Pendapatan Diterima` (Rp 9.943.500 dari total tagihan Rp 11.245.000), dan `Status Invoice` (50 Lunas · 5 Sebagian · 5 Belum dibayar).',
    },
    why: {
      en: 'Served by `service-node` over `readDb()` (`simrs_readonly`), isolating reporting load from `backend-yii` while making accidental writes structurally impossible at the PostgreSQL role level.',
      id: 'Dilayani `service-node` lewat `readDb()` (`simrs_readonly`), mengisolasi beban laporan dari `backend-yii` sambil membuat penulisan tidak sengaja mustahil di level role PostgreSQL.',
    },
    component: 'DashboardPage (KPI cards)',
    focus: 'simrs-yii-vs-node',
    examples: [
      { file: 'D-dashboard.png', value: 'Total Kunjungan: 61 · Total Tindakan: 73 · Pendapatan Diterima: Rp 9.943.500 (Tagihan Rp 11.245.000) · Invoice: 50 Lunas / 5 Sebagian / 5 Belum dibayar' },
    ],
    files: [
      {
        path: `${N}/lib/db.ts`,
        role: { en: 'Separate connection pool authenticated as PostgreSQL role `simrs_readonly`.', id: 'Connection pool terpisah yang diautentikasi sebagai role PostgreSQL `simrs_readonly`.' },
        lang: 'ts',
        code: `export function readDb(): pg.Pool {\n  readOnlyPool ??= new pg.Pool({\n    host: process.env.DB_HOST ?? 'localhost',\n    port: Number(process.env.DB_PORT ?? 5432),\n    database: process.env.DB_NAME,\n    user: process.env.DB_READONLY_USER || process.env.DB_USER,\n    password: process.env.DB_READONLY_PASSWORD || process.env.DB_PASSWORD,\n    max: parsePoolMax(process.env.DB_READONLY_POOL_MAX, 20),\n  });\n  return readOnlyPool;\n}`,
      },
      { path: 'database/init/02-create-readonly-user.sql', role: { en: 'Grants `SELECT`-only privileges to `simrs_readonly`.', id: 'Memberikan hak khusus `SELECT` kepada `simrs_readonly`.' } },
    ],
  },
  {
    id: 'revenueTrend',
    title: { en: 'Daily cash receipt trend (`dashboard-keuangan`)', id: 'Tren penerimaan harian (`dashboard-keuangan`)' },
    what: {
      en: 'Line chart of daily received cash (`Rp 9.943.500`, 58 transactions) plus payment method breakdown (`Non-Tunai 27x Rp 5.736.750`, `Tunai 31x Rp 4.206.750`).',
      id: 'Grafik garis kas diterima harian (`Rp 9.943.500`, 58 transaksi) ditambah pecahan metode bayar (`Non-Tunai 27x Rp 5.736.750`, `Tunai 31x Rp 4.206.750`).',
    },
    why: {
      en: 'Guarded by the separate `dashboard-keuangan` permission in both `DashboardPage.tsx` (skips the request) and `service-node` (`403`), and accelerated by `idx_t_pembayaran_dibayar_at` (Q3 10.8× faster in `docs/performance.md`).',
      id: 'Dilindungi izin terpisah `dashboard-keuangan` baik di `DashboardPage.tsx` (melewati request) maupun `service-node` (`403`), serta dipercepat oleh `idx_t_pembayaran_dibayar_at` (Q3 10,8× lebih cepat di `docs/performance.md`).',
    },
    component: 'DashboardCharts (Tren Penerimaan)',
    focus: 'simrs-d6-performance',
    files: [
      {
        path: `${F}/modules/dashboard/DashboardPage.tsx`,
        role: { en: 'Fetches financial endpoints only when the role holds `dashboard-keuangan`.', id: 'Memanggil endpoint keuangan hanya bila role memiliki `dashboard-keuangan`.' },
        lang: 'tsx',
        code: `const [s, p, tn, pd, ob, pb] = await Promise.all([\n  dashboardApi.getSummary(periode),\n  dashboardApi.getKunjunganPerPoli(periode),\n  dashboardApi.getTindakan(periode),\n  keuangan ? dashboardApi.getPendapatan(periode) : Promise.resolve(null),\n  dashboardApi.getObat(periode),\n  keuangan ? dashboardApi.getPembayaran(periode) : Promise.resolve(null),\n]);`,
      },
      { path: `${F}/modules/dashboard/DashboardCharts.tsx`, role: { en: 'Renders SVG trend, bar, and donut charts.', id: 'Merender grafik tren, batang, dan donat SVG.' } },
    ],
  },
  {
    id: 'poliAndCost',
    title: { en: 'Visits per polyclinic & cost composition', id: 'Kunjungan per poli & komposisi sumber biaya' },
    what: {
      en: 'Side-by-side distribution of non-cancelled visits across the 4 polyclinics and a donut chart breaking down Rp 11,2M billed across Tindakan (61.8%), Pendaftaran (19.9%), Obat (10.0%), and Laboratorium (8.4%).',
      id: 'Distribusi berdampingan kunjungan non-batal pada 4 poliklinik dan grafik donat memecah Rp 11,2 jt tagihan ke Tindakan (61,8%), Pendaftaran (19,9%), Obat (10,0%), dan Laboratorium (8,4%).',
    },
    why: {
      en: 'Powered by `idx_t_kunjungan_tgl_poli` and partial index `idx_t_invoice_item_invoice_sumber_aktif WHERE is_void = false`, summing only active snapshots locked by Yii so voided items never pollute revenue.',
      id: 'Ditenagai `idx_t_kunjungan_tgl_poli` dan partial index `idx_t_invoice_item_invoice_sumber_aktif WHERE is_void = false`, hanya menjumlahkan snapshot aktif dari Yii agar item void tidak mencemari laporan.',
    },
    component: 'DashboardCharts (Poli + Donut)',
    focus: 'simrs-d6-performance',
    examples: [
      { file: 'D-dashboard.png', value: 'Tindakan 61.8% (Rp 6.950.000) · Pendaftaran 19.9% (Rp 2.235.000) · Obat 10.0% (Rp 1.120.000) · Laboratorium 8.4% (Rp 940.000)' },
    ],
    files: [
      { path: `${N}/modules/dashboard/dashboard.service.ts`, role: { en: 'Aggregates visits per polyclinic and non-void `t_invoice_item` by `sumber`.', id: 'Mengagregasi kunjungan per poli dan `t_invoice_item` non-void menurut `sumber`.' } },
    ],
  },
  {
    id: 'topItems',
    title: { en: 'Top procedures & top drugs charts', id: 'Grafik tindakan & obat terbanyak' },
    what: {
      en: 'Ranks the highest-frequency active medical procedures (Konsultasi Dokter Umum 19×, Tambal Gigi Komposit 18×) and top-value dispensed drugs (Oralit, Amlodipine, Ibuprofen, Paracetamol).',
      id: 'Memeringkat tindakan medis aktif tersering (Konsultasi Dokter Umum 19×, Tambal Gigi Komposit 18×) dan obat bernilai resep tertinggi (Oralit, Amlodipine, Ibuprofen, Paracetamol).',
    },
    why: {
      en: 'Uses `idx_t_tindakan_kunjungan_status` and `idx_t_resep_kunjungan_status` to filter out cancelled visits and cancelled orders directly in the index.',
      id: 'Memakai `idx_t_tindakan_kunjungan_status` dan `idx_t_resep_kunjungan_status` untuk menyaring kunjungan batal dan order batal langsung di level index.',
    },
    component: 'DashboardCharts (Top Tindakan + Obat)',
    focus: 'simrs-d6-performance',
    files: [
      { path: `${N}/modules/dashboard/dashboard.routes.ts`, role: { en: 'Exposes `/api/dashboard/tindakan` and `/api/dashboard/obat`.', id: 'Menyajikan `/api/dashboard/tindakan` dan `/api/dashboard/obat`.' } },
    ],
  },
  {
    id: 'detailTable',
    title: { en: 'Paginated period detail drill-down', id: 'Tabel rincian periode berhalaman' },
    what: {
      en: 'Interactive 5-tab drill-down (`Kunjungan`, `Tindakan`, `Pendapatan`, `Obat`, `Tagihan`) showing 10 rows per page (`Halaman 1 dari 7 · 61 data`) served by `GET /api/dashboard/detail`.',
      id: 'Tabel rincian 5 tab interaktif (`Kunjungan`, `Tindakan`, `Pendapatan`, `Obat`, `Tagihan`) menampilkan 10 baris per halaman (`Halaman 1 dari 7 · 61 data`) dari `GET /api/dashboard/detail`.',
    },
    why: {
      en: 'Gives auditors row-level verification right below the KPIs without loading thousands of records at once—and hides the `Pendapatan` and `Tagihan` tabs for roles without `dashboard-keuangan`.',
      id: 'Memberi auditor verifikasi tingkat baris tepat di bawah KPI tanpa memuat ribuan baris sekaligus—serta menyembunyikan tab `Pendapatan` dan `Tagihan` bagi role tanpa `dashboard-keuangan`.',
    },
    component: 'DashboardPage (Rincian Data Periode)',
    focus: 'simrs-d6-performance',
    files: [
      { path: `${N}/modules/dashboard/dashboard.service.ts`, role: { en: 'Paginated detail query behind `GET /api/dashboard/detail`.', id: 'Query detail berhalaman di balik `GET /api/dashboard/detail`.' } },
      { path: `${F}/modules/dashboard/DashboardPage.tsx`, role: { en: 'Switches `jenis` tab and resets page to 1.', id: 'Mengganti tab `jenis` dan mereset halaman ke 1.' } },
    ],
  },
  {
    id: 'roleSelector',
    title: { en: 'Role picker for RBAC editing', id: 'Pemilih role untuk edit RBAC' },
    what: {
      en: 'Dropdown of roles from `m_role` (Administrator, Petugas Pendaftaran, Dokter, Petugas Farmasi, Petugas Laboratorium, Kasir) that loads the selected role\'s live permission matrix.',
      id: 'Dropdown daftar role dari `m_role` (Administrator, Petugas Pendaftaran, Dokter, Petugas Farmasi, Petugas Laboratorium, Kasir) yang memuat matriks izin aktif role tersebut.',
    },
    why: {
      en: 'Because roles live in PostgreSQL rather than hardcoded enums, hospitals can add new roles and immediately assign granular module permissions here.',
      id: 'Karena role tersimpan di PostgreSQL bukan enum statis, rumah sakit dapat menambah role baru dan langsung mengatur izin modul granularnya di sini.',
    },
    component: 'RoleAccessPage (select role)',
    focus: 'simrs-auth-rbac',
    files: [
      { path: `${F}/modules/system/role-access/RoleAccessPage.tsx`, role: { en: 'Fetches `m_role` list and loads `fetchRoleAccess(roleId)`.', id: 'Mengambil daftar `m_role` dan memuat `fetchRoleAccess(roleId)`.' } },
    ],
  },
  {
    id: 'saveAccess',
    title: { en: 'Save matrix button', id: 'Tombol Simpan matriks izin' },
    what: {
      en: 'Persists all 22 menu permission rows for the chosen role via `PUT /system/role-access/{roleId}` inside a single database transaction.',
      id: 'Menyimpan seluruh 22 baris izin menu untuk role terpilih lewat `PUT /system/role-access/{roleId}` di dalam satu transaksi database.',
    },
    why: {
      en: 'Because both `backend-yii` (`AccessFilter`) and `service-node` (`auth.ts`) check `m_role_access` live on every request, saved permission revocations take effect immediately without waiting for JWT expiry.',
      id: 'Karena `backend-yii` (`AccessFilter`) maupun `service-node` (`auth.ts`) membaca `m_role_access` langsung di setiap request, pencabutan izin langsung berlaku tanpa menunggu JWT kedaluwarsa.',
    },
    component: 'RoleAccessPage (Simpan button)',
    focus: 'simrs-auth-rbac',
    files: [
      { path: `${Y}/modules/system/access/RoleAccessService.php`, role: { en: 'Replaces `m_role_access` rows atomically for a role.', id: 'Memperbarui baris `m_role_access` secara atomik untuk satu role.' } },
    ],
  },
  {
    id: 'dashboardPerms',
    title: { en: 'Separated financial dashboard permission', id: 'Izin terpisah dashboard keuangan' },
    what: {
      en: 'Two distinct permission rows under Dashboard: `dashboard` (operational counts) and `dashboard-keuangan` (revenue & payment analytics).',
      id: 'Dua baris izin terpisah di bawah Dashboard: `dashboard` (angka operasional) dan `dashboard-keuangan` (analitik pendapatan & pembayaran).',
    },
    why: {
      en: 'Lets operational roles view clinic volume without exposing hospital cash receipts—enforced by both React UI conditional fetching and `service-node` RBAC middleware.',
      id: 'Memungkinkan role operasional melihat volume klinik tanpa membuka data penerimaan kas rumah sakit—ditegakkan oleh fetch bersyarat di React sekaligus middleware RBAC `service-node`.',
    },
    component: 'RoleAccessPage (Dashboard rows)',
    focus: 'simrs-auth-rbac',
    files: [
      { path: `${Y}/migrations/m261122_040000_add_dashboard_keuangan_menu.php`, role: { en: 'Seeds `dashboard-keuangan` menu into `m_menu` and `m_role_access`.', id: 'Menambahkan menu `dashboard-keuangan` ke `m_menu` dan `m_role_access`.' } },
      { path: `${N}/middleware/auth.ts`, role: { en: 'Verifies JWT HS256 and checks `dashboard` / `dashboard-keuangan` in `m_role_access`.', id: 'Memverifikasi JWT HS256 dan mengecek `dashboard` / `dashboard-keuangan` di `m_role_access`.' } },
    ],
  },
  {
    id: 'accessMatrix',
    title: { en: '22-menu × 4-action dynamic RBAC matrix', id: 'Matriks RBAC dinamis 22 menu × 4 aksi' },
    what: {
      en: 'Full matrix across all 8 modules and 22 menus with `Baca`, `Tambah`, `Ubah`, and `Hapus` checkboxes mapped 1-to-1 to `m_role_access`.',
      id: 'Matriks lengkap seluruh 8 modul dan 22 menu dengan kotak centang `Baca`, `Tambah`, `Ubah`, dan `Hapus` yang terpetakan 1-ke-1 ke `m_role_access`.',
    },
    why: {
      en: 'Yii `AccessFilter::beforeAction()` is fail-closed: any unmapped controller action throws `InvalidConfigException` rather than silently granting access.',
      id: '`AccessFilter::beforeAction()` di Yii bersifat fail-closed: setiap action controller yang lupa dipetakan melempar `InvalidConfigException`, bukan diam-diam memberi akses.',
    },
    component: 'RoleAccessPage (matrix table)',
    focus: 'simrs-auth-rbac',
    files: [
      {
        path: `${Y}/common/AccessFilter.php`,
        role: { en: 'Maps controller actions to `menu:permission` and fails closed when unmapped.', id: 'Memetakan action controller ke `menu:permission` dan fail-closed bila tak terpetakan.' },
        lang: 'php',
        code: `$permission = $this->actionPermissions[$action->id] ?? self::DEFAULT_PERMISSIONS[$action->id] ?? null;\n$menu = $this->menu;\nif (is_string($permission) && str_contains($permission, ':')) {\n    [$menu, $permission] = explode(':', $permission, 2);\n}\nif (!in_array($permission, AccessService::PERMISSIONS, true)) {\n    throw new InvalidConfigException("Action '{$action->id}' belum dipetakan ke aksi izin pada menu '{$menu}'.");\n}`,
      },
    ],
  },
  {
    id: 'forbiddenCard',
    title: { en: '403 Access Denied guard state', id: 'Tampilan 403 Akses Ditolak' },
    what: {
      en: 'Friendly blocked-access screen shown when a user navigates directly to a route outside their role\'s permissions (here `Rina Pendaftaran` opening `/billing`).',
      id: 'Layar akses diblokir ramah pengguna yang tampil saat user membuka langsung rute di luar izin role-nya (di sini `Rina Pendaftaran` membuka `/billing`).',
    },
    why: {
      en: '`PermissionGuard` protects the UI route cleanly without logging the user out, while backend `AccessFilter` (Yii) and `auth.ts` (Node) remain the real security barrier returning HTTP `403`.',
      id: '`PermissionGuard` melindungi rute UI dengan bersih tanpa memaksa logout, sementara `AccessFilter` (Yii) dan `auth.ts` (Node) di backend tetap menjadi penghalang keamanan sesungguhnya dengan HTTP `403`.',
    },
    component: 'PermissionGuard -> ForbiddenPage',
    focus: 'simrs-auth-rbac',
    files: [
      {
        path: `${F}/routes/PermissionGuard.tsx`,
        role: { en: 'Checks `useAuthStore.can(menu, action)` and renders `<ForbiddenPage />` on denial.', id: 'Mengecek `useAuthStore.can(menu, action)` dan merender `<ForbiddenPage />` saat ditolak.' },
        lang: 'tsx',
        code: `export function PermissionGuard({ menu, action = 'read', children }: Props) {\n  const allowed = useAuthStore((s) => s.can(menu, action));\n\n  return allowed ? children : <ForbiddenPage />;\n}`,
      },
      { path: `${F}/pages/ForbiddenPage.tsx`, role: { en: 'Renders the shield icon, explanation, and home return link.', id: 'Merender ikon perisai, penjelasan, dan tombol kembali ke beranda.' } },
    ],
  },
];

const simrsScreens: LabScreen[] = [
  {
    id: 'login',
    title: { en: 'Login & JWT', id: 'Login & JWT' },
    intro: {
      en: 'Single authentication entry point backed by `backend-yii` JWT HS256 (`simrs-backend`), shared with `service-node`.',
      id: 'Pintu masuk autentikasi tunggal dengan JWT HS256 dari `backend-yii` (`simrs-backend`), dipakai bersama oleh `service-node`.',
    },
    spots: [
      { part: 'loginCard', box: 'loginCard' },
      { part: 'loginFields', box: 'loginFields' },
      { part: 'loginSubmit', box: 'loginSubmit' },
      { part: 'localeToggle', box: 'localeToggle' },
    ],
    quiz: simrsQuiz.login,
  },
  {
    id: 'pendaftaran',
    title: { en: 'Registration (D.1)', id: 'Pendaftaran (D.1)' },
    intro: {
      en: 'Front-desk registration shell: role-filtered sidebar, `Ctrl+K` command search, patient picker, doctor quota lock, atomic queue generation, and zero-LLM `Bantuan` chatbot.',
      id: 'Shell pendaftaran loket: sidebar terfilter role, pencarian `Ctrl+K`, pemilih pasien, penguncian kuota dokter, nomor antrean atomik, dan chatbot `Bantuan` tanpa LLM.',
    },
    spots: [
      { part: 'sidebar', box: 'sidebar' },
      { part: 'moduleSwitcher', box: 'moduleSwitcher' },
      { part: 'commandSearch', box: 'commandSearch' },
      { part: 'headerControls', box: 'headerControls' },
      { part: 'patientPicker', box: 'patientPicker' },
      { part: 'scheduleForm', box: 'scheduleForm' },
      { part: 'registerSubmit', box: 'registerSubmit' },
      { part: 'chatbotTrigger', box: 'chatbotTrigger' },
    ],
    quiz: simrsQuiz.pendaftaran,
  },
  {
    id: 'antrean',
    title: { en: 'Polyclinic Queue', id: 'Antrean Poli' },
    intro: {
      en: 'Live daily queue (`U-001`, `RJ202611240001`) powered by `ListQuery` server pagination, voice-enabled TV display launcher, and controlled status transitions.',
      id: 'Antrean harian live (`U-001`, `RJ202611240001`) dengan paginasi server `ListQuery`, peluncur layar TV bersuara, dan transisi status terkontrol.',
    },
    spots: [
      { part: 'displayButton', box: 'displayButton' },
      { part: 'filterBar', box: 'filterBar' },
      { part: 'queueTable', box: 'queueTable' },
      { part: 'queueActions', box: 'queueActions' },
      { part: 'paginator', box: 'paginator' },
    ],
    quiz: simrsQuiz.antrean,
  },
  {
    id: 'pemeriksaan',
    title: { en: 'Clinical Exam', id: 'Pemeriksaan' },
    intro: {
      en: 'Doctor charting workspace (`dr. Budi Santoso`) uniting SOAP notes, ICD-10 diagnoses, procedures, prescriptions, external-lab orders, and medical history under one visit.',
      id: 'Workspace rekam klinis dokter (`dr. Budi Santoso`) menyatukan SOAP, diagnosis ICD-10, tindakan, resep, order lab eksternal, dan riwayat medis dalam satu kunjungan.',
    },
    spots: [
      { part: 'patientHeader', box: 'patientHeader' },
      { part: 'clinicalTabs', box: 'clinicalTabs' },
      { part: 'examForm', box: 'examForm' },
      { part: 'saveExam', box: 'saveExam' },
      { part: 'userBadge', box: 'userBadge' },
    ],
    quiz: simrsQuiz.pemeriksaan,
  },
  {
    id: 'obat',
    title: { en: 'Drug Stock (D.2)', id: 'Obat & Stok (D.2)' },
    intro: {
      en: 'Master drug catalog and mutation ledger backing atomic pharmacy dispensing (`ORDER BY obat_id ASC`, conditional `WHERE stok >= :qty`, and `CHECK (stok >= 0)`).',
      id: 'Katalog master obat dan buku besar mutasi di balik penyerahan farmasi atomik (`ORDER BY obat_id ASC`, `WHERE stok >= :qty` bersyarat, dan `CHECK (stok >= 0)`).',
    },
    spots: [
      { part: 'sidebarMenus', box: 'sidebarMenus' },
      { part: 'addDrugBtn', box: 'addDrugBtn' },
      { part: 'drugTable', box: 'drugTable' },
      { part: 'stockActions', box: 'stockActions' },
    ],
    quiz: simrsQuiz.obat,
  },
  {
    id: 'billing',
    title: { en: 'Billing (D.3 & D.4)', id: 'Billing (D.3 & D.4)' },
    intro: {
      en: 'Cashier workspace contrasting a settled locked visit (`INV202611240003`, `Lunas · Valid (terkunci)`) with an unpaid bill ready for `Valid` lock and idempotent `Bayar`.',
      id: 'Workspace kasir yang memperlihatkan kontras kunjungan lunas terkunci (`INV202611240003`, `Lunas · Valid (terkunci)`) dengan tagihan belum bayar yang siap dikunci `Valid` dan dibayar idempoten.',
    },
    spots: [
      { part: 'billingTabs', box: 'billingTabs' },
      { part: 'invoiceTable', box: 'invoiceTable' },
      { part: 'validasiStatus', box: 'validasiStatus' },
      { part: 'validasiButton', box: 'validasiButton' },
      { part: 'payButton', box: 'payButton' },
    ],
    quiz: simrsQuiz.billing,
  },
  {
    id: 'invoice',
    title: { en: 'Print Invoice', id: 'Cetak Invoice' },
    intro: {
      en: 'Printable A4 outpatient invoice (`INV202610260001`) featuring client-side PDF export, masked NIK PII (`327301******0001`), snapshotted line items, and receipt history.',
      id: 'Invoice rawat jalan A4 siap cetak (`INV202610260001`) dengan ekspor PDF di klien, masking NIK (`327301******0001`), rincian item snapshot, dan riwayat pembayaran.',
    },
    spots: [
      { part: 'printToolbar', box: 'printToolbar' },
      { part: 'invoiceSheet', box: 'invoiceSheet' },
      { part: 'patientMask', box: 'patientMask' },
      { part: 'costBreakdown', box: 'costBreakdown' },
      { part: 'paymentHistory', box: 'paymentHistory' },
    ],
    quiz: simrsQuiz.invoice,
  },
  {
    id: 'dashboard',
    title: { en: 'Dashboard (D.6)', id: 'Dashboard (D.6)' },
    intro: {
      en: 'Read-only operational & financial analytics served by `service-node` over PostgreSQL role `simrs_readonly`, powered by 6 composite/partial indexes and sargable date queries.',
      id: 'Analitik operasional & keuangan read-only yang dilayani `service-node` lewat role PostgreSQL `simrs_readonly`, ditenagai 6 index komposit/parsial dan query tanggal sargable.',
    },
    spots: [
      { part: 'exportButtons', box: 'exportButtons' },
      { part: 'dashboardFilters', box: 'dashboardFilters' },
      { part: 'kpiGrid', box: 'kpiGrid' },
      { part: 'revenueTrend', box: 'revenueTrend' },
      { part: 'poliAndCost', box: 'poliAndCost' },
      { part: 'topItems', box: 'topItems' },
      { part: 'detailTable', box: 'detailTable' },
    ],
    quiz: simrsQuiz.dashboard,
  },
  {
    id: 'rbac',
    title: { en: 'RBAC Matrix', id: 'Matriks RBAC' },
    intro: {
      en: 'Dynamic role-permission editor over `m_role_access` spanning 8 modules and 22 menus, including dedicated `dashboard-keuangan` separation enforced live on both Yii2 and Node.js.',
      id: 'Editor izin role dinamis atas `m_role_access` mencakup 8 modul dan 22 menu, termasuk pemisahan `dashboard-keuangan` yang ditegakkan langsung di Yii2 maupun Node.js.',
    },
    spots: [
      { part: 'roleSelector', box: 'roleSelector' },
      { part: 'saveAccess', box: 'saveAccess' },
      { part: 'dashboardPerms', box: 'dashboardPerms' },
      { part: 'accessMatrix', box: 'accessMatrix' },
    ],
    quiz: simrsQuiz.rbac,
  },
  {
    id: 'forbidden',
    title: { en: 'RBAC Guard (403)', id: 'Guard RBAC (403)' },
    intro: {
      en: 'Defense in depth in action: `Rina Pendaftaran` directly enters `/billing` and is blocked by `PermissionGuard` in React (and `403 Forbidden` in `AccessFilter` on the API).',
      id: 'Pertahanan berlapis beraksi: `Rina Pendaftaran` mengakses langsung `/billing` lalu diblokir oleh `PermissionGuard` di React (serta `403 Forbidden` dari `AccessFilter` di API).',
    },
    spots: [
      {
        part: 'sidebar',
        box: 'sidebar',
        note: {
          en: 'Notice `Billing` and `Sistem` never appear in Rina\'s sidebar because `AppSidebar` renders only permitted modules.',
          id: 'Perhatikan `Billing` dan `Sistem` tidak pernah muncul di sidebar Rina karena `AppSidebar` hanya merender modul yang diizinkan.',
        },
      },
      { part: 'forbiddenCard', box: 'forbiddenCard' },
      {
        part: 'userBadge',
        box: 'roleIdentity',
        note: {
          en: 'Logged in as `Rina Pendaftaran` (`Petugas Pendaftaran`), whose role has no `billing:read` flag in `m_role_access`.',
          id: 'Sedang login sebagai `Rina Pendaftaran` (`Petugas Pendaftaran`), yang tidak memiliki izin `billing:read` di `m_role_access`.',
        },
      },
    ],
    quiz: simrsQuiz.forbidden,
  },
];

export const simrsLab: LabProject = {
  id: 'simrs',
  tab: { en: 'SIMRS Rawat Jalan', id: 'SIMRS Rawat Jalan' },
  icon: 'layers',
  title: { en: 'SIMRS Rawat Jalan (Yii2 + Node + React)', id: 'SIMRS Rawat Jalan (Yii2 + Node + React)' },
  intro: {
    en: 'Explore 10 live 1440px screens from the outpatient hospital system—from registration locks and clinical charting to atomic stock, idempotent billing, Node.js read-only analytics, and dynamic RBAC—complete with verbatim code excerpts and 30 quiz questions.',
    id: 'Jelajahi 10 layar nyata 1440px dari sistem rumah sakit rawat jalan—dari kunci pendaftaran dan pencatatan klinis hingga stok atomik, billing idempoten, analitik read-only Node.js, dan RBAC dinamis—lengkap dengan kutipan kode verbatim dan 30 soal kuis.',
  },
  repo: 'https://github.com/maeshataruna99-lgtm/simrs-rawat-jalan',
  imageDir: '/lab/simrs',
  captures: simrsShots,
  parts: simrsParts,
  screens: simrsScreens,
};
