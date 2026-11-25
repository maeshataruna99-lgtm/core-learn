import { computed, reactive, ref, watch } from 'vue';
import { allCards } from '../content/index.ts';
import { isDue, localDay, review, streak } from '../core/leitner.ts';
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

// Reactive clock that refreshes on tab focus and every minute so due/streak never go stale across midnight.
const clockMs = ref(Date.now());
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') clockMs.value = Date.now();
  });
}
if (typeof window !== 'undefined') {
  window.setInterval(() => {
    clockMs.value = Date.now();
  }, 60_000);
}

const nowIso = computed(() => new Date(clockMs.value).toISOString());
const todayDay = computed(() => localDay(new Date(clockMs.value)));

// Union persisted activityDays with progress timestamps so re-reviewing a card never erases prior study days.
const seenDays = computed(() => {
  const days = new Set<string>(store.activityDays);
  for (const p of Object.values(store.progress)) {
    const parsed = Date.parse(p.lastSeenAt);
    if (!Number.isNaN(parsed)) days.add(localDay(new Date(parsed)));
  }
  return [...days];
});

watch(store, () => saveStore(kv, store), { deep: true });

export function useStore() {
  return {
    store,
    cards: allCards,
    cardIds: ids,
    nowIso,
    today: todayDay,
    streak: computed(() => streak(seenDays.value, todayDay.value)),
    dueCount: computed(() => allCards.filter((c) => isDue(store.progress[c.id], nowIso.value)).length),
    answer(card: Card, correct: boolean, at: Date = new Date()) {
      const iso = at.toISOString();
      const day = localDay(at);
      clockMs.value = at.getTime();
      store.progress[card.id] = review(store.progress[card.id], correct, iso);
      if (!store.activityDays.includes(day)) {
        store.activityDays.push(day);
        store.activityDays.sort();
      }
    },
    replace(next: Store) {
      store.progress = pruneUnknown(next.progress, ids);
      store.settings = { ...next.settings };
      store.understood = { ...next.understood };
      store.activityDays = [...next.activityDays];
    },
    reset() {
      store.progress = {};
      store.understood = {};
      store.activityDays = [];
    },
    toggleUnderstood(termId: string) {
      if (store.understood[termId]) delete store.understood[termId];
      else store.understood[termId] = new Date().toISOString();
    },
    refreshClock(at: Date = new Date()) {
      clockMs.value = at.getTime();
    },
  };
}
