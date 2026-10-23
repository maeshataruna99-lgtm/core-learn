<script setup lang="ts">
import { useStore } from '../composables/useStore.ts';
import { useT } from '../i18n/index.ts';

const t = useT();
const { dueCount, streak, cards } = useStore();
const tiles = [
  { to: { name: 'learn' }, title: 'home.learn', text: 'home.learnText' },
  { to: { name: 'practice', query: { mode: 'revise' } }, title: 'home.revise', text: 'home.reviseText' },
  { to: { name: 'practice', query: { mode: 'interview' } }, title: 'home.interview', text: 'home.interviewText' },
] as const;
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Core Learn</h1>
    <div class="grid grid-cols-2 gap-3 text-center">
      <div class="rounded-lg border border-slate-300 p-4 dark:border-slate-600">
        <p class="text-3xl font-bold">{{ dueCount }}</p>
        <p class="text-sm">{{ t('home.due', { n: cards.length }) }}</p>
      </div>
      <div class="rounded-lg border border-slate-300 p-4 dark:border-slate-600">
        <p class="text-3xl font-bold">{{ streak }}</p>
        <p class="text-sm">{{ t('home.streak') }}</p>
      </div>
    </div>
    <RouterLink :to="{ name: 'practice', query: { mode: 'revise' } }" class="flex items-center justify-center rounded-lg bg-indigo-700 px-4 py-3 text-white">
      {{ t('home.continue') }}
    </RouterLink>
    <div class="grid gap-3 sm:grid-cols-3">
      <RouterLink v-for="tile in tiles" :key="tile.title" :to="tile.to" class="block rounded-lg border border-slate-300 p-4 dark:border-slate-600">
        <span class="block font-semibold">{{ t(tile.title) }}</span>
        <span class="text-sm">{{ t(tile.text) }}</span>
      </RouterLink>
    </div>
  </div>
</template>
