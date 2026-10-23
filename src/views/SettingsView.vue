<script setup lang="ts">
import { useStore } from '../composables/useStore.ts';
import { useT } from '../i18n/index.ts';

const t = useT();
const { store } = useStore();
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold">{{ t('settings.title') }}</h1>
    <label class="block">{{ t('settings.theme') }}
      <select v-model="store.settings.theme" class="ml-2 min-h-11 rounded border px-2 dark:bg-slate-800">
        <option value="system">{{ t('settings.system') }}</option>
        <option value="light">{{ t('settings.light') }}</option>
        <option value="dark">{{ t('settings.dark') }}</option>
      </select>
    </label>
    <label class="block">{{ t('settings.language') }}
      <select v-model="store.settings.language" class="ml-2 min-h-11 rounded border px-2 dark:bg-slate-800">
        <option value="en">English</option>
        <option value="id">Bahasa Indonesia</option>
      </select>
    </label>
    <p class="text-sm text-slate-600 dark:text-slate-300">{{ t('settings.langNote') }}</p>
    <label class="block">{{ t('settings.length') }}
      <select v-model.number="store.settings.quizLength" class="ml-2 min-h-11 rounded border px-2 dark:bg-slate-800">
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>
    </label>
    <label class="flex min-h-11 items-center gap-2">
      <input v-model="store.settings.timer" type="checkbox" class="size-5"> {{ t('settings.timer') }}
    </label>
  </div>
</template>
