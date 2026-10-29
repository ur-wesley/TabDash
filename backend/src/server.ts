import type { Database } from 'bun:sqlite';
import pkg from '../package.json';
import { StorageService } from './services/storage.js';
import Crypto from './utils/crypto.js';
import { RateLimiter } from './utils/rateLimit.js';
import { sanitizeStorageKey } from './utils/storageKey.js';

const BEARER_PREFIX = /^Bearer\s+/iu,
  FORWARDED_FOR_FIRST_INDEX = 0,
  HTTP_BAD_REQUEST = 400,
  HTTP_CREATED = 201,
  HTTP_INTERNAL_SERVER_ERROR = 500,
  HTTP_NOT_FOUND = 404,
  HTTP_NO_CONTENT = 204,
  HTTP_OK = 200,
  HTTP_TOO_MANY_REQUESTS = 429,
  HTTP_UNAUTHORIZED = 401,
  RATE_LIMIT_MAX_REQUESTS = 120,
  RATE_LIMIT_WINDOW_MS = 60_000,
  SETTING_PATH_PREFIX = '/api/setting/',
  CORS_HEADERS: Record<string, string> = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Storage-Key',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Origin': '*',
  },
  jsonResponseHeaders = (): Record<string, string> => ({
    ...CORS_HEADERS,
    'Content-Type': 'application/json',
  }),
  json = (data: unknown, status = HTTP_OK): Response =>
    Response.json(data, { headers: jsonResponseHeaders(), status }),
  rawJson = (rawPayload: string, status = HTTP_OK): Response =>
    new Response(rawPayload, { headers: jsonResponseHeaders(), status }),
  clientIpFromRequest = (req: Request): string => {
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    if (cfConnectingIp !== null && cfConnectingIp !== '') {
      return cfConnectingIp;
    }
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor !== null && forwardedFor !== '') {
      const parts = forwardedFor.split(','),
        firstHop = parts[FORWARDED_FOR_FIRST_INDEX];
      if (firstHop !== undefined) {
        const trimmed = firstHop.trim();
        if (trimmed !== '') {
          return trimmed;
        }
      }
    }
    return 'unknown-client';
  },
  storagePasswordFromRequest = (req: Request, url: URL): string | null => {
    const storageHeader = req.headers.get('x-storage-key');
    if (storageHeader !== null && storageHeader !== '') {
      return storageHeader;
    }
    const authorization = req.headers.get('authorization');
    if (authorization !== null && authorization !== '') {
      return authorization.replace(BEARER_PREFIX, '');
    }
    return url.searchParams.get('p');
  },
  rawStorageKeyFromPath = (pathname: string): string | undefined => {
    if (!pathname.startsWith(SETTING_PATH_PREFIX)) {
      return undefined;
    }
    return decodeURIComponent(pathname.slice(SETTING_PATH_PREFIX.length));
  },
  handleHealth = (): Response =>
    json({
      db: 'connected',
      status: 'ok',
      uptime: process.uptime(),
      version: pkg.version,
    }),
  handleGetStatistic = (storage: StorageService): Response => {
    try {
      const stats = storage.getStatistics();
      return json(stats, HTTP_OK);
    } catch {
      return json(
        { body: 'could not get statistic entries', status: HTTP_BAD_REQUEST },
        HTTP_BAD_REQUEST,
      );
    }
  },
  handleInstall = (url: URL, storage: StorageService): Response => {
    const id = url.searchParams.get('id'),
      browser = url.searchParams.get('browser');
    if (id === null || id === '' || browser === null || browser === '') {
      return json(
        { body: 'could not create statistic entry', status: HTTP_BAD_REQUEST },
        HTTP_BAD_REQUEST,
      );
    }
    const success = storage.recordInstall(id, browser);
    if (!success) {
      return json(
        { body: 'could not create statistic entry', status: HTTP_BAD_REQUEST },
        HTTP_BAD_REQUEST,
      );
    }
    return json({ body: 'created', status: HTTP_CREATED }, HTTP_CREATED);
  },
  handleDeinstall = (url: URL, storage: StorageService): Response => {
    const id = url.searchParams.get('id'),
      browser = url.searchParams.get('browser');
    if (id === null || id === '' || browser === null || browser === '') {
      return json(
        { body: 'could not update statistic entry', status: HTTP_BAD_REQUEST },
        HTTP_BAD_REQUEST,
      );
    }
    const success = storage.recordDeinstall(id, browser);
    if (!success) {
      return json(
        { body: 'could not update statistic entry', status: HTTP_BAD_REQUEST },
        HTTP_BAD_REQUEST,
      );
    }
    return json({ body: 'updated', status: HTTP_OK }, HTTP_OK);
  },
  handleStorageGet = (rawKey: string, password: string, storage: StorageService): Response => {
    const safeKey = sanitizeStorageKey(rawKey);
    if (safeKey === null) {
      return json({ body: 'invalid key format', status: HTTP_BAD_REQUEST }, HTTP_BAD_REQUEST);
    }
    try {
      const encrypted = storage.getSetting(safeKey);
      if (encrypted === null || encrypted === '') {
        return json({ body: 'not found', status: HTTP_NOT_FOUND }, HTTP_NOT_FOUND);
      }
      const decrypted = Crypto.decrypt(encrypted, password);
      if (decrypted === null || decrypted === '') {
        return json(
          { body: 'invalid decryption key', status: HTTP_UNAUTHORIZED },
          HTTP_UNAUTHORIZED,
        );
      }
      try {
        JSON.parse(decrypted);
      } catch {
        return json(
          { body: 'invalid decryption key', status: HTTP_UNAUTHORIZED },
          HTTP_UNAUTHORIZED,
        );
      }
      return rawJson(decrypted, HTTP_OK);
    } catch {
      return json(
        { body: 'could not get storage entry', status: HTTP_INTERNAL_SERVER_ERROR },
        HTTP_INTERNAL_SERVER_ERROR,
      );
    }
  },
  handleStoragePost = (
    rawKey: string,
    password: string,
    body: string,
    storage: StorageService,
  ): Response => {
    const safeKey = sanitizeStorageKey(rawKey);
    if (safeKey === null) {
      return json({ body: 'invalid key format', status: HTTP_BAD_REQUEST }, HTTP_BAD_REQUEST);
    }
    try {
      const encrypted = Crypto.encrypt(body, password),
        { created } = storage.saveSetting(safeKey, encrypted);
      let status = HTTP_OK,
        label = 'patched';
      if (created) {
        status = HTTP_CREATED;
        label = 'created';
      }
      return json({ body: label, status }, status);
    } catch {
      return json(
        { body: 'could not create setting entry', status: HTTP_INTERNAL_SERVER_ERROR },
        HTTP_INTERNAL_SERVER_ERROR,
      );
    }
  };

interface StorageRouteContext {
  clientIp: string;
  method: string;
  rateLimiter: RateLimiter;
  req: Request;
  storage: StorageService;
  url: URL;
}

const handleStorageRoute = (ctx: StorageRouteContext): Response | Promise<Response> => {
  if (!ctx.rateLimiter.isAllowed(ctx.clientIp)) {
    return json(
      { body: 'too many requests', status: HTTP_TOO_MANY_REQUESTS },
      HTTP_TOO_MANY_REQUESTS,
    );
  }
  const keyFromPath = rawStorageKeyFromPath(ctx.url.pathname),
    rawKey = keyFromPath ?? ctx.url.searchParams.get('key'),
    password = storagePasswordFromRequest(ctx.req, ctx.url);

  if (ctx.method === 'GET') {
    if (rawKey === null || rawKey === '' || password === null || password === '') {
      return json(
        { body: 'missing key or encryption password', status: HTTP_BAD_REQUEST },
        HTTP_BAD_REQUEST,
      );
    }
    return handleStorageGet(rawKey, password, ctx.storage);
  }

  if (ctx.method === 'POST') {
    return ctx.req.text().then((body) => {
      if (rawKey === null || rawKey === '' || password === null || password === '' || body === '') {
        return json(
          { body: 'missing key, encryption password, or body', status: HTTP_BAD_REQUEST },
          HTTP_BAD_REQUEST,
        );
      }
      return handleStoragePost(rawKey, password, body, ctx.storage);
    });
  }

  return json(
    {
      message: `${ctx.url.pathname} not found`,
      name: 'not found',
      statusCode: HTTP_NOT_FOUND,
      statusMessage: 'Route not Found',
    },
    HTTP_NOT_FOUND,
  );
};

interface AppInstance {
  fetch: (req: Request) => Promise<Response>;
  rateLimiter: RateLimiter;
  storage: StorageService;
}

const createFetchHandler =
    (storage: StorageService, rateLimiter: RateLimiter) =>
    async (req: Request): Promise<Response> => {
      const url = new URL(req.url),
        { pathname } = url,
        method = req.method.toUpperCase();

      if (method === 'OPTIONS') {
        return new Response(undefined, {
          headers: CORS_HEADERS,
          status: HTTP_NO_CONTENT,
        });
      }

      if (pathname === '/health' || pathname === '/') {
        return handleHealth();
      }

      const clientIp = clientIpFromRequest(req);

      if (method === 'GET' && pathname === '/api/statistic') {
        return handleGetStatistic(storage);
      }

      if (method === 'GET' && pathname === '/api/install') {
        return handleInstall(url, storage);
      }

      if (method === 'GET' && pathname === '/api/deinstall') {
        return handleDeinstall(url, storage);
      }

      const isStorageRoute =
        pathname === '/api/storage' || pathname.startsWith(SETTING_PATH_PREFIX);
      if (isStorageRoute) {
        const storageResult = handleStorageRoute({
          clientIp,
          method,
          rateLimiter,
          req,
          storage,
          url,
        });
        return storageResult;
      }

      return json(
        {
          message: `${pathname} not found`,
          name: 'not found',
          statusCode: HTTP_NOT_FOUND,
          statusMessage: 'Route not Found',
        },
        HTTP_NOT_FOUND,
      );
    },
  createApp = (db: Database): AppInstance => {
    const rateLimiter = new RateLimiter(RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS),
      storage = new StorageService(db);
    return {
      fetch: createFetchHandler(storage, rateLimiter),
      rateLimiter,
      storage,
    };
  };

export type { AppInstance };
export { createApp };
