import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { registerRoutes } from '../server/routes';
import { MemStorage, storage } from '../server/storage';

let app: express.Express;

beforeEach(async () => {
  // reset storage to default state
  Object.assign(storage, new MemStorage());
  app = express();
  app.use(express.json());
  await registerRoutes(app);
});

describe('Accounts API', () => {
  it('lists default accounts', async () => {
    const res = await request(app).get('/api/accounts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('creates a new account', async () => {
    const account = {
      name: 'Test Account',
      type: 'checking',
      balance: '100.00',
      color: '#000000',
      isActive: true
    };
    const res = await request(app).post('/api/accounts').send(account);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Test Account', type: 'checking' });
    expect(res.body).toHaveProperty('id');
  });

  it('fetches account by id', async () => {
    const account = {
      name: 'Another Account',
      type: 'savings',
      balance: '50.00',
      color: '#123456',
      isActive: true
    };
    const createRes = await request(app).post('/api/accounts').send(account);
    const id = createRes.body.id;
    const fetchRes = await request(app).get(`/api/accounts/${id}`);
    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.id).toBe(id);
    expect(fetchRes.body.name).toBe('Another Account');
  });
});
