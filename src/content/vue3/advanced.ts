import type { Card } from '../../core/types.ts';

const base = { track: 'vue3' } as const;
const vue = 'https://vuejs.org';
const simrs = 'maeshataruna99-lgtm/core-forge-simrs';
const nuxt = 'https://nuxt.com/docs';
const tq = 'https://tanstack.com/query/latest/docs/framework/vue';

export const cards: Card[] = [
  // ---- nuxt ----
  {
    ...base, topic: 'nuxt', id: 'vue3/nuxt/auto-imports', type: 'mcq', level: 'beginner', tags: ['nuxt'],
    question: 'In Nuxt, why can a page call `useMcuAlergiApi()` without importing it?',
    options: [
      'Nuxt auto-imports exports from the composables/ directory (and Vue APIs such as ref and computed)',
      'It is a global browser function',
      'TypeScript injects it',
      'Vue registers every file in the project',
    ],
    answerIndex: 0,
    explanation: 'Auto-imports are resolved at build time, so unused ones are tree-shaken. Explicit imports still work and are clearer when a name could be ambiguous.',
    source: { repo: simrs, path: 'apps/web/composables/master/mcu/useMcuAlergiApi.ts' },
    docsUrl: `${nuxt}/guide/concepts/auto-imports`,
  },
  {
    ...base, topic: 'nuxt', id: 'vue3/nuxt/usefetch-vs-fetch', type: 'flashcard', level: 'intermediate', tags: ['nuxt', 'ssr'],
    front: 'useFetch vs $fetch in Nuxt',
    back: 'useFetch is for loading data in a component or page: it runs on the server, passes the result to the client in the payload, and avoids a second request on hydration. $fetch is a plain request function for event handlers such as clicks and form submits.',
    explanation: 'Calling $fetch at the top level of a component fetches twice (once on the server, once on the client).',
    docsUrl: `${nuxt}/getting-started/data-fetching`,
  },
  {
    ...base, topic: 'nuxt', id: 'vue3/nuxt/hydration-mismatch', type: 'mcq', level: 'advanced', tags: ['nuxt', 'ssr'],
    question: 'A component renders `{{ Math.random() }}` directly in its template and Nuxt warns about a hydration mismatch. Why?',
    options: [
      'The server and the client render different values, so the client HTML does not match what the server sent',
      'Math.random is not allowed in Vue',
      'Hydration only works in production',
      'The template must be async',
    ],
    answerIndex: 0,
    explanation: 'Server-rendered HTML must match the first client render. Generate non-deterministic values once on the server and share them (useState), or set them in onMounted so they only exist in the browser.',
    docsUrl: `${vue}/guide/scaling-up/ssr.html#hydration-mismatch`,
  },
  // ---- vue-query ----
  {
    ...base, topic: 'vue-query', id: 'vue3/vue-query/query-key', type: 'mcq', level: 'intermediate', tags: ['tanstack', 'cache'],
    question: 'In `useQuery({ queryKey: computed(() => ["mcu-alergi", "find-by-id", findId.value]) })`, what happens when findId changes?',
    options: [
      'The key changes, so the query is looked up (and fetched if needed) under the new key',
      'The old result is overwritten in place',
      'Nothing; keys are read once',
      'The component remounts',
    ],
    answerIndex: 0,
    explanation: 'The query key is the cache identity and the dependency list in one. Put every variable the request depends on into it, and each combination gets its own cache entry.',
    source: { repo: simrs, path: 'apps/web/composables/master/mcu/useMcuAlergiApi.ts' },
    docsUrl: `${tq}/guides/queries`,
  },
  {
    ...base, topic: 'vue-query', id: 'vue3/vue-query/enabled', type: 'flashcard', level: 'intermediate', tags: ['tanstack'],
    front: 'What is the `enabled` option for in useQuery?',
    back: 'It turns automatic fetching on or off. With enabled: computed(() => findId.value !== null) the query waits until an id has been chosen, instead of requesting /by-id/null.',
    explanation: 'Dependent queries use enabled so a request only starts once its inputs exist.',
    source: { repo: simrs, path: 'apps/web/composables/master/mcu/useMcuAlergiApi.ts' },
    docsUrl: `${tq}/guides/dependent-queries`,
  },
  {
    ...base, topic: 'vue-query', id: 'vue3/vue-query/stale-time', type: 'mcq', level: 'intermediate', tags: ['tanstack', 'cache'],
    question: 'What does staleTime control in TanStack Query?',
    options: [
      'How long cached data counts as fresh before it may be refetched in the background',
      'How long to wait before showing a spinner',
      'When the cache is deleted from memory',
      'The request timeout',
    ],
    answerIndex: 0,
    explanation: 'The default is 0: data is stale immediately, so it refetches on mount and window focus while still showing the cached value. Raise it for reference data that rarely changes; cacheTime/gcTime is the separate setting for removal.',
    docsUrl: `${tq}/guides/important-defaults`,
  },
  {
    ...base, topic: 'vue-query', id: 'vue3/vue-query/invalidate-after-mutation', type: 'flashcard', level: 'intermediate', tags: ['tanstack', 'mutations'],
    front: 'After a successful create/update mutation, how do you refresh a list query?',
    back: 'Call queryClient.invalidateQueries({ queryKey: [...] }) in the mutation\'s onSuccess. Matching queries are marked stale and refetched if they are in use.',
    explanation: 'Invalidating by key prefix refreshes every variant (page, filters) of that list at once.',
    source: { repo: simrs, path: 'apps/web/composables/master/mcu/useMcuAlergiApi.ts' },
    docsUrl: `${tq}/guides/invalidations-from-mutations`,
  },
  // ---- pinia ----
  {
    ...base, topic: 'pinia', id: 'vue3/pinia/store-to-refs', type: 'mcq', level: 'intermediate', tags: ['pinia', 'reactivity'],
    question: 'You write `const { count } = useCounterStore()` and the template never updates. What fixes it?',
    options: [
      'Use storeToRefs(useCounterStore()) for state and getters; actions can be destructured directly',
      'Wrap the store in JSON.stringify',
      'Call $reset() first',
      'Use var instead of const',
    ],
    answerIndex: 0,
    explanation: 'A store is a reactive object, so destructuring state copies plain values exactly like destructuring reactive(). storeToRefs keeps them reactive; actions are plain functions and are safe to destructure.',
    docsUrl: 'https://pinia.vuejs.org/core-concepts/#Destructuring-from-a-Store',
  },
  {
    ...base, topic: 'pinia', id: 'vue3/pinia/when-to-use', type: 'flashcard', level: 'beginner', tags: ['pinia', 'state'],
    front: 'When should state go in a Pinia store instead of a composable or component?',
    back: 'When several unrelated components share it (current user, cart, filters) or it must survive navigation. State used by one component or one subtree stays local in a ref or a composable.',
    explanation: 'Global state is easier to reason about when there is little of it.',
    docsUrl: 'https://pinia.vuejs.org/introduction.html',
  },
  // ---- forms ----
  {
    ...base, topic: 'forms', id: 'vue3/forms/v-model-modifiers', type: 'mcq', level: 'beginner', tags: ['v-model'],
    question: 'A select uses `v-model.number="length"` with `<option :value="10">`. What does .number add?',
    options: [
      'It casts the bound value with parseFloat, keeping the string if it cannot be parsed',
      'It restricts the input to digits',
      'It formats the display with commas',
      'It rejects decimals',
    ],
    answerIndex: 0,
    explanation: 'Form controls give strings. .number converts them, and .trim removes surrounding whitespace. For a select, binding numeric :value options achieves the same.',
    docsUrl: `${vue}/guide/essentials/forms.html#number`,
  },
  // ---- composition-api (more) ----
  {
    ...base, topic: 'composition-api', id: 'vue3/composition-api/provide-inject', type: 'mcq', level: 'intermediate', tags: ['provide-inject'],
    question: 'When is provide/inject a good fit?',
    options: [
      'Passing data from an ancestor to deep descendants without threading props through every level',
      'Sharing state between unrelated pages',
      'Replacing events from child to parent',
      'Persisting data across reloads',
    ],
    answerIndex: 0,
    explanation: 'It scopes shared values to a component subtree (a form, a tabs widget). Provide readonly refs or functions so descendants cannot mutate state arbitrarily; use a store for app-wide state.',
    docsUrl: `${vue}/guide/components/provide-inject.html`,
  },
  {
    ...base, topic: 'composition-api', id: 'vue3/composition-api/template-refs', type: 'flashcard', level: 'intermediate', tags: ['refs', 'dom'],
    front: 'How do you get a DOM element in <script setup>?',
    back: 'Give the element a ref attribute and read it after mount: with useTemplateRef("name") (Vue 3.5+), or a ref(null) variable of the same name. It is null until the component is mounted, so use it in onMounted or after await nextTick().',
    explanation: 'Touching the element during setup would find null because nothing has rendered yet.',
    docsUrl: `${vue}/guide/essentials/template-refs.html`,
  },
  // ---- reactivity (more) ----
  {
    ...base, topic: 'reactivity', id: 'vue3/reactivity/computed-no-side-effects', type: 'mcq', level: 'intermediate', tags: ['computed'],
    question: 'Why should a computed getter not modify other state or call an API?',
    options: [
      'Computed values are cached and may be re-run or skipped unpredictably; getters should be pure derivations',
      'Computed cannot read refs',
      'It would run only once',
      'Vue forbids it at compile time',
    ],
    answerIndex: 0,
    explanation: 'Side effects belong in watch or event handlers. A computed that mutates state can trigger loops and makes behaviour depend on when something was read.',
    docsUrl: `${vue}/guide/essentials/computed.html#getters-should-be-side-effect-free`,
  },
  {
    ...base, topic: 'reactivity', id: 'vue3/reactivity/watch-vs-watch-effect', type: 'flashcard', level: 'intermediate', tags: ['watch'],
    front: 'watch vs watchEffect',
    back: 'watch takes explicit sources, is lazy by default (use { immediate: true } to run at once), and gives you the old and new values. watchEffect runs immediately and tracks whatever reactive values it reads, with no old value.',
    explanation: 'Choose watch when you care about which value changed; watchEffect when the effect is simply "keep this in sync with whatever it uses".',
    docsUrl: `${vue}/guide/essentials/watchers.html#watch-vs-watcheffect`,
  },
  // ---- router (more) ----
  {
    ...base, topic: 'router', id: 'vue3/router/query-values-are-strings', type: 'mcq', level: 'beginner', tags: ['router', 'query'],
    question: 'In this app, `route.query.mode === "interview"` picks the interview mode. What is the type of a query value in Vue Router?',
    options: [
      'A string, null or an array of those; it is never a number or boolean',
      'Always a string',
      'The type you declared in the URL',
      'A parsed JSON value',
    ],
    answerIndex: 0,
    explanation: 'Repeated parameters (?a=1&a=2) become arrays, and a bare ?flag is null. Convert and validate before using a query value as a number or boolean.',
    docsUrl: 'https://router.vuejs.org/guide/essentials/route-matching-syntax.html',
  },
];
