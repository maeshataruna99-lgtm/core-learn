import type { WikiCategory, WikiEntry } from '../../core/wiki.ts';

type Pair = [en: string, id: string];

/** Compact constructor so each term reads as: meaning, analogy, key points, related ids (every text is [English, Indonesian]). */
export function term(
  id: string,
  name: string,
  category: WikiCategory,
  meaning: Pair,
  analogy: Pair,
  keyPoints: Pair[],
  related: string[],
  extra: Partial<Pick<WikiEntry, 'topics' | 'docsUrl' | 'source'>> = {},
): WikiEntry {
  return {
    id, term: name, category,
    meaning: { en: meaning[0], id: meaning[1] },
    analogy: { en: analogy[0], id: analogy[1] },
    keyPoints: keyPoints.map(([en, idText]) => ({ en, id: idText })),
    related,
    ...extra,
  };
}
