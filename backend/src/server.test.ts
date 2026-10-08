import { describe, expect, it } from 'bun:test';
import { createDatabase } from './db/database.js';
import { createApp } from './server.js';

function setup() {
  const db = createDatabase(':memory:');
  const app = createApp(db);
  return { db, app };
}

describe('HTTP Server integration', () => {
  it('serves healthcheck on /health and /', async () => {
    const { app } = setup();

    const res = await app.fetch(new Request('http://localhost:3005/health'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.db).toBe('connected');

    const rootRes = await app.fetch(new Request('http://localhost:3005/'));
    expect(rootRes.status).toBe(200);
  });

  it('handles CORS OPTIONS preflight', async () => {
    const { app } = setup();

    const res = await app.fetch(
      new Request('http://localhost:3005/api/storage', { method: 'OPTIONS' }),
    );
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('rejects storage requests with missing parameters or invalid key', async () => {
    const { app } = setup();

    // Missing key & password
    const res1 = await app.fetch(new Request('http://localhost:3005/api/storage'));
    expect(res1.status).toBe(400);

    // Missing password
    const res2 = await app.fetch(new Request('http://localhost:3005/api/storage?key=test'));
    expect(res2.status).toBe(400);

    // Invalid key (path traversal)
    const res3 = await app.fetch(
      new Request('http://localhost:3005/api/storage?key=../secret&p=pass'),
    );
    expect(res3.status).toBe(400);
  });

  it('saves and retrieves encrypted storage correctly', async () => {
    const { app } = setup();
    const payload = JSON.stringify({ theme: 'dark', clock: true });

    // 1. POST /api/storage (create)
    const postRes = await app.fetch(
      new Request('http://localhost:3005/api/storage?key=pref-user', {
        method: 'POST',
        headers: {
          'X-Storage-Key': 'my-secret-pw',
          'Content-Type': 'application/json',
        },
        body: payload,
      }),
    );
    expect(postRes.status).toBe(201);
    const postBody = await postRes.json();
    expect(postBody.body).toBe('created');

    // 2. GET /api/storage with correct password header
    const getRes = await app.fetch(
      new Request('http://localhost:3005/api/storage?key=pref-user', {
        headers: { 'X-Storage-Key': 'my-secret-pw' },
      }),
    );
    expect(getRes.status).toBe(200);
    const fetched = await getRes.json();
    expect(fetched).toEqual({ theme: 'dark', clock: true });

    // 3. GET /api/storage with wrong password
    const wrongRes = await app.fetch(
      new Request('http://localhost:3005/api/storage?key=pref-user', {
        headers: { 'X-Storage-Key': 'wrong-password' },
      }),
    );
    expect(wrongRes.status).toBe(401);

    // 4. POST /api/storage (patch/update)
    const updatedPayload = JSON.stringify({ theme: 'light', clock: false });
    const patchRes = await app.fetch(
      new Request('http://localhost:3005/api/storage?key=pref-user&p=my-secret-pw', {
        method: 'POST',
        body: updatedPayload,
      }),
    );
    expect(patchRes.status).toBe(200);
    const patchBody = await patchRes.json();
    expect(patchBody.body).toBe('patched');

    // 5. GET /api/storage verifies updated payload
    const getUpdated = await app.fetch(
      new Request('http://localhost:3005/api/storage?key=pref-user&p=my-secret-pw'),
    );
    expect(getUpdated.status).toBe(200);
    expect(await getUpdated.json()).toEqual({ theme: 'light', clock: false });
  });

  it('supports /api/setting/:key alias seamlessly', async () => {
    const { app } = setup();
    const payload = JSON.stringify({ synced: true });

    // POST /api/setting/:key
    const postRes = await app.fetch(
      new Request('http://localhost:3005/api/setting/alias-key?p=secret', {
        method: 'POST',
        body: payload,
      }),
    );
    expect(postRes.status).toBe(201);

    // GET /api/setting/:key
    const getRes = await app.fetch(
      new Request('http://localhost:3005/api/setting/alias-key?p=secret'),
    );
    expect(getRes.status).toBe(200);
    expect(await getRes.json()).toEqual({ synced: true });
  });

  it('handles installation, deinstallation, and statistic routes', async () => {
    const { app } = setup();

    // 1. Install
    const instRes = await app.fetch(
      new Request('http://localhost:3005/api/install?id=uuid-1&browser=chrome'),
    );
    expect(instRes.status).toBe(201);

    // Duplicate install fails
    const dupRes = await app.fetch(
      new Request('http://localhost:3005/api/install?id=uuid-1&browser=chrome'),
    );
    expect(dupRes.status).toBe(400);

    // 2. Query statistics
    const statsRes1 = await app.fetch(new Request('http://localhost:3005/api/statistic'));
    expect(statsRes1.status).toBe(200);
    const stats1 = await statsRes1.json();
    expect(stats1.Chrome).toEqual({ installs: 1, deinstalls: 0 });

    // 3. Deinstall
    const deinstRes = await app.fetch(
      new Request('http://localhost:3005/api/deinstall?id=uuid-1&browser=chrome'),
    );
    expect(deinstRes.status).toBe(200);

    // 4. Query statistics after deinstall
    const statsRes2 = await app.fetch(new Request('http://localhost:3005/api/statistic'));
    const stats2 = await statsRes2.json();
    expect(stats2.Chrome).toEqual({ installs: 1, deinstalls: 1 });
  });

  it('returns 404 for unknown routes', async () => {
    const { app } = setup();

    const res = await app.fetch(new Request('http://localhost:3005/non-existent'));
    expect(res.status).toBe(404);
  });
});
