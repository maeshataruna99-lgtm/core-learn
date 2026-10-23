import type { Card } from '../../core/types.ts';

// Data structures and algorithms fundamentals. Written from scratch; output cards run on Node.
const base = { track: 'cs-basics', topic: 'dsa' } as const;
const wiki = 'https://en.wikipedia.org/wiki';

export const cards: Card[] = [
  {
    ...base, id: 'cs-basics/dsa/big-o-basics', level: 'beginner', type: 'flashcard', tags: ['big-o', 'interview'],
    primer: {
      en: 'Two programs can both give the right answer, but one may get very slow when the data grows. Big-O notation describes how the work grows with the input size n, ignoring small details.',
      id: 'Dua program bisa sama-sama memberi jawaban benar, tetapi salah satunya bisa sangat lambat saat data bertambah. Notasi Big-O menggambarkan bagaimana pekerjaan bertambah mengikuti ukuran input n, dengan mengabaikan detail kecil.',
    },
    front: 'What do O(1), O(log n), O(n), O(n log n) and O(n²) mean?',
    back: 'O(1): constant time (array access by index). O(log n): the work grows slowly, halving the problem each step (binary search). O(n): one pass over the data (linear search). O(n log n): efficient sorting (merge sort). O(n²): a loop inside a loop (naive sorting, comparing every pair).',
    explanation: 'Doubling n doubles an O(n) task but quadruples an O(n²) one, which is why n² algorithms break on large inputs.',
    docsUrl: `${wiki}/Big_O_notation`,
  },
  {
    ...base, id: 'cs-basics/dsa/nested-loops', level: 'beginner', type: 'mcq', tags: ['big-o'],
    primer: {
      en: 'Count how many times the innermost line runs. A single loop over n items runs n times. A loop inside another loop runs n times n.',
      id: 'Hitung berapa kali baris paling dalam dijalankan. Satu loop atas n item berjalan n kali. Loop di dalam loop lain berjalan n kali n.',
    },
    question: 'What is the time complexity of `for i in 0..n { for j in 0..n { work() } }`?',
    options: ['O(n²)', 'O(n)', 'O(log n)', 'O(2n)'],
    answerIndex: 0,
    explanation: 'work() runs n × n times. Constants are dropped in Big-O, so O(2n) is just O(n), but a nested loop over the same data is O(n²).',
    docsUrl: `${wiki}/Time_complexity`,
  },
  {
    ...base, id: 'cs-basics/dsa/array-vs-linked-list', level: 'beginner', type: 'mcq', tags: ['arrays', 'linked-list', 'interview'],
    primer: {
      en: 'An array stores items side by side in memory, so you can jump straight to item number i. A linked list stores each item with a pointer to the next one, so you must follow the chain from the start.',
      id: 'Array menyimpan item berdampingan di memori, sehingga kamu bisa langsung melompat ke item nomor i. Linked list menyimpan setiap item beserta pointer ke item berikutnya, sehingga kamu harus menelusuri rantainya dari awal.',
    },
    question: 'Which operation is faster on an array than on a linked list?',
    options: [
      'Reading the item at index i',
      'Inserting at the front',
      'Removing a node when you already hold a pointer to it',
      'Splitting the list in two',
    ],
    answerIndex: 0,
    explanation: 'Array index access is O(1). A linked list needs O(n) to reach the i-th node, but inserting or removing at a known node is O(1) because no items shift. Arrays shift items on insert, which is O(n).',
    docsUrl: `${wiki}/Linked_list`,
  },
  {
    ...base, id: 'cs-basics/dsa/stack-lifo', level: 'beginner', type: 'output', tags: ['stack'],
    primer: {
      en: 'A stack is a pile of plates: you add on top and take from the top, so the last thing in is the first thing out (LIFO). A browser\'s back button and undo both work like a stack.',
      id: 'Stack seperti tumpukan piring: kamu menaruh di atas dan mengambil dari atas, sehingga yang terakhir masuk adalah yang pertama keluar (LIFO). Tombol back browser dan undo bekerja seperti stack.',
    },
    language: 'js',
    code: `const stack = [];
stack.push('a');
stack.push('b');
stack.push('c');
console.log(stack.pop(), stack.pop(), stack.length);`,
    options: ['c b 1', 'a b 1', 'c b 0', 'a b 3'],
    answerIndex: 0,
    verifiedOutput: 'c b 1',
    explanation: 'pop() removes the most recently pushed item. Function calls also use a stack (the call stack), which is why endless recursion overflows it.',
    docsUrl: `${wiki}/Stack_(abstract_data_type)`,
  },
  {
    ...base, id: 'cs-basics/dsa/hash-table', level: 'intermediate', type: 'flashcard', tags: ['hashing', 'interview'],
    front: 'How does a hash table work, and what is a collision?',
    back: 'A hash function turns a key into an index of an array of buckets, so lookups, inserts and deletes are O(1) on average. A collision happens when two keys map to the same bucket; it is handled by chaining (a small list per bucket) or probing for another slot. With many collisions it degrades toward O(n).',
    explanation: 'Java\'s HashMap, JavaScript\'s Map and Python\'s dict are hash tables. That is also why objects used as keys need a consistent hashCode and equals.',
    docsUrl: `${wiki}/Hash_table`,
  },
  {
    ...base, id: 'cs-basics/dsa/binary-search-steps', level: 'intermediate', type: 'output', tags: ['searching', 'big-o', 'interview'],
    language: 'js',
    code: `function steps(sorted, target) {
  let lo = 0;
  let hi = sorted.length - 1;
  let n = 0;
  while (lo <= hi) {
    n++;
    const mid = (lo + hi) >> 1;
    if (sorted[mid] === target) return n;
    if (sorted[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return n;
}

const data = Array.from({ length: 16 }, (_, i) => i * 2);
console.log(steps(data, 30), steps(data, 1));`,
    options: ['5 4', '16 16', '4 4', '1 1'],
    answerIndex: 0,
    verifiedOutput: '5 4',
    explanation: 'Binary search needs a sorted array and halves the search range each step, so at most about log2(n) + 1 steps: 5 for 16 items. A linear search might need all 16. Finding 30 (the last item) takes 5 steps; the missing value 1 ends after 4.',
    docsUrl: `${wiki}/Binary_search_algorithm`,
  },
  {
    ...base, id: 'cs-basics/dsa/factorial-recursion', level: 'beginner', type: 'output', tags: ['recursion'],
    primer: {
      en: 'Recursion means a function calls itself on a smaller version of the problem. It needs a base case, the point where it stops calling itself.',
      id: 'Rekursi berarti sebuah fungsi memanggil dirinya sendiri untuk versi masalah yang lebih kecil. Ia butuh base case, titik di mana ia berhenti memanggil dirinya.',
    },
    language: 'js',
    code: `function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1);
}
console.log(fact(5));`,
    options: ['120', '25', '15', '5'],
    answerIndex: 0,
    verifiedOutput: '120',
    explanation: 'fact(5) = 5 × 4 × 3 × 2 × 1. The base case n <= 1 stops the chain; each call waits on the call stack until the smaller one returns.',
    docsUrl: `${wiki}/Recursion_(computer_science)`,
  },
  {
    ...base, id: 'cs-basics/dsa/missing-base-case', level: 'beginner', type: 'bugspot', tags: ['recursion', 'bug'],
    primer: {
      en: 'A recursive function without a base case calls itself forever. Each call uses memory on the call stack until the program crashes with a stack overflow.',
      id: 'Fungsi rekursif tanpa base case memanggil dirinya selamanya. Setiap panggilan memakai memori di call stack sampai program crash karena stack overflow.',
    },
    language: 'js',
    code: `let calls = 0;
function countdown(n) {
  calls++;
  countdown(n - 1);
}`,
    buggyLines: [4],
    fixedCode: `let calls = 0;
function countdown(n) {
  calls++;
  if (n > 0) countdown(n - 1);
}`,
    proof: {
      harness: `/* CODE_HERE */
try {
  countdown(3);
  console.log('ok ' + calls);
} catch (e) {
  console.log(e.name);
}`,
      buggyOutput: 'RangeError',
      fixedOutput: 'ok 4',
    },
    explanation: 'countdown never stops, so it overflows the stack (RangeError in JavaScript, StackOverflowError in Java). Add a base case that returns before the next recursive call.',
    docsUrl: `${wiki}/Stack_overflow`,
  },
  {
    ...base, id: 'cs-basics/dsa/sorting-complexity', level: 'intermediate', type: 'mcq', tags: ['sorting', 'big-o', 'interview'],
    question: 'Which statement about sorting algorithms is correct?',
    options: [
      'Merge sort is O(n log n) in every case; quicksort is O(n log n) on average but O(n²) in its worst case',
      'Bubble sort is O(n log n)',
      'Quicksort is always faster than merge sort',
      'Every comparison sort can run in O(n)',
    ],
    answerIndex: 0,
    explanation: 'Comparison-based sorting cannot beat O(n log n) in general. Merge sort is stable and predictable but needs extra memory; quicksort works in place and is fast in practice. Java\'s object sort (TimSort) and JavaScript\'s Array.sort are stable.',
    docsUrl: `${wiki}/Sorting_algorithm`,
  },
  {
    ...base, id: 'cs-basics/dsa/tree-terms', level: 'beginner', type: 'flashcard', tags: ['trees'],
    primer: {
      en: 'A tree is data arranged like a family tree or a folder structure: one starting point at the top, and each item can have items below it.',
      id: 'Tree adalah data yang tersusun seperti silsilah keluarga atau struktur folder: satu titik awal di atas, dan setiap item bisa punya item di bawahnya.',
    },
    front: 'What are the root, leaf, parent, child and height of a tree?',
    back: 'The root is the top node and has no parent. A parent has children below it. A leaf has no children. The height is the number of edges on the longest path from the root down to a leaf.',
    explanation: 'The file system, the HTML DOM and the Vue component hierarchy are all trees.',
    docsUrl: `${wiki}/Tree_(data_structure)`,
  },
  {
    ...base, id: 'cs-basics/dsa/bst-inorder', level: 'intermediate', type: 'output', tags: ['trees', 'bst', 'interview'],
    language: 'js',
    code: `function insert(node, value) {
  if (!node) return { value, left: null, right: null };
  if (value < node.value) node.left = insert(node.left, value);
  else node.right = insert(node.right, value);
  return node;
}

function inorder(node, out = []) {
  if (node) {
    inorder(node.left, out);
    out.push(node.value);
    inorder(node.right, out);
  }
  return out;
}

let root = null;
for (const v of [5, 3, 8, 1, 4]) root = insert(root, v);
console.log(inorder(root).join(' '));`,
    options: ['1 3 4 5 8', '5 3 8 1 4', '8 5 4 3 1', '1 4 3 8 5'],
    answerIndex: 0,
    verifiedOutput: '1 3 4 5 8',
    explanation: 'In a binary search tree every left value is smaller and every right value is larger. An in-order traversal (left, node, right) therefore visits values in sorted order. Search, insert and delete are O(log n) when the tree is balanced.',
    docsUrl: `${wiki}/Binary_search_tree`,
  },
  {
    ...base, id: 'cs-basics/dsa/bfs-vs-dfs', level: 'intermediate', type: 'output', tags: ['graphs', 'interview'],
    language: 'js',
    code: `const graph = { A: ['B', 'C'], B: ['D'], C: ['D'], D: [] };

function bfs(start) {
  const seen = new Set([start]);
  const queue = [start];
  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const next of graph[node]) {
      if (!seen.has(next)) { seen.add(next); queue.push(next); }
    }
  }
  return order.join('');
}

function dfs(node, seen = new Set(), order = []) {
  seen.add(node);
  order.push(node);
  for (const next of graph[node]) if (!seen.has(next)) dfs(next, seen, order);
  return order.join('');
}

console.log(bfs('A'), dfs('A'));`,
    options: ['ABCD ABDC', 'ABCD ABCD', 'ABDC ABCD', 'ACBD ABDC'],
    answerIndex: 0,
    verifiedOutput: 'ABCD ABDC',
    explanation: 'Breadth-first search uses a queue and visits level by level (A, then B and C, then D): good for shortest paths in unweighted graphs. Depth-first search goes as deep as possible first (A, B, D, then back to C) and uses a stack or recursion.',
    docsUrl: `${wiki}/Breadth-first_search`,
  },
];
