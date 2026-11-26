<script setup lang="ts">
import { computed } from 'vue';
import AppIcon from '../components/AppIcon.vue';
import type { IconName } from '../components/AppIcon.vue';
import { wikiEntries } from '../content/wiki/index.ts';
import { useStore } from '../composables/useStore.ts';
import { trackSummaries } from '../core/curriculum.ts';
import { useT } from '../i18n/index.ts';

const t = useT();
const { store, dueCount, streak, cards, nowIso } = useStore();

const masteredCount = computed(() => cards.filter((c) => (store.progress[c.id]?.box ?? 0) >= 4).length);
const wikiDoneCount = computed(() => wikiEntries.filter((e) => store.understood[e.id]).length);
const summaries = computed(() => trackSummaries(cards, store.progress, nowIso.value));

const tiles: {
  to: { name: string; query?: Record<string, string> };
  title: 'home.learn' | 'home.revise' | 'home.interview' | 'home.mgs';
  text: 'home.learnText' | 'home.reviseText' | 'home.interviewText' | 'home.mgsText';
  icon: IconName;
}[] = [
  { to: { name: 'focus', query: { project: 'mgs-live-coding' } }, title: 'home.mgs', text: 'home.mgsText', icon: 'terminal' },
  { to: { name: 'learn' }, title: 'home.learn', text: 'home.learnText', icon: 'book-open' },
  { to: { name: 'practice', query: { mode: 'revise' } }, title: 'home.revise', text: 'home.reviseText', icon: 'rotate-ccw' },
  { to: { name: 'practice', query: { mode: 'interview' } }, title: 'home.interview', text: 'home.interviewText', icon: 'clock' },
];
</script>

<template>
  <div class="space-y-8">
    <!-- Hero Banner -->
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-7 dark:border-slate-800 dark:bg-slate-900">
      <div class="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div class="space-y-2">
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
            Core Learn
          </h1>
          <p class="max-w-[58ch] text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
            {{ t('home.heroSub') }}
          </p>
        </div>
        <RouterLink
          :to="{ name: 'practice', query: { mode: 'revise' } }"
          class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-3 font-semibold text-white shadow-xs transition-colors hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
        >
          <AppIcon name="play" :size="17" />
          <span>{{ t('home.continue') }}</span>
        </RouterLink>
      </div>

      <!-- 4 Telemetry KPIs -->
      <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
          <div class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <AppIcon name="sparkles" :size="15" class="text-indigo-600 dark:text-indigo-400" />
            <span>{{ t('home.due', { n: cards.length }) }}</span>
          </div>
          <p class="mt-1.5 font-mono text-2xl font-bold text-slate-900 dark:text-slate-50">{{ dueCount }}</p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
          <div class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <AppIcon name="flame" :size="15" class="text-amber-600 dark:text-amber-400" />
            <span>{{ t('home.streak') }}</span>
          </div>
          <p class="mt-1.5 font-mono text-2xl font-bold text-slate-900 dark:text-slate-50">{{ streak }}</p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
          <div class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <AppIcon name="check" :size="15" class="text-emerald-600 dark:text-emerald-400" />
            <span>{{ t('home.mastered') }}</span>
          </div>
          <p class="mt-1.5 font-mono text-2xl font-bold text-slate-900 dark:text-slate-50">{{ masteredCount }}</p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
          <div class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <AppIcon name="library" :size="15" class="text-sky-600 dark:text-sky-400" />
            <span>{{ t('home.wikiDone') }}</span>
          </div>
          <p class="mt-1.5 font-mono text-2xl font-bold text-slate-900 dark:text-slate-50">{{ wikiDoneCount }}/{{ wikiEntries.length }}</p>
        </div>
      </div>
    </section>

    <!-- Study Modes -->
    <section class="space-y-3" aria-labelledby="home-modes">
      <h2 id="home-modes" class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {{ t('home.quickLaunch') }}
      </h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <RouterLink
          v-for="tile in tiles"
          :key="tile.title"
          :to="tile.to"
          class="group flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500"
        >
          <div class="flex items-center justify-between">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition-colors group-hover:bg-indigo-700 group-hover:text-white dark:bg-indigo-950/70 dark:text-indigo-300 dark:group-hover:bg-indigo-600">
              <AppIcon :name="tile.icon" :size="20" />
            </span>
            <AppIcon name="chevron-right" :size="17" class="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
          </div>
          <div>
            <span class="block text-base font-bold text-slate-900 dark:text-slate-50">{{ t(tile.title) }}</span>
            <span class="mt-1 block text-sm text-slate-600 dark:text-slate-300">{{ t(tile.text) }}</span>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- Curriculum Tracks Quick Jump -->
    <section class="space-y-3" aria-labelledby="home-tracks">
      <div class="flex items-center justify-between">
        <h2 id="home-tracks" class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t('home.tracksTitle') }}
        </h2>
        <RouterLink to="/learn" class="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300">
          <span>{{ t('learn.allTracks') }}</span>
          <AppIcon name="chevron-right" :size="15" />
        </RouterLink>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <RouterLink
          v-for="tr in summaries"
          :key="tr.track"
          :to="{ path: '/learn', query: { track: tr.track } }"
          class="group flex flex-col justify-between gap-2.5 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-400 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500"
        >
          <div>
            <p class="font-semibold text-slate-900 group-hover:text-indigo-700 dark:text-slate-50 dark:group-hover:text-indigo-300">
              {{ t(`track.${tr.track}`) }}
            </p>
            <p class="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
              {{ t('learn.topicsCount', { n: tr.topics.length }) }} · {{ t('learn.cards', { n: tr.total }) }}
            </p>
          </div>
          <div class="space-y-1">
            <div class="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <span>{{ t('learn.dueCount', { n: tr.due }) }}</span>
              <span>{{ tr.masteryPct }}%</span>
            </div>
            <div class="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
              <div class="h-full rounded-full bg-indigo-600 dark:bg-indigo-400" :style="{ width: `${tr.masteryPct}%` }" />
            </div>
          </div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
