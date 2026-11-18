<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { isCorrect } from '../core/answers.ts';
import { changedLines } from '../core/diff.ts';
import type { Card } from '../core/types.ts';
import { useHighlightedLines } from '../composables/useHighlight.ts';
import { useStore } from '../composables/useStore.ts';
import { useT } from '../i18n/index.ts';
import AppIcon from './AppIcon.vue';
import CodeBlock from './CodeBlock.vue';
import FormattedText from './FormattedText.vue';

const props = defineProps<{ card: Card }>();
const emit = defineEmits<{ next: [correct: boolean] }>();
const t = useT();
const { store } = useStore();
const primerText = computed(() => props.card.primer?.[store.settings.language] ?? '');
const box = computed(() => store.progress[props.card.id]?.box ?? 0);

const flipped = ref(false);
const chosen = ref<number | null>(null);
const verdict = ref<boolean | null>(null);
const showFixed = ref(false);

const code = computed(() => (props.card.type === 'bugspot' ? props.card.code : ''));
const fixedCode = computed(() => (props.card.type === 'bugspot' ? props.card.fixedCode : ''));
const language = computed(() => (props.card.type === 'bugspot' ? props.card.language : ''));
const plainLines = computed(() => code.value.split('\n'));
const fixedLines = computed(() => fixedCode.value.split('\n'));
const tokenLines = useHighlightedLines(() => code.value, () => language.value);
const fixedTokenLines = useHighlightedLines(() => fixedCode.value, () => language.value);
const fixedDiffLines = computed(() =>
  props.card.type === 'bugspot' ? new Set(changedLines(props.card.code, props.card.fixedCode)) : new Set<number>(),
);
const answered = computed(() => verdict.value !== null);

const levelBadgeClass = computed(() => {
  if (props.card.level === 'beginner') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/60 dark:text-emerald-200';
  }
  if (props.card.level === 'intermediate') {
    return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/70 dark:bg-amber-950/60 dark:text-amber-200';
  }
  return 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800/70 dark:bg-violet-950/60 dark:text-violet-200';
});

const typeIcon = computed(() => {
  if (props.card.type === 'bugspot') return 'bug' as const;
  if (props.card.type === 'output') return 'terminal' as const;
  if (props.card.type === 'mcq') return 'list' as const;
  return 'layers' as const;
});

function pick(response: number | boolean) {
  if (answered.value) return;
  if (typeof response === 'number') chosen.value = response;
  verdict.value = isCorrect(props.card, response);
}

const optionState = (i: number) => {
  if (!answered.value || (props.card.type !== 'mcq' && props.card.type !== 'output')) {
    return 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30';
  }
  if (i === props.card.answerIndex) {
    return 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-100';
  }
  if (i === chosen.value) {
    return 'border-rose-600 bg-rose-50 text-rose-950 ring-1 ring-rose-600/30 dark:border-rose-500 dark:bg-rose-950/60 dark:text-rose-100';
  }
  return 'border-slate-200 bg-slate-50/60 opacity-60 dark:border-slate-800 dark:bg-slate-900/50';
};

function onKey(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = (e.target as HTMLElement | null)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  if (answered.value) {
    if (e.key === 'Enter' || e.key.toLowerCase() === 'n') {
      e.preventDefault();
      emit('next', verdict.value === true);
    }
    return;
  }

  if (props.card.type === 'flashcard') {
    if (!flipped.value && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      flipped.value = true;
    } else if (flipped.value) {
      if (e.key === '1' || e.key === 'ArrowRight') {
        e.preventDefault();
        pick(true);
      } else if (e.key === '2' || e.key === 'ArrowLeft') {
        e.preventDefault();
        pick(false);
      }
    }
    return;
  }

  if (props.card.type === 'mcq' || props.card.type === 'output') {
    const idxMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 };
    const idx = idxMap[e.key.toLowerCase()];
    if (idx !== undefined && idx < props.card.options.length) {
      e.preventDefault();
      pick(idx);
    }
  }
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <article
    class="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    :aria-label="`${card.track} ${card.type} card`"
  >
    <div class="space-y-5">
      <!-- Card Metadata Bar -->
      <header class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <AppIcon :name="typeIcon" :size="13" />
            {{ t(`type.${card.type}`) }}
          </span>
          <span class="rounded-full border px-2.5 py-1 text-xs font-medium" :class="levelBadgeClass">
            {{ t(`level.${card.level}`) }}
          </span>
          <span class="font-mono text-xs text-slate-500 dark:text-slate-400">
            {{ card.track }} / {{ card.topic }}
          </span>
        </div>

        <!-- Leitner Box 1..5 Pips -->
        <div
          class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300"
          :title="box ? t('card.box', { n: box }) : t('card.unseen')"
        >
          <span class="font-medium">{{ box ? t('card.box', { n: box }) : t('card.unseen') }}</span>
          <span class="flex gap-0.5" aria-hidden="true">
            <span
              v-for="b in 5"
              :key="b"
              class="h-2 w-2.5 rounded-xs transition-colors"
              :class="b <= box ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-200 dark:bg-slate-700'"
            />
          </span>
        </div>
      </header>

      <!-- Beginner primer: open by default so newcomers build mental model first -->
      <details
        v-if="primerText"
        open
        class="group rounded-xl border border-amber-200 border-l-4 border-l-amber-500 bg-amber-50/70 p-4 dark:border-amber-800/60 dark:border-l-amber-400 dark:bg-amber-950/30"
      >
        <summary class="flex cursor-pointer list-none items-center gap-2 font-semibold text-amber-950 dark:text-amber-200">
          <AppIcon name="lightbulb" :size="17" class="text-amber-600 dark:text-amber-400" />
          <span class="flex-1">{{ t('card.primer') }}</span>
          <AppIcon name="chevron-down" :size="16" class="transition-transform group-open:rotate-180" />
        </summary>
        <div class="mt-3 text-slate-800 dark:text-slate-200">
          <FormattedText :text="primerText" />
        </div>
      </details>

      <!-- Flashcard -->
      <template v-if="card.type === 'flashcard'">
        <button
          type="button"
          class="group w-full rounded-xl border-2 p-5 text-left transition-all sm:p-6"
          :class="
            flipped
              ? 'border-indigo-300 bg-indigo-50/40 dark:border-indigo-700 dark:bg-indigo-950/25'
              : 'border-slate-200 bg-slate-50/60 hover:border-indigo-400 hover:bg-white dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-indigo-500'
          "
          :aria-expanded="flipped"
          @click="flipped = true"
        >
          <span class="block text-lg font-semibold leading-snug text-slate-900 sm:text-xl dark:text-slate-50">
            {{ card.front }}
          </span>

          <Transition name="panel">
            <div v-if="flipped" class="mt-4 border-t border-indigo-200/80 pt-4 text-slate-800 dark:border-indigo-800/60 dark:text-slate-200">
              <FormattedText :text="card.back" />
            </div>
            <div v-else class="mt-4 flex items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span>{{ t('card.revealHint') }}</span>
              <span class="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-800 shadow-2xs group-hover:border-indigo-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                {{ t('card.reveal') }}
              </span>
            </div>
          </Transition>
        </button>

        <div v-if="flipped && !answered" class="grid grid-cols-2 gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 transition-colors hover:border-rose-400 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-rose-500 dark:hover:bg-rose-950/40"
            @click="pick(false)"
          >
            <AppIcon name="rotate-ccw" :size="17" />
            {{ t('card.didnt') }}
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            @click="pick(true)"
          >
            <AppIcon name="check" :size="17" />
            {{ t('card.knew') }}
          </button>
        </div>
      </template>

      <!-- MCQ / Output -->
      <template v-else-if="card.type === 'mcq' || card.type === 'output'">
        <div v-if="card.type === 'mcq'" class="text-slate-900 dark:text-slate-50">
          <div class="text-lg font-semibold leading-snug">
            <FormattedText :text="card.question" />
          </div>
        </div>
        <template v-else>
          <p class="text-lg font-semibold text-slate-900 dark:text-slate-50">{{ t('card.printQ') }}</p>
          <CodeBlock :code="card.code" :language="card.language" />
        </template>

        <ul class="space-y-2.5">
          <li v-for="(opt, i) in card.options" :key="i">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all"
              :class="optionState(i)"
              :disabled="answered"
              @click="pick(i)"
            >
              <span
                aria-hidden="true"
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-slate-50 font-mono text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {{ 'ABCD'[i] }}
              </span>
              <span class="min-w-0 flex-1 text-[15px] leading-snug">{{ opt }}</span>
              <span
                v-if="answered && i === card.answerIndex"
                class="ml-auto inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
              >
                <AppIcon name="check" :size="16" />
                {{ t('card.correctAnswer') }}
              </span>
              <span
                v-else-if="answered && i === chosen"
                class="ml-auto inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-300"
              >
                <AppIcon name="x" :size="16" />
                {{ t('card.yourAnswer') }}
              </span>
            </button>
          </li>
        </ul>
      </template>

      <!-- BugSpot -->
      <template v-else>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-lg font-semibold text-slate-900 dark:text-slate-50">{{ t('card.tapBug') }}</p>
          <button
            v-if="answered"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-3 text-xs font-semibold text-indigo-800 transition-colors hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200 dark:hover:bg-indigo-900/60"
            @click="showFixed = !showFixed"
          >
            <AppIcon name="code" :size="14" />
            {{ showFixed ? t('card.showBuggy') : t('card.compareFix') }}
          </button>
        </div>

        <div class="overflow-hidden rounded-xl border border-slate-200 bg-[#f6f8fa] dark:border-slate-700/80 dark:bg-[#0d1117]">
          <div class="flex items-center justify-between border-b border-slate-200 bg-slate-100/80 px-3.5 py-2 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
            <span class="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <AppIcon name="bug" :size="14" />
              {{ card.language }}
            </span>
            <span v-if="answered" class="font-semibold" :class="showFixed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'">
              {{ showFixed ? t('card.compareFix') : t('card.showBuggy') }}
            </span>
          </div>

          <ol v-if="!showFixed" class="code overflow-x-auto py-2 text-[13px] leading-6 sm:text-sm">
            <li v-for="(line, i) in plainLines" :key="i">
              <button
                type="button"
                class="flex w-full min-w-max items-center gap-3 px-3.5 text-left font-mono transition-colors"
                :class="
                  answered && card.buggyLines.includes(i + 1)
                    ? 'bg-emerald-500/20 dark:bg-emerald-500/25'
                    : answered && chosen === i + 1
                      ? 'bg-rose-500/20 dark:bg-rose-500/25'
                      : 'hover:bg-indigo-500/10'
                "
                :disabled="answered"
                :aria-label="`${i + 1}: ${line.trim() || '(blank)'}`"
                @click="pick(i + 1)"
              >
                <span aria-hidden="true" class="w-6 shrink-0 select-none text-right text-xs text-slate-400 dark:text-slate-500">{{ i + 1 }}</span>
                <span class="whitespace-pre">
                  <template v-if="tokenLines?.[i]?.length">
                    <span v-for="(tok, j) in tokenLines[i]" :key="j" class="tok" :style="tok.style">{{ tok.content }}</span>
                  </template>
                  <template v-else>{{ line || ' ' }}</template>
                </span>
                <span
                  v-if="answered && card.buggyLines.includes(i + 1)"
                  class="ml-auto inline-flex items-center gap-1 rounded bg-emerald-700 px-2 py-0.5 font-sans text-[11px] font-semibold text-white dark:bg-emerald-600"
                >
                  <AppIcon name="bug" :size="12" />
                  {{ t('card.bug') }}
                </span>
              </button>
            </li>
          </ol>

          <ol v-else class="code overflow-x-auto py-2 text-[13px] leading-6 sm:text-sm">
            <li
              v-for="(line, i) in fixedLines"
              :key="i"
              class="flex min-w-max items-center gap-3 px-3.5 py-1.5 font-mono"
              :class="fixedDiffLines.has(i + 1) ? 'bg-emerald-500/20 dark:bg-emerald-500/25' : ''"
            >
              <span aria-hidden="true" class="w-6 shrink-0 select-none text-right text-xs text-slate-400 dark:text-slate-500">{{ i + 1 }}</span>
              <span class="whitespace-pre">
                <template v-if="fixedTokenLines?.[i]?.length">
                  <span v-for="(tok, j) in fixedTokenLines[i]" :key="j" class="tok" :style="tok.style">{{ tok.content }}</span>
                </template>
                <template v-else>{{ line || ' ' }}</template>
              </span>
              <span
                v-if="fixedDiffLines.has(i + 1)"
                class="ml-auto inline-flex items-center gap-1 rounded bg-emerald-700 px-2 py-0.5 font-sans text-[11px] font-semibold text-white dark:bg-emerald-600"
              >
                <AppIcon name="check" :size="12" />
              </span>
            </li>
          </ol>
        </div>
      </template>

      <!-- Feedback & Explanation -->
      <Transition name="panel">
        <section
          v-if="answered"
          class="space-y-4 rounded-xl border p-4 sm:p-5"
          :class="
            verdict
              ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800/70 dark:bg-emerald-950/35'
              : 'border-rose-200 bg-rose-50/70 dark:border-rose-800/70 dark:bg-rose-950/35'
          "
          aria-live="polite"
        >
          <div class="flex items-center gap-2 font-semibold" :class="verdict ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'">
            <AppIcon :name="verdict ? 'check' : 'x'" :size="18" />
            <span>{{ verdict ? t('card.correct') : t('card.wrong') }}</span>
          </div>

          <div class="text-slate-800 dark:text-slate-100">
            <FormattedText :text="card.explanation" />
          </div>

          <div v-if="card.source || card.docsUrl" class="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span v-if="card.source" class="rounded-md bg-white/80 px-2.5 py-1 dark:bg-slate-900/70">
              {{ t('card.inspired') }} {{ card.source.repo }}<template v-if="card.source.path"> — {{ card.source.path }}</template>
            </span>
            <a
              v-if="card.docsUrl"
              :href="card.docsUrl"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-1 font-medium text-indigo-700 underline underline-offset-2 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              {{ t('card.docs') }}
              <AppIcon name="external-link" :size="13" />
            </a>
          </div>

          <button
            type="button"
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 font-semibold text-white shadow-xs transition-colors hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            @click="emit('next', verdict === true)"
          >
            <span>{{ t('card.next') }}</span>
            <AppIcon name="chevron-right" :size="17" />
          </button>
        </section>
      </Transition>

      <p class="hidden text-center text-xs text-slate-500 sm:block dark:text-slate-400">
        {{ t('card.shortcuts') }}
      </p>
    </div>
  </article>
</template>
