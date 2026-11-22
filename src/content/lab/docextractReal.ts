import type { LabPart, LabProject, LabScreen } from '../../core/lab.ts';
import { cdeRealShots } from './cdeRealShots.generated.ts';
import { docExtractParts } from './docextract.ts';
import { PAPER, TAX } from './realExamples.ts';
import { realQuiz } from './realQuiz.ts';

// Real runs with PROVIDER=deepseek on two sample files. Screens are 1440x900 viewport captures of the production
// build; JSON results were saved during the capture and the quoted values below come from them.
const W = 'apps/web/src';
const A = 'apps/api/src';

const newParts: LabPart[] = [
  {
    id: 'findings',
    title: { en: 'Validation findings', id: 'Temuan validasi' },
    what: { en: 'A yellow banner that lists every check that did not pass, with its category: completeness, evidence, rules or format. It opens to show the messages.', id: 'Banner kuning yang mendaftar setiap pengecekan yang tidak lolos, beserta kategorinya: completeness, evidence, rules, atau format. Bisa dibuka untuk melihat pesannya.' },
    why: { en: 'A run can succeed and still be imperfect. Instead of failing, the API reports warnings so the user decides. Only checks with status other than pass are shown, so a clean run shows no banner at all.', id: 'Run bisa berhasil tetapi tetap tidak sempurna. Alih-alih gagal, API melaporkan peringatan agar pengguna yang memutuskan. Hanya pengecekan yang statusnya bukan pass yang ditampilkan, jadi run yang bersih tidak menampilkan banner sama sekali.' },
    component: 'RunMeta (details.banner-warn)',
    focus: 'cde-evidence-eval',
    examples: [
      { file: TAX, value: 'warn [completeness] 6 of 37 known field(s) not extracted (may be outside these instructions): negara_domisili, line.5, line.6, line.9, line.10a, line.10c.', note: { en: 'The tax-form profile knows 37 field keys, so it can tell which ones the model skipped.', id: 'Profil tax-form mengenal 37 key field, jadi bisa tahu mana yang dilewati model.' } },
      { file: PAPER, value: 'warn [evidence] Excerpts found on a different page than cited: b2-method cites p. 7, found on p. 6', note: { en: 'The quote was real but the page number was off by one; the verifier caught it.', id: 'Kutipannya benar tetapi nomor halamannya meleset satu; verifier menangkapnya.' } },
    ],
    files: [
      { path: `${W}/components/RunMeta.tsx`, role: { en: 'Renders the findings list.', id: 'Merender daftar temuan.' }, lang: 'tsx',
        code: `{problems.length > 0 && (\n  <details className="banner banner-warn">\n    <summary>\n      {problems.length} validation finding{problems.length === 1 ? '' : 's'}\n    </summary>` },
      { path: `${A}/validation/completeness.ts`, role: { en: 'Page coverage, missing profile fields, empty tables.', id: 'Cakupan halaman, field profil yang hilang, tabel kosong.' } },
      { path: `${A}/validation/validate.ts`, role: { en: 'Folds all checks into the report.', id: 'Merangkum semua pengecekan menjadi laporan.' } },
    ],
  },
  {
    id: 'rules',
    title: { en: 'Arithmetic rules on the tax form', id: 'Aturan aritmetika pada form pajak' },
    what: { en: 'Checks from the tax-form profile that recompute form lines, such as line 3 = line 1 − line 2, and report whether the extracted numbers agree.', id: 'Pengecekan dari profil tax-form yang menghitung ulang baris form, seperti baris 3 = baris 1 − baris 2, dan melaporkan apakah angka hasil ekstraksi cocok.' },
    why: { en: 'A model can misread one digit and still sound confident. Recomputing totals from other lines is an independent check that needs no text layer, so it works even on a scan. The rules live in the profile JSON, not in code; a rule whose inputs were not extracted is reported as "not evaluated" instead of guessed.', id: 'Model bisa salah membaca satu digit dan tetap terdengar yakin. Menghitung ulang total dari baris lain adalah pengecekan independen yang tidak butuh text layer, jadi tetap jalan pada scan. Aturannya ada di JSON profil, bukan di kode; aturan yang inputnya tidak terekstrak dilaporkan "not evaluated", bukan ditebak.' },
    component: 'RunMeta findings + Markdown "Validation" section',
    focus: 'cde-profiles-prompt',
    examples: [
      { file: TAX, value: 'pass rules  Line 3 = line 1 - line 2: 42.628.902 = 42.628.902 ✓\npass rules  Line 8c = line 8a + line 8b: 600.000 = 600.000 ✓\npass rules  Line 9 = line 6 - line 7 - line 8c: not evaluated (line.9 not extracted).' },
    ],
    files: [
      { path: `${A}/validation/form-rules.ts`, role: { en: 'Generic evaluator for profile arithmetic rules over field keys.', id: 'Evaluator umum untuk aturan aritmetika profil atas key field.' } },
      { path: `${A}/profiles/presets/tax-form.json`, role: { en: 'Declares the SPT 1771 rules and the `id-ID` number format.', id: 'Mendeklarasikan aturan SPT 1771 dan format angka `id-ID`.' } },
    ],
  },
  {
    id: 'batches',
    title: { en: 'Batches', id: 'Batch' },
    what: { en: 'One pill per model call: which pages it covered, how many items it returned and how long it took. Failed or repaired batches are marked.', id: 'Satu pill per panggilan model: halaman yang dicakup, jumlah item yang dikembalikan, dan lama prosesnya. Batch yang gagal atau diperbaiki ditandai.' },
    why: { en: 'Long documents do not fit one call, so the planner splits pages into batches sized by the provider\'s capabilities and sends them one by one with rate pacing and retries. If one batch fails for good, the others still produce a partial result instead of nothing.', id: 'Dokumen panjang tidak muat dalam satu panggilan, jadi planner memecah halaman menjadi batch sesuai kemampuan provider dan mengirimnya satu per satu dengan pengaturan laju dan retry. Kalau satu batch gagal total, batch lain tetap menghasilkan hasil parsial, bukan kosong.' },
    component: 'RunMeta (.batch-grid)',
    focus: 'cde-ingest-batching',
    examples: [
      { file: PAPER, value: '#1 (p.1–4) 3 items · 42.6s\n#2 (p.5–8) 5 items · 87.3s\n#3 (p.9–12) 11 items · 78.7s\n#4 (p.13–16) 9 items · 103.6s\n#5 (p.17–18) 7 items · 16.3s' },
      { file: TAX, value: '1 batch (p.1) · 32 items · 127s', note: { en: 'A single image is one batch, so the Execution details section is not shown for this run.', id: 'Satu gambar adalah satu batch, jadi bagian Execution details tidak ditampilkan untuk run ini.' } },
    ],
    files: [
      { path: `${A}/pipeline/orchestrator.ts`, role: { en: 'Plans batches and runs them sequentially; skips the rest on fatal errors.', id: 'Merencanakan batch dan menjalankannya berurutan; melewati sisanya saat error fatal.' } },
      { path: `${A}/pipeline/merge.ts`, role: { en: 'Merges batch items with unique ids in page order.', id: 'Menggabungkan item batch dengan id unik sesuai urutan halaman.' } },
      { path: `${W}/components/RunMeta.tsx`, role: { en: 'Renders one pill per batch.', id: 'Merender satu pill per batch.' }, lang: 'tsx',
        code: `{result.batches.map((b) => (\n  <div key={b.index} className={\`batch-pill batch-\${b.status}\`}>\n    <span className="mono">\n      #{b.index + 1} (p.{b.pages[0]}\n      {b.pages.length > 1 ? \`–\${b.pages.at(-1)}\` : ''})\n    </span>` },
    ],
  },
  {
    id: 'notes',
    title: { en: 'Model notes', id: 'Catatan model' },
    what: { en: 'Short notes the model writes per batch about what the pages contained and what it could not find.', id: 'Catatan singkat yang ditulis model per batch tentang isi halaman dan apa yang tidak ditemukannya.' },
    why: { en: 'Notes make the model\'s limits visible. They also reveal a design trade-off: each batch only sees its own pages, so a later batch may say something is missing that an earlier batch found.', id: 'Catatan membuat batas kemampuan model terlihat. Catatan juga memperlihatkan trade-off desain: tiap batch hanya melihat halamannya sendiri, jadi batch belakangan bisa mengatakan sesuatu hilang padahal batch sebelumnya menemukannya.' },
    component: 'RunMeta (details.banner-neutral)',
    examples: [
      { file: PAPER, value: 'Pages 1-4: … Participant count, demographics, and the full experimental procedure are not reported in this page range; they are presumably provided later in the article.' },
      { file: TAX, value: 'Pages 1-1: Single low-resolution image (448x685) of SPT Tahunan 1771 page 1; no text layer, so all excerpts are transcriptions of visible print. Masked values (KLU \'XX XX XX\', No. Telepon, No. Faks) are reported as unreadable/masked, not guessed. …' },
    ],
    files: [
      { path: `${A}/pipeline/output-schema.ts`, role: { en: 'The model output schema includes a notes field next to items.', id: 'Skema output model memuat field notes di samping items.' } },
      { path: `${W}/components/RunMeta.tsx`, role: { en: 'Lists the notes in Execution details.', id: 'Mendaftar catatan di Execution details.' } },
    ],
  },
  {
    id: 'activeItem',
    title: { en: 'Selected item', id: 'Item terpilih' },
    what: { en: 'The highlighted row in the item list; its evidence fills the detail area below.', id: 'Baris yang disorot di daftar item; buktinya mengisi area detail di bawah.' },
    why: { en: 'The row uses `aria-current`, so assistive tech knows which item the detail belongs to. Selecting resets the evidence tab to the first entry.', id: 'Baris memakai `aria-current`, jadi teknologi bantu tahu detail itu milik item mana. Memilih item mengatur ulang tab bukti ke entri pertama.' },
    component: 'SourcePanel (.item-btn[aria-current])',
    examples: [
      { file: TAX, value: 'FIELD  SPT Pembetulan Ke- (amendment number) = "0"' },
      { file: PAPER, value: 'PROSE  Method  (green dot: verified)' },
    ],
    files: [{ path: `${W}/components/SourcePanel.tsx`, role: { en: 'Renders the item buttons.', id: 'Merender tombol item.' } }],
  },
  {
    id: 'sourceRef',
    title: { en: 'Source reference', id: 'Referensi sumber' },
    what: { en: 'Where the item came from: "Page N" for a PDF, or "Region (x, y · w×h)" in percent for an image. With several evidence entries, a chip per entry appears above it.', id: 'Asal item: "Page N" untuk PDF, atau "Region (x, y · w×h)" dalam persen untuk gambar. Kalau ada beberapa bukti, chip per bukti muncul di atasnya.' },
    why: { en: 'Every item must point to a place a person can open. The same `SourceRef` type covers both cases, so the UI turns it into a label with one small function.', id: 'Setiap item harus menunjuk ke tempat yang bisa dibuka manusia. Tipe `SourceRef` yang sama mencakup kedua kasus, jadi UI mengubahnya menjadi label dengan satu fungsi kecil.' },
    component: 'SourcePanel (.source-ref-row)',
    examples: [
      { file: TAX, value: 'Region (70%, 5% · 29%×3%)' },
      { file: PAPER, value: 'Page 2   (chips: Page 2 · Page 4)' },
    ],
    files: [
      { path: `${W}/components/SourcePanel.tsx`, role: { en: 'Formats the reference label.', id: 'Memformat label referensi.' }, lang: 'tsx',
        code: `function sourceText(ev: Evidence): string {\n  if (ev.source.kind === 'pdf-page') return \`Page \${ev.source.page}\`;\n  const [x = 0, y = 0, w = 0, h = 0] = ev.source.bbox;\n  const p = (n: number) => \`\${Math.round(n * 100)}%\`;\n  return \`Region (\${p(x)}, \${p(y)} · \${p(w)}×\${p(h)})\`;\n}` },
    ],
  },
  {
    id: 'verifyPill',
    title: { en: 'Verification result', id: 'Hasil verifikasi' },
    what: { en: 'Whether the quoted excerpt was found on the cited page, with the match score as a percentage.', id: 'Apakah kutipan ditemukan di halaman yang disebut, beserta skor kecocokan dalam persen.' },
    why: { en: '100% means an exact match after normalisation; lower scores mean partial word 3-gram overlap, which happens with tables or line breaks. Images show "Not checked" because there is no text to compare with.', id: '100% berarti cocok persis setelah normalisasi; skor lebih rendah berarti kecocokan 3-gram kata sebagian, yang terjadi pada tabel atau pemenggalan baris. Gambar menampilkan "Not checked" karena tidak ada teks untuk dibandingkan.' },
    component: 'SourcePanel (.verify-pill)',
    focus: 'cde-evidence-eval',
    examples: [
      { file: PAPER, value: 'Excerpt found on the cited page · 100%\nTable 4 excerpt · 82% · Table 6 excerpt · 90%\nb2-method · 8% → found on p. 6 instead of cited p. 7' },
      { file: TAX, value: 'Not checked (no text layer to compare with) · 32 of 32 items' },
    ],
    files: [
      { path: `${A}/validation/evidence-verify.ts`, role: { en: 'Computes `matchScore` and `foundOnPage`.', id: 'Menghitung `matchScore` dan `foundOnPage`.' } },
      { path: `${W}/components/SourcePanel.tsx`, role: { en: 'Shows the status text and score.', id: 'Menampilkan teks status dan skor.' }, lang: 'tsx',
        code: `<span className={\`verify-pill verify-\${ev.verification ?? 'not_checked'}\`}>\n  {VERIFY_TEXT[ev.verification ?? 'not_checked']}\n  {ev.matchScore !== undefined && \` · \${Math.round(ev.matchScore * 100)}%\`}\n</span>` },
    ],
  },
  {
    id: 'excerpt',
    title: { en: 'Quoted excerpt', id: 'Kutipan' },
    what: { en: 'The exact text the model says supports the item, quoted from the document.', id: 'Teks persis yang menurut model mendukung item itu, dikutip dari dokumen.' },
    why: { en: 'The prompt requires a verbatim excerpt for every item, because a quote can be checked and a paraphrase cannot. On a scan, the excerpt is the model\'s transcription of the printed text.', id: 'Prompt mewajibkan kutipan verbatim untuk setiap item, karena kutipan bisa dicek sedangkan parafrase tidak. Pada scan, kutipan adalah transkripsi model atas teks yang tercetak.' },
    component: 'SourcePanel (blockquote.excerpt)',
    examples: [
      { file: TAX, value: '“SPT PEMBETULAN KE- 0”' },
      { file: PAPER, value: '“In addition, this study also recorded and analysed eye gaze behaviours and user perception to capture possible factors that contribute to a variation in performance and user safety”' },
    ],
    files: [{ path: `${A}/pipeline/prompt-builder.ts`, role: { en: 'System rules that demand a verbatim excerpt and a source per item.', id: 'Aturan sistem yang mewajibkan kutipan verbatim dan sumber per item.' } }],
  },
  {
    id: 'pdfFrame',
    title: { en: 'Cited PDF page', id: 'Halaman PDF yang disebut' },
    what: { en: 'The browser\'s PDF viewer opened at the cited page, with an Open PDF link for a full tab.', id: 'Viewer PDF browser yang terbuka di halaman yang disebut, dengan link Open PDF untuk tab penuh.' },
    why: { en: 'Using the built-in viewer with a `#page=` fragment avoids shipping a PDF renderer to the browser. The `key` includes the page, so changing item reloads the frame at the new page.', id: 'Memakai viewer bawaan dengan fragmen `#page=` menghindari pengiriman renderer PDF ke browser. `key` memuat nomor halaman, jadi berganti item memuat ulang frame di halaman baru.' },
    component: 'SourcePanel > Viewer (iframe.pdf-frame)',
    examples: [{ file: PAPER, value: 'iframe src = blob:…#page=2&view=FitH' }],
    files: [
      { path: `${W}/components/SourcePanel.tsx`, role: { en: 'The PDF branch of the viewer.', id: 'Cabang PDF pada viewer.' }, lang: 'tsx',
        code: `<iframe\n  key={\`\${url}-\${ev.source.page}\`}\n  className="pdf-frame"\n  title={\`\${file.name}, page \${ev.source.page}\`}\n  src={\`\${url}#page=\${ev.source.page}&view=FitH\`}\n/>` },
    ],
  },
  {
    id: 'regionBox',
    title: { en: 'Region box on the scan', id: 'Kotak region pada scan' },
    what: { en: 'The blue box the inspector draws over the cited area of the image.', id: 'Kotak biru yang digambar inspector di atas area gambar yang disebut.' },
    why: { en: 'This is the real counterpart of the fake run\'s full-image box. It shows how close a model\'s coordinates are, and why the excerpt and the box should be read together.', id: 'Ini padanan nyata dari kotak seluruh gambar pada run fake. Kotak ini menunjukkan seberapa dekat koordinat dari model, dan kenapa kutipan serta kotaknya perlu dibaca bersama.' },
    component: 'SourcePanel > Viewer (.region)',
    examples: [{ file: TAX, value: 'bbox [0.70, 0.05, 0.29, 0.03] for "SPT Pembetulan Ke-"' }],
    files: [{ path: `${W}/components/SourcePanel.tsx`, role: { en: 'Positions the box with CSS percentages.', id: 'Menempatkan kotak dengan persentase CSS.' } }],
  },
];

const reused = ['kpis', 'tabs', 'markdown', 'itemList', 'sourceDetail', 'region', 'typeFilter', 'structList', 'sourceFilters'];
const parts: LabPart[] = [...newParts, ...docExtractParts.filter((p) => reused.includes(p.id))];

const screens: LabScreen[] = [
  {
    id: 'tax-result',
    title: { en: 'SPT 1771: result', id: 'SPT 1771: hasil' },
    intro: { en: 'images.jpg with the tax-form profile. 32 items in 127 s; the validation is WARN because 6 known fields were not extracted.', id: 'images.jpg dengan profil tax-form. 32 item dalam 127 detik; validasinya WARN karena 6 field yang dikenal tidak terekstrak.' },
    spots: [
      { part: 'kpis', box: 'kpis' }, { part: 'findings', box: 'findings' }, { part: 'tabs', box: 'tabs' },
      { part: 'markdown', box: 'markdown' }, { part: 'itemList', box: 'itemList' }, { part: 'sourceDetail', box: 'sourceDetail' },
    ],
  },
  {
    id: 'tax-source',
    title: { en: 'SPT 1771: region evidence', id: 'SPT 1771: bukti region' },
    intro: { en: 'A field selected in the inspector, with its region drawn on the scan.', id: 'Sebuah field dipilih di inspector, dengan region-nya digambar di atas scan.' },
    spots: [
      { part: 'activeItem', box: 'activeItem' }, { part: 'itemList', box: 'itemList' }, { part: 'sourceRef', box: 'sourceRef' },
      { part: 'excerpt', box: 'excerpt' }, { part: 'region', box: 'region' }, { part: 'regionBox', box: 'regionBox' },
    ],
  },
  {
    id: 'tax-structured',
    title: { en: 'SPT 1771: structured items', id: 'SPT 1771: item terstruktur' },
    intro: { en: 'Fields and checkboxes as cards, each with its marker and region.', id: 'Field dan checkbox sebagai kartu, masing-masing dengan marker dan region-nya.' },
    spots: [{ part: 'typeFilter', box: 'typeFilter' }, { part: 'structList', box: 'firstCard' }],
  },
  {
    id: 'tax-findings',
    title: { en: 'SPT 1771: findings and rules', id: 'SPT 1771: temuan dan aturan' },
    intro: { en: 'The findings banner opened. The arithmetic rules passed where their inputs were extracted.', id: 'Banner temuan dibuka. Aturan aritmetika lolos di tempat inputnya terekstrak.' },
    spots: [{ part: 'findings', box: 'findings' }, { part: 'rules', box: 'findings' }, { part: 'kpis', box: 'kpis' }],
  },
  {
    id: 'paper-result',
    title: { en: 'Paper: result', id: 'Paper: hasil' },
    intro: { en: '1-s2.0.pdf (18 pages) with the research-paper profile. 35 items from 5 batches in 332 s; 88 of 89 excerpts verified.', id: '1-s2.0.pdf (18 halaman) dengan profil research-paper. 35 item dari 5 batch dalam 332 detik; 88 dari 89 kutipan terverifikasi.' },
    spots: [
      { part: 'kpis', box: 'kpis' }, { part: 'batches', box: 'details' }, { part: 'tabs', box: 'tabs' },
      { part: 'markdown', box: 'markdown' }, { part: 'itemList', box: 'itemList' }, { part: 'sourceDetail', box: 'sourceDetail' },
    ],
  },
  {
    id: 'paper-source',
    title: { en: 'Paper: verified page evidence', id: 'Paper: bukti halaman terverifikasi' },
    intro: { en: 'An item with two evidence entries (pages 2 and 4); the excerpt was found on page 2 at 100%.', id: 'Item dengan dua bukti (halaman 2 dan 4); kutipannya ditemukan di halaman 2 dengan skor 100%.' },
    spots: [
      { part: 'sourceFilters', box: 'filters' }, { part: 'activeItem', box: 'activeItem' }, { part: 'sourceRef', box: 'sourceRef' },
      { part: 'verifyPill', box: 'verifyPill' }, { part: 'excerpt', box: 'excerpt' }, { part: 'pdfFrame', box: 'pdfFrame' },
    ],
  },
  {
    id: 'paper-details',
    title: { en: 'Paper: batches and notes', id: 'Paper: batch dan catatan' },
    intro: { en: 'Execution details opened: five batches of up to four pages and one note per batch.', id: 'Execution details dibuka: lima batch berisi paling banyak empat halaman dan satu catatan per batch.' },
    spots: [
      { part: 'kpis', box: 'kpis' }, { part: 'findings', box: 'findings' }, { part: 'notes', box: 'notes' }, { part: 'batches', box: 'batches' },
    ],
  },
  {
    id: 'paper-structured',
    title: { en: 'Paper: structured items', id: 'Paper: item terstruktur' },
    intro: { en: 'Prose sections, tables and fields; the first card is the objectives summary.', id: 'Bagian prose, tabel, dan field; kartu pertama adalah ringkasan tujuan.' },
    spots: [{ part: 'typeFilter', box: 'typeFilter' }, { part: 'structList', box: 'firstCard' }],
  },
];

for (const s of screens) s.quiz = realQuiz[s.id];

export const docExtractRealLab: LabProject = {
  id: 'cde-real',
  tab: { en: 'Real runs (DeepSeek)', id: 'Hasil nyata (DeepSeek)' },
  icon: 'flame',
  title: { en: 'Real extraction runs with DeepSeek', id: 'Run ekstraksi nyata dengan DeepSeek' },
  intro: {
    en: 'Two real runs with deepseek-flash: a scanned SPT 1771 page and an 18-page research paper. Same method as the UI tour: open each spot to see the component, the code, and what it produced for both files.',
    id: 'Dua run nyata dengan deepseek-flash: satu halaman scan SPT 1771 dan paper riset 18 halaman. Metodenya sama dengan tur UI: buka tiap titik untuk melihat komponen, kode, dan hasilnya untuk kedua file.',
  },
  repo: 'https://github.com/maeshataruna99-lgtm/configurable-document-extraction',
  outputs: [
    { file: 'images.extraction.md', href: '/lab/cde-real/images.extraction.md' },
    { file: '1-s2.0.extraction.md', href: '/lab/cde-real/1-s2.0.extraction.md' },
  ],
  imageDir: '/lab/cde-real',
  captures: cdeRealShots,
  parts,
  screens,
};
