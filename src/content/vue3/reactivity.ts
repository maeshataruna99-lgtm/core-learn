import type { Card } from '../../core/types.ts';

const base = { track: 'vue3' } as const;

export const cards: Card[] = [
  {
    ...base, id: 'vue3/reactivity/ref-vs-reactive', topic: 'reactivity', type: 'flashcard', level: 'beginner', tags: ['ref', 'reactive'],
    front: 'ref vs reactive',
    back: 'ref wraps any value and is accessed through .value in script (auto-unwrapped in templates). reactive makes an object deeply reactive, but only objects, and its properties must not be destructured.',
    explanation: 'Most Vue code uses ref for everything because it works with primitives and can be reassigned safely.',
    docsUrl: 'https://vuejs.org/guide/essentials/reactivity-fundamentals.html',
  },
  {
    ...base, id: 'vue3/reactivity/destructure-reactive', topic: 'reactivity', type: 'bugspot', level: 'intermediate', tags: ['reactive'],
    language: 'ts',
    code: `import { reactive } from 'vue';

const state = reactive({ count: 0 });
const { count } = state;

function inc() {
  state.count++;
}
// the template renders {{ count }}`,
    buggyLines: [4],
    fixedCode: `import { reactive, toRefs } from 'vue';

const state = reactive({ count: 0 });
const { count } = toRefs(state);

function inc() {
  state.count++;
}
// the template renders {{ count }}`,
    proof: {
      harness: `/* CODE_HERE */
inc();
console.log(state.count, typeof count === 'object' ? count.value : count);`,
      buggyOutput: '1 0',
      fixedOutput: '1 1',
    },
    explanation: 'Destructuring copies the number out of the reactive object, so count never updates. Use toRefs(state) or read state.count directly.',
    docsUrl: 'https://vuejs.org/api/reactivity-utilities.html#torefs',
  },
  {
    ...base, id: 'vue3/composition-api/computed-vs-watch', topic: 'composition-api', type: 'mcq', level: 'beginner', tags: ['computed', 'watch'],
    question: 'You need a value derived from other state, cached until its dependencies change. What do you use?',
    options: ['computed', 'watch', 'onMounted', 'provide'],
    answerIndex: 0,
    explanation: 'computed is lazy and cached. Use watch for side effects (API calls, logging) in response to changes, not for deriving values.',
    docsUrl: 'https://vuejs.org/guide/essentials/computed.html',
  },
  {
    ...base, id: 'vue3/props-emits/one-way-flow', topic: 'props-emits', type: 'mcq', level: 'beginner', tags: ['props', 'emits'],
    question: 'A child component needs to change a value owned by its parent. What is the correct pattern?',
    options: [
      'Emit an event (or use defineModel) and let the parent update its state',
      'Assign to the prop directly',
      'Mutate the prop object in place',
      'Use a global variable',
    ],
    answerIndex: 0,
    explanation: 'Props flow one way, down. Children request changes by emitting events; defineModel wraps this pattern for v-model.',
    docsUrl: 'https://vuejs.org/guide/components/props.html#one-way-data-flow',
  },
  {
    ...base, id: 'vue3/router/guard-redirect', topic: 'router', type: 'mcq', level: 'intermediate', tags: ['router', 'guards'],
    question: 'In Vue Router 4, how does a global beforeEach guard redirect an unauthenticated user?',
    options: [
      'Return a route location such as { name: "login" }',
      'Throw an Error',
      'Call next() with no arguments',
      'Return false',
    ],
    answerIndex: 0,
    explanation: 'Returning a location redirects; returning false cancels navigation; returning nothing or true continues.',
    docsUrl: 'https://router.vuejs.org/guide/advanced/navigation-guards.html',
  },
];
