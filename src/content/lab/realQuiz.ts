import type { LabQuiz } from '../../core/lab.ts';

// Questions per real-run screen. Every fact comes from the two saved DeepSeek results.
export const realQuiz: Record<string, LabQuiz[]> = {
  'tax-result': [
    {
      q: { en: 'Why does the SPT 1771 run show "0 verified · 32 unchecked"?', id: 'Kenapa run SPT 1771 menampilkan "0 verified · 32 unchecked"?' },
      options: [
        { en: 'DeepSeek refused to verify its own answers', id: 'DeepSeek menolak memverifikasi jawabannya sendiri' },
        { en: 'The input is an image, so there is no text layer to compare excerpts with', id: 'Inputnya gambar, jadi tidak ada text layer untuk membandingkan kutipan' },
        { en: 'Verification is switched off for the tax-form profile', id: 'Verifikasi dimatikan untuk profil tax-form' },
        { en: 'All 32 excerpts were wrong', id: 'Ke-32 kutipan salah semua' },
      ],
      answer: 1,
      explain: { en: 'Excerpt verification needs a PDF text layer. A scan has none, so every item stays "not checked"; that is not a failure.', id: 'Verifikasi kutipan butuh text layer PDF. Scan tidak punya, jadi semua item tetap "not checked"; itu bukan kegagalan.' },
    },
    {
      q: { en: 'Why is the overall validation WARN and not PASS?', id: 'Kenapa validasi keseluruhan WARN, bukan PASS?' },
      options: [
        { en: '6 of 37 fields the profile knows were not extracted', id: '6 dari 37 field yang dikenal profil tidak terekstrak' },
        { en: 'The run needed a retry', id: 'Run-nya butuh retry' },
        { en: 'The Markdown was malformed', id: 'Markdown-nya rusak' },
        { en: 'An arithmetic rule failed', id: 'Ada aturan aritmetika yang gagal' },
      ],
      answer: 0,
      explain: { en: 'The completeness check found negara_domisili, line.5, line.6, line.9, line.10a and line.10c missing. The run had 0 retries and the rules that could run passed.', id: 'Pengecekan completeness menemukan negara_domisili, line.5, line.6, line.9, line.10a, dan line.10c tidak ada. Run-nya 0 retry dan aturan yang bisa dijalankan lolos.' },
    },
    {
      q: { en: 'How many model calls did the single-image run need?', id: 'Berapa panggilan model yang dibutuhkan run satu gambar ini?' },
      options: [{ en: '1', id: '1' }, { en: '3', id: '3' }, { en: '5', id: '5' }, { en: '32, one per item', id: '32, satu per item' }],
      answer: 0,
      explain: { en: 'One page is one batch, so one call returned all 32 items in 127 seconds.', id: 'Satu halaman adalah satu batch, jadi satu panggilan mengembalikan ke-32 item dalam 127 detik.' },
    },
  ],
  'tax-source': [
    {
      q: { en: 'How is an image citation stored?', id: 'Bagaimana sitasi pada gambar disimpan?' },
      options: [
        { en: 'As pixel coordinates of the original file', id: 'Sebagai koordinat piksel file asli' },
        { en: 'As a page number', id: 'Sebagai nomor halaman' },
        { en: 'As a normalised bbox from 0 to 1, shown as percentages', id: 'Sebagai bbox ternormalisasi 0 sampai 1, ditampilkan sebagai persentase' },
        { en: 'As a CSS selector', id: 'Sebagai selector CSS' },
      ],
      answer: 2,
      explain: { en: 'Region (70%, 5% · 29%×3%) comes from bbox [0.70, 0.05, 0.29, 0.03]. Normalised values fit any display size.', id: 'Region (70%, 5% · 29%×3%) berasal dari bbox [0.70, 0.05, 0.29, 0.03]. Nilai ternormalisasi cocok untuk ukuran tampilan apa pun.' },
    },
    {
      q: { en: 'The box for "SPT Pembetulan Ke-" lands on the tax-year digits. What does that teach?', id: 'Kotak untuk "SPT Pembetulan Ke-" jatuh di digit tahun pajak. Apa pelajarannya?' },
      options: [
        { en: 'The UI draws boxes in the wrong place', id: 'UI menggambar kotak di tempat yang salah' },
        { en: 'Region coordinates from a model are approximate; read the excerpt with the box', id: 'Koordinat region dari model bersifat perkiraan; baca kutipan bersama kotaknya' },
        { en: 'The item belongs to another page', id: 'Item itu milik halaman lain' },
        { en: 'Images cannot have regions', id: 'Gambar tidak bisa punya region' },
      ],
      answer: 1,
      explain: { en: 'The UI draws exactly the bbox it receives. The model placed it near, not on, the right line, so the excerpt "SPT PEMBETULAN KE- 0" is the better clue.', id: 'UI menggambar persis bbox yang diterimanya. Model menaruhnya dekat, bukan tepat, di baris yang benar, jadi kutipan "SPT PEMBETULAN KE- 0" adalah petunjuk yang lebih baik.' },
    },
    {
      q: { en: '"Nama Wajib Pajak" is marked MISSING, yet the scan shows "PT ABC EFG". What is the right reaction?', id: '"Nama Wajib Pajak" ditandai MISSING, padahal scan menampilkan "PT ABC EFG". Apa reaksi yang tepat?' },
      options: [
        { en: 'Trust the marker, since markers mean the model was careful', id: 'Percayai marker, karena marker berarti model berhati-hati' },
        { en: 'Delete the item from the result', id: 'Hapus item dari hasil' },
        { en: 'Treat markers as claims too, and check the source before using the value', id: 'Anggap marker juga sebagai klaim, dan cek sumbernya sebelum memakai nilainya' },
        { en: 'Rerun with the fake provider', id: 'Jalankan ulang dengan provider fake' },
      ],
      answer: 2,
      explain: { en: 'Markers make doubt visible, but the model can still be wrong about what is on the page. The Source Inspector exists so a person can check.', id: 'Marker membuat keraguan terlihat, tetapi model tetap bisa salah soal isi halaman. Source Inspector ada agar manusia bisa mengecek.' },
    },
  ],
  'tax-structured': [
    {
      q: { en: 'Which item types did the SPT 1771 run produce?', id: 'Tipe item apa saja yang dihasilkan run SPT 1771?' },
      options: [
        { en: 'Prose and tables', id: 'Prose dan tabel' },
        { en: 'Fields and checkboxes only', id: 'Hanya field dan checkbox' },
        { en: 'Charts and fields', id: 'Chart dan field' },
        { en: 'All five types', id: 'Kelima tipe' },
      ],
      answer: 1,
      explain: { en: '22 fields and 10 checkboxes, matching the instruction "Extract all fields and checkboxes with values."', id: '22 field dan 10 checkbox, sesuai instruksi "Extract all fields and checkboxes with values."' },
    },
    {
      q: { en: 'How was the masked KLU value "XX XX XX" reported?', id: 'Bagaimana nilai KLU yang disamarkan "XX XX XX" dilaporkan?' },
      options: [
        { en: 'As an empty string', id: 'Sebagai string kosong' },
        { en: 'As a guessed code', id: 'Sebagai kode tebakan' },
        { en: 'As "XX XX XX" with no marker', id: 'Sebagai "XX XX XX" tanpa marker' },
        { en: 'As unreadable, with the reason "masked in source"', id: 'Sebagai unreadable, dengan alasan "masked in source"' },
      ],
      answer: 3,
      explain: { en: 'The rules forbid guessing: an unreadable value gets a marker and a reason. The run used unreadable 7 times.', id: 'Aturannya melarang menebak: nilai yang tidak terbaca mendapat marker dan alasan. Run ini memakai unreadable 7 kali.' },
    },
    {
      q: { en: 'Why are fields like line.3 given keys such as "line.3"?', id: 'Kenapa field seperti baris 3 diberi key seperti "line.3"?' },
      options: [
        { en: 'So profile rules can find the values and recompute totals', id: 'Agar aturan profil bisa menemukan nilainya dan menghitung ulang total' },
        { en: 'Only for sorting', id: 'Hanya untuk pengurutan' },
        { en: 'Because the PDF has bookmarks', id: 'Karena PDF punya bookmark' },
        { en: 'To translate the labels', id: 'Untuk menerjemahkan label' },
      ],
      answer: 0,
      explain: { en: 'The tax-form profile declares 37 field keys. Rules like "line 3 = line 1 − line 2" refer to those keys.', id: 'Profil tax-form mendeklarasikan 37 key field. Aturan seperti "baris 3 = baris 1 − baris 2" merujuk ke key itu.' },
    },
  ],
  'tax-findings': [
    {
      q: { en: 'Which arithmetic rule passed in this run?', id: 'Aturan aritmetika mana yang lolos di run ini?' },
      options: [
        { en: 'Line 9 = line 6 − line 7 − line 8c', id: 'Baris 9 = baris 6 − baris 7 − baris 8c' },
        { en: 'Line 11 = line 9 − line 10c', id: 'Baris 11 = baris 9 − baris 10c' },
        { en: 'Line 3 = line 1 − line 2 (42.628.902 = 42.628.902)', id: 'Baris 3 = baris 1 − baris 2 (42.628.902 = 42.628.902)' },
        { en: 'None, they all failed', id: 'Tidak ada, semuanya gagal' },
      ],
      answer: 2,
      explain: { en: 'Line 3 and line 8c (600.000 = 600.000) passed. Lines 9 and 11 were "not evaluated" because line.9 was not extracted.', id: 'Baris 3 dan baris 8c (600.000 = 600.000) lolos. Baris 9 dan 11 "not evaluated" karena line.9 tidak terekstrak.' },
    },
    {
      q: { en: 'What happens to a rule whose input field was not extracted?', id: 'Apa yang terjadi pada aturan yang field inputnya tidak terekstrak?' },
      options: [
        { en: 'It fails the whole run', id: 'Menggagalkan seluruh run' },
        { en: 'It is reported as "not evaluated" instead of guessed', id: 'Dilaporkan "not evaluated", bukan ditebak' },
        { en: 'It assumes the missing value is zero', id: 'Menganggap nilai yang hilang nol' },
        { en: 'It is hidden', id: 'Disembunyikan' },
      ],
      answer: 1,
      explain: { en: 'Treating a missing value as zero would make a rule pass or fail for the wrong reason, so it is skipped and said so.', id: 'Menganggap nilai hilang sebagai nol akan membuat aturan lolos atau gagal karena alasan yang salah, jadi dilewati dan dinyatakan.' },
    },
    {
      q: { en: 'Why do arithmetic rules matter most on a scan?', id: 'Kenapa aturan aritmetika paling penting pada scan?' },
      options: [
        { en: 'Scans are always wrong', id: 'Scan selalu salah' },
        { en: 'They make the model faster', id: 'Membuat model lebih cepat' },
        { en: 'They replace the need for a person', id: 'Menggantikan kebutuhan akan manusia' },
        { en: 'They are an independent check that needs no text layer', id: 'Merupakan pengecekan independen yang tidak butuh text layer' },
      ],
      answer: 3,
      explain: { en: 'Excerpt verification cannot run on an image, but recomputing totals from other lines still catches a misread digit.', id: 'Verifikasi kutipan tidak bisa jalan pada gambar, tetapi menghitung ulang total dari baris lain tetap menangkap digit yang salah baca.' },
    },
  ],
  'paper-result': [
    {
      q: { en: 'How did DeepSeek receive the 18-page PDF?', id: 'Bagaimana DeepSeek menerima PDF 18 halaman?' },
      options: [
        { en: 'As the raw PDF file', id: 'Sebagai file PDF mentah' },
        { en: 'As pages rendered to images (inputMode rendered-pages)', id: 'Sebagai halaman yang dirender menjadi gambar (inputMode rendered-pages)' },
        { en: 'As the text layer only', id: 'Hanya sebagai text layer' },
        { en: 'As one long screenshot', id: 'Sebagai satu screenshot panjang' },
      ],
      answer: 1,
      explain: { en: 'The DeepSeek adapter does not accept raw PDF parts, so the planner picked rendered-pages from its capabilities.', id: 'Adapter DeepSeek tidak menerima bagian PDF mentah, jadi planner memilih rendered-pages berdasarkan kemampuannya.' },
    },
    {
      q: { en: 'How many excerpts were found on their cited page?', id: 'Berapa kutipan yang ditemukan di halaman yang disebut?' },
      options: [{ en: '35 of 35', id: '35 dari 35' }, { en: '18 of 18', id: '18 dari 18' }, { en: '88 of 89', id: '88 dari 89' }, { en: '0 of 89', id: '0 dari 89' }],
      answer: 2,
      explain: { en: 'There are 89 evidence entries across 35 items; one was found on a different page.', id: 'Ada 89 bukti untuk 35 item; satu ditemukan di halaman lain.' },
    },
    {
      q: { en: 'Why were 5 model calls needed?', id: 'Kenapa butuh 5 panggilan model?' },
      options: [
        { en: 'Pages were sent in batches of up to 4', id: 'Halaman dikirim dalam batch berisi paling banyak 4' },
        { en: 'Four calls failed and were retried', id: 'Empat panggilan gagal dan diulang' },
        { en: 'One call per profile rule', id: 'Satu panggilan per aturan profil' },
        { en: 'One call per table', id: 'Satu panggilan per tabel' },
      ],
      answer: 0,
      explain: { en: 'Pages 1–4, 5–8, 9–12, 13–16 and 17–18. The run had 0 retries.', id: 'Halaman 1–4, 5–8, 9–12, 13–16, dan 17–18. Run-nya 0 retry.' },
    },
  ],
  'paper-source': [
    {
      q: { en: 'What does "Excerpt found on the cited page · 100%" mean?', id: 'Apa arti "Excerpt found on the cited page · 100%"?' },
      options: [
        { en: 'The model is 100% confident', id: 'Model yakin 100%' },
        { en: 'All items on the page are correct', id: 'Semua item di halaman itu benar' },
        { en: 'The page was fully read', id: 'Halaman dibaca seluruhnya' },
        { en: 'The quoted text appears exactly on that page of the PDF text layer', id: 'Teks kutipan muncul persis di halaman itu pada text layer PDF' },
      ],
      answer: 3,
      explain: { en: 'The score is computed by the API, not reported by the model: exact match gives 1, otherwise the share of matching word 3-grams.', id: 'Skornya dihitung API, bukan dilaporkan model: cocok persis memberi 1, selain itu proporsi 3-gram kata yang cocok.' },
    },
    {
      q: { en: 'Why do Table 4 and Table 6 excerpts score 82% and 90% instead of 100%?', id: 'Kenapa kutipan Tabel 4 dan Tabel 6 mendapat skor 82% dan 90%, bukan 100%?' },
      options: [
        { en: 'Table text breaks across lines and cells, so only most word 3-grams match', id: 'Teks tabel terpotong antar baris dan sel, jadi hanya sebagian besar 3-gram kata yang cocok' },
        { en: 'The tables were invented', id: 'Tabelnya dikarang' },
        { en: 'The pages were not rendered', id: 'Halamannya tidak dirender' },
        { en: 'Tables are never checked', id: 'Tabel tidak pernah dicek' },
      ],
      answer: 0,
      explain: { en: 'Above the shingle threshold an excerpt still counts as verified; the score shows how close it was.', id: 'Di atas ambang shingle, kutipan tetap dihitung terverifikasi; skornya menunjukkan seberapa dekat.' },
    },
    {
      q: { en: 'The "Method overview" excerpt cites p. 7 but is found on p. 6. What does the app do?', id: 'Kutipan "Method overview" menyebut hlm. 7 tetapi ditemukan di hlm. 6. Apa yang dilakukan aplikasi?' },
      options: [
        { en: 'Silently changes the page to 6', id: 'Diam-diam mengganti halamannya menjadi 6' },
        { en: 'Drops the item', id: 'Membuang item itu' },
        { en: 'Marks it not found, records foundOnPage 6 and raises a WARN finding', id: 'Menandainya not found, mencatat foundOnPage 6, dan memunculkan temuan WARN' },
        { en: 'Fails the run', id: 'Menggagalkan run' },
      ],
      answer: 2,
      explain: { en: 'The citation is kept as the model gave it, and the user is told where the text really is.', id: 'Sitasi dipertahankan seperti yang diberikan model, dan pengguna diberi tahu di mana teks itu sebenarnya berada.' },
    },
  ],
  'paper-details': [
    {
      q: { en: 'Which batch returned the most items?', id: 'Batch mana yang mengembalikan item paling banyak?' },
      options: [
        { en: '#1 (p.1–4) with 3 items', id: '#1 (hlm. 1–4) dengan 3 item' },
        { en: '#3 (p.9–12) with 11 items', id: '#3 (hlm. 9–12) dengan 11 item' },
        { en: '#5 (p.17–18) with 7 items', id: '#5 (hlm. 17–18) dengan 7 item' },
        { en: 'All returned the same number', id: 'Semuanya mengembalikan jumlah yang sama' },
      ],
      answer: 1,
      explain: { en: 'Pages 9–12 hold the method details and main results, so that batch found the most to extract.', id: 'Halaman 9–12 memuat detail metode dan hasil utama, jadi batch itu menemukan paling banyak untuk diekstrak.' },
    },
    {
      q: { en: 'The last batch reports participants as "missing", though p. 6 describes 63 volunteers. Why?', id: 'Batch terakhir melaporkan participants "missing", padahal hlm. 6 menyebut 63 relawan. Kenapa?' },
      options: [
        { en: 'The model forgot what it read earlier in the same call', id: 'Model lupa apa yang dibacanya sebelumnya di panggilan yang sama' },
        { en: 'Page 6 failed to render', id: 'Halaman 6 gagal dirender' },
        { en: 'The research-paper profile has no participants field', id: 'Profil research-paper tidak punya field participants' },
        { en: 'Each batch only sees its own pages, so pp. 17–18 had no participant details', id: 'Tiap batch hanya melihat halamannya sendiri, jadi hlm. 17–18 tidak punya detail partisipan' },
      ],
      answer: 3,
      explain: { en: 'Batching keeps each call within limits, at the cost of cross-batch context. The model notes say so for each range.', id: 'Batching menjaga tiap panggilan dalam batas, dengan harga hilangnya konteks antar batch. Catatan model menyebut itu untuk tiap rentang.' },
    },
    {
      q: { en: 'What are model notes for?', id: 'Untuk apa catatan model?' },
      options: [
        { en: 'To say what each page range contained and what was not found there', id: 'Menyebut isi tiap rentang halaman dan apa yang tidak ditemukan di sana' },
        { en: 'To store the API key', id: 'Menyimpan API key' },
        { en: 'To list retries', id: 'Mendaftar retry' },
        { en: 'To translate the result', id: 'Menerjemahkan hasil' },
      ],
      answer: 0,
      explain: { en: 'Notes make the model\'s limits visible, for example "Participant count … not reported in this page range".', id: 'Catatan membuat batas model terlihat, misalnya "Participant count … not reported in this page range".' },
    },
  ],
  'paper-structured': [
    {
      q: { en: 'Which item types did the paper run produce?', id: 'Tipe item apa saja yang dihasilkan run paper?' },
      options: [
        { en: 'Fields and checkboxes', id: 'Field dan checkbox' },
        { en: 'Only prose', id: 'Hanya prose' },
        { en: '30 prose, 3 tables, 2 fields', id: '30 prose, 3 tabel, 2 field' },
        { en: 'Charts only', id: 'Hanya chart' },
      ],
      answer: 2,
      explain: { en: 'The instruction asked for summaries, so most items are prose; tables 3, 4 and 6 and the funding and data availability fields were also extracted.', id: 'Instruksinya meminta ringkasan, jadi sebagian besar item berupa prose; tabel 3, 4, dan 6 serta field pendanaan dan ketersediaan data juga diekstrak.' },
    },
    {
      q: { en: 'What does Table 3 contain, per the extraction?', id: 'Apa isi Tabel 3 menurut hasil ekstraksi?' },
      options: [
        { en: 'Eye-tracking data availability', id: 'Ketersediaan data eye-tracking' },
        { en: 'Demographic data and correlation to task performance', id: 'Data demografis dan korelasinya dengan performa tugas' },
        { en: 'Percentage improvement over paper-based maintenance', id: 'Persentase peningkatan dibanding perawatan berbasis kertas' },
        { en: 'The reference list', id: 'Daftar pustaka' },
      ],
      answer: 1,
      explain: { en: 'Table 3 has 5 rows; its first row starts "CG | 10 | M = 7; F = 3 | 26.6 (4.55)". Table 4 is the percentage improvement and Table 6 the eye-tracking availability.', id: 'Tabel 3 punya 5 baris; baris pertamanya diawali "CG | 10 | M = 7; F = 3 | 26.6 (4.55)". Tabel 4 adalah persentase peningkatan dan Tabel 6 ketersediaan eye-tracking.' },
    },
    {
      q: { en: 'Why can a structured card jump to the Source Inspector?', id: 'Kenapa kartu terstruktur bisa melompat ke Source Inspector?' },
      options: [
        { en: 'Both read the same selected index held by ResultView', id: 'Keduanya membaca indeks terpilih yang sama yang dipegang ResultView' },
        { en: 'They are the same component', id: 'Keduanya komponen yang sama' },
        { en: 'The browser links them with anchors', id: 'Browser menghubungkannya dengan anchor' },
        { en: 'The API sends the jump target', id: 'API mengirim target lompatan' },
      ],
      answer: 0,
      explain: { en: 'ResultView owns selectedItem and passes it to both StructuredView and SourcePanel, so the selection stays in sync across tabs.', id: 'ResultView memegang selectedItem dan meneruskannya ke StructuredView dan SourcePanel, jadi pilihan tetap sinkron antar tab.' },
    },
  ],
};
