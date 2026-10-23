import type { Card } from '../../core/types.ts';

// No repo of mine uses a broker yet, so these cards deliberately have no `source`.
const base = { track: 'messaging' } as const;
const rmq = 'https://www.rabbitmq.com/docs';
const kafka = 'https://kafka.apache.org/documentation';

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
    docsUrl: `${rmq}/persistence-conf`,
  },
  // ---- kafka ----
  {
    ...base, topic: 'kafka', id: 'messaging/kafka/consumer-group', type: 'mcq', level: 'intermediate', tags: ['kafka', 'consumer-groups'],
    question: 'A topic has 3 partitions and one consumer group has 5 consumers. How many consumers receive messages?',
    options: ['3, because each partition is read by one consumer in the group', '5', '1', '15'],
    answerIndex: 0,
    explanation: 'Within a group each partition is assigned to at most one consumer, so parallelism is capped by the partition count. Extra consumers sit idle as standbys.',
    docsUrl: `${kafka}/#intro_consumers`,
  },
  {
    ...base, topic: 'kafka', id: 'messaging/kafka/offset-replay', type: 'output', level: 'intermediate', tags: ['kafka', 'offsets'],
    language: 'js',
    code: `const log = ['a', 'b', 'c', 'd'];
let offset = 2;
console.log(log.slice(offset).join(''));
offset = 0; // seek back to the beginning to replay
console.log(log.slice(offset).join(''));`,
    options: ['cd then abcd', 'ab then abcd', 'cd then cd', 'abcd then cd'],
    answerIndex: 0,
    verifiedOutput: 'cd\nabcd',
    explanation: 'A Kafka partition is an append-only log and a consumer is just an offset into it. Resetting the offset replays history, which a classic queue (messages deleted on ack) cannot do.',
    docsUrl: `${kafka}/#intro_concepts_and_terms`,
  },
  {
    ...base, topic: 'kafka', id: 'messaging/kafka/commit-before-process', type: 'bugspot', level: 'advanced', tags: ['kafka', 'delivery'],
    language: 'ts',
    code: `await consumer.run({
  eachMessage: async ({ message, partition, topic }) => {
    await consumer.commitOffsets([{ topic, partition, offset: String(Number(message.offset) + 1) }]);
    await handle(message);
  },
});`,
    buggyLines: [3],
    explanation: 'Committing before handling gives at-most-once: if handle() crashes, the offset is already past the message and it is lost. Commit after successful processing (at-least-once) and make handle idempotent.',
    docsUrl: `${kafka}/#impl_offsettracking`,
  },
  {
    ...base, topic: 'kafka', id: 'messaging/kafka/message-key', type: 'mcq', level: 'intermediate', tags: ['kafka', 'ordering'],
    question: 'Events for the same order must be processed in order. What should you do when producing?',
    options: [
      'Use the order id as the message key so they land in the same partition',
      'Use a random key for each event',
      'Create one topic per event',
      'Send them with different producers',
    ],
    answerIndex: 0,
    explanation: 'The default partitioner hashes the key, and ordering is guaranteed only within a partition.',
    docsUrl: `${kafka}/#intro_concepts_and_terms`,
  },
  {
    ...base, topic: 'kafka', id: 'messaging/kafka/retention', type: 'flashcard', level: 'intermediate', tags: ['kafka', 'retention'],
    front: 'Does Kafka delete a message once a consumer has read it?',
    back: 'No. Messages stay until retention expires (by time or size), regardless of consumers. Each consumer group tracks its own offset, so many groups can read the same data independently.',
    explanation: 'This is the core difference from a work queue like RabbitMQ.',
    docsUrl: `${kafka}/#design_filesystem`,
  },
  {
    ...base, topic: 'kafka', id: 'messaging/kafka/log-compaction', type: 'mcq', level: 'advanced', tags: ['kafka', 'compaction'],
    question: 'What does log compaction keep on a topic?',
    options: [
      'At least the latest value for each message key',
      'Only the first message per partition',
      'Messages younger than seven days',
      'A single message per topic',
    ],
    answerIndex: 0,
    explanation: 'Compaction suits changelog/state topics such as "current profile per user id", letting a new consumer rebuild state without reading the whole history.',
    docsUrl: `${kafka}/#compaction`,
  },
  // ---- choosing ----
  {
    ...base, topic: 'choosing', id: 'messaging/choosing/rabbitmq-vs-kafka', type: 'mcq', level: 'intermediate', tags: ['comparison'],
    question: 'You need task queues with per-message routing, retries and dead-lettering for background jobs. Which fits better by default?',
    options: ['RabbitMQ', 'Kafka', 'Neither; use cron', 'A relational table as a stream'],
    answerIndex: 0,
    explanation: 'RabbitMQ is a smart broker built for routing and work distribution. Kafka is a distributed log, best for high-throughput event streams, replay and multiple independent consumers.',
    docsUrl: 'https://www.rabbitmq.com/tutorials/amqp-concepts',
  },
  {
    ...base, topic: 'choosing', id: 'messaging/choosing/outbox-pattern', type: 'flashcard', level: 'advanced', tags: ['patterns', 'consistency'],
    front: 'What problem does the transactional outbox pattern solve?',
    back: 'The dual-write problem: saving to the database and publishing to a broker cannot be one atomic step. Write the event to an outbox table in the same transaction, then a relay publishes it to the broker.',
    explanation: 'It guarantees the event is eventually published if and only if the data was committed. Consumers must still be idempotent.',
    docsUrl: 'https://microservices.io/patterns/data/transactional-outbox.html',
  },
];
