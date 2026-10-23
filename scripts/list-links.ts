import { allCards } from '../src/content/index.ts';

const urls = new Set(allCards.map((c) => c.docsUrl).filter((u): u is string => Boolean(u)));
for (const u of [...urls].sort()) console.log(u);
