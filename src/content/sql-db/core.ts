import type { Card } from '../../core/types.ts';

const base = { track: 'sql-db' } as const;
const pg = 'https://www.postgresql.org/docs/current';

// Cards with language "sql" are executed on SQLite (node:sqlite) by scripts/verify-output.ts,
// so they only test behaviour that is the same in PostgreSQL.
export const cards: Card[] = [
  // ---- indexes ----
  {
    ...base, topic: 'indexes', id: 'sql-db/indexes/plan-uses-index', type: 'output', level: 'beginner', tags: ['index', 'explain'],
    language: 'sql',
    code: `CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, name TEXT);
CREATE INDEX idx_users_email ON users(email);
EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'a@x.com';`,
    options: [
      'SCAN users',
      'SEARCH users USING INDEX idx_users_email (email=?)',
      'SEARCH users USING INTEGER PRIMARY KEY (rowid=?)',
      'SCAN users USING COVERING INDEX idx_users_email',
    ],
    answerIndex: 1,
    verifiedOutput: 'SEARCH users USING INDEX idx_users_email (email=?)',
    explanation: 'An equality filter on an indexed column lets the planner seek into the index (SEARCH) instead of reading every row (SCAN). PostgreSQL shows the same idea as Index Scan versus Seq Scan.',
    docsUrl: `${pg}/using-explain.html`,
  },
  {
    ...base, topic: 'indexes', id: 'sql-db/indexes/function-on-column', type: 'output', level: 'intermediate', tags: ['index', 'sargable'],
    language: 'sql',
    code: `CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, name TEXT);
CREATE INDEX idx_users_email ON users(email);
EXPLAIN QUERY PLAN SELECT * FROM users WHERE lower(email) = 'a@x.com';`,
    options: [
      'SEARCH users USING INDEX idx_users_email (email=?)',
      'SCAN users',
      'SEARCH users USING INTEGER PRIMARY KEY (rowid=?)',
      'The query is rejected',
    ],
    answerIndex: 1,
    verifiedOutput: 'SCAN users',
    explanation: 'Wrapping the indexed column in a function hides it from the index. Store normalized values, or create an expression index on lower(email) (supported by PostgreSQL and SQLite).',
    docsUrl: `${pg}/indexes-expressional.html`,
  },
  {
    ...base, topic: 'indexes', id: 'sql-db/indexes/leading-wildcard-like', type: 'output', level: 'intermediate', tags: ['index', 'like'],
    language: 'sql',
    code: `CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, name TEXT);
CREATE INDEX idx_users_email ON users(email);
EXPLAIN QUERY PLAN SELECT * FROM users WHERE email LIKE '%@x.com';`,
    options: [
      'SEARCH users USING INDEX idx_users_email (email>? AND email<?)',
      'SCAN users',
      'SEARCH users USING INDEX idx_users_email (email=?)',
      'SCAN users USING COVERING INDEX idx_users_email',
    ],
    answerIndex: 1,
    verifiedOutput: 'SCAN users',
    explanation: 'A B-tree orders values from their first character, so a pattern that starts with % cannot seek. Use a trailing wildcard (\'abc%\'), or a trigram/full-text index for contains searches.',
    docsUrl: `${pg}/pgtrgm.html`,
  },
  {
    ...base, topic: 'indexes', id: 'sql-db/indexes/skip-leading-column', type: 'output', level: 'advanced', tags: ['index', 'composite'],
    language: 'sql',
    code: `CREATE TABLE orders (id INTEGER PRIMARY KEY, company_id INTEGER, created_at TEXT);
CREATE INDEX idx_orders_company_created ON orders(company_id, created_at);
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE created_at > '2026-01-01';`,
    options: [
      'SEARCH orders USING INDEX idx_orders_company_created (created_at>?)',
      'SCAN orders',
      'SEARCH orders USING INTEGER PRIMARY KEY (rowid=?)',
      'SEARCH orders USING COVERING INDEX idx_orders_company_created (company_id=?)',
    ],
    answerIndex: 1,
    verifiedOutput: 'SCAN orders',
    explanation: 'The index starts with company_id. Filtering only on created_at cannot use it for a seek, so add a separate index or put the filter column first.',
    docsUrl: `${pg}/indexes-multicolumn.html`,
  },
  {
    ...base, topic: 'indexes', id: 'sql-db/indexes/leading-and-range', type: 'output', level: 'advanced', tags: ['index', 'composite'],
    language: 'sql',
    code: `CREATE TABLE orders (id INTEGER PRIMARY KEY, company_id INTEGER, created_at TEXT);
CREATE INDEX idx_orders_company_created ON orders(company_id, created_at);
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE company_id = 7 AND created_at > '2026-01-01';`,
    options: [
      'SCAN orders',
      'SEARCH orders USING COVERING INDEX idx_orders_company_created (company_id=? AND created_at>?)',
      'SEARCH orders USING INTEGER PRIMARY KEY (rowid=?)',
      'SCAN orders USING INDEX idx_orders_company_created',
    ],
    answerIndex: 1,
    verifiedOutput: 'SEARCH orders USING COVERING INDEX idx_orders_company_created (company_id=? AND created_at>?)',
    explanation: 'Equality on the leading column followed by a range on the next is the ideal composite-index shape. "Covering" means every column the query needs is in the index, so the table is never read.',
    docsUrl: `${pg}/indexes-index-only-scans.html`,
  },
  {
    ...base, topic: 'indexes', id: 'sql-db/indexes/write-cost', type: 'mcq', level: 'beginner', tags: ['index', 'tradeoffs'],
    question: 'What is the main cost of adding an index?',
    options: [
      'Slower INSERT/UPDATE/DELETE and more disk space, because the index must be maintained',
      'Slower SELECT queries on that table',
      'The table can no longer be altered',
      'Queries return rows in a different order',
    ],
    answerIndex: 0,
    explanation: 'Every write also updates each index on the table. Index the columns your queries actually filter, join and sort on, not everything.',
    docsUrl: `${pg}/indexes-intro.html`,
  },
  // ---- explain ----
  {
    ...base, topic: 'explain', id: 'sql-db/explain/analyze-vs-explain', type: 'flashcard', level: 'intermediate', tags: ['explain', 'postgres'],
    front: 'EXPLAIN vs EXPLAIN ANALYZE in PostgreSQL',
    back: 'EXPLAIN shows the planner\'s estimated plan without running the query. EXPLAIN ANALYZE actually executes it and adds real timings and row counts, so wrap data-changing statements in a transaction you roll back.',
    explanation: 'Compare estimated rows with actual rows: a big gap usually means stale statistics (run ANALYZE).',
    docsUrl: `${pg}/sql-explain.html`,
  },
  {
    ...base, topic: 'explain', id: 'sql-db/explain/seq-scan-not-bad', type: 'mcq', level: 'intermediate', tags: ['explain', 'postgres'],
    question: 'EXPLAIN shows a Seq Scan on a 50-row table even though an index exists. What is the likely reason?',
    options: [
      'Reading 50 rows sequentially is cheaper than using the index, so the planner chose it',
      'The index is corrupt',
      'The query must be rewritten with a hint',
      'PostgreSQL ignores indexes on small tables forever',
    ],
    answerIndex: 0,
    explanation: 'The planner picks the cheapest plan by cost. Sequential scans win for tiny tables or when a query returns most rows. Test index usage on realistic data volumes.',
    docsUrl: `${pg}/using-explain.html`,
  },
  // ---- n-plus-one ----
  {
    ...base, topic: 'n-plus-one', id: 'sql-db/n-plus-one/batch-in-clause', type: 'bugspot', level: 'intermediate', tags: ['orm', 'prisma'],
    language: 'ts',
    code: `const orders = await prisma.order.findMany();
const result = [];
for (const o of orders) {
  const customer = await prisma.customer.findUnique({ where: { id: o.customerId } });
  result.push({ ...o, customer });
}`,
    buggyLines: [4],
    explanation: 'One query per order is the N+1 pattern: 1 for orders plus N for customers. Load them together with include: { customer: true }, or fetch with findMany({ where: { id: { in: ids } } }) and join in memory.',
    source: { repo: 'maeshataruna99-lgtm/core-forge-light' },
    docsUrl: 'https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries',
  },
  // ---- pagination ----
  {
    ...base, topic: 'pagination', id: 'sql-db/pagination/keyset-result', type: 'output', level: 'intermediate', tags: ['pagination', 'keyset'],
    language: 'sql',
    code: `CREATE TABLE p (id INTEGER PRIMARY KEY, t TEXT);
INSERT INTO p VALUES (1,'a'),(2,'b'),(3,'c'),(4,'d'),(5,'e');
SELECT id FROM p WHERE id > 2 ORDER BY id LIMIT 2;`,
    options: ['1 2', '2 3', '3 4', '3 4 5'],
    answerIndex: 2,
    verifiedOutput: '3\n4',
    explanation: 'Keyset (cursor) pagination remembers the last id seen and asks for the rows after it. It stays fast on deep pages because the index seeks straight to the cursor.',
    docsUrl: 'https://use-the-index-luke.com/no-offset',
  },
  {
    ...base, topic: 'pagination', id: 'sql-db/pagination/offset-cost', type: 'mcq', level: 'intermediate', tags: ['pagination'],
    question: 'Why does `OFFSET 100000 LIMIT 20` get slower on deeper pages?',
    options: [
      'The database still has to produce and discard the first 100000 rows',
      'LIMIT disables the index',
      'OFFSET locks the table',
      'Offsets above 10000 are not allowed',
    ],
    answerIndex: 0,
    explanation: 'Offset pagination does O(offset) work. It is fine for small tables and admin grids; prefer keyset pagination for large or infinite-scroll lists.',
    docsUrl: `${pg}/queries-limit.html`,
  },
  {
    ...base, topic: 'pagination', id: 'sql-db/pagination/stable-order', type: 'bugspot', level: 'beginner', tags: ['pagination', 'ordering'],
    language: 'sql',
    code: `SELECT id, name
FROM products
LIMIT 20 OFFSET 40;`,
    buggyLines: [3],
    explanation: 'Without ORDER BY the row order is undefined, so pages can repeat or skip rows. Always order by a unique, stable key such as ORDER BY id (add a tiebreaker when sorting by a non-unique column).',
    docsUrl: `${pg}/queries-limit.html`,
  },
  // ---- transactions ----
  {
    ...base, topic: 'transactions', id: 'sql-db/transactions/rollback-result', type: 'output', level: 'beginner', tags: ['transactions', 'acid'],
    language: 'sql',
    code: `CREATE TABLE acc (id INTEGER PRIMARY KEY, bal INTEGER);
INSERT INTO acc VALUES (1, 100);
BEGIN;
UPDATE acc SET bal = bal - 50 WHERE id = 1;
ROLLBACK;
SELECT bal FROM acc;`,
    options: ['50', '100', '0', 'NULL'],
    answerIndex: 1,
    verifiedOutput: '100',
    explanation: 'ROLLBACK discards every change made since BEGIN. This is the atomicity in ACID: a transfer either fully happens or not at all.',
    docsUrl: `${pg}/tutorial-transactions.html`,
  },
  {
    ...base, topic: 'transactions', id: 'sql-db/transactions/lost-update', type: 'mcq', level: 'advanced', tags: ['transactions', 'concurrency'],
    question: 'Two requests read balance = 100, each subtracts 10 in application code and writes back 90. What happened?',
    options: [
      'A lost update: one withdrawal was overwritten',
      'A dirty read',
      'A phantom read',
      'Nothing; the result 80 is guaranteed',
    ],
    answerIndex: 0,
    explanation: 'Read-modify-write in the application races. Do the arithmetic in the database (UPDATE ... SET balance = balance - 10), use SELECT ... FOR UPDATE, or an optimistic version column.',
    source: { repo: 'maeshataruna99-lgtm/core-forge-simrs' },
    docsUrl: `${pg}/explicit-locking.html`,
  },
  {
    ...base, topic: 'transactions', id: 'sql-db/transactions/prisma-interactive', type: 'mcq', level: 'intermediate', tags: ['transactions', 'prisma'],
    question: 'In Prisma, why prefer `prisma.$transaction(async (tx) => { ... })` over several separate awaits when later writes depend on earlier reads?',
    options: [
      'All statements share one database transaction, so they commit or roll back together',
      'It runs the statements in parallel',
      'It disables constraints',
      'It caches the results',
    ],
    answerIndex: 0,
    explanation: 'Use the tx client inside the callback, not the outer prisma client, or those queries run outside the transaction.',
    source: { repo: 'maeshataruna99-lgtm/core-forge-light' },
    docsUrl: 'https://www.prisma.io/docs/orm/prisma-client/queries/transactions#interactive-transactions',
  },
  // ---- query-semantics ----
  {
    ...base, topic: 'query-semantics', id: 'sql-db/query-semantics/null-counts', type: 'output', level: 'intermediate', tags: ['null', 'aggregates'],
    language: 'sql',
    code: `CREATE TABLE t (v INTEGER);
INSERT INTO t VALUES (1), (NULL), (3);
SELECT COUNT(*), COUNT(v), COUNT(CASE WHEN v <> 1 THEN 1 END) FROM t;`,
    options: ['3|2|1', '3|3|2', '2|2|1', '3|2|2'],
    answerIndex: 0,
    verifiedOutput: '3|2|1',
    explanation: 'COUNT(*) counts rows, COUNT(v) skips NULLs. NULL <> 1 is unknown, not true, so the CASE only matches the value 3 and the third count is 1.',
    docsUrl: `${pg}/functions-aggregate.html`,
  },
  {
    ...base, topic: 'query-semantics', id: 'sql-db/query-semantics/having-vs-where', type: 'output', level: 'beginner', tags: ['group-by'],
    language: 'sql',
    code: `CREATE TABLE o (cust TEXT, amt INTEGER);
INSERT INTO o VALUES ('a',10),('a',20),('b',5);
SELECT cust, SUM(amt) FROM o GROUP BY cust HAVING SUM(amt) > 10;`,
    options: ['a|30', 'a|30 and b|5', 'b|5', 'a|10 and a|20'],
    answerIndex: 0,
    verifiedOutput: 'a|30',
    explanation: 'WHERE filters rows before grouping; HAVING filters groups after aggregation. Customer b sums to 5 and is dropped.',
    docsUrl: `${pg}/queries-table-expressions.html#QUERIES-GROUP`,
  },
  // ---- normalization ----
  {
    ...base, topic: 'normalization', id: 'sql-db/normalization/third-normal-form', type: 'mcq', level: 'intermediate', tags: ['design'],
    question: 'An orders table stores customer_id and also customer_city. The city depends on the customer, not the order. Which problem does that cause?',
    options: [
      'Update anomalies: a customer\'s city can differ between their orders',
      'Orders can no longer be indexed',
      'The primary key is invalid',
      'Joins become impossible',
    ],
    answerIndex: 0,
    explanation: 'This is a transitive dependency (violates 3NF). Move the city to a customers table and reference it by id.',
    docsUrl: 'https://en.wikipedia.org/wiki/Third_normal_form',
  },
  {
    ...base, topic: 'normalization', id: 'sql-db/normalization/when-to-denormalize', type: 'flashcard', level: 'advanced', tags: ['design', 'performance'],
    front: 'When is denormalizing a table a defensible choice?',
    back: 'When measured read performance needs it (for example a stored order total or a counter) and you accept the cost of keeping the copy consistent, ideally inside the same transaction or via a derived/materialized view.',
    explanation: 'Normalize first, measure, then denormalize deliberately with a plan for keeping the copies in sync.',
    docsUrl: `${pg}/rules-materializedviews.html`,
  },
];
