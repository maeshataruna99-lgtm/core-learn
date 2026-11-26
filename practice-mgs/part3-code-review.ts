/**
 * PART 3: CODE REVIEW CHALLENGE (Target: 20-25 menit)
 *
 * Tugas: Temukan minimal 7 celah keamanan & masalah kualitas kode pada file ini
 * sebelum membuka `part3-code-review-fixed.ts`.
 *
 * Petunjuk cepat:
 * - Cek SQL Injection, Secret Management, Authorization (IDOR), Mass Assignment,
 *   Error Information Leak, Error Handling, Performance (N+1), Magic Numbers.
 */

export interface DbClient {
  query: (sql: string, params?: unknown[]) => Promise<Array<Record<string, unknown>>>;
}

// ISSUE 1: Hardcoded secret langsung di source code
const JWT_SECRET = 'mgs-super-secret-12345';

export async function getInvoiceHandler(
  req: { params: { id: string }; user: { id: string; role: string } },
  res: { status: (code: number) => { json: (body: unknown) => void } },
  db: DbClient,
) {
  try {
    // ISSUE 2: SQL Injection karena string interpolation langsung dari input user
    const rows = await db.query(`SELECT * FROM invoices WHERE id = '${req.params.id}'`);
    const invoice = rows[0];
    if (!invoice) {
      return res.status(404).json({ message: 'Not found' });
    }

    // ISSUE 3: Broken Access Control / IDOR — tidak cek apakah invoice milik req.user.id (kecuali ADMIN)
    // ISSUE 4: N+1 / Extra unbounded query jika dipanggil dalam loop, atau select '*' mengekspos kolom sensitif
    const items = await db.query(`SELECT * FROM invoice_items WHERE invoice_id = '${req.params.id}'`);

    return res.status(200).json({ invoice, items, tokenHint: JWT_SECRET.slice(0, 3) });
  } catch (err) {
    // ISSUE 5: Stack trace / internal DB error bocor ke client
    return res.status(500).json({ error: String(err), stack: err instanceof Error ? err.stack : undefined });
  }
}

export async function updateProfileHandler(
  req: { user: { id: string }; body: Record<string, unknown> },
  res: { status: (code: number) => { json: (body: unknown) => void } },
  db: DbClient,
) {
  try {
    // ISSUE 6: Mass Assignment — user bisa mengirim { role: 'ADMIN', balance: 999999 }
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map((f, idx) => `${f} = $${idx + 1}`).join(', ');

    await db.query(`UPDATE users SET ${setClause} WHERE id = $${fields.length + 1}`, [...values, req.user.id]);
    return res.status(200).json({ ok: true });
  } catch {
    // ISSUE 7: Empty catch / error ditelan — mengembalikan 200 atau diam saja tanpa log
    return res.status(200).json({ ok: true });
  }
}

export function calculateDiscount(total: number): number {
  // ISSUE 8: Magic numbers tanpa konstanta/penjelasan + tidak ada guard untuk nilai negatif
  if (total > 500000) return total * 0.15;
  if (total > 200000) return total * 0.05;
  return 0;
}
