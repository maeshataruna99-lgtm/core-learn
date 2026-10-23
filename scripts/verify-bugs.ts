// For bugspot cards with a `proof`: run harness+code and harness+fixedCode in Node and check that
// the real stdout matches buggyOutput / fixedOutput. This proves the bug is observable and the fix removes it.
// The harness marks the insertion point with a comment containing CODE_HERE.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { allCards } from '../src/content/index.ts';

const MARKER = /\/\*\s*CODE_HERE\s*\*\//;
// Inside the project so `import 'vue'` resolves against node_modules.
const dir = join(import.meta.dirname, '..', '.verify-tmp');
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });

const run = (file: string) =>
  execFileSync('node', ['--no-warnings', file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

const failures: string[] = [];
let proven = 0;
let structureOnly = 0;
try {
  for (const c of allCards) {
    if (c.type !== 'bugspot') continue;
    if (!c.proof) { structureOnly++; continue; }
    if (!MARKER.test(c.proof.harness)) { failures.push(`${c.id}: harness has no CODE_HERE marker`); continue; }
    const slug = c.id.replace(/[^a-z0-9]/g, '_');
    for (const [label, code, expected] of [
      ['buggy', c.code, c.proof.buggyOutput],
      ['fixed', c.fixedCode, c.proof.fixedOutput],
    ] as const) {
      const file = join(dir, `${slug}.${label}.mts`);
      writeFileSync(file, c.proof.harness.replace(MARKER, () => code));
      let actual: string;
      try {
        actual = run(file);
      } catch (e) {
        failures.push(`${c.id}: ${label} version crashed: ${(e as Error).message.split('\n')[0]}`);
        continue;
      }
      if (actual !== expected.trim()) {
        failures.push(`${c.id}: ${label} printed ${JSON.stringify(actual)}, expected ${JSON.stringify(expected.trim())}`);
      }
    }
    proven++;
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (failures.length) {
  for (const f of failures) console.error(f);
  process.exit(1);
}
console.log(`Bugspot cards proven by execution: ${proven}; fix checked by diff only: ${structureOnly}`);
