import { allCards } from '../src/content/index.ts';
import { cvItems } from '../src/content/mycv/index.ts';
import { wikiEntries } from '../src/content/wiki/index.ts';
import { validateCv } from '../src/core/mycv.ts';

const errors = validateCv(cvItems, new Set(wikiEntries.map((e) => e.id)), new Set(allCards.map((c) => `${c.track}/${c.topic}`)));
if (errors.length) {
  console.error(`MyCV validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`MyCV OK: ${cvItems.length} CV points`);
