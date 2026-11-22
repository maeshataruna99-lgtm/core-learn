# Extraction: images.jpg

> **Instructions:** Extract all fields and checkboxes with values.

| Run | |
| --- | --- |
| Model | deepseek / deepseek-flash |
| Profile | tax-form |
| Pages processed | 1 of 1 (image) |
| Runtime | 127.1 s, 1 model call(s), 0 retries |
| Tokens | 4960 in / 22870 out |
| Started | 2026-11-22T02:01:10.398Z |

## Kop SPT (Header)

| Field | Value | Source and excerpt |
| --- | --- | --- |
| Tahun Pajak (tax year) | 2021 | image region x 72%, y 2%, 27% × 4%: “TAHUN PAJAK 2 0 2 1” _(excerpt not checked)_ |
| SPT Pembetulan Ke- (amendment number) | 0 | image region x 70%, y 4.8%, 29% × 3%: “SPT PEMBETULAN KE- 0” _(excerpt not checked)_ |
| NPWP (taxpayer id) | 12.345.678.9-000.000 | image region x 13%, y 7.8%, 36% × 2.2%: “NPWP 1 2 . 3 4 5 . 6 7 8 . 9 - 0 0 0 . 0 0 0” _(excerpt not checked)_ |
| Nama Wajib Pajak (taxpayer name) | — **[MISSING: label present but the fill line is empty]** | image region x 13%, y 9.8%, 36% × 2%: “NAMA WP” _(excerpt not checked)_ |
| Jenis Usaha (business type) | PERDAGANGAN | image region x 12%, y 11.7%, 22% × 2.4%: “JENIS USAHA PERDAGANGAN” _(excerpt not checked)_ |
| KLU (business classification code) | — **[UNREADABLE: masked in source]** | image region x 62%, y 11.7%, 18% × 2%: “KLU XX XX XX” _(excerpt not checked)_ |
| No. Telepon (phone) | — **[UNREADABLE: masked in source]** | image region x 12%, y 13.8%, 26% × 2%: “No. TELEPON XX - X X XX X X XX” _(excerpt not checked)_ |
| No. Faks (fax) | — **[UNREADABLE: masked in source]** | image region x 60%, y 13.8%, 20% × 2%: “NO. FAKS XX XX XX” _(excerpt not checked)_ |
| Periode Pembukuan (awal) | 2020 **[UNCERTAIN: low-resolution scan; month part of the start period is not legible]** | image region x 44%, y 15.6%, 16% × 2.2%: “PERIODE PEMBUKAAN (BULAN/TAHUN) 2020 s.d.” _(excerpt not checked)_ |
| Periode Pembukuan (akhir) | 2021 **[UNCERTAIN: low-resolution scan; month part of the end period is not legible]** | image region x 70%, y 15.6%, 16% × 2.2%: “s.d. 2021” _(excerpt not checked)_ |

### Laporan Keuangan

| Field | Value | Source and excerpt |
| --- | --- | --- |
| Laporan Keuangan (financial statements) › Diaudit (audited) | ☐ | image region x 42%, y 19.6%, 11% × 3%: “DIAUDIT” _(excerpt not checked)_ |
| Laporan Keuangan (financial statements) › Opini akuntan (auditor's opinion) | ☐ (state undetermined) **[UNREADABLE: cell state not resolvable at this image resolution]** | image region x 53%, y 19.6%, 12% × 3%: “OPINI AKUNTAN” _(excerpt not checked)_ |
| Laporan Keuangan (financial statements) › Tidak diaudit (not audited) | ☑ **[UNCERTAIN: mark in the row appears in the right-hand (Tidak diaudit) column but is very small]** | image region x 65%, y 19.6%, 25% × 3%: “TIDAK DIAUDIT” _(excerpt not checked)_ |

## I. Penghasilan Neto Fiskal

| Field | Value | Source and excerpt |
| --- | --- | --- |
| 1. Penghasilan neto fiskal dari kegiatan usaha (non operasional) (net fiscal income) | Rp62.628.902 | image region x 3%, y 35.2%, 93% × 2.2%: “Penghasilan neto fiskal dari kegiatan usaha (non operasional) (1) Rp62.628.902” _(excerpt not checked)_ |
| 2. Kompensasi kerugian fiskal (tidak termasuk butir 1a) (loss carry-forward) | Rp20.000.000 | image region x 3%, y 37.4%, 93% × 2%: “Kompensasi kerugian fiskal (tidak termasuk butir 1a) (2) Rp20.000.000” _(excerpt not checked)_ |
| 3. Penghasilan kena pajak (taxable income, 1-2) | Rp42.628.902 | image region x 3%, y 39.2%, 93% × 2%: “Penghasilan kena pajak (3) = (1) - (2) Rp42.628.902” _(excerpt not checked)_ |

## II. PPh Terutang

| Field | Value | Source and excerpt |
| --- | --- | --- |
| 4. PPh Terutang - pilihan tarif (tariff option) › 4a. Tarif Pasal 17 ayat (1) huruf b | ☐ (state undetermined) **[UNREADABLE: checkbox mark not resolvable at this image resolution]** | image region x 5%, y 43%, 60% × 2%: “4a. [ ] Tarif Pasal 17 ayat (1) huruf b x Penghasilan Kena Pajak (4a)” _(excerpt not checked)_ |
| 4. PPh Terutang - pilihan tarif (tariff option) › 4b. Tarif Pasal 17 ayat (2a) | ☐ (state undetermined) **[UNREADABLE: checkbox mark not resolvable at this image resolution]** | image region x 5%, y 44.6%, 60% × 2%: “4b. [ ] Tarif Pasal 17 ayat (2a) x Penghasilan Kena Pajak (4b)” _(excerpt not checked)_ |
| 4. PPh Terutang - pilihan tarif (tariff option) › 4c. Tarif Pasal 31E ayat (1) | ☐ (state undetermined) **[UNREADABLE: checkbox mark not resolvable at this image resolution]** | image region x 5%, y 46.1%, 60% × 2%: “4c. [ ] Tarif Pasal 31E ayat (1) x Penghasilan Kena Pajak (4c)” _(excerpt not checked)_ |
| 4. PPh terutang - Jumlah (4a + 4b + 4c) (income tax due) | Rp2.500.100 | image region x 30%, y 47%, 66% × 2.2%: “Jumlah (4a + 4b + 4c) (4) Rp2.500.100” _(excerpt not checked)_ |
| 7. PPh yang ditanggung pemerintah (tax borne by the government) | Rp0 | image region x 68%, y 51.8%, 29% × 2%: “PPh yang ditanggung pemerintah (7) Rp0” _(excerpt not checked)_ |
| 8a. Kredit pajak dalam negeri (Pasal 28) (domestic tax credit) | Rp600.000 | image region x 3%, y 53.5%, 94% × 2%: “KREDIT PAJAK DALAM NEGERI (Pasal 28) (8a) Rp600.000” _(excerpt not checked)_ |
| 8b. Kredit pajak luar negeri (Pasal 32) (foreign tax credit) | Rp0 | image region x 3%, y 55.2%, 94% × 2%: “KREDIT PAJAK LUAR NEGERI (Pasal 32) (8b) Rp0” _(excerpt not checked)_ |
| 8c. Jumlah kredit pajak (8a+8b) | Rp600.000 | image region x 3%, y 56.8%, 94% × 2%: “JUMLAH (8a + 8b) (8c) Rp600.000” _(excerpt not checked)_ |
| 9. Status PPh (tax status) › 9a. PPh yang harus dibayar sendiri (Pasal 29) | ☑ **[UNCERTAIN: small mark; consistent with a positive amount at (9)]** | image region x 4%, y 58.6%, 60% × 2.2%: “9. [ ] PPh YANG HARUS DIBAYAR SENDIRI (Pasal 29) (9)” _(excerpt not checked)_ |
| 9. Status PPh (tax status) › 9b. PPh yang lebih dipotong/dipungut (Pasal 28A) | ☐ | image region x 4%, y 60.3%, 60% × 2%: “[ ] PPh YANG LEBIH DIPOTONG/DIPUNGUT (Pasal 28A) (9b)” _(excerpt not checked)_ |
| Jumlah pada butir (9b) (amount for line 9b) | Rp0 | image region x 68%, y 60.3%, 29% × 2%: “(9b) Rp0” _(excerpt not checked)_ |
| STP PPh Pasal 25 (hanya pokok pajak) (tax collection notice, principal only) | Rp0 | image region x 3%, y 62%, 94% × 2.2%: “STP PPh Pasal 25 (hanya pokok pajak) (10) Rp0” _(excerpt not checked)_ |
| 11. Jumlah (9 + 10) (amount, 9-10c) | Rp1.900.100 | image region x 3%, y 64.2%, 94% × 2.2%: “JUMLAH (9 + 10) (11) Rp1.900.100” _(excerpt not checked)_ |
| 11. Status PPh (tax status) › 11a. PPh yang kurang dibayar (Pasal 29) | ☑ **[UNCERTAIN: mark and box edge are indistinct at this resolution; consistent with a positive amount at (11)]** | image region x 4%, y 64.2%, 60% × 2%: “11. [ ] PPh YANG KURANG DIBAYAR (Pasal 29)” _(excerpt not checked)_ |
| 11. Status PPh (tax status) › 11b. PPh yang lebih dibayar (Pasal 28A) | ☐ | image region x 4%, y 66%, 60% × 2.2%: “[ ] PPh YANG LEBIH DIBAYAR (Pasal 28A)” _(excerpt not checked)_ |
| 12. Tanggal penyetoran PPh kurang bayar (payment date) | 30-04-2022 **[UNCERTAIN: read from individual digit boxes in a low-resolution scan; month digit partially merged]** | image region x 55%, y 66.5%, 40% × 3.2%: “TANGGAL PENYETORAN 3 0 4 2 0 2 2” _(excerpt not checked)_ |

## Processing notes

- Pages 1-1: Single low-resolution image (448x685) of SPT Tahunan 1771 page 1; no text layer, so all excerpts are transcriptions of visible print. Masked values (KLU 'XX XX XX', No. Telepon, No. Faks) are reported as unreadable/masked, not guessed. The amount column of section II was aligned row-by-row from the scan: the printed amounts observed are Rp2.500.100 (line 4), Rp0 (line 7), Rp600.000 (8a), Rp0 (8b), Rp600.000 (8c), Rp1.900.100 (9), Rp0 (9b), Rp0 (STP PPh 25 / line 10) and Rp1.900.100 (line 11); rows 5 and 6 appear blank and were therefore not emitted. Row-number/amount alignment across lines 5-10 is the least certain part of this extraction because the row labels are only a few pixels high. Tariff checkboxes 4a-4c and the 'Opini akuntan' cell could not be resolved and are marked unreadable.

## Validation

Overall: **WARN** · evidence verified 0, not found 0, not checked 32

- **WARN** (completeness) 6 of 37 known field(s) not extracted (may be outside these instructions): negara_domisili, line.5, line.6, line.9, line.10a, line.10c.
- **PASS** (rules) Line 3 = line 1 - line 2: 42.628.902 = 42.628.902 ✓
- **PASS** (rules) Line 6 = line 4 + line 5: not evaluated (line.6 not extracted).
- **PASS** (rules) Line 8c = line 8a + line 8b: 600.000 = 600.000 ✓
- **PASS** (rules) Line 9 = line 6 - line 7 - line 8c: not evaluated (line.9 not extracted).
- **PASS** (rules) Line 10c = line 10a + line 10b: not evaluated (line.10c not extracted).
- **PASS** (rules) Line 11 = line 9 - line 10c: not evaluated (line.9 not extracted).
- **PASS** (rules) Line 4 under art. 31E is at least 11% of line 3 (22% rate with the 50% facility): not evaluated (line.4c is not checked).
- **PASS** (rules) Line 4 under art. 31E is at most 22% of line 3 (standard rate): not evaluated (line.4c is not checked).
