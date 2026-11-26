// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import App from '../src/App.vue';
import MyCvView from '../src/views/MyCvView.vue';
import PracticeView from '../src/views/PracticeView.vue';
import WikiView from '../src/views/WikiView.vue';
import FocusView from '../src/views/FocusView.vue';
import NotFoundView from '../src/views/NotFoundView.vue';
import QuizRunner from '../src/components/QuizRunner.vue';
import { useStore } from '../src/composables/useStore.ts';

describe('Views regression tests (MyCv, Practice, Wiki, Focus)', () => {
  beforeEach(() => {
    localStorage.clear();
    const { reset, store } = useStore();
    reset();
    store.settings.language = 'en';
    store.settings.quizLength = 10;
    store.settings.timer = false;
  });

  it('D-02: MyCvView renders synchronously without <Suspense>', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/mycv', component: MyCvView },
        { path: '/wiki', component: { template: '<div />' } },
        { path: '/learn', component: { template: '<div />' } },
      ],
    });
    await router.push('/mycv');
    await router.isReady();

    const wrapper = mount(MyCvView, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.find('h1').exists()).toBe(true);
    expect(wrapper.text().trim().length).toBeGreaterThan(20);
  });

  it('D-07: PracticeView updates form on mode change and excludes flashcards in interview poolSize', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/practice', component: PracticeView }],
    });
    await router.push('/practice?mode=interview');
    await router.isReady();

    const wrapper = mount(PracticeView, { global: { plugins: [router] } });
    await flushPromises();

    // Selecting only Flashcard/Concept in interview mode must show 0 matching cards
    const conceptBtn = wrapper.findAll('button').find((b) => b.text().includes('Concept'));
    expect(conceptBtn).toBeDefined();
    await conceptBtn!.trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('0 matching cards');

    // Navigating back to normal /practice must reset timer & length from interview defaults
    await router.push('/practice');
    await flushPromises();
    const timerBox = wrapper.find('input[type="checkbox"]');
    expect((timerBox.element as HTMLInputElement).checked).toBe(false);
    const len10Btn = wrapper.findAll('button').find((b) => b.text().trim() === '10');
    expect(len10Btn?.attributes('aria-pressed')).toBe('true');
  });

  it('D-07: QuizRunner renders done slot when queue is empty so user is not trapped', () => {
    const wrapper = mount(QuizRunner, {
      props: { cards: [] },
      slots: { done: '<button data-testid="back-btn">New session</button>' },
    });
    expect(wrapper.find('[data-testid="back-btn"]').exists()).toBe(true);
  });

  it('D-09: WikiView populates quiz automatically on direct /wiki?mode=quiz load', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/wiki', component: WikiView },
        { path: '/learn', component: { template: '<div />' } },
      ],
    });
    await router.push('/wiki?mode=quiz');
    await router.isReady();

    const wrapper = mount(WikiView, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.text()).not.toContain('You understand every term here');
    expect(wrapper.text()).toContain('Term 1 of');
  });

  it('D-09: FocusView clears expanded answers when navigating between topics', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/focus', component: FocusView }],
    });
    await router.push('/focus');
    await router.isReady();
    const wrapper = mount(FocusView, { global: { plugins: [router] } });
    await flushPromises();

    // Open first topic link
    const topicLinks = wrapper.findAll('a').filter((a) => (a.attributes('href') ?? '').includes('item='));
    expect(topicLinks.length).toBeGreaterThanOrEqual(2);
    await router.push(topicLinks[0]!.attributes('href')!);
    await flushPromises();

    const showBtn = wrapper.findAll('button').find((b) => b.text().includes('Show'));
    expect(showBtn).toBeDefined();
    await showBtn!.trigger('click');
    expect(showBtn!.attributes('aria-expanded')).toBe('true');

    // Navigate to second topic -> answer must be collapsed
    await router.push(topicLinks[1]!.attributes('href')!);
    await flushPromises();
    const secondShowBtn = wrapper.findAll('button').find((b) => b.text().includes('Show'));
    expect(secondShowBtn?.attributes('aria-expanded')).toBe('false');
  });

  it('D-09: unknown routes match 404 NotFoundView with a link back to Home', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
      ],
    });
    await router.push('/does-not-exist');
    await router.isReady();
    const wrapper = mount(NotFoundView, { global: { plugins: [router] } });
    await flushPromises();
    expect(router.currentRoute.value.name).toBe('not-found');
    expect(wrapper.text()).toContain('Page not found');
    expect(wrapper.find('a[href="/"]').exists()).toBe(true);
  });

  it('App navigation highlights MGS Live Coding separately from Focus and exposes it in mobile drawer', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/learn', component: { template: '<div>Learn</div>' } },
        { path: '/practice', component: { template: '<div>Practice</div>' } },
        { path: '/focus', component: FocusView },
        { path: '/wiki', component: { template: '<div>Wiki</div>' } },
        { path: '/lab', component: { template: '<div>Lab</div>' } },
        { path: '/mycv', component: { template: '<div>MyCV</div>' } },
        { path: '/progress', component: { template: '<div>Progress</div>' } },
        { path: '/settings', component: { template: '<div>Settings</div>' } },
      ],
    });
    await router.push('/focus?project=mgs-live-coding');
    await router.isReady();

    const wrapper = mount(App, { global: { plugins: [router] } });
    await flushPromises();

    const primaryLinks = wrapper.find('nav[aria-label="Primary"]').findAll('a');
    const mgsLink = primaryLinks.find((a) => a.text().includes('MGS Live Coding'));
    const focusLink = primaryLinks.find((a) => a.text().trim() === 'Focus');
    expect(mgsLink?.attributes('aria-current')).toBe('page');
    expect(focusLink?.attributes('aria-current')).toBeUndefined();

    // Switching to another Focus project activates Focus, not MGS Live Coding
    await router.push('/focus?project=ai-ops');
    await flushPromises();
    expect(mgsLink?.attributes('aria-current')).toBeUndefined();
    expect(focusLink?.attributes('aria-current')).toBe('page');

    // Open mobile drawer and confirm MGS shortcut is present
    const moreBtn = wrapper.find('nav[aria-label="Mobile"] button');
    await moreBtn.trigger('click');
    await flushPromises();
    const drawer = wrapper.find('#mobile-nav-drawer');
    expect(drawer.exists()).toBe(true);
    expect(drawer.text()).toContain('MGS Live Coding');
  });

  it('FocusView shows the 90-minute timer on MGS Live Coding and switches presets', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/focus', component: FocusView },
        { path: '/practice', component: { template: '<div />' } },
      ],
    });
    await router.push('/focus?project=mgs-live-coding');
    await router.isReady();

    const wrapper = mount(FocusView, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.find('[data-testid="mgs-timer-display"]').text()).toBe('90:00');

    const part2Btn = wrapper.findAll('button').find((b) => b.text().includes('Part 2'));
    expect(part2Btn).toBeDefined();
    await part2Btn!.trigger('click');
    expect(wrapper.find('[data-testid="mgs-timer-display"]').text()).toBe('40:00');
  });
});
