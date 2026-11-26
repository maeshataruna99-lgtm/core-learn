<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';
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
  id: string;
  to: RouteLocationRaw;
  label: Key;
  icon: IconName;
  badge?: string;
}

const MGS_ROUTE: RouteLocationRaw = { path: '/focus', query: { project: 'mgs-live-coding' } };

const isMgsRoute = computed(
  () =>
    route.path === '/focus' &&
    (route.query.project === 'mgs-live-coding' ||
      (typeof route.query.item === 'string' && route.query.item.startsWith('mgs-'))),
);

function isNavActive(item: NavLink): boolean {
  if (item.id === 'mgs') return isMgsRoute.value;
  if (item.id === 'focus') return route.path === '/focus' && !isMgsRoute.value;
  if (item.id === 'home') return route.path === '/';
  const targetPath = typeof item.to === 'string' ? item.to : ('path' in item.to ? item.to.path : '');
  return route.path === targetPath;
}

const navGroups: { title: Key; items: NavLink[] }[] = [
  {
    title: 'nav.group.study',
    items: [
      { id: 'home', to: '/', label: 'nav.home', icon: 'home' },
      { id: 'learn', to: '/learn', label: 'nav.learn', icon: 'book-open' },
      { id: 'practice', to: '/practice', label: 'nav.practice', icon: 'target' },
    ],
  },
  {
    title: 'nav.group.reference',
    items: [
      { id: 'mgs', to: MGS_ROUTE, label: 'nav.mgs', icon: 'terminal', badge: '90m' },
      { id: 'focus', to: '/focus', label: 'nav.focus', icon: 'compass' },
      { id: 'wiki', to: '/wiki', label: 'nav.wiki', icon: 'library' },
      { id: 'lab', to: '/lab', label: 'nav.lab', icon: 'sparkles' },
      { id: 'mycv', to: '/mycv', label: 'nav.mycv', icon: 'file-text' },
    ],
  },
  {
    title: 'nav.group.system',
    items: [
      { id: 'progress', to: '/progress', label: 'nav.progress', icon: 'bar-chart' },
      { id: 'settings', to: '/settings', label: 'nav.settings', icon: 'settings' },
    ],
  },
];

const mobilePrimary: NavLink[] = [
  { id: 'home', to: '/', label: 'nav.home', icon: 'home' },
  { id: 'learn', to: '/learn', label: 'nav.learn', icon: 'book-open' },
  { id: 'practice', to: '/practice', label: 'nav.practice', icon: 'target' },
  { id: 'focus', to: '/focus', label: 'nav.focus', icon: 'compass' },
];

// Exclude routes already pinned in the mobile bottom bar and the featured MGS card.
const mobileDrawerGroups: { title: Key; items: NavLink[] }[] = [
  {
    title: 'nav.group.reference',
    items: [
      { id: 'wiki', to: '/wiki', label: 'nav.wiki', icon: 'library' },
      { id: 'lab', to: '/lab', label: 'nav.lab', icon: 'sparkles' },
      { id: 'mycv', to: '/mycv', label: 'nav.mycv', icon: 'file-text' },
    ],
  },
  {
    title: 'nav.group.system',
    items: [
      { id: 'progress', to: '/progress', label: 'nav.progress', icon: 'bar-chart' },
      { id: 'settings', to: '/settings', label: 'nav.settings', icon: 'settings' },
    ],
  },
];

const mobileSecondaryActive = computed(() =>
  ['/wiki', '/lab', '/mycv', '/progress', '/settings'].includes(route.path),
);

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

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && mobileDrawerOpen.value) {
    mobileDrawerOpen.value = false;
  }
}

const systemDark = ref(
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches,
);
let mql: MediaQueryList | null = null;
const onMediaChange = (e: MediaQueryListEvent) => {
  systemDark.value = e.matches;
};
onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', onKeydown);
    if (window.matchMedia) {
      mql = window.matchMedia('(prefers-color-scheme: dark)');
      systemDark.value = mql.matches;
      mql.addEventListener('change', onMediaChange);
    }
  }
});
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onKeydown);
  }
  mql?.removeEventListener('change', onMediaChange);
});

watchEffect(() => {
  const dark = store.settings.theme === 'dark' || (store.settings.theme === 'system' && systemDark.value);
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
          <span class="truncate">{{ t('nav.dueShort', { n: dueCount }) }}</span>
        </RouterLink>
        <div class="flex items-center justify-end gap-1 px-2 py-1 font-medium text-amber-700 dark:text-amber-300">
          <AppIcon name="flame" :size="14" />
          <span>{{ t('nav.streakShort', { n: streak }) }}</span>
        </div>
      </div>

      <nav aria-label="Primary" class="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        <div v-for="group in navGroups" :key="group.title" class="space-y-1">
          <p class="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {{ t(group.title) }}
          </p>
          <RouterLink
            v-for="item in group.items"
            :key="item.id"
            :to="item.to"
            class="flex items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors"
            :class="
              isNavActive(item)
                ? 'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
            "
            :aria-current="isNavActive(item) ? 'page' : undefined"
          >
            <AppIcon :name="item.icon" :size="18" />
            <span class="flex-1 truncate">{{ t(item.label) }}</span>
            <span
              v-if="item.badge"
              class="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold"
              :class="
                isNavActive(item)
                  ? 'bg-indigo-700 text-white dark:bg-indigo-500'
                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
              "
            >
              {{ item.badge }}
            </span>
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
          <span>{{ t(`settings.${store.settings.theme}`) }}</span>
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
    <header class="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-3.5 py-1.5 backdrop-blur-sm md:hidden dark:border-slate-800 dark:bg-slate-900/95">
      <RouterLink to="/" class="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-700 text-white dark:bg-indigo-600">
          <AppIcon name="code" :size="17" />
        </span>
        <span class="text-sm sm:text-base">Core Learn</span>
      </RouterLink>
      <div class="flex items-center gap-1.5">
        <RouterLink
          :to="MGS_ROUTE"
          class="inline-flex items-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold transition-colors"
          :class="
            isMgsRoute
              ? 'border-indigo-700 bg-indigo-700 text-white dark:border-indigo-500 dark:bg-indigo-600'
              : 'border-indigo-200 bg-indigo-50/80 text-indigo-800 dark:border-indigo-800/80 dark:bg-indigo-950/60 dark:text-indigo-200'
          "
        >
          <AppIcon name="terminal" :size="14" />
          <span>MGS</span>
        </RouterLink>
        <RouterLink
          to="/practice?mode=revise"
          class="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200"
          :aria-label="t('nav.dueShort', { n: dueCount })"
        >
          <AppIcon name="sparkles" :size="13" class="text-indigo-600 dark:text-indigo-400" />
          <span>{{ dueCount }}</span>
        </RouterLink>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-xl border border-slate-200 px-2.5 text-slate-700 dark:border-slate-700 dark:text-slate-200"
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
      class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-900/95"
    >
      <div class="mx-auto grid max-w-md grid-cols-5 gap-1">
        <RouterLink
          v-for="item in mobilePrimary"
          :key="item.id"
          :to="item.to"
          class="flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-colors"
          :class="
            isNavActive(item) || (item.id === 'focus' && isMgsRoute)
              ? 'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200'
              : 'text-slate-600 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:bg-slate-800/60'
          "
          :aria-current="isNavActive(item) || (item.id === 'focus' && isMgsRoute) ? 'page' : undefined"
        >
          <AppIcon :name="item.icon" :size="18" />
          <span class="max-w-full truncate">{{ t(item.label) }}</span>
        </RouterLink>
        <button
          type="button"
          class="flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-colors"
          :class="
            mobileSecondaryActive || mobileDrawerOpen
              ? 'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200'
              : 'text-slate-600 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:bg-slate-800/60'
          "
          :aria-expanded="mobileDrawerOpen"
          aria-controls="mobile-nav-drawer"
          @click="mobileDrawerOpen = !mobileDrawerOpen"
        >
          <AppIcon :name="mobileDrawerOpen ? 'x' : 'menu'" :size="18" />
          <span class="max-w-full truncate">{{ t('nav.more') }}</span>
        </button>
      </div>
    </nav>

    <!-- Mobile Secondary Drawer -->
    <Transition name="drawer">
      <div
        v-if="mobileDrawerOpen"
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        :aria-label="t('nav.more')"
        class="fixed inset-0 z-40 flex justify-end bg-slate-950/50 backdrop-blur-xs md:hidden"
        @click.self="mobileDrawerOpen = false"
      >
        <div class="drawer-panel flex h-full w-80 max-w-[88vw] flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <!-- Drawer Header -->
          <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-700 text-white dark:bg-indigo-600">
                <AppIcon name="code" :size="15" />
              </span>
              <span>Core Learn</span>
            </div>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              :aria-label="t('nav.close')"
              @click="mobileDrawerOpen = false"
            >
              <AppIcon name="x" :size="18" />
            </button>
          </div>

          <div class="flex-1 space-y-5 overflow-y-auto px-4 py-4">
            <!-- Telemetry Pill -->
            <div class="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-800 dark:bg-slate-950/60">
              <RouterLink
                to="/practice?mode=revise"
                class="flex items-center gap-1.5 rounded-lg px-2.5 font-medium text-indigo-700 hover:bg-white dark:text-indigo-300 dark:hover:bg-slate-900"
              >
                <AppIcon name="sparkles" :size="14" />
                <span class="truncate">{{ t('nav.dueShort', { n: dueCount }) }}</span>
              </RouterLink>
              <div class="flex items-center justify-end gap-1.5 px-2.5 font-medium text-amber-700 dark:text-amber-300">
                <AppIcon name="flame" :size="14" />
                <span>{{ t('nav.streakShort', { n: streak }) }}</span>
              </div>
            </div>

            <!-- Featured MGS Live Coding Shortcut -->
            <RouterLink
              :to="MGS_ROUTE"
              class="flex items-center gap-3 rounded-2xl border p-3.5 transition-colors"
              :class="
                isMgsRoute
                  ? 'border-indigo-700 bg-indigo-700 text-white dark:border-indigo-500 dark:bg-indigo-600'
                  : 'border-indigo-200 bg-indigo-50/70 text-indigo-950 hover:bg-indigo-100/80 dark:border-indigo-800/70 dark:bg-indigo-950/50 dark:text-indigo-100'
              "
            >
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                :class="isMgsRoute ? 'bg-white/20 text-white' : 'bg-indigo-700 text-white dark:bg-indigo-600'"
              >
                <AppIcon name="terminal" :size="18" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-bold">{{ t('nav.mgs') }}</span>
                <span
                  class="block truncate text-xs"
                  :class="isMgsRoute ? 'text-indigo-100' : 'text-indigo-700/80 dark:text-indigo-300'"
                >
                  {{ t('nav.mgsSub') }}
                </span>
              </span>
              <AppIcon name="chevron-right" :size="16" :class="isMgsRoute ? 'text-white' : 'text-indigo-500'" />
            </RouterLink>

            <!-- Secondary Menu Groups -->
            <div v-for="group in mobileDrawerGroups" :key="group.title" class="space-y-1">
              <p class="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {{ t(group.title) }}
              </p>
              <RouterLink
                v-for="item in group.items"
                :key="item.id"
                :to="item.to"
                class="flex items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors"
                :class="
                  isNavActive(item)
                    ? 'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                "
                :aria-current="isNavActive(item) ? 'page' : undefined"
              >
                <AppIcon :name="item.icon" :size="18" />
                <span class="flex-1 truncate">{{ t(item.label) }}</span>
                <AppIcon name="chevron-right" :size="15" class="text-slate-400" />
              </RouterLink>
            </div>
          </div>

          <!-- Drawer Footer -->
          <div class="flex items-center gap-2 border-t border-slate-100 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-slate-800">
            <button
              type="button"
              class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              @click="cycleTheme"
            >
              <AppIcon :name="themeIcon" :size="15" />
              <span>{{ t(`settings.${store.settings.theme}`) }}</span>
            </button>
            <button
              type="button"
              class="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 font-mono text-xs font-semibold uppercase text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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
