<script setup lang="ts">
import { useStore } from '../composables/useStore.ts';

const { store } = useStore();
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold">Settings</h1>
    <label class="block">Theme
      <select v-model="store.settings.theme" class="ml-2 min-h-11 rounded border px-2 dark:bg-slate-800">
        <option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option>
      </select>
    </label>
    <label class="block">Default quiz length
      <select v-model.number="store.settings.quizLength" class="ml-2 min-h-11 rounded border px-2 dark:bg-slate-800">
        <option :value="10">10</option><option :value="20">20</option><option :value="50">50</option>
      </select>
    </label>
    <label class="flex min-h-11 items-center gap-2"><input v-model="store.settings.timer" type="checkbox" class="size-5" /> Timer on by default</label>
    <p class="text-sm text-slate-500">Language toggle (English / Indonesian) arrives in wave 4.</p>
  </div>
</template>
