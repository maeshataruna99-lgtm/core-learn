<script setup lang="ts">
import { computed, ref } from 'vue';
import AppIcon from '../components/AppIcon.vue';
import { useStore } from '../composables/useStore.ts';
import { boxDistribution, cardTitle, formatTopicLabel, overallMasteryPct, trackSummaries } from '../core/curriculum.ts';
import { exportStore, parseImport } from '../core/exportImport.ts';
import { pruneUnknown } from '../core/storage.ts';
import type { Store } from '../core/types.ts';
import { useT } from '../i18n/index.ts';

const t = useT();
const { cards, cardIds, store, nowIso, replace, reset } = useStore();
const message = ref('');
const messageKind = ref<'ok' | 'error'>('ok');
const pending = ref<{ store: Store; cardCount: number } | null>(null);

const summaries = computed(() => trackSummaries(cards, store.progress, nowIso.value));
const boxes = computed(() => boxDistribution(cards, store.progress));
const totalSeen = computed(() => cards.filter((c) => Boolean(store.progress[c.id])).length);
const overallPct = computed(() => overallMasteryPct(cards, store.progress));

// Cards missed before that have not yet reached mastery (box < 4), worst first.
const weak = computed(() =>
  cards
    .filter((c) => {
      const p = store.progress[c.id];
      return Boolean(p && p.wrong > 0 && p.box < 4);
    })
    .sort((a, b) => {
      const pa = store.progress[a.id]!;
      const pb = store.progress[b.id]!;
      return pb.wrong - pa.wrong || pa.box - pb.box;
    })
    .slice(0, 10),
);

function boxBarHeight(count: number): string {
  if (count <= 0 || !cards.length) return '0%';
  return `${Math.max(6, Math.round((count / cards.length) * 100))}%`;
}

function doExport() {
  const blob = new Blob([exportStore({ ...store }, new Date().toISOString())], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `code-learn-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function onFile(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const res = parseImport(await file.text());
    if (res.ok) {
      const validCount = Object.keys(pruneUnknown(res.store.progress, cardIds)).length;
      pending.value = { store: res.store, cardCount: validCount };
      message.value = '';
    } else {
      pending.value = null;
      messageKind.value = 'error';
      message.value = t('progress.failed', { e: res.error });
    }
  } finally {
    input.value = '';
  }
}
function confirmImport() {
  if (!pending.value) return;
  replace(pending.value.store);
  pending.value = null;
  messageKind.value = 'ok';
  message.value = t('progress.imported');
}
function doReset() {
  if (!window.confirm(t('progress.resetConfirm'))) return;
  reset();
  pending.value = null;
  messageKind.value = 'ok';
  message.value = t('progress.resetDone');
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">{{ t('progress.title') }}</h1>
      <span class="rounded-full bg-indigo-50 px-3.5 py-1 font-mono text-xs font-semibold text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-200">
        {{ t('progress.cardsCount', { done: totalSeen, total: cards.length }) }}
      </span>
    </header>

    <!-- Overall Mastery & Leitner Box Distribution -->
    <div class="grid gap-4 sm:grid-cols-2">
      <section class="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
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
              class="stroke-indigo-600 transition-all duration-500 dark:stroke-indigo-400"
              :stroke-dasharray="263.9"
              :stroke-dashoffset="263.9 * (1 - overallPct / 100)"
            />
          </svg>
          <span class="absolute font-mono text-xl font-bold text-slate-900 dark:text-slate-50">{{ overallPct }}%</span>
        </div>
        <div class="space-y-1">
          <h2 class="font-bold text-slate-900 dark:text-slate-50">{{ t('progress.overall') }}</h2>
          <p class="text-sm text-slate-600 dark:text-slate-300">{{ t('progress.cardsCount', { done: totalSeen, total: cards.length }) }}</p>
        </div>
      </section>

      <section class="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('progress.boxDist') }}</h2>
        <div class="grid grid-cols-6 gap-2 text-center">
          <div v-for="b in boxes" :key="b.key" class="flex flex-col items-center gap-1.5">
            <div class="flex h-16 w-full items-end overflow-hidden rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <div
                data-testid="box-bar"
                class="w-full rounded-sm transition-all duration-300"
                :class="b.count === 0 ? 'bg-transparent' : b.key === 'unseen' ? 'bg-slate-400 dark:bg-slate-600' : b.key >= 4 ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-indigo-600 dark:bg-indigo-400'"
                :style="{ height: boxBarHeight(b.count) }"
              />
            </div>
            <span class="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{{ b.count }}</span>
            <span class="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {{ b.key === 'unseen' ? t('progress.unseenLabel') : t('progress.boxShort', { n: b.key }) }}
            </span>
          </div>
        </div>
      </section>
    </div>

    <!-- Per-Track Mastery -->
    <section class="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('progress.mastery') }}</h2>
      <ul class="space-y-3">
        <li v-for="r in summaries" :key="r.track">
          <RouterLink
            :to="{ path: '/learn', query: { track: r.track } }"
            class="group block rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <div class="flex items-center justify-between text-sm">
              <span class="font-semibold text-slate-900 group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-300">
                {{ t(`track.${r.track}`) }}
              </span>
              <span class="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                {{ r.seen }}/{{ r.total }} · {{ r.masteryPct }}%
              </span>
            </div>
            <div
              class="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
              role="progressbar"
              :aria-valuenow="r.masteryPct"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="r.track"
            >
              <div class="h-full rounded-full bg-indigo-600 transition-all duration-300 dark:bg-indigo-400" :style="{ width: `${r.masteryPct}%` }" />
            </div>
          </RouterLink>
        </li>
      </ul>
    </section>

    <!-- Weak Cards -->
    <section class="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('progress.weak') }}</h2>
      <p v-if="!weak.length" class="text-sm text-slate-600 dark:text-slate-300">{{ t('progress.none') }}</p>
      <ul v-else class="grid gap-2 sm:grid-cols-2">
        <li v-for="c in weak" :key="c.id">
          <RouterLink
            data-testid="weak-card-link"
            :to="{ path: '/learn', query: { track: c.track, topic: c.topic } }"
            class="group flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm transition-colors hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30"
          >
            <div class="min-w-0">
              <p class="truncate font-medium text-slate-900 group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-300">
                {{ cardTitle(c) }}
              </p>
              <p class="truncate text-xs text-slate-500 dark:text-slate-400">
                {{ t(`track.${c.track}`) }} · {{ formatTopicLabel(c.topic) }}
              </p>
            </div>
            <span class="shrink-0 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950/70 dark:text-rose-200">
              {{ t('progress.wrong', { n: store.progress[c.id]!.wrong }) }}
            </span>
          </RouterLink>
        </li>
      </ul>
    </section>

    <!-- Backup & Reset -->
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('progress.backup') }}</h2>
      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          @click="doExport"
        >
          {{ t('progress.export') }}
        </button>
        <label class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
          <span>{{ t('progress.import') }}</span>
          <input type="file" accept="application/json" class="sr-only" @change="onFile" />
        </label>
        <button
          type="button"
          class="ml-auto inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 font-semibold text-rose-800 transition-colors hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200 dark:hover:bg-rose-900/60"
          @click="doReset"
        >
          <AppIcon name="rotate-ccw" :size="15" />
          <span>{{ t('progress.reset') }}</span>
        </button>
      </div>

      <div v-if="pending" class="flex flex-wrap items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3.5 text-sm dark:border-indigo-800 dark:bg-indigo-950/50" role="alert">
        <span class="flex-1">{{ t('progress.confirm', { n: pending.cardCount }) }}</span>
        <button type="button" class="rounded-lg bg-indigo-700 px-3.5 font-semibold text-white" @click="confirmImport">{{ t('progress.replace') }}</button>
        <button type="button" class="rounded-lg border border-slate-300 px-3.5 dark:border-slate-700" @click="pending = null">{{ t('progress.cancel') }}</button>
      </div>
      <p
        v-if="message"
        class="text-sm font-medium"
        :class="messageKind === 'error' ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'"
        :role="messageKind === 'error' ? 'alert' : 'status'"
      >
        {{ message }}
      </p>
    </section>
  </div>
</template>
