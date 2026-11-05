import { focusTopics } from '../src/content/focus/index.ts';
import { focusQuestions, validateFocus } from '../src/core/focus.ts';

const errors = validateFocus(focusTopics);
if (errors.length) {
  console.error(`Focus validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`Focus OK: ${focusTopics.length} topics, ${focusQuestions(focusTopics).length} questions`);
