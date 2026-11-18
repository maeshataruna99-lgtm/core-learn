<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ text: string }>();

interface Segment {
  kind: 'text' | 'code' | 'bold';
  value: string;
}

type Block =
  | { kind: 'p'; lines: Segment[][] }
  | { kind: 'ul'; items: Segment[][] }
  | { kind: 'ol'; items: Segment[][] };

function parseInline(raw: string): Segment[] {
  const out: Segment[] = [];
  const regex = /`([^`]+)`|\*\*([^*]+)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw)) !== null) {
    if (match.index > last) out.push({ kind: 'text', value: raw.slice(last, match.index) });
    if (match[1] !== undefined) out.push({ kind: 'code', value: match[1] });
    else if (match[2] !== undefined) out.push({ kind: 'bold', value: match[2] });
    last = match.index + match[0].length;
  }
  if (last < raw.length) out.push({ kind: 'text', value: raw.slice(last) });
  return out.length ? out : [{ kind: 'text', value: raw }];
}

const blocks = computed<Block[]>(() => {
  const chunks = props.text.split(/\n{2,}/);
  const res: Block[] = [];

  for (const chunk of chunks) {
    const lines = chunk.split('\n').filter((l) => l.trim().length > 0);
    if (!lines.length) continue;

    if (lines.every((l) => /^[-•*]\s+/.test(l.trim()))) {
      res.push({
        kind: 'ul',
        items: lines.map((l) => parseInline(l.trim().replace(/^[-•*]\s+/, ''))),
      });
    } else if (lines.every((l) => /^\d+\.\s+/.test(l.trim()))) {
      res.push({
        kind: 'ol',
        items: lines.map((l) => parseInline(l.trim().replace(/^\d+\.\s+/, ''))),
      });
    } else {
      res.push({
        kind: 'p',
        lines: lines.map((l) => parseInline(l)),
      });
    }
  }
  return res;
});
</script>

<template>
  <div class="prose-read space-y-2.5 text-[15px] sm:text-base">
    <template v-for="(block, i) in blocks" :key="i">
      <p v-if="block.kind === 'p'">
        <template v-for="(line, li) in block.lines" :key="li">
          <br v-if="li > 0" />
          <template v-for="(seg, si) in line" :key="si">
            <code
              v-if="seg.kind === 'code'"
              class="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.86em] text-indigo-800 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-200"
            >{{ seg.value }}</code>
            <strong v-else-if="seg.kind === 'bold'" class="font-semibold">{{ seg.value }}</strong>
            <template v-else>{{ seg.value }}</template>
          </template>
        </template>
      </p>

      <ul v-else-if="block.kind === 'ul'" class="list-disc space-y-1.5 pl-5">
        <li v-for="(item, ii) in block.items" :key="ii">
          <template v-for="(seg, si) in item" :key="si">
            <code
              v-if="seg.kind === 'code'"
              class="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.86em] text-indigo-800 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-200"
            >{{ seg.value }}</code>
            <strong v-else-if="seg.kind === 'bold'" class="font-semibold">{{ seg.value }}</strong>
            <template v-else>{{ seg.value }}</template>
          </template>
        </li>
      </ul>

      <ol v-else class="list-decimal space-y-1.5 pl-5">
        <li v-for="(item, ii) in block.items" :key="ii">
          <template v-for="(seg, si) in item" :key="si">
            <code
              v-if="seg.kind === 'code'"
              class="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.86em] text-indigo-800 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-200"
            >{{ seg.value }}</code>
            <strong v-else-if="seg.kind === 'bold'" class="font-semibold">{{ seg.value }}</strong>
            <template v-else>{{ seg.value }}</template>
          </template>
        </li>
      </ol>
    </template>
  </div>
</template>
