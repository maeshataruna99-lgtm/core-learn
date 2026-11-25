<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { FocusCard } from '../core/focus.ts';
import { useT } from '../i18n/index.ts';
import AppIcon from './AppIcon.vue';
import FormattedText from './FormattedText.vue';

const props = defineProps<{ cards: FocusCard[]; lang: 'en' | 'id' }>();
defineEmits<{ exit: [] }>();
const t = useT();

const SWIPE_PX = 90;
const deck = ref<FocusCard[]>([...props.cards]);
const at = ref(0);
const flipped = ref(false);
const weak = ref<FocusCard[]>([]);
const dx = ref(0);
const leaving = ref<0 | 1 | -1>(0);
let startX: number | null = null;
let leaveTimer: number | undefined;
const dragging = ref(false);
const card = computed(() => deck.value[at.value]);
const progressFraction = computed(() => (deck.value.length ? at.value / deck.value.length : 0));

function start(cards: FocusCard[]) {
  clearTimeout(leaveTimer);
  deck.value = [...cards];
  at.value = 0;
  flipped.value = false;
  weak.value = [];
  leaving.value = 0;
  dx.value = 0;
}
watch(() => props.cards, (next) => start(next));
onBeforeUnmount(() => clearTimeout(leaveTimer));
const shuffled = (cards: FocusCard[]) => cards.map((c) => [Math.random(), c] as const).sort((a, b) => a[0] - b[0]).map(([, c]) => c);

function decide(ok: boolean) {
  if (!card.value || leaving.value) return;
  if (!ok) weak.value.push(card.value);
  leaving.value = ok ? 1 : -1;
  leaveTimer = window.setTimeout(() => {
    at.value++;
    flipped.value = false;
    leaving.value = 0;
    dx.value = 0;
  }, 180);
}

function down(e: PointerEvent) {
  startX = e.clientX;
  dragging.value = true;
  try {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  } catch {
    /* ignore synthetic pointer events */
  }
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
  <section class="mx-auto max-w-2xl space-y-5" aria-labelledby="deck-title">
    <div class="flex items-center justify-between gap-2">
      <h1 id="deck-title" class="text-2xl font-bold text-slate-900 dark:text-slate-50">{{ t('focus.deck') }}</h1>
      <button
        type="button"
        class="rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        @click="$emit('exit')"
      >
        {{ t('focus.simExit') }}
      </button>
    </div>

    <template v-if="card">
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t('focus.deckProgress', { n: at + 1, total: deck.length }) }} · {{ card.topic[lang] }}
        </p>
        <div class="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" aria-hidden="true">
          <div class="h-full origin-left rounded-full bg-indigo-600 transition-transform duration-300" :style="{ transform: `scaleX(${progressFraction})` }" />
        </div>
      </div>

      <div class="relative overflow-x-clip">
        <div
          role="button"
          tabindex="0"
          :aria-label="t('focus.deckFlip')"
          :aria-pressed="flipped"
          class="flex min-h-80 cursor-grab touch-pan-y select-none flex-col rounded-2xl border-2 p-6 shadow-sm transition-colors"
          :class="[
            flipped
              ? 'border-indigo-400 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/60'
              : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
            dx > 30 ? 'ring-4 ring-emerald-500/70' : dx < -30 ? 'ring-4 ring-rose-500/70' : '',
          ]"
          :style="style"
          @pointerdown="down"
          @pointermove="move"
          @pointerup="up"
          @pointercancel="up"
          @keydown="key"
        >
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {{ flipped ? t('focus.deckBack') : card.kind === 'concept' ? t('focus.deckConcept') : t('focus.deckQuestion') }}
          </span>
          <p v-if="!flipped" class="my-auto py-6 text-center text-xl font-bold leading-snug text-slate-900 dark:text-slate-50">
            {{ card.kind === 'concept' ? t('focus.deckExplain', { topic: card.front[lang] }) : card.front[lang] }}
          </p>
          <div v-else class="mt-3 max-h-96 overflow-y-auto text-slate-800 dark:text-slate-100">
            <FormattedText :text="card.back[lang]" />
          </div>
          <span class="mt-auto pt-3 text-center text-xs text-slate-500 dark:text-slate-400">{{ t('focus.deckHint') }}</span>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200"
          @click="decide(false)"
        >
          <AppIcon name="chevron-left" :size="16" />
          <span class="truncate">{{ t('focus.simWeak') }}</span>
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          @click="flipped = !flipped"
        >
          <AppIcon name="rotate-ccw" :size="15" />
          <span>{{ t('focus.deckFlipShort') }}</span>
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 font-semibold text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
          @click="decide(true)"
        >
          <span class="truncate">{{ t('focus.deckOk') }}</span>
          <AppIcon name="chevron-right" :size="16" />
        </button>
      </div>
    </template>

    <template v-else>
      <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <p class="text-lg font-bold text-slate-900 dark:text-slate-50" role="status">
          {{ t('focus.simScore', { ok: deck.length - weak.length, total: deck.length }) }}
        </p>
        <div v-if="weak.length" class="space-y-3">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('focus.simReview') }}</h2>
          <div v-for="(c, i) in weak" :key="i" class="space-y-2 rounded-xl border border-rose-200 bg-rose-50/40 p-4 dark:border-rose-900/60 dark:bg-rose-950/20">
            <p class="font-semibold text-slate-900 dark:text-slate-100">
              {{ c.kind === 'concept' ? t('focus.deckExplain', { topic: c.front[lang] }) : c.front[lang] }}
            </p>
            <FormattedText :text="c.back[lang]" />
          </div>
          <button
            type="button"
            class="w-full rounded-xl bg-indigo-700 px-4 py-3 font-semibold text-white hover:bg-indigo-800 dark:bg-indigo-600"
            @click="start([...weak])"
          >
            {{ t('focus.simRetryWeak') }}
          </button>
        </div>
        <button
          type="button"
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          @click="start(shuffled(cards))"
        >
          <AppIcon name="shuffle" :size="16" />
          <span>{{ t('focus.deckShuffle') }}</span>
        </button>
      </div>
    </template>
  </section>
</template>
