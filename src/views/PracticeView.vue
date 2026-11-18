<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import AppIcon from '../components/AppIcon.vue';
import QuizRunner from '../components/QuizRunner.vue';
import { useStore } from '../composables/useStore.ts';
import { filterCards, interviewSet, reviseOrder } from '../core/selection.ts';
import { LEVELS, TRACKS } from '../core/types.ts';
import type { Card, CardType, Level, Track } from '../core/types.ts';
import { useT } from '../i18n/index.ts';

const t = useT();
const route = useRoute();
const { cards, store } = useStore();
const interview = computed(() => route.query.mode === 'interview');

const form = reactive({
  tracks: [] as Track[],
  levels: [] as Level[],
  types: [] as CardType[],
  length: interview.value ? 20 : store.settings.quizLength,
  timer: interview.value ? true : store.settings.timer,
});
const types: CardType[] = ['flashcard', 'mcq', 'output', 'bugspot'];
const session = ref<Card[] | null>(null);
const runId = ref(0);

const poolSize = computed(() => filterCards(cards, form).length);

function toggleItem<T>(arr: T[], val: T) {
  const idx = arr.indexOf(val);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push(val);
}

function applyPreset(preset: 'quick' | 'bugs' | 'output' | 'interview') {
  form.tracks = [];
  form.levels = [];
  if (preset === 'quick') {
    form.types = [];
    form.length = 10;
    form.timer = false;
  } else if (preset === 'bugs') {
    form.types = ['bugspot'];
    form.length = 10;
    form.timer = false;
  } else if (preset === 'output') {
    form.types = ['output'];
    form.length = 10;
    form.timer = false;
  } else {
    form.types = ['mcq', 'output', 'bugspot'];
    form.length = 20;
    form.timer = true;
  }
}

function clearFilters() {
  form.tracks = [];
  form.levels = [];
  form.types = [];
}

function start() {
  const pool = filterCards(cards, form);
  session.value = interview.value
    ? interviewSet(pool, form.length, Date.now())
    : reviseOrder(pool, store.progress, new Date().toISOString()).slice(0, form.length);
  runId.value++;
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
        {{ interview ? t('practice.interview') : t('practice.title') }}
      </h1>
    </header>

    <form
      v-if="!session"
      class="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6 dark:border-slate-800 dark:bg-slate-900"
      @submit.prevent="start"
    >
      <!-- Quick Presets -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {{ t('practice.presets') }}
          </p>
          <button
            v-if="form.tracks.length || form.levels.length || form.types.length"
            type="button"
            class="text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300"
            @click="clearFilters"
          >
            {{ t('practice.clearAll') }}
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-indigo-950/40"
            @click="applyPreset('quick')"
          >
            {{ t('practice.presetQuick') }}
          </button>
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-indigo-950/40"
            @click="applyPreset('bugs')"
          >
            {{ t('practice.presetBugs') }}
          </button>
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-indigo-950/40"
            @click="applyPreset('output')"
          >
            {{ t('practice.presetOutput') }}
          </button>
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-indigo-950/40"
            @click="applyPreset('interview')"
          >
            {{ t('practice.presetInterview') }}
          </button>
        </div>
      </div>

      <!-- Tracks Pill Grid -->
      <fieldset class="space-y-2">
        <legend class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('practice.tracks') }}</legend>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tr in TRACKS"
            :key="tr"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors"
            :class="
              form.tracks.includes(tr)
                ? 'border-indigo-700 bg-indigo-700 text-white dark:border-indigo-500 dark:bg-indigo-600'
                : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            "
            :aria-pressed="form.tracks.includes(tr)"
            @click="toggleItem(form.tracks, tr)"
          >
            <AppIcon v-if="form.tracks.includes(tr)" name="check" :size="13" />
            <span>{{ t(`track.${tr}`) }}</span>
          </button>
        </div>
      </fieldset>

      <!-- Level & Card Type Pills -->
      <div class="grid gap-5 sm:grid-cols-2">
        <fieldset class="space-y-2">
          <legend class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('practice.level') }}</legend>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="l in LEVELS"
              :key="l"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors"
              :class="
                form.levels.includes(l)
                  ? 'border-indigo-700 bg-indigo-700 text-white dark:border-indigo-500 dark:bg-indigo-600'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              "
              :aria-pressed="form.levels.includes(l)"
              @click="toggleItem(form.levels, l)"
            >
              <AppIcon v-if="form.levels.includes(l)" name="check" :size="13" />
              <span>{{ t(`level.${l}`) }}</span>
            </button>
          </div>
        </fieldset>

        <fieldset class="space-y-2">
          <legend class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('practice.types') }}</legend>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="ty in types"
              :key="ty"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors"
              :class="
                form.types.includes(ty)
                  ? 'border-indigo-700 bg-indigo-700 text-white dark:border-indigo-500 dark:bg-indigo-600'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              "
              :aria-pressed="form.types.includes(ty)"
              @click="toggleItem(form.types, ty)"
            >
              <AppIcon v-if="form.types.includes(ty)" name="check" :size="13" />
              <span>{{ t(`type.${ty}`) }}</span>
            </button>
          </div>
        </fieldset>
      </div>

      <!-- Length & Timer -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('practice.length') }}</span>
          <div class="inline-flex rounded-xl border border-slate-300 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
            <button
              v-for="len in [10, 20, 50]"
              :key="len"
              type="button"
              class="rounded-lg px-3.5 text-xs font-semibold transition-colors"
              :class="form.length === len ? 'bg-indigo-700 text-white dark:bg-indigo-600' : 'text-slate-700 dark:text-slate-300'"
              :aria-pressed="form.length === len"
              @click="form.length = len"
            >
              {{ len }}
            </button>
          </div>
        </div>

        <label class="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-800 dark:text-slate-200">
          <input v-model="form.timer" type="checkbox" class="size-5 rounded accent-indigo-700" />
          <AppIcon name="clock" :size="16" class="text-slate-500" />
          <span>{{ t('practice.timer') }}</span>
        </label>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-slate-600 dark:text-slate-300">{{ t('practice.matching', { n: poolSize }) }}</p>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-6 py-3 font-semibold text-white shadow-xs transition-colors hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          type="submit"
        >
          <AppIcon name="play" :size="17" />
          <span>{{ t('practice.start') }}</span>
        </button>
      </div>
    </form>

    <QuizRunner v-else :key="runId" :cards="session" :timed="form.timer">
      <template #done>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          @click="session = null"
        >
          {{ t('practice.new') }}
        </button>
      </template>
    </QuizRunner>
  </div>
</template>
