<script setup lang="ts">
import { useStore } from '../composables/useStore.ts';

const { dueCount, streak, cards } = useStore();
const tiles = [
  { to: { name: 'learn' }, title: 'Learn', text: 'Guided topics, beginner to advanced' },
  { to: { name: 'practice', query: { mode: 'revise' } }, title: 'Revise', text: 'Due and weakest cards first' },
  { to: { name: 'practice', query: { mode: 'interview' } }, title: 'Interview', text: 'Timed, mixed tracks' },
];
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Core Learn</h1>
    <div class="grid grid-cols-2 gap-3 text-center">
      <div class="rounded-lg border border-slate-300 p-4 dark:border-slate-600">
        <p class="text-3xl font-bold">{{ dueCount }}</p><p class="text-sm">due today ({{ cards.length }} total)</p>
      </div>
      <div class="rounded-lg border border-slate-300 p-4 dark:border-slate-600">
        <p class="text-3xl font-bold">{{ streak }}</p><p class="text-sm">day streak</p>
      </div>
    </div>
    <RouterLink :to="{ name: 'practice', query: { mode: 'revise' } }" class="flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 text-white">
      Continue
    </RouterLink>
    <div class="grid gap-3 sm:grid-cols-3">
      <RouterLink v-for="t in tiles" :key="t.title" :to="t.to" class="block rounded-lg border border-slate-300 p-4 dark:border-slate-600">
        <span class="block font-semibold">{{ t.title }}</span><span class="text-sm">{{ t.text }}</span>
      </RouterLink>
    </div>
  </div>
</template>
