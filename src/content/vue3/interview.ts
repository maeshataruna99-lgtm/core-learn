import type { Card } from '../../core/types.ts';

// Vue interview-style cards, written from scratch.
const base = { track: 'vue3' } as const;
const vue = 'https://vuejs.org';

export const cards: Card[] = [
  {
    ...base, topic: 'vue-interview', id: 'vue3/vue-interview/v-if-vs-v-show', level: 'beginner', type: 'mcq', tags: ['directives', 'interview'],
    primer: {
      en: 'Both `v-if` and `v-show` hide or show an element depending on a condition. They hide it in different ways, which changes their cost.',
      id: '`v-if` dan `v-show` sama-sama menyembunyikan atau menampilkan elemen berdasarkan sebuah kondisi. Cara menyembunyikannya berbeda, dan itu mengubah biayanya.',
    },
    question: 'What is the difference between v-if and v-show?',
    options: [
      'v-if adds and removes the element from the DOM; v-show keeps it and only toggles CSS display',
      'v-show removes the element from the DOM; v-if only changes its color',
      'v-if works only on components; v-show only on inputs',
      'They are identical',
    ],
    answerIndex: 0,
    explanation: 'Use v-show for something toggled very often (cheap: one CSS change). Use v-if when the condition rarely changes or the content is expensive to create, because a false v-if renders nothing at all.',
    docsUrl: `${vue}/guide/essentials/conditional.html#v-if-vs-v-show`,
  },
  {
    ...base, topic: 'vue-interview', id: 'vue3/vue-interview/v-html-xss', level: 'intermediate', type: 'mcq', tags: ['security', 'interview'],
    question: 'Why is `<div v-html="comment"></div>` dangerous when comment comes from users?',
    options: [
      'It inserts the text as raw HTML, so an injected <script> or onerror attribute can run (XSS)',
      'It makes the page slower to load',
      'It removes the HTML tags',
      'It only works on the server',
    ],
    answerIndex: 0,
    explanation: 'Normal {{ }} interpolation escapes HTML. v-html does not. Only use it with content you trust or sanitize first (for example with DOMPurify).',
    docsUrl: `${vue}/guide/best-practices/security.html#html-injection`,
  },
  {
    ...base, topic: 'vue-interview', id: 'vue3/vue-interview/computed-vs-method', level: 'intermediate', type: 'mcq', tags: ['computed', 'interview'],
    question: 'How does a computed property differ from a method called in the template?',
    options: [
      'A computed value is cached and recalculated only when its reactive dependencies change; a method runs on every render',
      'A method is cached; a computed value runs on every render',
      'A computed value can take arguments; a method cannot',
      'There is no difference at all',
    ],
    answerIndex: 0,
    explanation: 'Use computed for values derived from state (filtered lists, totals). Use methods for actions or when you need to pass arguments.',
    docsUrl: `${vue}/guide/essentials/computed.html#computed-caching-vs-methods`,
  },
  {
    ...base, topic: 'vue-interview', id: 'vue3/vue-interview/lifecycle-hooks', level: 'intermediate', type: 'mcq', tags: ['lifecycle', 'interview'],
    question: 'Where should you start a request that needs the rendered DOM (for example to focus an input)?',
    options: ['onMounted', 'onBeforeMount', 'Directly at the top of the template', 'onUnmounted'],
    answerIndex: 0,
    explanation: 'onMounted runs after the component is inserted into the page, so template refs are available. In the Composition API, setup() itself plays the role of the old beforeCreate and created hooks.',
    docsUrl: `${vue}/guide/essentials/lifecycle.html`,
  },
  {
    ...base, topic: 'vue-interview', id: 'vue3/vue-interview/virtual-dom', level: 'intermediate', type: 'flashcard', tags: ['virtual-dom', 'interview'],
    front: 'What is the virtual DOM and how is it different from the Shadow DOM?',
    back: 'The virtual DOM is a lightweight JavaScript tree Vue uses to work out the smallest set of changes to apply to the real DOM after state changes. The Shadow DOM is a browser feature (web components) that encapsulates markup and styles inside an element; it is unrelated to Vue\'s rendering strategy.',
    explanation: 'Vue 3 also compiles templates ahead of time to mark static and dynamic parts, so it can skip diffing work.',
    docsUrl: `${vue}/guide/extras/rendering-mechanism.html`,
  },
  {
    ...base, topic: 'vue-interview', id: 'vue3/vue-interview/event-modifiers', level: 'beginner', type: 'mcq', tags: ['events'],
    primer: {
      en: 'Event handlers often need small chores, like stopping a form from reloading the page. Vue lets you add these as modifiers after the event name instead of writing the code yourself.',
      id: 'Event handler sering butuh pekerjaan kecil, misalnya mencegah form memuat ulang halaman. Vue memungkinkan kamu menambahkannya sebagai modifier setelah nama event, tanpa menulis kodenya sendiri.',
    },
    question: 'What does `<form @submit.prevent="save">` do?',
    options: [
      'Runs save and stops the browser\'s default form submission (page reload)',
      'Prevents save from ever running',
      'Submits the form twice',
      'Disables the form',
    ],
    answerIndex: 0,
    explanation: '.prevent calls event.preventDefault(). Other modifiers: .stop (stop bubbling), .once (run only once), .self, and key modifiers like @keyup.enter.',
    docsUrl: `${vue}/guide/essentials/event-handling.html#event-modifiers`,
  },
  {
    ...base, topic: 'vue-interview', id: 'vue3/vue-interview/v-model-two-way', level: 'beginner', type: 'flashcard', tags: ['v-model', 'interview'],
    primer: {
      en: 'Normally data flows one way: variable to screen. For form fields you also want the other way: what the user types updates the variable. `v-model` does both.',
      id: 'Biasanya data mengalir satu arah: dari variabel ke layar. Untuk field form kamu juga butuh arah sebaliknya: apa yang diketik pengguna memperbarui variabel. `v-model` melakukan keduanya.',
    },
    front: 'What is v-model and what does it expand to?',
    back: 'Two-way binding for form inputs and components. On an input it is shorthand for :value="text" plus @input="text = $event.target.value". On a component it passes a modelValue prop and listens for update:modelValue (defineModel wraps this).',
    explanation: 'Vue\'s general data flow stays one-way (props down, events up); v-model is a convenience built from those two pieces.',
    docsUrl: `${vue}/guide/essentials/forms.html`,
  },
  {
    ...base, topic: 'vue-interview', id: 'vue3/vue-interview/slots', level: 'intermediate', type: 'flashcard', tags: ['slots'],
    front: 'What are slots in Vue?',
    back: 'Placeholders in a child component\'s template where the parent can pass its own content, for example <Card><p>Hello</p></Card>. Named slots (<slot name="header" />) allow several insertion points, and scoped slots let the child pass data back to the slot content.',
    explanation: 'Props pass data; slots pass template content. Together they make layout components such as cards, modals and tables reusable.',
    docsUrl: `${vue}/guide/components/slots.html`,
  },
];
