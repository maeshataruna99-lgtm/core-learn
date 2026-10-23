import type { Card } from '../../core/types.ts';

const base = { track: 'typescript-node' } as const;
const mdn = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript';
const ts = 'https://www.typescriptlang.org/docs/handbook';

export const cards: Card[] = [
  // ---- generics ----
  {
    ...base, topic: 'generics', id: 'typescript-node/generics/constraint', type: 'mcq', level: 'intermediate', tags: ['generics'],
    question: 'What does `function byId<T extends { id: string }>(items: T[], id: string)` guarantee?',
    options: [
      'Every item type has an id string, and the function returns the caller\'s own item type',
      'T must be exactly { id: string }',
      'T is converted to a string',
      'items can be empty only',
    ],
    answerIndex: 0,
    explanation: 'A constraint requires a minimum shape but keeps the specific type: passing User[] returns a User, not a bare { id: string }.',
    docsUrl: `${ts}/2/generics.html#generic-constraints`,
  },
  {
    ...base, topic: 'generics', id: 'typescript-node/generics/keyof-typeof', type: 'mcq', level: 'intermediate', tags: ['types', 'keyof'],
    question: 'Given `const roles = { admin: 1, member: 2 } as const`, what is `keyof typeof roles`?',
    options: ['"admin" | "member"', 'string', '1 | 2', '"roles"'],
    answerIndex: 0,
    explanation: 'typeof roles is the object type; keyof turns its property names into a union of string literals. Use it to keep a lookup table and its allowed keys in sync.',
    docsUrl: `${ts}/2/keyof-types.html`,
  },
  // ---- utility-types ----
  {
    ...base, topic: 'utility-types', id: 'typescript-node/utility-types/pick-omit-partial', type: 'mcq', level: 'beginner', tags: ['types'],
    question: 'Which type models an update payload where every field of User is optional?',
    options: ['Partial<User>', 'Pick<User, "id">', 'Omit<User, "id">', 'Required<User>'],
    answerIndex: 0,
    explanation: 'Partial makes all properties optional, Required makes them all mandatory, Pick keeps chosen keys, Omit removes chosen keys.',
    docsUrl: 'https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype',
  },
  {
    ...base, topic: 'utility-types', id: 'typescript-node/utility-types/record', type: 'flashcard', level: 'beginner', tags: ['types'],
    front: 'What is Record<K, V>?',
    back: 'An object type whose keys are K and whose values are V, such as Record<Role, string[]> for a map from each role to its permissions. With a union as K, TypeScript requires every key to be present.',
    explanation: 'That exhaustiveness is useful: adding a new role to the union makes every incomplete Record a compile error.',
    docsUrl: 'https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type',
  },
  {
    ...base, topic: 'utility-types', id: 'typescript-node/utility-types/satisfies', type: 'mcq', level: 'advanced', tags: ['types', 'satisfies'],
    question: 'What does `satisfies` give you over a type annotation on `const colors = { red: "#f00" } satisfies Record<string, string>`?',
    options: [
      'The shape is checked, but the narrower inferred type (known keys) is kept',
      'The value is validated at runtime',
      'The object becomes immutable',
      'Nothing; they are identical',
    ],
    answerIndex: 0,
    explanation: 'An annotation widens to Record<string, string>, so colors.blue would type-check. satisfies validates against the type but keeps { red: string }, so unknown keys are still errors.',
    docsUrl: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator',
  },
  {
    ...base, topic: 'utility-types', id: 'typescript-node/utility-types/enum-vs-union', type: 'flashcard', level: 'intermediate', tags: ['types', 'enums'],
    front: 'Why do many TypeScript projects prefer string literal unions over enums?',
    back: 'Unions are erased at compile time, so there is no runtime code, and they work when Node runs .ts files by stripping types (enums need a transform). They also stay structurally typed and easy to serialize.',
    explanation: 'This app declares `type Level = "beginner" | ...` and a LEVELS array, and its scripts run directly on Node 24 without a compile step.',
    docsUrl: 'https://nodejs.org/api/typescript.html#type-stripping',
  },
  // ---- async (more, executed) ----
  {
    ...base, topic: 'async', id: 'typescript-node/async/promise-race', type: 'output', level: 'intermediate', tags: ['promises'],
    language: 'js',
    code: `const sleep = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

(async () => {
  const winner = await Promise.race([sleep(20, 'slow'), sleep(5, 'fast')]);
  console.log(winner);
})();`,
    options: ['slow', 'fast', 'slow fast', 'undefined'],
    answerIndex: 1,
    verifiedOutput: 'fast',
    explanation: 'Promise.race settles with the first promise to settle, whether it fulfils or rejects. Racing against a timeout promise is the classic way to add a deadline.',
    docsUrl: `${mdn}/Reference/Global_Objects/Promise/race`,
  },
  {
    ...base, topic: 'async', id: 'typescript-node/async/promise-all-order', type: 'output', level: 'intermediate', tags: ['promises'],
    language: 'js',
    code: `const sleep = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

Promise.all([sleep(20, 'a'), sleep(5, 'b')]).then((results) => console.log(results.join('')));`,
    options: ['ab', 'ba', 'a', 'b'],
    answerIndex: 0,
    verifiedOutput: 'ab',
    explanation: 'Promise.all returns results in the order of the input array, not the order in which the promises finished.',
    docsUrl: `${mdn}/Reference/Global_Objects/Promise/all`,
  },
  {
    ...base, topic: 'async', id: 'typescript-node/async/next-tick-order', type: 'output', level: 'advanced', tags: ['event-loop', 'node'],
    language: 'js',
    code: `// CommonJS script (not an ES module)
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('tick'));
console.log('sync');`,
    options: ['sync promise tick', 'sync tick promise', 'tick promise sync', 'promise tick sync'],
    answerIndex: 1,
    verifiedOutput: 'sync\ntick\npromise',
    explanation: 'In a CommonJS script, Node drains the process.nextTick queue before promise microtasks once the synchronous code finishes. In an ES module the order is reversed (promise first), so do not rely on it. Avoid nextTick in new code; recursive use can starve I/O.',
    docsUrl: 'https://nodejs.org/api/process.html#when-to-use-queuemicrotask-vs-processnexttick',
  },
  {
    ...base, topic: 'async', id: 'typescript-node/async/abort-controller', type: 'mcq', level: 'intermediate', tags: ['abort', 'fetch'],
    question: 'How do you cancel an in-flight fetch?',
    options: [
      'Pass an AbortSignal from an AbortController and call controller.abort()',
      'Set the promise to null',
      'Call fetch.cancel()',
      'Throw inside then()',
    ],
    answerIndex: 0,
    explanation: 'The fetch promise rejects with an AbortError. Unlike a bare promise, an operation that accepts a signal can really stop its work, which is how a timeout can free resources.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal',
  },
  // ---- node-runtime ----
  {
    ...base, topic: 'node-runtime', id: 'typescript-node/node-runtime/event-emitter-once', type: 'output', level: 'intermediate', tags: ['events'],
    language: 'js',
    code: `const { EventEmitter } = require('node:events');
const emitter = new EventEmitter();
emitter.once('x', () => console.log('once'));
emitter.on('x', () => console.log('on'));
emitter.emit('x');
emitter.emit('x');`,
    options: ['once then on then on', 'once then on', 'on then on', 'once then once then on'],
    answerIndex: 0,
    verifiedOutput: 'once\non\non',
    explanation: 'Listeners run in registration order. A once listener removes itself after the first emit, so it fires a single time while the on listener fires every time.',
    docsUrl: 'https://nodejs.org/api/events.html#emitteroncheventname-listener',
  },
  {
    ...base, topic: 'node-runtime', id: 'typescript-node/node-runtime/number-parsing', type: 'output', level: 'intermediate', tags: ['config', 'env'],
    language: 'js',
    code: `console.log(Number(''), Number(undefined), Number('12px'));`,
    options: ['0 NaN NaN', 'NaN NaN NaN', '0 0 12', 'NaN 0 12'],
    answerIndex: 0,
    verifiedOutput: '0 NaN NaN',
    explanation: 'Number("") is 0, which is why core-forge checks for an empty TRUST_PROXY_HOPS before converting and validates with Number.isInteger. Environment variables are always strings or undefined.',
    source: { repo: 'maeshataruna99-lgtm/core-forge-light', path: 'apps/api/src/main.ts' },
    docsUrl: `${mdn}/Reference/Global_Objects/Number/Number`,
  },
  {
    ...base, topic: 'node-runtime', id: 'typescript-node/node-runtime/backpressure', type: 'flashcard', level: 'advanced', tags: ['streams'],
    front: 'What is backpressure in Node streams, and what handles it for you?',
    back: 'A fast producer can fill a slow consumer\'s buffer. writable.write() returns false when the buffer is full and you should wait for "drain". pipe() applies backpressure automatically, and stream.pipeline() builds on it while also forwarding errors and cleaning up the streams.',
    explanation: 'Ignoring it buffers whole files in memory, for example when streaming an upload to storage.',
    docsUrl: 'https://nodejs.org/en/learn/modules/backpressuring-in-streams',
  },
  // ---- testing ----
  {
    ...base, topic: 'testing', id: 'typescript-node/testing/vitest-mock-fn', type: 'flashcard', level: 'beginner', tags: ['vitest', 'mocks'],
    front: 'What does vi.fn() give you in Vitest?',
    back: 'A mock function that records every call (mock.calls) and can return configured values (mockResolvedValue, mockReturnValue). Use it to replace a dependency and assert how it was called.',
    explanation: 'core-forge\'s API tests mock Prisma this way, and then inspect the arguments of the recorded call.',
    source: { repo: 'maeshataruna99-lgtm/core-forge-light', path: 'apps/api/src/access/member-names.test.ts' },
    docsUrl: 'https://vitest.dev/api/vi.html#vi-fn',
  },
  // ---- error-handling (more, executed) ----
  {
    ...base, topic: 'error-handling', id: 'typescript-node/error-handling/error-cause', type: 'output', level: 'intermediate', tags: ['errors'],
    language: 'js',
    code: `const inner = new Error('inner');
const outer = new Error('outer', { cause: inner });
console.log(outer.cause === inner, outer.cause.message);`,
    options: ['true inner', 'false inner', 'true outer', 'undefined undefined'],
    answerIndex: 0,
    verifiedOutput: 'true inner',
    explanation: 'The cause option chains errors without losing the original, so you can add context at each layer (database, service, controller) and still log the root failure.',
    docsUrl: `${mdn}/Reference/Global_Objects/Error/cause`,
  },
  {
    ...base, topic: 'types', id: 'typescript-node/types/structured-clone', type: 'output', level: 'intermediate', tags: ['objects', 'copy'],
    language: 'js',
    code: `const a = { when: new Date(0) };
const b = structuredClone(a);
console.log(b.when instanceof Date, b.when === a.when);`,
    options: ['true false', 'true true', 'false false', 'false true'],
    answerIndex: 0,
    verifiedOutput: 'true false',
    explanation: 'structuredClone makes a deep copy that preserves Dates, Maps and Sets (unlike JSON.stringify, which turns a Date into a string). It cannot clone functions.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm',
  },
];
