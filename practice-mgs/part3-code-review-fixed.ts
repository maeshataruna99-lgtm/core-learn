import type { DbClient } from './part3-code-review.ts';

/**
 * PART 3: HASIL PERBAIKAN CODE REVIEW (CLEAN & SECURE)
 */

const HIGH_TIER_THRESHOLD = 500_000;
const HIGH_TIER_RATE = 0.15;
const MID_TIER_THRESHOLD = 200_000;
const MID_TIER_RATE = 0.05;

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

export async function getInvoiceHandlerSafe(
  req: { params: { id: string }; user: { id: string; role: string } },
  res: { status: (code: number) => { json: (body: unknown) => void } },
  db: DbClient,
) {
  try {
    const invoiceId = req.params.id.trim();
    if (!invoiceId) {
      return res.status(400).json({ error: { code: 'INVALID_ID', message: 'Invoice ID is required' } });
    }

    // 1. Parameterized query + explicit columns (hindari SELECT *)
    const rows = await db.query(
      'SELECT id, user_id, total_amount, status, created_at FROM invoices WHERE id = $1',
      [invoiceId],
    );
    const invoice = rows[0];
    if (!invoice) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    // 2. Authorization check (cegah IDOR)
    if (req.user.role !== 'ADMIN' && invoice.user_id !== req.user.id) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    const items = await db.query(
      'SELECT id, name, qty, unit_price FROM invoice_items WHERE invoice_id = $1',
      [invoiceId],
    );

    return res.status(200).json({ data: { invoice, items } });
  } catch (err) {
    console.error('[getInvoiceHandlerSafe] unexpected error:', err);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
}

export async function updateProfileHandlerSafe(
  req: { user: { id: string }; body: Record<string, unknown> },
  res: { status: (code: number) => { json: (body: unknown) => void } },
  db: DbClient,
) {
  try {
    // Allowlist field yang boleh diubah user (cegah Mass Assignment)
    const allowedName = typeof req.body.name === 'string' ? req.body.name.trim() : undefined;
    if (!allowedName || allowedName.length < 2 || allowedName.length > 80) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'name must be 2-80 characters' } });
    }

    await db.query('UPDATE users SET name = $1 WHERE id = $2', [allowedName, req.user.id]);
    return res.status(200).json({ data: { updated: true } });
  } catch (err) {
    console.error('[updateProfileHandlerSafe] unexpected error:', err);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
}

export function calculateDiscountSafe(total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  if (total > HIGH_TIER_THRESHOLD) return Math.round(total * HIGH_TIER_RATE);
  if (total > MID_TIER_THRESHOLD) return Math.round(total * MID_TIER_RATE);
  return 0;
}
