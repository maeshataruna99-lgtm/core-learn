import { createApp } from 'vue';
import App from './App.vue';
import { initPwa } from './composables/usePwa.ts';
import { router } from './router/index.ts';
import './style.css';

createApp(App).use(router).mount('#app');
initPwa();
