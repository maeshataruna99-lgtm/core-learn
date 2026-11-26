# Simulasi Live Coding Backend Developer (90 Menit)

Format tes: live coding tanpa diskusi. Bahasa: **TypeScript**. Stack Part 2: **NestJS + Prisma (SQLite) + class-validator + Jest/supertest**.

| Part | Waktu | Lokasi |
|---|---|---|
| 1. Algoritma | 25 mnt | `part1-algorithm.ts` (latihan), `part1-solutions.ts` (kunci) |
| 2. REST API + Prisma | 40 mnt | `api/` |
| 3. Code review | 25 mnt | `part3-code-review.ts` (umum), `part3-prisma-review.ts` (Prisma) |

## Workflow
- **00-05:** baca semua soal, catat input, output, constraint, edge case.
- **05-25 Part 1:** edge case dulu, solusi benar, lalu optimasi. Sebut kompleksitas di komentar.
- **25-65 Part 2:** schema Prisma dan migrasi, DTO validasi, service, controller, test. Endpoint inti dulu, pagination belakangan.
- **65-90 Part 3:** security dulu, lalu kualitas dan performa. Tulis: masalah, dampak, perbaikan.

## Perintah

```bash
# Part 1 (Node 24 langsung menjalankan .ts)
node practice-mgs/part1-algorithm.ts      # latihan, gagal sampai kamu isi
node practice-mgs/part1-solutions.ts      # kunci

# Part 2
cd practice-mgs/api
npm install
cp .env.example .env                      # Windows: copy .env.example .env
npx prisma migrate dev                    # buat DB, terapkan migrasi, jalankan seed
npm run db:seed                           # seed ulang (idempotent)
npm run db:reset                          # hapus DB, migrasi ulang, seed
npm start                                 # http://localhost:3000
npm test                                  # migrasi DB test lalu jalankan e2e

# Part 3
node practice-mgs/part3-code-review.ts
node practice-mgs/part3-prisma-review-fixed.ts # verifikasi kunci review Prisma
```

## Peta Part 2 (`api/`)
```
prisma/schema.prisma        model User, Ticket, index
prisma/migrations/          riwayat migrasi (git-tracked)
prisma/seed.ts              seed idempotent (upsert)
src/configure-app.ts        prefix /api/v1, ValidationPipe (whitelist), filter global
src/common/                 PrismaExceptionFilter: P2025 404, P2002 409, P2003 400
src/health/                 GET /health (di luar prefix, cek DB)
src/tickets/dto/            aturan validasi input
src/tickets/*.service.ts    aturan bisnis, update status atomik (updateMany)
src/tickets/*.controller.ts routing tipis
test/tickets.spec.ts        e2e: 201, 400, 404, 409, 204, pagination, race, health
```

## Bila tes tidak menyediakan starter
`npx @nestjs/cli new app`, lalu `npm i @prisma/client class-validator class-transformer`, `npm i -D prisma`, `npx prisma init --datasource-provider sqlite`. Latih urutan ini sampai di bawah 4 menit.

> Karena tidak ada diskusi, kode harus bisa dibaca sendiri: nama jelas, fungsi pendek, early return, komentar singkat hanya untuk asumsi.
