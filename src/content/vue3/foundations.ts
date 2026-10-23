import type { Card } from '../../core/types.ts';

// Beginner foundations with bilingual primers.
const base = { track: 'vue3', level: 'beginner' } as const;
const vue = 'https://vuejs.org';

export const cards: Card[] = [
  {
    ...base, topic: 'foundations', id: 'vue3/foundations/what-is-vue', type: 'flashcard', tags: ['vue'],
    primer: {
      en: 'Without a framework, updating a web page means finding elements and changing them by hand. In Vue you describe what the page should look like for the current data, and Vue updates the page whenever the data changes.',
      id: 'Tanpa framework, memperbarui halaman web berarti mencari elemen lalu mengubahnya manual. Di Vue kamu mendeskripsikan tampilan halaman untuk data saat ini, dan Vue memperbarui halaman setiap kali data berubah.',
    },
    front: 'What is Vue and what problem does it solve?',
    back: 'A JavaScript framework for building user interfaces from components. It keeps the page in sync with your data (reactivity), so you change data and Vue updates the DOM.',
    explanation: 'Nuxt builds on top of Vue to add routing conventions, server rendering and more.',
    docsUrl: `${vue}/guide/introduction.html`,
  },
  {
    ...base, topic: 'foundations', id: 'vue3/foundations/single-file-component', type: 'flashcard', tags: ['sfc'],
    primer: {
      en: 'A Vue component is a reusable piece of screen (a button, a card, a form). It lives in one file ending in .vue that holds its logic, its HTML and its styles together.',
      id: 'Komponen Vue adalah potongan tampilan yang bisa dipakai ulang (tombol, kartu, form). Ia berada di satu file berakhiran .vue yang menyimpan logika, HTML, dan style sekaligus.',
    },
    front: 'What are the parts of a .vue single-file component?',
    back: '<script setup> for the logic, <template> for the HTML, and an optional <style> for CSS. All three describe one component.',
    explanation: 'The template can use anything declared at the top level of <script setup>, such as variables and functions, without exporting them.',
    docsUrl: `${vue}/guide/scaling-up/sfc.html`,
  },
  {
    ...base, topic: 'foundations', id: 'vue3/foundations/interpolation', type: 'mcq', tags: ['template'],
    primer: {
      en: 'To show a variable inside HTML, wrap its name in double curly braces. Vue replaces it with the value and refreshes it when the value changes.',
      id: 'Untuk menampilkan variabel di dalam HTML, bungkus namanya dengan kurung kurawal ganda. Vue menggantinya dengan nilai variabel dan memperbaruinya saat nilai berubah.',
    },
    question: 'How do you display a variable named `name` inside a Vue template?',
    options: ['{{ name }}', '${name}', '<name>', '{name}'],
    answerIndex: 0,
    explanation: '{{ }} is called interpolation. It accepts any single JavaScript expression, such as {{ price * 2 }}, but not statements like if.',
    docsUrl: `${vue}/guide/essentials/template-syntax.html#text-interpolation`,
  },
  {
    ...base, topic: 'foundations', id: 'vue3/foundations/v-if-v-for', type: 'mcq', tags: ['directives'],
    primer: {
      en: 'Attributes starting with `v-` are directives: instructions for Vue. `v-if` shows an element only when a condition is true. `v-for` repeats an element for every item in a list.',
      id: 'Atribut yang diawali `v-` disebut directive: instruksi untuk Vue. `v-if` menampilkan elemen hanya ketika kondisi bernilai benar. `v-for` mengulang elemen untuk setiap item dalam daftar.',
    },
    question: 'Which directive repeats an element once for each item of an array?',
    options: ['v-for', 'v-if', 'v-model', 'v-bind'],
    answerIndex: 0,
    explanation: 'Write v-for="item in items" and always add a unique :key such as :key="item.id", so Vue can track which element belongs to which item.',
    docsUrl: `${vue}/guide/essentials/list.html`,
  },
  {
    ...base, topic: 'foundations', id: 'vue3/foundations/v-for-key', type: 'bugspot', tags: ['v-for', 'key'],
    primer: {
      en: 'When a list changes, Vue needs a way to tell items apart. The `:key` attribute gives every item a unique identity, such as its id.',
      id: 'Saat daftar berubah, Vue perlu cara untuk membedakan item. Atribut `:key` memberi setiap item identitas unik, misalnya id-nya.',
    },
    language: 'vue',
    code: `<template>
  <ul>
    <li v-for="user in users">{{ user.name }}</li>
  </ul>
</template>`,
    buggyLines: [3],
    fixedCode: `<template>
  <ul>
    <li v-for="user in users" :key="user.id">{{ user.name }}</li>
  </ul>
</template>`,
    explanation: 'Without a key, Vue reuses elements by position, which causes wrong state and animations when the list is reordered or filtered. Use a stable unique id, not the array index.',
    docsUrl: `${vue}/guide/essentials/list.html#maintaining-state-with-key`,
  },
  {
    ...base, topic: 'foundations', id: 'vue3/foundations/v-bind-v-on', type: 'mcq', tags: ['directives'],
    primer: {
      en: 'Two shortcuts you will type constantly: `:` binds an attribute to a variable, `@` listens for an event.',
      id: 'Dua singkatan yang akan sering kamu ketik: `:` mengikat atribut ke sebuah variabel, `@` mendengarkan sebuah event.',
    },
    question: 'What do `:disabled="isLoading"` and `@click="save"` mean?',
    options: [
      'Bind disabled to the isLoading variable; call save when the element is clicked',
      'Set disabled to the text "isLoading"; run save immediately on page load',
      'Both declare new variables',
      'Both are CSS selectors',
    ],
    answerIndex: 0,
    explanation: ':x is shorthand for v-bind:x and @x is shorthand for v-on:x. Without the colon, disabled="isLoading" would be the literal string.',
    docsUrl: `${vue}/guide/essentials/template-syntax.html#directives`,
  },
  {
    ...base, topic: 'foundations', id: 'vue3/foundations/ref-basics', type: 'mcq', tags: ['ref', 'reactivity'],
    primer: {
      en: 'A normal variable change is invisible to Vue. A `ref` is a special box: when you change what is inside, Vue notices and refreshes the screen.',
      id: 'Perubahan pada variabel biasa tidak terlihat oleh Vue. `ref` adalah kotak khusus: saat isinya diubah, Vue menyadarinya dan menyegarkan tampilan.',
    },
    question: 'How do you read and change a ref named `count` in the <script> part?',
    options: ['count.value and count.value++', 'count and count++', 'count() and count(1)', '$count and $count++'],
    answerIndex: 0,
    explanation: 'In script you use .value. In the template Vue unwraps it for you, so you write {{ count }} without .value.',
    docsUrl: `${vue}/guide/essentials/reactivity-fundamentals.html#ref`,
  },
  {
    ...base, topic: 'foundations', id: 'vue3/foundations/forgot-value', type: 'bugspot', tags: ['ref', 'bug'],
    primer: {
      en: 'The most common beginner mistake with `ref`: forgetting `.value` in script. The ref is the box, `.value` is what is inside it.',
      id: 'Kesalahan paling umum pemula pada `ref`: lupa `.value` di script. `ref` adalah kotaknya, `.value` adalah isinya.',
    },
    language: 'ts',
    code: `import { ref } from 'vue';

const count = ref(0);

function increment() {
  count++;
}`,
    buggyLines: [6],
    fixedCode: `import { ref } from 'vue';

const count = ref(0);

function increment() {
  count.value++;
}`,
    explanation: 'count is the ref object, not the number, so count++ throws (assignment to a const) and never changes the value. Use count.value++.',
    docsUrl: `${vue}/guide/essentials/reactivity-fundamentals.html#ref`,
  },
  {
    ...base, topic: 'foundations', id: 'vue3/foundations/props-basics', type: 'flashcard', tags: ['props'],
    primer: {
      en: 'A component is like a function: you give it inputs. Those inputs are called props, and the parent passes them in as attributes.',
      id: 'Komponen mirip fungsi: kamu memberinya input. Input itu disebut props, dan parent mengirimkannya sebagai atribut.',
    },
    front: 'What are props and how do you declare them?',
    back: 'Props are the inputs a parent passes to a child component. In <script setup> declare them with defineProps, for example defineProps<{ title: string }>(), then use title in the template.',
    explanation: 'Props flow one way, from parent to child, and the child must not change them.',
    docsUrl: `${vue}/guide/components/props.html`,
  },
  {
    ...base, topic: 'foundations', id: 'vue3/foundations/emit-basics', type: 'flashcard', tags: ['emits'],
    primer: {
      en: 'Props carry data down. When a child needs to tell its parent something happened (a button was clicked), it sends an event up.',
      id: 'Props membawa data ke bawah. Ketika child perlu memberi tahu parent bahwa sesuatu terjadi (tombol diklik), ia mengirim event ke atas.',
    },
    front: 'How does a child component tell its parent that something happened?',
    back: 'It emits an event: declare it with defineEmits (const emit = defineEmits<{ save: [] }>()), call emit("save"), and the parent listens with @save="handler".',
    explanation: 'Props down, events up is the basic data flow in Vue.',
    docsUrl: `${vue}/guide/components/events.html`,
  },
];
