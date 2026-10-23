<script setup lang="ts">
import { watchEffect } from 'vue';
import { useStore } from './composables/useStore.ts';
import { usePwa } from './composables/usePwa.ts';
import { useT } from './i18n/index.ts';
import type { Key } from './i18n/index.ts';

const t = useT();
const { store } = useStore();
const { needRefresh, offlineReady, reload, dismiss } = usePwa();
const links: { to: string; label: Key }[] = [
  { to: '/', label: 'nav.home' },
  { to: '/learn', label: 'nav.learn' },
  { to: '/practice', label: 'nav.practice' },
  { to: '/progress', label: 'nav.progress' },
  { to: '/settings', label: 'nav.settings' },
];

watchEffect(() => {
  const dark =
    store.settings.theme === 'dark' ||
    (store.settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.lang = store.settings.language;
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
        active-class="font-bold text-indigo-700 dark:text-indigo-300"
        exact-active-class="font-bold text-indigo-700 dark:text-indigo-300"
      >
        {{ t(l.label) }}
      </RouterLink>
    </nav>
    <main class="mx-auto w-full max-w-2xl p-4 pb-24 md:pb-4">
      <div
        v-if="needRefresh || offlineReady"
        class="mb-4 flex items-center gap-3 rounded-lg border border-indigo-300 bg-indigo-50 p-3 dark:border-indigo-700 dark:bg-indigo-950"
        role="status"
      >
        <span class="flex-1">{{ needRefresh ? t('pwa.update') : t('pwa.offline') }}</span>
        <button v-if="needRefresh" class="rounded bg-indigo-700 px-3 text-white" @click="reload()">{{ t('pwa.reload') }}</button>
        <button class="rounded border px-3" @click="dismiss()">{{ t('progress.cancel') }}</button>
      </div>
      <RouterView />
    </main>
  </div>
</template>
