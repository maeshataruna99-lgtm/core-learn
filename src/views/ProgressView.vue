<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStore } from '../composables/useStore.ts';
import { exportStore, parseImport } from '../core/exportImport.ts';
import { mastery } from '../core/leitner.ts';
import { TRACKS } from '../core/types.ts';
import type { Store } from '../core/types.ts';

const { cards, store, replace, reset } = useStore();
const message = ref('');
const pending = ref<{ store: Store; cardCount: number } | null>(null);

const perTrack = computed(() =>
  TRACKS.map((t) => {
    const inTrack = cards.filter((c) => c.track === t);
    const m = inTrack.length ? inTrack.reduce((s, c) => s + mastery(store.progress[c.id]), 0) / inTrack.length : 0;
    return { track: t, total: inTrack.length, percent: Math.round(m * 100) };
  }).filter((r) => r.total > 0),
);
const weak = computed(() =>
  cards.filter((c) => (store.progress[c.id]?.wrong ?? 0) > 0)
    .sort((a, b) => (store.progress[b.id]!.wrong - store.progress[a.id]!.wrong)).slice(0, 10),
);

function doExport() {
  const blob = new Blob([exportStore({ ...store }, new Date().toISOString())], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `code-learn-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const res = parseImport(await file.text());
  if (res.ok) { pending.value = res; message.value = ''; } else { pending.value = null; message.value = `Import failed: ${res.error}`; }
}
function confirmImport() {
  if (pending.value) replace(pending.value.store);
  pending.value = null;
  message.value = 'Progress imported.';
}
function doReset() {
  if (window.confirm('Reset all progress? This cannot be undone.')) reset();
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Progress</h1>
    <section>
      <h2 class="mb-2 font-semibold">Mastery by track</h2>
      <ul class="space-y-2">
        <li v-for="r in perTrack" :key="r.track">
          <div class="flex justify-between text-sm"><span>{{ r.track }}</span><span>{{ r.percent }}%</span></div>
          <div class="h-2 rounded bg-slate-200 dark:bg-slate-700" role="progressbar" :aria-valuenow="r.percent" aria-valuemin="0" aria-valuemax="100" :aria-label="r.track">
            <div class="h-2 rounded bg-indigo-600" :style="{ width: r.percent + '%' }" />
          </div>
        </li>
      </ul>
    </section>
    <section>
      <h2 class="mb-2 font-semibold">Weak cards</h2>
      <p v-if="!weak.length" class="text-sm">No wrong answers yet.</p>
      <ul v-else class="list-disc pl-5 text-sm">
        <li v-for="c in weak" :key="c.id">{{ c.id }} ({{ store.progress[c.id]!.wrong }} wrong)</li>
      </ul>
    </section>
    <section class="space-y-2">
      <h2 class="font-semibold">Backup</h2>
      <button class="rounded border px-4" @click="doExport">Export JSON</button>
      <label class="block">Import JSON <input type="file" accept="application/json" class="block" @change="onFile" /></label>
      <div v-if="pending" class="rounded border p-3" role="alert">
        File contains {{ pending.cardCount }} cards of progress. Replace current progress?
        <button class="ml-2 rounded bg-indigo-600 px-3 text-white" @click="confirmImport">Replace</button>
        <button class="ml-2 rounded border px-3" @click="pending = null">Cancel</button>
      </div>
      <p v-if="message" role="status">{{ message }}</p>
      <button class="rounded border border-rose-600 px-4 text-rose-700 dark:text-rose-300" @click="doReset">Reset progress</button>
    </section>
  </div>
</template>
