import { computed, ref } from 'vue';

export const MGS_TIMER_PRESETS = [
  { id: 'full', label: '90m', seconds: 90 * 60 },
  { id: 'part1', label: 'Part 1 · 25m', seconds: 25 * 60 },
  { id: 'part2', label: 'Part 2 · 40m', seconds: 40 * 60 },
  { id: 'part3', label: 'Part 3 · 25m', seconds: 25 * 60 },
] as const;

export type MgsTimerPresetId = (typeof MGS_TIMER_PRESETS)[number]['id'];

const STORAGE_KEY = 'core-learn:mgs-timer:v1';

interface PersistedTimer {
  preset: MgsTimerPresetId;
  total: number;
  remaining: number;
  endAt: number | null;
}

const preset = ref<MgsTimerPresetId>('full');
const total = ref<number>(90 * 60);
const left = ref<number>(90 * 60);
const running = ref(false);
let endAt: number | null = null;
let handle: ReturnType<typeof setInterval> | null = null;
let initialized = false;

function save() {
  if (typeof localStorage === 'undefined') return;
  try {
    const payload: PersistedTimer = {
      preset: preset.value,
      total: total.value,
      remaining: left.value,
      endAt,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* storage unavailable */
  }
}

function clearTick() {
  if (handle !== null) {
    clearInterval(handle);
    handle = null;
  }
}

function syncRemaining() {
  if (endAt === null) return;
  const secs = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
  left.value = secs;
  if (secs === 0) {
    running.value = false;
    endAt = null;
    clearTick();
    save();
  }
}

function startTick() {
  clearTick();
  handle = setInterval(syncRemaining, 500);
}

function load() {
  if (initialized) return;
  initialized = true;
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as Partial<PersistedTimer>;
    const matched = MGS_TIMER_PRESETS.find((p) => p.id === data.preset);
    if (matched) preset.value = matched.id;
    if (typeof data.total === 'number' && data.total > 0) total.value = data.total;
    if (typeof data.endAt === 'number' && data.endAt > Date.now()) {
      endAt = data.endAt;
      running.value = true;
      syncRemaining();
      startTick();
    } else if (typeof data.remaining === 'number' && data.remaining >= 0) {
      left.value = Math.min(total.value, data.remaining);
      endAt = null;
      running.value = false;
    }
  } catch {
    /* corrupt state, keep defaults */
  }
}

export function useMgsTimer() {
  load();

  function selectPreset(id: MgsTimerPresetId) {
    const found = MGS_TIMER_PRESETS.find((p) => p.id === id) ?? MGS_TIMER_PRESETS[0];
    clearTick();
    running.value = false;
    endAt = null;
    preset.value = found.id;
    total.value = found.seconds;
    left.value = found.seconds;
    save();
  }

  function toggle() {
    if (running.value) {
      syncRemaining();
      clearTick();
      running.value = false;
      endAt = null;
      save();
      return;
    }
    if (left.value <= 0) left.value = total.value;
    endAt = Date.now() + left.value * 1000;
    running.value = true;
    startTick();
    save();
  }

  function reset() {
    clearTick();
    running.value = false;
    endAt = null;
    left.value = total.value;
    save();
  }

  const display = computed(() => {
    const mins = Math.floor(left.value / 60);
    const secs = left.value % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  });

  const progressPct = computed(() =>
    total.value > 0 ? Math.round(((total.value - left.value) / total.value) * 100) : 0,
  );

  return {
    presets: MGS_TIMER_PRESETS,
    preset,
    total,
    left,
    running,
    display,
    progressPct,
    selectPreset,
    toggle,
    reset,
  };
}
