<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppIcon from '../components/AppIcon.vue';
import FormattedText from '../components/FormattedText.vue';
import WikiQuiz from '../components/WikiQuiz.vue';
import { useStore } from '../composables/useStore.ts';
import { wikiEntries } from '../content/wiki/index.ts';
import { formatTopicLabel } from '../core/curriculum.ts';
import { quizPool, searchWiki, WIKI_CATEGORIES } from '../core/wiki.ts';
import type { WikiCategory, WikiEntry } from '../core/wiki.ts';
import { useT } from '../i18n/index.ts';

const t = useT();
const route = useRoute();
const router = useRouter();
const { store, toggleUnderstood } = useStore();
const lang = computed(() => store.settings.language);

const query = ref('');
const category = ref<WikiCategory | null>(null);
const includeKnown = ref(false);
const quizSet = ref<WikiEntry[]>([]);
const quizRun = ref(0);

const byId = new Map(wikiEntries.map((e) => [e.id, e]));
// The open entry and quiz mode live in the URL so the back button and shared links work.
const entry = computed(() => (typeof route.query.term === 'string' ? byId.get(route.query.term) : undefined));
const quizOn = computed(() => route.query.mode === 'quiz');

const results = computed(() => searchWiki(wikiEntries, query.value, category.value, lang.value));
const doneCount = computed(() => wikiEntries.filter((e) => store.understood[e.id]).length);
const donePct = computed(() => (wikiEntries.length ? Math.round((doneCount.value / wikiEntries.length) * 100) : 0));

function startQuiz() {
  quizSet.value = quizPool(wikiEntries, store.understood, category.value, includeKnown.value);
  quizRun.value += 1;
  void router.push({ path: '/wiki', query: { mode: 'quiz' } });
}
const open = (id: string) => ({ path: '/wiki', query: { term: id } });
const catLabel = (c: WikiCategory) => t(`wiki.cat.${c}`);
</script>

<template>
  <div class="space-y-6">
    <!-- Quiz Mode -->
    <template v-if="quizOn">
      <div class="mx-auto max-w-3xl space-y-4">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">{{ t('wiki.quiz') }}</h1>
        <WikiQuiz :key="quizRun" :entries="quizSet" @exit="router.push('/wiki')" @again="startQuiz" />
      </div>
    </template>

    <!-- Single Wiki Term Reader -->
    <article
      v-else-if="entry"
      class="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-7 dark:border-slate-800 dark:bg-slate-900"
      :aria-labelledby="`term-${entry.id}`"
    >
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
        <RouterLink
          to="/wiki"
          class="inline-flex items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
        >
          <AppIcon name="chevron-left" :size="16" />
          <span>{{ t('wiki.back') }}</span>
        </RouterLink>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {{ catLabel(entry.category) }}
        </span>
      </div>

      <header class="space-y-1">
        <h1 :id="`term-${entry.id}`" class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
          {{ entry.term }}
        </h1>
      </header>

      <section aria-labelledby="w-meaning" class="space-y-2">
        <h2 id="w-meaning" class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t('wiki.meaning') }}
        </h2>
        <div class="text-slate-800 dark:text-slate-100">
          <FormattedText :text="entry.meaning[lang]" />
        </div>
      </section>

      <section
        aria-labelledby="w-analogy"
        class="rounded-xl border border-amber-200 border-l-4 border-l-amber-500 bg-amber-50/70 p-4 dark:border-amber-800/60 dark:border-l-amber-400 dark:bg-amber-950/30"
      >
        <h2 id="w-analogy" class="flex items-center gap-2 font-semibold text-amber-950 dark:text-amber-200">
          <AppIcon name="lightbulb" :size="17" class="text-amber-600 dark:text-amber-400" />
          <span>{{ t('wiki.analogy') }}</span>
        </h2>
        <div class="mt-2 text-slate-800 dark:text-slate-200">
          <FormattedText :text="entry.analogy[lang]" />
        </div>
      </section>

      <section aria-labelledby="w-points" class="space-y-2.5">
        <h2 id="w-points" class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t('wiki.points') }}
        </h2>
        <ul class="space-y-2">
          <li
            v-for="(k, i) in entry.keyPoints"
            :key="i"
            class="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50"
          >
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-mono text-xs font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
              {{ i + 1 }}
            </span>
            <div class="min-w-0 flex-1 text-slate-800 dark:text-slate-200">
              <FormattedText :text="k[lang]" />
            </div>
          </li>
        </ul>
      </section>

      <button
        type="button"
        class="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-colors"
        :class="
          store.understood[entry.id]
            ? 'border-2 border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-100'
            : 'bg-indigo-700 text-white hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500'
        "
        :aria-pressed="Boolean(store.understood[entry.id])"
        @click="toggleUnderstood(entry.id)"
      >
        <AppIcon v-if="store.understood[entry.id]" name="check" :size="18" />
        <span>{{ store.understood[entry.id] ? t('wiki.understood') : t('wiki.understand') }}</span>
        <span v-if="store.understood[entry.id]" class="text-xs font-normal opacity-80">({{ t('wiki.unmark') }})</span>
      </button>

      <section v-if="entry.related.length" aria-labelledby="w-related" class="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <h2 id="w-related" class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t('wiki.related') }}
        </h2>
        <ul class="flex flex-wrap gap-2">
          <li v-for="r in entry.related" :key="r">
            <RouterLink
              :to="open(r)"
              class="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-3.5 text-sm font-medium text-slate-800 transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <AppIcon v-if="store.understood[r]" name="check" :size="14" class="text-emerald-600 dark:text-emerald-400" />
              <span>{{ byId.get(r)?.term }}</span>
            </RouterLink>
          </li>
        </ul>
      </section>

      <section v-if="entry.topics?.length" aria-labelledby="w-practice" class="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <h2 id="w-practice" class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t('wiki.practice') }}
        </h2>
        <ul class="flex flex-wrap gap-2">
          <li v-for="tp in entry.topics" :key="`${tp.track}/${tp.topic}`">
            <RouterLink
              :to="{ path: '/learn', query: { track: tp.track, topic: tp.topic } }"
              class="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 text-sm font-semibold text-indigo-800 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200"
            >
              <AppIcon name="play" :size="14" />
              <span>{{ t(`track.${tp.track}`) }} · {{ formatTopicLabel(tp.topic) }}</span>
            </RouterLink>
          </li>
        </ul>
      </section>

      <div v-if="entry.source || entry.docsUrl" class="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
        <span v-if="entry.source" class="rounded-md bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
          {{ t('card.inspired') }} {{ entry.source.repo }}<template v-if="entry.source.path"> — {{ entry.source.path }}</template>
        </span>
        <a
          v-if="entry.docsUrl"
          :href="entry.docsUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1 font-medium text-indigo-700 underline dark:text-indigo-300"
        >
          <span>{{ t('card.docs') }}</span>
          <AppIcon name="external-link" :size="13" />
        </a>
      </div>
    </article>

    <!-- Wiki Directory -->
    <template v-else>
      <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div class="space-y-1">
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">{{ t('wiki.title') }}</h1>
          <p class="max-w-[60ch] text-sm text-slate-600 sm:text-base dark:text-slate-300">{{ t('wiki.intro') }}</p>
        </div>
        <div class="min-w-48 space-y-1.5 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span>{{ t('wiki.understoodCount', { done: doneCount, total: wikiEntries.length }) }}</span>
            <span class="font-mono text-indigo-700 dark:text-indigo-300">{{ donePct }}%</span>
          </div>
          <div class="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
            <div class="h-full rounded-full bg-emerald-600 dark:bg-emerald-400" :style="{ width: `${donePct}%` }" />
          </div>
        </div>
      </header>

      <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <label for="wiki-search" class="sr-only">{{ t('wiki.search') }}</label>
          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
              <AppIcon name="search" :size="17" />
            </span>
            <input
              id="wiki-search"
              v-model="query"
              type="search"
              autocomplete="off"
              :placeholder="t('wiki.search')"
              class="min-h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
        </div>

        <div role="group" :aria-label="t('wiki.categories')" class="flex flex-wrap gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors"
            :class="category === null ? 'border-indigo-700 bg-indigo-700 text-white dark:border-indigo-500 dark:bg-indigo-600' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'"
            :aria-pressed="category === null"
            @click="category = null"
          >
            <AppIcon v-if="category === null" name="check" :size="13" />
            <span>{{ t('wiki.all') }}</span>
          </button>
          <button
            v-for="c in WIKI_CATEGORIES"
            :key="c"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors"
            :class="category === c ? 'border-indigo-700 bg-indigo-700 text-white dark:border-indigo-500 dark:bg-indigo-600' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'"
            :aria-pressed="category === c"
            @click="category = c"
          >
            <AppIcon v-if="category === c" name="check" :size="13" />
            <span>{{ catLabel(c) }}</span>
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-4 text-sm font-semibold text-white hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              @click="startQuiz"
            >
              <AppIcon name="play" :size="15" />
              <span>{{ t('wiki.quiz') }}</span>
            </button>
            <label class="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input v-model="includeKnown" type="checkbox" class="size-5 rounded accent-indigo-700" />
              <span>{{ t('wiki.includeKnown') }}</span>
            </label>
          </div>
          <p class="text-xs font-medium text-slate-600 dark:text-slate-300" role="status">{{ t('wiki.count', { n: results.length }) }}</p>
        </div>
      </section>

      <p v-if="!results.length" class="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        {{ t('wiki.none') }}
      </p>

      <ul v-else class="grid gap-3 sm:grid-cols-2">
        <li v-for="e in results" :key="e.id">
          <RouterLink
            :to="open(e.id)"
            class="group flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500"
          >
            <div>
              <div class="flex items-start justify-between gap-2">
                <span class="font-bold text-slate-900 group-hover:text-indigo-700 dark:text-slate-50 dark:group-hover:text-indigo-300">
                  {{ e.term }}
                </span>
                <span
                  v-if="store.understood[e.id]"
                  class="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200"
                >
                  <AppIcon name="check" :size="12" />
                  {{ t('wiki.understood') }}
                </span>
              </div>
              <p class="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{{ e.meaning[lang] }}</p>
            </div>
            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {{ catLabel(e.category) }}
            </span>
          </RouterLink>
        </li>
      </ul>
    </template>
  </div>
</template>
