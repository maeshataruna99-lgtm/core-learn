import type { Card } from '../core/types.ts';
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

export const allCards: Card[] = [
  ...tsAsync, ...tsTypes, ...tsCore, ...tsAdvanced,
  ...nestGuards, ...nestCore, ...nestAdvanced,
  ...vueReactivity, ...vueCore, ...vueAdvanced,
  ...javaBasics, ...javaCore, ...javaMore,
  ...securityApi, ...securityCore,
  ...sqlIndexes, ...sqlCore,
  ...messagingBrokers, ...messagingCore,
];
