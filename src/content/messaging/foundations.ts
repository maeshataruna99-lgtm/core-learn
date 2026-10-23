import type { Card } from '../../core/types.ts';

// Beginner foundations with bilingual primers. No repo of mine uses a broker yet, so no `source`.
const base = { track: 'messaging', level: 'beginner' } as const;
const rmq = 'https://www.rabbitmq.com/tutorials/amqp-concepts';

export const cards: Card[] = [
  {
    ...base, topic: 'foundations', id: 'messaging/foundations/what-is-a-queue', type: 'flashcard', tags: ['queue'],
    primer: {
      en: 'Picture the line at a shop. People join at the back and are served from the front, in the same order they arrived. A message queue is that line for messages between programs.',
      id: 'Bayangkan antrean di toko. Orang bergabung dari belakang dan dilayani dari depan, sesuai urutan kedatangan. Message queue adalah antrean seperti itu untuk pesan antar program.',
    },
    front: 'What is a message queue?',
    back: 'A buffer that holds messages until a consumer is ready to process them, usually first in, first out. The sender does not wait for the receiver, and messages are not lost if the receiver is briefly down.',
    explanation: 'RabbitMQ is a message broker: a server that manages queues for many senders and receivers.',
    docsUrl: rmq,
  },
  {
    ...base, topic: 'foundations', id: 'messaging/foundations/queue-fifo', type: 'output', tags: ['queue', 'fifo'],
    primer: {
      en: 'FIFO means First In, First Out. In JavaScript an array can act like a queue: `push` adds at the back, `shift` removes from the front.',
      id: 'FIFO berarti First In, First Out. Di JavaScript, array bisa berperan sebagai antrean: `push` menambah di belakang, `shift` mengambil dari depan.',
    },
    language: 'js',
    code: `const queue = [];
queue.push('first');
queue.push('second');
console.log(queue.shift(), queue.shift());`,
    options: ['first second', 'second first', 'first first', 'second second'],
    answerIndex: 0,
    verifiedOutput: 'first second',
    explanation: 'The message that entered first is delivered first. A real queue adds acknowledgements and persistence on top of this idea.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift',
  },
  {
    ...base, topic: 'foundations', id: 'messaging/foundations/producer-consumer', type: 'mcq', tags: ['producer', 'consumer'],
    primer: {
      en: 'A program that puts messages into the queue is a producer. A program that takes them out and does the work is a consumer. They never talk to each other directly.',
      id: 'Program yang memasukkan pesan ke antrean disebut producer. Program yang mengambilnya dan mengerjakan tugasnya disebut consumer. Keduanya tidak berbicara langsung satu sama lain.',
    },
    question: 'A web app publishes "send welcome email" jobs and a separate worker sends the emails. Which is the producer?',
    options: ['The web app', 'The worker', 'The email server', 'The queue'],
    answerIndex: 0,
    explanation: 'The web app produces messages, the worker consumes them, the broker keeps them in between. This decoupling means a slow email server cannot slow down signup.',
    docsUrl: 'https://www.rabbitmq.com/tutorials/tutorial-two-javascript',
  },
  {
    ...base, topic: 'foundations', id: 'messaging/foundations/queue-vs-pubsub', type: 'mcq', tags: ['pubsub', 'queue'],
    primer: {
      en: 'In a work queue each message goes to ONE worker (jobs are shared). In publish/subscribe each message goes to EVERY subscriber (like a news broadcast).',
      id: 'Pada work queue setiap pesan diberikan ke SATU worker (pekerjaan dibagi). Pada publish/subscribe setiap pesan diberikan ke SEMUA subscriber (seperti siaran berita).',
    },
    question: 'Three workers read from the same work queue. A message arrives. How many workers process it?',
    options: ['One', 'All three', 'None until acknowledged', 'Two'],
    answerIndex: 0,
    explanation: 'A work queue distributes tasks among competing workers. To deliver one message to many consumers, use a fanout exchange (pub/sub) with a separate queue per subscriber.',
    docsUrl: 'https://www.rabbitmq.com/tutorials/tutorial-three-javascript',
  },
  {
    ...base, topic: 'foundations', id: 'messaging/foundations/ack-simple', type: 'flashcard', tags: ['ack'],
    primer: {
      en: 'After a worker finishes a job it tells the broker "done". Only then does the broker forget the message. If the worker crashes first, the broker hands the job to someone else.',
      id: 'Setelah worker menyelesaikan sebuah pekerjaan, ia memberi tahu broker "selesai". Barulah broker melupakan pesan itu. Jika worker crash lebih dulu, broker memberikan pekerjaan itu ke worker lain.',
    },
    front: 'What is a message acknowledgement (ack)?',
    back: 'A signal from the consumer to the broker that a message was processed successfully, so the broker can delete it. Without an ack the message is redelivered, which means consumers must handle duplicates safely.',
    explanation: 'This gives at-least-once delivery: nothing is lost, but a message may arrive twice.',
    docsUrl: 'https://www.rabbitmq.com/docs/confirms',
  },
];
