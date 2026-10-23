<script setup lang="ts">
import { watchEffect } from 'vue';
import { useStore } from './composables/useStore.ts';

const { store } = useStore();
const links = [
  { to: '/', label: 'Home' },
  { to: '/learn', label: 'Learn' },
  { to: '/practice', label: 'Practice' },
  { to: '/progress', label: 'Progress' },
  { to: '/settings', label: 'Settings' },
];

watchEffect(() => {
  const dark =
    store.settings.theme === 'dark' ||
    (store.settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 md:flex">
    <nav
      aria-label="Main"
      class="fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 md:static md:w-48 md:flex-col md:border-r md:border-t-0 md:p-2"
    >
      <RouterLink
        v-for="l in links"
        :key="l.to"
        :to="l.to"
        class="flex flex-1 items-center justify-center rounded px-2 text-sm md:flex-none md:justify-start md:px-3"
        active-class="font-bold text-indigo-600 dark:text-indigo-300"
        exact-active-class="font-bold text-indigo-600 dark:text-indigo-300"
      >{{ l.label }}</RouterLink>
    </nav>
    <main class="mx-auto w-full max-w-2xl p-4 pb-24 md:pb-4">
      <RouterView />
    </main>
  </div>
</template>
