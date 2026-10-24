import { computed, reactive, watch } from 'vue';
import { allCards } from '../content/index.ts';
import { isDue, review, streak } from '../core/leitner.ts';
import { loadStore, pruneUnknown, saveStore } from '../core/storage.ts';
import type { KV } from '../core/storage.ts';
import type { Card, Store } from '../core/types.ts';

const kv: KV = {
  getItem: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

const ids = new Set(allCards.map((c) => c.id));
const initial = loadStore(kv);
initial.progress = pruneUnknown(initial.progress, ids);
const store = reactive<Store>(initial);
// Days (YYYY-MM-DD) with at least one answer; derived from lastSeenAt so no extra state is stored.
const seenDays = computed(() => [...new Set(Object.values(store.progress).map((p) => p.lastSeenAt.slice(0, 10)))]);

watch(store, () => saveStore(kv, store), { deep: true });

export function useStore() {
  const today = () => new Date().toISOString().slice(0, 10);
  return {
    store,
    cards: allCards,
    streak: computed(() => streak(seenDays.value, today())),
    dueCount: computed(() => allCards.filter((c) => isDue(store.progress[c.id], new Date().toISOString())).length),
    answer(card: Card, correct: boolean) {
      store.progress[card.id] = review(store.progress[card.id], correct, new Date().toISOString());
    },
    replace(next: Store) {
      store.progress = pruneUnknown(next.progress, ids);
      store.settings = next.settings;
      store.understood = next.understood;
    },
    reset() {
      store.progress = {};
      store.understood = {};
    },
    toggleUnderstood(termId: string) {
      if (store.understood[termId]) delete store.understood[termId];
      else store.understood[termId] = new Date().toISOString();
    },
  };
}
