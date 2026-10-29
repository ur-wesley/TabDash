import { describe, expect, it } from 'bun:test';
import { createDatabase } from './db/database.js';
import { createApp } from './server.js';

const HTTP_BAD_REQUEST = 400,
  HTTP_CREATED = 201,
  HTTP_NOT_FOUND = 404,
  HTTP_NO_CONTENT = 204,
  HTTP_OK = 200,
  HTTP_UNAUTHORIZED = 401,
  ONE = 1,
  ZERO = 0;

interface HealthBody {
  db: string;
  status: string;
}

interface ApiMessageBody {
  body: string;
}

interface BrowserStats {
  Chrome: { deinstalls: number; installs: number };
}

const setup = () => {
  const db = createDatabase(':memory:'),
    app = createApp(db);
  return { app, db };
};

describe('HTTP Server integration', () => {
  it('serves healthcheck on /health and /', async () => {
    const { app } = setup(),
      res = await app.fetch(new Request('http://localhost:3005/health'));
    expect(res.status).toBe(HTTP_OK);
    const body = (await res.json()) as HealthBody;
    expect(body.status).toBe('ok');
    expect(body.db).toBe('connected');

    const rootRes = await app.fetch(new Request('http://localhost:3005/'));
    expect(rootRes.status).toBe(HTTP_OK);
  });

  it('handles CORS OPTIONS preflight', async () => {
    const { app } = setup(),
      res = await app.fetch(
        new Request('http://localhost:3005/api/storage', { method: 'OPTIONS' }),
      );
    expect(res.status).toBe(HTTP_NO_CONTENT);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('rejects storage requests with missing parameters or invalid key', async () => {
    const { app } = setup(),
      res1 = await app.fetch(new Request('http://localhost:3005/api/storage'));
    expect(res1.status).toBe(HTTP_BAD_REQUEST);

    const res2 = await app.fetch(new Request('http://localhost:3005/api/storage?key=test'));
    expect(res2.status).toBe(HTTP_BAD_REQUEST);

    const res3 = await app.fetch(
      new Request('http://localhost:3005/api/storage?key=../secret&p=pass'),
    );
    expect(res3.status).toBe(HTTP_BAD_REQUEST);
  });

  it('saves and retrieves encrypted storage correctly', async () => {
    const { app } = setup(),
      payload = JSON.stringify({ clock: true, theme: 'dark' }),
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
    expect(postRes.status).toBe(HTTP_CREATED);
    const postBody = (await postRes.json()) as ApiMessageBody;
    expect(postBody.body).toBe('created');

    const getRes = await app.fetch(
      new Request('http://localhost:3005/api/storage?key=pref-user', {
        headers: { 'X-Storage-Key': 'my-secret-pw' },
      }),
    );
    expect(getRes.status).toBe(HTTP_OK);
    const fetched = (await getRes.json()) as { clock: boolean; theme: string };
    expect(fetched).toEqual({ clock: true, theme: 'dark' });

    const wrongRes = await app.fetch(
      new Request('http://localhost:3005/api/storage?key=pref-user', {
        headers: { 'X-Storage-Key': 'wrong-password' },
      }),
    );
    expect(wrongRes.status).toBe(HTTP_UNAUTHORIZED);

    const updatedPayload = JSON.stringify({ clock: false, theme: 'light' }),
      patchRes = await app.fetch(
        new Request('http://localhost:3005/api/storage?key=pref-user&p=my-secret-pw', {
          body: updatedPayload,
          method: 'POST',
        }),
      );
    expect(patchRes.status).toBe(HTTP_OK);
    const patchBody = (await patchRes.json()) as ApiMessageBody;
    expect(patchBody.body).toBe('patched');

    const getUpdated = await app.fetch(
      new Request('http://localhost:3005/api/storage?key=pref-user&p=my-secret-pw'),
    );
    expect(getUpdated.status).toBe(HTTP_OK);
    expect(await getUpdated.json()).toEqual({ clock: false, theme: 'light' });
  });

  it('supports /api/setting/:key alias seamlessly', async () => {
    const { app } = setup(),
      payload = JSON.stringify({ synced: true }),
      postRes = await app.fetch(
        new Request('http://localhost:3005/api/setting/alias-key?p=secret', {
          body: payload,
          method: 'POST',
        }),
      );
    expect(postRes.status).toBe(HTTP_CREATED);

    const getRes = await app.fetch(
      new Request('http://localhost:3005/api/setting/alias-key?p=secret'),
    );
    expect(getRes.status).toBe(HTTP_OK);
    expect(await getRes.json()).toEqual({ synced: true });
  });

  it('handles installation, deinstallation, and statistic routes', async () => {
    const { app } = setup(),
      instRes = await app.fetch(
        new Request('http://localhost:3005/api/install?id=uuid-1&browser=chrome'),
      );
    expect(instRes.status).toBe(HTTP_CREATED);

    const dupRes = await app.fetch(
      new Request('http://localhost:3005/api/install?id=uuid-1&browser=chrome'),
    );
    expect(dupRes.status).toBe(HTTP_BAD_REQUEST);

    const statsRes1 = await app.fetch(new Request('http://localhost:3005/api/statistic'));
    expect(statsRes1.status).toBe(HTTP_OK);
    const stats1 = (await statsRes1.json()) as BrowserStats;
    expect(stats1.Chrome).toEqual({ deinstalls: ZERO, installs: ONE });

    const deinstRes = await app.fetch(
      new Request('http://localhost:3005/api/deinstall?id=uuid-1&browser=chrome'),
    );
    expect(deinstRes.status).toBe(HTTP_OK);

    const statsRes2 = await app.fetch(new Request('http://localhost:3005/api/statistic')),
      stats2 = (await statsRes2.json()) as BrowserStats;
    expect(stats2.Chrome).toEqual({ deinstalls: ONE, installs: ONE });
  });

  it('returns 404 for unknown routes', async () => {
    const { app } = setup(),
      res = await app.fetch(new Request('http://localhost:3005/non-existent'));
    expect(res.status).toBe(HTTP_NOT_FOUND);
  });
});
