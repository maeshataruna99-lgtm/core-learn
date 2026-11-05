import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
    { path: '/learn', name: 'learn', component: () => import('../views/LearnView.vue') },
    { path: '/practice', name: 'practice', component: () => import('../views/PracticeView.vue') },
    { path: '/wiki', name: 'wiki', component: () => import('../views/WikiView.vue') },
    { path: '/mycv', name: 'mycv', component: () => import('../views/MyCvView.vue') },
    { path: '/focus', name: 'focus', component: () => import('../views/FocusView.vue') },
    { path: '/progress', name: 'progress', component: () => import('../views/ProgressView.vue') },
    { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
  ],
});
