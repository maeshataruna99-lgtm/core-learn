import type { Card } from '../../core/types.ts';

// JavaScript interview questions, written from scratch. Output cards are executed with Node (CommonJS).
const base = { track: 'typescript-node' } as const;
const mdn = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript';

export const cards: Card[] = [
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/type-coercion', level: 'beginner', type: 'output', tags: ['coercion', 'interview'],
    primer: {
      en: 'JavaScript sometimes converts values automatically so an operation can work. With `+`, if either side is text, the other side is turned into text and joined. The result depends on the order of evaluation, left to right.',
      id: 'JavaScript kadang mengubah nilai secara otomatis agar sebuah operasi bisa berjalan. Dengan `+`, jika salah satu sisi berupa teks, sisi lainnya diubah menjadi teks lalu digabung. Hasilnya bergantung pada urutan evaluasi, dari kiri ke kanan.',
    },
    language: 'js',
    code: `console.log(3 + 2 + '7');
console.log('7' + 3 + 2);`,
    options: ['57 then 732', '327 then 732', '12 then 12', '57 then 12'],
    answerIndex: 0,
    verifiedOutput: '57\n732',
    explanation: '3 + 2 is evaluated first and gives 5, then 5 + "7" becomes "57". In the second line "7" + 3 is already text, so everything is concatenated: "732".',
    docsUrl: `${mdn}/Reference/Operators/Addition`,
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/increment-order', level: 'beginner', type: 'output', tags: ['operators'],
    primer: {
      en: '`x++` returns the old value and then adds one. `++x` adds one first and then returns the new value.',
      id: '`x++` mengembalikan nilai lama lalu menambah satu. `++x` menambah satu dulu lalu mengembalikan nilai baru.',
    },
    language: 'js',
    code: `let x = 5;
console.log(x++, x, ++x);`,
    options: ['5 6 7', '6 6 7', '5 5 6', '6 7 7'],
    answerIndex: 0,
    verifiedOutput: '5 6 7',
    explanation: 'The arguments are evaluated left to right: x++ gives 5 (x becomes 6), then x is 6, then ++x makes x 7 and gives 7.',
    docsUrl: `${mdn}/Reference/Operators/Increment`,
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/hoisting-tdz', level: 'intermediate', type: 'output', tags: ['hoisting', 'interview'],
    language: 'js',
    code: `console.log(typeof a, typeof f);
var a = 1;
function f() {}

try {
  console.log(b);
  let b = 2;
} catch (e) {
  console.log(e.name);
}`,
    options: ['undefined function then ReferenceError', 'number function then undefined', 'undefined undefined then ReferenceError', 'ReferenceError then ReferenceError'],
    answerIndex: 0,
    verifiedOutput: 'undefined function\nReferenceError',
    explanation: 'Declarations are hoisted: `var a` exists (as undefined) and the function is fully usable before its line. `let` and `const` are hoisted too, but they sit in the temporal dead zone until their declaration runs, so reading them early throws a ReferenceError.',
    docsUrl: `${mdn}/Reference/Statements/let#temporal_dead_zone_tdz`,
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/closure-counter', level: 'intermediate', type: 'output', tags: ['closures', 'interview'],
    language: 'js',
    code: `function makeCounter() {
  let count = 0;
  return () => ++count;
}

const a = makeCounter();
const b = makeCounter();
console.log(a(), a(), b());`,
    options: ['1 2 1', '1 2 3', '1 1 1', '2 3 1'],
    answerIndex: 0,
    verifiedOutput: '1 2 1',
    explanation: 'A closure is a function that remembers the variables of the scope where it was created. Each call to makeCounter creates a separate count, so a and b keep independent state.',
    docsUrl: `${mdn}/Guide/Closures`,
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/settimeout-var-let', level: 'intermediate', type: 'output', tags: ['closures', 'event-loop', 'interview'],
    language: 'js',
    code: `for (var i = 0; i < 3; i++) setTimeout(() => console.log('var', i), 0);
for (let j = 0; j < 3; j++) setTimeout(() => console.log('let', j), 0);`,
    options: [
      'var 3 var 3 var 3 let 0 let 1 let 2',
      'var 0 var 1 var 2 let 0 let 1 let 2',
      'var 3 var 3 var 3 let 3 let 3 let 3',
      'let 0 let 1 let 2 var 3 var 3 var 3',
    ],
    answerIndex: 0,
    verifiedOutput: 'var 3\nvar 3\nvar 3\nlet 0\nlet 1\nlet 2',
    explanation: 'The callbacks run after the loop ends. `var` has one shared i, which is 3 by then. `let` creates a new j for every iteration, so each callback keeps its own value.',
    docsUrl: `${mdn}/Reference/Statements/let`,
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/this-lost', level: 'intermediate', type: 'output', tags: ['this', 'interview'],
    language: 'js',
    code: `'use strict';
const user = {
  name: 'Ann',
  hello() { return 'hi ' + this.name; },
};
const hello = user.hello;
console.log(user.hello());
try {
  console.log(hello());
} catch (e) {
  console.log(e.name);
}`,
    options: ['hi Ann then TypeError', 'hi Ann then hi Ann', 'hi Ann then hi undefined', 'TypeError then TypeError'],
    answerIndex: 0,
    verifiedOutput: 'hi Ann\nTypeError',
    explanation: '`this` is decided by how a function is called, not where it is written. user.hello() has user as this. The detached hello() has no object, so in strict mode this is undefined and this.name throws.',
    docsUrl: `${mdn}/Reference/Operators/this`,
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/call-apply-bind', level: 'intermediate', type: 'output', tags: ['this', 'interview'],
    language: 'js',
    code: `function greet(greeting, punct) {
  return greeting + ' ' + this.name + punct;
}
const ann = { name: 'Ann' };

console.log(greet.call(ann, 'hi', '!'));
console.log(greet.apply(ann, ['yo', '?']));
const bound = greet.bind(ann, 'hey');
console.log(bound('.'));`,
    options: ['hi Ann! then yo Ann? then hey Ann.', 'hi Ann! then yo Ann? then undefined', 'hi undefined! then yo undefined? then hey undefined.', 'hi Ann! then yo, ? then hey Ann'],
    answerIndex: 0,
    verifiedOutput: 'hi Ann!\nyo Ann?\nhey Ann.',
    explanation: 'call and apply invoke the function now with a chosen this (apply takes an array of arguments). bind returns a new function with this (and optionally some arguments) fixed for later.',
    docsUrl: `${mdn}/Reference/Global_Objects/Function/bind`,
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/truthy-falsy', level: 'beginner', type: 'output', tags: ['truthy', 'interview'],
    primer: {
      en: 'In an `if`, JavaScript treats every value as true or false. A short list of values count as "falsy": false, 0, empty text, null, undefined and NaN. Everything else, even `[]` and `"false"`, is "truthy".',
      id: 'Di dalam `if`, JavaScript menganggap setiap nilai sebagai benar atau salah. Sejumlah kecil nilai dianggap "falsy": false, 0, teks kosong, null, undefined, dan NaN. Selain itu, bahkan `[]` dan `"false"`, dianggap "truthy".',
    },
    language: 'js',
    code: `console.log([0, '', null, 'false', [], {}].map(Boolean).join());`,
    options: ['false,false,false,true,true,true', 'false,false,false,false,true,true', 'false,false,false,true,false,false', 'false,true,false,true,true,true'],
    answerIndex: 0,
    verifiedOutput: 'false,false,false,true,true,true',
    explanation: '0, "" and null are falsy. The string "false", an empty array and an empty object are all truthy because they are non-empty strings or objects.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Glossary/Truthy',
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/array-equality', level: 'beginner', type: 'output', tags: ['equality', 'objects'],
    primer: {
      en: 'Numbers and text are compared by value. Objects and arrays are compared by identity: two separate arrays are never equal, even with the same contents.',
      id: 'Angka dan teks dibandingkan berdasarkan nilai. Objek dan array dibandingkan berdasarkan identitas: dua array terpisah tidak pernah sama, walaupun isinya sama.',
    },
    language: 'js',
    code: `const a = [1, 2];
const b = [1, 2];
console.log(a == b, a === a, JSON.stringify(a) === JSON.stringify(b));`,
    options: ['false true true', 'true true true', 'false false true', 'true false false'],
    answerIndex: 0,
    verifiedOutput: 'false true true',
    explanation: 'a and b are two different objects, so == is false even with equal contents. A value is equal to itself. Comparing JSON strings is a quick (limited) deep comparison.',
    docsUrl: `${mdn}/Reference/Operators/Equality`,
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/object-freeze', level: 'intermediate', type: 'output', tags: ['objects', 'immutability'],
    language: 'js',
    code: `const o = Object.freeze({ a: 1, nested: { b: 1 } });
o.a = 2;
o.nested.b = 2;
delete o.a;
console.log(o.a, o.nested.b, Object.isFrozen(o));`,
    options: ['1 2 true', '2 2 false', '1 1 true', 'undefined 2 true'],
    answerIndex: 0,
    verifiedOutput: '1 2 true',
    explanation: 'freeze makes the object itself read-only (silently in sloppy mode, with an error in strict mode), but it is shallow: nested objects can still change. seal forbids adding and removing properties but allows editing values.',
    docsUrl: `${mdn}/Reference/Global_Objects/Object/freeze`,
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/json-stringify-skips', level: 'intermediate', type: 'output', tags: ['json', 'interview'],
    language: 'js',
    code: `console.log(JSON.stringify({ a: undefined, f: () => 1, n: null, d: new Date(0) }));`,
    options: ['{"n":null,"d":"1970-01-01T00:00:00.000Z"}', '{"a":null,"f":null,"n":null,"d":0}', '{"n":null}', '{"a":undefined,"f":"() => 1","n":null,"d":{}}'],
    answerIndex: 0,
    verifiedOutput: '{"n":null,"d":"1970-01-01T00:00:00.000Z"}',
    explanation: 'JSON.stringify drops properties whose value is undefined or a function, keeps null, and turns a Date into its ISO string. JSON.parse cannot turn that string back into a Date by itself.',
    docsUrl: `${mdn}/Reference/Global_Objects/JSON/stringify`,
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/destructuring-rest', level: 'beginner', type: 'output', tags: ['destructuring', 'spread'],
    primer: {
      en: 'Destructuring pulls values out of an object or array into variables in one line. The `...rest` part collects everything that was not picked.',
      id: 'Destructuring mengambil nilai dari objek atau array ke dalam variabel dalam satu baris. Bagian `...rest` mengumpulkan semua yang tidak dipilih.',
    },
    language: 'js',
    code: `const { a, ...rest } = { a: 1, b: 2, c: 3 };
console.log(a, rest);`,
    options: ['1 { b: 2, c: 3 }', '1 [ 2, 3 ]', '1 { a: 1, b: 2, c: 3 }', 'undefined { b: 2, c: 3 }'],
    answerIndex: 0,
    verifiedOutput: '1 { b: 2, c: 3 }',
    explanation: 'a takes the property a, and rest is a new object with the remaining properties. The same ... syntax in a function call or array literal is called spread.',
    docsUrl: `${mdn}/Reference/Operators/Destructuring`,
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/some-every', level: 'beginner', type: 'output', tags: ['arrays'],
    primer: {
      en: '`some` asks "does at least one item pass the test?". `every` asks "do all items pass?". On an empty array, `every` says yes, because nothing fails.',
      id: '`some` bertanya "apakah setidaknya satu item lolos tes?". `every` bertanya "apakah semua item lolos?". Pada array kosong, `every` menjawab ya, karena tidak ada yang gagal.',
    },
    language: 'js',
    code: `console.log([1, 2, 3].some((n) => n > 2), [1, 2, 3].every((n) => n > 2), [].every((n) => n > 2));`,
    options: ['true false true', 'true false false', 'false false true', 'true true true'],
    answerIndex: 0,
    verifiedOutput: 'true false true',
    explanation: 'One item (3) passes, so some is true. Not all pass, so every is false. For an empty array every is vacuously true and some is false.',
    docsUrl: `${mdn}/Reference/Global_Objects/Array/every`,
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/memoize', level: 'advanced', type: 'output', tags: ['higher-order', 'closures', 'interview'],
    language: 'js',
    code: `function memoize(fn) {
  const cache = new Map();
  return (n) => {
    if (!cache.has(n)) cache.set(n, fn(n));
    return cache.get(n);
  };
}

let calls = 0;
const square = memoize((n) => { calls++; return n * n; });
square(4); square(4); square(5);
console.log(calls);`,
    options: ['2', '3', '1', '0'],
    answerIndex: 0,
    verifiedOutput: '2',
    explanation: 'memoize is a higher-order function (it takes and returns a function) that uses a closure over a cache. Repeating square(4) is served from the cache, so the real function runs only for 4 and 5.',
    docsUrl: `${mdn}/Guide/Functions#higher-order_functions`,
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/var-let-const', level: 'beginner', type: 'mcq', tags: ['variables', 'interview'],
    primer: {
      en: 'Three keywords create variables. They differ in where the variable is visible (scope) and whether it can be reassigned.',
      id: 'Tiga keyword membuat variabel. Bedanya ada pada di mana variabel itu terlihat (scope) dan apakah bisa diisi ulang.',
    },
    question: 'Which statement about var, let and const is correct?',
    options: [
      'var is function-scoped; let and const are block-scoped; const cannot be reassigned',
      'var is block-scoped; let is function-scoped; const is global',
      'All three are function-scoped and can be reassigned',
      'let and const are hoisted but var is not',
    ],
    answerIndex: 0,
    explanation: 'Prefer const, use let when you must reassign, and avoid var in new code. Redeclaring the same name with let in the same scope is a SyntaxError; with var it is allowed.',
    docsUrl: `${mdn}/Guide/Grammar_and_types#variable_scope`,
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/null-vs-undefined', level: 'beginner', type: 'mcq', tags: ['null', 'interview'],
    primer: {
      en: '`undefined` is what you get when a value was never set. `null` is a value a developer chooses to mean "nothing here".',
      id: '`undefined` adalah yang kamu dapat saat sebuah nilai tidak pernah diisi. `null` adalah nilai yang sengaja dipilih developer untuk berarti "tidak ada isi".',
    },
    question: 'What does a function return if it has no return statement?',
    options: ['undefined', 'null', '0', 'An empty string'],
    answerIndex: 0,
    explanation: 'Missing function results, unset variables, absent object properties and skipped parameters are all undefined. Use null for an intentional empty value, and ?? to supply a default for either.',
    docsUrl: `${mdn}/Reference/Global_Objects/undefined`,
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/single-threaded', level: 'intermediate', type: 'mcq', tags: ['event-loop', 'interview'],
    question: 'JavaScript is single-threaded. How can it still handle many waiting operations (timers, network requests) at once?',
    options: [
      'Slow work runs outside the JavaScript thread, and callbacks are queued and run later by the event loop',
      'It secretly runs every function in a new thread',
      'It blocks until each request finishes',
      'The browser pauses all other tabs',
    ],
    answerIndex: 0,
    explanation: 'Only one piece of JavaScript runs at a time, but I/O is performed by the platform (browser or Node). When it finishes, its callback goes to a queue and the event loop runs it when the call stack is empty. Long synchronous loops therefore block everything.',
    docsUrl: `${mdn}/Event_loop`,
  },
  {
    ...base, topic: 'js-interview', id: 'typescript-node/js-interview/strict-mode', level: 'intermediate', type: 'flashcard', tags: ['strict-mode', 'interview'],
    front: 'What does "use strict" change?',
    back: 'It turns silent mistakes into errors: assigning to an undeclared variable, writing to a frozen object, duplicate parameter names and using `this` as the global object in plain function calls (it becomes undefined). ES modules and classes are strict automatically.',
    explanation: 'Add it at the top of a script or function. TypeScript files compiled as modules are already strict.',
    docsUrl: `${mdn}/Reference/Strict_mode`,
  },
];
