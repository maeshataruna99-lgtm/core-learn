<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppIcon from '../components/AppIcon.vue';
import CodeBlock from '../components/CodeBlock.vue';
import FormattedText from '../components/FormattedText.vue';
import { useStore } from '../composables/useStore.ts';
import { labProjects } from '../content/lab/index.ts';
import { cropStyle, isInside, labKey, type LabBox, type LabSpot } from '../core/lab.ts';
import { useT } from '../i18n/index.ts';

const t = useT();
const route = useRoute();
const router = useRouter();
const { store, toggleUnderstood } = useStore();
const lang = computed(() => store.settings.language);

const project = computed(() => labProjects.find((p) => p.id === route.query.project) ?? labProjects[0]!);
const partById = computed(() => new Map(project.value.parts.map((p) => [p.id, p])));

const screenIndex = computed(() => {
  const i = project.value.screens.findIndex((s) => s.id === route.query.screen);
  return i < 0 ? 0 : i;
});
const screen = computed(() => project.value.screens[screenIndex.value]!);
const capture = computed(() => project.value.captures[screen.value.id]!);
const image = computed(() => `${project.value.imageDir}/${screen.value.id}.jpg`);
const boxOf = (spot: LabSpot) => capture.value.boxes[spot.box] as LabBox;

// Discovery progress, stored with the other "understood" marks.
const found = (partId: string) => Boolean(store.understood[labKey(project.value.id, partId)]);
const discover = (partId: string) => {
  if (!found(partId)) toggleUnderstood(labKey(project.value.id, partId));
};
const foundTotal = computed(() => project.value.parts.filter((p) => found(p.id)).length);
const screenFound = (i: number) => project.value.screens[i]!.spots.filter((s) => found(s.part)).length;

// Explore mode
const selected = ref<number | null>(null);
const hovered = ref<number | null>(null);
const spot = computed(() => (selected.value === null ? null : screen.value.spots[selected.value] ?? null));
const part = computed(() => (spot.value ? partById.value.get(spot.value.part) ?? null : null));
const detailEl = ref<HTMLElement | null>(null);

function select(i: number) {
  selected.value = i;
  discover(screen.value.spots[i]!.part);
  if (window.innerWidth < 1280) requestAnimationFrame(() => detailEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}
function step(delta: number) {
  const n = screen.value.spots.length;
  select(selected.value === null ? 0 : (selected.value + delta + n) % n);
}
function goScreen(i: number) {
  void router.replace({ query: { ...route.query, screen: project.value.screens[i]!.id } });
}
function goProject(id: string) {
  void router.replace({ query: { project: id } });
}
watch([screenIndex, project], () => {
  selected.value = null;
  findQueue.value = null;
  quizAt.value = null;
});

// Screen quiz: multiple-choice questions about what the screen shows. A perfect score is remembered.
const quizAt = ref<number | null>(null);
const picked = ref<number | null>(null);
const quizScore = ref(0);
const quizItem = computed(() => (quizAt.value === null ? null : screen.value.quiz?.[quizAt.value] ?? null));
const quizKey = (screenId: string) => labKey(project.value.id, `quiz:${screenId}`);
const quizPassed = (screenId: string) => Boolean(store.understood[quizKey(screenId)]);

function startQuiz() {
  findQueue.value = null;
  selected.value = null;
  quizAt.value = 0;
  picked.value = null;
  quizScore.value = 0;
}
function pick(i: number) {
  if (picked.value !== null || !quizItem.value) return;
  picked.value = i;
  if (i === quizItem.value.answer) quizScore.value++;
}
function nextQuiz() {
  picked.value = null;
  quizAt.value = (quizAt.value ?? 0) + 1;
  const total = screen.value.quiz?.length ?? 0;
  if (quizAt.value >= total && quizScore.value === total && !quizPassed(screen.value.id)) toggleUnderstood(quizKey(screen.value.id));
}

// Spots sharing one box get their markers side by side instead of stacked.
const dupIndex = (i: number) => screen.value.spots.slice(0, i).filter((s) => s.box === screen.value.spots[i]!.box).length;
const markerStyle = (b: LabBox) => ({ left: `${Math.min(b.x, 97)}%`, top: `${Math.min(b.y, 98)}%` });
const boxStyle = (b: LabBox) => ({ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` });

// "Find it" game: show what a part does, the player clicks where it is on the screenshot.
const findQueue = ref<number[] | null>(null);
const findAt = ref(0);
const findScore = ref(0);
const answer = ref<{ x: number; y: number; ok: boolean } | null>(null);
const findSpot = computed(() => (findQueue.value ? screen.value.spots[findQueue.value[findAt.value]!] ?? null : null));
const findPart = computed(() => (findSpot.value ? partById.value.get(findSpot.value.part)! : null));

function startFind() {
  quizAt.value = null;
  const order = screen.value.spots.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  selected.value = null;
  findQueue.value = order;
  findAt.value = 0;
  findScore.value = 0;
  answer.value = null;
}
function guess(e: MouseEvent) {
  if (!findSpot.value || answer.value) return;
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100;
  const ok = isInside(boxOf(findSpot.value), x, y);
  if (ok) {
    findScore.value++;
    discover(findSpot.value.part);
  }
  answer.value = { x, y, ok };
}
function nextFind() {
  answer.value = null;
  findAt.value++;
}

function onKey(e: KeyboardEvent) {
  if (findQueue.value || (e.target as HTMLElement).closest('input, textarea, select')) return;
  if (e.key === 'ArrowRight') step(1);
  else if (e.key === 'ArrowLeft') step(-1);
  else if (e.key === 'Escape') selected.value = null;
}
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

const activeBox = computed(() => {
  if (findQueue.value) return answer.value && findSpot.value ? boxOf(findSpot.value) : null;
  const i = selected.value ?? hovered.value;
  return i === null ? null : boxOf(screen.value.spots[i]!);
});
</script>

<template>
  <div class="space-y-5">
    <!-- header -->
    <header class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="inline-flex items-center gap-1 rounded-full bg-fuchsia-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200">
          <AppIcon name="sparkles" :size="13" />
          <span>{{ t('lab.badge') }}</span>
        </span>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-50">{{ project.title[lang] }}</h1>
      </div>
      <p class="max-w-3xl text-slate-600 dark:text-slate-300">{{ project.intro[lang] }}</p>
      <div class="flex flex-wrap items-center gap-3">
        <div class="h-2.5 min-w-40 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" role="progressbar" :aria-valuenow="foundTotal" aria-valuemin="0" :aria-valuemax="project.parts.length" :aria-label="t('lab.progress', { done: foundTotal, total: project.parts.length })">
          <div class="h-full rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-500 transition-all duration-500" :style="{ width: `${(foundTotal / project.parts.length) * 100}%` }" />
        </div>
        <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ t('lab.progress', { done: foundTotal, total: project.parts.length }) }}</span>
        <a :href="project.repo" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-sm text-indigo-700 underline dark:text-indigo-300">
          <AppIcon name="external-link" :size="13" /><span>GitHub</span>
        </a>
        <a v-for="o in project.outputs" :key="o.href" :href="o.href" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-sm text-emerald-700 underline dark:text-emerald-300">
          <AppIcon name="file-text" :size="13" /><span>{{ o.file }}</span>
        </a>
      </div>
    </header>

    <!-- projects -->
    <nav v-if="labProjects.length > 1" :aria-label="t('lab.projects')" class="flex flex-wrap gap-2">
      <button
        v-for="p in labProjects"
        :key="p.id"
        type="button"
        class="inline-flex min-w-40 flex-1 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors"
        :class="p.id === project.id ? 'border-fuchsia-600 bg-fuchsia-600 text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'"
        :aria-current="p.id === project.id ? 'page' : undefined"
        @click="goProject(p.id)"
      >
        <AppIcon :name="p.icon ?? 'monitor'" :size="15" />
        <span>{{ p.tab[lang] }}</span>
      </button>
    </nav>

    <!-- levels -->
    <nav :aria-label="t('lab.screens')" class="flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="(s, i) in project.screens"
        :key="s.id"
        type="button"
        class="flex shrink-0 items-center gap-2 rounded-xl border px-3 text-left text-sm transition-colors"
        :class="i === screenIndex ? 'border-indigo-700 bg-indigo-700 text-white dark:border-indigo-500 dark:bg-indigo-600' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'"
        :aria-current="i === screenIndex ? 'page' : undefined"
        @click="goScreen(i)"
      >
        <span class="font-mono text-xs opacity-75">{{ String(i + 1).padStart(2, '0') }}</span>
        <span class="font-semibold">{{ s.title[lang] }}</span>
        <span class="rounded-full px-1.5 text-xs" :class="screenFound(i) === s.spots.length ? 'bg-emerald-500 text-white' : i === screenIndex ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'">
          {{ screenFound(i) === s.spots.length ? '★' : `${screenFound(i)}/${s.spots.length}` }}
        </span>
        <span v-if="s.quiz?.length" class="text-xs" :title="t('lab.quizBadge')" :aria-label="t('lab.quizBadge')">{{ quizPassed(s.id) ? '🏆' : '?' }}</span>
      </button>
    </nav>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
      <!-- screenshot stage -->
      <section class="min-w-0 space-y-3" :aria-label="screen.title[lang]">
        <div class="flex flex-wrap items-center gap-2">
          <p class="flex-1 text-sm text-slate-600 dark:text-slate-300">{{ screen.intro[lang] }}</p>
          <button
            v-if="!findQueue"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl bg-fuchsia-600 px-3 text-sm font-semibold text-white hover:bg-fuchsia-700"
            @click="startFind"
          >
            <AppIcon name="target" :size="15" /><span>{{ t('lab.findStart') }}</span>
          </button>
          <button v-else type="button" class="rounded-xl border border-slate-400 px-3 text-sm" @click="findQueue = null">{{ t('lab.findExit') }}</button>
          <button
            v-if="screen.quiz?.length && quizAt === null"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 text-sm font-semibold text-slate-950 hover:bg-amber-400"
            @click="startQuiz"
          >
            <AppIcon name="lightbulb" :size="15" /><span>{{ t('lab.quizStart', { n: screen.quiz.length }) }}</span>
          </button>
          <button v-else-if="quizAt !== null" type="button" class="rounded-xl border border-slate-400 px-3 text-sm" @click="quizAt = null">{{ t('lab.quizExit') }}</button>
        </div>

        <!-- screen quiz -->
        <div v-if="quizAt !== null && screen.quiz" class="space-y-3 rounded-xl border-2 border-amber-400 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-950/40" aria-live="polite">
          <template v-if="quizItem">
            <p class="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
              {{ t('lab.quizProgress', { n: quizAt + 1, total: screen.quiz.length, score: quizScore }) }}
            </p>
            <p class="font-semibold text-slate-900 dark:text-slate-100">{{ quizItem.q[lang] }}</p>
            <div class="grid gap-2" role="group" :aria-label="quizItem.q[lang]">
              <button
                v-for="(o, i) in quizItem.options"
                :key="i"
                type="button"
                class="flex items-start gap-2 rounded-xl border-2 px-3 py-2 text-left text-sm transition-colors"
                :class="
                  picked === null
                    ? 'border-slate-300 bg-white hover:border-amber-500 dark:border-slate-700 dark:bg-slate-900'
                    : i === quizItem.answer
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-100'
                      : i === picked
                        ? 'border-rose-600 bg-rose-50 text-rose-950 dark:bg-rose-950/50 dark:text-rose-100'
                        : 'border-slate-200 bg-white opacity-60 dark:border-slate-800 dark:bg-slate-900'
                "
                :disabled="picked !== null"
                :aria-pressed="picked === i"
                @click="pick(i)"
              >
                <span class="font-mono font-bold">{{ 'ABCD'[i] }}</span>
                <span>{{ o[lang] }}</span>
              </button>
            </div>
            <div v-if="picked !== null" class="space-y-2">
              <p class="font-semibold" :class="picked === quizItem.answer ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'">
                {{ picked === quizItem.answer ? t('lab.findRight') : t('lab.quizWrong') }}
              </p>
              <p class="text-sm text-slate-800 dark:text-slate-200">{{ quizItem.explain[lang] }}</p>
              <button type="button" class="rounded-xl bg-amber-500 px-4 text-sm font-semibold text-slate-950" @click="nextQuiz">{{ t('lab.findNext') }}</button>
            </div>
          </template>
          <div v-else class="flex flex-wrap items-center gap-2">
            <p class="flex-1 font-semibold">
              {{ t('lab.findScore', { ok: quizScore, total: screen.quiz.length }) }}
              <span v-if="quizScore === screen.quiz.length"> · {{ t('lab.quizPerfect') }}</span>
            </p>
            <button type="button" class="rounded-xl bg-amber-500 px-3 text-sm font-semibold text-slate-950" @click="startQuiz">{{ t('lab.findAgain') }}</button>
          </div>
        </div>

        <!-- find-it prompt -->
        <div v-if="findQueue" class="rounded-xl border-2 border-fuchsia-400 bg-fuchsia-50 p-3 dark:border-fuchsia-700 dark:bg-fuchsia-950/40" role="status" aria-live="polite">
          <template v-if="findPart">
            <p class="text-xs font-semibold uppercase tracking-wide text-fuchsia-800 dark:text-fuchsia-300">
              {{ t('lab.findProgress', { n: findAt + 1, total: findQueue.length, score: findScore }) }}
            </p>
            <p class="mt-1 font-semibold text-slate-900 dark:text-slate-100">{{ t('lab.findAsk') }}</p>
            <div class="mt-1 text-slate-800 dark:text-slate-200"><FormattedText :text="findPart.what[lang]" /></div>
            <div v-if="answer" class="mt-2 flex flex-wrap items-center gap-2">
              <span class="font-semibold" :class="answer.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'">
                {{ answer.ok ? t('lab.findRight') : t('lab.findWrong') }} {{ findPart.title[lang] }}
              </span>
              <button type="button" class="ml-auto rounded-xl bg-fuchsia-600 px-3 text-sm font-semibold text-white" @click="nextFind">{{ t('lab.findNext') }}</button>
            </div>
          </template>
          <div v-else class="flex flex-wrap items-center gap-2">
            <p class="flex-1 font-semibold">{{ t('lab.findScore', { ok: findScore, total: findQueue.length }) }}</p>
            <button type="button" class="rounded-xl bg-fuchsia-600 px-3 text-sm font-semibold text-white" @click="startFind">{{ t('lab.findAgain') }}</button>
          </div>
        </div>

        <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div
            class="relative min-w-[720px] select-none xl:min-w-0 overflow-hidden"
            :class="findQueue && findPart && !answer ? 'cursor-crosshair' : ''"
            @click="findQueue ? guess($event) : undefined"
          >
            <img :src="image" :alt="screen.title[lang]" class="block w-full" :width="capture.width" :height="capture.height" draggable="false" />

            <!-- spotlight -->
            <div
              v-if="activeBox"
              class="pointer-events-none absolute rounded-lg ring-4 transition-all duration-300 ease-out"
              :class="findQueue ? (answer?.ok ? 'ring-emerald-500' : 'ring-amber-400') : 'ring-fuchsia-500'"
              :style="{ ...boxStyle(activeBox), boxShadow: selected !== null || findQueue ? '0 0 0 9999px rgb(15 23 42 / 0.55)' : 'none' }"
            />
            <span
              v-if="answer && !answer.ok"
              class="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-rose-600"
              :style="{ left: `${answer.x}%`, top: `${answer.y}%` }"
              aria-hidden="true"
            />

            <!-- hotspots -->
            <template v-if="!findQueue">
              <button
                v-for="(s, i) in screen.spots"
                :key="`${s.part}-${i}`"
                type="button"
                class="group absolute flex h-7 min-h-0 w-7 -translate-x-1/3 -translate-y-1/3 items-center justify-center rounded-full border-2 border-white font-mono text-xs font-bold shadow-lg transition-transform hover:scale-125 focus-visible:scale-125"
                :class="[
                  selected === i ? 'scale-125 bg-fuchsia-600 text-white' : found(s.part) ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white',
                ]"
                :style="{ ...markerStyle(boxOf(s)), marginLeft: `${dupIndex(i) * 32}px` }"
                :aria-label="`${i + 1}. ${partById.get(s.part)?.title[lang]}`"
                :aria-pressed="selected === i"
                @click="select(i)"
                @mouseenter="hovered = i"
                @mouseleave="hovered = null"
                @focus="hovered = i"
                @blur="hovered = null"
              >
                <span v-if="!found(s.part) && selected !== i" class="absolute inset-0 animate-ping rounded-full bg-indigo-500 opacity-60" aria-hidden="true" />
                <span class="relative">{{ found(s.part) && selected !== i ? '✓' : i + 1 }}</span>
              </button>
            </template>
          </div>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">{{ findQueue ? t('lab.findHint') : t('lab.hint') }}</p>
      </section>

      <!-- detail panel -->
      <aside ref="detailEl" class="min-w-0 scroll-mt-4 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:self-start xl:overflow-y-auto">
        <div v-if="part && spot" class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center gap-2">
            <span class="flex h-7 w-7 items-center justify-center rounded-full bg-fuchsia-600 font-mono text-xs font-bold text-white">{{ (selected ?? 0) + 1 }}</span>
            <h2 class="flex-1 text-lg font-bold text-slate-900 dark:text-slate-50">{{ part.title[lang] }}</h2>
            <button type="button" class="flex h-9 min-h-0 w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700" :aria-label="t('lab.prev')" @click="step(-1)"><AppIcon name="chevron-left" :size="16" /></button>
            <button type="button" class="flex h-9 min-h-0 w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700" :aria-label="t('lab.next')" @click="step(1)"><AppIcon name="chevron-right" :size="16" /></button>
          </div>

          <!-- zoomed crop of the part -->
          <div class="flex justify-center rounded-xl bg-slate-100 p-2 dark:bg-slate-950">
            <div class="rounded-lg bg-no-repeat shadow-inner ring-2 ring-fuchsia-500" :style="cropStyle(image, boxOf(spot), capture)" role="img" :aria-label="t('lab.crop', { part: part.title[lang] })" />
          </div>

          <p v-if="spot.note" class="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
            <strong>{{ t('lab.inThisState') }}</strong> {{ spot.note[lang] }}
          </p>

          <section class="space-y-1">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('lab.what') }}</h3>
            <div class="text-slate-800 dark:text-slate-200"><FormattedText :text="part.what[lang]" /></div>
          </section>
          <section class="space-y-1 rounded-xl border border-sky-200 bg-sky-50 p-3 dark:border-sky-800 dark:bg-sky-950/40">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-300">{{ t('lab.why') }}</h3>
            <div class="text-slate-800 dark:text-slate-200"><FormattedText :text="part.why[lang]" /></div>
          </section>
          <section class="space-y-1">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('lab.component') }}</h3>
            <code class="inline-block rounded-lg bg-slate-100 px-2 py-1 font-mono text-sm text-fuchsia-800 dark:bg-slate-800 dark:text-fuchsia-300">{{ part.component }}</code>
          </section>

          <section v-if="part.examples?.length" class="space-y-2">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('lab.examples') }}</h3>
            <figure v-for="ex in part.examples" :key="ex.file" class="space-y-1 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/40">
              <figcaption class="flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <AppIcon name="file-text" :size="13" /><span>{{ ex.file }}</span>
              </figcaption>
              <pre class="whitespace-pre-wrap break-words font-mono text-xs text-slate-800 dark:text-slate-200">{{ ex.value }}</pre>
              <p v-if="ex.note" class="text-sm text-slate-700 dark:text-slate-300">{{ ex.note[lang] }}</p>
            </figure>
          </section>

          <section class="space-y-3">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('lab.files', { n: part.files.length }) }}</h3>
            <div v-for="f in part.files" :key="f.path" class="space-y-1.5">
              <a :href="`${project.repo}/blob/main/${f.path}`" target="_blank" rel="noopener" class="inline-flex items-center gap-1 break-all font-mono text-xs text-indigo-700 underline dark:text-indigo-300">
                <AppIcon name="code" :size="13" /><span>{{ f.path }}</span>
              </a>
              <p class="text-sm text-slate-700 dark:text-slate-300"><FormattedText :text="f.role[lang]" /></p>
              <CodeBlock v-if="f.code" :code="f.code" :language="f.lang ?? 'ts'" :line-numbers="false" />
            </div>
          </section>

          <RouterLink v-if="part.focus" :to="{ path: '/focus', query: { item: part.focus } }" class="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 underline dark:text-indigo-300">
            <AppIcon name="compass" :size="14" /><span>{{ t('lab.deeper') }}</span>
          </RouterLink>
        </div>

        <div v-else class="space-y-3 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
          <p class="font-semibold text-slate-800 dark:text-slate-100">{{ t('lab.pick') }}</p>
          <ol class="space-y-1">
            <li v-for="(s, i) in screen.spots" :key="`${s.part}-${i}`">
              <button type="button" class="flex min-h-9 w-full items-center gap-2 rounded-lg px-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800" @click="select(i)" @mouseenter="hovered = i" @mouseleave="hovered = null">
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold text-white" :class="found(s.part) ? 'bg-emerald-600' : 'bg-indigo-600'">{{ found(s.part) ? '✓' : i + 1 }}</span>
                <span>{{ partById.get(s.part)?.title[lang] }}</span>
              </button>
            </li>
          </ol>
        </div>
      </aside>
    </div>
  </div>
</template>
