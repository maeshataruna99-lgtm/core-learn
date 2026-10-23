import type { Card } from '../core/types.ts';
import { cards as tsAsync } from './typescript-node/async.ts';
import { cards as tsTypes } from './typescript-node/types.ts';
import { cards as nestGuards } from './nestjs-prisma/guards.ts';
import { cards as vueReactivity } from './vue3/reactivity.ts';
import { cards as javaBasics } from './java-spring/basics.ts';
import { cards as securityApi } from './security/api.ts';
import { cards as sqlIndexes } from './sql-db/indexes.ts';
import { cards as messagingBrokers } from './messaging/brokers.ts';

export const allCards: Card[] = [
  ...tsAsync, ...tsTypes, ...nestGuards, ...vueReactivity,
  ...javaBasics, ...securityApi, ...sqlIndexes, ...messagingBrokers,
];
