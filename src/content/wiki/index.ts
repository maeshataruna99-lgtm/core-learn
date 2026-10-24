import type { WikiEntry } from '../../core/wiki.ts';
import { architectureTerms } from './architecture.ts';
import { basics } from './basics.ts';
import { dataTerms } from './data.ts';
import { resilienceTerms } from './resilience.ts';

/** Basics first (they are the first quiz terms), then the interview topics. */
export const wikiEntries: WikiEntry[] = [...basics, ...dataTerms, ...resilienceTerms, ...architectureTerms];
