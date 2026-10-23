import type { Card } from '../../core/types.ts';

// Beginner foundations with bilingual primers.
const base = { track: 'nestjs-prisma', stack: 'nestjs', level: 'beginner' } as const;
const nest = 'https://docs.nestjs.com';
const prisma = 'https://www.prisma.io/docs/orm';

export const cards: Card[] = [
  {
    ...base, topic: 'foundations', id: 'nestjs-prisma/foundations/what-is-nestjs', type: 'flashcard', tags: ['nestjs'],
    primer: {
      en: 'Writing a server with only Node means deciding yourself how to organize files, routes and shared code. NestJS gives a ready structure so big projects stay tidy.',
      id: 'Menulis server hanya dengan Node berarti kamu sendiri yang menentukan cara menata file, route, dan kode bersama. NestJS memberi struktur siap pakai agar proyek besar tetap rapi.',
    },
    front: 'What is NestJS?',
    back: 'A TypeScript framework for server-side Node applications. It organizes code into modules, controllers and providers (services) and uses dependency injection, a structure similar to Spring Boot in Java.',
    explanation: 'Under the hood it runs on Express (default) or Fastify.',
    docsUrl: `${nest}/first-steps`,
  },
  {
    ...base, topic: 'foundations', id: 'nestjs-prisma/foundations/module-controller-provider', type: 'mcq', tags: ['architecture', 'interview'],
    primer: {
      en: 'Think of a shop. The controller is the cashier who talks to the customer (HTTP requests). The provider (service) is the staff who does the real work. The module is the department that groups them together.',
      id: 'Bayangkan sebuah toko. Controller adalah kasir yang berbicara dengan pelanggan (HTTP request). Provider (service) adalah staf yang mengerjakan tugas sebenarnya. Module adalah divisi yang mengelompokkan keduanya.',
    },
    question: 'In NestJS, which statement matches the roles?',
    options: [
      'Controllers handle requests and responses, providers hold business logic, modules group related controllers and providers',
      'Controllers query the database, providers handle HTTP, modules store data',
      'Modules handle requests, controllers group providers',
      'They are three names for the same thing',
    ],
    answerIndex: 0,
    explanation: 'This mirrors Spring: @Controller + @Service + the package/config that wires them. A provider is any injectable class, most often a service marked @Injectable().',
    docsUrl: `${nest}/modules`,
  },
  {
    ...base, topic: 'foundations', id: 'nestjs-prisma/foundations/decorators', type: 'flashcard', tags: ['decorators'],
    primer: {
      en: 'The `@Something()` lines above classes and methods are decorators. They attach extra meaning, like a label on a box, that the framework reads later.',
      id: 'Baris `@Sesuatu()` di atas class dan method disebut decorator. Decorator menempelkan makna tambahan, seperti label pada kotak, yang dibaca framework kemudian.',
    },
    front: 'What do decorators like @Controller(), @Get() and @Injectable() do?',
    back: 'They attach metadata to a class or method. @Controller("users") says "this class handles /users", @Get(":id") says "this method handles GET /users/:id", @Injectable() says "Nest may create and inject this class".',
    explanation: 'The Java equivalent is annotations (@RestController, @GetMapping, @Service).',
    docsUrl: `${nest}/custom-decorators`,
  },
  {
    ...base, topic: 'foundations', id: 'nestjs-prisma/foundations/rest-verbs', type: 'mcq', tags: ['rest', 'http'],
    primer: {
      en: 'HTTP has a small set of verbs that say what you want to do with a resource, such as `/users/5`.',
      id: 'HTTP punya beberapa kata kerja yang menyatakan apa yang ingin kamu lakukan pada sebuah resource, misalnya `/users/5`.',
    },
    question: 'Which HTTP verb is the REST convention for creating a new user?',
    options: ['POST /users', 'GET /users', 'DELETE /users', 'PUT /users/5 with no body'],
    answerIndex: 0,
    explanation: 'GET reads, POST creates, PUT replaces, PATCH changes part of a resource, DELETE removes. GET must never change data.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods',
  },
  {
    ...base, topic: 'foundations', id: 'nestjs-prisma/foundations/http-status-codes', type: 'mcq', tags: ['http'],
    primer: {
      en: 'Every HTTP response starts with a number that tells the client what happened: 2xx means success, 4xx means the client made a mistake, 5xx means the server failed.',
      id: 'Setiap respons HTTP diawali angka yang memberi tahu client apa yang terjadi: 2xx berarti berhasil, 4xx berarti client keliru, 5xx berarti server gagal.',
    },
    question: 'A user asks for /users/999 but no such user exists. Which status fits?',
    options: ['404 Not Found', '200 OK', '401 Unauthorized', '500 Internal Server Error'],
    answerIndex: 0,
    explanation: '400 bad input, 401 not logged in, 403 not allowed, 404 not found, 409 conflict, 500 server bug. In NestJS, throw new NotFoundException() to produce a 404.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status',
  },
  {
    ...base, topic: 'foundations', id: 'nestjs-prisma/foundations/what-is-prisma', type: 'flashcard', tags: ['prisma', 'orm'],
    primer: {
      en: 'Prisma is how a TypeScript program talks to a database without writing SQL by hand. You describe your tables once and Prisma gives you typed functions like `prisma.user.findMany()`.',
      id: 'Prisma adalah cara program TypeScript berbicara dengan database tanpa menulis SQL manual. Kamu mendeskripsikan tabel sekali, lalu Prisma memberi fungsi bertipe seperti `prisma.user.findMany()`.',
    },
    front: 'What is Prisma?',
    back: 'An ORM for Node and TypeScript. You define models in schema.prisma, Prisma migrates the database to match, and generates a type-safe client so queries are checked by the compiler.',
    explanation: 'It plays the role Hibernate/JPA plays in the Java stack.',
    docsUrl: `${prisma}/prisma-schema/overview`,
  },
  {
    ...base, topic: 'foundations', id: 'nestjs-prisma/foundations/schema-prisma', type: 'flashcard', tags: ['prisma', 'schema'],
    primer: {
      en: 'schema.prisma is the single file where you describe your data: each `model` becomes a table, each line in it becomes a column.',
      id: 'schema.prisma adalah satu file tempat kamu mendeskripsikan data: setiap `model` menjadi tabel, setiap baris di dalamnya menjadi kolom.',
    },
    front: 'What does a `model User { id Int @id @default(autoincrement()) email String @unique }` declare?',
    back: 'A table User with an integer primary key that auto-increments (@id, @default(autoincrement())) and an email column that must be unique (@unique).',
    explanation: 'After changing the schema, run prisma migrate dev to update the database and prisma generate to refresh the typed client.',
    docsUrl: `${prisma}/prisma-schema/data-model/models`,
  },
  {
    ...base, topic: 'foundations', id: 'nestjs-prisma/foundations/prisma-crud', type: 'mcq', tags: ['prisma', 'crud'],
    primer: {
      en: 'CRUD means Create, Read, Update, Delete: the four basic things you do with data. Prisma has one function for each.',
      id: 'CRUD berarti Create, Read, Update, Delete: empat hal dasar yang dilakukan pada data. Prisma menyediakan satu fungsi untuk masing-masing.',
    },
    question: 'Which Prisma Client call creates a new user row?',
    options: [
      'prisma.user.create({ data: { email } })',
      'prisma.user.findMany({ email })',
      'prisma.user.update({ email })',
      'prisma.user.delete({ data: { email } })',
    ],
    answerIndex: 0,
    explanation: 'create inserts, findMany/findUnique read, update changes (needs where and data) and delete removes (needs where).',
    docsUrl: `${prisma}/prisma-client/queries/crud`,
  },
  {
    ...base, topic: 'foundations', id: 'nestjs-prisma/foundations/what-is-a-dto', type: 'flashcard', tags: ['dto', 'validation'],
    primer: {
      en: 'Data arriving from a client is untrusted. A DTO is a small class that describes exactly what you expect (an email, a name) and lets Nest check it.',
      id: 'Data yang datang dari client tidak boleh dipercaya begitu saja. DTO adalah class kecil yang menjelaskan persis apa yang kamu harapkan (email, nama) dan memungkinkan Nest memeriksanya.',
    },
    front: 'What is a DTO in NestJS and how is it validated?',
    back: 'A Data Transfer Object: a class describing the shape of incoming data. With class-validator decorators (@IsEmail, @IsString, @MinLength) and ValidationPipe, Nest rejects requests that do not match with a 400.',
    explanation: 'It is the same idea as a Java record with @NotBlank and @Valid in Spring.',
    docsUrl: `${nest}/techniques/validation`,
  },
];
