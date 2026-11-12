<script setup lang="ts">
import { computed, ref } from 'vue';
import type { FocusCard } from '../core/focus.ts';
import { useT } from '../i18n/index.ts';

const props = defineProps<{ cards: FocusCard[]; lang: 'en' | 'id' }>();
defineEmits<{ exit: [] }>();
const t = useT();

// shortcut: a deck run lives in memory only, like the interview simulation.
const SWIPE_PX = 90;
const deck = ref<FocusCard[]>([...props.cards]);
const at = ref(0);
const flipped = ref(false);
const weak = ref<FocusCard[]>([]);
const dx = ref(0);
const leaving = ref<0 | 1 | -1>(0);
let startX: number | null = null;
const dragging = ref(false);
const card = computed(() => deck.value[at.value]);

function start(cards: FocusCard[]) {
  deck.value = cards;
  at.value = 0;
  flipped.value = false;
  weak.value = [];
}
const shuffled = (cards: FocusCard[]) => cards.map((c) => [Math.random(), c] as const).sort((a, b) => a[0] - b[0]).map(([, c]) => c);

function decide(ok: boolean) {
  if (!card.value || leaving.value) return;
  if (!ok) weak.value.push(card.value);
  leaving.value = ok ? 1 : -1;
  setTimeout(() => {
    at.value++;
    flipped.value = false;
    leaving.value = 0;
    dx.value = 0;
  }, 180);
}

function down(e: PointerEvent) {
  startX = e.clientX;
  dragging.value = true;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
}
function move(e: PointerEvent) {
  if (startX !== null) dx.value = e.clientX - startX;
}
function up() {
  if (startX === null) return;
  startX = null;
  dragging.value = false;
  if (Math.abs(dx.value) >= SWIPE_PX) return decide(dx.value > 0);
  if (Math.abs(dx.value) < 6) flipped.value = !flipped.value;
  dx.value = 0;
}
function key(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') decide(true);
  else if (e.key === 'ArrowLeft') decide(false);
  else if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    flipped.value = !flipped.value;
  }
}

const offset = computed(() => (leaving.value ? leaving.value * 480 : dx.value));
const style = computed(() => ({
  transform: `translateX(${offset.value}px) rotate(${offset.value / 25}deg)`,
  transition: !dragging.value ? 'transform 180ms ease-out' : 'none',
}));
</script>

<template>
  <section class="space-y-4" aria-labelledby="deck-title">
    <div class="flex items-center gap-2">
      <h1 id="deck-title" class="flex-1 text-2xl font-bold">{{ t('focus.deck') }}</h1>
      <button class="rounded border border-slate-400 px-4" @click="$emit('exit')">{{ t('focus.simExit') }}</button>
    </div>

    <template v-if="card">
      <p class="text-sm text-slate-600 dark:text-slate-300">
        {{ t('focus.deckProgress', { n: at + 1, total: deck.length }) }} · {{ card.topic[lang] }}
      </p>
      <div class="relative overflow-x-clip">
        <div
          role="button"
          tabindex="0"
          :aria-label="t('focus.deckFlip')"
          :aria-pressed="flipped"
          class="flex min-h-80 cursor-grab touch-pan-y select-none flex-col rounded-xl border-2 p-4 shadow-sm"
          :class="[
            flipped ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950' : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800',
            dx > 30 ? 'ring-4 ring-emerald-500' : dx < -30 ? 'ring-4 ring-rose-500' : '',
          ]"
          :style="style"
          @pointerdown="down"
          @pointermove="move"
          @pointerup="up"
          @pointercancel="up"
          @keydown="key"
        >
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {{ flipped ? t('focus.deckBack') : card.kind === 'concept' ? t('focus.deckConcept') : t('focus.deckQuestion') }}
          </span>
          <p v-if="!flipped" class="my-auto py-6 text-center text-xl font-semibold">
            {{ card.kind === 'concept' ? t('focus.deckExplain', { topic: card.front[lang] }) : card.front[lang] }}
          </p>
          <p v-else class="mt-2 max-h-96 overflow-y-auto whitespace-pre-line">{{ card.back[lang] }}</p>
          <span class="mt-auto pt-2 text-center text-xs text-slate-500 dark:text-slate-400">{{ t('focus.deckHint') }}</span>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="flex-1 rounded border-2 border-rose-600 px-2 font-semibold text-rose-800 dark:text-rose-200" @click="decide(false)">← {{ t('focus.simWeak') }}</button>
        <button class="rounded border border-slate-400 px-3" @click="flipped = !flipped">{{ t('focus.deckFlipShort') }}</button>
        <button class="flex-1 rounded border-2 border-emerald-700 px-2 font-semibold text-emerald-900 dark:text-emerald-200" @click="decide(true)">{{ t('focus.deckOk') }} →</button>
      </div>
    </template>

    <template v-else>
      <p class="text-lg font-semibold" role="status">{{ t('focus.simScore', { ok: deck.length - weak.length, total: deck.length }) }}</p>
      <div v-if="weak.length" class="space-y-2">
        <h2 class="font-semibold">{{ t('focus.simReview') }}</h2>
        <div v-for="(c, i) in weak" :key="i" class="space-y-2 rounded-lg border border-slate-300 p-3 dark:border-slate-600">
          <p class="font-semibold">{{ c.kind === 'concept' ? t('focus.deckExplain', { topic: c.front[lang] }) : c.front[lang] }}</p>
          <p class="whitespace-pre-line rounded bg-slate-100 p-3 dark:bg-slate-800">{{ c.back[lang] }}</p>
        </div>
        <button class="w-full rounded bg-indigo-700 px-4 font-semibold text-white" @click="start([...weak])">{{ t('focus.simRetryWeak') }}</button>
      </div>
      <button class="w-full rounded border border-slate-400 px-4" @click="start(shuffled(cards))">{{ t('focus.deckShuffle') }}</button>
    </template>
  </section>
</template>
