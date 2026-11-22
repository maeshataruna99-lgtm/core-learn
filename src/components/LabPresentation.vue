<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from '../composables/useStore.ts';
import { labProjects } from '../content/lab/index.ts';
import { labTours } from '../content/lab/tours.ts';
import { cameraFor, tourKey, type LabBox } from '../core/lab.ts';
import { useT } from '../i18n/index.ts';
import AppIcon from './AppIcon.vue';
import FormattedText from './FormattedText.vue';

const t = useT();
const route = useRoute();
const router = useRouter();
const { store, toggleUnderstood } = useStore();
const lang = computed(() => store.settings.language);

const tour = computed(() => labTours.find((x) => x.id === route.query.tour) ?? null);
const at = ref(0);
const finished = ref(false);
const showDetail = ref(false);
const step = computed(() => tour.value?.steps[at.value] ?? null);
const project = computed(() => labProjects.find((p) => p.id === step.value?.project) ?? labProjects[0]!);
const capture = computed(() => project.value.captures[step.value?.screen ?? ''] ?? null);
const image = computed(() => (step.value ? `${project.value.imageDir}/${step.value.screen}.jpg` : ''));
const box = computed(() => (step.value?.box && capture.value ? (capture.value.boxes[step.value.box] as LabBox) : null));
const part = computed(() => (step.value?.part ? project.value.parts.find((p) => p.id === step.value!.part) ?? null : null));
const done = (id: string) => Boolean(store.understood[tourKey(id)]);

function setQuery(q: Record<string, string | undefined>) {
  void router.replace({ query: { ...route.query, ...q } });
}
function start(id: string) {
  at.value = 0;
  finished.value = false;
  setQuery({ tour: id });
}
function exit() {
  void router.replace({ query: { project: route.query.project as string | undefined } });
}
function go(delta: number) {
  if (!tour.value) return;
  const n = at.value + delta;
  if (n < 0) return;
  if (n >= tour.value.steps.length) {
    finished.value = true;
    autoplay.value = false;
    if (!done(tour.value.id)) toggleUnderstood(tourKey(tour.value.id));
    return;
  }
  at.value = n;
}
function openInLab() {
  if (!step.value) return;
  void router.replace({ query: { project: step.value.project, screen: step.value.screen } });
}
watch(at, () => {
  showDetail.value = false;
  void nextTick(() => nextBtn.value?.focus({ preventScroll: true }));
});
watch(tour, () => {
  at.value = 0;
  finished.value = false;
});

// Camera: frame size drives where the spotlighted box ends up.
const frame = ref<HTMLElement | null>(null);
const frameW = ref(0);
const viewportH = ref(typeof window === 'undefined' ? 800 : window.innerHeight);
const frameH = computed(() => Math.round(Math.max(300, Math.min(frameW.value * 0.6, viewportH.value * 0.68))));
const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const imgH = computed(() => (capture.value ? (frameW.value * capture.value.height) / capture.value.width : 0));
const wide = computed(() => frameW.value >= 720);
const DIALOG_W = 360;
/** Height kept free under the box when the dialog cannot sit beside it. */
const DIALOG_RESERVE = 310;
type Cam = { s: number; tx: number; ty: number };
const camWith = (reserve: number): Cam =>
  capture.value && frameW.value
    ? cameraFor(box.value, capture.value, frameW.value, frameH.value, !reduced && (step.value?.zoom ?? true), 2.4, reserve)
    : { s: 1, tx: 0, ty: 0 };
/** The highlighted box in frame pixels for a camera. */
function spotFor(c: Cam) {
  const b = box.value;
  if (!b || !frameW.value) return null;
  return { left: (b.x / 100) * frameW.value * c.s + c.tx, top: (b.y / 100) * imgH.value * c.s + c.ty, width: (b.w / 100) * frameW.value * c.s, height: (b.h / 100) * imgH.value * c.s };
}
const fitsBeside = (r: NonNullable<ReturnType<typeof spotFor>>) =>
  r.left + r.width + 20 + DIALOG_W <= frameW.value - 8 || r.left - 20 - DIALOG_W >= 8;
// First try the full frame; if the dialog cannot sit beside the box, reframe with room kept free below it.
const cam = computed<Cam>(() => {
  const full = camWith(0);
  const r = spotFor(full);
  return !wide.value || !r || fitsBeside(r) ? full : camWith(DIALOG_RESERVE);
});
const spot = computed(() => spotFor(cam.value));
/** Dialog beside the box when there is room, otherwise below it (or above when the box sits low). */
const dialogPos = computed(() => {
  const r = spot.value;
  if (!wide.value) return null;
  if (!r) return { left: `${(frameW.value - DIALOG_W) / 2}px`, top: '50%', transform: 'translateY(-50%)', side: 'none' };
  const top = `${Math.max(12, Math.min(r.top, frameH.value - 280))}px`;
  if (r.left + r.width + 20 + DIALOG_W <= frameW.value - 8) return { left: `${r.left + r.width + 20}px`, top, side: 'left' };
  if (r.left - 20 - DIALOG_W >= 8) return { left: `${r.left - 20 - DIALOG_W}px`, top, side: 'right' };
  const left = `${Math.max(8, Math.min(r.left + r.width / 2 - DIALOG_W / 2, frameW.value - DIALOG_W - 8))}px`;
  if (frameH.value - (r.top + r.height) >= r.top) return { left, bottom: '12px', side: 'none' };
  return { left, top: '12px', side: 'none' };
});

let ro: ResizeObserver | null = null;
const nextBtn = ref<HTMLButtonElement | null>(null);
function onResize() {
  viewportH.value = window.innerHeight;
}
function onKey(e: KeyboardEvent) {
  if (!tour.value || (e.target as HTMLElement).closest('input, textarea, select')) return;
  if (e.key === 'ArrowRight') go(1);
  else if (e.key === 'ArrowLeft') go(-1);
  else if (e.key === 'Escape') exit();
}
onMounted(() => {
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', onResize);
});
watch(frame, (el) => {
  ro?.disconnect();
  if (!el) return;
  ro = new ResizeObserver(([entry]) => (frameW.value = entry!.contentRect.width));
  ro.observe(el);
});

// Optional autoplay: advance every few seconds, stop at the end or on any manual move.
const AUTO_MS = 8000;
const autoplay = ref(false);
let timer: number | undefined;
watch([autoplay, at, finished], () => {
  clearTimeout(timer);
  if (autoplay.value && !finished.value) timer = window.setTimeout(() => go(1), AUTO_MS);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
  window.removeEventListener('resize', onResize);
  ro?.disconnect();
  clearTimeout(timer);
});
</script>

<template>
  <div class="space-y-4">
    <!-- chooser -->
    <section v-if="!tour" class="space-y-4" aria-labelledby="present-title">
      <div class="flex flex-wrap items-center gap-2">
        <h2 id="present-title" class="flex-1 text-xl font-bold text-slate-900 dark:text-slate-50">{{ t('present.choose') }}</h2>
        <button type="button" class="rounded-xl border border-slate-400 px-4 text-sm" @click="exit">{{ t('present.exit') }}</button>
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <button
          v-for="x in labTours"
          :key="x.id"
          type="button"
          class="space-y-2 rounded-2xl border-2 border-slate-200 bg-white p-4 text-left transition-colors hover:border-fuchsia-500 dark:border-slate-800 dark:bg-slate-900"
          @click="start(x.id)"
        >
          <span class="flex items-center gap-2">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl text-white" :class="x.audience === 'user' ? 'bg-indigo-600' : 'bg-fuchsia-600'">
              <AppIcon :name="x.audience === 'user' ? 'play' : 'code'" :size="18" />
            </span>
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ x.audience === 'user' ? t('present.forUser') : t('present.forDev') }} · {{ t('present.steps', { n: x.steps.length }) }}</span>
            <span v-if="done(x.id)" class="ml-auto rounded-full bg-emerald-600 px-2 text-xs font-semibold text-white">✓ {{ t('present.done') }}</span>
          </span>
          <span class="block text-lg font-bold text-slate-900 dark:text-slate-50">{{ x.title[lang] }}</span>
          <span class="block text-sm text-slate-600 dark:text-slate-300"><strong>{{ t('present.goal') }}</strong> {{ x.goal[lang] }}</span>
        </button>
      </div>
    </section>

    <!-- presentation -->
    <section v-else class="space-y-3" :aria-label="tour.title[lang]">
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="min-w-0 flex-1 truncate text-lg font-bold text-slate-900 dark:text-slate-50">{{ tour.title[lang] }}</h2>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border px-3 text-sm"
          :class="autoplay ? 'border-fuchsia-600 bg-fuchsia-50 text-fuchsia-800 dark:bg-fuchsia-950/50 dark:text-fuchsia-200' : 'border-slate-400'"
          :aria-pressed="autoplay"
          :disabled="finished"
          @click="autoplay = !autoplay"
        >
          <AppIcon :name="autoplay ? 'clock' : 'play'" :size="14" /><span>{{ autoplay ? t('present.autoOn') : t('present.autoOff') }}</span>
        </button>
        <button type="button" class="rounded-xl border border-slate-400 px-3 text-sm" @click="setQuery({ tour: undefined })">{{ t('present.otherTour') }}</button>
        <button type="button" class="rounded-xl border border-slate-400 px-3 text-sm" @click="exit">{{ t('present.exit') }}</button>
      </div>

      <!-- progress dots -->
      <div class="flex items-center gap-1" role="progressbar" :aria-valuenow="finished ? tour.steps.length : at + 1" aria-valuemin="1" :aria-valuemax="tour.steps.length" :aria-label="t('present.stepOf', { n: at + 1, total: tour.steps.length })">
        <button
          v-for="(s, i) in tour.steps"
          :key="i"
          type="button"
          class="h-2 min-h-0 flex-1 rounded-full transition-colors"
          :class="finished || i < at ? 'bg-fuchsia-500' : i === at ? 'bg-fuchsia-600 ring-2 ring-fuchsia-300' : 'bg-slate-200 dark:bg-slate-800'"
          :aria-label="`${i + 1}. ${s.title[lang]}`"
          @click="finished = false; at = i"
        />
      </div>

      <!-- finish card -->
      <div v-if="finished" class="space-y-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-6 text-center dark:bg-emerald-950/40" role="status">
        <p class="text-4xl" aria-hidden="true">🎯</p>
        <h3 class="text-xl font-bold text-emerald-900 dark:text-emerald-100">{{ t('present.goalReached') }}</h3>
        <p class="mx-auto max-w-xl text-slate-800 dark:text-slate-200">{{ tour.goal[lang] }}</p>
        <div class="flex flex-wrap justify-center gap-2">
          <button type="button" class="rounded-xl bg-fuchsia-600 px-4 font-semibold text-white" @click="finished = false; at = 0">{{ t('present.again') }}</button>
          <button type="button" class="rounded-xl border border-slate-400 px-4" @click="setQuery({ tour: undefined })">{{ t('present.otherTour') }}</button>
          <button type="button" class="rounded-xl border border-slate-400 px-4" @click="exit">{{ t('present.toLab') }}</button>
        </div>
      </div>

      <!-- stage -->
      <template v-else-if="step && capture">
        <div ref="frame" class="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg dark:border-slate-800" :style="{ height: `${frameH}px` }">
          <Transition name="present-fade">
            <div
              :key="image"
              class="absolute left-0 top-0 origin-top-left transition-transform duration-700 ease-in-out motion-reduce:transition-none"
              :style="{ width: `${frameW}px`, transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})` }"
            >
              <img :src="image" :alt="project.screens.find((s) => s.id === step!.screen)?.title[lang]" class="block w-full select-none" draggable="false" />
            </div>
          </Transition>
          <!-- spotlight in frame pixels -->
          <div
            v-if="spot"
            class="pointer-events-none absolute rounded-lg ring-4 ring-fuchsia-500 transition-all duration-700 ease-in-out motion-reduce:transition-none"
            :style="{ left: `${spot.left}px`, top: `${spot.top}px`, width: `${spot.width}px`, height: `${spot.height}px`, boxShadow: '0 0 0 9999px rgb(15 23 42 / 0.6)' }"
          >
            <span class="absolute -inset-1 animate-pulse rounded-xl ring-2 ring-fuchsia-300/70" aria-hidden="true" />
          </div>

          <!-- dialog over the stage on wide screens -->
          <div
            v-if="dialogPos"
            class="absolute z-10 transition-all duration-500 ease-out motion-reduce:transition-none"
            :style="{ width: `${DIALOG_W}px`, left: dialogPos.left, top: dialogPos.top, bottom: dialogPos.bottom, transform: dialogPos.transform }"
          >
            <span
              v-if="dialogPos.side !== 'none'"
              class="absolute top-6 h-4 w-4 rotate-45 bg-white dark:bg-slate-900"
              :class="dialogPos.side === 'left' ? '-left-2' : '-right-2'"
              aria-hidden="true"
            />
            <div class="relative max-h-[60vh] overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl dark:bg-slate-900" role="dialog" aria-live="polite" :aria-label="step.title[lang]">
              <p class="text-xs font-semibold uppercase tracking-wide text-fuchsia-700 dark:text-fuchsia-300">{{ t('present.stepOf', { n: at + 1, total: tour.steps.length }) }}</p>
              <h3 class="mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">{{ step.title[lang] }}</h3>
              <div class="mt-1 text-slate-800 dark:text-slate-200"><FormattedText :text="step.say[lang]" /></div>
              <div v-if="part && showDetail" class="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950/60">
                <code class="block font-mono text-xs text-fuchsia-800 dark:text-fuchsia-300">{{ part.component }}</code>
                <FormattedText :text="part.why[lang]" />
                <ul class="space-y-0.5">
                  <li v-for="f in part.files" :key="f.path" class="break-all font-mono text-xs text-indigo-700 dark:text-indigo-300">{{ f.path }}</li>
                </ul>
                <button type="button" class="text-sm font-semibold text-indigo-700 underline dark:text-indigo-300" @click="openInLab">{{ t('present.openInLab') }}</button>
              </div>
              <div class="mt-3 flex items-center gap-2">
                <button v-if="part" type="button" class="text-sm text-slate-600 underline dark:text-slate-300" :aria-expanded="showDetail" @click="showDetail = !showDetail">{{ showDetail ? t('present.hideDetail') : t('present.showDetail') }}</button>
                <span class="flex-1" />
                <button type="button" class="flex h-10 min-h-0 w-10 items-center justify-center rounded-xl border border-slate-300 disabled:opacity-40 dark:border-slate-700" :disabled="at === 0" :aria-label="t('present.back')" @click="go(-1)"><AppIcon name="chevron-left" :size="18" /></button>
                <button ref="nextBtn" type="button" class="inline-flex h-10 min-h-0 items-center gap-1 rounded-xl bg-fuchsia-600 px-4 font-semibold text-white hover:bg-fuchsia-700" @click="go(1)">
                  <span>{{ at === tour.steps.length - 1 ? t('present.finish') : t('present.next') }}</span><AppIcon name="chevron-right" :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- dialog below the stage on narrow screens -->
        <div v-if="!dialogPos" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900" aria-live="polite">
          <p class="text-xs font-semibold uppercase tracking-wide text-fuchsia-700 dark:text-fuchsia-300">{{ t('present.stepOf', { n: at + 1, total: tour.steps.length }) }}</p>
          <h3 class="mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">{{ step.title[lang] }}</h3>
          <div class="mt-1 text-slate-800 dark:text-slate-200"><FormattedText :text="step.say[lang]" /></div>
          <div v-if="part && showDetail" class="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950/60">
            <code class="block font-mono text-xs text-fuchsia-800 dark:text-fuchsia-300">{{ part.component }}</code>
            <FormattedText :text="part.why[lang]" />
            <button type="button" class="text-sm font-semibold text-indigo-700 underline dark:text-indigo-300" @click="openInLab">{{ t('present.openInLab') }}</button>
          </div>
          <div class="mt-3 flex items-center gap-2">
            <button v-if="part" type="button" class="text-sm text-slate-600 underline dark:text-slate-300" :aria-expanded="showDetail" @click="showDetail = !showDetail">{{ showDetail ? t('present.hideDetail') : t('present.showDetail') }}</button>
            <span class="flex-1" />
            <button type="button" class="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 disabled:opacity-40 dark:border-slate-700" :disabled="at === 0" :aria-label="t('present.back')" @click="go(-1)"><AppIcon name="chevron-left" :size="18" /></button>
            <button ref="nextBtn" type="button" class="inline-flex items-center gap-1 rounded-xl bg-fuchsia-600 px-4 font-semibold text-white" @click="go(1)">
              <span>{{ at === tour.steps.length - 1 ? t('present.finish') : t('present.next') }}</span><AppIcon name="chevron-right" :size="16" />
            </button>
          </div>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('present.hint') }}</p>
      </template>
    </section>
  </div>
</template>

<style scoped>
.present-fade-enter-active,
.present-fade-leave-active {
  transition: opacity 0.45s ease;
}
.present-fade-enter-from,
.present-fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .present-fade-enter-active,
  .present-fade-leave-active {
    transition: none;
  }
}
</style>
