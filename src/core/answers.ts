import type { Card } from './types.ts';

/**
 * mcq/output: chosen option index. bugspot: tapped 1-based line number.
 * flashcard: true when the user knew it.
 */
export function isCorrect(card: Card, response: number | boolean): boolean {
  switch (card.type) {
    case 'flashcard':
      return response === true;
    case 'mcq':
    case 'output':
      return response === card.answerIndex;
    case 'bugspot':
      return typeof response === 'number' && card.buggyLines.includes(response);
  }
}
