<script setup lang="ts">
import AppIcon from '../components/AppIcon.vue';
import { useT } from '../i18n/index.ts';

const t = useT();
</script>

<template>
  <section class="mx-auto max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
    <p class="font-mono text-sm font-bold text-indigo-700 dark:text-indigo-300">404</p>
    <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{{ t('notFound.title') }}</h1>
    <p class="text-sm text-slate-600 dark:text-slate-300">{{ t('notFound.desc') }}</p>
    <div class="pt-2">
      <RouterLink
        to="/"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 font-semibold text-white transition-colors hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
      >
        <AppIcon name="home" :size="16" />
        <span>{{ t('notFound.home') }}</span>
      </RouterLink>
    </div>
  </section>
</template>
