<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppIcon from '../components/AppIcon.vue';
import type { IconName } from '../components/AppIcon.vue';
import QuizRunner from '../components/QuizRunner.vue';
import { useStore } from '../composables/useStore.ts';
import { cardTitle, formatTopicLabel, trackSummaries } from '../core/curriculum.ts';
import type { TopicSummary } from '../core/curriculum.ts';
import { learnOrder } from '../core/selection.ts';
import { LEVELS, TRACKS } from '../core/types.ts';
import type { CardType, Level, Track } from '../core/types.ts';
import { useT } from '../i18n/index.ts';

const t = useT();
const route = useRoute();
const router = useRouter();
const { cards, store, nowIso } = useStore();

const qTrack = TRACKS.find((tr) => tr === route.query.track) ?? null;
const qTopic = typeof route.query.topic === 'string' ? route.query.topic : null;
const track = ref<Track | null>(qTrack);
const topic = ref<string | null>(qTrack && qTopic && cards.some((c) => c.track === qTrack && c.topic === qTopic) ? qTopic : null);

const searchQuery = ref('');
const levelFilter = ref<Level | 'all'>('all');
const statusFilter = ref<'all' | 'due' | 'mastered'>('all');
const expandedTopics = ref<Set<string>>(new Set());
const outlineOpen = ref(true);
const mobileOutlineOpen = ref(false);
const activeStepIndex = ref(0);
const sessionResults = ref<Record<string, boolean>>({});

watch(
  () => [route.query.track, route.query.topic],
  ([nextTr, nextTp]) => {
    const matchedTr = TRACKS.find((tr) => tr === nextTr) ?? null;
    const matchedTp =
      matchedTr && typeof nextTp === 'string' && cards.some((c) => c.track === matchedTr && c.topic === nextTp)
        ? nextTp
        : null;
    const changed = matchedTr !== track.value || matchedTp !== topic.value;
    track.value = matchedTr;
    topic.value = matchedTp;
    if (changed) {
      activeStepIndex.value = 0;
      sessionResults.value = {};
      mobileOutlineOpen.value = false;
    }
  },
);

const summaries = computed(() => trackSummaries(cards, store.progress, nowIso.value));

const trackIconMap: Record<Track, IconName> = {
  'typescript-node': 'terminal',
  'nestjs-prisma': 'layers',
  vue3: 'sparkles',
  'java-spring': 'code',
  security: 'bug',
  'sql-db': 'bar-chart',
  messaging: 'compass',
  'cs-basics': 'book-open',
};

const cardTypeIcon = (ty: CardType): IconName => {
  if (ty === 'bugspot') return 'bug';
  if (ty === 'output') return 'terminal';
  if (ty === 'mcq') return 'list';
  return 'layers';
};

const activeTrackSummary = computed(() => summaries.value.find((s) => s.track === track.value) ?? null);

const filteredTracks = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return summaries.value.filter((s) => {
    const matchesLevel = levelFilter.value === 'all' || s.levels[levelFilter.value] > 0;
    const matchesStatus =
      statusFilter.value === 'all'
        ? true
        : statusFilter.value === 'due'
          ? s.due > 0
          : s.masteryPct >= 80;
    if (!matchesLevel || !matchesStatus) return false;
    if (!q) return true;
    const trackText = `${s.track} ${t(`track.${s.track}`)} ${t(`track.${s.track}.desc`)}`.toLowerCase();
    const topicHit = s.topics.some((tp) => `${tp.topic} ${formatTopicLabel(tp.topic)}`.toLowerCase().includes(q));
    return trackText.includes(q) || topicHit;
  });
});

const matchingTopicsAcrossTracks = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return [];
  const hits: TopicSummary[] = [];
  for (const s of summaries.value) {
    for (const tp of s.topics) {
      if (levelFilter.value !== 'all' && tp.levels[levelFilter.value] === 0) continue;
      if (statusFilter.value === 'due' && tp.due === 0) continue;
      if (statusFilter.value === 'mastered' && tp.masteryPct < 80) continue;
      if (`${tp.topic} ${formatTopicLabel(tp.topic)}`.toLowerCase().includes(q)) hits.push(tp);
    }
  }
  return hits.slice(0, 12);
});

const filteredTopics = computed(() => {
  if (!activeTrackSummary.value) return [];
  const q = searchQuery.value.trim().toLowerCase();
  return activeTrackSummary.value.topics.filter((tp) => {
    const matchesLevel = levelFilter.value === 'all' || tp.levels[levelFilter.value] > 0;
    const matchesStatus =
      statusFilter.value === 'all'
        ? true
        : statusFilter.value === 'due'
          ? tp.due > 0
          : tp.masteryPct >= 80;
    if (!matchesLevel || !matchesStatus) return false;
    if (!q) return true;
    return `${tp.topic} ${formatTopicLabel(tp.topic)}`.toLowerCase().includes(q);
  });
});

// Decoupled from store.progress so answering a card never produces a new array ref that resets QuizRunner.
const sessionCards = computed(() => {
  if (!track.value || !topic.value) return [];
  return learnOrder(cards.filter((c) => c.track === track.value && c.topic === topic.value));
});

const nextTopicInTrack = computed(() => {
  if (!activeTrackSummary.value || !topic.value) return null;
  const list = activeTrackSummary.value.topics;
  const idx = list.findIndex((tp) => tp.topic === topic.value);
  return idx >= 0 && idx + 1 < list.length ? list[idx + 1]! : null;
});

function selectTrack(tr: Track | null) {
  track.value = tr;
  topic.value = null;
  searchQuery.value = '';
  activeStepIndex.value = 0;
  sessionResults.value = {};
  mobileOutlineOpen.value = false;
  void router.push({ path: '/learn', query: tr ? { track: tr } : {} });
}

function selectTopic(tr: Track, tp: string) {
  track.value = tr;
  topic.value = tp;
  activeStepIndex.value = 0;
  sessionResults.value = {};
  mobileOutlineOpen.value = false;
  void router.push({ path: '/learn', query: { track: tr, topic: tp } });
}

function toggleSyllabus(tpKey: string) {
  const next = new Set(expandedTopics.value);
  if (!next.delete(tpKey)) next.add(tpKey);
  expandedTopics.value = next;
}

function clearFilters() {
  searchQuery.value = '';
  levelFilter.value = 'all';
  statusFilter.value = 'all';
}

function onQuizStep(payload: { index: number; results: Record<string, boolean> }) {
  activeStepIndex.value = payload.index;
  sessionResults.value = payload.results;
}
</script>

<template>
  <div class="space-y-6">
    <!-- Top Breadcrumb & Header -->
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div class="space-y-1">
        <nav v-if="track" aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg px-2 font-medium text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
            @click="selectTrack(null)"
          >
            {{ t('learn.allTracks') }}
          </button>
          <AppIcon name="chevron-right" :size="15" />
          <button
            v-if="topic"
            type="button"
            class="inline-flex items-center rounded-lg px-2 font-medium text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
            @click="selectTrack(track)"
          >
            {{ t(`track.${track}`) }}
          </button>
          <span v-else class="px-2 font-semibold text-slate-900 dark:text-slate-100">{{ t(`track.${track}`) }}</span>
          <template v-if="topic">
            <AppIcon name="chevron-right" :size="15" />
            <span class="px-1 font-semibold text-slate-900 dark:text-slate-100">{{ formatTopicLabel(topic) }}</span>
          </template>
        </nav>

        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
          {{ topic ? formatTopicLabel(topic) : track ? t(`track.${track}`) : t('learn.title') }}
        </h1>
        <p class="max-w-[65ch] text-sm text-slate-600 sm:text-base dark:text-slate-300">
          {{ track ? t(`track.${track}.desc`) : t('learn.subtitle') }}
        </p>
      </div>

      <div v-if="track && topic" class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-800 hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          :aria-expanded="mobileOutlineOpen"
          @click="mobileOutlineOpen = !mobileOutlineOpen"
        >
          <AppIcon name="list" :size="16" />
          <span>{{ t('learn.outline') }}</span>
        </button>
        <button
          type="button"
          class="hidden items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-800 hover:bg-slate-50 lg:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          :aria-expanded="outlineOpen"
          @click="outlineOpen = !outlineOpen"
        >
          <AppIcon name="list" :size="16" />
          <span>{{ outlineOpen ? t('learn.hideOutline') : t('learn.showOutline') }}</span>
        </button>
      </div>
    </header>

    <!-- Interactive Search & Filter Toolbar (in Track Explorer & Topic Explorer) -->
    <section
      v-if="!topic"
      class="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="relative">
        <span class="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
          <AppIcon name="search" :size="17" />
        </span>
        <input
          v-model="searchQuery"
          type="search"
          :placeholder="t('learn.searchPlaceholder')"
          :aria-label="t('learn.searchPlaceholder')"
          class="min-h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-full border px-3.5 text-xs font-semibold transition-colors"
          :class="levelFilter === 'all' ? 'border-indigo-700 bg-indigo-700 text-white dark:border-indigo-500 dark:bg-indigo-600' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'"
          :aria-pressed="levelFilter === 'all'"
          @click="levelFilter = 'all'"
        >
          {{ t('learn.allLevels') }}
        </button>
        <button
          v-for="lv in LEVELS"
          :key="lv"
          type="button"
          class="rounded-full border px-3.5 text-xs font-semibold transition-colors"
          :class="levelFilter === lv ? 'border-indigo-700 bg-indigo-700 text-white dark:border-indigo-500 dark:bg-indigo-600' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'"
          :aria-pressed="levelFilter === lv"
          @click="levelFilter = lv"
        >
          {{ t(`level.${lv}`) }}
        </button>

        <span class="mx-1 hidden h-5 w-px bg-slate-200 sm:inline-block dark:bg-slate-700" aria-hidden="true" />

        <button
          type="button"
          class="rounded-full border px-3.5 text-xs font-semibold transition-colors"
          :class="statusFilter === 'all' ? 'border-slate-800 bg-slate-800 text-white dark:border-slate-200 dark:bg-slate-100 dark:text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'"
          :aria-pressed="statusFilter === 'all'"
          @click="statusFilter = 'all'"
        >
          {{ t('learn.allStatus') }}
        </button>
        <button
          type="button"
          class="rounded-full border px-3.5 text-xs font-semibold transition-colors"
          :class="statusFilter === 'due' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'"
          :aria-pressed="statusFilter === 'due'"
          @click="statusFilter = 'due'"
        >
          {{ t('learn.statusDue') }}
        </button>
        <button
          type="button"
          class="rounded-full border px-3.5 text-xs font-semibold transition-colors"
          :class="statusFilter === 'mastered' ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'"
          :aria-pressed="statusFilter === 'mastered'"
          @click="statusFilter = 'mastered'"
        >
          {{ t('learn.statusMastered') }}
        </button>
      </div>
    </section>

    <!-- VIEW 1: Track Grid + Direct Topic Search Matches -->
    <template v-if="!track">
      <!-- Direct Topic Search Results -->
      <section v-if="matchingTopicsAcrossTracks.length" class="space-y-2.5">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t('learn.topicsCount', { n: matchingTopicsAcrossTracks.length }) }}
        </p>
        <div class="grid gap-2.5 sm:grid-cols-2">
          <button
            v-for="tp in matchingTopicsAcrossTracks"
            :key="`${tp.track}/${tp.topic}`"
            type="button"
            class="flex items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:hover:border-indigo-700"
            @click="selectTopic(tp.track, tp.topic)"
          >
            <div class="min-w-0">
              <p class="truncate font-semibold text-slate-900 dark:text-slate-50">{{ formatTopicLabel(tp.topic) }}</p>
              <p class="text-xs text-slate-600 dark:text-slate-300">
                {{ t(`track.${tp.track}`) }} · {{ t('learn.cards', { n: tp.total }) }}
              </p>
            </div>
            <AppIcon name="chevron-right" :size="17" class="text-indigo-700 dark:text-indigo-300" />
          </button>
        </div>
      </section>

      <!-- No Matches -->
      <div
        v-if="!filteredTracks.length"
        class="space-y-3 rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900"
      >
        <p class="text-slate-600 dark:text-slate-300">{{ t('learn.noMatches') }}</p>
        <button
          type="button"
          class="inline-flex items-center rounded-xl bg-indigo-700 px-4 font-semibold text-white"
          @click="clearFilters"
        >
          {{ t('learn.clearFilters') }}
        </button>
      </div>

      <!-- Track Cards Grid -->
      <ul v-else class="grid gap-4 sm:grid-cols-2">
        <li v-for="item in filteredTracks" :key="item.track">
          <button
            type="button"
            class="group flex h-full w-full flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-2xs transition-all hover:border-indigo-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500"
            @click="selectTrack(item.track)"
          >
            <div class="space-y-3">
              <div class="flex items-start justify-between gap-3">
                <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition-colors group-hover:bg-indigo-700 group-hover:text-white dark:bg-indigo-950/70 dark:text-indigo-300 dark:group-hover:bg-indigo-600 dark:group-hover:text-white">
                  <AppIcon :name="trackIconMap[item.track]" :size="20" />
                </span>
                <span
                  v-if="item.due > 0"
                  class="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/70 dark:text-amber-200"
                >
                  {{ t('learn.dueCount', { n: item.due }) }}
                </span>
              </div>

              <div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-slate-50">{{ t(`track.${item.track}`) }}</h2>
                <p class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{{ t(`track.${item.track}.desc`) }}</p>
              </div>
            </div>

            <div class="space-y-2.5 pt-2">
              <div class="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                <span>{{ t('learn.topicsCount', { n: item.topics.length }) }} · {{ t('learn.cards', { n: item.total }) }}</span>
                <span class="font-semibold text-indigo-700 dark:text-indigo-300">{{ t('learn.masteryPct', { pct: item.masteryPct }) }}</span>
              </div>

              <!-- Mastery Bar -->
              <div class="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
                <div
                  class="h-full rounded-full bg-indigo-600 transition-all duration-300 dark:bg-indigo-400"
                  :style="{ width: `${item.masteryPct}%` }"
                />
              </div>

              <!-- Level Breakdown Chips -->
              <div class="flex flex-wrap gap-1.5 pt-0.5 text-[11px] font-medium">
                <span v-if="item.levels.beginner" class="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
                  {{ t('level.beginner') }} {{ item.levels.beginner }}
                </span>
                <span v-if="item.levels.intermediate" class="rounded-md bg-amber-50 px-2 py-0.5 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                  {{ t('level.intermediate') }} {{ item.levels.intermediate }}
                </span>
                <span v-if="item.levels.advanced" class="rounded-md bg-violet-50 px-2 py-0.5 text-violet-800 dark:bg-violet-950/60 dark:text-violet-200">
                  {{ t('level.advanced') }} {{ item.levels.advanced }}
                </span>
              </div>
            </div>
          </button>
        </li>
      </ul>
    </template>

    <!-- VIEW 2: Interactive Topic Syllabus Modules inside a Track -->
    <template v-else-if="!topic">
      <div
        v-if="!filteredTopics.length"
        class="space-y-3 rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900"
      >
        <p class="text-slate-600 dark:text-slate-300">{{ t('learn.noMatches') }}</p>
        <button
          type="button"
          class="inline-flex items-center rounded-xl bg-indigo-700 px-4 font-semibold text-white"
          @click="clearFilters"
        >
          {{ t('learn.clearFilters') }}
        </button>
      </div>

      <ul v-else class="space-y-3.5">
        <li
          v-for="(tp, idx) in filteredTopics"
          :key="tp.topic"
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition-colors dark:border-slate-800 dark:bg-slate-900"
        >
          <div class="p-4 sm:p-5">
            <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div class="min-w-0 flex-1 space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {{ String(idx + 1).padStart(2, '0') }}
                  </span>
                  <h2 class="text-lg font-bold text-slate-900 dark:text-slate-50">{{ formatTopicLabel(tp.topic) }}</h2>
                  <span class="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {{ tp.topic }}
                  </span>
                  <span
                    v-if="tp.due > 0"
                    class="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/70 dark:text-amber-200"
                  >
                    {{ t('learn.dueCount', { n: tp.due }) }}
                  </span>
                </div>

                <!-- Card Types & Mastery Summary -->
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <span class="font-medium">{{ t('learn.cards', { n: tp.total }) }}</span>
                  <span class="font-semibold text-indigo-700 dark:text-indigo-300">{{ t('learn.masteryPct', { pct: tp.masteryPct }) }}</span>
                  <span class="flex flex-wrap items-center gap-2">
                    <template v-for="ty in (['flashcard', 'mcq', 'output', 'bugspot'] as CardType[])" :key="ty">
                      <span v-if="tp.types[ty] > 0" class="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
                        <AppIcon :name="cardTypeIcon(ty)" :size="12" />
                        {{ tp.types[ty] }} {{ t(`type.${ty}`) }}
                      </span>
                    </template>
                  </span>
                </div>

                <div class="h-1.5 max-w-md overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
                  <div
                    class="h-full rounded-full bg-indigo-600 transition-all duration-300 dark:bg-indigo-400"
                    :style="{ width: `${tp.masteryPct}%` }"
                  />
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-wrap items-center gap-2 sm:shrink-0">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  :aria-expanded="expandedTopics.has(tp.topic)"
                  @click="toggleSyllabus(tp.topic)"
                >
                  <AppIcon name="chevron-down" :size="15" class="transition-transform" :class="expandedTopics.has(tp.topic) ? 'rotate-180' : ''" />
                  <span>{{ expandedTopics.has(tp.topic) ? t('learn.hideSyllabus') : t('learn.syllabus', { n: tp.total }) }}</span>
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-xl bg-indigo-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                  @click="selectTopic(track, tp.topic)"
                >
                  <AppIcon name="play" :size="15" />
                  <span>{{ tp.seen > 0 ? t('learn.resumeTopic') : t('learn.startTopic') }}</span>
                </button>
              </div>
            </div>

            <!-- Expandable Card-by-Card Interactive Syllabus -->
            <Transition name="panel">
              <div
                v-if="expandedTopics.has(tp.topic)"
                class="mt-4 border-t border-slate-100 pt-3.5 dark:border-slate-800"
              >
                <ol class="space-y-1.5">
                  <li
                    v-for="(c, ci) in tp.cards"
                    :key="c.id"
                    class="flex flex-wrap items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2 text-xs dark:bg-slate-950/60"
                  >
                    <span class="w-5 font-mono font-semibold text-slate-400">{{ ci + 1 }}.</span>
                    <AppIcon :name="cardTypeIcon(c.type)" :size="14" class="text-indigo-600 dark:text-indigo-400" />
                    <span class="min-w-0 flex-1 truncate font-medium text-slate-800 dark:text-slate-100">{{ cardTitle(c) }}</span>
                    <span v-if="c.primer" class="inline-flex items-center gap-1 rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-medium text-amber-900 dark:bg-amber-950/80 dark:text-amber-200">
                      <AppIcon name="lightbulb" :size="11" />
                      {{ t('learn.primerBadge') }}
                    </span>
                    <span class="rounded bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
                      {{ t(`level.${c.level}`) }}
                    </span>
                    <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {{ store.progress[c.id]?.box ? `B${store.progress[c.id]!.box}` : t('learn.newBadge') }}
                    </span>
                  </li>
                </ol>
              </div>
            </Transition>
          </div>
        </li>
      </ul>
    </template>

    <!-- VIEW 3: Active Learning Session with Interactive Curriculum Outline -->
    <div v-else class="grid items-start gap-6" :class="outlineOpen ? 'lg:grid-cols-[290px_minmax(0,1fr)]' : ''">
      <!-- Desktop Interactive Outline Sidebar -->
      <aside
        v-if="outlineOpen"
        aria-label="Curriculum outline"
        class="hidden space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs lg:sticky lg:top-6 lg:block lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {{ t('learn.outline') }}
          </h2>
          <button
            type="button"
            class="rounded-lg px-2 text-xs font-medium text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
            @click="selectTrack(track)"
          >
            {{ t('learn.back') }}
          </button>
        </div>

        <!-- Current Topic Card Sequence Map -->
        <div class="space-y-1.5">
          <p class="text-xs font-semibold text-slate-900 dark:text-slate-100">{{ formatTopicLabel(topic) }}</p>
          <ol class="space-y-1">
            <li
              v-for="(c, i) in sessionCards"
              :key="c.id"
              class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors"
              :class="
                i === activeStepIndex
                  ? 'bg-indigo-50 font-semibold text-indigo-800 ring-1 ring-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-200 dark:ring-indigo-700'
                  : 'text-slate-600 dark:text-slate-300'
              "
            >
              <span
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                :class="
                  sessionResults[c.id] === true
                    ? 'bg-emerald-600 text-white'
                    : sessionResults[c.id] === false
                      ? 'bg-rose-600 text-white'
                      : i === activeStepIndex
                        ? 'bg-indigo-700 text-white'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                "
              >
                <AppIcon v-if="sessionResults[c.id] === true" name="check" :size="11" />
                <AppIcon v-else-if="sessionResults[c.id] === false" name="x" :size="11" />
                <template v-else>{{ i + 1 }}</template>
              </span>
              <span class="min-w-0 flex-1 truncate">{{ cardTitle(c) }}</span>
            </li>
          </ol>
        </div>

        <!-- Track Topic Switcher -->
        <div v-if="activeTrackSummary" class="space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {{ t(`track.${track}`) }}
          </p>
          <ul class="space-y-1">
            <li v-for="tp in activeTrackSummary.topics" :key="tp.topic">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-2 rounded-xl px-2.5 text-left text-xs transition-colors"
                :class="
                  tp.topic === topic
                    ? 'bg-slate-900 font-semibold text-white dark:bg-indigo-600'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                "
                @click="selectTopic(track, tp.topic)"
              >
                <span class="truncate">{{ formatTopicLabel(tp.topic) }}</span>
                <span class="shrink-0 font-mono text-[11px] opacity-80">{{ tp.masteryPct }}%</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <!-- Active Reading & Quiz Stage -->
      <div class="mx-auto w-full max-w-3xl">
        <QuizRunner :key="`${track}/${topic}`" :cards="sessionCards" @step="onQuizStep">
          <template #done>
            <button
              v-if="nextTopicInTrack"
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-4 font-semibold text-white hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              @click="selectTopic(track, nextTopicInTrack.topic)"
            >
              <span>{{ t('learn.nextTopic', { topic: formatTopicLabel(nextTopicInTrack.topic) }) }}</span>
              <AppIcon name="chevron-right" :size="16" />
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              @click="selectTrack(track)"
            >
              {{ t('learn.another') }}
            </button>
          </template>
        </QuizRunner>
      </div>

      <!-- Mobile Outline Drawer -->
      <Transition name="drawer">
        <div
          v-if="mobileOutlineOpen"
          class="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs lg:hidden"
          @click.self="mobileOutlineOpen = false"
        >
          <div class="drawer-panel flex h-full w-80 max-w-[90vw] flex-col gap-4 overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <span class="font-bold text-slate-900 dark:text-slate-50">{{ t('learn.outline') }}</span>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                :aria-label="t('nav.close')"
                @click="mobileOutlineOpen = false"
              >
                <AppIcon name="x" :size="18" />
              </button>
            </div>

            <div class="space-y-1.5">
              <p class="text-xs font-semibold text-slate-900 dark:text-slate-100">{{ formatTopicLabel(topic) }}</p>
              <ol class="space-y-1">
                <li
                  v-for="(c, i) in sessionCards"
                  :key="c.id"
                  class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs"
                  :class="i === activeStepIndex ? 'bg-indigo-50 font-semibold text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-200' : 'text-slate-600 dark:text-slate-300'"
                >
                  <span class="font-mono">{{ i + 1 }}.</span>
                  <span class="truncate">{{ cardTitle(c) }}</span>
                </li>
              </ol>
            </div>

            <div v-if="activeTrackSummary" class="space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
              <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {{ t(`track.${track}`) }}
              </p>
              <ul class="space-y-1">
                <li v-for="tp in activeTrackSummary.topics" :key="tp.topic">
                  <button
                    type="button"
                    class="flex w-full items-center justify-between gap-2 rounded-xl px-2.5 text-left text-xs"
                    :class="tp.topic === topic ? 'bg-slate-900 font-semibold text-white dark:bg-indigo-600' : 'text-slate-700 dark:text-slate-300'"
                    @click="selectTopic(track, tp.topic)"
                  >
                    <span class="truncate">{{ formatTopicLabel(tp.topic) }}</span>
                    <span class="font-mono text-[11px] opacity-80">{{ tp.masteryPct }}%</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
