import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import {
  buildOptimizedImageUrl,
  clearBuffer,
  consumeNextImage,
  readBufferFromStorage,
  replenishBuffer,
  sanitizeUnsplashImage,
  writeBufferToStorage,
} from './imageBuffer.js';
import type { RawUnsplashImage } from './imageBuffer.js';

describe('imageBuffer utility', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(async () => {
    await clearBuffer();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('builds optimized image URL with proper parameters', () => {
    const raw = 'https://images.unsplash.com/photo-123',
      optimized = buildOptimizedImageUrl(raw, 2560, 2);
    expect(optimized).toContain('auto=format');
    expect(optimized).toContain('fit=crop');
    expect(optimized).toContain('w=2560');
    expect(optimized).toContain('dpr=2');
    expect(optimized).toContain('q=80');
  });

  it('sanitizes raw Unsplash image into minimal cached representation', () => {
    const raw: RawUnsplashImage = {
        id: 'photo-abc',
        links: {
          download_location: 'https://api.unsplash.com/photos/photo-abc/download',
          html: 'https://unsplash.com/photos/photo-abc',
        },
        urls: {
          raw: 'https://images.unsplash.com/photo-abc',
        },
        user: {
          links: {
            html: 'https://unsplash.com/@janedoe',
          },
          name: 'Jane Doe',
        },
      },
      sanitized = sanitizeUnsplashImage(raw, 1920, 1);
    expect(sanitized).not.toBeNull();
    expect(sanitized?.id).toBe('photo-abc');
    expect(sanitized?.author).toBe('Jane Doe');
    expect(sanitized?.profile).toBe('https://unsplash.com/@janedoe');
    expect(sanitized?.origin).toBe('https://unsplash.com/photos/photo-abc');
    expect(sanitized?.downloadLocation).toBe('https://api.unsplash.com/photos/photo-abc/download');
    expect(sanitized?.src).toContain('auto=format');
  });

  it('returns null when raw Unsplash object has no image url', () => {
    const sanitized = sanitizeUnsplashImage({});
    expect(sanitized).toBeNull();
  });

  it('consumes head image immediately when buffer is pre-populated', async () => {
    await writeBufferToStorage([
      {
        author: 'User 1',
        downloadLocation: 'https://download1',
        id: 'img1',
        origin: 'https://photo1',
        profile: 'https://user1',
        src: 'https://images.unsplash.com/1',
      },
      {
        author: 'User 2',
        downloadLocation: 'https://download2',
        id: 'img2',
        origin: 'https://photo2',
        profile: 'https://user2',
        src: 'https://images.unsplash.com/2',
      },
    ]);

    const consumed = await consumeNextImage(['nature'], 'dummy_key');
    expect(consumed).not.toBeNull();
    expect(consumed?.src).toBe('https://images.unsplash.com/1');
    expect(consumed?.next).toBe('https://images.unsplash.com/2');
    expect(consumed?.author).toBe('User 1');

    const remaining = await readBufferFromStorage();
    expect(remaining.length).toBe(1);
    expect(remaining[0]?.id).toBe('img2');
  });

  it('replenishes buffer from API when empty and consumes cleanly', async () => {
    let trackingCalled = false;
    globalThis.fetch = (async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes('download')) {
        trackingCalled = true;
        return new Response(JSON.stringify({ url: 'https://download' }), { status: 200 });
      }

      return new Response(
        JSON.stringify([
          {
            id: 'mock-1',
            links: {
              download_location: 'https://api.unsplash.com/download-1',
              html: 'https://unsplash.com/photo-1',
            },
            urls: { raw: 'https://images.unsplash.com/photo-1' },
            user: { links: { html: 'https://unsplash.com/@p1' }, name: 'Photographer 1' },
          },
          {
            id: 'mock-2',
            links: {
              download_location: 'https://api.unsplash.com/download-2',
              html: 'https://unsplash.com/photo-2',
            },
            urls: { raw: 'https://images.unsplash.com/photo-2' },
            user: { links: { html: 'https://unsplash.com/@p2' }, name: 'Photographer 2' },
          },
        ]),
        { status: 200 },
      );
    }) as unknown as typeof fetch;

    const result = await consumeNextImage(['nature'], 'test_api_key');
    expect(result).not.toBeNull();
    expect(result?.author).toBe('Photographer 1');
    expect(result?.next).toContain('photo-2');

    // Remaining in buffer should be mock-2
    const current = await readBufferFromStorage();
    expect(current.some((c) => c.id === 'mock-2')).toBe(true);
    expect(trackingCalled).toBe(true);
  });

  it('deduplicates simultaneous in-flight replenish requests', async () => {
    let callCount = 0;
    globalThis.fetch = (async () => {
      callCount++;
      await new Promise((r) => setTimeout(r, 20));
      return new Response(
        JSON.stringify([
          {
            id: `call-${callCount}`,
            links: {},
            urls: { raw: 'https://images.unsplash.com/test' },
            user: {},
          },
        ]),
        { status: 200 },
      );
    }) as unknown as typeof fetch;

    const [p1, p2] = await Promise.all([
      replenishBuffer([], 'key_1'),
      replenishBuffer([], 'key_1'),
    ]);

    expect(callCount).toBe(1);
    expect(p1.length).toBe(p2.length);
  });

  it('handles non-200 API responses gracefully without throwing', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ errors: ['Rate limit exceeded'] }), {
        status: 403,
      })) as unknown as typeof fetch;

    const result = await consumeNextImage([], 'key');
    expect(result).toBeNull();
    const buffer = await readBufferFromStorage();
    expect(buffer).toEqual([]);
  });
});
