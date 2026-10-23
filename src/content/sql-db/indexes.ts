import type { Card } from '../../core/types.ts';

const base = { track: 'sql-db', topic: 'indexes' } as const;

export const cards: Card[] = [
  {
    ...base, id: 'sql-db/indexes/leading-column', type: 'mcq', level: 'intermediate', tags: ['index', 'composite'],
    question: 'With an index on (company_id, created_at), which query can use it efficiently?',
    options: [
      'WHERE company_id = 7 ORDER BY created_at',
      'WHERE created_at > now() - interval \'1 day\' only',
      'WHERE lower(company_id::text) = \'7\'',
      'None; composite indexes are never used',
    ],
    answerIndex: 0,
    explanation: 'A composite B-tree index is usable from its leftmost column. Filtering only on the second column, or wrapping the first in a function, prevents an efficient index seek.',
    source: { repo: 'maeshataruna99-lgtm/core-forge-simrs', path: 'apps/api/prisma/schema/schema.prisma' },
    docsUrl: 'https://www.postgresql.org/docs/current/indexes-multicolumn.html',
  },
  {
    ...base, id: 'sql-db/n-plus-one/what-is', topic: 'n-plus-one', type: 'flashcard', level: 'intermediate', tags: ['orm', 'performance'],
    front: 'What is the N+1 query problem and how do you fix it in Prisma?',
    back: 'One query loads N rows, then one more query per row loads a relation (N+1 total). Fix by loading the relation in the first query (include, or a nested select of the relation), or with a single batched findMany using an `in` filter.',
    explanation: 'Check for it by logging queries: the same SELECT repeated with different ids is the giveaway.',
    docsUrl: 'https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries',
  },
  {
    ...base, id: 'sql-db/transactions/isolation-dirty-read', topic: 'transactions', type: 'mcq', level: 'advanced', tags: ['isolation'],
    question: 'In PostgreSQL, which isolation level is the default?',
    options: ['Read Committed', 'Read Uncommitted', 'Serializable', 'Repeatable Read'],
    answerIndex: 0,
    explanation: 'PostgreSQL defaults to Read Committed: each statement sees data committed before it began. It also treats Read Uncommitted as Read Committed, so dirty reads never happen.',
    docsUrl: 'https://www.postgresql.org/docs/current/transaction-iso.html',
  },
];
