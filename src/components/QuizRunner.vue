<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useStore } from '../composables/useStore.ts';
import { cardTitle } from '../core/curriculum.ts';
import type { Card } from '../core/types.ts';
import { useT } from '../i18n/index.ts';
import AppIcon from './AppIcon.vue';
import CardView from './CardView.vue';
import FormattedText from './FormattedText.vue';

const props = defineProps<{ cards: Card[]; timed?: boolean }>();
const emit = defineEmits<{
  finish: [score: { right: number; total: number }];
  step: [payload: { index: number; results: Record<string, boolean> }];
}>();

const t = useT();
const { answer } = useStore();
const queue = ref<Card[]>([...props.cards]);
const index = ref(0);
const right = ref(0);
const done = ref(false);
const seconds = ref(0);
const results = ref<Record<string, boolean>>({});
const missedCards = ref<Card[]>([]);

let timer = props.timed ? window.setInterval(() => seconds.value++, 1000) : undefined;
onBeforeUnmount(() => clearInterval(timer));

watch(
  () => props.cards,
  (nextCards) => {
    queue.value = [...nextCards];
    index.value = 0;
    right.value = 0;
    done.value = false;
    seconds.value = 0;
    results.value = {};
    missedCards.value = [];
  },
);

const current = computed(() => queue.value[index.value]);
const answeredCount = computed(() => Object.keys(results.value).length);
const accuracyPct = computed(() => (answeredCount.value ? Math.round((right.value / answeredCount.value) * 100) : 100));
const progressFraction = computed(() => {
  if (!queue.value.length) return 0;
  return done.value ? 1 : (index.value + (results.value[current.value?.id ?? ''] !== undefined ? 1 : 0)) / queue.value.length;
});
const finalPct = computed(() => (queue.value.length ? Math.round((right.value / queue.value.length) * 100) : 0));

function next(correct: boolean) {
  const card = current.value;
  if (!card) return;
  answer(card, correct);
  results.value = { ...results.value, [card.id]: correct };
  if (correct) right.value++;
  else missedCards.value.push(card);

  if (index.value + 1 >= queue.value.length) {
    done.value = true;
    clearInterval(timer);
    emit('finish', { right: right.value, total: queue.value.length });
  } else {
    index.value++;
  }
  emit('step', { index: index.value, results: results.value });
}

function retryMissed() {
  if (!missedCards.value.length) return;
  queue.value = [...missedCards.value];
  index.value = 0;
  right.value = 0;
  done.value = false;
  seconds.value = 0;
  results.value = {};
  missedCards.value = [];
  if (props.timed) {
    clearInterval(timer);
    timer = window.setInterval(() => seconds.value++, 1000);
  }
  emit('step', { index: 0, results: {} });
}

const clock = computed(() => `${Math.floor(seconds.value / 60)}:${String(seconds.value % 60).padStart(2, '0')}`);
</script>

<template>
  <div v-if="queue.length === 0" class="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
    <p class="text-slate-600 dark:text-slate-300">{{ t('quiz.empty') }}</p>
  </div>

  <!-- Completion Summary -->
  <section
    v-else-if="done"
    class="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
    aria-live="polite"
  >
    <div class="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
      <div class="relative flex h-24 w-24 shrink-0 items-center justify-center">
        <svg viewBox="0 0 100 100" class="h-24 w-24 -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r="42" stroke-width="8" fill="none" class="stroke-slate-200 dark:stroke-slate-800" />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke-width="8"
            fill="none"
            stroke-linecap="round"
            class="transition-all duration-500"
            :class="finalPct >= 80 ? 'stroke-emerald-600 dark:stroke-emerald-400' : 'stroke-indigo-600 dark:stroke-indigo-400'"
            :stroke-dasharray="263.9"
            :stroke-dashoffset="263.9 * (1 - finalPct / 100)"
          />
        </svg>
        <span class="absolute font-mono text-xl font-bold text-slate-900 dark:text-slate-50">{{ finalPct }}%</span>
      </div>

      <div class="space-y-1">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">{{ t('quiz.done') }}</h2>
        <p class="text-slate-700 dark:text-slate-300">
          {{ t('quiz.score', { right, total: queue.length }) }}<template v-if="timed"> · {{ t('quiz.in', { time: clock }) }}</template>
        </p>
        <p v-if="!missedCards.length" class="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
          <AppIcon name="sparkles" :size="16" />
          {{ t('quiz.allPerfect') }}
        </p>
      </div>
    </div>

    <!-- Missed Cards Review -->
    <div v-if="missedCards.length" class="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
      <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
        {{ t('quiz.missedTitle', { n: missedCards.length }) }}
      </h3>
      <ul class="space-y-2.5">
        <li
          v-for="c in missedCards"
          :key="c.id"
          class="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 dark:border-rose-900/60 dark:bg-rose-950/20"
        >
          <p class="font-medium text-slate-900 dark:text-slate-100">{{ cardTitle(c) }}</p>
          <div class="mt-2 text-sm text-slate-700 dark:text-slate-300">
            <FormattedText :text="c.explanation" />
          </div>
        </li>
      </ul>
      <button
        type="button"
        class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
        @click="retryMissed"
      >
        <AppIcon name="rotate-ccw" :size="17" />
        {{ t('quiz.retryMissed') }}
      </button>
    </div>

    <div class="flex flex-wrap gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
      <slot name="done" />
    </div>
  </section>

  <!-- Active Quiz Session -->
  <div v-else class="space-y-4">
    <div class="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span class="font-semibold text-slate-900 dark:text-slate-100">
          {{ t('quiz.cardOf', { i: index + 1, n: queue.length }) }}
        </span>
        <div class="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span v-if="answeredCount > 0" class="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
            {{ t('quiz.accuracy', { pct: accuracyPct }) }}
          </span>
          <span
            v-if="timed"
            :aria-label="t('quiz.elapsed')"
            class="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 font-mono text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200"
          >
            <AppIcon name="clock" :size="13" />
            {{ clock }}
          </span>
        </div>
      </div>

      <!-- Smooth GPU scaleX progress bar -->
      <div class="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
        <div
          class="h-full origin-left rounded-full bg-indigo-600 transition-transform duration-300 ease-out dark:bg-indigo-400"
          :style="{ transform: `scaleX(${progressFraction})` }"
        />
      </div>

      <!-- Segmented Step Pips (up to 30 cards for compact scannability) -->
      <div v-if="queue.length <= 30" class="mt-2.5 flex gap-1" aria-hidden="true">
        <span
          v-for="(c, i) in queue"
          :key="c.id"
          class="h-1.5 flex-1 rounded-full transition-colors"
          :class="
            results[c.id] === true
              ? 'bg-emerald-500'
              : results[c.id] === false
                ? 'bg-rose-500'
                : i === index
                  ? 'bg-indigo-600 dark:bg-indigo-400'
                  : 'bg-slate-200 dark:bg-slate-800'
          "
        />
      </div>
    </div>

    <Transition name="card-slide" mode="out-in">
      <CardView v-if="current" :key="current.id" :card="current" @next="next" />
    </Transition>
  </div>
</template>
