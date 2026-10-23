import { ref } from 'vue';
import { registerSW } from 'virtual:pwa-register';

const needRefresh = ref(false);
const offlineReady = ref(false);
let update: ((reload?: boolean) => Promise<void>) | undefined;

export function initPwa() {
  update = registerSW({
    onNeedRefresh: () => (needRefresh.value = true),
    onOfflineReady: () => (offlineReady.value = true),
  });
}

export function usePwa() {
  return {
    needRefresh,
    offlineReady,
    reload: () => update?.(true),
    dismiss: () => {
      needRefresh.value = false;
      offlineReady.value = false;
    },
  };
}
