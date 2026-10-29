import type { BackgroundData } from '../../types/settings.js';
import { isPlainObject } from '../lib/type-guards.js';

interface RawUnsplashImage {
  id?: string;
  links?: {
    download_location?: string;
    html?: string;
  };
  urls?: {
    raw?: string;
  };
  user?: {
    name?: string;
    links?: {
      html?: string;
    };
  };
}

interface CachedImage {
  id: string;
  src: string;
  author: string;
  profile: string;
  origin: string;
  downloadLocation: string;
}

const BATCH_SIZE = 6,
  BUFFER_STORAGE_KEY = 'tabdash_image_buffer',
  LOW_WATERMARK = 2,
  UNSPLASH_API = 'https://api.unsplash.com';

let memoryBuffer: CachedImage[] = [],
  inFlightReplenish: Promise<CachedImage[]> | null = null;

const isCachedImage = (value: unknown): value is CachedImage =>
    isPlainObject(value) &&
    typeof value.id === 'string' &&
    typeof value.src === 'string' &&
    typeof value.author === 'string',
  toCachedImages = (value: unknown): CachedImage[] =>
    Array.isArray(value) ? value.filter(isCachedImage) : [],
  DEFAULT_DEVICE_PIXEL_RATIO = 1,
  DEFAULT_SCREEN_WIDTH = 1920,
  JPEG_QUALITY = 80;

const buildOptimizedImageUrl = (rawUrl: string, width?: number, dpr?: number): string => {
    if (rawUrl === '') {
      return '';
    }
    const screenWidth =
        width ??
        (typeof screen === 'undefined'
          ? DEFAULT_SCREEN_WIDTH
          : Math.max(screen.width, screen.height)),
      ratio =
        dpr ??
        (typeof window === 'undefined'
          ? DEFAULT_DEVICE_PIXEL_RATIO
          : (window.devicePixelRatio ?? DEFAULT_DEVICE_PIXEL_RATIO)),
      separator = rawUrl.includes('?') ? '&' : '?';
    return `${rawUrl}${separator}auto=format&fit=crop&w=${screenWidth}&q=${String(JPEG_QUALITY)}&dpr=${ratio}`;
  },
  sanitizeUnsplashImage = (
    raw: RawUnsplashImage,
    screenWidth?: number,
    dpr?: number,
  ): CachedImage | null => {
    const rawUrl = raw.urls?.raw;
    if (rawUrl === undefined || rawUrl === '') {
      return null;
    }
    const userName = raw.user?.name ?? '',
      downloadLocation = raw.links?.download_location ?? '',
      origin = raw.links?.html ?? '',
      profile = raw.user?.links?.html ?? '';
    let imageId = raw.id;
    if (imageId === undefined || imageId === '') {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        imageId = crypto.randomUUID();
      } else {
        imageId = String(Date.now());
      }
    }
    return {
      author: userName,
      downloadLocation,
      id: imageId,
      origin,
      profile,
      src: buildOptimizedImageUrl(rawUrl, screenWidth, dpr),
    };
  },
  readBufferFromStorage = async (): Promise<CachedImage[]> => {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage !== undefined &&
      chrome.storage.local !== undefined
    ) {
      return new Promise<CachedImage[]>((resolve) => {
        chrome.storage.local.get(BUFFER_STORAGE_KEY, (result) => {
          const bag = isPlainObject(result) ? result : {},
            stored = bag[BUFFER_STORAGE_KEY];
          resolve(toCachedImages(stored));
        });
      });
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(BUFFER_STORAGE_KEY);
        if (raw !== null && raw !== '') {
          const parsed: unknown = JSON.parse(raw);
          return toCachedImages(parsed);
        }
      } catch {
        // Fall through to memory buffer
      }
    }

    return [...memoryBuffer];
  },
  writeBufferToStorage = async (buffer: CachedImage[]): Promise<void> => {
    memoryBuffer = [...buffer];

    if (
      typeof chrome !== 'undefined' &&
      chrome.storage !== undefined &&
      chrome.storage.local !== undefined
    ) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ [BUFFER_STORAGE_KEY]: buffer }, () => {
          resolve();
        });
      });
      return;
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(BUFFER_STORAGE_KEY, JSON.stringify(buffer));
      } catch {
        // Storage quota or private mode error
      }
    }
  },
  clearBuffer = async (): Promise<void> => {
    memoryBuffer = [];
    inFlightReplenish = null;
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage !== undefined &&
      chrome.storage.local !== undefined
    ) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.remove(BUFFER_STORAGE_KEY, () => {
          resolve();
        });
      });
      return;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(BUFFER_STORAGE_KEY);
      } catch {
        // Ignore removal failure
      }
    }
  },
  preloadImage = (url: string): void => {
    if (url === '' || typeof window === 'undefined') {
      return;
    }
    try {
      const img = new Image();
      img.src = url;
    } catch {
      // Non-critical preloading error
    }
  },
  triggerDownloadTracking = (downloadLocation: string, apiKey: string): void => {
    if (downloadLocation === '' || apiKey === '') {
      return;
    }
    try {
      void fetch(downloadLocation, {
        headers: {
          Authorization: `Client-ID ${apiKey}`,
        },
      }).catch(() => {
        // Non-critical tracking error
      });
    } catch {
      // Non-critical error
    }
  },
  replenishBuffer = async (collections: string[] = [], apiKey?: string): Promise<CachedImage[]> => {
    if (inFlightReplenish) {
      return inFlightReplenish;
    }

    const key = apiKey ?? import.meta.env.VITE_UNSPLASH_API_KEY;
    if (key === undefined || key === '') {
      return readBufferFromStorage();
    }

    inFlightReplenish = (async (): Promise<CachedImage[]> => {
      try {
        const validCollections = collections.map((c) => c.trim()).filter((c) => c.length > 0),
          params = new URLSearchParams({ count: String(BATCH_SIZE) });
        if (validCollections.length > 0) {
          params.set('collections', validCollections.join(','));
        }

        const res = await fetch(`${UNSPLASH_API}/photos/random?${params.toString()}`, {
          headers: {
            Authorization: `Client-ID ${key}`,
          },
        });

        if (!res.ok) {
          return await readBufferFromStorage();
        }

        const data = await res.json();
        if (!Array.isArray(data)) {
          return await readBufferFromStorage();
        }

        const sanitized = data
          .map((item: RawUnsplashImage) => sanitizeUnsplashImage(item))
          .filter((item): item is CachedImage => item !== null);

        if (sanitized.length === 0) {
          return await readBufferFromStorage();
        }

        const current = await readBufferFromStorage(),
          updated = [...current, ...sanitized];
        await writeBufferToStorage(updated);
        return updated;
      } catch {
        return await readBufferFromStorage();
      } finally {
        inFlightReplenish = null;
      }
    })();

    return inFlightReplenish;
  },
  consumeNextImage = async (
    collections: string[] = [],
    apiKey?: string,
  ): Promise<BackgroundData | null> => {
    let buffer = await readBufferFromStorage();

    if (buffer.length === 0) {
      buffer = await replenishBuffer(collections, apiKey);
    }

    if (buffer.length === 0) {
      return null;
    }

    const head = buffer[0];
    if (head === undefined) {
      return null;
    }
    const remaining = buffer.slice(1);
    await writeBufferToStorage(remaining);

    const firstRemaining = remaining[0],
      nextSrc = firstRemaining === undefined ? '' : firstRemaining.src;
    if (nextSrc !== '') {
      preloadImage(nextSrc);
    }

    const key = apiKey ?? import.meta.env.VITE_UNSPLASH_API_KEY;
    if (head.downloadLocation !== '' && key !== undefined && key !== '') {
      triggerDownloadTracking(head.downloadLocation, key);
    }

    if (remaining.length < LOW_WATERMARK) {
      void replenishBuffer(collections, apiKey).catch(() => {
        // Non-critical background refill error
      });
    }

    return {
      author: head.author,
      next: nextSrc,
      origin: head.origin,
      profile: head.profile,
      src: head.src,
    };
  };

export {
  BATCH_SIZE,
  BUFFER_STORAGE_KEY,
  buildOptimizedImageUrl,
  clearBuffer,
  consumeNextImage,
  LOW_WATERMARK,
  preloadImage,
  readBufferFromStorage,
  replenishBuffer,
  sanitizeUnsplashImage,
  triggerDownloadTracking,
  type CachedImage,
  type RawUnsplashImage,
  writeBufferToStorage,
};
