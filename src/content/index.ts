import type { Card } from '../core/types.ts';
import { primers } from './primers.ts';
import { cards as tsAsync } from './typescript-node/async.ts';
import { cards as tsTypes } from './typescript-node/types.ts';
import { cards as tsCore } from './typescript-node/core.ts';
import { cards as tsAdvanced } from './typescript-node/advanced.ts';
import { cards as nestGuards } from './nestjs-prisma/guards.ts';
import { cards as nestCore } from './nestjs-prisma/core.ts';
import { cards as nestAdvanced } from './nestjs-prisma/advanced.ts';
import { cards as vueReactivity } from './vue3/reactivity.ts';
import { cards as vueCore } from './vue3/core.ts';
import { cards as vueAdvanced } from './vue3/advanced.ts';
import { cards as javaBasics } from './java-spring/basics.ts';
import { cards as javaCore } from './java-spring/core.ts';
import { cards as javaMore } from './java-spring/more.ts';
import { cards as securityApi } from './security/api.ts';
import { cards as securityCore } from './security/core.ts';
import { cards as sqlIndexes } from './sql-db/indexes.ts';
import { cards as sqlCore } from './sql-db/core.ts';
import { cards as messagingBrokers } from './messaging/brokers.ts';
import { cards as messagingCore } from './messaging/core.ts';
import { cards as tsFoundations } from './typescript-node/foundations.ts';
import { cards as nestFoundations } from './nestjs-prisma/foundations.ts';
import { cards as vueFoundations } from './vue3/foundations.ts';
import { cards as javaFoundations } from './java-spring/foundations.ts';
import { cards as securityFoundations } from './security/foundations.ts';
import { cards as sqlFoundations } from './sql-db/foundations.ts';
import { cards as messagingFoundations } from './messaging/foundations.ts';

/** Foundation files are written in teaching order; remember that order for Learn mode. */
const sequence = (cards: Card[]): Card[] => cards.map((c, i) => ({ ...c, order: i + 1 }));

const authored: Card[] = [
  ...tsAsync, ...tsTypes, ...tsCore, ...tsAdvanced,
  ...nestGuards, ...nestCore, ...nestAdvanced,
  ...vueReactivity, ...vueCore, ...vueAdvanced,
  ...javaBasics, ...javaCore, ...javaMore,
  ...securityApi, ...securityCore,
  ...sqlIndexes, ...sqlCore,
  ...messagingBrokers, ...messagingCore,
  ...sequence(tsFoundations),
  ...sequence(nestFoundations),
  ...sequence(vueFoundations),
  ...sequence(javaFoundations),
  ...sequence(securityFoundations),
  ...sequence(sqlFoundations),
  ...sequence(messagingFoundations),
];

/** Attach the beginner primers that live in primers.ts to cards that do not carry their own. */
export const allCards: Card[] = authored.map((c) => (c.primer || !primers[c.id] ? c : { ...c, primer: primers[c.id] }));
