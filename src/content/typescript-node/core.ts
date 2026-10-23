import type { Card } from '../../core/types.ts';

const base = { track: 'typescript-node' } as const;
const mdn = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript';

export const cards: Card[] = [
  // ---- error-handling ----
  {
    ...base, topic: 'error-handling', id: 'typescript-node/error-handling/custom-error-instanceof', type: 'output', level: 'intermediate', tags: ['errors', 'classes'],
    language: 'js',
    code: `class AppError extends Error {}
const e = new AppError('x');
console.log(e instanceof AppError, e instanceof Error, e.name);`,
    options: ['true true Error', 'true true AppError', 'true false Error', 'false true Error'],
    answerIndex: 0,
    verifiedOutput: 'true true Error',
    explanation: 'A subclass instance is an instance of both classes. name is inherited from Error.prototype and stays "Error" unless you set this.name in the constructor.',
    docsUrl: `${mdn}/Reference/Global_Objects/Error`,
  },
  {
    ...base, topic: 'error-handling', id: 'typescript-node/error-handling/json-parse-throws', type: 'output', level: 'beginner', tags: ['errors', 'json'],
    language: 'js',
    code: `try {
  JSON.parse('{bad json');
} catch (e) {
  console.log(e instanceof SyntaxError);
}`,
    options: ['true', 'false', 'undefined', 'The program crashes'],
    answerIndex: 0,
    verifiedOutput: 'true',
    explanation: 'JSON.parse throws a SyntaxError on invalid input, so wrap parsing of untrusted text in try/catch.',
    docsUrl: `${mdn}/Reference/Global_Objects/JSON/parse`,
  },
  {
    ...base, topic: 'error-handling', id: 'typescript-node/error-handling/swallowed-catch', type: 'bugspot', level: 'beginner', tags: ['errors', 'async'],
    language: 'ts',
    code: `async function saveUser(user: User) {
  try {
    await repo.save(user);
  } catch (e) {
    // ignore
  }
}`,
    buggyLines: [4, 5],
    fixedCode: `async function saveUser(user: User) {
  try {
    await repo.save(user);
  } catch (e) {
    throw e;
  }
}`,
    proof: {
      harness: `const repo = { save: async () => { throw new Error('db down'); } };
/* CODE_HERE */
try { await saveUser({}); console.log('ok'); } catch (e) { console.log('failed: ' + e.message); }`,
      buggyOutput: 'ok',
      fixedOutput: 'failed: db down',
    },
    explanation: 'An empty catch hides failures: the caller thinks the save worked. Handle the error, log it with context, or rethrow it.',
    docsUrl: `${mdn}/Reference/Statements/try...catch`,
  },
  {
    ...base, topic: 'error-handling', id: 'typescript-node/error-handling/catch-unknown', type: 'flashcard', level: 'intermediate', tags: ['errors', 'types'],
    front: 'In strict TypeScript, what type does `e` have in `catch (e)` and how do you use it safely?',
    back: 'unknown (with useUnknownInCatchVariables, part of strict). Narrow it first: `if (e instanceof Error) { e.message }`.',
    explanation: 'Anything can be thrown in JavaScript, including strings and objects, so the compiler cannot assume an Error.',
    docsUrl: 'https://www.typescriptlang.org/tsconfig/#useUnknownInCatchVariables',
  },
  // ---- modules ----
  {
    ...base, topic: 'modules', id: 'typescript-node/modules/esm-vs-commonjs', type: 'flashcard', level: 'beginner', tags: ['esm', 'commonjs'],
    front: 'ESM vs CommonJS in Node',
    back: 'ESM uses import/export, is statically analyzable and supports top-level await (set "type": "module" or use .mjs). CommonJS uses require/module.exports and loads synchronously.',
    explanation: 'This very app is ESM; its package.json sets "type": "module".',
    docsUrl: 'https://nodejs.org/api/esm.html',
  },
  {
    ...base, topic: 'modules', id: 'typescript-node/modules/import-type', type: 'mcq', level: 'intermediate', tags: ['types', 'imports'],
    question: 'What does `import type { User } from "./user"` guarantee?',
    options: [
      'The import is erased at compile time and can only be used as a type',
      'The module is loaded lazily',
      'User must be a class',
      'The import is cached across files',
    ],
    answerIndex: 0,
    explanation: 'Type-only imports never reach the JavaScript output, which avoids accidental runtime imports and circular-dependency surprises.',
    docsUrl: 'https://www.typescriptlang.org/docs/handbook/2/modules.html#import-type',
  },
  // ---- types (more) ----
  {
    ...base, topic: 'types', id: 'typescript-node/types/nullish-coalescing', type: 'output', level: 'beginner', tags: ['operators'],
    language: 'js',
    code: `console.log(0 ?? 'd', 0 || 'd', null ?? 'd');`,
    options: ['0 d d', 'd d d', '0 0 d', '0 d 0'],
    answerIndex: 0,
    verifiedOutput: '0 d d',
    explanation: '?? falls back only for null or undefined, while || falls back for any falsy value (0, "", false). Use ?? when 0 or an empty string is a valid value.',
    docsUrl: `${mdn}/Reference/Operators/Nullish_coalescing`,
  },
  {
    ...base, topic: 'types', id: 'typescript-node/types/shallow-spread', type: 'output', level: 'intermediate', tags: ['objects', 'copy'],
    language: 'js',
    code: `const a = { n: { v: 1 } };
const b = { ...a };
b.n.v = 2;
console.log(a.n.v);`,
    options: ['1', '2', 'undefined', 'It throws'],
    answerIndex: 1,
    verifiedOutput: '2',
    explanation: 'Spread makes a shallow copy: b.n and a.n are the same object. Use structuredClone(a) for a deep copy.',
    docsUrl: `${mdn}/Reference/Operators/Spread_syntax`,
  },
  {
    ...base, topic: 'types', id: 'typescript-node/types/var-closure-loop', type: 'output', level: 'intermediate', tags: ['closures', 'scope'],
    language: 'js',
    code: `const fns = [];
for (var i = 0; i < 3; i++) fns.push(() => i);
console.log(fns.map((f) => f()).join(','));`,
    options: ['0,1,2', '3,3,3', '0,0,0', '2,2,2'],
    answerIndex: 1,
    verifiedOutput: '3,3,3',
    explanation: 'var is function-scoped, so all closures share one i, which is 3 when the loop ends. let creates a new binding per iteration and would print 0,1,2.',
    docsUrl: `${mdn}/Reference/Statements/var`,
  },
  {
    ...base, topic: 'types', id: 'typescript-node/types/assignment-in-if', type: 'bugspot', level: 'beginner', tags: ['conditions'],
    language: 'ts',
    code: `function canDelete(role: string) {
  if (role = 'admin') {
    return true;
  }
  return false;
}`,
    buggyLines: [2],
    fixedCode: `function canDelete(role: string) {
  if (role === 'admin') {
    return true;
  }
  return false;
}`,
    proof: {
      harness: `/* CODE_HERE */
console.log(canDelete('member'));`,
      buggyOutput: 'true',
      fixedOutput: 'false',
    },
    explanation: 'A single = assigns "admin" to role and the condition is always truthy, so everyone can delete. Compare with ===.',
    docsUrl: `${mdn}/Reference/Operators/Strict_equality`,
  },
  {
    ...base, topic: 'types', id: 'typescript-node/types/readonly-as-const', type: 'flashcard', level: 'intermediate', tags: ['types'],
    front: 'What does `as const` do to `const roles = ["admin", "member"] as const`?',
    back: 'It makes the array a readonly tuple of literal types: readonly ["admin", "member"]. You can derive a union with `typeof roles[number]`.',
    explanation: 'It is the usual way to keep a list of allowed values and its type in one place.',
    docsUrl: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions',
  },
];
