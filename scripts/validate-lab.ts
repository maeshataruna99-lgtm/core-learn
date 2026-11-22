import { labProjects } from '../src/content/lab/index.ts';
import { labTours } from '../src/content/lab/tours.ts';
import { validateLab, validateTours } from '../src/core/lab.ts';

const errors = [...validateLab(labProjects), ...validateTours(labTours, labProjects)];
if (errors.length) {
  console.error(`Lab validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
for (const p of labProjects) {
  console.log(`Lab OK: ${p.id}: ${p.screens.length} screens, ${p.parts.length} parts, ${p.screens.reduce((n, s) => n + s.spots.length, 0)} spots`);
}
for (const t of labTours) console.log(`Tour OK: ${t.id}: ${t.steps.length} steps`);
