<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useStore } from '../composables/useStore.ts';
import type { Card } from '../core/types.ts';
import { useT } from '../i18n/index.ts';
import CardView from './CardView.vue';

const props = defineProps<{ cards: Card[]; timed?: boolean }>();
const emit = defineEmits<{ finish: [score: { right: number; total: number }] }>();

const t = useT();
const { answer } = useStore();
const index = ref(0);
const right = ref(0);
const done = ref(false);
const seconds = ref(0);
const timer = props.timed ? window.setInterval(() => seconds.value++, 1000) : undefined;
onBeforeUnmount(() => clearInterval(timer));

const current = computed(() => props.cards[index.value]);

function next(correct: boolean) {
  const card = current.value;
  if (!card) return;
  answer(card, correct);
  if (correct) right.value++;
  if (index.value + 1 >= props.cards.length) {
    done.value = true;
    clearInterval(timer);
    emit('finish', { right: right.value, total: props.cards.length });
  } else index.value++;
}
const clock = computed(() => `${Math.floor(seconds.value / 60)}:${String(seconds.value % 60).padStart(2, '0')}`);
</script>

<template>
  <div v-if="cards.length === 0" class="rounded-lg border p-4">{{ t('quiz.empty') }}</div>
  <section v-else-if="done" class="space-y-3" aria-live="polite">
    <h2 class="text-2xl font-bold">{{ t('quiz.done') }}</h2>
    <p>
      {{ t('quiz.score', { right, total: cards.length }) }}<template v-if="timed"> {{ t('quiz.in', { time: clock }) }}</template>.
    </p>
    <slot name="done" />
  </section>
  <div v-else class="space-y-3">
    <div class="flex justify-between text-sm text-slate-600 dark:text-slate-300">
      <span>{{ t('quiz.cardOf', { i: index + 1, n: cards.length }) }}</span>
      <span v-if="timed" :aria-label="t('quiz.elapsed')">⏱ {{ clock }}</span>
    </div>
    <CardView v-if="current" :key="current.id" :card="current" @next="next" />
  </div>
</template>
