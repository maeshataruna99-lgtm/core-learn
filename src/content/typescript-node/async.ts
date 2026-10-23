import type { Card } from '../../core/types.ts';

const base = { track: 'typescript-node', topic: 'async', docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop' } as const;

export const cards: Card[] = [
  {
    ...base, id: 'typescript-node/async/event-loop-order', type: 'output', level: 'intermediate', tags: ['event-loop', 'promises'],
    language: 'js',
    code: `console.log('a');
setTimeout(() => console.log('b'), 0);
Promise.resolve().then(() => console.log('c'));
console.log('d');`,
    options: ['a b c d', 'a d c b', 'a d b c', 'a c d b'],
    answerIndex: 1,
    verifiedOutput: 'a\nd\nc\nb',
    explanation: 'Synchronous code runs first (a, d). Promise callbacks are microtasks and run before the next macrotask, so c comes before the setTimeout callback b.',
  },
  {
    ...base, id: 'typescript-node/async/foreach-async', type: 'bugspot', level: 'intermediate', tags: ['async', 'arrays'],
    language: 'ts',
    code: `async function loadAll(ids: string[]) {
  const users: User[] = [];
  ids.forEach(async (id) => {
    users.push(await fetchUser(id));
  });
  return users;
}`,
    buggyLines: [3],
    fixedCode: `async function loadAll(ids: string[]) {
  const users: User[] = [];
  for (const id of ids) {
    users.push(await fetchUser(id));
  }
  return users;
}`,
    proof: {
      harness: `const fetchUser = async (id) => { await new Promise((r) => setTimeout(r, 5)); return { id }; };
/* CODE_HERE */
console.log((await loadAll(['a', 'b'])).length);`,
      buggyOutput: '0',
      fixedOutput: '2',
    },
    explanation: 'forEach ignores the promises its async callback returns, so loadAll returns before any user is pushed. Use Promise.all(ids.map(fetchUser)) or a for...of loop with await.',
  },
  {
    ...base, id: 'typescript-node/async/promise-all-vs-allsettled', type: 'flashcard', level: 'intermediate', tags: ['promises'],
    front: 'Promise.all vs Promise.allSettled: when do you pick each?',
    back: 'all rejects as soon as one promise rejects (fail fast). allSettled waits for every promise and reports each outcome, so use it when partial success is acceptable.',
    explanation: 'Promise.all short-circuits on the first rejection but the other promises keep running; their results are just discarded.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled',
  },
  {
    ...base, id: 'typescript-node/async/try-finally-return', type: 'output', level: 'advanced', tags: ['error-handling'],
    language: 'js',
    code: `function f() {
  try {
    return 'try';
  } finally {
    console.log('finally');
  }
}
console.log(f());`,
    options: ['try', 'finally', 'finally then try', 'try then finally'],
    answerIndex: 2,
    verifiedOutput: 'finally\ntry',
    explanation: 'The return value is computed, then finally runs before the function actually returns, so finally is logged first and try after.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch',
  },
];
