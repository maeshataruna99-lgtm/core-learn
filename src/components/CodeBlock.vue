<script setup lang="ts">
import { useHighlightedLines } from '../composables/useHighlight.ts';

const props = defineProps<{ code: string; language: string }>();
const lines = useHighlightedLines(() => props.code, () => props.language);
</script>

<template>
  <pre class="code overflow-x-auto rounded-lg p-3 text-sm"><code v-if="lines"><span
    v-for="(line, i) in lines"
    :key="i"
    class="block whitespace-pre"
  ><span v-for="(t, j) in line" :key="j" class="tok" :style="t.style">{{ t.content }}</span>{{ line.length ? '' : ' ' }}</span></code><code v-else>{{ code }}</code></pre>
</template>
