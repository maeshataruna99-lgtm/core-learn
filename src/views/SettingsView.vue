<script setup lang="ts">
import AppIcon from '../components/AppIcon.vue';
import type { IconName } from '../components/AppIcon.vue';
import { useStore } from '../composables/useStore.ts';
import { useT } from '../i18n/index.ts';

const t = useT();
const { store } = useStore();

const themes: { value: 'system' | 'light' | 'dark'; label: 'settings.system' | 'settings.light' | 'settings.dark'; icon: IconName }[] = [
  { value: 'system', label: 'settings.system', icon: 'monitor' },
  { value: 'light', label: 'settings.light', icon: 'sun' },
  { value: 'dark', label: 'settings.dark', icon: 'moon' },
];
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">{{ t('settings.title') }}</h1>

    <!-- Theme -->
    <section class="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 class="font-bold text-slate-900 dark:text-slate-50">{{ t('settings.theme') }}</h2>
        <p class="text-sm text-slate-600 dark:text-slate-300">{{ t('settings.themeDesc') }}</p>
      </div>
      <div class="grid grid-cols-3 gap-2.5">
        <button
          v-for="th in themes"
          :key="th.value"
          type="button"
          class="flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors"
          :class="
            store.settings.theme === th.value
              ? 'border-indigo-700 bg-indigo-50 text-indigo-800 dark:border-indigo-500 dark:bg-indigo-950/70 dark:text-indigo-200'
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          "
          :aria-pressed="store.settings.theme === th.value"
          @click="store.settings.theme = th.value"
        >
          <AppIcon :name="th.icon" :size="16" />
          <span>{{ t(th.label) }}</span>
        </button>
      </div>
    </section>

    <!-- Language -->
    <section class="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 class="font-bold text-slate-900 dark:text-slate-50">{{ t('settings.language') }}</h2>
        <p class="text-sm text-slate-600 dark:text-slate-300">{{ t('settings.langDesc') }}</p>
      </div>
      <div class="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          class="rounded-xl border px-4 py-3 text-sm font-semibold transition-colors"
          :class="
            store.settings.language === 'en'
              ? 'border-indigo-700 bg-indigo-50 text-indigo-800 dark:border-indigo-500 dark:bg-indigo-950/70 dark:text-indigo-200'
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          "
          :aria-pressed="store.settings.language === 'en'"
          @click="store.settings.language = 'en'"
        >
          English
        </button>
        <button
          type="button"
          class="rounded-xl border px-4 py-3 text-sm font-semibold transition-colors"
          :class="
            store.settings.language === 'id'
              ? 'border-indigo-700 bg-indigo-50 text-indigo-800 dark:border-indigo-500 dark:bg-indigo-950/70 dark:text-indigo-200'
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          "
          :aria-pressed="store.settings.language === 'id'"
          @click="store.settings.language = 'id'"
        >
          Bahasa Indonesia
        </button>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('settings.langNote') }}</p>
    </section>

    <!-- Quiz Defaults -->
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 class="font-bold text-slate-900 dark:text-slate-50">{{ t('settings.length') }}</h2>
        <p class="text-sm text-slate-600 dark:text-slate-300">{{ t('settings.quizDesc') }}</p>
      </div>

      <div class="inline-flex rounded-xl border border-slate-300 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
        <button
          v-for="len in [10, 20, 50]"
          :key="len"
          type="button"
          class="rounded-lg px-5 text-sm font-semibold transition-colors"
          :class="store.settings.quizLength === len ? 'bg-indigo-700 text-white dark:bg-indigo-600' : 'text-slate-700 dark:text-slate-300'"
          :aria-pressed="store.settings.quizLength === len"
          @click="store.settings.quizLength = len"
        >
          {{ len }}
        </button>
      </div>

      <label class="flex min-h-11 cursor-pointer items-center gap-3 border-t border-slate-100 pt-3 text-sm font-medium text-slate-800 dark:border-slate-800 dark:text-slate-200">
        <input v-model="store.settings.timer" type="checkbox" class="size-5 rounded accent-indigo-700" />
        <span>{{ t('settings.timer') }}</span>
      </label>
    </section>
  </div>
</template>
