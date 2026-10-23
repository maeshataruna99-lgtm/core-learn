import type { Card } from '../../core/types.ts';

// No repo of mine uses a broker yet, so these cards deliberately have no `source`.
const base = { track: 'messaging' } as const;
const rmq = 'https://www.rabbitmq.com/docs';

export const cards: Card[] = [
  // ---- why-brokers ----
  {
    ...base, topic: 'why-brokers', id: 'messaging/why-brokers/at-least-once', type: 'mcq', level: 'beginner', tags: ['delivery'],
    question: 'Most brokers default to at-least-once delivery. What must consumers therefore assume?',
    options: [
      'The same message may be delivered more than once, so handlers must be idempotent',
      'Messages are delivered exactly once',
      'Messages can be lost silently',
      'Messages always arrive in the order they were sent across all queues',
    ],
    answerIndex: 0,
    explanation: 'Retries after a crash or a missing ack cause duplicates. Make processing safe to repeat, usually with a deduplication key.',
    docsUrl: `${rmq}/reliability`,
  },
  {
    ...base, topic: 'why-brokers', id: 'messaging/why-brokers/idempotent-consumer', type: 'output', level: 'intermediate', tags: ['idempotency'],
    language: 'js',
    code: `const seen = new Set();
let total = 0;
const messages = [{ id: 1, n: 5 }, { id: 2, n: 7 }, { id: 1, n: 5 }];
for (const m of messages) {
  if (seen.has(m.id)) continue;
  seen.add(m.id);
  total += m.n;
}
console.log(total);`,
    options: ['12', '17', '5', '7'],
    answerIndex: 0,
    verifiedOutput: '12',
    explanation: 'Message 1 is delivered twice, but the seen-id check makes the duplicate a no-op. In production keep processed ids in the same database transaction as the side effect.',
    docsUrl: 'https://microservices.io/patterns/communication-style/idempotent-consumer.html',
  },
  {
    ...base, topic: 'why-brokers', id: 'messaging/why-brokers/sync-vs-async', type: 'mcq', level: 'beginner', tags: ['architecture'],
    question: 'Sending a welcome email should not slow down or fail the signup request. Which approach fits?',
    options: [
      'Publish an event or job to a queue and let a worker send the email',
      'Send the email inside the request and ignore errors',
      'Poll the database every second from the browser',
      'Make the signup endpoint retry forever',
    ],
    answerIndex: 0,
    explanation: 'Moving slow or unreliable side effects behind a queue keeps the request fast and lets the worker retry independently.',
    docsUrl: 'https://www.rabbitmq.com/tutorials/tutorial-two-javascript',
  },
  // ---- rabbitmq ----
  {
    ...base, topic: 'rabbitmq', id: 'messaging/rabbitmq/exchange-types', type: 'mcq', level: 'intermediate', tags: ['rabbitmq', 'exchanges'],
    question: 'Which RabbitMQ exchange type delivers a copy of every message to all bound queues, ignoring the routing key?',
    options: ['fanout', 'direct', 'topic', 'headers'],
    answerIndex: 0,
    explanation: 'direct routes by exact key, topic by wildcard pattern (orders.*.created), headers by message headers, fanout broadcasts to every bound queue.',
    docsUrl: 'https://www.rabbitmq.com/tutorials/amqp-concepts#exchanges',
  },
  {
    ...base, topic: 'rabbitmq', id: 'messaging/rabbitmq/publish-to-exchange', type: 'flashcard', level: 'beginner', tags: ['rabbitmq'],
    front: 'Do producers publish directly to a queue in RabbitMQ?',
    back: 'No. Producers publish to an exchange, and bindings route the message to queues. The default exchange routes by queue name, which is why tutorials appear to publish straight to a queue.',
    explanation: 'Separating exchanges from queues is what allows fanout, routing and multiple consumers without changing the producer.',
    docsUrl: 'https://www.rabbitmq.com/tutorials/amqp-concepts',
  },
  {
    ...base, topic: 'rabbitmq', id: 'messaging/rabbitmq/nack-requeue-loop', type: 'mcq', level: 'advanced', tags: ['rabbitmq', 'retries'],
    question: 'A consumer calls nack with requeue=true for a message that always fails. What happens?',
    options: [
      'The message is redelivered immediately again and again, forming a poison-message loop',
      'It is deleted',
      'It moves to another exchange automatically',
      'The consumer is disconnected',
    ],
    answerIndex: 0,
    explanation: 'Requeue puts it back at the head of the queue. Reject without requeue and configure a dead-letter exchange, optionally with a delayed retry queue.',
    docsUrl: `${rmq}/dlx`,
  },
  {
    ...base, topic: 'rabbitmq', id: 'messaging/rabbitmq/dead-letter', type: 'flashcard', level: 'intermediate', tags: ['rabbitmq', 'dlx'],
    front: 'What is a dead-letter exchange (DLX)?',
    back: 'An exchange that receives messages that were rejected without requeue, expired (TTL) or dropped from a full queue. Routing them to a DLQ lets you inspect and replay failures.',
    explanation: 'Set it with the x-dead-letter-exchange queue argument or a policy.',
    docsUrl: `${rmq}/dlx`,
  },
  {
    ...base, topic: 'rabbitmq', id: 'messaging/rabbitmq/prefetch', type: 'mcq', level: 'intermediate', tags: ['rabbitmq', 'throughput'],
    question: 'What does setting prefetch (QoS) to 1 on a consumer do?',
    options: [
      'The broker sends the next message only after the previous one is acknowledged',
      'It limits the queue to one message',
      'It makes messages persistent',
      'It disables acknowledgements',
    ],
    answerIndex: 0,
    explanation: 'Prefetch caps unacknowledged messages per consumer. Low values spread slow jobs fairly across workers; higher values raise throughput for fast handlers.',
    docsUrl: `${rmq}/consumer-prefetch`,
  },
  {
    ...base, topic: 'rabbitmq', id: 'messaging/rabbitmq/durability', type: 'mcq', level: 'intermediate', tags: ['rabbitmq', 'durability'],
    question: 'Which combination lets a message survive a broker restart?',
    options: [
      'A durable queue plus persistent messages',
      'A durable exchange only',
      'Auto-ack consumers',
      'Prefetch = 1',
    ],
    answerIndex: 0,
    explanation: 'The queue must be declared durable and the message published as persistent. Add publisher confirms to know the broker really stored it.',
    docsUrl: 'https://www.rabbitmq.com/tutorials/tutorial-two-javascript#message-durability',
  },
  // ---- choosing ----
  {
    ...base, topic: 'choosing', id: 'messaging/choosing/outbox-pattern', type: 'flashcard', level: 'advanced', tags: ['patterns', 'consistency'],
    front: 'What problem does the transactional outbox pattern solve?',
    back: 'The dual-write problem: saving to the database and publishing to a broker cannot be one atomic step. Write the event to an outbox table in the same transaction, then a relay publishes it to the broker.',
    explanation: 'It guarantees the event is eventually published if and only if the data was committed. Consumers must still be idempotent.',
    docsUrl: 'https://microservices.io/patterns/data/transactional-outbox.html',
  },
];
