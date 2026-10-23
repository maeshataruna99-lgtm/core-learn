<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import QuizRunner from '../components/QuizRunner.vue';
import { useStore } from '../composables/useStore.ts';
import { filterCards, interviewSet, reviseOrder } from '../core/selection.ts';
import { LEVELS, TRACKS } from '../core/types.ts';
import type { Card, CardType, Level, Track } from '../core/types.ts';
import { useT } from '../i18n/index.ts';

const t = useT();
const route = useRoute();
const { cards, store } = useStore();
const interview = route.query.mode === 'interview';

const form = reactive({
  tracks: [] as Track[],
  levels: [] as Level[],
  types: [] as CardType[],
  length: interview ? 20 : store.settings.quizLength,
  timer: interview ? true : store.settings.timer,
});
const types: CardType[] = ['flashcard', 'mcq', 'output', 'bugspot'];
const session = ref<Card[] | null>(null);
const runId = ref(0);

const poolSize = computed(() => filterCards(cards, form).length);

function start() {
  const pool = filterCards(cards, form);
  session.value = interview
    ? interviewSet(pool, form.length, Date.now())
    : reviseOrder(pool, store.progress, new Date().toISOString()).slice(0, form.length);
  runId.value++;
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold">{{ interview ? t('practice.interview') : t('practice.title') }}</h1>
    <form v-if="!session" class="space-y-4" @submit.prevent="start">
      <fieldset class="space-y-1">
        <legend class="font-semibold">{{ t('practice.tracks') }}</legend>
        <label v-for="tr in TRACKS" :key="tr" class="flex min-h-11 items-center gap-2">
          <input v-model="form.tracks" type="checkbox" :value="tr" class="size-5"> {{ tr }}
        </label>
      </fieldset>
      <fieldset class="space-y-1">
        <legend class="font-semibold">{{ t('practice.level') }}</legend>
        <label v-for="l in LEVELS" :key="l" class="flex min-h-11 items-center gap-2">
          <input v-model="form.levels" type="checkbox" :value="l" class="size-5"> {{ l }}
        </label>
      </fieldset>
      <fieldset class="space-y-1">
        <legend class="font-semibold">{{ t('practice.types') }}</legend>
        <label v-for="ty in types" :key="ty" class="flex min-h-11 items-center gap-2">
          <input v-model="form.types" type="checkbox" :value="ty" class="size-5"> {{ ty }}
        </label>
      </fieldset>
      <label class="block">{{ t('practice.length') }}
        <select v-model.number="form.length" class="ml-2 min-h-11 rounded border px-2 dark:bg-slate-800">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </label>
      <label class="flex min-h-11 items-center gap-2">
        <input v-model="form.timer" type="checkbox" class="size-5"> {{ t('practice.timer') }}
      </label>
      <p class="text-sm text-slate-600 dark:text-slate-300">{{ t('practice.matching', { n: poolSize }) }}</p>
      <button class="w-full rounded-lg bg-indigo-700 px-4 py-3 text-white" type="submit">{{ t('practice.start') }}</button>
    </form>
    <QuizRunner v-else :key="runId" :cards="session" :timed="form.timer">
      <template #done>
        <button class="underline" @click="session = null">{{ t('practice.new') }}</button>
      </template>
    </QuizRunner>
  </div>
</template>
