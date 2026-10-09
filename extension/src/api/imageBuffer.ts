import type { BackgroundData } from '../../types/settings.js';

export interface RawUnsplashImage {
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

export interface CachedImage {
  id: string;
  src: string;
  author: string;
  profile: string;
  origin: string;
  downloadLocation: string;
}

export const BUFFER_STORAGE_KEY = 'tabdash_image_buffer';
export const LOW_WATERMARK = 2;
export const BATCH_SIZE = 6;
const UNSPLASH_API = 'https://api.unsplash.com';

let memoryBuffer: CachedImage[] = [],
  inFlightReplenish: Promise<CachedImage[]> | null = null;

export const buildOptimizedImageUrl = (rawUrl: string, width?: number, dpr?: number): string => {
  if (!rawUrl) {
    return '';
  }
  const screenWidth =
      width ?? (typeof screen === 'undefined' ? 1920 : Math.max(screen.width, screen.height)),
    ratio = dpr ?? (typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1),
    separator = rawUrl.includes('?') ? '&' : '?';
  return `${rawUrl}${separator}auto=format&fit=crop&w=${screenWidth}&q=80&dpr=${ratio}`;
};

export const sanitizeUnsplashImage = (
  raw: RawUnsplashImage,
  screenWidth?: number,
  dpr?: number,
): CachedImage | null => {
  if (!raw?.urls?.raw) {
    return null;
  }
  return {
    author: raw.user?.name ?? '',
    downloadLocation: raw.links?.download_location ?? '',
    id:
      raw.id ??
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now())),
    origin: raw.links?.html ?? '',
    profile: raw.user?.links?.html ?? '',
    src: buildOptimizedImageUrl(raw.urls.raw, screenWidth, dpr),
  };
};

export const readBufferFromStorage = async (): Promise<CachedImage[]> => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return new Promise<CachedImage[]>((resolve) => {
      chrome.storage.local.get(BUFFER_STORAGE_KEY, (result) => {
        const stored = result?.[BUFFER_STORAGE_KEY];
        resolve(Array.isArray(stored) ? stored : []);
      });
    });
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(BUFFER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Fall through to memory buffer
    }
  }

  return [...memoryBuffer];
};

export const writeBufferToStorage = async (buffer: CachedImage[]): Promise<void> => {
  memoryBuffer = [...buffer];

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
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
};

export const clearBuffer = async (): Promise<void> => {
  memoryBuffer = [];
  inFlightReplenish = null;
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
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
};

export const preloadImage = (url: string): void => {
  if (!url || typeof window === 'undefined') {
    return;
  }
  try {
    const img = new Image();
    img.src = url;
  } catch {
    // Non-critical preloading error
  }
};

export const triggerDownloadTracking = (downloadLocation: string, apiKey: string): void => {
  if (!downloadLocation || !apiKey) {
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
};

export const replenishBuffer = async (
  collections: string[] = [],
  apiKey?: string,
): Promise<CachedImage[]> => {
  if (inFlightReplenish) {
    return inFlightReplenish;
  }

  const key = apiKey ?? import.meta.env.VITE_UNSPLASH_API_KEY;
  if (!key) {
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
};

export const consumeNextImage = async (
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

  const nextSrc = remaining[0]?.src ?? '';
  if (nextSrc) {
    preloadImage(nextSrc);
  }

  const key = apiKey ?? import.meta.env.VITE_UNSPLASH_API_KEY;
  if (head.downloadLocation && key) {
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
