<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from '../composables/useStore.ts';
import { cvItems } from '../content/mycv/index.ts';
import { wikiEntries } from '../content/wiki/index.ts';
import { CV_SECTIONS, cvKey } from '../core/mycv.ts';
import { useT } from '../i18n/index.ts';

const t = useT();
const route = useRoute();
const { store, toggleUnderstood } = useStore();
const lang = computed(() => store.settings.language);

const wikiById = new Map(wikiEntries.map((e) => [e.id, e]));
const item = computed(() => (typeof route.query.item === 'string' ? cvItems.find((i) => i.id === route.query.item) : undefined));
const shown = ref<Set<number>>(new Set());

const explained = (id: string) => Boolean(store.understood[cvKey(id)]);
const doneCount = computed(() => cvItems.filter((i) => explained(i.id)).length);
const termsDone = (ids: string[]) => ids.filter((w) => store.understood[w]).length;
const toggleAnswer = (i: number) => {
  const next = new Set(shown.value);
  if (!next.delete(i)) next.add(i);
  shown.value = next;
};
</script>

<template>
  <div class="space-y-4">
    <!-- one CV point -->
    <article v-if="item" :key="item.id" class="space-y-4" :aria-labelledby="`cv-${item.id}`">
      <RouterLink to="/mycv" class="inline-flex items-center underline">{{ t('mycv.back') }}</RouterLink>
      <h1 :id="`cv-${item.id}`" class="text-2xl font-bold">{{ item.title[lang] }}</h1>

      <section aria-labelledby="c-says" class="rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800">
        <h2 id="c-says" class="font-semibold">{{ t('mycv.cvSays') }}</h2>
        <p class="mt-1">{{ item.cv[lang] }}</p>
      </section>
      <section aria-labelledby="c-tell" class="rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950">
        <h2 id="c-tell" class="font-semibold">{{ t('mycv.tellIt') }}</h2>
        <p class="mt-1">{{ item.tellIt[lang] }}</p>
      </section>

      <section v-if="item.wiki.length" aria-labelledby="c-wiki">
        <h2 id="c-wiki" class="font-semibold">
          {{ t('mycv.learnFirst') }}
          <span class="text-sm font-normal text-slate-600 dark:text-slate-300">· {{ t('mycv.terms', { done: termsDone(item.wiki), total: item.wiki.length }) }}</span>
        </h2>
        <ul class="mt-1 flex flex-wrap gap-2">
          <li v-for="w in item.wiki" :key="w">
            <RouterLink
              :to="{ path: '/wiki', query: { term: w } }"
              class="inline-flex items-center rounded-full border border-slate-300 px-4 dark:border-slate-600"
            >
              <span v-if="store.understood[w]" aria-hidden="true" class="mr-1">✓</span>{{ wikiById.get(w)?.term }}
            </RouterLink>
          </li>
        </ul>
      </section>

      <section v-if="item.topics.length" aria-labelledby="c-practice">
        <h2 id="c-practice" class="font-semibold">{{ t('wiki.practice') }}</h2>
        <ul class="mt-1 space-y-1">
          <li v-for="tp in item.topics" :key="`${tp.track}/${tp.topic}`">
            <RouterLink :to="{ path: '/learn', query: { track: tp.track, topic: tp.topic } }" class="inline-flex items-center text-indigo-700 underline dark:text-indigo-300">
              {{ tp.track }} · {{ tp.topic }}
            </RouterLink>
          </li>
        </ul>
      </section>

      <section aria-labelledby="c-q" class="space-y-2">
        <h2 id="c-q" class="font-semibold">{{ t('mycv.questions') }}</h2>
        <div v-for="(q, i) in item.questions" :key="i" class="space-y-2 rounded-lg border border-slate-300 p-3 dark:border-slate-600">
          <p class="font-semibold">{{ q.q[lang] }}</p>
          <button class="w-full rounded border border-slate-400 px-4" :aria-expanded="shown.has(i)" @click="toggleAnswer(i)">
            {{ shown.has(i) ? t('mycv.hide') : t('mycv.show') }}
          </button>
          <p v-if="shown.has(i)" class="rounded bg-slate-100 p-3 dark:bg-slate-800">{{ q.a[lang] }}</p>
        </div>
      </section>

      <button
        class="w-full rounded px-4 font-semibold"
        :class="explained(item.id) ? 'border-2 border-emerald-700 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100' : 'bg-indigo-700 text-white'"
        :aria-pressed="explained(item.id)"
        @click="toggleUnderstood(cvKey(item.id))"
      >
        {{ explained(item.id) ? t('mycv.explained') : t('mycv.explain') }}
      </button>
    </article>

    <!-- overview -->
    <template v-else>
      <div class="space-y-1">
        <h1 class="text-2xl font-bold">{{ t('mycv.title') }}</h1>
        <p class="text-slate-600 dark:text-slate-300">{{ t('mycv.intro') }}</p>
        <p class="text-sm">{{ t('mycv.progress', { done: doneCount, total: cvItems.length }) }}</p>
      </div>
      <section v-for="s in CV_SECTIONS" :key="s" :aria-labelledby="`sec-${s}`" class="space-y-2">
        <h2 :id="`sec-${s}`" class="text-lg font-semibold">{{ t(`mycv.sec.${s}`) }}</h2>
        <ul class="space-y-2">
          <li v-for="i in cvItems.filter((x) => x.section === s)" :key="i.id">
            <RouterLink
              :to="{ path: '/mycv', query: { item: i.id } }"
              class="block rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800"
            >
              <span class="flex items-center gap-2">
                <span class="font-semibold">{{ i.title[lang] }}</span>
                <span v-if="explained(i.id)" class="ml-auto shrink-0 text-sm font-semibold">✓</span>
              </span>
              <span class="mt-1 block text-sm text-slate-700 dark:text-slate-300">
                {{ t('mycv.terms', { done: termsDone(i.wiki), total: i.wiki.length }) }} · {{ i.questions.length }} Q
              </span>
            </RouterLink>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
