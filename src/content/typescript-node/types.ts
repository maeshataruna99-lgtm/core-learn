import type { Card } from '../../core/types.ts';

const base = { track: 'typescript-node', topic: 'types' } as const;

export const cards: Card[] = [
  {
    ...base, id: 'typescript-node/types/unknown-vs-any', type: 'flashcard', level: 'beginner', tags: ['types'],
    front: 'unknown vs any',
    back: 'any turns off type checking. unknown is the type-safe counterpart: you must narrow it (typeof, instanceof, a type guard) before using it.',
    explanation: 'Prefer unknown for values of uncertain shape, such as parsed JSON or caught errors.',
    docsUrl: 'https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown',
  },
  {
    ...base, id: 'typescript-node/types/typeof-null', type: 'output', level: 'beginner', tags: ['javascript'],
    language: 'js',
    code: `console.log(typeof null, typeof undefined, typeof []);`,
    options: ['null undefined array', 'object undefined object', 'object undefined array', 'null object object'],
    answerIndex: 1,
    verifiedOutput: 'object undefined object',
    explanation: 'typeof null is "object" (a historical quirk) and arrays are objects. Use Array.isArray to detect arrays.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof',
  },
  {
    ...base, id: 'typescript-node/types/default-sort', type: 'output', level: 'beginner', tags: ['arrays'],
    language: 'js',
    code: `console.log([10, 9, 1].sort());`,
    options: ['[ 1, 9, 10 ]', '[ 10, 9, 1 ]', '[ 1, 10, 9 ]', '[ 9, 10, 1 ]'],
    answerIndex: 2,
    verifiedOutput: '[ 1, 10, 9 ]',
    explanation: 'Array.prototype.sort compares elements as strings by default. Pass (a, b) => a - b for numeric order.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort',
  },
  {
    ...base, id: 'typescript-node/types/union-narrowing', type: 'mcq', level: 'intermediate', tags: ['types', 'narrowing'],
    question: 'Given `type Shape = { kind: "circle"; r: number } | { kind: "square"; side: number }`, how does `switch (s.kind)` help?',
    options: [
      'It narrows s to the matching member in each case',
      'It converts s to a string at runtime',
      'It makes all members optional',
      'It only works for classes',
    ],
    answerIndex: 0,
    explanation: 'A shared literal property makes this a discriminated union; TypeScript narrows the type inside each case branch.',
    docsUrl: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions',
  },
];
