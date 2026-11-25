<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import AppIcon from '../components/AppIcon.vue';
import FormattedText from '../components/FormattedText.vue';
import SwipeDeck from '../components/SwipeDeck.vue';
import { useStore } from '../composables/useStore.ts';
import { focusProjects } from '../content/focus/index.ts';
import { focusCards, focusKey, focusQuestions } from '../core/focus.ts';
import { useT } from '../i18n/index.ts';

type SimQuestion = ReturnType<typeof focusQuestions>[number];

const t = useT();
const route = useRoute();
const { store, toggleUnderstood } = useStore();
const lang = computed(() => store.settings.language);

const topic = computed(() => (typeof route.query.item === 'string' ? focusProjects.flatMap((p) => p.topics).find((x) => x.id === route.query.item) : undefined));
const project = computed(
  () => focusProjects.find((p) => (topic.value ? p.topics.includes(topic.value) : p.id === route.query.project)) ?? focusProjects[0]!,
);
const focusTopics = computed(() => project.value.topics);
const repoName = computed(() => project.value.repo.replace('https://github.com/', ''));
const shown = ref<Set<number>>(new Set());
const explained = (id: string) => Boolean(store.understood[focusKey(id)]);
const doneCount = computed(() => focusTopics.value.filter((x) => explained(x.id)).length);
const donePct = computed(() => (focusTopics.value.length ? Math.round((doneCount.value / focusTopics.value.length) * 100) : 0));
const toggleAnswer = (i: number) => {
  const next = new Set(shown.value);
  if (!next.delete(i)) next.add(i);
  shown.value = next;
};

const allQuestions = computed(() => focusQuestions(focusTopics.value));
const deckOpen = ref(false);
const queue = ref<SimQuestion[] | null>(null);
const at = ref(0);
const revealed = ref(false);
const draft = ref('');
const weak = ref<SimQuestion[]>([]);
const current = computed(() => queue.value?.[at.value]);

function startSim(questions: SimQuestion[]) {
  queue.value = questions;
  at.value = 0;
  revealed.value = false;
  draft.value = '';
  weak.value = [];
}
function rate(ok: boolean) {
  if (!ok && current.value) weak.value.push(current.value);
  at.value++;
  revealed.value = false;
  draft.value = '';
}
</script>

<template>
  <div class="space-y-6">
    <SwipeDeck v-if="deckOpen" :key="project.id" :cards="focusCards(focusTopics)" :lang="lang" @exit="deckOpen = false" />

    <!-- Interview Simulation -->
    <section
      v-else-if="queue"
      class="mx-auto max-w-3xl space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6 dark:border-slate-800 dark:bg-slate-900"
      aria-labelledby="sim-title"
    >
      <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <h1 id="sim-title" class="text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-50">{{ t('focus.sim') }}</h1>
        <button
          type="button"
          class="rounded-xl border border-slate-300 px-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          @click="queue = null"
        >
          {{ t('focus.simExit') }}
        </button>
      </div>

      <template v-if="current">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {{ t('focus.simProgress', { n: at + 1, total: queue.length }) }} · {{ current.topic[lang] }}
          </p>
          <div class="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
            <div class="h-full origin-left rounded-full bg-indigo-600 transition-transform duration-300" :style="{ transform: `scaleX(${at / queue.length})` }" />
          </div>
        </div>

        <p class="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-50">
          {{ current.q[lang] }}
        </p>

        <label class="block space-y-1.5">
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('focus.simDraft') }}</span>
          <textarea
            v-model="draft"
            rows="4"
            class="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
          />
        </label>

        <button
          v-if="!revealed"
          type="button"
          class="w-full rounded-xl bg-indigo-700 px-4 py-3 font-semibold text-white hover:bg-indigo-800 dark:bg-indigo-600"
          @click="revealed = true"
        >
          {{ t('mycv.show') }}
        </button>

        <Transition name="panel">
          <div v-if="revealed" class="space-y-4">
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/70">
              <FormattedText :text="current.a[lang]" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                @click="rate(false)"
              >
                <AppIcon name="rotate-ccw" :size="16" />
                <span>{{ t('focus.simWeak') }}</span>
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600"
                @click="rate(true)"
              >
                <AppIcon name="check" :size="16" />
                <span>{{ t('focus.simOk') }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </template>

      <template v-else>
        <p class="text-lg font-bold text-slate-900 dark:text-slate-50" role="status">
          {{ t('focus.simScore', { ok: queue.length - weak.length, total: queue.length }) }}
        </p>
        <div v-if="weak.length" class="space-y-3">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('focus.simReview') }}</h2>
          <div v-for="q in weak" :key="q.q.en" class="space-y-2 rounded-xl border border-rose-200 bg-rose-50/40 p-4 dark:border-rose-900/60 dark:bg-rose-950/20">
            <p class="font-semibold text-slate-900 dark:text-slate-100">{{ q.q[lang] }}</p>
            <FormattedText :text="q.a[lang]" />
          </div>
          <button
            type="button"
            class="w-full rounded-xl bg-indigo-700 px-4 py-3 font-semibold text-white hover:bg-indigo-800 dark:bg-indigo-600"
            @click="startSim([...weak])"
          >
            {{ t('focus.simRetryWeak') }}
          </button>
        </div>
        <button
          type="button"
          class="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          @click="startSim(allQuestions)"
        >
          {{ t('focus.simRestart') }}
        </button>
      </template>
    </section>

    <!-- Single Focus Topic -->
    <article
      v-else-if="topic"
      :key="topic.id"
      class="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-7 dark:border-slate-800 dark:bg-slate-900"
      :aria-labelledby="`f-${topic.id}`"
    >
      <RouterLink
        :to="{ path: '/focus', query: { project: project.id } }"
        class="inline-flex items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
      >
        <AppIcon name="chevron-left" :size="16" />
        <span>{{ t('focus.back') }}</span>
      </RouterLink>

      <h1 :id="`f-${topic.id}`" class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
        {{ topic.title[lang] }}
      </h1>

      <section aria-labelledby="f-what" class="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50">
        <h2 id="f-what" class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('focus.what') }}</h2>
        <div class="mt-2 text-slate-800 dark:text-slate-100">
          <FormattedText :text="topic.what[lang]" />
        </div>
      </section>

      <section
        v-if="topic.why"
        aria-labelledby="f-why"
        class="rounded-xl border border-sky-200 border-l-4 border-l-sky-500 bg-sky-50/70 p-4 dark:border-sky-800/60 dark:border-l-sky-400 dark:bg-sky-950/30"
      >
        <h2 id="f-why" class="font-semibold text-sky-950 dark:text-sky-200">{{ t('focus.why') }}</h2>
        <div class="mt-2 text-slate-800 dark:text-slate-200">
          <FormattedText :text="topic.why[lang]" />
        </div>
      </section>

      <section
        aria-labelledby="f-tell"
        class="rounded-xl border border-amber-200 border-l-4 border-l-amber-500 bg-amber-50/70 p-4 dark:border-amber-800/60 dark:border-l-amber-400 dark:bg-amber-950/30"
      >
        <h2 id="f-tell" class="flex items-center gap-2 font-semibold text-amber-950 dark:text-amber-200">
          <AppIcon name="lightbulb" :size="17" class="text-amber-600 dark:text-amber-400" />
          <span>{{ t('mycv.tellIt') }}</span>
        </h2>
        <div class="mt-2 text-slate-800 dark:text-slate-200">
          <FormattedText :text="topic.tellIt[lang]" />
        </div>
      </section>

      <section v-if="topic.flow?.length" aria-labelledby="f-flow" class="space-y-3">
        <h2 id="f-flow" class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('focus.flow') }}</h2>
        <ol class="relative space-y-3 before:absolute before:bottom-3 before:left-3.5 before:top-3 before:w-px before:bg-indigo-200 dark:before:bg-indigo-900">
          <li v-for="(step, i) in topic.flow" :key="i" class="relative flex items-start gap-3 pl-0">
            <span class="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-700 font-mono text-xs font-bold text-white dark:bg-indigo-600" aria-hidden="true">
              {{ i + 1 }}
            </span>
            <div class="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-950/50">
              <FormattedText :text="step[lang]" />
            </div>
          </li>
        </ol>
      </section>

      <section v-if="topic.code.length" aria-labelledby="f-code" class="space-y-2">
        <h2 id="f-code" class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('focus.code') }}</h2>
        <ul class="flex flex-wrap gap-2">
          <li v-for="p in topic.code" :key="p">
            <a
              :href="`${project.repo}/blob/main/${p}`"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-1.5 break-all rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300"
            >
              <AppIcon name="code" :size="14" />
              <span>{{ p }}</span>
              <AppIcon name="external-link" :size="12" />
            </a>
          </li>
        </ul>
      </section>

      <section aria-labelledby="f-q" class="space-y-3">
        <h2 id="f-q" class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('mycv.questions') }}</h2>
        <div v-for="(q, i) in topic.questions" :key="i" class="space-y-2.5 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
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
          explained(topic.id)
            ? 'border-2 border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-100'
            : 'bg-indigo-700 text-white hover:bg-indigo-800 dark:bg-indigo-600'
        "
        :aria-pressed="explained(topic.id)"
        @click="toggleUnderstood(focusKey(topic.id))"
      >
        <AppIcon v-if="explained(topic.id)" name="check" :size="18" />
        <span>{{ explained(topic.id) ? t('mycv.explained') : t('mycv.explain') }}</span>
      </button>
    </article>

    <!-- Focus Overview -->
    <template v-else>
      <nav :aria-label="t('focus.projects')" class="flex flex-wrap gap-2">
        <RouterLink
          v-for="p in focusProjects"
          :key="p.id"
          :to="{ path: '/focus', query: { project: p.id } }"
          class="inline-flex min-w-32 flex-1 items-center justify-center whitespace-nowrap rounded-xl border px-4 text-center text-sm font-semibold transition-colors"
          :class="
            p.id === project.id
              ? 'border-indigo-700 bg-indigo-700 text-white dark:border-indigo-500 dark:bg-indigo-600'
              : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
          "
          :aria-current="p.id === project.id ? 'page' : undefined"
        >
          {{ p.title[lang] }}
        </RouterLink>
      </nav>

      <header class="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:flex-row sm:items-end dark:border-slate-800 dark:bg-slate-900">
        <div class="space-y-1.5">
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
            {{ t('focus.title', { project: project.title[lang] }) }}
          </h1>
          <p class="max-w-[60ch] text-sm text-slate-600 sm:text-base dark:text-slate-300">{{ project.intro[lang] }}</p>
          <a
            :href="project.repo"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-1.5 break-all font-mono text-xs text-indigo-700 underline dark:text-indigo-300"
          >
            <span>{{ repoName }}</span>
            <AppIcon name="external-link" :size="12" />
          </a>
        </div>

        <div class="min-w-48 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span>{{ t('focus.progress', { done: doneCount, total: focusTopics.length }) }}</span>
            <span class="font-mono text-indigo-700 dark:text-indigo-300">{{ donePct }}%</span>
          </div>
          <div class="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" aria-hidden="true">
            <div class="h-full rounded-full bg-emerald-600 dark:bg-emerald-400" :style="{ width: `${donePct}%` }" />
          </div>
        </div>
      </header>

      <div class="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 font-semibold text-white shadow-xs transition-colors hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          @click="startSim(allQuestions)"
        >
          <AppIcon name="play" :size="17" />
          <span>{{ t('focus.simStart', { total: allQuestions.length }) }}</span>
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-700 bg-white px-4 py-3 font-semibold text-indigo-800 transition-colors hover:bg-indigo-50 dark:border-indigo-500 dark:bg-slate-900 dark:text-indigo-200 dark:hover:bg-indigo-950/40"
          @click="deckOpen = true"
        >
          <AppIcon name="layers" :size="17" />
          <span>{{ t('focus.deckStart', { total: focusCards(focusTopics).length }) }}</span>
        </button>
      </div>

      <ul class="grid gap-3 sm:grid-cols-2">
        <li v-for="x in focusTopics" :key="x.id">
          <RouterLink
            :to="{ path: '/focus', query: { item: x.id } }"
            class="group flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500"
          >
            <div class="flex items-start justify-between gap-2">
              <span class="font-bold text-slate-900 group-hover:text-indigo-700 dark:text-slate-50 dark:group-hover:text-indigo-300">
                {{ x.title[lang] }}
              </span>
              <span
                v-if="explained(x.id)"
                class="inline-flex shrink-0 items-center rounded-full bg-emerald-50 p-1 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
              >
                <AppIcon name="check" :size="14" />
              </span>
            </div>
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">
              {{ x.questions.length }} Q<template v-if="x.flow?.length"> · {{ t('focus.flow') }}</template>
            </span>
          </RouterLink>
        </li>
      </ul>
    </template>
  </div>
</template>
