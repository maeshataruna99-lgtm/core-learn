import type { LabExample } from '../../core/lab.ts';

// Values quoted from two real runs with PROVIDER=deepseek (model deepseek-flash):
//   images.jpg  - a scanned SPT 1771 page, profile tax-form, "Extract all fields and checkboxes with values."
//   1-s2.0.pdf  - an 18-page research paper, profile research-paper,
//                 "Summarize objectives, method, participants, and key quantitative results with page references."
export const TAX = 'images.jpg';
export const PAPER = '1-s2.0.pdf';

export const realExamples: Record<string, LabExample[]> = {
  provider: [
    { file: TAX, value: 'deepseek · deepseek-flash', note: { en: 'Chosen for both runs. The model is multimodal, so the scan went in as an image.', id: 'Dipilih untuk kedua run. Modelnya multimodal, jadi scan dikirim sebagai gambar.' } },
    { file: PAPER, value: 'deepseek · deepseek-flash · inputMode rendered-pages', note: { en: 'DeepSeek does not accept raw PDF parts, so the 18 pages were rendered to images first.', id: 'DeepSeek tidak menerima bagian PDF mentah, jadi 18 halaman dirender menjadi gambar dulu.' } },
  ],
  profiles: [
    { file: TAX, value: 'Indonesian corporate tax return (SPT 1771) → profile tax-form' },
    { file: PAPER, value: 'Research paper → profile research-paper' },
  ],
  instructions: [
    { file: TAX, value: 'Extract all fields and checkboxes with values.' },
    { file: PAPER, value: 'Summarize objectives, method, participants, and key quantitative results with page references.' },
  ],
  runningPanel: [
    { file: TAX, value: '127.1 s · 1 model call', note: { en: 'One small image still took two minutes, which is why the panel needs a timer and honest phase text.', id: 'Satu gambar kecil tetap butuh dua menit, karena itu panel perlu timer dan teks fase yang jujur.' } },
    { file: PAPER, value: '332.2 s · 5 model calls (batches of 4 pages)' },
  ],
  legend: [
    { file: TAX, value: 'missing 1 · unreadable 7 · uncertain 6\nunreadable: KLU (business classification code) (masked in source)', note: { en: 'Masked values such as "XX XX XX" were marked unreadable instead of guessed.', id: 'Nilai yang disamarkan seperti "XX XX XX" ditandai unreadable, bukan ditebak.' } },
    { file: PAPER, value: 'missing: Participants (Participant details (number, age, sex, recruitment) are not reported on pages 17–18; …)', note: { en: 'Each batch only sees its own pages, so the last batch reports participants as missing even though an earlier batch found them on p. 6.', id: 'Tiap batch hanya melihat halamannya sendiri, jadi batch terakhir melaporkan participants sebagai missing walaupun batch sebelumnya menemukannya di hlm. 6.' } },
  ],
  kpis: [
    { file: TAX, value: 'Validation WARN · 0 verified · 0 unverified · 32 unchecked\n1 / 1 pages · image · tax-form\n127.1 s · 1 call · 0 retries\n4,960 / 22,870 tokens', note: { en: 'An image has no text layer, so no excerpt can be verified; every item stays "unchecked".', id: 'Gambar tidak punya text layer, jadi tidak ada kutipan yang bisa diverifikasi; semua item tetap "unchecked".' } },
    { file: PAPER, value: 'Validation WARN · 88 verified · 1 unverified · 0 unchecked\n18 / 18 pages · rendered-pages · research-paper\n332.2 s · 5 calls · 0 retries\n67,567 / 53,126 tokens' },
  ],
  markdown: [
    { file: TAX, value: '## Kop SPT (Header)\n| NPWP (taxpayer id) | 12.345.678.9-000.000 | image region x 13%, y 7.8%, 36% × 2.2%: “NPWP 1 2 . 3 4 5 . 6 7 8 . 9 - 0 0 0 . 0 0 0” _(excerpt not checked)_ |' },
    { file: PAPER, value: '### Objectives\n\nTo use the Multiple Resource Model and joint cognitive systems perspective to guide AR modality design for HMD-based maintenance assembly, … (pp. 1–2).\n\n> Source: p. 1: “This paper uses a theoretically-driven approach to interaction design …” _(excerpt verified in source)_' },
  ],
  itemList: [
    { file: TAX, value: '32 items: 22 field, 10 checkbox\nFIELD  Nama Wajib Pajak (taxpayer name)  MISSING', note: { en: 'This marker is wrong: the scan does show "PT ABC EFG" next to the label. Markers are the model\'s claim too, so a person still has to check them.', id: 'Marker ini salah: scan jelas menampilkan "PT ABC EFG" di samping labelnya. Marker juga klaim model, jadi tetap harus dicek manusia.' } },
    { file: PAPER, value: '35 items: 30 prose, 3 table, 2 field\nPROSE  Method overview  (red dot: excerpt not found on the cited page)' },
  ],
  sourceDetail: [
    { file: TAX, value: 'Region (70%, 5% · 29%×3%)\nNot checked (no text layer to compare with)\n“SPT PEMBETULAN KE- 0”' },
    { file: PAPER, value: 'Page 2 · Excerpt found on the cited page · 100%\n“In addition, this study also recorded and analysed eye gaze behaviours and user perception …”' },
  ],
  region: [
    { file: TAX, value: 'bbox [0.70, 0.05, 0.29, 0.03] → the box drawn over the top-right of the scan', note: { en: 'The box lands near the right line but not exactly on it: regions from a model are approximate.', id: 'Kotaknya jatuh dekat baris yang benar tetapi tidak persis: region dari model bersifat perkiraan.' } },
    { file: PAPER, value: 'pdf-page 2 → the PDF opened in an iframe at #page=2' },
  ],
  typeFilter: [
    { file: TAX, value: 'All 32 · Fields 22 · Checkboxes 10' },
    { file: PAPER, value: 'All 35 · Prose 30 · Tables 3 · Fields 2' },
  ],
  structList: [
    { file: TAX, value: 'checkbox  Tidak diaudit (not audited) = ☑  UNCERTAIN' },
    { file: PAPER, value: 'table  Table 3. Demographic data and correlation to task performance (5 rows)\nfirst row: CG | 10 | M = 7; F = 3 | 26.6 (4.55) | …' },
  ],
  sourceFilters: [
    { file: PAPER, value: 'Not found → 1 item (Method overview)', note: { en: 'With 35 items, the filter takes a reviewer straight to the one doubtful excerpt.', id: 'Dengan 35 item, filter membawa reviewer langsung ke satu kutipan yang meragukan.' } },
  ],
};
