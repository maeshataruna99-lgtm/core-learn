import { allCards } from '../src/content/index.ts';
import { validateCards } from '../src/core/validate.ts';

const errors = validateCards(allCards);
if (errors.length) {
  console.error(`Content validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`Content OK: ${allCards.length} cards`);
