import { allCards } from '../src/content/index.ts';
import { wikiEntries } from '../src/content/wiki/index.ts';
import { validateWiki } from '../src/core/wiki.ts';

const errors = validateWiki(wikiEntries, new Set(allCards.map((c) => `${c.track}/${c.topic}`)));
if (errors.length) {
  console.error(`Wiki validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`Wiki OK: ${wikiEntries.length} terms`);
