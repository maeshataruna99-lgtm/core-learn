import type { IconName } from '../components/AppIcon.vue';
import type { Bi } from './wiki.ts';

/** A box on a screenshot, in percent of the full page image. */
export interface LabBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A source file that a UI part depends on, with an optional excerpt of its code. */
export interface LabFile {
  /** Repo-relative path. */
  path: string;
  /** What this file does for the part. */
  role: Bi;
  /** A short verbatim excerpt from the file. */
  code?: string;
  lang?: string;
}

/** One part of the UI (a sidebar, a button, a panel), explained once and reused on every screen it shows on. */
export interface LabPart {
  id: string;
  title: Bi;
  /** What it is for. */
  what: Bi;
  /** Why it was built this way. */
  why: Bi;
  /** The React component or element that renders it. */
  component: string;
  files: LabFile[];
  /** A Focus topic id with the deeper theory behind this part. */
  focus?: string;
  /** What this part showed in real runs, one entry per sample file. Values are quoted from the run output. */
  examples?: LabExample[];
}

/** A real value this part produced for one sample file. */
export interface LabExample {
  /** Sample file name, e.g. "images.jpg". */
  file: string;
  /** Quoted output, kept in its original language. */
  value: string;
  /** Optional explanation of what the value shows. */
  note?: Bi;
}

/** A part placed on one screenshot. `box` names a box from the capture; `note` says what differs in this state. */
export interface LabSpot {
  part: string;
  box: string;
  note?: Bi;
}

/** A multiple-choice question about what one screen shows. */
export interface LabQuiz {
  q: Bi;
  options: Bi[];
  /** Index of the correct option. */
  answer: number;
  /** Why the answer is right, shown after answering. */
  explain: Bi;
}

export interface LabScreen {
  /** Also the capture name and the image file name. */
  id: string;
  title: Bi;
  intro: Bi;
  spots: LabSpot[];
  quiz?: LabQuiz[];
}

export interface LabCapture {
  width: number;
  height: number;
  boxes: Record<string, LabBox | null>;
}

export interface LabProject {
  id: string;
  /** Short label for the project switcher. */
  tab: Bi;
  icon?: IconName;
  title: Bi;
  intro: Bi;
  repo: string;
  /** Full outputs to open, e.g. the real `.extraction.md` files. */
  outputs?: { file: string; href: string }[];
  /** Folder under /public holding `<screen id>.jpg`. */
  imageDir: string;
  captures: Record<string, LabCapture>;
  parts: LabPart[];
  screens: LabScreen[];
}

/** Progress key for a discovered part; kept apart from wiki and focus keys. */
export const labKey = (projectId: string, partId: string) => `lab:${projectId}:${partId}`;

export const isInside = (b: LabBox, x: number, y: number) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;

/** Background style that shows only box `b` (plus a margin) of an image, for a zoomed crop. */
export function cropStyle(src: string, b: LabBox, cap: { width: number; height: number }, margin = 1.5) {
  const x = Math.max(0, b.x - margin), y = Math.max(0, b.y - margin);
  const w = Math.min(100 - x, b.w + margin * 2), h = Math.min(100 - y, b.h + margin * 2);
  const ratio = (w * cap.width) / (h * cap.height);
  const pos = (start: number, size: number) => (size >= 100 ? 0 : (start / (100 - size)) * 100);
  return {
    backgroundImage: `url("${src}")`,
    backgroundSize: `${(100 / w) * 100}% auto`,
    backgroundPosition: `${pos(x, w)}% ${pos(y, h)}%`,
    aspectRatio: String(ratio),
    width: `min(100%, ${Math.round(300 * ratio)}px)`,
  };
}

export function validateLab(projects: LabProject[]): string[] {
  const errors: string[] = [];
  const bi = (id: string, label: string, v: Bi | undefined) => {
    if (!v?.en?.trim() || !v?.id?.trim()) errors.push(`${id}: ${label} needs non-empty en and id text`);
  };
  for (const p of projects) {
    bi(p.id, 'title', p.title);
    bi(p.id, 'intro', p.intro);
    const parts = new Set<string>();
    for (const part of p.parts) {
      if (parts.has(part.id)) errors.push(`${p.id}/${part.id}: duplicate part id`);
      parts.add(part.id);
      bi(part.id, 'title', part.title);
      bi(part.id, 'what', part.what);
      bi(part.id, 'why', part.why);
      if (!part.component.trim()) errors.push(`${part.id}: needs a component`);
      for (const f of part.files) {
        if (f.path.startsWith('/') || f.path.includes('..')) errors.push(`${part.id}: bad file path "${f.path}"`);
        bi(part.id, `file ${f.path} role`, f.role);
      }
      for (const ex of part.examples ?? []) {
        if (!ex.file.trim() || !ex.value.trim()) errors.push(`${part.id}: example needs a file and a value`);
        if (ex.note) bi(part.id, `example ${ex.file} note`, ex.note);
      }
    }
    const used = new Set<string>();
    for (const s of p.screens) {
      bi(s.id, 'title', s.title);
      bi(s.id, 'intro', s.intro);
      const cap = p.captures[s.id];
      if (!cap) errors.push(`${s.id}: no capture`);
      for (const spot of s.spots) {
        used.add(spot.part);
        if (!parts.has(spot.part)) errors.push(`${s.id}: unknown part "${spot.part}"`);
        if (cap && !cap.boxes[spot.box]) errors.push(`${s.id}: box "${spot.box}" missing from capture`);
        if (spot.note) bi(`${s.id}/${spot.part}`, 'note', spot.note);
      }
      s.quiz?.forEach((q, i) => {
        const id = `${s.id}/quiz[${i}]`;
        bi(id, 'q', q.q);
        bi(id, 'explain', q.explain);
        q.options.forEach((o, j) => bi(id, `options[${j}]`, o));
        if (q.options.length < 2) errors.push(`${id}: needs at least two options`);
        if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) errors.push(`${id}: answer out of range`);
      });
    }
    for (const id of parts) if (!used.has(id)) errors.push(`${p.id}/${id}: part is not placed on any screen`);
  }
  return errors;
}

/** One step of a guided presentation: which screenshot, which box to highlight, and what the presenter says. */
export interface LabTourStep {
  project: string;
  screen: string;
  /** Box to highlight; omit for an overview step that shows the whole screen. */
  box?: string;
  /** Part with the full explanation, opened by "Show details". */
  part?: string;
  title: Bi;
  say: Bi;
  /** Zoom the camera onto the box (default true when a box is set). */
  zoom?: boolean;
}

export interface LabTour {
  id: string;
  audience: 'user' | 'dev';
  title: Bi;
  /** What the viewer can do once the tour ends. */
  goal: Bi;
  steps: LabTourStep[];
}

export const tourKey = (tourId: string) => `lab:tour:${tourId}`;

/**
 * Camera transform that brings box `b` into a frame of `frameW`x`frameH` px showing an image of `cap` proportions
 * rendered at the frame width. Returns scale and translate in px, clamped so the image always covers the frame.
 */
export function cameraFor(
  b: LabBox | null,
  cap: { width: number; height: number },
  frameW: number,
  frameH: number,
  zoom: boolean,
  maxScale = 2.4,
  /** Pixels at the bottom of the frame kept free (for a dialog); the box is fitted and centred above them. */
  reserve = 0,
) {
  const imgH = (frameW * cap.height) / cap.width;
  if (!b) return { s: 1, tx: 0, ty: imgH > frameH ? 0 : (frameH - imgH) / 2 };
  const room = Math.max(frameH * 0.3, frameH - reserve);
  const bx = (b.x / 100) * frameW, by = (b.y / 100) * imgH, bw = (b.w / 100) * frameW, bh = (b.h / 100) * imgH;
  // Zoom out below 1 only when the box would not fit the free room at all.
  const fitAll = Math.min(1, (0.92 * room) / bh, (0.96 * frameW) / bw);
  const want = zoom ? Math.min((0.7 * frameW) / bw, (0.6 * room) / bh) : 1;
  const s = Math.min(maxScale, Math.max(fitAll, want));
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const tx = s < 1 ? (frameW - frameW * s) / 2 : clamp(frameW / 2 - (bx + bw / 2) * s, frameW - frameW * s, 0);
  // With a reserve, the image may rise above the reserved strip instead of always covering the frame.
  const floor = (reserve ? room : frameH) - imgH * s;
  const ty = imgH * s <= room ? (room - imgH * s) / 2 : clamp(room / 2 - (by + bh / 2) * s, floor, 0);
  return { s, tx, ty };
}

export function validateTours(tours: LabTour[], projects: LabProject[]): string[] {
  const errors: string[] = [];
  const bi = (id: string, label: string, v: Bi | undefined) => {
    if (!v?.en?.trim() || !v?.id?.trim()) errors.push(`${id}: ${label} needs non-empty en and id text`);
  };
  const seen = new Set<string>();
  for (const tour of tours) {
    if (seen.has(tour.id)) errors.push(`${tour.id}: duplicate tour id`);
    seen.add(tour.id);
    bi(tour.id, 'title', tour.title);
    bi(tour.id, 'goal', tour.goal);
    if (tour.steps.length < 2) errors.push(`${tour.id}: needs at least two steps`);
    tour.steps.forEach((st, i) => {
      const id = `${tour.id}/steps[${i}]`;
      bi(id, 'title', st.title);
      bi(id, 'say', st.say);
      const p = projects.find((x) => x.id === st.project);
      if (!p) return errors.push(`${id}: unknown project "${st.project}"`);
      const cap = p.captures[st.screen];
      if (!cap || !p.screens.some((s) => s.id === st.screen)) return errors.push(`${id}: unknown screen "${st.screen}"`);
      if (st.box && !cap.boxes[st.box]) errors.push(`${id}: box "${st.box}" missing from capture`);
      if (st.part && !p.parts.some((x) => x.id === st.part)) errors.push(`${id}: unknown part "${st.part}"`);
    });
  }
  return errors;
}
