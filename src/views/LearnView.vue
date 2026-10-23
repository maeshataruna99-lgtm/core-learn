<script setup lang="ts">
import { computed, ref } from 'vue';
import QuizRunner from '../components/QuizRunner.vue';
import { useStore } from '../composables/useStore.ts';
import { filterCards, learnOrder } from '../core/selection.ts';
import { TRACKS } from '../core/types.ts';
import type { Track } from '../core/types.ts';

const { cards } = useStore();
const track = ref<Track | null>(null);
const topic = ref<string | null>(null);

const tracksWithCards = computed(() => TRACKS.filter((t) => cards.some((c) => c.track === t)));
const topics = computed(() => [...new Set(filterCards(cards, { tracks: track.value ? [track.value] : [] }).map((c) => c.topic))]);
const session = computed(() =>
  track.value && topic.value ? learnOrder(cards.filter((c) => c.track === track.value && c.topic === topic.value)) : [],
);
const back = () => (topic.value ? (topic.value = null) : (track.value = null));
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold">Learn</h1>
    <button v-if="track" class="underline" @click="back">← Back</button>
    <ul v-if="!track" class="space-y-2">
      <li v-for="t in tracksWithCards" :key="t">
        <button class="w-full rounded-lg border border-slate-300 px-4 py-3 text-left dark:border-slate-600" @click="track = t">
          {{ t }} <span class="text-sm text-slate-500">({{ cards.filter((c) => c.track === t).length }} cards)</span>
        </button>
      </li>
    </ul>
    <ul v-else-if="!topic" class="space-y-2">
      <li v-for="tp in topics" :key="tp">
        <button class="w-full rounded-lg border border-slate-300 px-4 py-3 text-left dark:border-slate-600" @click="topic = tp">{{ tp }}</button>
      </li>
    </ul>
    <QuizRunner v-else :key="`${track}/${topic}`" :cards="session">
      <template #done><button class="underline" @click="topic = null">Choose another topic</button></template>
    </QuizRunner>
  </div>
</template>
