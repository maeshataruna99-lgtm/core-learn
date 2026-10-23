<script setup lang="ts">
import { computed, ref } from 'vue';
import { isCorrect } from '../core/answers.ts';
import type { Card } from '../core/types.ts';
import { useHighlightedLines } from '../composables/useHighlight.ts';
import { useStore } from '../composables/useStore.ts';
import { useT } from '../i18n/index.ts';
import CodeBlock from './CodeBlock.vue';

const props = defineProps<{ card: Card }>();
const emit = defineEmits<{ next: [correct: boolean] }>();
const t = useT();
const { store } = useStore();
const primerText = computed(() => props.card.primer?.[store.settings.language] ?? '');

const flipped = ref(false);
const chosen = ref<number | null>(null);
const verdict = ref<boolean | null>(null);

const code = computed(() => (props.card.type === 'bugspot' ? props.card.code : ''));
const language = computed(() => (props.card.type === 'bugspot' ? props.card.language : ''));
const plainLines = computed(() => code.value.split('\n'));
const tokenLines = useHighlightedLines(() => code.value, () => language.value);
const answered = computed(() => verdict.value !== null);

function pick(response: number | boolean) {
  if (answered.value) return;
  if (typeof response === 'number') chosen.value = response;
  verdict.value = isCorrect(props.card, response);
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
    <p class="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">
      {{ card.track }} · {{ card.topic }} · {{ card.level }}
    </p>

    <!-- beginner primer: open by default so a newcomer reads it before answering -->
    <details v-if="primerText" open class="rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950">
      <summary class="cursor-pointer font-semibold">{{ t('card.primer') }}</summary>
      <p class="mt-2 whitespace-pre-line">{{ primerText }}</p>
    </details>

    <!-- flashcard -->
    <template v-if="card.type === 'flashcard'">
      <button
        class="w-full rounded-lg border border-slate-300 bg-white p-6 text-left dark:border-slate-600 dark:bg-slate-800"
        :aria-expanded="flipped"
        @click="flipped = true"
      >
        <span class="block text-lg font-semibold">{{ card.front }}</span>
        <span v-if="flipped" class="mt-3 block">{{ card.back }}</span>
        <span v-else class="mt-3 block text-sm text-slate-600 dark:text-slate-300">{{ t('card.reveal') }}</span>
      </button>
      <div v-if="flipped && !answered" class="flex gap-2">
        <button class="flex-1 rounded bg-emerald-700 px-4 text-white" @click="pick(true)">{{ t('card.knew') }}</button>
        <button class="flex-1 rounded bg-slate-700 px-4 text-white" @click="pick(false)">{{ t('card.didnt') }}</button>
      </div>
    </template>

    <!-- mcq / output -->
    <template v-else-if="card.type === 'mcq' || card.type === 'output'">
      <p v-if="card.type === 'mcq'" class="whitespace-pre-line text-lg font-semibold">{{ card.question }}</p>
      <template v-else>
        <p class="text-lg font-semibold">{{ t('card.printQ') }}</p>
        <CodeBlock :code="card.code" :language="card.language" />
      </template>
      <ul class="space-y-2">
        <li v-for="(opt, i) in card.options" :key="i">
          <button
            class="flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-left dark:border-slate-600 dark:bg-slate-800"
            :class="optionState(i)"
            :disabled="answered"
            @click="pick(i)"
          >
            <span aria-hidden="true" class="font-mono text-slate-600 dark:text-slate-300">{{ 'ABCD'[i] }}</span>
            <span>{{ opt }}</span>
            <span v-if="answered && i === card.answerIndex" class="ml-auto font-semibold">{{ t('card.correctAnswer') }}</span>
            <span v-else-if="answered && i === chosen" class="ml-auto font-semibold">{{ t('card.yourAnswer') }}</span>
          </button>
        </li>
      </ul>
    </template>

    <!-- bugspot -->
    <template v-else>
      <p class="text-lg font-semibold">{{ t('card.tapBug') }}</p>
      <ol class="code overflow-x-auto rounded-lg py-2 text-sm">
        <li v-for="(line, i) in plainLines" :key="i">
          <button
            class="flex w-full min-w-max items-center gap-3 px-3 text-left font-mono hover:bg-slate-500/20"
            :class="answered && card.buggyLines.includes(i + 1) ? 'bg-emerald-500/30' : answered && chosen === i + 1 ? 'bg-rose-500/30' : ''"
            :disabled="answered"
            :aria-label="`${i + 1}: ${line.trim() || '(blank)'}`"
            @click="pick(i + 1)"
          >
            <span aria-hidden="true" class="w-6 select-none text-right opacity-60">{{ i + 1 }}</span>
            <span class="whitespace-pre">
              <template v-if="tokenLines?.[i]?.length">
                <span v-for="(tok, j) in tokenLines[i]" :key="j" class="tok" :style="tok.style">{{ tok.content }}</span>
              </template>
              <template v-else>{{ line || ' ' }}</template>
            </span>
            <span v-if="answered && card.buggyLines.includes(i + 1)" class="ml-auto pl-4">{{ t('card.bug') }}</span>
          </button>
        </li>
      </ol>
    </template>

    <!-- feedback -->
    <section v-if="answered" class="space-y-2 rounded-lg border border-slate-300 p-4 dark:border-slate-600" aria-live="polite">
      <p class="font-semibold">{{ verdict ? t('card.correct') : t('card.wrong') }}</p>
      <p>{{ card.explanation }}</p>
      <p v-if="card.source" class="text-sm text-slate-600 dark:text-slate-300">
        {{ t('card.inspired') }} {{ card.source.repo }}<template v-if="card.source.path"> — {{ card.source.path }}</template>
      </p>
      <a v-if="card.docsUrl" :href="card.docsUrl" target="_blank" rel="noopener" class="inline-flex items-center text-indigo-700 underline dark:text-indigo-300">
        {{ t('card.docs') }}
      </a>
      <button class="mt-2 block w-full rounded bg-indigo-700 px-4 text-white" @click="emit('next', verdict === true)">{{ t('card.next') }}</button>
    </section>
  </article>
</template>
