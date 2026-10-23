import { onMounted, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { createHighlighterCore } from 'shiki/core';
import type { HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

export interface Token {
  content: string;
  style: Record<string, string>;
}

// Only the languages the cards use (ts, js, vue, java, sql, json, bash, yaml) are bundled.
const LANGS = {
  typescript: () => import('shiki/langs/typescript.mjs'),
  javascript: () => import('shiki/langs/javascript.mjs'),
  vue: () => import('shiki/langs/vue.mjs'),
  java: () => import('shiki/langs/java.mjs'),
  sql: () => import('shiki/langs/sql.mjs'),
  json: () => import('shiki/langs/json.mjs'),
  bash: () => import('shiki/langs/bash.mjs'),
  yaml: () => import('shiki/langs/yaml.mjs'),
} as const;
const ALIAS: Record<string, keyof typeof LANGS> = { ts: 'typescript', js: 'javascript', sh: 'bash', yml: 'yaml' };

let highlighter: Promise<HighlighterCore> | null = null;
function load(): Promise<HighlighterCore> {
  highlighter ??= createHighlighterCore({
    themes: [import('shiki/themes/github-light.mjs'), import('shiki/themes/github-dark.mjs')],
    langs: Object.values(LANGS).map((l) => l()),
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

/** Tokens per line, or null when highlighting is unavailable (the caller falls back to plain text). */
export async function highlight(code: string, language: string): Promise<Token[][] | null> {
  const lang = ALIAS[language] ?? (language as keyof typeof LANGS);
  if (!(lang in LANGS)) return null;
  try {
    const hl = await load();
    const { tokens } = hl.codeToTokens(code, {
      lang,
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    });
    return tokens.map((line) =>
      line.map((t) => ({ content: t.content, style: (t.htmlStyle as Record<string, string>) ?? {} })),
    );
  } catch {
    return null;
  }
}

export function useHighlightedLines(code: () => string, language: () => string): Ref<Token[][] | null> {
  const lines = ref<Token[][] | null>(null);
  const run = async () => {
    lines.value = await highlight(code(), language());
  };
  onMounted(run);
  watch([code, language], run);
  return lines;
}
