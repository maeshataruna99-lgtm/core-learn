// Captures the "MGS walkthrough" Lab screens from the real core-learn-technical repo:
// runs its commands and HTTP calls, renders terminal / code / HTTP panes, screenshots them with a
// headless Chromium (Edge or Chrome over the DevTools protocol) and measures each box.
//
// Usage: node scripts/capture-mgs-walkthrough.ts [path/to/core-learn-technical]
// Env:   BROWSER_PATH to override the browser executable.
// Writes public/lab/mgs/<screen>.jpg and src/content/lab/mgsShots.generated.ts.
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { codeToHtml } from 'shiki';

const TECH = resolve(process.argv[2] ?? '../core-learn-technical');
const OUT_IMG = 'public/lab/mgs';
const OUT_TS = 'src/content/lab/mgsShots.generated.ts';
const WIDTH = 1440;
const BROWSERS = [
  process.env.BROWSER_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter((p): p is string => Boolean(p));

// ---------- recording ----------

// eslint-disable-next-line no-control-regex
const ANSI = /\x1b\[[0-9;?]*[A-Za-z]/g;
// Prisma prints random product tips; they are not part of what the step shows.
const NOISE = /^(Tip:|.*pris\.ly\/tip|┌|│|└|Update available)/;

interface Term {
  cmd: string;
  out: string[];
}

function clean(text: string): string[] {
  return text
    .replace(ANSI, '')
    .replace(/\r/g, '')
    .split('\n')
    .filter((l) => !NOISE.test(l.trim()));
}

function run(cmd: string, env: Record<string, string | undefined> = {}, shown = cmd): Term {
  const merged: NodeJS.ProcessEnv = { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' };
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete merged[k];
    else merged[k] = v;
  }
  const r = spawnSync(cmd, { cwd: TECH, env: merged, shell: true, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: 300_000 });
  if (r.error) throw new Error(`${shown}: ${r.error.message}`);
  const out = clean(`${r.stdout ?? ''}${r.stderr ?? ''}`);
  while (out.length && !out[out.length - 1]!.trim()) out.pop();
  if (r.status !== 0) out.push(`(exit code ${r.status})`);
  return { cmd: shown, out };
}

interface Exchange {
  box: string;
  method: string;
  path: string;
  body?: unknown;
  status: number;
  response: unknown;
}

async function recordHttp(dbUrl: string): Promise<Exchange[]> {
  const port = 3457;
  const base = `http://127.0.0.1:${port}`;
  const server: ChildProcess = spawn(process.execPath, ['part2-api/dist/main.js'], {
    cwd: TECH,
    env: { ...process.env, DATABASE_URL: dbUrl, PORT: String(port) },
    stdio: 'ignore',
  });
  try {
    for (let i = 0; ; i++) {
      try {
        if ((await fetch(`${base}/health`)).ok) break;
      } catch {
        // not listening yet
      }
      if (i > 60) throw new Error('API did not start');
      await new Promise((r) => setTimeout(r, 500));
    }
    const out: Exchange[] = [];
    const call = async (box: string, method: string, path: string, body?: unknown) => {
      const res = await fetch(base + path, {
        method,
        headers: body ? { 'content-type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const text = await res.text();
      const ex: Exchange = { box, method, path, body, status: res.status, response: text ? JSON.parse(text) : null };
      out.push(ex);
      return ex;
    };
    await call('health200', 'GET', '/health');
    const created = await call('create201', 'POST', '/api/v1/tickets', { title: 'Fix login timeout', priority: 'HIGH' });
    const id = (created.response as { id: number }).id;
    await call('validation400', 'POST', '/api/v1/tickets', { title: 'ab', status: 'DONE' });
    await call('fkey400', 'POST', '/api/v1/tickets', { title: 'Assign a ghost', assigneeId: 999 });
    await call('listMeta', 'GET', '/api/v1/tickets?status=OPEN&page=1&limit=2');
    await call('conflict409', 'PATCH', `/api/v1/tickets/${id}/status`, { status: 'DONE' });
    await call('transition200', 'PATCH', `/api/v1/tickets/${id}/status`, { status: 'IN_PROGRESS' });
    await call('delete204', 'DELETE', `/api/v1/tickets/${id}`);
    await call('delete404', 'DELETE', `/api/v1/tickets/${id}`);
    return out;
  } finally {
    server.kill();
  }
}

// ---------- panes ----------

interface Box {
  id: string;
  from: number; // 1-based line within the pane
  to: number;
}
type Pane =
  | { kind: 'code'; title: string; lang: string; code: string; start: number; boxes: Box[] }
  | { kind: 'term'; title: string; lines: string[]; boxes: Box[] }
  | { kind: 'http'; items: Exchange[] };

function source(file: string): string[] {
  return readFileSync(join(TECH, file), 'utf8').replace(/\r/g, '').split('\n');
}

/** Lines of `file` from the first line containing `from` through the first later line containing `to`
 * (a `^` prefix means the whole line must equal the rest, e.g. `^}` for a top-level closing brace). */
function excerpt(file: string, from: string, to?: string) {
  const all = source(file);
  const a = all.findIndex((l) => l.includes(from));
  if (a < 0) throw new Error(`${file}: marker not found: ${from}`);
  const hit = (l: string) => (to!.startsWith('^') ? l === to!.slice(1) : l.includes(to!));
  let b = to === undefined ? all.length - 1 : all.findIndex((l, i) => i > a && hit(l));
  if (b < 0) throw new Error(`${file}: end marker not found: ${to}`);
  while (b > a && !all[b]!.trim()) b--;
  return { code: all.slice(a, b + 1).join('\n'), start: a + 1 };
}

/** A box over the lines from the one containing `from` to the one containing `to` (or `from` alone). */
function box(id: string, lines: string[], from: string, to?: string): Box {
  const a = lines.findIndex((l) => l.includes(from));
  if (a < 0) throw new Error(`box ${id}: marker not found: ${from}`);
  const b = to === undefined ? a : lines.findIndex((l, i) => i >= a && l.includes(to));
  if (b < 0) throw new Error(`box ${id}: end marker not found: ${to}`);
  return { id, from: a + 1, to: b + 1 };
}

function codePane(file: string, lang: string, range: { code: string; start: number }, boxes: (lines: string[]) => Box[]): Pane {
  return { kind: 'code', title: file, lang, code: range.code, start: range.start, boxes: boxes(range.code.split('\n')) };
}

function termPane(title: string, terms: Term[], boxes: (lines: string[]) => Box[]): Pane {
  const lines = terms.flatMap((t, i) => [...(i ? [''] : []), `$ ${t.cmd}`, ...t.out]);
  return { kind: 'term', title, lines, boxes: boxes(lines) };
}

// ---------- html ----------

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function paneHtml(p: Pane, idx: number): Promise<string> {
  if (p.kind === 'code') {
    const html = await codeToHtml(p.code, {
      lang: p.lang,
      theme: 'github-dark',
      transformers: [
        {
          line(node, line) {
            node.properties['data-line'] = line;
            node.properties['data-n'] = p.start + line - 1;
          },
        },
      ],
    });
    return `<section class="pane" data-pane="${idx}"><header>${esc(p.title)}</header>${html}</section>`;
  }
  if (p.kind === 'term') {
    const rows = p.lines
      .map((l, i) => {
        const cls = l.startsWith('$ ')
          ? 'cmd'
          : /✔|✓|ℹ pass [1-9]|passed|success|executed|applied/i.test(l) && !/fail(ed)? [1-9]/.test(l)
            ? 'ok'
            : /✖|✕|ℹ fail [1-9]|failed|Invalid|exit code [1-9]|Error/.test(l)
              ? 'bad'
              : '';
        return `<div class="tl ${cls}" data-line="${i + 1}">${esc(l) || '&nbsp;'}</div>`;
      })
      .join('');
    return `<section class="pane term" data-pane="${idx}"><header>${esc(p.title)}</header><div class="tbody">${rows}</div></section>`;
  }
  const cards = p.items
    .map((x) => {
      const req = x.body === undefined ? '' : `<pre class="req">${esc(JSON.stringify(x.body, null, 2))}</pre>`;
      const res = x.response === null ? '<pre class="res empty">(no body)</pre>' : `<pre class="res">${esc(JSON.stringify(trimList(x.response), null, 2))}</pre>`;
      const tone = x.status < 300 ? 'ok' : x.status < 500 ? 'warn' : 'bad';
      return `<article class="card" data-box="${x.box}"><div class="line1"><span class="m m-${x.method}">${x.method}</span><code>${esc(x.path)}</code><span class="st ${tone}">${x.status}</span></div>${req}${res}</article>`;
    })
    .join('');
  return `<section class="http" data-pane="${idx}">${cards}</section>`;
}

/** Long lists keep the first item plus a count, so a card stays readable. The count is real. */
function trimList(v: unknown): unknown {
  if (v && typeof v === 'object' && Array.isArray((v as { data?: unknown }).data)) {
    const d = (v as { data: unknown[] }).data;
    if (d.length > 1) return { ...(v as object), data: [d[0], `… ${d.length - 1} more item(s)`] };
  }
  return v;
}

const CSS = `
*{box-sizing:border-box}body{margin:0;background:#0b1020;color:#e6edf3;font:14px/1.45 "Cascadia Mono",Consolas,"SFMono-Regular",Menlo,monospace;width:${WIDTH}px}
.wrap{display:flex;gap:16px;padding:20px;align-items:flex-start}.col{display:flex;flex-direction:column;gap:16px;flex:1;min-width:0}
.pane{border:1px solid #30363d;border-radius:10px;overflow:hidden;background:#24292e}
.pane header{background:#161b22;color:#9da7b3;padding:7px 12px;font-size:12.5px;border-bottom:1px solid #30363d}
.pane pre{margin:0;padding:8px 0;background:#24292e!important;overflow:hidden;white-space:normal}
.pane .line{display:block;white-space:pre-wrap;word-break:break-word;padding:0 12px 0 56px;text-indent:-56px}
.pane .line::before{content:attr(data-n);display:inline-block;width:56px;padding-right:12px;text-align:right;color:#57606a;text-indent:0}
.term{background:#0d1117}.term .tbody{padding:8px 12px}.tl{white-space:pre-wrap;word-break:break-word;color:#c9d1d9}
.tl.cmd{color:#79c0ff;font-weight:600}.tl.ok{color:#56d364}.tl.bad{color:#ff7b72}
.http{display:grid;grid-template-columns:1fr 1fr;gap:14px;flex:1}
.card{border:1px solid #30363d;border-radius:10px;background:#0d1117;padding:10px 12px}
.line1{display:flex;align-items:center;gap:10px;margin-bottom:6px}.line1 code{color:#e6edf3;flex:1}
.m{font-weight:700;font-size:12px;padding:2px 7px;border-radius:6px;background:#1f6feb33;color:#79c0ff}.m-POST{background:#23863633;color:#56d364}.m-PATCH{background:#9e6a0333;color:#e3b341}.m-DELETE{background:#da363333;color:#ff7b72}
.st{font-weight:700;padding:2px 8px;border-radius:6px}.st.ok{background:#23863633;color:#56d364}.st.warn{background:#9e6a0333;color:#e3b341}.st.bad{background:#da363333;color:#ff7b72}
.card pre{margin:6px 0 0;padding:8px;border-radius:6px;white-space:pre-wrap;word-break:break-word;font-size:12.5px}
.req{background:#161b22;color:#a5d6ff}.res{background:#161b22;color:#c9d1d9}.res.empty{color:#6e7681}
`;

async function pageHtml(columns: Pane[][]): Promise<string> {
  let i = 0;
  const cols: string[] = [];
  for (const col of columns) {
    const parts: string[] = [];
    for (const p of col) parts.push(await paneHtml(p, i++));
    cols.push(`<div class="col">${parts.join('')}</div>`);
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="wrap">${cols.join('')}</div></body></html>`;
}

// ---------- browser ----------

interface Cdp {
  send: (method: string, params?: object) => Promise<Record<string, unknown>>;
  once: (event: string) => Promise<void>;
  close: () => void;
}

async function connect(wsUrl: string): Promise<Cdp> {
  const ws = new WebSocket(wsUrl);
  await new Promise((r, j) => {
    ws.onopen = r;
    ws.onerror = j;
  });
  let next = 0;
  const pending = new Map<number, (m: { result?: Record<string, unknown>; error?: { message: string } }) => void>();
  const waiters = new Map<string, () => void>();
  ws.onmessage = (e) => {
    const m = JSON.parse(String(e.data));
    if (m.id) pending.get(m.id)?.(m);
    else waiters.get(m.method)?.();
  };
  return {
    send: (method, params = {}) =>
      new Promise((res, rej) => {
        const id = ++next;
        pending.set(id, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result ?? {})));
        ws.send(JSON.stringify({ id, method, params }));
      }),
    once: (event) => new Promise((r) => waiters.set(event, r)),
    close: () => ws.close(),
  };
}

async function openBrowser(): Promise<{ cdp: Cdp; stop: () => Promise<void> }> {
  const exe = BROWSERS.find((p) => existsSync(p));
  if (!exe) throw new Error('No Chromium browser found; set BROWSER_PATH');
  const port = 9333;
  const profile = mkdtempSync(join(tmpdir(), 'mgs-capture-'));
  const proc = spawn(exe, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--disable-gpu', '--hide-scrollbars', '--remote-allow-origins=*', 'about:blank'], { stdio: 'ignore' });
  let ws = '';
  for (let i = 0; !ws; i++) {
    try {
      const list = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()) as { type: string; webSocketDebuggerUrl: string }[];
      ws = list.find((t) => t.type === 'page')?.webSocketDebuggerUrl ?? '';
    } catch {
      // browser still starting
    }
    if (!ws) {
      if (i > 50) throw new Error('Browser did not expose a page target');
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  const cdp = await connect(ws);
  await cdp.send('Page.enable');
  return {
    cdp,
    stop: async () => {
      cdp.close();
      const exited = new Promise((r) => proc.once('exit', r));
      proc.kill();
      await exited;
      // The browser's helper processes can hold the profile a little longer; a leftover temp dir is harmless.
      try {
        rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
      } catch {
        console.warn(`could not remove ${profile}`);
      }
    },
  };
}

type Capture = { width: number; height: number; boxes: Record<string, { x: number; y: number; w: number; h: number }> };

async function shoot(cdp: Cdp, file: string, columns: Pane[][], out: string): Promise<Capture> {
  writeFileSync(file, await pageHtml(columns));
  // A short viewport so scrollHeight is the content height, not the viewport's.
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 200, deviceScaleFactor: 1, mobile: false });
  const loaded = cdp.once('Page.loadEventFired');
  await cdp.send('Page.navigate', { url: pathToFileURL(file).href });
  await loaded;
  const specs = columns.flat().map((p) => (p.kind === 'http' ? [] : p.boxes));
  const expr = `(async () => {
    await document.fonts.ready;
    const W = document.documentElement.scrollWidth, H = document.documentElement.scrollHeight, pad = 4;
    const pct = (r) => ({ x: +(r.left / W * 100).toFixed(2), y: +(r.top / H * 100).toFixed(2), w: +(r.width / W * 100).toFixed(2), h: +(r.height / H * 100).toFixed(2) });
    const boxes = {};
    const specs = ${JSON.stringify(specs)};
    specs.forEach((list, i) => {
      const pane = document.querySelector('[data-pane="' + i + '"]');
      for (const b of list) {
        const rows = [...pane.querySelectorAll('[data-line]')].filter((el) => { const n = +el.dataset.line; return n >= b.from && n <= b.to; });
        const rs = rows.map((el) => el.getBoundingClientRect());
        const p = pane.getBoundingClientRect();
        const top = Math.min(...rs.map((r) => r.top)) - pad, bottom = Math.max(...rs.map((r) => r.bottom)) + pad;
        boxes[b.id] = pct({ left: p.left + 2, top, width: p.width - 4, height: bottom - top });
      }
    });
    for (const el of document.querySelectorAll('[data-box]')) {
      const r = el.getBoundingClientRect();
      boxes[el.dataset.box] = pct({ left: r.left - pad, top: r.top - pad, width: r.width + pad * 2, height: r.height + pad * 2 });
    }
    return JSON.stringify({ width: W, height: H, boxes });
  })()`;
  const r = await cdp.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  const cap = JSON.parse((r.result as { value: string }).value) as Capture;
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: cap.height, deviceScaleFactor: 1, mobile: false });
  const shot = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 88, captureBeyondViewport: true });
  writeFileSync(out, Buffer.from(shot.data as string, 'base64'));
  return cap;
}

// ---------- screens ----------

async function main(): Promise<void> {
  if (!existsSync(join(TECH, 'part2-api'))) throw new Error(`Not the core-learn-technical repo: ${TECH}`);
  console.log(`Recording from ${TECH}`);

  // A throwaway database next to the schema (gitignored by *.db), removed at the end.
  const dbFile = join(TECH, 'part2-api/prisma/walkthrough.db');
  const dbUrl = 'file:./walkthrough.db';
  rmSync(dbFile, { force: true });

  run('npm run build');
  const algo = run('npm run test:algo');
  // A wrong value, not a missing one: Prisma Client loads a local .env on import, which would fill a missing var.
  const envWrongUrl = run('node part2-api/dist/main.js', { DATABASE_URL: 'postgres://localhost:5432/app' }, 'DATABASE_URL=postgres://localhost:5432/app node part2-api/dist/main.js');
  const envBadPort = run('node part2-api/dist/main.js', { DATABASE_URL: 'file:./dev.db', PORT: 'abc' }, 'DATABASE_URL=file:./dev.db PORT=abc node part2-api/dist/main.js');
  const countCmd = `node -e "const p=new (require('@prisma/client').PrismaClient)();Promise.all([p.user.count(),p.ticket.count()]).then(([users,tickets])=>console.log({users,tickets}))"`;
  const dbEnv = { DATABASE_URL: dbUrl };
  const setup1 = run('npm run db:setup', dbEnv);
  const count1 = run(countCmd, dbEnv);
  const setup2 = run('npm run db:setup', dbEnv, 'npm run db:setup   # run it again');
  const count2 = run(countCmd, dbEnv);
  const http = await recordHttp(dbUrl);
  const review = run('npx jest --selectProjects review --verbose');
  const lint = run('npm run lint');
  const typecheck = run('npm run typecheck');
  const all = run('npm test');
  rmSync(dbFile, { force: true });

  const keep = /^> |ℹ (tests|pass|fail)|Test Suites:|Tests:|PASS |FAIL /;
  const allSummary: Term = { cmd: 'npm test   # summary lines only', out: all.out.filter((l) => keep.test(l)) };

  const screens: Record<string, Pane[][]> = {
    foundation: [
      [codePane('tsconfig.base.json', 'json', excerpt('tsconfig.base.json', '{'), (l) => [box('strictFlags', l, '"strict"', '"noUnusedParameters"')])],
      [codePane('.github/workflows/ci.yml', 'yaml', excerpt('.github/workflows/ci.yml', 'name: CI'), (l) => [box('ciSteps', l, '- run: npm ci', '- run: npm test')])],
    ],
    'algo-code': [
      [
        codePane('part1-algorithm/src/summarize-payments.ts', 'ts', excerpt('part1-algorithm/src/summarize-payments.ts', '/**'), (l) => [
          box('skipRule', l, "tx.status !== 'PAID'"),
          box('tieBreak', l, '.sort('),
        ]),
      ],
      [
        codePane('part1-algorithm/src/rate-limiter.ts', 'ts', excerpt('part1-algorithm/src/rate-limiter.ts', 'allow(userId', 'return true;'), (l) => [
          box('windowDrop', l, 'const minValid', 'while (log.length'),
          box('rejectNoRecord', l, 'if (log.length >= this.limit)', 'log.push'),
        ]),
      ],
    ],
    'algo-tests': [[termPane('Terminal: Part 1 tests (node:test)', [algo], (l) => [box('edgeTests', l, 'rejected requests are not recorded'), box('algoSummary', l, 'ℹ tests', 'ℹ fail')])]],
    'api-guardrails': [
      [termPane('Terminal: start without a valid environment', [envWrongUrl, envBadPort], (l) => [box('envError', l, 'Invalid environment: DATABASE_URL', 'PORT must be an integer')])],
      [
        codePane('part2-api/src/configure-app.ts', 'ts', excerpt('part2-api/src/configure-app.ts', 'export function configureApp', 'useGlobalFilters'), (l) => [
          box('globalPrefix', l, '// Probes', 'setGlobalPrefix'),
          box('validationPipe', l, 'useGlobalPipes', '}),'),
          box('filterOrder', l, '// Catch-all first', 'useGlobalFilters'),
        ]),
      ],
    ],
    'db-setup': [
      [termPane('Terminal: migrate + seed, twice', [setup1, count1, setup2, count2], (l) => [box('migrateDeploy', l, 'prisma migrate deploy', 'All migrations have been successfully applied'), box('seedIdempotent', l, '# run it again', '{ users')])],
      [
        codePane('part2-api/prisma/schema.prisma', 'prisma', excerpt('part2-api/prisma/schema.prisma', 'model Ticket'), (l) => [
          box('setNull', l, '// Optional', 'onDelete: SetNull'),
          box('indexes', l, '// GET /tickets', '@@index([assigneeId])'),
        ]),
      ],
    ],
    'http-tickets': [[{ kind: 'http', items: http }]],
    'atomic-update': [
      [
        codePane('part2-api/src/tickets/tickets.service.ts', 'ts', excerpt('part2-api/src/tickets/tickets.service.ts', '// The only allowed moves', 'filter((from)'), (l) => [box('allowedFrom', l, 'const NEXT_STATUS', 'filter((from)')]),
        codePane('part2-api/src/tickets/tickets.service.ts', 'ts', excerpt('part2-api/src/tickets/tickets.service.ts', 'async updateStatus', 'findUniqueOrThrow'), (l) => [
          box('updateMany', l, 'updateMany', 'data: { status: next }'),
          box('zeroRows', l, 'if (count === 0)', 'ConflictException'),
        ]),
      ],
      [codePane('part2-api/test/tickets.spec.ts', 'ts', excerpt('part2-api/test/tickets.spec.ts', 'lets exactly one of two concurrent', 'toEqual([200, 409])'), (l) => [box('raceTest', l, 'Promise.all', 'toEqual([200, 409])')])],
    ],
    'review-diff': [
      [
        codePane('part3-review/vulnerable/ticket-service.ts', 'ts', excerpt('part3-review/vulnerable/ticket-service.ts', 'export async function searchTickets', '^}'), (l) => [box('unsafeQuery', l, '$queryRawUnsafe', ');')]),
        codePane('part3-review/vulnerable/ticket-service.ts', 'ts', excerpt('part3-review/vulnerable/ticket-service.ts', 'export async function closeTicket', 'return { status: 200'), (l) => [box('noTransaction', l, 'try {', 'return { status: 200')]),
      ],
      [
        codePane('part3-review/fixed/ticket-service.ts', 'ts', excerpt('part3-review/fixed/ticket-service.ts', 'export async function searchTickets', 'LIMIT'), (l) => [box('safeQuery', l, 'const pattern', 'LIMIT')]),
        codePane('part3-review/fixed/ticket-service.ts', 'ts', excerpt('part3-review/fixed/ticket-service.ts', 'export async function closeTicket', "return { status: 200, body: { ok: true } }"), (l) => [box('withTransaction', l, '$transaction', "message: 'Internal server error'")]),
      ],
    ],
    'review-tests': [[termPane('Terminal: Part 3 proofs (Jest, real SQLite)', [review], (l) => [box('provedPairs', l, '1. SQL injection', 'fixed: the payload'), box('rollbackProof', l, '6 + 7.', 'Bob cannot close'), box('reviewSummary', l, 'Tests:')])]],
    'all-green': [[termPane('Terminal: final check', [lint, typecheck, allSummary], (l) => [box('lintClean', l, '$ npm run lint', 'tsc --noEmit -p part3-review'), box('allSuites', l, 'ℹ tests 16', 'Tests:')])]],
  };

  mkdirSync(OUT_IMG, { recursive: true });
  const tmp = mkdtempSync(join(tmpdir(), 'mgs-pages-'));
  const { cdp, stop } = await openBrowser();
  const captures: Record<string, Capture> = {};
  try {
    for (const [id, columns] of Object.entries(screens)) {
      captures[id] = await shoot(cdp, join(tmp, `${id}.html`), columns, join(OUT_IMG, `${id}.jpg`));
      console.log(`captured ${id}: ${captures[id].height}px, ${Object.keys(captures[id].boxes).length} boxes`);
    }
  } finally {
    await stop();
    rmSync(tmp, { recursive: true, force: true });
  }
  writeFileSync(
    OUT_TS,
    `// Generated by scripts/capture-mgs-walkthrough.ts from the real core-learn-technical repo output.\n// Boxes are percentages of the full page image. Do not edit by hand; rerun the script.\nexport const mgsShots = ${JSON.stringify(captures, null, 2)};\n`,
  );
  console.log(`wrote ${OUT_TS}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
