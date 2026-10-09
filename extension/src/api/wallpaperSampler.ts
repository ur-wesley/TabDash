import type { BackgroundSetting } from '../../types/settings.js';

export interface ViewportSize {
  w: number;
  h: number;
}

export interface ViewRect {
  /** Left edge in viewport CSS pixels. */
  x: number;
  /** Top edge in viewport CSS pixels. */
  y: number;
  /** Width in CSS pixels. */
  w: number;
  /** Height in CSS pixels. */
  h: number;
}

export interface SourceRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export type BackgroundSource =
  | { kind: 'image'; src: string }
  | { kind: 'color'; color: string }
  | { kind: 'none' };

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Mirrors the source priority of `BackgroundLayer.imageSrc()`:
 * active image -> static -> inactive image -> none.
 */
export function resolveBackgroundSource(bg?: BackgroundSetting): BackgroundSource {
  if (!bg) {
    return { kind: 'none' };
  }
  if (bg.active && bg.image?.src) {
    return { kind: 'image', src: bg.image.src };
  }
  if (bg.static) {
    return { kind: 'image', src: bg.static };
  }
  if (bg.image?.src) {
    return { kind: 'image', src: bg.image.src };
  }
  if (bg.color) {
    return { kind: 'color', color: bg.color };
  }
  return { kind: 'none' };
}

export function resolveBackgroundColor(bg?: BackgroundSetting): string | undefined {
  return bg?.color;
}

/**
 * Maps a viewport-space rect onto the natural image pixel space,
 * replicating CSS `object-fit: cover` (centered, no offset anchor).
 * Pure and unit-tested.
 */
export function coverSourceRect(
  natural: ViewportSize,
  view: ViewportSize,
  rect: ViewRect,
): SourceRect {
  const naturalW = natural.w,
    naturalH = natural.h,
    viewW = view.w,
    viewH = view.h;
  if (naturalW <= 0 || naturalH <= 0 || viewW <= 0 || viewH <= 0) {
    return { sh: Math.max(naturalH, 0), sw: Math.max(naturalW, 0), sx: 0, sy: 0 };
  }
  const scale = Math.max(viewW / naturalW, viewH / naturalH),
    displayedW = naturalW * scale,
    displayedH = naturalH * scale,
    offsetX = (viewW - displayedW) / 2,
    offsetY = (viewH - displayedH) / 2,
    x0 = clampNumber((rect.x - offsetX) / scale, 0, naturalW),
    y0 = clampNumber((rect.y - offsetY) / scale, 0, naturalH),
    x1 = clampNumber((rect.x + rect.w - offsetX) / scale, 0, naturalW),
    y1 = clampNumber((rect.y + rect.h - offsetY) / scale, 0, naturalH);

  return { sh: Math.max(y1 - y0, 0), sw: Math.max(x1 - x0, 0), sx: x0, sy: y0 };
}

export interface Thumb {
  data: Uint8ClampedArray;
  w: number;
  h: number;
  naturalW: number;
  naturalH: number;
}

const MAX_THUMB_SIDE = 64,
  thumbCache = new Map<string, Promise<Thumb | null>>();

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.addEventListener(
      'load',
      () => {
        resolve(img);
      },
      { once: true },
    );
    img.addEventListener(
      'error',
      () => {
        reject(new Error(`Failed to load wallpaper image`));
      },
      {
        once: true,
      },
    );
    img.src = src;
  });
}

/**
 * Decodes `src` once and keeps a small pixel buffer for cheap per-widget
 * region averages. Returns `null` when the image cannot be read
 * (network failure or canvas taint from missing CORS headers).
 */
export async function getWallpaperThumb(src: string): Promise<Thumb | null> {
  if (!src) {
    return Promise.resolve(null);
  }
  const cached = thumbCache.get(src);
  if (cached) {
    return cached;
  }

  const pending: Promise<Thumb | null> = (async () => {
    try {
      const img = await loadImage(src),
        naturalW = img.naturalWidth || img.width,
        naturalH = img.naturalHeight || img.height;
      if (!naturalW || !naturalH) {
        return null;
      }

      const longest = Math.max(naturalW, naturalH),
        k = longest > MAX_THUMB_SIDE ? MAX_THUMB_SIDE / longest : 1,
        w = Math.max(Math.round(naturalW * k), 1),
        h = Math.max(Math.round(naturalH * k), 1),
        canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return null;
      }
      ctx.drawImage(img, 0, 0, w, h);
      const pixels = ctx.getImageData(0, 0, w, h);
      return { data: pixels.data, h, naturalH, naturalW, w };
    } catch {
      return null;
    }
  })();

  thumbCache.set(src, pending);
  // Drop failures from the cache so a retry can succeed later.
  void pending.then((thumb) => {
    if (!thumb) {
      thumbCache.delete(src);
    }
  });
  return pending;
}

/** Clears the in-memory thumbnail cache (used by tests). */
export function clearWallpaperThumbCache(): void {
  thumbCache.clear();
}

/**
 * Averages the thumb pixels covered by `srcRect` (natural image coords).
 * Pure and unit-tested.
 */
export function averageThumbRegion(
  thumb: Thumb,
  srcRect: SourceRect,
): { r: number; g: number; b: number } | null {
  if (thumb.w <= 0 || thumb.h <= 0 || srcRect.sw <= 0 || srcRect.sh <= 0) {
    return null;
  }

  const kx0 = Math.floor((srcRect.sx / thumb.naturalW) * thumb.w),
    ky0 = Math.floor((srcRect.sy / thumb.naturalH) * thumb.h),
    kx1 = Math.ceil(((srcRect.sx + srcRect.sw) / thumb.naturalW) * thumb.w),
    ky1 = Math.ceil(((srcRect.sy + srcRect.sh) / thumb.naturalH) * thumb.h),
    x0 = Math.min(Math.max(kx0, 0), thumb.w),
    y0 = Math.min(Math.max(ky0, 0), thumb.h),
    x1 = Math.min(Math.max(kx1, 0), thumb.w),
    y1 = Math.min(Math.max(ky1, 0), thumb.h);
  if (x1 <= x0 || y1 <= y0) {
    return null;
  }

  // Stride over large regions so averaging stays O(1)-ish.
  const stride = Math.max(Math.floor(Math.sqrt(((x1 - x0) * (y1 - y0)) / 256)), 1);

  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  for (let y = y0; y < y1; y += stride) {
    for (let x = x0; x < x1; x += stride) {
      const i = (y * thumb.w + x) * 4,
        d = thumb.data;
      if (i + 2 >= d.length) {
        continue;
      }
      r += d[i] ?? 0;
      g += d[i + 1] ?? 0;
      b += d[i + 2] ?? 0;
      n += 1;
    }
  }
  if (n === 0) {
    return null;
  }
  return { b: Math.round(b / n), g: Math.round(g / n), r: Math.round(r / n) };
}

/**
 * Samples the average wallpaper color behind `rect`.
 * Returns `null` when there is no image or it cannot be read;
 * callers fall back to `background.color`.
 */
export async function sampleWallpaperRegion(
  src: string,
  rect: ViewRect,
  viewport: ViewportSize,
): Promise<{ r: number; g: number; b: number } | null> {
  if (!src || rect.w <= 0 || rect.h <= 0) {
    return null;
  }
  const thumb = await getWallpaperThumb(src);
  if (!thumb) {
    return null;
  }
  const srcRect = coverSourceRect({ h: thumb.naturalH, w: thumb.naturalW }, viewport, rect);
  return averageThumbRegion(thumb, srcRect);
}
