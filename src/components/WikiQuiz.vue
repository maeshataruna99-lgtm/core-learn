<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStore } from '../composables/useStore.ts';
import { useT } from '../i18n/index.ts';
import type { WikiEntry } from '../core/wiki.ts';

const props = defineProps<{ entries: WikiEntry[] }>();
const emit = defineEmits<{ exit: []; again: [] }>();
const t = useT();
const { store, toggleUnderstood } = useStore();
const lang = computed(() => store.settings.language);

const index = ref(0);
const revealed = ref(false);
const draft = ref('');
const marked = ref(0);
const current = computed(() => props.entries[index.value]);
const finished = computed(() => index.value >= props.entries.length);

function next(understood: boolean) {
  const e = current.value;
  if (e && understood) {
    if (!store.understood[e.id]) toggleUnderstood(e.id);
    marked.value += 1;
  }
  index.value += 1;
  revealed.value = false;
  draft.value = '';
}
</script>

<template>
  <section class="space-y-4" :aria-label="t('wiki.quiz')">
    <p v-if="!entries.length" class="rounded-lg border border-slate-300 p-4 dark:border-slate-600">{{ t('wiki.quizEmpty') }}</p>

    <div v-else-if="finished" class="space-y-3 rounded-lg border border-slate-300 p-4 dark:border-slate-600" role="status">
      <p class="text-lg font-semibold">{{ t('wiki.quizDone') }}</p>
      <p>{{ t('wiki.quizScore', { n: marked }) }}</p>
      <button class="block w-full rounded bg-indigo-700 px-4 text-white" @click="emit('again')">{{ t('wiki.again') }}</button>
    </div>

    <article v-else-if="current" :key="current.id" class="space-y-4">
      <p class="text-sm text-slate-600 dark:text-slate-300">{{ t('wiki.termOf', { i: index + 1, n: entries.length }) }}</p>

      <!-- same flashcard feel as CardView: the term first, the answer after a tap -->
      <button
        class="w-full rounded-lg border border-slate-300 bg-white p-6 text-left dark:border-slate-600 dark:bg-slate-800"
        :aria-expanded="revealed"
        @click="revealed = true"
      >
        <span class="block text-xl font-semibold">{{ current.term }}</span>
        <template v-if="revealed">
          <span class="mt-3 block">{{ current.meaning[lang] }}</span>
          <span class="mt-3 block text-sm italic">{{ current.analogy[lang] }}</span>
        </template>
        <span v-else class="mt-3 block text-sm text-slate-600 dark:text-slate-300">{{ t('wiki.quizPrompt') }}</span>
      </button>

      <div v-if="!revealed">
        <label class="block text-sm" :for="`say-${current.id}`">{{ t('wiki.yourWords') }}</label>
        <textarea
          :id="`say-${current.id}`"
          v-model="draft"
          rows="3"
          class="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800"
        />
        <button class="mt-2 block w-full rounded border border-slate-400 px-4" @click="revealed = true">{{ t('wiki.reveal') }}</button>
      </div>

      <div v-else class="space-y-3" aria-live="polite">
        <p v-if="draft.trim()" class="rounded-lg border border-slate-300 p-3 text-sm dark:border-slate-600">
          <span class="font-semibold">{{ t('wiki.yourWords') }}:</span> {{ draft }}
        </p>
        <ul class="list-disc space-y-1 pl-5">
          <li v-for="(k, i) in current.keyPoints" :key="i">{{ k[lang] }}</li>
        </ul>
        <div class="flex gap-2">
          <button class="flex-1 rounded bg-emerald-700 px-4 text-white" @click="next(true)">✓ {{ t('wiki.gotIt') }}</button>
          <button class="flex-1 rounded bg-slate-700 px-4 text-white" @click="next(false)">↻ {{ t('wiki.notYet') }}</button>
        </div>
      </div>
    </article>

    <button class="underline" @click="emit('exit')">{{ t('wiki.exit') }}</button>
  </section>
</template>
