<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStore } from '../composables/useStore.ts';
import type { WikiEntry } from '../core/wiki.ts';
import { useT } from '../i18n/index.ts';
import AppIcon from './AppIcon.vue';
import FormattedText from './FormattedText.vue';

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
const progressFraction = computed(() => (props.entries.length ? index.value / props.entries.length : 0));

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
    <p v-if="!entries.length" class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
      {{ t('wiki.quizEmpty') }}
    </p>

    <div
      v-else-if="finished"
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      role="status"
    >
      <p class="text-xl font-bold text-slate-900 dark:text-slate-50">{{ t('wiki.quizDone') }}</p>
      <p class="text-slate-700 dark:text-slate-300">{{ t('wiki.quizScore', { n: marked }) }}</p>
      <button
        type="button"
        class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 font-semibold text-white hover:bg-indigo-800 dark:bg-indigo-600"
        @click="emit('again')"
      >
        <AppIcon name="rotate-ccw" :size="17" />
        <span>{{ t('wiki.again') }}</span>
      </button>
    </div>

    <article
      v-else-if="current"
      :key="current.id"
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t('wiki.termOf', { i: index + 1, n: entries.length }) }}
        </p>
        <div class="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
          <div class="h-full origin-left rounded-full bg-indigo-600 transition-transform duration-300" :style="{ transform: `scaleX(${progressFraction})` }" />
        </div>
      </div>

      <div
        class="w-full rounded-xl border-2 p-5 text-left transition-colors"
        :class="
          revealed
            ? 'border-indigo-300 bg-indigo-50/40 dark:border-indigo-700 dark:bg-indigo-950/25'
            : 'border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800/40'
        "
      >
        <p class="text-xl font-bold text-slate-900 dark:text-slate-50">{{ current.term }}</p>
        <Transition name="panel">
          <div v-if="revealed" class="mt-4 space-y-3 border-t border-indigo-200/70 pt-4 dark:border-indigo-800/60">
            <FormattedText :text="current.meaning[lang]" />
            <p class="rounded-lg bg-amber-50/80 p-3 text-sm italic text-amber-950 dark:bg-amber-950/40 dark:text-amber-200">
              {{ current.analogy[lang] }}
            </p>
          </div>
          <p v-else class="mt-3 text-sm text-slate-600 dark:text-slate-300">{{ t('wiki.quizPrompt') }}</p>
        </Transition>
      </div>

      <div v-if="!revealed" class="space-y-3">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200" :for="`say-${current.id}`">
          {{ t('wiki.yourWords') }}
        </label>
        <textarea
          :id="`say-${current.id}`"
          v-model="draft"
          rows="3"
          class="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950"
        />
        <button
          type="button"
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          @click="revealed = true"
        >
          {{ t('wiki.reveal') }}
        </button>
      </div>

      <Transition name="panel">
        <div v-if="revealed" class="space-y-4" aria-live="polite">
          <p v-if="draft.trim()" class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950">
            <span class="font-semibold">{{ t('wiki.yourWords') }}:</span> {{ draft }}
          </p>
          <ul class="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-200">
            <li v-for="(k, i) in current.keyPoints" :key="i">{{ k[lang] }}</li>
          </ul>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              @click="next(false)"
            >
              <AppIcon name="rotate-ccw" :size="16" />
              <span>{{ t('wiki.notYet') }}</span>
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600"
              @click="next(true)"
            >
              <AppIcon name="check" :size="16" />
              <span>{{ t('wiki.gotIt') }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </article>

    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
      @click="emit('exit')"
    >
      <AppIcon name="chevron-left" :size="16" />
      <span>{{ t('wiki.exit') }}</span>
    </button>
  </section>
</template>
