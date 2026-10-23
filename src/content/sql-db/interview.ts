import type { Card } from '../../core/types.ts';

// Interview-style SQL cards written from scratch. Cards with language "sql" are executed on SQLite
// (scripts/verify-output.ts), so they only test behaviour that is the same in PostgreSQL and SQLite.
const base = { track: 'sql-db' } as const;
const pg = 'https://www.postgresql.org/docs/current';

export const cards: Card[] = [
  {
    ...base, topic: 'interview', id: 'sql-db/interview/union-vs-union-all', level: 'beginner', type: 'output', tags: ['union', 'interview'],
    primer: {
      en: 'UNION stacks the results of two queries on top of each other. Plain UNION removes duplicate rows; UNION ALL keeps them, which is also faster because it skips the duplicate check.',
      id: 'UNION menumpuk hasil dua query. UNION biasa membuang baris duplikat; UNION ALL mempertahankannya, dan juga lebih cepat karena tidak melakukan pengecekan duplikat.',
    },
    language: 'sql',
    code: `CREATE TABLE a (x INTEGER);
CREATE TABLE b (x INTEGER);
INSERT INTO a VALUES (1), (2);
INSERT INTO b VALUES (2), (3);
SELECT
  (SELECT COUNT(*) FROM (SELECT x FROM a UNION SELECT x FROM b)),
  (SELECT COUNT(*) FROM (SELECT x FROM a UNION ALL SELECT x FROM b));`,
    options: ['3|4', '4|4', '3|3', '4|3'],
    answerIndex: 0,
    verifiedOutput: '3|4',
    explanation: 'The value 2 appears in both tables. UNION returns 1, 2, 3 (three rows); UNION ALL returns 1, 2, 2, 3 (four rows). Use UNION ALL unless you really need de-duplication.',
    docsUrl: `${pg}/queries-union.html`,
  },
  {
    ...base, topic: 'interview', id: 'sql-db/interview/not-in-with-null', level: 'intermediate', type: 'output', tags: ['null', 'subquery', 'interview'],
    language: 'sql',
    code: `CREATE TABLE a (x INTEGER);
CREATE TABLE b (x INTEGER);
INSERT INTO a VALUES (1), (2);
INSERT INTO b VALUES (2), (NULL);
SELECT COUNT(*) FROM a WHERE x NOT IN (SELECT x FROM b);`,
    options: ['0', '1', '2', 'NULL'],
    answerIndex: 0,
    verifiedOutput: '0',
    explanation: 'x NOT IN (2, NULL) means x <> 2 AND x <> NULL. Comparing with NULL is never true, so no row qualifies, even for x = 1. Use NOT EXISTS, or filter NULLs out of the subquery.',
    docsUrl: `${pg}/functions-subquery.html#FUNCTIONS-SUBQUERY-NOTIN`,
  },
  {
    ...base, topic: 'interview', id: 'sql-db/interview/row-number-rank-dense-rank', level: 'intermediate', type: 'output', tags: ['window-functions', 'interview'],
    language: 'sql',
    code: `CREATE TABLE s (name TEXT, pts INTEGER);
INSERT INTO s VALUES ('a', 90), ('b', 90), ('c', 80);
SELECT name,
       ROW_NUMBER() OVER (ORDER BY pts DESC, name),
       RANK() OVER (ORDER BY pts DESC),
       DENSE_RANK() OVER (ORDER BY pts DESC)
FROM s ORDER BY name;`,
    options: ['a|1|1|1 b|2|1|1 c|3|3|2', 'a|1|1|1 b|2|2|2 c|3|3|3', 'a|1|1|1 b|1|1|1 c|2|2|2', 'a|1|1|1 b|2|1|1 c|3|2|2'],
    answerIndex: 0,
    verifiedOutput: 'a|1|1|1\nb|2|1|1\nc|3|3|2',
    explanation: 'ROW_NUMBER never repeats. RANK gives ties the same number and then skips (1, 1, 3). DENSE_RANK gives ties the same number without gaps (1, 1, 2).',
    docsUrl: `${pg}/tutorial-window.html`,
  },
  {
    ...base, topic: 'interview', id: 'sql-db/interview/recursive-cte', level: 'advanced', type: 'output', tags: ['cte', 'interview'],
    language: 'sql',
    code: `WITH RECURSIVE t(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM t WHERE n < 3
)
SELECT SUM(n) FROM t;`,
    options: ['6', '3', '1', '9'],
    answerIndex: 0,
    verifiedOutput: '6',
    explanation: 'A CTE (WITH) names a subquery so you can read it top to bottom. A recursive CTE starts from an anchor row and repeatedly applies the second query until it returns nothing, which is how you walk trees such as category or org charts.',
    docsUrl: `${pg}/queries-with.html`,
  },
  {
    ...base, topic: 'interview', id: 'sql-db/interview/self-join', level: 'intermediate', type: 'output', tags: ['join', 'interview'],
    language: 'sql',
    code: `CREATE TABLE emp (id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER);
INSERT INTO emp VALUES (1, 'ann', NULL), (2, 'bob', 1), (3, 'cy', 1);
SELECT e.name AS employee, m.name AS manager FROM emp e JOIN emp m ON e.manager_id = m.id ORDER BY e.id;`,
    options: ['bob|ann cy|ann', 'ann| bob|ann cy|ann', 'ann|bob ann|cy', 'bob|ann'],
    answerIndex: 0,
    verifiedOutput: 'bob|ann\ncy|ann',
    explanation: 'A self join joins a table to itself using two aliases (employee and manager). ann has no manager, so the inner join drops her; a LEFT JOIN would keep her with a NULL manager.',
    docsUrl: `${pg}/tutorial-join.html`,
  },
  {
    ...base, topic: 'interview', id: 'sql-db/interview/correlated-subquery', level: 'advanced', type: 'output', tags: ['subquery', 'interview'],
    language: 'sql',
    code: `CREATE TABLE emp (name TEXT, dept TEXT, salary INTEGER);
INSERT INTO emp VALUES ('a','x',10), ('b','x',30), ('c','y',20), ('d','y',20);
SELECT name FROM emp e
WHERE salary > (SELECT AVG(salary) FROM emp WHERE dept = e.dept)
ORDER BY name;`,
    options: ['b', 'b c', 'a b', 'b d'],
    answerIndex: 0,
    verifiedOutput: 'b',
    explanation: 'A correlated subquery refers to the outer row (e.dept) and runs once per outer row, conceptually. Department x averages 20, so only b (30) beats it; department y averages 20, so nobody does.',
    docsUrl: `${pg}/functions-subquery.html`,
  },
  {
    ...base, topic: 'interview', id: 'sql-db/interview/unique-allows-nulls', level: 'intermediate', type: 'output', tags: ['constraints', 'interview'],
    language: 'sql',
    code: `CREATE TABLE u (id INTEGER PRIMARY KEY, email TEXT UNIQUE);
INSERT INTO u (email) VALUES (NULL), (NULL), ('a@x.com');
SELECT COUNT(*) FROM u;`,
    options: ['3', '1', '2', 'The second insert fails'],
    answerIndex: 0,
    verifiedOutput: '3',
    explanation: 'A PRIMARY KEY is unique and never null, and a table has only one. A UNIQUE constraint can be on many columns and, in PostgreSQL and SQLite, allows any number of NULLs because NULL is not equal to NULL (some other databases allow only one).',
    docsUrl: `${pg}/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS`,
  },
  {
    ...base, topic: 'interview', id: 'sql-db/interview/cross-join', level: 'beginner', type: 'output', tags: ['join'],
    primer: {
      en: 'A CROSS JOIN pairs every row of one table with every row of another: 2 rows times 3 rows gives 6 rows. It is rarely what you want by accident, and a JOIN without a condition can produce it.',
      id: 'CROSS JOIN memasangkan setiap baris satu tabel dengan setiap baris tabel lain: 2 baris kali 3 baris menghasilkan 6 baris. Jarang itu yang kamu inginkan secara tidak sengaja, dan JOIN tanpa kondisi bisa menghasilkannya.',
    },
    language: 'sql',
    code: `CREATE TABLE sizes (s TEXT);
CREATE TABLE colors (c TEXT);
INSERT INTO sizes VALUES ('S'), ('M');
INSERT INTO colors VALUES ('red'), ('green'), ('blue');
SELECT COUNT(*) FROM sizes CROSS JOIN colors;`,
    options: ['6', '5', '2', '3'],
    answerIndex: 0,
    verifiedOutput: '6',
    explanation: 'The result size is the product of the two table sizes. An INNER JOIN is a CROSS JOIN filtered by the ON condition.',
    docsUrl: `${pg}/queries-table-expressions.html#QUERIES-JOIN`,
  },
  {
    ...base, topic: 'interview', id: 'sql-db/interview/delete-vs-truncate', level: 'intermediate', type: 'mcq', tags: ['ddl', 'interview'],
    question: 'What is the main difference between DELETE and TRUNCATE?',
    options: [
      'DELETE removes selected rows one by one and can use WHERE; TRUNCATE empties the whole table quickly and takes no WHERE',
      'TRUNCATE can use WHERE; DELETE cannot',
      'They are identical',
      'DELETE drops the table structure as well',
    ],
    answerIndex: 0,
    explanation: 'TRUNCATE is fast and resets the table in one operation (in PostgreSQL it is transactional and can reset sequences). DROP TABLE removes the structure itself. Always check foreign keys before truncating.',
    docsUrl: `${pg}/sql-truncate.html`,
  },
  {
    ...base, topic: 'interview', id: 'sql-db/interview/view-vs-materialized', level: 'intermediate', type: 'mcq', tags: ['views', 'interview'],
    question: 'How does a materialized view differ from a normal view?',
    options: [
      'A materialized view stores the query result on disk and must be refreshed; a normal view runs its query every time it is read',
      'A normal view stores data; a materialized view does not',
      'Materialized views cannot be queried',
      'Normal views cannot contain JOINs',
    ],
    answerIndex: 0,
    explanation: 'A view is a saved query. A materialized view trades freshness for speed: reads are fast, but the data is only as new as the last REFRESH MATERIALIZED VIEW.',
    docsUrl: `${pg}/rules-materializedviews.html`,
  },
  {
    ...base, topic: 'interview', id: 'sql-db/interview/clustered-vs-nonclustered', level: 'advanced', type: 'mcq', tags: ['index', 'interview'],
    question: 'In databases such as SQL Server and MySQL InnoDB, what is a clustered index?',
    options: [
      'An index that defines the physical order of the table\'s rows, so there is only one per table',
      'An index spread across several servers',
      'A separate structure that points to rows; a table can have many',
      'An index that stores only NULL values',
    ],
    answerIndex: 0,
    explanation: 'With a clustered index the table data itself is stored in key order (in InnoDB, the primary key). Non-clustered (secondary) indexes are separate structures pointing to the rows. PostgreSQL tables are heap files, so its indexes are all separate.',
    docsUrl: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html',
  },
  {
    ...base, topic: 'interview', id: 'sql-db/interview/normal-forms', level: 'intermediate', type: 'flashcard', tags: ['normalization', 'interview'],
    front: 'What are 1NF, 2NF and 3NF?',
    back: '1NF: every column holds one atomic value and rows are unique. 2NF: 1NF and every non-key column depends on the whole key (no partial dependency). 3NF: 2NF and non-key columns depend only on the key, not on other non-key columns (no transitive dependency).',
    explanation: 'The usual mnemonic: each column depends on "the key, the whole key, and nothing but the key".',
    docsUrl: 'https://en.wikipedia.org/wiki/Database_normalization',
  },
  {
    ...base, topic: 'interview', id: 'sql-db/interview/ddl-dml-dcl-tcl', level: 'beginner', type: 'flashcard', tags: ['basics', 'interview'],
    primer: {
      en: 'SQL commands are grouped by what they do: some define the structure, some change the data, some control access, some control transactions.',
      id: 'Perintah SQL dikelompokkan menurut fungsinya: ada yang mendefinisikan struktur, ada yang mengubah data, ada yang mengatur akses, ada yang mengatur transaksi.',
    },
    front: 'What are DDL, DML, DCL and TCL?',
    back: 'DDL (Data Definition): CREATE, ALTER, DROP, TRUNCATE. DML (Data Manipulation): INSERT, UPDATE, DELETE (and SELECT). DCL (Data Control): GRANT, REVOKE. TCL (Transaction Control): BEGIN, COMMIT, ROLLBACK.',
    explanation: 'Some people list SELECT separately as DQL (query). In PostgreSQL, DDL statements are transactional too.',
    docsUrl: `${pg}/sql-commands.html`,
  },
  {
    ...base, topic: 'interview', id: 'sql-db/interview/sql-vs-nosql', level: 'beginner', type: 'flashcard', tags: ['nosql', 'interview'],
    primer: {
      en: 'SQL databases store data in tables with a fixed structure and relations. NoSQL is a family of other models (documents, key-value, wide-column, graph) that trade some of that structure for flexibility or scale.',
      id: 'Database SQL menyimpan data dalam tabel dengan struktur tetap dan relasi. NoSQL adalah keluarga model lain (dokumen, key-value, wide-column, graph) yang menukar sebagian struktur itu dengan fleksibilitas atau skala.',
    },
    front: 'SQL vs NoSQL: how do you choose?',
    back: 'Choose SQL (relational) when data is structured and related and you need joins and strong transactions (orders, accounts). Consider NoSQL when the shape varies, access is by key or document, or you must scale writes horizontally (sessions, caches, event logs). Many systems use both.',
    explanation: 'In this project\'s assessment, users are in Redis (key-value) and posts in PostgreSQL (relational) for exactly this kind of reason.',
    source: { repo: 'maeshataruna99-lgtm/mahesha-streamworx-assessment', path: 'README.md' },
    docsUrl: 'https://redis.io/docs/latest/develop/',
  },
  {
    ...base, topic: 'interview', id: 'sql-db/interview/slow-query-checklist', level: 'advanced', type: 'mcq', tags: ['performance', 'interview'],
    question: 'A query is slow. What is the best first step?',
    options: [
      'Run EXPLAIN (ANALYZE) to see the actual plan, row counts and which step is slow',
      'Add an index on every column',
      'Rewrite it as a subquery',
      'Restart the database',
    ],
    answerIndex: 0,
    explanation: 'Measure before changing anything. Typical findings: a missing or unusable index, fetching more columns/rows than needed, a join without an index on the join column, or stale statistics (run ANALYZE).',
    docsUrl: `${pg}/using-explain.html`,
  },
];
