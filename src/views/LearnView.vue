<script setup lang="ts">
import { computed, ref } from 'vue';
import QuizRunner from '../components/QuizRunner.vue';
import { useRoute } from 'vue-router';
import { useStore } from '../composables/useStore.ts';
import { filterCards, learnOrder } from '../core/selection.ts';
import { TRACKS } from '../core/types.ts';
import type { Track } from '../core/types.ts';
import { useT } from '../i18n/index.ts';

const t = useT();
const { cards } = useStore();
// /learn?track=...&topic=... opens a topic directly (the Wiki links here); unknown values fall back to the picker.
const route = useRoute();
const qTrack = TRACKS.find((tr) => tr === route.query.track) ?? null;
const qTopic = typeof route.query.topic === 'string' ? route.query.topic : null;
const track = ref<Track | null>(qTrack);
const topic = ref<string | null>(qTrack && qTopic && cards.some((c) => c.track === qTrack && c.topic === qTopic) ? qTopic : null);

const tracksWithCards = computed(() => TRACKS.filter((tr) => cards.some((c) => c.track === tr)));
const topics = computed(() => [...new Set(filterCards(cards, { tracks: track.value ? [track.value] : [] }).map((c) => c.topic))]);
const session = computed(() =>
  track.value && topic.value ? learnOrder(cards.filter((c) => c.track === track.value && c.topic === topic.value)) : [],
);
const back = () => (topic.value ? (topic.value = null) : (track.value = null));
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold">{{ t('learn.title') }}</h1>
    <button v-if="track" class="underline" @click="back">{{ t('learn.back') }}</button>
    <ul v-if="!track" class="space-y-2">
      <li v-for="tr in tracksWithCards" :key="tr">
        <button class="w-full rounded-lg border border-slate-300 px-4 py-3 text-left dark:border-slate-600" @click="track = tr">
          {{ tr }} <span class="text-sm text-slate-600 dark:text-slate-300">{{ t('learn.cards', { n: cards.filter((c) => c.track === tr).length }) }}</span>
        </button>
      </li>
    </ul>
    <ul v-else-if="!topic" class="space-y-2">
      <li v-for="tp in topics" :key="tp">
        <button class="w-full rounded-lg border border-slate-300 px-4 py-3 text-left dark:border-slate-600" @click="topic = tp">{{ tp }}</button>
      </li>
    </ul>
    <QuizRunner v-else :key="`${track}/${topic}`" :cards="session">
      <template #done>
        <button class="underline" @click="topic = null">{{ t('learn.another') }}</button>
      </template>
    </QuizRunner>
  </div>
</template>
