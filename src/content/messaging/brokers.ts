import type { Card } from '../../core/types.ts';

const base = { track: 'messaging' } as const;

export const cards: Card[] = [
  {
    ...base, id: 'messaging/why-brokers/decoupling', topic: 'why-brokers', type: 'flashcard', level: 'beginner', tags: ['broker'],
    front: 'Why put a message broker between two services?',
    back: 'Decoupling in time and load: the producer does not wait for the consumer, spikes are buffered in a queue, and consumers can fail and retry without losing the message.',
    explanation: 'The cost is eventual consistency and extra operational complexity, so use a broker when you need those properties.',
    docsUrl: 'https://www.rabbitmq.com/tutorials/amqp-concepts',
  },
  {
    ...base, id: 'messaging/rabbitmq/ack', topic: 'rabbitmq', type: 'mcq', level: 'intermediate', tags: ['rabbitmq', 'ack'],
    question: 'A RabbitMQ consumer crashes before acknowledging a message (manual ack mode). What happens to the message?',
    options: ['It is requeued and redelivered', 'It is lost', 'It is moved to a dead-letter queue by default', 'It is acknowledged automatically'],
    answerIndex: 0,
    explanation: 'Unacked messages are returned to the queue when the channel closes. Handlers should therefore be idempotent, since redelivery means at-least-once processing.',
    docsUrl: 'https://www.rabbitmq.com/docs/confirms',
  },
];
