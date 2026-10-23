// Runs every `output` card's code (js via node, java via `java Main.java`) and checks
// that the real stdout matches both `verifiedOutput` and the option at `answerIndex`.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { allCards } from '../src/content/index.ts';

const norm = (s: string) => s.replace(/\r\n/g, '\n').trim();
// Option text is prose; the verified output is the source of truth for the match below.
const failures: string[] = [];
let checked = 0;
const skipped: string[] = [];

for (const c of allCards) {
  if (c.type !== 'output') continue;
  if (c.verifiedOutput === undefined) { skipped.push(c.id); continue; }
  const dir = mkdtempSync(join(tmpdir(), 'cl-'));
  try {
    let out: string;
    if (c.language === 'js') {
      const f = join(dir, 'main.js');
      writeFileSync(f, c.code);
      out = execFileSync('node', [f], { encoding: 'utf8' });
    } else if (c.language === 'java') {
      const f = join(dir, 'Main.java');
      writeFileSync(f, c.code);
      out = execFileSync('java', [f], { encoding: 'utf8' });
    } else { skipped.push(c.id); continue; }
    checked++;
    if (norm(out) !== norm(c.verifiedOutput)) {
      failures.push(`${c.id}: real output ${JSON.stringify(norm(out))} != verifiedOutput ${JSON.stringify(norm(c.verifiedOutput))}`);
    }
    const flat = (s: string) => norm(s).replace(/\s+then\s+/g, ' ').replace(/\s+/g, ' ');
    const matching = c.options.map((o, i) => (flat(o) === flat(out) ? i : -1)).filter((i) => i >= 0);
    if (matching.length !== 1 || matching[0] !== c.answerIndex) {
      failures.push(`${c.id}: real output matches option(s) [${matching}] but answerIndex is ${c.answerIndex}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

if (skipped.length) console.warn(`Unverified output cards: ${skipped.join(', ')}`);
if (failures.length) { for (const f of failures) console.error(f); process.exit(1); }
console.log(`Output cards verified by execution: ${checked}`);
