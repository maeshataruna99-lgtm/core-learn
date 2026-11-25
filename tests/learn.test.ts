// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import CardView from '../src/components/CardView.vue';
import LearnView from '../src/views/LearnView.vue';
import { useStore } from '../src/composables/useStore.ts';
import type { Flashcard } from '../src/core/types.ts';

function makeRouter(initial = '/learn') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/learn', component: LearnView },
    ],
  });
  void router.push(initial);
  return router;
}

describe('LearnView & CardView regression tests', () => {
  beforeEach(() => {
    localStorage.clear();
    const { reset, store } = useStore();
    reset();
    store.settings.language = 'en';
  });

  it('D-01: advances to Card 2 after answering Card 1 instead of resetting to Card 1', async () => {
    const router = makeRouter('/learn?track=typescript-node&topic=async');
    await router.isReady();
    const wrapper = mount(LearnView, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.text()).toContain('Card 1 of');

    // Answer card 1 (flashcard or mcq/output/bugspot)
    const revealBtn = wrapper.findAll('button').find((b) => b.text().includes('Reveal answer'));
    if (revealBtn) {
      await revealBtn.trigger('click');
      const knewBtn = wrapper.findAll('button').find((b) => b.text().includes('Knew it'));
      expect(knewBtn).toBeDefined();
      await knewBtn!.trigger('click');
    } else {
      const firstOption = wrapper.find('ul button');
      await firstOption.trigger('click');
    }

    const nextBtn = wrapper.findAll('button').find((b) => b.text().includes('Next card'));
    expect(nextBtn).toBeDefined();
    await nextBtn!.trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Card 2 of');
  });

  it('D-06: hides unmastered topics from direct search matches when Mastered filter is active', async () => {
    const router = makeRouter('/learn');
    await router.isReady();
    const wrapper = mount(LearnView, { global: { plugins: [router] } });
    await flushPromises();

    const masteredBtn = wrapper.findAll('button').find((b) => b.text().trim() === 'Mastered');
    expect(masteredBtn).toBeDefined();
    await masteredBtn!.trigger('click');

    const input = wrapper.find('input[type="search"]');
    await input.setValue('async');
    await flushPromises();

    expect(wrapper.text()).toContain('No tracks or topics match');
    expect(wrapper.findAll('button').some((b) => b.text().includes('Async'))).toBe(false);
  });

  it('D-08: prevents double-emitting next on rapid double click and avoids block elements inside button', async () => {
    const card: Flashcard = {
      id: 'test/flash/1',
      track: 'typescript-node',
      topic: 'async',
      level: 'beginner',
      tags: ['test'],
      type: 'flashcard',
      front: 'Question front',
      back: 'Answer back paragraph',
      explanation: 'Because reasons.',
    };
    const wrapper = mount(CardView, { props: { card } });

    const revealBtn = wrapper.findAll('button').find((b) => b.text().includes('Reveal answer'));
    expect(revealBtn).toBeDefined();
    await revealBtn!.trigger('click');

    // Revealed back text must not be inside a <button> element
    const backInsideButton = wrapper.findAll('button').some((b) => b.text().includes('Answer back paragraph'));
    expect(backInsideButton).toBe(false);

    const knewBtn = wrapper.findAll('button').find((b) => b.text().includes('Knew it'));
    await knewBtn!.trigger('click');

    const nextBtn = wrapper.findAll('button').find((b) => b.text().includes('Next card'));
    await nextBtn!.trigger('click');
    await nextBtn!.trigger('click');

    expect(wrapper.emitted('next')).toHaveLength(1);
    wrapper.unmount();
  });
});
