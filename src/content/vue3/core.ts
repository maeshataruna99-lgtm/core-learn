import type { Card } from '../../core/types.ts';

const base = { track: 'vue3' } as const;
const vue = 'https://vuejs.org';

export const cards: Card[] = [
  // ---- reactivity (more) ----
  {
    ...base, topic: 'reactivity', id: 'vue3/reactivity/watch-non-reactive', type: 'bugspot', level: 'intermediate', tags: ['watch'],
    language: 'ts',
    code: `const user = reactive({ name: 'Ada' });

watch(user.name, (name) => save(name));`,
    buggyLines: [3],
    fixedCode: `const user = reactive({ name: 'Ada' });

watch(() => user.name, (name) => save(name));`,
    proof: {
      harness: `import { reactive, watch, nextTick } from 'vue';
const saved = [];
const save = (n) => saved.push(n);
/* CODE_HERE */
user.name = 'Bob';
await nextTick();
console.log(saved.join(','));`,
      buggyOutput: '',
      fixedOutput: 'Bob',
    },
    explanation: 'user.name is read once and passes a plain string, which is not a reactive source. Pass a getter: watch(() => user.name, ...).',
    docsUrl: `${vue}/guide/essentials/watchers.html#watch-source-types`,
  },
  {
    ...base, topic: 'reactivity', id: 'vue3/reactivity/value-in-template', type: 'bugspot', level: 'beginner', tags: ['ref', 'template'],
    language: 'vue',
    code: `<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
</script>

<template>
  <button @click="count++">{{ count.value }}</button>
</template>`,
    buggyLines: [7],
    fixedCode: `<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>`,
    explanation: 'Top-level refs are unwrapped automatically in templates, so count.value is undefined there. Write {{ count }}. Use .value only in script.',
    docsUrl: `${vue}/guide/essentials/reactivity-fundamentals.html#ref-unwrapping-in-templates`,
  },
  {
    ...base, topic: 'reactivity', id: 'vue3/reactivity/next-tick', type: 'flashcard', level: 'intermediate', tags: ['dom'],
    front: 'Why would you await nextTick() after changing state?',
    back: 'Vue batches DOM updates and applies them asynchronously. After mutating state, the DOM is not updated yet; await nextTick() resolves once it has been.',
    explanation: 'Typical use: focus an input that was just rendered with v-if.',
    docsUrl: `${vue}/api/general.html#nexttick`,
  },
  {
    ...base, topic: 'reactivity', id: 'vue3/reactivity/shallow-ref', type: 'mcq', level: 'advanced', tags: ['performance'],
    question: 'When is shallowRef a better choice than ref?',
    options: [
      'For large objects you replace as a whole, so deep tracking is wasted work',
      'For primitive values only',
      'When you need two-way binding',
      'Whenever you use TypeScript',
    ],
    answerIndex: 0,
    explanation: 'ref makes nested properties reactive. shallowRef only tracks .value reassignment, which avoids the proxy overhead for big read-mostly data such as API result lists.',
    docsUrl: `${vue}/api/reactivity-advanced.html#shallowref`,
  },
  // ---- composition-api (more) ----
  {
    ...base, topic: 'composition-api', id: 'vue3/composition-api/script-setup', type: 'flashcard', level: 'beginner', tags: ['script-setup'],
    front: 'What does `<script setup>` give you compared with a plain `setup()` function?',
    back: 'Top-level variables, imports and functions are automatically available in the template, with no return statement and less boilerplate. Compiler macros such as defineProps and defineEmits are available.',
    explanation: 'It compiles to the same thing; it is the recommended syntax for single-file components.',
    docsUrl: `${vue}/api/sfc-script-setup.html`,
  },
  {
    ...base, topic: 'composition-api', id: 'vue3/composition-api/composable', type: 'mcq', level: 'intermediate', tags: ['composables'],
    question: 'What is a composable?',
    options: [
      'A function, conventionally named useX, that encapsulates reusable stateful logic with the Composition API',
      'A component with slots',
      'A Pinia store',
      'A mixin registered globally',
    ],
    answerIndex: 0,
    explanation: 'Composables return refs and functions. Unlike mixins they are explicit about where each value comes from and cannot clash by name.',
    docsUrl: `${vue}/guide/reusability/composables.html`,
  },
  {
    ...base, topic: 'composition-api', id: 'vue3/composition-api/cleanup', type: 'mcq', level: 'intermediate', tags: ['lifecycle'],
    question: 'A component adds a window resize listener in onMounted. Where should it be removed?',
    options: ['onUnmounted (or onBeforeUnmount)', 'onUpdated', 'It is removed automatically', 'In the template'],
    answerIndex: 0,
    explanation: 'Listeners and timers outlive the component unless you clean them up, which causes leaks and updates to unmounted components.',
    docsUrl: `${vue}/api/composition-api-lifecycle.html`,
  },
  // ---- props-emits (more) ----
  {
    ...base, topic: 'props-emits', id: 'vue3/props-emits/define-model', type: 'flashcard', level: 'intermediate', tags: ['v-model'],
    front: 'What does defineModel() replace?',
    back: 'The manual pairing of a modelValue prop with an update:modelValue emit. It returns a ref you can read and assign; the parent\'s v-model stays in sync.',
    explanation: 'Available in Vue 3.4+.',
    docsUrl: `${vue}/guide/components/v-model.html`,
  },
  {
    ...base, topic: 'props-emits', id: 'vue3/props-emits/mutate-prop', type: 'bugspot', level: 'beginner', tags: ['props'],
    language: 'vue',
    code: `<script setup lang="ts">
const props = defineProps<{ count: number }>();

function inc() {
  props.count++;
}
</script>`,
    buggyLines: [5],
    fixedCode: `<script setup lang="ts">
const props = defineProps<{ count: number }>();
const emit = defineEmits<{ 'update:count': [value: number] }>();

function inc() {
  emit('update:count', props.count + 1);
}
</script>`,
    explanation: 'Props are readonly; Vue warns and the parent value is not changed. Emit an event (or use defineModel) and let the parent update its state.',
    docsUrl: `${vue}/guide/components/props.html#one-way-data-flow`,
  },
  // ---- router (more) ----
  {
    ...base, topic: 'router', id: 'vue3/router/use-route-vs-router', type: 'flashcard', level: 'beginner', tags: ['router'],
    front: 'useRoute() vs useRouter()',
    back: 'useRoute returns the current reactive route (params, query, path). useRouter returns the router instance for navigating with push, replace and back.',
    explanation: 'Reading route.query.mode and calling router.push({ name: "learn" }) is the usual split.',
    docsUrl: 'https://router.vuejs.org/guide/advanced/composition-api.html',
  },
  {
    ...base, topic: 'router', id: 'vue3/router/lazy-routes', type: 'mcq', level: 'intermediate', tags: ['router', 'performance'],
    question: 'What does `component: () => import("./views/HomeView.vue")` achieve in a route definition?',
    options: [
      'The view is split into its own chunk and downloaded when the route is first visited',
      'The view is rendered on the server',
      'The view is kept alive',
      'The route becomes public',
    ],
    answerIndex: 0,
    explanation: 'Dynamic import creates a code-split chunk, keeping the initial bundle small. This app lazy-loads all five of its views that way.',
    docsUrl: 'https://router.vuejs.org/guide/advanced/lazy-loading.html',
  },
];
