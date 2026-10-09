import { describe, expect, it } from 'bun:test';
import { createDatabase } from './db/database.js';
import { createApp } from './server.js';

function setup() {
  const db = createDatabase(':memory:'),
    app = createApp(db);
  return { app, db };
}

describe('HTTP Server integration', () => {
  it('serves healthcheck on /health and /', async () => {
    const { app } = setup(),
      res = await app.fetch(new Request('http://localhost:3005/health'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.db).toBe('connected');

    const rootRes = await app.fetch(new Request('http://localhost:3005/'));
    expect(rootRes.status).toBe(200);
  });

  it('handles CORS OPTIONS preflight', async () => {
    const { app } = setup(),
      res = await app.fetch(
        new Request('http://localhost:3005/api/storage', { method: 'OPTIONS' }),
      );
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('rejects storage requests with missing parameters or invalid key', async () => {
    const { app } = setup(),
      // Missing key & password
      res1 = await app.fetch(new Request('http://localhost:3005/api/storage'));
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
    const { app } = setup(),
      payload = JSON.stringify({ clock: true, theme: 'dark' }),
      // 1. POST /api/storage (create)
      postRes = await app.fetch(
        new Request('http://localhost:3005/api/storage?key=pref-user', {
          body: payload,
          headers: {
            'Content-Type': 'application/json',
            'X-Storage-Key': 'my-secret-pw',
          },
          method: 'POST',
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
    expect(fetched).toEqual({ clock: true, theme: 'dark' });

    // 3. GET /api/storage with wrong password
    const wrongRes = await app.fetch(
      new Request('http://localhost:3005/api/storage?key=pref-user', {
        headers: { 'X-Storage-Key': 'wrong-password' },
      }),
    );
    expect(wrongRes.status).toBe(401);

    // 4. POST /api/storage (patch/update)
    const updatedPayload = JSON.stringify({ clock: false, theme: 'light' }),
      patchRes = await app.fetch(
        new Request('http://localhost:3005/api/storage?key=pref-user&p=my-secret-pw', {
          body: updatedPayload,
          method: 'POST',
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
    expect(await getUpdated.json()).toEqual({ clock: false, theme: 'light' });
  });

  it('supports /api/setting/:key alias seamlessly', async () => {
    const { app } = setup(),
      payload = JSON.stringify({ synced: true }),
      // POST /api/setting/:key
      postRes = await app.fetch(
        new Request('http://localhost:3005/api/setting/alias-key?p=secret', {
          body: payload,
          method: 'POST',
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
    const { app } = setup(),
      // 1. Install
      instRes = await app.fetch(
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
    expect(stats1.Chrome).toEqual({ deinstalls: 0, installs: 1 });

    // 3. Deinstall
    const deinstRes = await app.fetch(
      new Request('http://localhost:3005/api/deinstall?id=uuid-1&browser=chrome'),
    );
    expect(deinstRes.status).toBe(200);

    // 4. Query statistics after deinstall
    const statsRes2 = await app.fetch(new Request('http://localhost:3005/api/statistic')),
      stats2 = await statsRes2.json();
    expect(stats2.Chrome).toEqual({ deinstalls: 1, installs: 1 });
  });

  it('returns 404 for unknown routes', async () => {
    const { app } = setup(),
      res = await app.fetch(new Request('http://localhost:3005/non-existent'));
    expect(res.status).toBe(404);
  });
});
