<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import WikiQuiz from '../components/WikiQuiz.vue';
import { useStore } from '../composables/useStore.ts';
import { wikiEntries } from '../content/wiki/index.ts';
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

function startQuiz() {
  quizSet.value = quizPool(wikiEntries, store.understood, category.value, includeKnown.value);
  quizRun.value += 1;
  void router.push({ path: '/wiki', query: { mode: 'quiz' } });
}
const open = (id: string) => ({ path: '/wiki', query: { term: id } });
const catLabel = (c: WikiCategory) => t(`wiki.cat.${c}`);
</script>

<template>
  <div class="space-y-4">
    <!-- quiz -->
    <template v-if="quizOn">
      <h1 class="text-2xl font-bold">{{ t('wiki.quiz') }}</h1>
      <WikiQuiz :key="quizRun" :entries="quizSet" @exit="router.push('/wiki')" @again="startQuiz" />
    </template>

    <!-- one entry -->
    <article v-else-if="entry" class="space-y-4" :aria-labelledby="`term-${entry.id}`">
      <RouterLink to="/wiki" class="inline-flex items-center underline">{{ t('wiki.back') }}</RouterLink>
      <header class="space-y-1">
        <p class="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">{{ catLabel(entry.category) }}</p>
        <h1 :id="`term-${entry.id}`" class="text-2xl font-bold">{{ entry.term }}</h1>
      </header>

      <section aria-labelledby="w-meaning">
        <h2 id="w-meaning" class="font-semibold">{{ t('wiki.meaning') }}</h2>
        <p class="mt-1">{{ entry.meaning[lang] }}</p>
      </section>
      <section aria-labelledby="w-analogy" class="rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950">
        <h2 id="w-analogy" class="font-semibold">{{ t('wiki.analogy') }}</h2>
        <p class="mt-1">{{ entry.analogy[lang] }}</p>
      </section>
      <section aria-labelledby="w-points">
        <h2 id="w-points" class="font-semibold">{{ t('wiki.points') }}</h2>
        <ul class="mt-1 list-disc space-y-1 pl-5">
          <li v-for="(k, i) in entry.keyPoints" :key="i">{{ k[lang] }}</li>
        </ul>
      </section>

      <button
        class="w-full rounded px-4 font-semibold"
        :class="store.understood[entry.id] ? 'border-2 border-emerald-700 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100' : 'bg-indigo-700 text-white'"
        :aria-pressed="Boolean(store.understood[entry.id])"
        @click="toggleUnderstood(entry.id)"
      >
        {{ store.understood[entry.id] ? t('wiki.understood') : t('wiki.understand') }}
        <span v-if="store.understood[entry.id]" class="ml-2 text-sm font-normal">({{ t('wiki.unmark') }})</span>
      </button>

      <section v-if="entry.related.length" aria-labelledby="w-related">
        <h2 id="w-related" class="font-semibold">{{ t('wiki.related') }}</h2>
        <ul class="mt-1 flex flex-wrap gap-2">
          <li v-for="r in entry.related" :key="r">
            <RouterLink
              :to="open(r)"
              class="inline-flex items-center rounded-full border border-slate-300 px-4 dark:border-slate-600"
            >
              <span v-if="store.understood[r]" aria-hidden="true" class="mr-1">✓</span>{{ byId.get(r)?.term }}
            </RouterLink>
          </li>
        </ul>
      </section>

      <section v-if="entry.topics?.length" aria-labelledby="w-practice">
        <h2 id="w-practice" class="font-semibold">{{ t('wiki.practice') }}</h2>
        <ul class="mt-1 space-y-1">
          <li v-for="tp in entry.topics" :key="`${tp.track}/${tp.topic}`">
            <RouterLink :to="{ path: '/learn', query: { track: tp.track, topic: tp.topic } }" class="inline-flex items-center text-indigo-700 underline dark:text-indigo-300">
              {{ tp.track }} · {{ tp.topic }}
            </RouterLink>
          </li>
        </ul>
      </section>

      <p v-if="entry.source" class="text-sm text-slate-600 dark:text-slate-300">
        {{ t('card.inspired') }} {{ entry.source.repo }}<template v-if="entry.source.path"> — {{ entry.source.path }}</template>
      </p>
      <a v-if="entry.docsUrl" :href="entry.docsUrl" target="_blank" rel="noopener" class="inline-flex items-center text-indigo-700 underline dark:text-indigo-300">
        {{ t('card.docs') }}
      </a>
    </article>

    <!-- list -->
    <template v-else>
      <div class="space-y-1">
        <h1 class="text-2xl font-bold">{{ t('wiki.title') }}</h1>
        <p class="text-slate-600 dark:text-slate-300">{{ t('wiki.intro') }}</p>
        <p class="text-sm">{{ t('wiki.understoodCount', { done: doneCount, total: wikiEntries.length }) }}</p>
      </div>

      <div>
        <label for="wiki-search" class="block text-sm font-semibold">{{ t('wiki.search') }}</label>
        <input
          id="wiki-search"
          v-model="query"
          type="search"
          autocomplete="off"
          class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-800"
        />
      </div>

      <div role="group" :aria-label="t('wiki.categories')" class="flex flex-wrap gap-2">
        <button
          class="rounded-full border px-4"
          :class="category === null ? 'border-2 border-indigo-700 bg-indigo-50 font-semibold dark:bg-indigo-950' : 'border-slate-300 dark:border-slate-600'"
          :aria-pressed="category === null"
          @click="category = null"
        >
          {{ category === null ? '✓ ' : '' }}{{ t('wiki.all') }}
        </button>
        <button
          v-for="c in WIKI_CATEGORIES"
          :key="c"
          class="rounded-full border px-4"
          :class="category === c ? 'border-2 border-indigo-700 bg-indigo-50 font-semibold dark:bg-indigo-950' : 'border-slate-300 dark:border-slate-600'"
          :aria-pressed="category === c"
          @click="category = c"
        >
          {{ category === c ? '✓ ' : '' }}{{ catLabel(c) }}
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button class="rounded bg-indigo-700 px-4 text-white" @click="startQuiz">{{ t('wiki.quiz') }}</button>
        <label class="flex min-h-[44px] items-center gap-2 text-sm">
          <input v-model="includeKnown" type="checkbox" class="h-5 w-5" />
          {{ t('wiki.includeKnown') }}
        </label>
      </div>

      <p class="text-sm text-slate-600 dark:text-slate-300" role="status">{{ t('wiki.count', { n: results.length }) }}</p>
      <p v-if="!results.length" class="rounded-lg border border-slate-300 p-4 dark:border-slate-600">{{ t('wiki.none') }}</p>
      <ul v-else class="space-y-2">
        <li v-for="e in results" :key="e.id">
          <RouterLink
            :to="open(e.id)"
            class="block rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800"
          >
            <span class="flex items-center gap-2">
              <span class="font-semibold">{{ e.term }}</span>
              <span class="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">{{ catLabel(e.category) }}</span>
              <span v-if="store.understood[e.id]" class="ml-auto text-sm font-semibold">✓ {{ t('wiki.understood').replace('✓ ', '') }}</span>
            </span>
            <span class="mt-1 block text-sm text-slate-700 dark:text-slate-300">{{ e.meaning[lang] }}</span>
          </RouterLink>
        </li>
      </ul>
    </template>
  </div>
</template>
