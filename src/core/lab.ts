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

export interface LabScreen {
  /** Also the capture name and the image file name. */
  id: string;
  title: Bi;
  intro: Bi;
  spots: LabSpot[];
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
    }
    for (const id of parts) if (!used.has(id)) errors.push(`${p.id}/${id}: part is not placed on any screen`);
  }
  return errors;
}
