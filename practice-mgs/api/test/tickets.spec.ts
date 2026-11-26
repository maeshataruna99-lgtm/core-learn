import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Tickets API', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.ticket.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(() => app.close());

  const http = () => request(app.getHttpServer());

  it('creates a ticket with defaults (201)', async () => {
    const res = await http().post('/api/v1/tickets').send({ title: 'Fix login' }).expect(201);
    expect(res.body).toMatchObject({ title: 'Fix login', status: 'OPEN', priority: 'MEDIUM' });
  });

  it('rejects bad input and unknown fields (400)', async () => {
    await http().post('/api/v1/tickets').send({ title: 'ab' }).expect(400);
    await http().post('/api/v1/tickets').send({ title: 'Valid title', status: 'DONE' }).expect(400);
    await http().post('/api/v1/tickets').send({ title: 'Valid title', assigneeId: 999 }).expect(400);
  });

  it('lists with filter and pagination', async () => {
    const user = await prisma.user.create({ data: { name: 'Alice', email: 'a@x.com' } });
    await prisma.ticket.createMany({
      data: [
        { title: 'One', assigneeId: user.id },
        { title: 'Two', status: 'DONE' },
        { title: 'Three' },
      ],
    });

    const open = await http().get('/api/v1/tickets?status=OPEN').expect(200);
    expect(open.body.meta.total).toBe(2);

    const paged = await http().get('/api/v1/tickets?limit=1&page=2').expect(200);
    expect(paged.body.data).toHaveLength(1);
    expect(paged.body.meta).toMatchObject({ page: 2, limit: 1, total: 3, totalPages: 3 });

    await http().get('/api/v1/tickets?status=NOPE').expect(400);
    await http().get('/api/v1/tickets?limit=500').expect(400);
  });

  it('follows the status state machine (200 then 409) and 404 for unknown id', async () => {
    const created = await http().post('/api/v1/tickets').send({ title: 'Move me' }).expect(201);
    const id = created.body.id as number;

    await http().patch(`/api/v1/tickets/${id}/status`).send({ status: 'DONE' }).expect(200);
    await http().patch(`/api/v1/tickets/${id}/status`).send({ status: 'OPEN' }).expect(409);
    await http().patch('/api/v1/tickets/9999/status').send({ status: 'DONE' }).expect(404);
  });

  it('deletes a ticket (204) then 404', async () => {
    const created = await http().post('/api/v1/tickets').send({ title: 'Delete me' }).expect(201);
    await http().delete(`/api/v1/tickets/${created.body.id}`).expect(204);
    await http().delete(`/api/v1/tickets/${created.body.id}`).expect(404);
  });

  it('lets exactly one of two concurrent identical transitions win', async () => {
    const created = await http().post('/api/v1/tickets').send({ title: 'Race me' }).expect(201);
    const move = () => http().patch(`/api/v1/tickets/${created.body.id}/status`).send({ status: 'DONE' });

    const results = await Promise.all([move(), move()]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
  });

  it('serves health at the root, outside the version prefix', async () => {
    await http().get('/health').expect(200).expect({ status: 'ok' });
    await http().get('/api/v1/health').expect(404);
  });

  it('never leaks database details in error bodies', async () => {
    const res = await http().post('/api/v1/tickets').send({ title: 'Valid title', assigneeId: 999 }).expect(400);
    expect(JSON.stringify(res.body)).not.toMatch(/prisma|sqlite|constraint|SELECT/i);
  });
});
