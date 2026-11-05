<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from '../composables/useStore.ts';
import { focusTopics } from '../content/focus/index.ts';
import { FOCUS_REPO, focusKey, focusQuestions } from '../core/focus.ts';
import { useT } from '../i18n/index.ts';

type SimQuestion = ReturnType<typeof focusQuestions>[number];

const t = useT();
const route = useRoute();
const { store, toggleUnderstood } = useStore();
const lang = computed(() => store.settings.language);

const topic = computed(() => (typeof route.query.item === 'string' ? focusTopics.find((x) => x.id === route.query.item) : undefined));
const shown = ref<Set<number>>(new Set());
const explained = (id: string) => Boolean(store.understood[focusKey(id)]);
const doneCount = computed(() => focusTopics.filter((x) => explained(x.id)).length);
const toggleAnswer = (i: number) => {
  const next = new Set(shown.value);
  if (!next.delete(i)) next.add(i);
  shown.value = next;
};

// Interview simulation. shortcut: a session and its typed drafts live in memory only, persist them if reviewing past attempts is wanted.
const allQuestions = focusQuestions(focusTopics);
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
  <div class="space-y-4">
    <!-- interview simulation -->
    <section v-if="queue" class="space-y-4" aria-labelledby="sim-title">
      <div class="flex items-center gap-2">
        <h1 id="sim-title" class="flex-1 text-2xl font-bold">{{ t('focus.sim') }}</h1>
        <button class="rounded border border-slate-400 px-4" @click="queue = null">{{ t('focus.simExit') }}</button>
      </div>

      <template v-if="current">
        <p class="text-sm text-slate-600 dark:text-slate-300">
          {{ t('focus.simProgress', { n: at + 1, total: queue.length }) }} · {{ current.topic[lang] }}
        </p>
        <p class="rounded-lg border border-slate-300 bg-white p-3 text-lg font-semibold dark:border-slate-600 dark:bg-slate-800">{{ current.q[lang] }}</p>
        <label class="block">
          <span class="text-sm">{{ t('focus.simDraft') }}</span>
          <textarea v-model="draft" rows="4" class="mt-1 w-full rounded border border-slate-400 bg-white p-2 dark:bg-slate-800" />
        </label>
        <button v-if="!revealed" class="w-full rounded bg-indigo-700 px-4 font-semibold text-white" @click="revealed = true">{{ t('mycv.show') }}</button>
        <template v-else>
          <p class="rounded bg-slate-100 p-3 dark:bg-slate-800">{{ current.a[lang] }}</p>
          <div class="flex gap-2">
            <button class="flex-1 rounded border border-slate-400 px-4" @click="rate(false)">{{ t('focus.simWeak') }}</button>
            <button class="flex-1 rounded bg-indigo-700 px-4 font-semibold text-white" @click="rate(true)">{{ t('focus.simOk') }}</button>
          </div>
        </template>
      </template>

      <template v-else>
        <p class="text-lg font-semibold" role="status">{{ t('focus.simScore', { ok: queue.length - weak.length, total: queue.length }) }}</p>
        <div v-if="weak.length" class="space-y-2">
          <h2 class="font-semibold">{{ t('focus.simReview') }}</h2>
          <div v-for="q in weak" :key="q.q.en" class="space-y-2 rounded-lg border border-slate-300 p-3 dark:border-slate-600">
            <p class="font-semibold">{{ q.q[lang] }}</p>
            <p class="rounded bg-slate-100 p-3 dark:bg-slate-800">{{ q.a[lang] }}</p>
          </div>
          <button class="w-full rounded bg-indigo-700 px-4 font-semibold text-white" @click="startSim([...weak])">{{ t('focus.simRetryWeak') }}</button>
        </div>
        <button class="w-full rounded border border-slate-400 px-4" @click="startSim(allQuestions)">{{ t('focus.simRestart') }}</button>
      </template>
    </section>

    <!-- one topic -->
    <article v-else-if="topic" :key="topic.id" class="space-y-4" :aria-labelledby="`f-${topic.id}`">
      <RouterLink to="/focus" class="inline-flex items-center underline">{{ t('focus.back') }}</RouterLink>
      <h1 :id="`f-${topic.id}`" class="text-2xl font-bold">{{ topic.title[lang] }}</h1>

      <section aria-labelledby="f-what" class="rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800">
        <h2 id="f-what" class="font-semibold">{{ t('focus.what') }}</h2>
        <p class="mt-1">{{ topic.what[lang] }}</p>
      </section>
      <section aria-labelledby="f-tell" class="rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950">
        <h2 id="f-tell" class="font-semibold">{{ t('mycv.tellIt') }}</h2>
        <p class="mt-1">{{ topic.tellIt[lang] }}</p>
      </section>

      <section aria-labelledby="f-code">
        <h2 id="f-code" class="font-semibold">{{ t('focus.code') }}</h2>
        <ul class="mt-1">
          <li v-for="p in topic.code" :key="p">
            <a :href="`${FOCUS_REPO}/blob/main/${p}`" target="_blank" rel="noopener" class="inline-flex items-center break-all text-sm text-indigo-700 underline dark:text-indigo-300">{{ p }}</a>
          </li>
        </ul>
      </section>

      <section aria-labelledby="f-q" class="space-y-2">
        <h2 id="f-q" class="font-semibold">{{ t('mycv.questions') }}</h2>
        <div v-for="(q, i) in topic.questions" :key="i" class="space-y-2 rounded-lg border border-slate-300 p-3 dark:border-slate-600">
          <p class="font-semibold">{{ q.q[lang] }}</p>
          <button class="w-full rounded border border-slate-400 px-4" :aria-expanded="shown.has(i)" @click="toggleAnswer(i)">
            {{ shown.has(i) ? t('mycv.hide') : t('mycv.show') }}
          </button>
          <p v-if="shown.has(i)" class="rounded bg-slate-100 p-3 dark:bg-slate-800">{{ q.a[lang] }}</p>
        </div>
      </section>

      <button
        class="w-full rounded px-4 font-semibold"
        :class="explained(topic.id) ? 'border-2 border-emerald-700 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100' : 'bg-indigo-700 text-white'"
        :aria-pressed="explained(topic.id)"
        @click="toggleUnderstood(focusKey(topic.id))"
      >
        {{ explained(topic.id) ? t('mycv.explained') : t('mycv.explain') }}
      </button>
    </article>

    <!-- overview -->
    <template v-else>
      <div class="space-y-1">
        <h1 class="text-2xl font-bold">{{ t('focus.title') }}</h1>
        <p class="text-slate-600 dark:text-slate-300">{{ t('focus.intro') }}</p>
        <a :href="FOCUS_REPO" target="_blank" rel="noopener" class="inline-flex items-center break-all text-sm text-indigo-700 underline dark:text-indigo-300">maeshataruna99-lgtm/core-ai-automation</a>
        <p class="text-sm">{{ t('focus.progress', { done: doneCount, total: focusTopics.length }) }}</p>
      </div>
      <button class="w-full rounded bg-indigo-700 px-4 font-semibold text-white" @click="startSim(allQuestions)">
        {{ t('focus.simStart', { total: allQuestions.length }) }}
      </button>
      <ul class="space-y-2">
        <li v-for="x in focusTopics" :key="x.id">
          <RouterLink :to="{ path: '/focus', query: { item: x.id } }" class="block rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800">
            <span class="flex items-center gap-2">
              <span class="font-semibold">{{ x.title[lang] }}</span>
              <span v-if="explained(x.id)" class="ml-auto shrink-0 text-sm font-semibold">✓</span>
            </span>
            <span class="mt-1 block text-sm text-slate-700 dark:text-slate-300">{{ x.questions.length }} Q</span>
          </RouterLink>
        </li>
      </ul>
    </template>
  </div>
</template>
