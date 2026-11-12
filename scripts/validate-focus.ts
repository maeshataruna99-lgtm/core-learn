import { focusProjects } from '../src/content/focus/index.ts';
import { focusQuestions, validateFocus } from '../src/core/focus.ts';

const errors = validateFocus(focusProjects);
if (errors.length) {
  console.error(`Focus validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
for (const p of focusProjects) console.log(`Focus OK: ${p.id}: ${p.topics.length} topics, ${focusQuestions(p.topics).length} questions`);
