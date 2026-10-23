import type { Card } from '../../core/types.ts';

// Beginner foundations with bilingual primers. SQL output cards run on SQLite via scripts/verify-output.ts.
const base = { track: 'sql-db', level: 'beginner' } as const;
const pg = 'https://www.postgresql.org/docs/current';

export const cards: Card[] = [
  {
    ...base, topic: 'foundations', id: 'sql-db/foundations/table-row-column', type: 'flashcard', tags: ['basics'],
    primer: {
      en: 'A relational database is like a set of spreadsheets. Each spreadsheet is a table, each line is a row (one record), each column is one kind of information.',
      id: 'Database relasional mirip kumpulan spreadsheet. Setiap spreadsheet adalah tabel, setiap baris adalah row (satu catatan), setiap kolom adalah satu jenis informasi.',
    },
    front: 'What are a table, a row and a column?',
    back: 'A table stores one kind of thing (users). A row is one record in it (one user). A column is one attribute with a fixed type (email, created_at). SQL is the language used to read and change them.',
    explanation: 'In an ORM, a table maps to a class (entity or model), a row to an object, and a column to a field.',
    docsUrl: `${pg}/tutorial-table.html`,
  },
  {
    ...base, topic: 'foundations', id: 'sql-db/foundations/primary-key', type: 'mcq', tags: ['keys'],
    primer: {
      en: 'Two people can share the same name, so you need a column that is different for every row, such as an id. That column is the primary key.',
      id: 'Dua orang bisa punya nama yang sama, jadi kamu butuh kolom yang berbeda untuk setiap baris, seperti id. Kolom itu disebut primary key.',
    },
    question: 'What is a primary key?',
    options: [
      'A column (or columns) whose value uniquely identifies each row and is never null',
      'The first column of any table',
      'A password for the database',
      'A column that can contain duplicates',
    ],
    answerIndex: 0,
    explanation: 'The database enforces uniqueness and creates an index on the primary key, so lookups by id are fast.',
    docsUrl: `${pg}/ddl-constraints.html#DDL-CONSTRAINTS-PRIMARY-KEYS`,
  },
  {
    ...base, topic: 'foundations', id: 'sql-db/foundations/foreign-key', type: 'flashcard', tags: ['keys', 'relationships'],
    primer: {
      en: 'An order must belong to a real customer. The order row stores the customer\'s id, and the database makes sure that id exists in the customers table.',
      id: 'Sebuah order harus milik customer yang nyata. Baris order menyimpan id customer, dan database memastikan id itu memang ada di tabel customers.',
    },
    front: 'What is a foreign key?',
    back: 'A column that references the primary key of another table (orders.customer_id points to customers.id). The database rejects values that do not exist there, which keeps related data consistent.',
    explanation: 'JPA\'s @ManyToOne + @JoinColumn and Prisma\'s @relation both describe a foreign key.',
    docsUrl: `${pg}/ddl-constraints.html#DDL-CONSTRAINTS-FK`,
  },
  {
    ...base, topic: 'foundations', id: 'sql-db/foundations/select-where', type: 'output', tags: ['select'],
    primer: {
      en: '`SELECT` chooses which columns to show, `FROM` the table, `WHERE` keeps only rows that match, and `ORDER BY` sorts the result.',
      id: '`SELECT` memilih kolom yang ditampilkan, `FROM` menentukan tabel, `WHERE` hanya menyisakan baris yang cocok, dan `ORDER BY` mengurutkan hasil.',
    },
    language: 'sql',
    code: `CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER);
INSERT INTO products VALUES (1,'pen',5),(2,'book',20),(3,'bag',50);
SELECT name FROM products WHERE price > 10 ORDER BY price DESC;`,
    options: ['bag book', 'book bag', 'pen', 'bag book pen'],
    answerIndex: 0,
    verifiedOutput: 'bag\nbook',
    explanation: 'WHERE price > 10 removes pen. ORDER BY price DESC sorts the rest from most to least expensive, so bag (50) comes before book (20).',
    docsUrl: `${pg}/tutorial-select.html`,
  },
  {
    ...base, topic: 'foundations', id: 'sql-db/foundations/left-join', type: 'output', tags: ['join', 'interview'],
    primer: {
      en: 'A JOIN combines rows from two tables using a matching column. INNER JOIN keeps only rows that match on both sides. LEFT JOIN keeps every row of the left table and fills the right side with NULL when there is no match.',
      id: 'JOIN menggabungkan baris dari dua tabel memakai kolom yang cocok. INNER JOIN hanya menyimpan baris yang cocok di kedua sisi. LEFT JOIN menyimpan semua baris tabel kiri dan mengisi sisi kanan dengan NULL jika tidak ada yang cocok.',
    },
    language: 'sql',
    code: `CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, total INTEGER);
INSERT INTO users VALUES (1,'ann'),(2,'bob');
INSERT INTO orders VALUES (1,1,50);
SELECT u.name, COALESCE(o.total, 0) FROM users u LEFT JOIN orders o ON o.user_id = u.id ORDER BY u.id;`,
    options: ['ann|50', 'ann|50 bob|0', 'ann|50 bob|', 'bob|0'],
    answerIndex: 1,
    verifiedOutput: 'ann|50\nbob|0',
    explanation: 'bob has no orders, but LEFT JOIN keeps him; his order columns are NULL and COALESCE turns that into 0. An INNER JOIN would return only ann|50.',
    docsUrl: `${pg}/tutorial-join.html`,
  },
  {
    ...base, topic: 'foundations', id: 'sql-db/foundations/update-without-where', type: 'bugspot', tags: ['update', 'where'],
    primer: {
      en: '`UPDATE` changes rows. Without a `WHERE`, it changes every row in the table. This is one of the most expensive beginner mistakes.',
      id: '`UPDATE` mengubah baris. Tanpa `WHERE`, semua baris dalam tabel ikut berubah. Ini salah satu kesalahan pemula yang paling mahal.',
    },
    language: 'sql',
    code: `-- deactivate user 42
UPDATE users SET active = 0;`,
    buggyLines: [2],
    fixedCode: `-- deactivate user 42
UPDATE users SET active = 0 WHERE id = 42;`,
    explanation: 'The statement deactivates every user. Always add a WHERE (and run the same condition in a SELECT first). The same applies to DELETE.',
    docsUrl: `${pg}/dml-update.html`,
  },
  {
    ...base, topic: 'foundations', id: 'sql-db/foundations/acid', type: 'flashcard', tags: ['acid', 'transactions', 'interview'],
    primer: {
      en: 'ACID is a checklist of promises a database makes about transactions, so your data stays correct even when things crash.',
      id: 'ACID adalah daftar janji yang diberikan database tentang transaksi, agar datamu tetap benar walaupun terjadi crash.',
    },
    front: 'What does ACID stand for?',
    back: 'Atomicity (all steps happen or none), Consistency (rules and constraints always hold), Isolation (concurrent transactions do not see each other\'s unfinished work), Durability (committed data survives a crash).',
    explanation: 'A bank transfer is the classic example: debit and credit must both succeed or both be undone.',
    docsUrl: `${pg}/tutorial-transactions.html`,
  },
  {
    ...base, topic: 'foundations', id: 'sql-db/foundations/what-is-an-index', type: 'flashcard', tags: ['index'],
    primer: {
      en: 'To find a word in a book you use the index at the back instead of reading every page. A database index does the same for a column.',
      id: 'Untuk mencari sebuah kata di buku, kamu memakai indeks di belakang alih-alih membaca setiap halaman. Index database melakukan hal yang sama untuk sebuah kolom.',
    },
    front: 'What is a database index and what is its trade-off?',
    back: 'An extra sorted structure on one or more columns that lets the database find rows without scanning the whole table. Reads that filter or sort on those columns get faster; inserts and updates get slower and the index uses disk space.',
    explanation: 'Index the columns you filter, join and sort on frequently, not every column.',
    docsUrl: `${pg}/indexes-intro.html`,
  },
];
