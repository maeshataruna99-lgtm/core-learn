<script setup lang="ts">
import { computed, ref } from 'vue';
import { isCorrect } from '../core/answers.ts';
import type { Card } from '../core/types.ts';

const props = defineProps<{ card: Card }>();
const emit = defineEmits<{ next: [correct: boolean] }>();

const flipped = ref(false);
const chosen = ref<number | null>(null);
const verdict = ref<boolean | null>(null);

const codeLines = computed(() =>
  props.card.type === 'output' || props.card.type === 'bugspot' ? props.card.code.split('\n') : [],
);
const answered = computed(() => verdict.value !== null);

function pick(response: number | boolean) {
  if (answered.value) return;
  if (typeof response === 'number') chosen.value = response;
  verdict.value = isCorrect(props.card, response);
}
function know(knew: boolean) {
  pick(knew);
}
const optionState = (i: number) => {
  if (!answered.value || (props.card.type !== 'mcq' && props.card.type !== 'output')) return '';
  if (i === props.card.answerIndex) return 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950';
  if (i === chosen.value) return 'border-rose-600 bg-rose-50 dark:bg-rose-950';
  return 'opacity-60';
};
</script>

<template>
  <article class="space-y-4" :aria-label="`${card.track} ${card.type} card`">
    <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {{ card.track }} · {{ card.topic }} · {{ card.level }}
    </p>

    <!-- flashcard -->
    <template v-if="card.type === 'flashcard'">
      <button
        class="w-full rounded-lg border border-slate-300 bg-white p-6 text-left dark:border-slate-600 dark:bg-slate-800"
        :aria-expanded="flipped"
        @click="flipped = true"
      >
        <span class="block text-lg font-semibold">{{ card.front }}</span>
        <span v-if="flipped" class="mt-3 block">{{ card.back }}</span>
        <span v-else class="mt-3 block text-sm text-slate-500">Tap to reveal</span>
      </button>
      <div v-if="flipped && !answered" class="flex gap-2">
        <button class="flex-1 rounded bg-emerald-600 px-4 text-white" @click="know(true)">Knew it</button>
        <button class="flex-1 rounded bg-slate-600 px-4 text-white" @click="know(false)">Didn't</button>
      </div>
    </template>

    <!-- mcq / output -->
    <template v-else-if="card.type === 'mcq' || card.type === 'output'">
      <p v-if="card.type === 'mcq'" class="text-lg font-semibold">{{ card.question }}</p>
      <template v-else>
        <p class="text-lg font-semibold">What does this print?</p>
        <pre class="overflow-x-auto rounded-lg bg-slate-900 p-3 text-sm text-slate-100"><code>{{ card.code }}</code></pre>
      </template>
      <ul class="space-y-2">
        <li v-for="(opt, i) in card.options" :key="i">
          <button
            class="flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-left dark:border-slate-600 dark:bg-slate-800"
            :class="optionState(i)"
            :disabled="answered"
            @click="pick(i)"
          >
            <span aria-hidden="true" class="font-mono text-slate-500">{{ 'ABCD'[i] }}</span>
            <span>{{ opt }}</span>
            <span v-if="answered && i === card.answerIndex" class="ml-auto font-semibold">✓ Correct answer</span>
            <span v-else-if="answered && i === chosen" class="ml-auto font-semibold">✗ Your answer</span>
          </button>
        </li>
      </ul>
    </template>

    <!-- bugspot -->
    <template v-else>
      <p class="text-lg font-semibold">Tap the buggy line.</p>
      <ol class="overflow-x-auto rounded-lg bg-slate-900 py-2 text-sm text-slate-100">
        <li v-for="(line, i) in codeLines" :key="i">
          <button
            class="flex w-full min-w-max items-center gap-3 px-3 text-left font-mono hover:bg-slate-700"
            :class="answered && card.buggyLines.includes(i + 1) ? 'bg-emerald-900' : answered && chosen === i + 1 ? 'bg-rose-900' : ''"
            :disabled="answered"
            @click="pick(i + 1)"
          >
            <span aria-hidden="true" class="w-6 select-none text-right text-slate-400">{{ i + 1 }}</span>
            <span class="whitespace-pre">{{ line || ' ' }}</span>
            <span v-if="answered && card.buggyLines.includes(i + 1)" class="ml-auto pl-4">← bug</span>
          </button>
        </li>
      </ol>
    </template>

    <!-- feedback -->
    <section v-if="answered" class="space-y-2 rounded-lg border border-slate-300 p-4 dark:border-slate-600" aria-live="polite">
      <p class="font-semibold">{{ verdict ? '✓ Correct' : '✗ Not quite' }}</p>
      <p>{{ card.explanation }}</p>
      <p v-if="card.source" class="text-sm text-slate-500 dark:text-slate-400">
        Inspired by {{ card.source.repo }}<template v-if="card.source.path"> — {{ card.source.path }}</template>
      </p>
      <a v-if="card.docsUrl" :href="card.docsUrl" target="_blank" rel="noopener" class="inline-flex items-center text-indigo-600 underline dark:text-indigo-300">
        Official docs
      </a>
      <button class="mt-2 block w-full rounded bg-indigo-600 px-4 text-white" @click="emit('next', verdict === true)">Next</button>
    </section>
  </article>
</template>
