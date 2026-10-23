import type { Card } from '../../core/types.ts';

// Beginner foundations with bilingual primers.
const base = { track: 'typescript-node', level: 'beginner' } as const;
const mdn = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript';
const ts = 'https://www.typescriptlang.org/docs/handbook';

export const cards: Card[] = [
  {
    ...base, topic: 'foundations', id: 'typescript-node/foundations/what-is-typescript', type: 'flashcard', tags: ['typescript'],
    primer: {
      en: 'JavaScript runs in browsers and Node but does not check types: a typo like adding a number to a word only fails when the code runs. TypeScript adds a layer of types that is checked before you run.',
      id: 'JavaScript berjalan di browser dan Node tetapi tidak memeriksa tipe: kesalahan seperti menjumlahkan angka dengan kata baru ketahuan saat kode berjalan. TypeScript menambahkan lapisan tipe yang diperiksa sebelum kode dijalankan.',
    },
    front: 'What is TypeScript and how does it relate to JavaScript?',
    back: 'A superset of JavaScript with static types. The compiler checks types and then erases them, producing plain JavaScript. All valid JavaScript is valid TypeScript.',
    explanation: 'Types exist only at development time. At runtime there is just JavaScript, so TypeScript cannot validate data that arrives from outside (a request body, for example).',
    docsUrl: `${ts}/typescript-in-5-minutes.html`,
  },
  {
    ...base, topic: 'foundations', id: 'typescript-node/foundations/let-const-var', type: 'mcq', tags: ['variables'],
    primer: {
      en: 'A variable is a named box for a value. `const` is a box you cannot replace, `let` is a box you can replace. `var` is the old kind with confusing scope rules.',
      id: 'Variabel adalah kotak bernama untuk menyimpan nilai. `const` adalah kotak yang tidak bisa diganti isinya, `let` adalah kotak yang bisa diganti. `var` adalah jenis lama dengan aturan scope yang membingungkan.',
    },
    question: 'Which declaration should you use by default for a value you never reassign?',
    options: ['const', 'let', 'var', 'No keyword is needed'],
    answerIndex: 0,
    explanation: 'Prefer const and use let only when you must reassign. Note that const stops reassignment, not mutation: you can still push into a const array.',
    docsUrl: `${mdn}/Reference/Statements/const`,
  },
  {
    ...base, topic: 'foundations', id: 'typescript-node/foundations/interface-vs-type', type: 'flashcard', tags: ['types', 'interface'],
    primer: {
      en: 'Both `interface` and `type` let you name the shape of an object, for example "a user has an id and a name". You will see both in real projects.',
      id: 'Baik `interface` maupun `type` dipakai untuk memberi nama pada bentuk sebuah objek, misalnya "user punya id dan name". Keduanya akan kamu temui di proyek nyata.',
    },
    front: 'interface vs type alias',
    back: 'Both describe object shapes. An interface can be extended and re-opened (declaration merging). A type alias can also name unions, primitives and tuples, such as type Role = "admin" | "member".',
    explanation: 'A common rule: use interface for object shapes you expect others to extend, and type for unions and everything else. Consistency in one codebase matters more than the choice.',
    docsUrl: `${ts}/2/everyday-types.html#differences-between-type-aliases-and-interfaces`,
  },
  {
    ...base, topic: 'foundations', id: 'typescript-node/foundations/filter-map', type: 'output', tags: ['arrays'],
    primer: {
      en: '`filter` keeps only the items that pass a test. `map` turns every item into something else. Both return a new array and leave the original untouched.',
      id: '`filter` hanya menyimpan item yang lolos sebuah tes. `map` mengubah setiap item menjadi sesuatu yang lain. Keduanya mengembalikan array baru dan tidak mengubah array asli.',
    },
    language: 'js',
    code: `const result = [1, 2, 3, 4]
  .filter((n) => n % 2 === 0)
  .map((n) => n * 10);
console.log(result);`,
    options: ['[ 20, 40 ]', '[ 10, 30 ]', '[ 2, 4 ]', '[ 10, 20, 30, 40 ]'],
    answerIndex: 0,
    verifiedOutput: '[ 20, 40 ]',
    explanation: 'filter keeps the even numbers 2 and 4, then map multiplies each by 10. forEach, by contrast, returns nothing and is only for side effects.',
    docsUrl: `${mdn}/Reference/Global_Objects/Array/filter`,
  },
  {
    ...base, topic: 'foundations', id: 'typescript-node/foundations/null-undefined', type: 'output', tags: ['null', 'undefined'],
    primer: {
      en: '`undefined` means "no value was ever given". `null` means "empty on purpose". They are different values, but the loose comparison `==` treats them as equal.',
      id: '`undefined` berarti "belum pernah diberi nilai". `null` berarti "sengaja dikosongkan". Keduanya nilai yang berbeda, tetapi perbandingan longgar `==` menganggapnya sama.',
    },
    language: 'js',
    code: `let a;
const b = null;
console.log(a, b, a == b, a === b);`,
    options: ['undefined null true false', 'null null true true', 'undefined undefined false false', 'undefined null false false'],
    answerIndex: 0,
    verifiedOutput: 'undefined null true false',
    explanation: 'An unassigned variable is undefined. null == undefined is true, but === compares type too, so it is false. Use === by default.',
    docsUrl: `${mdn}/Reference/Operators/Equality`,
  },
  {
    ...base, topic: 'foundations', id: 'typescript-node/foundations/loose-vs-strict-equality', type: 'output', tags: ['equality'],
    primer: {
      en: '`==` converts types before comparing, which gives surprising answers. `===` compares value and type with no conversion, so it behaves as you expect.',
      id: '`==` mengubah tipe sebelum membandingkan, sehingga hasilnya kadang mengejutkan. `===` membandingkan nilai dan tipe tanpa konversi, sehingga berperilaku sesuai harapan.',
    },
    language: 'js',
    code: `console.log(1 == '1', 1 === '1', 0 == false);`,
    options: ['true false true', 'true true true', 'false false false', 'false false true'],
    answerIndex: 0,
    verifiedOutput: 'true false true',
    explanation: '== converts the string "1" and the boolean false into numbers first. Using === avoids these conversions entirely.',
    docsUrl: `${mdn}/Reference/Operators/Strict_equality`,
  },
  {
    ...base, topic: 'foundations', id: 'typescript-node/foundations/promise-basics', type: 'flashcard', tags: ['promises', 'async'],
    primer: {
      en: 'Some things take time (a network request, reading a file). A Promise is a receipt: "the result will arrive later". `await` waits for that receipt without freezing the program.',
      id: 'Beberapa hal butuh waktu (request jaringan, membaca file). Promise ibarat tanda terima: "hasilnya akan datang nanti". `await` menunggu tanda terima itu tanpa membekukan program.',
    },
    front: 'What is a Promise and what does async/await do?',
    back: 'A Promise represents a value that will exist later; it is pending, then either fulfilled with a value or rejected with an error. async/await is syntax to write that waiting code in a straight line: await pauses the async function until the promise settles.',
    explanation: 'Wrap await in try/catch to handle rejections. An async function always returns a Promise.',
    docsUrl: `${mdn}/Guide/Using_promises`,
  },
  {
    ...base, topic: 'foundations', id: 'typescript-node/foundations/package-json', type: 'flashcard', tags: ['npm', 'node'],
    primer: {
      en: 'A Node project lists the libraries it needs in a file called package.json. npm reads that file and downloads the libraries into node_modules.',
      id: 'Proyek Node mencatat library yang dibutuhkan di file bernama package.json. npm membaca file itu lalu mengunduh library ke folder node_modules.',
    },
    front: 'What are package.json, dependencies and node_modules?',
    back: 'package.json describes the project: its name, scripts (npm run build) and dependencies. npm install downloads those dependencies into node_modules. devDependencies are only needed while developing, such as test tools.',
    explanation: 'Commit package.json and the lock file, never node_modules; anyone can rebuild it with npm ci.',
    docsUrl: 'https://docs.npmjs.com/cli/configuring-npm/package-json',
  },
  {
    ...base, topic: 'foundations', id: 'typescript-node/foundations/map-vs-foreach', type: 'mcq', tags: ['arrays'],
    primer: {
      en: 'Both `map` and `forEach` visit every item of an array. The difference is what you get back.',
      id: '`map` dan `forEach` sama-sama mengunjungi setiap item array. Bedanya ada pada apa yang dikembalikan.',
    },
    question: 'You want a new array with each price doubled. Which method fits?',
    options: ['map', 'forEach', 'filter', 'find'],
    answerIndex: 0,
    explanation: 'map returns a new array built from the callback results. forEach returns undefined, filter keeps items, find returns one item.',
    docsUrl: `${mdn}/Reference/Global_Objects/Array/map`,
  },
];
