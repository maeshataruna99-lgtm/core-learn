<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import AppIcon from './components/AppIcon.vue';
import type { IconName } from './components/AppIcon.vue';
import { usePwa } from './composables/usePwa.ts';
import { useStore } from './composables/useStore.ts';
import { useT } from './i18n/index.ts';
import type { Key } from './i18n/index.ts';

const t = useT();
const route = useRoute();
const { store, dueCount, streak } = useStore();
const { needRefresh, offlineReady, reload, dismiss } = usePwa();
const mobileDrawerOpen = ref(false);

interface NavLink {
  to: string;
  label: Key;
  icon: IconName;
}

const navGroups: { title: Key; items: NavLink[] }[] = [
  {
    title: 'nav.group.study',
    items: [
      { to: '/', label: 'nav.home', icon: 'home' },
      { to: '/learn', label: 'nav.learn', icon: 'book-open' },
      { to: '/practice', label: 'nav.practice', icon: 'target' },
    ],
  },
  {
    title: 'nav.group.reference',
    items: [
      { to: '/wiki', label: 'nav.wiki', icon: 'library' },
      { to: '/focus', label: 'nav.focus', icon: 'compass' },
      { to: '/mycv', label: 'nav.mycv', icon: 'file-text' },
    ],
  },
  {
    title: 'nav.group.system',
    items: [
      { to: '/progress', label: 'nav.progress', icon: 'bar-chart' },
      { to: '/settings', label: 'nav.settings', icon: 'settings' },
    ],
  },
];

const mobilePrimary: NavLink[] = [
  { to: '/', label: 'nav.home', icon: 'home' },
  { to: '/learn', label: 'nav.learn', icon: 'book-open' },
  { to: '/practice', label: 'nav.practice', icon: 'target' },
  { to: '/wiki', label: 'nav.wiki', icon: 'library' },
];

const mobileSecondaryActive = computed(() => ['/focus', '/mycv', '/progress', '/settings'].includes(route.path));

const themeIcon = computed<IconName>(() => {
  if (store.settings.theme === 'dark') return 'moon';
  if (store.settings.theme === 'light') return 'sun';
  return 'monitor';
});

function cycleTheme() {
  const order = ['system', 'light', 'dark'] as const;
  const idx = order.indexOf(store.settings.theme);
  store.settings.theme = order[(idx + 1) % order.length]!;
}

function toggleLanguage() {
  store.settings.language = store.settings.language === 'en' ? 'id' : 'en';
}

watch(() => route.fullPath, () => {
  mobileDrawerOpen.value = false;
});

watchEffect(() => {
  const dark =
    store.settings.theme === 'dark' ||
    (store.settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.lang = store.settings.language;
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 md:flex">
    <!-- Desktop Studio Sidebar -->
    <aside
      aria-label="Main"
      class="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-slate-200 md:bg-white dark:md:border-slate-800 dark:md:bg-slate-900"
    >
      <div class="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-800">
        <RouterLink to="/" class="flex items-center gap-2.5 font-bold tracking-tight text-slate-900 dark:text-slate-50">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-700 text-white dark:bg-indigo-600">
            <AppIcon name="code" :size="18" />
          </span>
          <span class="text-base">Core Learn</span>
        </RouterLink>
      </div>

      <!-- Live Study Telemetry Pill -->
      <div class="mx-3 mt-3 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-800 dark:bg-slate-950/60">
        <RouterLink to="/practice?mode=revise" class="flex items-center gap-1.5 rounded-lg px-2 py-1 font-medium text-indigo-700 hover:bg-white dark:text-indigo-300 dark:hover:bg-slate-900">
          <AppIcon name="sparkles" :size="14" />
          <span class="truncate">{{ dueCount }} due</span>
        </RouterLink>
        <div class="flex items-center justify-end gap-1 px-2 py-1 font-medium text-amber-700 dark:text-amber-300">
          <AppIcon name="flame" :size="14" />
          <span>{{ streak }}d</span>
        </div>
      </div>

      <nav aria-label="Primary" class="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        <div v-for="group in navGroups" :key="group.title" class="space-y-1">
          <p class="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {{ t(group.title) }}
          </p>
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            active-class="bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200"
            exact-active-class="bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200"
          >
            <AppIcon :name="item.icon" :size="18" />
            <span>{{ t(item.label) }}</span>
          </RouterLink>
        </div>
      </nav>

      <!-- Quick Theme & Language Controls -->
      <div class="flex items-center gap-2 border-t border-slate-100 p-3 dark:border-slate-800">
        <button
          type="button"
          class="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          :aria-label="`${t('settings.theme')}: ${store.settings.theme}`"
          @click="cycleTheme"
        >
          <AppIcon :name="themeIcon" :size="15" />
          <span class="capitalize">{{ store.settings.theme }}</span>
        </button>
        <button
          type="button"
          class="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs font-semibold uppercase text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          :aria-label="t('settings.language')"
          @click="toggleLanguage"
        >
          {{ store.settings.language }}
        </button>
      </div>
    </aside>

    <!-- Mobile Top Header -->
    <header class="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur-sm md:hidden dark:border-slate-800 dark:bg-slate-900/95">
      <RouterLink to="/" class="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-700 text-white dark:bg-indigo-600">
          <AppIcon name="code" :size="17" />
        </span>
        <span>Core Learn</span>
      </RouterLink>
      <div class="flex items-center gap-2">
        <RouterLink
          to="/practice?mode=revise"
          class="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 text-xs font-semibold text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-200"
        >
          <AppIcon name="sparkles" :size="13" />
          <span>{{ dueCount }}</span>
        </RouterLink>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 text-slate-700 dark:border-slate-700 dark:text-slate-200"
          :aria-label="t('settings.language')"
          @click="toggleLanguage"
        >
          <span class="font-mono text-xs font-semibold uppercase">{{ store.settings.language }}</span>
        </button>
      </div>
    </header>

    <!-- Main Content Stage -->
    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-5 pb-28 sm:px-6 md:py-8 md:pb-10">
      <div
        v-if="needRefresh || offlineReady"
        class="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm dark:border-indigo-800 dark:bg-indigo-950/60"
        role="status"
      >
        <span class="flex-1 font-medium">{{ needRefresh ? t('pwa.update') : t('pwa.offline') }}</span>
        <button v-if="needRefresh" type="button" class="rounded-lg bg-indigo-700 px-3.5 text-xs font-semibold text-white" @click="reload()">
          {{ t('pwa.reload') }}
        </button>
        <button type="button" class="rounded-lg border border-slate-300 px-3 text-xs font-medium dark:border-slate-700" @click="dismiss()">
          {{ t('progress.cancel') }}
        </button>
      </div>

      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <!-- Mobile 5-Tab Bottom Navigation -->
    <nav
      aria-label="Mobile"
      class="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white/95 px-1 py-1 backdrop-blur-sm md:hidden dark:border-slate-800 dark:bg-slate-900/95"
    >
      <RouterLink
        v-for="item in mobilePrimary"
        :key="item.to"
        :to="item.to"
        class="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300"
        active-class="bg-indigo-50/80 font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200"
        exact-active-class="bg-indigo-50/80 font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200"
      >
        <AppIcon :name="item.icon" :size="18" />
        <span class="truncate">{{ t(item.label) }}</span>
      </RouterLink>
      <button
        type="button"
        class="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[11px] font-medium"
        :class="mobileSecondaryActive || mobileDrawerOpen ? 'bg-indigo-50/80 font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200' : 'text-slate-600 dark:text-slate-300'"
        :aria-expanded="mobileDrawerOpen"
        @click="mobileDrawerOpen = !mobileDrawerOpen"
      >
        <AppIcon name="menu" :size="18" />
        <span>{{ t('nav.more') }}</span>
      </button>
    </nav>

    <!-- Mobile Secondary Drawer -->
    <Transition name="drawer">
      <div
        v-if="mobileDrawerOpen"
        class="fixed inset-0 z-40 flex justify-end bg-slate-950/50 backdrop-blur-xs md:hidden"
        @click.self="mobileDrawerOpen = false"
      >
        <div class="drawer-panel flex h-full w-72 max-w-[85vw] flex-col border-l border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <span class="font-bold text-slate-900 dark:text-slate-50">Core Learn</span>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 text-slate-700 dark:border-slate-700 dark:text-slate-200"
              :aria-label="t('nav.close')"
              @click="mobileDrawerOpen = false"
            >
              <AppIcon name="x" :size="18" />
            </button>
          </div>

          <div class="mt-4 flex-1 space-y-5 overflow-y-auto">
            <div v-for="group in navGroups.slice(1)" :key="group.title" class="space-y-1">
              <p class="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {{ t(group.title) }}
              </p>
              <RouterLink
                v-for="item in group.items"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                active-class="bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200"
              >
                <AppIcon :name="item.icon" :size="18" />
                <span>{{ t(item.label) }}</span>
              </RouterLink>
            </div>
          </div>

          <div class="flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <button
              type="button"
              class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              @click="cycleTheme"
            >
              <AppIcon :name="themeIcon" :size="15" />
              <span class="capitalize">{{ store.settings.theme }}</span>
            </button>
            <button
              type="button"
              class="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs font-semibold uppercase text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              @click="toggleLanguage"
            >
              {{ store.settings.language }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
