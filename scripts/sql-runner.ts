// Runs a SQL script on an in-memory SQLite database (node:sqlite) and prints the rows of the
// last statement, columns joined by "|". For EXPLAIN QUERY PLAN it prints the `detail` column.
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const statements = readFileSync(process.argv[2]!, 'utf8')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);
const last = statements.pop()!;
const db = new DatabaseSync(':memory:');
for (const s of statements) db.exec(s);

const rows = db.prepare(last).all() as Record<string, unknown>[];
const explain = /^explain/i.test(last);
for (const row of rows) {
  console.log(explain ? String(row.detail) : Object.values(row).join('|'));
}
