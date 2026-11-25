<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppIcon from '../components/AppIcon.vue';
import FormattedText from '../components/FormattedText.vue';
import { useStore } from '../composables/useStore.ts';
import { cvItems } from '../content/mycv/index.ts';
import { wikiEntries } from '../content/wiki/index.ts';
import { formatTopicLabel } from '../core/curriculum.ts';
import { CV_SECTIONS, cvKey } from '../core/mycv.ts';
import { useT } from '../i18n/index.ts';

const t = useT();
const route = useRoute();
const { store, toggleUnderstood } = useStore();
const lang = computed(() => store.settings.language);

const wikiById = new Map(wikiEntries.map((e) => [e.id, e]));
const item = computed(() => (typeof route.query.item === 'string' ? cvItems.find((i) => i.id === route.query.item) : undefined));
const shown = ref<Set<number>>(new Set());

watch(() => item.value?.id, () => {
  shown.value = new Set();
});

const explained = (id: string) => Boolean(store.understood[cvKey(id)]);
const doneCount = computed(() => cvItems.filter((i) => explained(i.id)).length);
const donePct = computed(() => (cvItems.length ? Math.round((doneCount.value / cvItems.length) * 100) : 0));
const termsDone = (ids: string[]) => ids.filter((w) => store.understood[w]).length;
const toggleAnswer = (i: number) => {
  const next = new Set(shown.value);
  if (!next.delete(i)) next.add(i);
  shown.value = next;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Single CV Point -->
    <article
      v-if="item"
      :key="item.id"
      class="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-7 dark:border-slate-800 dark:bg-slate-900"
      :aria-labelledby="`cv-${item.id}`"
    >
      <div class="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <RouterLink
          to="/mycv"
          class="inline-flex items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
        >
          <AppIcon name="chevron-left" :size="16" />
          <span>{{ t('mycv.back') }}</span>
        </RouterLink>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {{ t(`mycv.sec.${item.section}`) }}
        </span>
      </div>

      <h1 :id="`cv-${item.id}`" class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
        {{ item.title[lang] }}
      </h1>

      <section aria-labelledby="c-says" class="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50">
        <h2 id="c-says" class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('mycv.cvSays') }}</h2>
        <div class="mt-2 text-slate-800 dark:text-slate-100">
          <FormattedText :text="item.cv[lang]" />
        </div>
      </section>

      <section
        aria-labelledby="c-tell"
        class="rounded-xl border border-amber-200 border-l-4 border-l-amber-500 bg-amber-50/70 p-4 dark:border-amber-800/60 dark:border-l-amber-400 dark:bg-amber-950/30"
      >
        <h2 id="c-tell" class="flex items-center gap-2 font-semibold text-amber-950 dark:text-amber-200">
          <AppIcon name="lightbulb" :size="17" class="text-amber-600 dark:text-amber-400" />
          <span>{{ t('mycv.tellIt') }}</span>
        </h2>
        <div class="mt-2 text-slate-800 dark:text-slate-200">
          <FormattedText :text="item.tellIt[lang]" />
        </div>
      </section>

      <section v-if="item.wiki.length" aria-labelledby="c-wiki" class="space-y-2.5">
        <h2 id="c-wiki" class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t('mycv.learnFirst') }}
          <span class="font-mono text-xs font-normal">· {{ t('mycv.terms', { done: termsDone(item.wiki), total: item.wiki.length }) }}</span>
        </h2>
        <ul class="flex flex-wrap gap-2">
          <li v-for="w in item.wiki" :key="w">
            <RouterLink
              :to="{ path: '/wiki', query: { term: w } }"
              class="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-3.5 text-sm font-medium text-slate-800 transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <AppIcon v-if="store.understood[w]" name="check" :size="14" class="text-emerald-600 dark:text-emerald-400" />
              <span>{{ wikiById.get(w)?.term }}</span>
            </RouterLink>
          </li>
        </ul>
      </section>

      <section v-if="item.topics.length" aria-labelledby="c-practice" class="space-y-2.5">
        <h2 id="c-practice" class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t('wiki.practice') }}
        </h2>
        <ul class="flex flex-wrap gap-2">
          <li v-for="tp in item.topics" :key="`${tp.track}/${tp.topic}`">
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

      <section aria-labelledby="c-q" class="space-y-3">
        <h2 id="c-q" class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('mycv.questions') }}</h2>
        <div v-for="(q, i) in item.questions" :key="i" class="space-y-2.5 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <p class="font-semibold text-slate-900 dark:text-slate-100">{{ q.q[lang] }}</p>
          <button
            type="button"
            class="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            :aria-expanded="shown.has(i)"
            @click="toggleAnswer(i)"
          >
            <AppIcon name="chevron-down" :size="15" class="transition-transform" :class="shown.has(i) ? 'rotate-180' : ''" />
            <span>{{ shown.has(i) ? t('mycv.hide') : t('mycv.show') }}</span>
          </button>
          <Transition name="panel">
            <div v-if="shown.has(i)" class="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950/70">
              <FormattedText :text="q.a[lang]" />
            </div>
          </Transition>
        </div>
      </section>

      <button
        type="button"
        class="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-colors"
        :class="
          explained(item.id)
            ? 'border-2 border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-100'
            : 'bg-indigo-700 text-white hover:bg-indigo-800 dark:bg-indigo-600'
        "
        :aria-pressed="explained(item.id)"
        @click="toggleUnderstood(cvKey(item.id))"
      >
        <AppIcon v-if="explained(item.id)" name="check" :size="18" />
        <span>{{ explained(item.id) ? t('mycv.explained') : t('mycv.explain') }}</span>
      </button>
    </article>

    <!-- Overview -->
    <template v-else>
      <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div class="space-y-1">
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">{{ t('mycv.title') }}</h1>
          <p class="max-w-[60ch] text-sm text-slate-600 sm:text-base dark:text-slate-300">{{ t('mycv.intro') }}</p>
        </div>
        <div class="min-w-48 space-y-1.5 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span>{{ t('mycv.progress', { done: doneCount, total: cvItems.length }) }}</span>
            <span class="font-mono text-indigo-700 dark:text-indigo-300">{{ donePct }}%</span>
          </div>
          <div class="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
            <div class="h-full rounded-full bg-emerald-600 dark:bg-emerald-400" :style="{ width: `${donePct}%` }" />
          </div>
        </div>
      </header>

      <section v-for="s in CV_SECTIONS" :key="s" :aria-labelledby="`sec-${s}`" class="space-y-3">
        <h2 :id="`sec-${s}`" class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t(`mycv.sec.${s}`) }}
        </h2>
        <ul class="grid gap-3 sm:grid-cols-2">
          <li v-for="i in cvItems.filter((x) => x.section === s)" :key="i.id">
            <RouterLink
              :to="{ path: '/mycv', query: { item: i.id } }"
              class="group flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500"
            >
              <div class="flex items-start justify-between gap-2">
                <span class="font-bold text-slate-900 group-hover:text-indigo-700 dark:text-slate-50 dark:group-hover:text-indigo-300">
                  {{ i.title[lang] }}
                </span>
                <span
                  v-if="explained(i.id)"
                  class="inline-flex shrink-0 items-center rounded-full bg-emerald-50 p-1 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                >
                  <AppIcon name="check" :size="14" />
                </span>
              </div>
              <span class="text-xs font-medium text-slate-600 dark:text-slate-300">
                {{ t('mycv.terms', { done: termsDone(i.wiki), total: i.wiki.length }) }} · {{ i.questions.length }} Q
              </span>
            </RouterLink>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
