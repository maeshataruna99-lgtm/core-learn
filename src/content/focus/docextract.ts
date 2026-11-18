import type { FocusTopic } from '../../core/focus.ts';

// Study material for Configurable Document Extraction. Facts follow the repo's docs, eval results, and code.
// Topic ids start with "cde-" because progress keys share one namespace with the other projects.

export const docExtractTopics: FocusTopic[] = [
  {
    id: 'cde-overview',
    title: { en: 'Overview, grounding, and local scope', id: 'Gambaran umum, bukti sumber, dan cakupan lokal' },
    what: {
      en: 'Configurable Document Extraction is a local, model-agnostic application that takes a PDF, PNG, or JPEG file alongside user-defined extraction instructions and a domain profile, then produces canonical Markdown plus structured JSON. Every extracted item (prose, field, checkbox, table, or chart) must carry at least one source reference (1-based PDF page or normalized [x, y, w, h] image region in 0..1) and a verbatim excerpt, plus a closed set of uncertainty markers (missing, unreadable, uncertain, estimated).',
      id: 'Configurable Document Extraction adalah aplikasi lokal yang model-agnostic: menerima file PDF, PNG, atau JPEG beserta instruksi ekstraksi dari pengguna dan domain profile, lalu menghasilkan Markdown kanonik dan JSON terstruktur. Setiap item yang diekstrak (prose, field, checkbox, table, atau chart) wajib membawa minimal satu referensi sumber (halaman PDF 1-based atau region gambar [x, y, w, h] ternormalisasi di 0..1) dan kutipan verbatim, ditambah himpunan marker ketidakpastian tertutup (missing, unreadable, uncertain, estimated).',
    },
    why: {
      en: 'Generic LLM summaries silently invent missing numbers and drop provenance, making extracted data unsafe to audit. Requiring a verbatim excerpt per item lets the verifier check PDF citations against the text layer, while closed markers separate an empty slot (missing, value null) from blurred text (unreadable) or a chart reading (estimated). Keeping the core pipeline behind a ModelProvider interface makes providers swappable, and scoping it as a single-user local tool avoids auth, multi-tenancy, and job-queue complexity.',
      id: 'Ringkasan LLM biasa sering mengarang angka yang hilang dan menghilangkan asal-usulnya, sehingga hasilnya tidak aman diaudit. Mewajibkan kutipan verbatim di setiap item memungkinkan verifier mengecek sitasi PDF ke text layer, sementara marker tertutup memisahkan kolom kosong (missing, value null) dari teks buram (unreadable) atau bacaan grafik (estimated). Meletakkan pipeline di balik interface ModelProvider membuat vendor mudah diganti, dan membatasinya sebagai alat lokal satu pengguna menghindari kerumitan autentikasi, multi-tenancy, dan antrean job.',
    },
    tellIt: {
      en: 'Start with the core risk: models hallucinate or paraphrase silently. Then give the three-part answer: mandatory verbatim evidence per item, closed uncertainty markers, and a provider-neutral pipeline running locally for one user.',
      id: 'Mulai dengan risiko utamanya: model bisa berhalusinasi atau memparafrase diam-diam. Lalu sebut tiga jawabannya: bukti verbatim wajib di setiap item, marker ketidakpastian tertutup, dan pipeline netral-provider yang berjalan lokal untuk satu pengguna.',
    },
    flow: [
      {
        en: 'User uploads a PDF/PNG/JPEG, picks a domain profile, and edits extraction instructions in the web UI or CLI eval.',
        id: 'Pengguna mengunggah PDF/PNG/JPEG, memilih domain profile, dan menyunting instruksi ekstraksi di UI web atau eval CLI.',
      },
      {
        en: 'The API validates magic bytes, ingests the file, plans capability-aware batches, and calls the configured ModelProvider (gemini or fake).',
        id: 'API memvalidasi magic bytes, melakukan ingest, merencanakan batch sesuai kapabilitas, lalu memanggil ModelProvider yang dikonfigurasi (gemini atau fake).',
      },
      {
        en: 'Outputs are repaired if needed, merged across batches, verified against PDF text layers and profile arithmetic rules, and rendered into Markdown + ExtractionResult JSON.',
        id: 'Output diperbaiki bila perlu, digabung antar batch, diverifikasi ke text layer PDF dan aturan aritmetika profile, lalu dirender menjadi Markdown dan JSON ExtractionResult.',
      },
    ],
    code: [
      'README.md',
      'docs/ARCHITECTURE.md',
      'docs/LIMITATIONS.md',
      'apps/api/src/core/evidence.ts',
      'apps/api/src/core/items.ts',
    ],
    questions: [
      {
        q: { en: 'What problem does this project solve, and how does it prevent hallucinations?', id: 'Masalah apa yang diselesaikan proyek ini, dan bagaimana ia mencegah halusinasi?' },
        a: {
          en: 'When extracting forms, tables, or reports with an LLM, two things go wrong: values get invented when a field is empty or blurred, and reviewers cannot tell which page a number came from. Here the schema requires evidence[] with a SourceRef (pdf-page or image-region) and a verbatim excerpt for every item, while empty or unreadable values must be emitted as null with a closed marker (missing, unreadable, uncertain, or estimated). For PDFs, verifyEvidence then checks each excerpt against the extracted text layer.',
          id: 'Saat mengekstrak formulir, tabel, atau laporan dengan LLM, ada dua hal yang sering salah: nilai dikarang saat kolom kosong atau buram, dan peninjau tidak tahu angka berasal dari halaman mana. Di sini skema mewajibkan evidence[] berisi SourceRef (pdf-page atau image-region) dan kutipan verbatim untuk tiap item, sedangkan nilai kosong atau tak terbaca harus keluar sebagai null dengan marker tertutup (missing, unreadable, uncertain, atau estimated). Untuk PDF, verifyEvidence lalu mengecek tiap kutipan ke text layer.',
        },
      },
      {
        q: { en: 'Why design it to be model-agnostic and single-user local?', id: 'Kenapa dirancang model-agnostic dan lokal untuk satu pengguna?' },
        a: {
          en: 'Model-agnostic: pipeline, ingest, validation, and render import only the ModelProvider interface and ProviderCapabilities from providers/types.ts, so swapping Gemini for another provider or the offline FakeProvider changes only wiring in defaults.ts. Single-user local: runs stay in React state and browser memory with no auth, database, or job queue, and pdf.js document handles stay open for the request lifetime. That keeps the scope focused on extraction quality, verification, and clean boundaries, though multi-user deployment would need auth, storage, and explicit doc.destroy() cleanup.',
          id: 'Model-agnostic: pipeline, ingest, validation, dan render hanya mengimpor interface ModelProvider dan ProviderCapabilities dari providers/types.ts, jadi mengganti Gemini ke provider lain atau FakeProvider offline cukup mengubah wiring di defaults.ts. Lokal satu pengguna: hasil run hanya tinggal di state React dan memori browser tanpa autentikasi, database, atau antrean job, dan handle dokumen pdf.js tetap terbuka selama request berjalan. Itu menjaga fokus pada kualitas ekstraksi, verifikasi, dan batas lapisan yang bersih, meski deployment multi-pengguna nanti butuh autentikasi, penyimpanan, dan pembersihan doc.destroy() eksplisit.',
        },
      },
    ],
  },
  {
    id: 'cde-stack-arch',
    title: { en: 'Tech stack, monorepo, and layer rules (D1, D2, D6)', id: 'Tech stack, monorepo, dan aturan lapisan (D1, D2, D6)' },
    what: {
      en: 'The repository is a Node.js >= 22 npm-workspaces monorepo (@cde/api and @cde/web) using TypeScript 5.9 in strict mode with noUncheckedIndexedAccess. The backend uses Fastify 5 with @fastify/multipart, pdfjs-dist, pdf-lib, and @napi-rs/canvas; the frontend uses React 19, Vite 8, react-markdown, and remark-gfm. Architectural layer direction is enforced on every test run by apps/api/test/architecture.test.ts.',
      id: 'Repositori ini adalah monorepo npm workspaces di Node.js >= 22 (@cde/api dan @cde/web) memakai TypeScript 5.9 mode strict dengan noUncheckedIndexedAccess. Backend memakai Fastify 5 dengan @fastify/multipart, pdfjs-dist, pdf-lib, dan @napi-rs/canvas; frontend memakai React 19, Vite 8, react-markdown, dan remark-gfm. Arah dependensi antar-lapisan ditegakkan di setiap run test oleh apps/api/test/architecture.test.ts.',
    },
    why: {
      en: 'D1: npm workspaces ship with Node 22 Docker images, so containers need no extra package manager bootstrap for just two apps (root allowScripts approves esbuild for Vite). D2: ESLint runs typescript-eslint recommended rules without a type-checking program to keep pre-commit hooks fast, leaving strict type safety to tsc --noEmit. D6: scanning relative imports in architecture.test.ts needs zero extra config or dependencies like dependency-cruiser and runs right inside Vitest.',
      id: 'D1: npm workspaces sudah bawaan image Docker Node 22, sehingga kontainer tidak butuh bootstrap package manager tambahan hanya untuk dua aplikasi (allowScripts di root mengizinkan esbuild untuk Vite). D2: ESLint menjalankan aturan recommended typescript-eslint tanpa program type-checking agar pre-commit hook tetap cepat, dan keamanan tipe diserahkan ke tsc --noEmit. D6: pemindaian import relatif di architecture.test.ts tidak butuh dependensi atau format konfigurasi tambahan seperti dependency-cruiser dan langsung jalan di Vitest.',
    },
    tellIt: {
      en: 'Walk top-down from monorepo tooling (Node 22 + npm workspaces + strict TS) to backend/document libs, then frontend, and close with the 10-line ALLOWED layer matrix in architecture.test.ts.',
      id: 'Jelaskan dari atas ke bawah: tooling monorepo (Node 22 + npm workspaces + TS strict), lalu library backend dan dokumen, lalu frontend, dan tutup dengan matriks ALLOWED 10 baris di architecture.test.ts.',
    },
    flow: [
      {
        en: 'Monorepo & TS: Node >= 22, npm workspaces (apps/api, apps/web), tsconfig.base.json with strict, noUncheckedIndexedAccess, verbatimModuleSyntax, and useUnknownInCatchVariables.',
        id: 'Monorepo & TS: Node >= 22, npm workspaces (apps/api, apps/web), tsconfig.base.json dengan strict, noUncheckedIndexedAccess, verbatimModuleSyntax, dan useUnknownInCatchVariables.',
      },
      {
        en: 'API & PDF/Image stack: Fastify 5 + @fastify/multipart for streaming uploads; pdfjs-dist for text layer + viewport coords, pdf-lib for sub-PDF cutting, @napi-rs/canvas for PNG rasterization and image decoding.',
        id: 'Stack API & PDF/Gambar: Fastify 5 + @fastify/multipart untuk streaming upload; pdfjs-dist untuk text layer + koordinat viewport, pdf-lib untuk memotong sub-PDF, @napi-rs/canvas untuk rasterisasi PNG dan dekode gambar.',
      },
      {
        en: 'Web UI: React 19 + Vite 8 + react-markdown + remark-gfm, served behind nginx:1.27-alpine proxying /api.',
        id: 'UI Web: React 19 + Vite 8 + react-markdown + remark-gfm, disajikan di balik nginx:1.27-alpine yang mem-proxy /api.',
      },
      {
        en: 'Architecture test: scans apps/api/src relative imports against ALLOWED layers, ensures pipeline/ingest/validation/render import only providers/types.ts, and keeps core/ free of node:fs/http/net/child_process.',
        id: 'Test arsitektur: memindai import relatif apps/api/src terhadap matriks ALLOWED, memastikan pipeline/ingest/validation/render hanya mengimpor providers/types.ts, dan menjaga core/ bebas dari node:fs/http/net/child_process.',
      },
    ],
    code: [
      'package.json',
      'tsconfig.base.json',
      'apps/api/package.json',
      'apps/web/package.json',
      'docs/DECISIONS.md',
      'apps/api/test/architecture.test.ts',
    ],
    questions: [
      {
        q: { en: 'Why npm workspaces instead of pnpm, and why skip type-aware ESLint rules?', id: 'Kenapa memakai npm workspaces bukan pnpm, dan kenapa tidak memakai aturan ESLint type-aware?' },
        a: {
          en: 'The monorepo only has two packages (@cde/api and @cde/web). npm is built into node:22-bookworm-slim, so Dockerfiles and CI need no pnpm setup, while root allowScripts explicitly gates install scripts (esbuild allowed, protobufjs blocked). For linting (D2), running ESLint without type-checking keeps the Husky pre-commit hook fast, while tsc --noEmit enforces strict mode and noUncheckedIndexedAccess before every commit and in CI.',
          id: 'Monorepo ini hanya punya dua package (@cde/api dan @cde/web). npm sudah terpasang di node:22-bookworm-slim, jadi Dockerfile dan CI tidak perlu setup pnpm, sementara allowScripts di root menyaring skrip instalasi (esbuild diizinkan, protobufjs ditolak). Untuk linting (D2), menjalankan ESLint tanpa type-checking menjaga Husky pre-commit hook tetap cepat, sedangkan tsc --noEmit menegakkan mode strict dan noUncheckedIndexedAccess sebelum tiap commit dan di CI.',
        },
      },
      {
        q: { en: 'Why use three separate PDF/image libraries (pdfjs-dist, pdf-lib, @napi-rs/canvas)?', id: 'Kenapa memakai tiga library PDF/gambar terpisah (pdfjs-dist, pdf-lib, @napi-rs/canvas)?' },
        a: {
          en: 'Each solves a different job. pdfjs-dist reads page count, extracts the per-page text layer with normalized glyph bounding boxes, and drives page rendering. pdf-lib splits original PDFs into small sub-PDF byte buffers for native-pdf batches without re-rasterizing. @napi-rs/canvas provides a native DOM-compatible 2D canvas for pdf.js PNG rendering (at PDF_RENDER_DPI) and decodes PNG/JPEG uploads via loadImage to verify pixel dimensions without requiring browser DOM or external binaries.',
          id: 'Masing-masing mengerjakan tugas berbeda. pdfjs-dist membaca jumlah halaman, mengekstrak text layer per halaman beserta bounding box glif ternormalisasi, dan menggerakkan rendering halaman. pdf-lib memotong PDF asli menjadi buffer sub-PDF kecil untuk batch native-pdf tanpa rasterisasi ulang. @napi-rs/canvas menyediakan canvas 2D kompatibel DOM secara native untuk merender PNG dari pdf.js (sesuai PDF_RENDER_DPI) serta mendekode unggahan PNG/JPEG lewat loadImage guna memverifikasi dimensi piksel tanpa browser DOM atau biner eksternal.',
        },
      },
      {
        q: { en: 'How do you enforce layer boundaries without dependency-cruiser?', id: 'Bagaimana menegakkan batas lapisan tanpa dependency-cruiser?' },
        a: {
          en: 'apps/api/test/architecture.test.ts reads every .ts file in apps/api/src, extracts relative imports, and checks three invariants in Vitest: imports must match the 10-line ALLOWED layer table; pipeline, ingest, validation, and render may import providers/types.ts only (never concrete adapters or defaults.ts); and core/ must never import Node I/O modules. One deliberate edge (D6) is ingest/batching.ts importing the ProviderCapabilities type from providers/types.ts.',
          id: 'apps/api/test/architecture.test.ts membaca tiap file .ts di apps/api/src, mengekstrak import relatif, dan memeriksa tiga invarian di Vitest: import harus sesuai tabel ALLOWED 10 baris; pipeline, ingest, validation, dan render hanya boleh mengimpor providers/types.ts (bukan adapter konkret atau defaults.ts); dan core/ dilarang mengimpor modul I/O Node. Satu tepi yang disengaja (D6) adalah ingest/batching.ts mengimpor tipe ProviderCapabilities dari providers/types.ts.',
        },
      },
    ],
  },
  {
    id: 'cde-ingest-batching',
    title: { en: 'Upload validation, ingest, and batching (D7, D8, D9)', id: 'Validasi unggahan, ingest, dan batching (D7, D8, D9)' },
    what: {
      en: 'validateUpload enforces non-empty files (400), MAX_UPLOAD_MB limits (413), and magic-byte detection (415) while ignoring client-declared MIME types and extensions. pdfIngestor and imageIngestor decode the document, then planBatches selects the highest-fidelity inputMode supported by provider.capabilities (native-pdf > rendered-pages > text-layer, or image) and splits pages into sequential batches.',
      id: 'validateUpload menegakkan file tidak kosong (400), batas MAX_UPLOAD_MB (413), dan deteksi magic bytes (415) sambil mengabaikan tipe MIME maupun ekstensi dari klien. pdfIngestor dan imageIngestor mendekode dokumen, lalu planBatches memilih inputMode berketelitian tertinggi sesuai provider.capabilities (native-pdf > rendered-pages > text-layer, atau image) dan membagi halaman ke batch berurutan.',
    },
    why: {
      en: 'D7: sequential execution with Math.ceil(60_000 / requestsPerMinute) ms spacing prevents HTTP 429 bursts on Gemini free tier (10 RPM, 20 RPD). D8: Gemini accepts 1000 PDF pages natively, yet recommendedPagesPerRequest is 6 so dense scientific tables/charts fit well under maxOutputTokens (65,536) and limit failure blast radius. D9: sending the extracted === PAGE N === text layer alongside native-pdf bytes lets the model copy verbatim excerpts instead of paraphrasing, lifting PDF evidence validity to 0.99–1.00.',
      id: 'D7: eksekusi berurutan dengan jeda Math.ceil(60_000 / requestsPerMinute) ms mencegah ledakan HTTP 429 pada free tier Gemini (10 RPM, 20 RPD). D8: Gemini menerima hingga 1000 halaman PDF secara native, namun recommendedPagesPerRequest diset 6 agar tabel dan grafik ilmiah yang padat muat di bawah maxOutputTokens (65.536) dan membatasi dampak kegagalan batch. D9: mengirim text layer === PAGE N === bersama byte native-pdf membuat model menyalin kutipan persis alih-alih memparafrase, mengangkat validitas bukti PDF ke 0,99–1,00.',
    },
    tellIt: {
      en: 'Trace from trust boundary to model call: ignore browser MIME and sniff magic bytes, pick inputMode by provider capability order, then justify sequential 6-page batches with RPM spacing and dual native-pdf + text-layer parts.',
      id: 'Telusuri dari batas kepercayaan ke panggilan model: abaikan MIME browser dan cek magic bytes, pilih inputMode berdasarkan kapabilitas provider, lalu jelaskan alasan batch 6 halaman berurutan dengan jeda RPM serta pengiriman ganda native-pdf + text layer.',
    },
    flow: [
      {
        en: 'validateUpload (ingest/validate-upload.ts): rejects 0-byte (400 empty), > MAX_UPLOAD_MB (413 size), and unknown magic bytes (415 magic).',
        id: 'validateUpload (ingest/validate-upload.ts): menolak 0 byte (400 empty), > MAX_UPLOAD_MB (413 size), dan magic bytes tak dikenal (415 magic).',
      },
      {
        en: 'Ingestors: pdfIngestor checks %PDF-, copies buffer before pdfjs-dist getDocument (since pdf.js detaches buffers), flags hasTextLayer when any page has >= 20 trimmed chars; imageIngestor checks PNG/JPEG magic bytes and decodes via @napi-rs/canvas loadImage.',
        id: 'Ingestor: pdfIngestor mengecek %PDF-, menyalin buffer sebelum pdfjs-dist getDocument (karena pdf.js me-detach buffer), menandai hasTextLayer bila ada halaman >= 20 karakter; imageIngestor mengecek magic bytes PNG/JPEG dan mendekode lewat @napi-rs/canvas loadImage.',
      },
      {
        en: 'planBatches (ingest/batching.ts): picks native-pdf > rendered-pages > text-layer (or image), chunking by PAGES_PER_BATCH ?? recommendedPagesPerRequest capped at provider limits.',
        id: 'planBatches (ingest/batching.ts): memilih native-pdf > rendered-pages > text-layer (atau image), memecah dengan PAGES_PER_BATCH ?? recommendedPagesPerRequest hingga batas provider.',
      },
      {
        en: 'runExtraction loop: spaces batches by Math.ceil(60_000 / rpm) ms and, in native-pdf mode, attaches both sub-PDF bytes and === PAGE N === text labels (capped at 12,000 chars/page).',
        id: 'Loop runExtraction: memberi jeda antar batch sebesar Math.ceil(60_000 / rpm) ms dan pada mode native-pdf menyertakan byte sub-PDF sekaligus label teks === PAGE N === (maksimal 12.000 karakter/halaman).',
      },
    ],
    code: [
      'apps/api/src/ingest/validate-upload.ts',
      'apps/api/src/ingest/pdf/pdf-ingestor.ts',
      'apps/api/src/ingest/image/image-ingestor.ts',
      'apps/api/src/ingest/batching.ts',
      'apps/api/src/pipeline/orchestrator.ts',
      'apps/api/src/pipeline/prompt-builder.ts',
    ],
    questions: [
      {
        q: { en: 'How does upload validation work at the API trust boundary?', id: 'Bagaimana cara kerja validasi unggahan di batas kepercayaan API?' },
        a: {
          en: 'validateUpload checks byte length first: 0 bytes throws UnsupportedInputError("empty") (HTTP 400) and exceeding maxUploadBytes throws "size" (HTTP 413). It then ignores declaredMimeType and file extension, passing the raw Uint8Array to IngestorRegistry.detect, which sniffs magic bytes (%PDF-, PNG 89 50 4E 47 0D 0A 1A 0A, JPEG FF D8 FF). Mismatches throw "magic" (HTTP 415), and corrupt or password-protected files fail during decode with "corrupt" (HTTP 400).',
          id: 'validateUpload mengecek panjang byte dulu: 0 byte melempar UnsupportedInputError("empty") (HTTP 400) dan melebihi maxUploadBytes melempar "size" (HTTP 413). Setelah itu ia mengabaikan declaredMimeType dan ekstensi file, lalu menyerahkan Uint8Array mentah ke IngestorRegistry.detect yang memeriksa magic bytes (%PDF-, PNG 89 50 4E 47 0D 0A 1A 0A, JPEG FF D8 FF). Ketidakcocokan melempar "magic" (HTTP 415), dan file rusak atau terenkripsi gagal saat dekode dengan "corrupt" (HTTP 400).',
        },
      },
      {
        q: { en: 'Why run 6-page sequential batches with RPM spacing when Gemini supports 1,000 PDF pages?', id: 'Kenapa menjalankan batch 6 halaman secara berurutan dengan jeda RPM padahal Gemini mendukung 1.000 halaman PDF?' },
        a: {
          en: 'Two constraints. First, output density (D8): an 18-page scientific PDF with nested tables and charts generates 30k–40k output tokens across all items; 6 pages per batch keeps each call safely below maxOutputTokens (65,536) without truncation and isolates failures to at most 6 pages. Second, free-tier rate limits (D7): gemini-3.8-flash allows 10 RPM and 20 RPD, so concurrent batches immediately trigger HTTP 429 and burn daily quota on retries. Sequential execution with Math.ceil(60_000 / 10) = 6,000 ms spacing stays within RPM.',
          id: 'Dua batasan. Pertama, kepadatan output (D8): PDF ilmiah 18 halaman dengan tabel bersarang dan grafik menghasilkan 30k–40k token output; 6 halaman per batch menjaga tiap panggilan aman di bawah maxOutputTokens (65.536) tanpa terpotong dan membatasi kegagalan maksimal 6 halaman. Kedua, rate limit free tier (D7): gemini-3.8-flash hanya mengizinkan 10 RPM dan 20 RPD, jadi batch paralel langsung memicu HTTP 429 dan menghabiskan kuota harian untuk retry. Eksekusi berurutan dengan jeda Math.ceil(60_000 / 10) = 6.000 ms menjaga tetap di dalam RPM.',
        },
      },
      {
        q: { en: 'Why send the === PAGE N === text layer in native-pdf mode if the PDF bytes are already attached?', id: 'Kenapa tetap mengirim text layer === PAGE N === di mode native-pdf padahal byte PDF sudah dilampirkan?' },
        a: {
          en: 'When a model reads only visual PDF pages, it often fixes line breaks, expands ligatures, or lightly paraphrases quotes—causing verbatim evidence verification to fail. Attaching === PAGE N === text labels (up to 12,000 chars per page) alongside the sub-PDF lets the model see layout/charts visually while copying exact text-layer strings for evidence[].excerpt, lifting PDF evidence validity to 0.99–1.00 in live evaluation.',
          id: 'Saat model hanya membaca halaman PDF secara visual, model sering merapikan jeda baris, mengubah ligatur, atau sedikit memparafrase kutipan sehingga verifikasi bukti verbatim gagal. Melampirkan label teks === PAGE N === (maksimal 12.000 karakter per halaman) bersama sub-PDF membuat model melihat tata letak/grafik secara visual sekaligus menyalin string text layer persis untuk evidence[].excerpt, sehingga validitas bukti PDF mencapai 0,99–1,00 pada evaluasi langsung.',
        },
      },
    ],
  },
  {
    id: 'cde-profiles-prompt',
    title: { en: 'Domain profiles, prompting, and JSON repair (D10)', id: 'Domain profile, prompting, dan JSON repair (D10)' },
    what: {
      en: 'Domain profiles are JSON files (apps/api/src/profiles/presets/*.json or PROFILES_DIR) validated at startup by Zod (profileSchema). prompt-builder.ts injects profile guidance and field keys, switching between native responseSchema and prompt-embedded portable JSON Schema depending on capabilities.jsonSchemaOutput. parseModelOutput strips fences, runs JSON.parse with jsonrepair fallback, validates items one by one, and form-rules.ts checks arithmetic rules via a recursive-descent parser without eval.',
      id: 'Domain profile berbentuk file JSON (apps/api/src/profiles/presets/*.json atau PROFILES_DIR) yang divalidasi saat startup oleh Zod (profileSchema). prompt-builder.ts menyisipkan guidance dan field key profile, memilih antara responseSchema native atau JSON Schema portabel di dalam prompt tergantung capabilities.jsonSchemaOutput. parseModelOutput membuang fence, menjalankan JSON.parse dengan fallback jsonrepair, memvalidasi item satu per satu, dan form-rules.ts memeriksa aturan aritmetika lewat parser recursive-descent tanpa eval.',
    },
    why: {
      en: 'D10: storing profiles as declarative JSON instead of TypeScript modules lets teams add domains (guidance, locale, field keys, arithmetic rules) with zero code edits or rebuilds and zero risk of running untrusted plugin code. Per-item Zod safeParse drops only broken items with a warning instead of losing an entire 6-page batch, and recursive descent keeps arithmetic evaluation strictly sandboxed to numbers, field keys, + - * /, and parentheses.',
      id: 'D10: menyimpan profile sebagai JSON deklaratif alih-alih modul TypeScript memungkinkan penambahan domain (guidance, locale, field key, aturan aritmetika) tanpa ubah kode atau rebuild dan tanpa risiko mengeksekusi kode plugin tak tepercaya. Zod safeParse per-item hanya membuang item rusak dengan peringatan alih-alih menggugurkan seluruh batch 6 halaman, dan recursive descent menjaga evaluasi aritmetika terbatas ketat pada angka, field key, + - * /, dan tanda kurung.',
    },
    tellIt: {
      en: 'Explain how a profile configures both the front end of the pipeline (guidance + field keys in buildRequest) and the back end (locale parsing + recursive-descent rule checks), bridged by portable JSON Schema and per-item jsonrepair.',
      id: 'Jelaskan bagaimana profile mengonfigurasi sisi hulu pipeline (guidance + field key di buildRequest) sekaligus sisi hilir (parsing locale + cek aturan recursive-descent), dijembatani oleh JSON Schema portabel dan jsonrepair per-item.',
    },
    flow: [
      {
        en: 'Startup: loadProfiles scans *.json, validates with profileSchema, rejects duplicate IDs or missing default.json with ConfigError.',
        id: 'Startup: loadProfiles memindai *.json, memvalidasi dengan profileSchema, dan menolak ID ganda atau default.json yang hilang dengan ConfigError.',
      },
      {
        en: 'Prompt build: buildRequest includes SYSTEM_RULES + profile guidance/fields; sets responseSchema if jsonSchemaOutput is true, else appends portable modelOutputJsonSchema (oneOf -> anyOf, const -> enum, no $schema) to system prompt.',
        id: 'Susun prompt: buildRequest menggabungkan SYSTEM_RULES + guidance/fields profile; mengirim responseSchema jika jsonSchemaOutput true, atau menempelkan modelOutputJsonSchema portabel (oneOf -> anyOf, const -> enum, tanpa $schema) ke system prompt.',
      },
      {
        en: 'Output parsing (output-schema.ts): strips ```json fences, parses via JSON.parse or jsonrepair, then safeParses each entry in items[] individually and records dropped reasons.',
        id: 'Parsing output (output-schema.ts): menghapus fence ```json, mem-parse via JSON.parse atau jsonrepair, lalu safeParse tiap elemen items[] satu per satu dan mencatat alasan item yang dibuang.',
      },
      {
        en: 'Rule evaluation (form-rules.ts): parses extracted amounts using profile.locale (en vs id-ID), treats missing fields as 0, skips on unreadable/absent inputs or unmet when checkbox, and evaluates left/right expressions via recursive descent.',
        id: 'Evaluasi aturan (form-rules.ts): mem-parse nominal dengan profile.locale (en vs id-ID), menganggap field missing sebagai 0, melewati aturan jika input unreadable/absent atau checkbox when belum terpenuhi, lalu menghitung ekspresi kiri/kanan lewat recursive descent.',
      },
    ],
    code: [
      'apps/api/src/profiles/types.ts',
      'apps/api/src/profiles/loader.ts',
      'apps/api/src/profiles/presets/tax-form.json',
      'apps/api/src/pipeline/prompt-builder.ts',
      'apps/api/src/pipeline/output-schema.ts',
      'apps/api/src/validation/form-rules.ts',
    ],
    questions: [
      {
        q: { en: 'Why store domain profiles as JSON files instead of TypeScript modules?', id: 'Kenapa domain profile disimpan sebagai file JSON, bukan modul TypeScript?' },
        a: {
          en: 'Because new document domains only need instructions, prompt guidance, number locale, field keys, and arithmetic rules—pure data. Keeping them in JSON under presets/ or PROFILES_DIR means adding or tuning a profile requires no code changes, rebuilds, or dynamic code imports, and loadProfiles catches malformed JSON or missing default.json at boot via profileSchema.',
          id: 'Karena domain dokumen baru hanya butuh instruksi, guidance prompt, locale angka, field key, dan aturan aritmetika—murni data. Menyimpannya sebagai JSON di presets/ atau PROFILES_DIR membuat penambahan atau penyesuaian profile tidak butuh perubahan kode, rebuild, atau import kode dinamis, dan loadProfiles menangkap JSON cacat atau default.json yang hilang saat startup lewat profileSchema.',
        },
      },
      {
        q: { en: 'How does prompt-builder handle providers with and without jsonSchemaOutput, and why rewrite the JSON Schema?', id: 'Bagaimana prompt-builder menangani provider dengan dan tanpa jsonSchemaOutput, dan kenapa JSON Schema perlu ditulis ulang?' },
        a: {
          en: 'One Zod schema (modelOutputSchema) is the single source of truth. portable() transforms z.toJSONSchema(modelOutputSchema) by stripping $schema and converting oneOf -> anyOf and const -> single-value enum, because structured-output APIs such as Gemini reject those keywords. When capabilities.jsonSchemaOutput is true, buildRequest attaches responseSchema (and GeminiProvider sets responseMimeType: "application/json"); when false, it embeds the same schema string in the system prompt.',
          id: 'Satu skema Zod (modelOutputSchema) menjadi sumber kebenaran tunggal. portable() mengubah hasil z.toJSONSchema(modelOutputSchema) dengan membuang $schema serta mengonversi oneOf -> anyOf dan const -> enum bernilai tunggal, karena API structured-output seperti Gemini menolak keyword tersebut. Saat capabilities.jsonSchemaOutput true, buildRequest melampirkan responseSchema (dan GeminiProvider menyetel responseMimeType: "application/json"); saat false, skema yang sama disematkan ke system prompt.',
        },
      },
      {
        q: { en: 'How does parseModelOutput recover from noisy model JSON, and how does form-rules.ts evaluate expressions safely?', id: 'Bagaimana parseModelOutput memulihkan JSON model yang kotor, dan bagaimana form-rules.ts mengevaluasi ekspresi dengan aman?' },
        a: {
          en: 'parseModelOutput strips Markdown fences, slices from the first "{", tries JSON.parse, and falls back to jsonrepair (setting repaired: true) for trailing commas or truncated structures; it then validates each element of items[] with itemSchema.safeParse so one bad item is dropped rather than failing the batch. For arithmetic rules, form-rules.ts never uses eval: tokenize() and recursive-descent functions (primary, product, sum) only accept numbers, field keys, + - * /, and parentheses, reporting discrepancies as warn without ever modifying extracted values.',
          id: 'parseModelOutput menghapus fence Markdown, memotong dari "{" pertama, mencoba JSON.parse, dan memakai jsonrepair (menandai repaired: true) untuk koma berlebih atau output terpotong; lalu setiap elemen items[] divalidasi dengan itemSchema.safeParse agar satu item rusak cukup dibuang tanpa menggagalkan batch. Untuk aturan aritmetika, form-rules.ts tidak pernah memakai eval: tokenize() dan fungsi recursive-descent (primary, product, sum) hanya menerima angka, field key, + - * /, dan tanda kurung, serta melaporkan selisih sebagai warn tanpa mengubah nilai hasil ekstraksi.',
        },
      },
    ],
  },
  {
    id: 'cde-reliability-render',
    title: { en: 'Reliability, error taxonomy, and output rendering (D4, D11, D12)', id: 'Keandalan, taksonomi error, dan render output (D4, D11, D12)' },
    what: {
      en: 'Errors are typed into retryable ProviderError kinds (rate_limit, timeout, unavailable, invalid_response) and non-retryable STOP_KINDS (quota, auth, bad_request) that halt remaining batches. FakeProvider enables deterministic offline tests. On success, orchestrator.ts merges batch items, builds canonical Markdown alongside structured JSON (D12), verifies Markdown formatting, and serves both to ResultView (with rehypeLineBreaks) and SourcePanel in React.',
      id: 'Error dikelompokkan menjadi ProviderError retryable (rate_limit, timeout, unavailable, invalid_response) dan STOP_KINDS non-retryable (quota, auth, bad_request) yang langsung menghentikan sisa batch. FakeProvider memungkinkan uji integrasi deterministik tanpa jaringan. Saat berhasil, orchestrator.ts menggabung item batch, menyusun Markdown kanonik bersama JSON terstruktur (D12), memvalidasi format Markdown, dan menyajikan keduanya ke ResultView (dengan rehypeLineBreaks) serta SourcePanel di React.',
    },
    why: {
      en: 'D4 & D11: waiting seconds cannot fix exhausted daily quota (PerDay), invalid API keys, or HTTP 400/404 bad_request errors (such as unknown model names), so skipping retries and aborting remaining batches avoids wasting free-tier budget. D12: canonical Markdown makes results readable, downloadable (.extraction.md), and testable via golden snapshots, while structured JSON powers interactive filtering and visual bounding-box inspection in SourcePanel.',
      id: 'D4 & D11: menunggu beberapa detik tidak akan memulihkan kuota harian yang habis (PerDay), API key salah, atau error HTTP 400/404 bad_request (seperti nama model tidak dikenal), sehingga melewati retry dan menghentikan sisa batch mencegah pemborosan kuota free tier. D12: Markdown kanonik membuat hasil mudah dibaca, diunduh (.extraction.md), dan diuji dengan golden snapshot, sementara JSON terstruktur menggerakkan filter interaktif serta inspeksi bounding box di SourcePanel.',
    },
    tellIt: {
      en: 'Split failures cleanly into retryable vs STOP_KINDS, explain partial-batch survival vs full failure, then trace the two-pass Markdown render + checkMarkdownFormat into ResultView and SourcePanel.',
      id: 'Pisahkan kegagalan menjadi retryable vs STOP_KINDS, jelaskan perlakuan kegagalan parsial vs gagal total, lalu telusuri render Markdown dua kali + checkMarkdownFormat hingga ResultView dan SourcePanel.',
    },
    flow: [
      {
        en: 'GeminiProvider.generate maps SDK/HTTP errors via classifyGeminiError (redacting AIza... keys): PerDay 429 -> quota, other 429 -> rate_limit with retryDelayMs, 401/403 -> auth, 404/4xx -> bad_request, 5xx/socket -> unavailable, Abort/Timeout/504 -> timeout.',
        id: 'GeminiProvider.generate memetakan error SDK/HTTP via classifyGeminiError (menyensor key AIza...): 429 PerDay -> quota, 429 lain -> rate_limit beserta retryDelayMs, 401/403 -> auth, 404/4xx -> bad_request, 5xx/socket -> unavailable, Abort/Timeout/504 -> timeout.',
      },
      {
        en: 'withRetry retries only retryable ProviderErrors with exponential backoff + jitter (honoring retryAfterMs); orchestrator skips remaining batches if error.kind is in STOP_KINDS and merges partial results unless all batches failed.',
        id: 'withRetry hanya mengulang ProviderError retryable dengan exponential backoff + jitter (mematuhi retryAfterMs); orchestrator melewati sisa batch bila error.kind termasuk STOP_KINDS dan menggabung hasil parsial kecuali semua batch gagal.',
      },
      {
        en: 'renderMarkdown groups items by section[0..1], flattens multi-level headers with " › ", checks formatting via checkMarkdownFormat (single leading H1, no skipped headings, matching table columns), and re-renders with the format check in ## Validation.',
        id: 'renderMarkdown mengelompokkan item menurut section[0..1], meratakan header bertingkat dengan " › ", memeriksa struktur via checkMarkdownFormat (satu H1 di awal, tanpa lompatan heading, jumlah kolom tabel cocok), lalu merender ulang agar hasil cek masuk ke ## Validation.',
      },
      {
        en: 'Web UI: ResultView renders Markdown safely (rehypeLineBreaks converts only <br> nodes, Strong turns **[MARKER: ...]** into badges) and syncs selected items to SourcePanel (PDF #page=N iframe or image-region overlay box).',
        id: 'UI Web: ResultView merender Markdown dengan aman (rehypeLineBreaks hanya mengubah node <br>, Strong mengubah **[MARKER: ...]** menjadi badge) dan menyinkronkan item terpilih ke SourcePanel (iframe PDF #page=N atau kotak overlay image-region).',
      },
    ],
    code: [
      'apps/api/src/core/errors.ts',
      'apps/api/src/pipeline/retry.ts',
      'apps/api/src/pipeline/orchestrator.ts',
      'apps/api/src/providers/gemini/gemini-provider.ts',
      'apps/api/src/providers/fake/fake-provider.ts',
      'apps/api/src/render/markdown.ts',
      'apps/api/src/validation/markdown-format.ts',
      'apps/web/src/components/ResultView.tsx',
      'apps/web/src/components/SourcePanel.tsx',
    ],
    questions: [
      {
        q: { en: 'Which provider errors are retried, which stop the run immediately, and what happens on partial batch failure?', id: 'Error provider mana yang di-retry, mana yang langsung menghentikan run, dan apa yang terjadi pada kegagalan parsial?' },
        a: {
          en: 'rate_limit, timeout, unavailable, and invalid_response (including unparseable/truncated JSON) are retried up to MAX_RETRIES using exponential backoff with jitter and server retryAfterMs. quota (daily PerDay 429), auth (401/403), and bad_request (400/404) are non-retryable and sit in STOP_KINDS, so orchestrator.ts immediately marks remaining batches as skipped. If at least one batch succeeds, it returns the merged partial result with validation.overall = "fail" and failed page ranges under ## Processing notes; only if every batch fails does it throw.',
          id: 'rate_limit, timeout, unavailable, dan invalid_response (termasuk JSON tak terbaca/terpotong) di-retry hingga MAX_RETRIES dengan exponential backoff ber-jitter dan retryAfterMs dari server. quota (429 harian PerDay), auth (401/403), dan bad_request (400/404) tidak di-retry dan masuk STOP_KINDS, sehingga orchestrator.ts langsung menandai sisa batch sebagai skipped. Bila minimal satu batch berhasil, sistem mengembalikan hasil gabungan parsial dengan validation.overall = "fail" dan rentang halaman gagal di ## Processing notes; error baru dilempar jika semua batch gagal.',
        },
      },
      {
        q: { en: 'How does FakeProvider enable deterministic integration testing without hiding real-model gaps?', id: 'Bagaimana FakeProvider mendukung uji integrasi deterministik tanpa menutupi keterbatasan model sungguhan?' },
        a: {
          en: 'FakeProvider records every GenerateRequest and either replays a scripted sequence of responses/ProviderErrors (testing retries, quota short-circuiting, partial batch failure, and HTTP error mapping in http.test.ts and pipeline.integration.test.ts) or parses === PAGE N === / === IMAGE === prompt labels to emit schema-valid placeholder items. Its docs explicitly note it tests pipeline wiring only, never extraction accuracy.',
          id: 'FakeProvider mencatat setiap GenerateRequest dan memutar skrip respons/ProviderError (untuk menguji retry, short-circuit kuota, gagal parsial, dan pemetaan error HTTP di http.test.ts dan pipeline.integration.test.ts) atau membaca label prompt === PAGE N === / === IMAGE === untuk menghasilkan item placeholder yang valid secara skema. Dokumentasinya menegaskan FakeProvider hanya menguji jalur pipeline, bukan akurasi ekstraksi.',
        },
      },
      {
        q: { en: 'Why render Markdown twice in the pipeline, and how does ResultView render <br> without enabling general HTML (XSS)?', id: 'Kenapa Markdown dirender dua kali di pipeline, dan bagaimana ResultView merender <br> tanpa membuka celah HTML umum (XSS)?' },
        a: {
          en: 'orchestrator.ts renders Markdown first so checkMarkdownFormat can verify headings, code fences, and pipe-table column counts (ignoring escaped \\|), then re-renders once so the format check itself appears in the ## Validation footer. In the UI, render/markdown.ts uses <br> for multi-line table cells; instead of enabling raw HTML in react-markdown (which would allow XSS from extracted text), ResultView passes a tiny rehype plugin (rehypeLineBreaks) that converts only <br> / <br/> raw nodes to elements while leaving all other HTML inert.',
          id: 'orchestrator.ts merender Markdown sekali agar checkMarkdownFormat bisa memeriksa heading, code fence, dan jumlah kolom tabel pipe (mengabaikan \\| yang di-escape), lalu merender ulang sekali lagi agar hasil cek format ikut tercatat di footer ## Validation. Di UI, render/markdown.ts memakai <br> untuk sel tabel multi-baris; alih-alih mengaktifkan raw HTML di react-markdown (yang berisiko XSS dari teks dokumen), ResultView memakai plugin rehype kecil (rehypeLineBreaks) yang hanya mengubah node raw <br> / <br/> menjadi elemen dan membiarkan HTML lain tetap inert.',
        },
      },
    ],
  },
  {
    id: 'cde-evidence-eval',
    title: { en: 'Evidence verification, evaluation, and honest limits (D5, D13)', id: 'Verifikasi bukti, evaluasi, dan limitasi jujur (D5, D13)' },
    what: {
      en: 'evidence-verify.ts checks PDF excerpts against the ingested text layer using Unicode/hyphenation normalization, space-free compact substring matching, and 3-gram word shingles (threshold 0.8), assigning verified, unverified (plus foundOnPage), or not_checked (images and PDF pages < 20 chars). Live evaluation against hand-read ground truth (2026-11-18, gemini-3.8-flash) scored 1.00 fact recall on A1, 0.893 table cells and 0.72 chart accuracy on A2, 1.00 (35/35) on B1, and 1.00 (8/8 rules) on B2, while exposing quota limits, chart series swaps, and minor UI bugs.',
      id: 'evidence-verify.ts mengecek kutipan PDF terhadap text layer hasil ingest memakai normalisasi Unicode/tanda hubung, pencocokan substring tanpa spasi (compact), dan shingle 3-gram kata (ambang 0,8), menghasilkan status verified, unverified (plus foundOnPage), atau not_checked (gambar dan halaman PDF < 20 karakter). Evaluasi langsung terhadap ground truth manual (2026-11-18, gemini-3.8-flash) mencatat fact recall 1,00 pada A1, sel tabel 0,893 dan grafik 0,72 pada A2, 1,00 (35/35) pada B1, serta 1,00 (8/8 aturan) pada B2, sekaligus mengungkap batas kuota, pertukaran seri grafik, dan bug kecil di UI.',
    },
    why: {
      en: 'D5: space-free matching absorbs PDF text-layer spacing artifacts ("in dustry", "Table1"), 3-gram shingles allow tiny omissions without accepting paraphrases, and not_checked avoids misreporting uncheckable images as failed checks. Reporting exact raw numbers alongside "What the numbers hide" (Table 5 scoring artifacts vs real Fig. 4 swaps) and D13 (skipping live replay fixture when the 20 RPD quota is exhausted) keeps the evaluation honest and reproducible.',
      id: 'D5: pencocokan tanpa spasi meredam artefak spasi text layer PDF ("in dustry", "Table1"), shingle 3-gram menoleransi penghilangan kecil tanpa meloloskan parafrase, dan not_checked mencegah gambar yang tak bisa dicek dilaporkan seolah gagal. Melaporkan angka mentah beserta bagian "What the numbers hide" (artefak skor Table 5 vs kesalahan nyata Fig. 4) dan D13 (melewati fixture replay langsung saat kuota 20 RPD habis) menjaga evaluasi tetap jujur dan dapat direproduksi.',
    },
    tellIt: {
      en: 'Walk through the verification algorithm (normalize -> compact substring -> 24-char gate -> 0.8 3-gram shingle -> wrong-page scan), give the live eval metrics from 2026-11-18, then proactively explain Table 5 (25/28 vs 28/28), Fig. 4 (0.72), the 20 RPD cap, and the two UI known issues.',
      id: 'Jelaskan alur algoritma verifikasi (normalisasi -> substring compact -> batas 24 karakter -> shingle 3-gram 0,8 -> cek salah halaman), sebut angka evaluasi langsung 2026-11-18, lalu proaktif jelaskan Table 5 (25/28 vs 28/28), Fig. 4 (0,72), batas 20 RPD, dan dua isu UI yang diketahui.',
    },
    flow: [
      {
        en: 'Normalize (normalize.ts): NFKC, strip soft hyphens, unify dashes/quotes, rejoin line-break hyphens, lowercase, and strip punctuation; compact() strips all spaces.',
        id: 'Normalisasi (normalize.ts): NFKC, hapus soft hyphen, samakan dash/kutip, sambung kata terpotong baris, lowercase, dan buang tanda baca; compact() menghapus semua spasi.',
      },
      {
        en: 'Match (evidence-verify.ts): image or PDF page < 20 compact chars -> not_checked; compact substring -> score 1 (verified); < 24 compact chars require exact compact match; else word 3-gram overlap >= 0.8 -> verified, else unverified + scan other pages for foundOnPage.',
        id: 'Pencocokan (evidence-verify.ts): gambar atau halaman PDF < 20 karakter compact -> not_checked; substring compact -> skor 1 (verified); < 24 karakter compact wajib cocok persis; selebihnya irisan 3-gram kata >= 0,8 -> verified, selain itu unverified + pindai halaman lain untuk foundOnPage.',
      },
      {
        en: 'Live eval 2026-11-18 (gemini-3.8-flash): A1 3/3 ok (fact recall 1.00, evidence 0.992, 192.6s), A2 2/3 ok (table 0.893 = 25/28, chart 0.72, evidence 1.00, 287.25s), B1 1/1 separate run (35/35 exact, 95.5s), B2 2/3 ok (23/23 fields, 8/8 rules, 44.95s).',
        id: 'Eval langsung 2026-11-18 (gemini-3.8-flash): A1 3/3 ok (fact recall 1,00, bukti 0,992, 192,6s), A2 2/3 ok (tabel 0,893 = 25/28, grafik 0,72, bukti 1,00, 287,25s), B1 1/1 run terpisah (35/35 persis, 95,5s), B2 2/3 ok (23/23 field, 8/8 aturan, 44,95s).',
      },
      {
        en: 'Known issues & quota: 20 RPD free-tier cap (HTTP 429 on A2#3, B1#1-3, B2#3), gemini-2.5-flash 404 on new keys, Table 5 scoring artifacts, Fig. 4 series swap (uncertainty recall 0), UploadForm.tsx empty file.type rejection, and StructuredView.tsx " / " vs " › " separator.',
        id: 'Isu & kuota: batas free-tier 20 RPD (HTTP 429 di A2#3, B1#1-3, B2#3), gemini-2.5-flash 404 di key baru, artefak skor Table 5, pertukaran seri Fig. 4 (uncertainty recall 0), penolakan file.type kosong di UploadForm.tsx, dan pemisah " / " vs " › " di StructuredView.tsx.',
      },
    ],
    code: [
      'apps/api/src/validation/evidence-verify.ts',
      'apps/api/src/validation/normalize.ts',
      'docs/EVALUATION.md',
      'docs/LIMITATIONS.md',
      'eval/results/2026-11-18T05-55-23-gemini.json',
      'eval/results/2026-11-18T05-53-21-gemini.json',
      'apps/web/src/components/UploadForm.tsx',
      'apps/web/src/components/StructuredView.tsx',
    ],
    questions: [
      {
        q: { en: 'How does evidence verification work, and why have a not_checked status?', id: 'Bagaimana cara kerja verifikasi bukti, dan kenapa ada status not_checked?' },
        a: {
          en: 'normalizeWords applies NFKC (expanding ligatures), strips soft hyphens, unifies dashes/quotes, rejoins hyphenated line breaks, and removes punctuation. compact() removes all spaces to ignore PDF extraction spacing glitches. If compact(excerpt) is a substring of the cited page, matchScore is 1. Excerpts under 24 compact chars must match exactly; longer ones pass as verified if at least 80% (SHINGLE_THRESHOLD = 0.8) of their word 3-grams appear on that page. Otherwise it is unverified and other pages are scanned for foundOnPage. Image inputs and PDF pages under 20 compact chars get not_checked (D5) because there is no independent text layer—marking them unverified would falsely imply a failed check.',
          id: 'normalizeWords menerapkan NFKC (mengurai ligatur), menghapus soft hyphen, menyamakan tanda pisah/kutip, menyambung kata yang terpenggal baris, dan membuang tanda baca. compact() menghapus semua spasi agar kebal terhadap artefak spasi text layer PDF. Jika compact(excerpt) adalah substring halaman yang dirujuk, matchScore bernilai 1. Kutipan di bawah 24 karakter compact wajib cocok persis; yang lebih panjang lolos sebagai verified jika minimal 80% (SHINGLE_THRESHOLD = 0,8) 3-gram katanya muncul di halaman itu. Jika gagal, statusnya unverified dan halaman lain dipindai untuk foundOnPage. Input gambar dan halaman PDF di bawah 20 karakter compact mendapat not_checked (D5) karena tidak ada text layer pembanding—menandainya unverified akan menyesatkan seolah cek gagal.',
        },
      },
      {
        q: { en: 'Walk through the live evaluation numbers and what they hide in Table 5 and Fig. 4.', id: 'Jelaskan angka evaluasi langsung dan apa yang tersembunyi di balik skor Table 5 serta Fig. 4.' },
        a: {
          en: 'From 2026-11-18 runs with gemini-3.8-flash: A1 scored 1.00 fact recall (14/14, 3/3 runs, 0.992 evidence validity, 192.6s mean); A2 scored 0.893 table cells (25/28) and 0.72 chart accuracy (0.64–0.80, 1.00 evidence validity, 287.25s mean, 2/3 runs); B1 scored 1.00 (35/35 fields, 95.5s, 1/1 separate run); B2 scored 1.00 (23/23 fields, 8/8 rules, 44.95s mean, 2/3 runs). In A2, all 3 Table 5 misses were scoring artefacts (two cells merged mean and SD like 0.57 (0.32), and one ground-truth header "HR" was ambiguous between T/B/D sub-columns where 0.15 was the true T value), making manual table accuracy 28/28. In contrast, Fig. 4 had real errors: the model swapped colour-coded grouped bar series (e.g. VH vs VV) without flagging uncertain, giving 0.72 accuracy and 0 uncertainty recall.',
          id: 'Dari run 2026-11-18 dengan gemini-3.8-flash: A1 mencatat fact recall 1,00 (14/14, 3/3 run, validitas bukti 0,992, rata-rata 192,6s); A2 mencatat sel tabel 0,893 (25/28) dan akurasi grafik 0,72 (0,64–0,80, validitas bukti 1,00, rata-rata 287,25s, 2/3 run); B1 mencatat 1,00 (35/35 field, 95,5s, 1/1 run terpisah); B2 mencatat 1,00 (23/23 field, 8/8 aturan, rata-rata 44,95s, 2/3 run). Di A2, seluruh 3 sel Table 5 yang meleset adalah artefak penilaian (2 sel menggabung mean dan SD seperti 0.57 (0.32), dan 1 header ground truth "HR" ambigu antara sub-kolom T/B/D padahal 0.15 benar untuk kolom T), sehingga akurasi tabel manualnya 28/28. Sebaliknya, Fig. 4 adalah error nyata: model menukar seri batang berkelompok berwarna (misalnya VH vs VV) tanpa menandai uncertain, menghasilkan akurasi 0,72 dan uncertainty recall 0.',
        },
      },
      {
        q: { en: 'What operational limits and UI known issues exist today?', id: 'Apa batasan operasional dan isu UI yang diketahui saat ini?' },
        a: {
          en: 'First, Google AI Studio free tier caps gemini-3.8-flash at 20 requests/day (which triggered HTTP 429 on A2 run 3, all 3 B1 runs in the full suite, and B2 run 3, while gemini-2.5-flash returned HTTP 404 on new keys); so pipeline.integration.test.ts gates its live replay test with it.skipIf(!fixtureExists) (D13). Second, Sample B is a 448×685 JPEG where image regions are not_checked. Third, two minor UI bugs remain in docs/LIMITATIONS.md: UploadForm.tsx checks ACCEPT.includes(f.type) so drag-and-drop with an empty file.type is rejected client-side despite server magic-byte detection, and StructuredView.tsx joins multi-level row headers with " / " instead of the " › " separator used in rendered Markdown.',
          id: 'Pertama, free tier Google AI Studio membatasi gemini-3.8-flash 20 request/hari (memicu HTTP 429 pada A2 run 3, semua 3 run B1 di suite penuh, dan B2 run 3, sedangkan gemini-2.5-flash mengembalikan HTTP 404 untuk key baru); karena itu pipeline.integration.test.ts memagari test replay langsung dengan it.skipIf(!fixtureExists) (D13). Kedua, Sample B berupa JPEG 448×685 yang region gambarnya berstatus not_checked. Ketiga, dua bug UI ringan tercatat di docs/LIMITATIONS.md: UploadForm.tsx mengecek ACCEPT.includes(f.type) sehingga drag-and-drop dengan file.type kosong ditolak di klien walau server memakai magic bytes, dan StructuredView.tsx menggabung header baris bertingkat dengan " / " alih-alih pemisah " › " yang dipakai Markdown.',
        },
      },
    ],
  },
];
