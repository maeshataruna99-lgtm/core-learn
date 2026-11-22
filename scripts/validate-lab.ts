import { labProjects } from '../src/content/lab/index.ts';
import { validateLab } from '../src/core/lab.ts';

const errors = validateLab(labProjects);
if (errors.length) {
  console.error(`Lab validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
for (const p of labProjects) {
  console.log(`Lab OK: ${p.id}: ${p.screens.length} screens, ${p.parts.length} parts, ${p.screens.reduce((n, s) => n + s.spots.length, 0)} spots`);
}
