// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import ProgressView from '../src/views/ProgressView.vue';
import { useStore } from '../src/composables/useStore.ts';
import { cardTitle } from '../src/core/curriculum.ts';

function makeRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/progress', component: ProgressView },
      { path: '/learn', component: { template: '<div />' } },
    ],
  });
  void router.push('/progress');
  return router;
}

describe('ProgressView regression tests', () => {
  beforeEach(() => {
    localStorage.clear();
    const { reset, store } = useStore();
    reset();
    store.settings.language = 'en';
  });

  it('D-05: renders 0-count Leitner boxes with 0% height instead of fake 8% bars', async () => {
    const router = makeRouter();
    await router.isReady();
    const wrapper = mount(ProgressView, { global: { plugins: [router] } });
    await flushPromises();

    // All boxes 1..5 have count 0 when store is empty
    const bars = wrapper.findAll('[data-testid="box-bar"]');
    expect(bars.length).toBe(6);
    // Box 1..5 (indices 1..5) must have height 0%
    for (const bar of bars.slice(1)) {
      expect((bar.element as HTMLElement).style.height).toBe('0%');
    }
  });

  it('D-05: shows error message in rose/error style on bad import and resets file input', async () => {
    const router = makeRouter();
    await router.isReady();
    const wrapper = mount(ProgressView, { global: { plugins: [router] } });
    await flushPromises();

    const input = wrapper.find('input[type="file"]');
    const badFile = new File(['{invalid json'], 'bad.json', { type: 'application/json' });
    Object.defineProperty(input.element, 'files', { value: [badFile], configurable: true });
    await input.trigger('change');
    await flushPromises();

    const status = wrapper.find('[role="status"], [role="alert"]');
    expect(status.exists()).toBe(true);
    expect(status.text()).toContain('Import failed');
    expect(status.classes().join(' ')).toContain('rose');
    expect((input.element as HTMLInputElement).value).toBe('');
  });

  it('D-05: weak cards show readable title as clickable link and exclude mastered cards (box >= 4)', async () => {
    const { cards, store } = useStore();
    const weakCard = cards[0]!;
    const masteredCard = cards[1]!;
    store.progress[weakCard.id] = {
      box: 1,
      dueAt: '2026-11-26T00:00:00.000Z',
      right: 0,
      wrong: 3,
      lastSeenAt: '2026-11-25T00:00:00.000Z',
    };
    store.progress[masteredCard.id] = {
      box: 4,
      dueAt: '2026-12-10T00:00:00.000Z',
      right: 5,
      wrong: 2,
      lastSeenAt: '2026-11-25T00:00:00.000Z',
    };

    const router = makeRouter();
    await router.isReady();
    const wrapper = mount(ProgressView, { global: { plugins: [router] } });
    await flushPromises();

    const weakLinks = wrapper.findAll('[data-testid="weak-card-link"]');
    expect(weakLinks).toHaveLength(1);
    expect(weakLinks[0]!.text()).toContain(cardTitle(weakCard));
    expect(weakLinks[0]!.attributes('href')).toContain(`/learn?track=${weakCard.track}&topic=${weakCard.topic}`);
  });
});
