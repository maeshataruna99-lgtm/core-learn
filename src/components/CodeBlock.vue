<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { useHighlightedLines } from '../composables/useHighlight.ts';
import { useT } from '../i18n/index.ts';
import AppIcon from './AppIcon.vue';

const props = withDefaults(defineProps<{ code: string; language: string; lineNumbers?: boolean }>(), {
  lineNumbers: true,
});
const t = useT();
const lines = useHighlightedLines(() => props.code, () => props.language);
const copied = ref(false);
let copyTimer: number | undefined;

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => { copied.value = false; }, 1600);
  } catch {
    /* clipboard blocked */
  }
}

onBeforeUnmount(() => clearTimeout(copyTimer));
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-[#f6f8fa] shadow-xs dark:border-slate-700/80 dark:bg-[#0d1117]">
    <div class="flex items-center justify-between border-b border-slate-200 bg-slate-100/80 px-3.5 py-1 dark:border-slate-800 dark:bg-slate-900/80">
      <span class="inline-flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">
        <AppIcon name="terminal" :size="14" />
        {{ language }}
      </span>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-slate-800"
        @click="copyCode"
      >
        <AppIcon :name="copied ? 'check' : 'copy'" :size="14" />
        <span>{{ copied ? t('card.copied') : t('card.copy') }}</span>
      </button>
    </div>
    <pre class="code overflow-x-auto p-3.5 text-[13px] leading-6 sm:text-sm"><code v-if="lines"><span
      v-for="(line, i) in lines"
      :key="i"
      class="flex whitespace-pre"
    ><span
      v-if="lineNumbers"
      aria-hidden="true"
      class="mr-4 inline-block w-6 shrink-0 select-none text-right text-xs leading-6 text-slate-400 dark:text-slate-500"
    >{{ i + 1 }}</span><span class="min-w-0 flex-1"><span v-for="(tok, j) in line" :key="j" class="tok" :style="tok.style">{{ tok.content }}</span>{{ line.length ? '' : ' ' }}</span></span></code><code v-else>{{ code }}</code></pre>
  </div>
</template>
