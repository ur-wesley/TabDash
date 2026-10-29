import type { BackgroundSetting } from '../../types/settings.js';

interface ViewportSize {
  width: number;
  height: number;
}

interface ViewRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface SourceRect {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
}

interface RgbAverage {
  red: number;
  green: number;
  blue: number;
}

type BackgroundSource =
  | { kind: 'image'; src: string }
  | { kind: 'color'; color: string }
  | { kind: 'none' };

const BLUE_CHANNEL_OFFSET = 2;
const GREEN_CHANNEL_OFFSET = 1;
const HALF_DIVISOR = 2;
const MAX_THUMB_SIDE = 64;
const MIN_THUMB_SIDE = 1;
const ORIGIN = 0;
const REGION_SAMPLE_TARGET = 256;
const RGBA_STRIDE = 4;

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function resolveBackgroundSource(bg?: BackgroundSetting): BackgroundSource {
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
    return { color: bg.color, kind: 'color' };
  }
  return { kind: 'none' };
}

function resolveBackgroundColor(bg?: BackgroundSetting): string | undefined {
  return bg?.color;
}

function coverSourceRect(natural: ViewportSize, view: ViewportSize, rect: ViewRect): SourceRect {
  const naturalWidth = natural.width,
    naturalHeight = natural.height,
    viewWidth = view.width,
    viewHeight = view.height;
  if (naturalWidth <= 0 || naturalHeight <= 0 || viewWidth <= 0 || viewHeight <= 0) {
    return {
      sourceHeight: Math.max(naturalHeight, ORIGIN),
      sourceWidth: Math.max(naturalWidth, ORIGIN),
      sourceX: ORIGIN,
      sourceY: ORIGIN,
    };
  }
  const scale = Math.max(viewWidth / naturalWidth, viewHeight / naturalHeight),
    displayedWidth = naturalWidth * scale,
    displayedHeight = naturalHeight * scale,
    offsetX = (viewWidth - displayedWidth) / HALF_DIVISOR,
    offsetY = (viewHeight - displayedHeight) / HALF_DIVISOR,
    cornerX0 = clampNumber((rect.left - offsetX) / scale, ORIGIN, naturalWidth),
    cornerY0 = clampNumber((rect.top - offsetY) / scale, ORIGIN, naturalHeight),
    cornerX1 = clampNumber((rect.left + rect.width - offsetX) / scale, ORIGIN, naturalWidth),
    cornerY1 = clampNumber((rect.top + rect.height - offsetY) / scale, ORIGIN, naturalHeight);

  return {
    sourceHeight: Math.max(cornerY1 - cornerY0, ORIGIN),
    sourceWidth: Math.max(cornerX1 - cornerX0, ORIGIN),
    sourceX: cornerX0,
    sourceY: cornerY0,
  };
}

interface Thumb {
  data: Uint8ClampedArray;
  thumbWidth: number;
  thumbHeight: number;
  naturalWidth: number;
  naturalHeight: number;
}

const thumbCache = new Map<string, Promise<Thumb | null>>();

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

async function getWallpaperThumb(src: string): Promise<Thumb | null> {
  if (!src) {
    return null;
  }
  const cached = thumbCache.get(src);
  if (cached) {
    return cached;
  }

  const pending: Promise<Thumb | null> = (async () => {
    try {
      const img = await loadImage(src),
        naturalWidth = img.naturalWidth || img.width,
        naturalHeight = img.naturalHeight || img.height;
      if (!naturalWidth || !naturalHeight) {
        return null;
      }

      const longest = Math.max(naturalWidth, naturalHeight),
        thumbScale = longest > MAX_THUMB_SIDE ? MAX_THUMB_SIDE / longest : 1,
        thumbWidth = Math.max(Math.round(naturalWidth * thumbScale), MIN_THUMB_SIDE),
        thumbHeight = Math.max(Math.round(naturalHeight * thumbScale), MIN_THUMB_SIDE),
        canvas = document.createElement('canvas');
      canvas.width = thumbWidth;
      canvas.height = thumbHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return null;
      }
      ctx.drawImage(img, ORIGIN, ORIGIN, thumbWidth, thumbHeight);
      const pixels = ctx.getImageData(ORIGIN, ORIGIN, thumbWidth, thumbHeight);
      return {
        data: pixels.data,
        naturalHeight,
        naturalWidth,
        thumbHeight,
        thumbWidth,
      };
    } catch {
      return null;
    }
  })();

  thumbCache.set(src, pending);
  void pending.then((thumb) => {
    if (!thumb) {
      thumbCache.delete(src);
    }
  });
  return pending;
}

function clearWallpaperThumbCache(): void {
  thumbCache.clear();
}

function averageThumbRegion(thumb: Thumb, srcRect: SourceRect): RgbAverage | null {
  if (
    thumb.thumbWidth <= 0 ||
    thumb.thumbHeight <= 0 ||
    srcRect.sourceWidth <= 0 ||
    srcRect.sourceHeight <= 0
  ) {
    return null;
  }

  const keyX0 = Math.floor((srcRect.sourceX / thumb.naturalWidth) * thumb.thumbWidth),
    keyY0 = Math.floor((srcRect.sourceY / thumb.naturalHeight) * thumb.thumbHeight),
    keyX1 = Math.ceil(
      ((srcRect.sourceX + srcRect.sourceWidth) / thumb.naturalWidth) * thumb.thumbWidth,
    ),
    keyY1 = Math.ceil(
      ((srcRect.sourceY + srcRect.sourceHeight) / thumb.naturalHeight) * thumb.thumbHeight,
    ),
    sampleX0 = Math.min(Math.max(keyX0, ORIGIN), thumb.thumbWidth),
    sampleY0 = Math.min(Math.max(keyY0, ORIGIN), thumb.thumbHeight),
    sampleX1 = Math.min(Math.max(keyX1, ORIGIN), thumb.thumbWidth),
    sampleY1 = Math.min(Math.max(keyY1, ORIGIN), thumb.thumbHeight);
  if (sampleX1 <= sampleX0 || sampleY1 <= sampleY0) {
    return null;
  }

  const stride = Math.max(
    Math.floor(Math.sqrt(((sampleX1 - sampleX0) * (sampleY1 - sampleY0)) / REGION_SAMPLE_TARGET)),
    MIN_THUMB_SIDE,
  );

  let blueSum = 0,
    greenSum = 0,
    redSum = 0,
    sampleCount = 0;
  for (let row = sampleY0; row < sampleY1; row += stride) {
    for (let col = sampleX0; col < sampleX1; col += stride) {
      const index = (row * thumb.thumbWidth + col) * RGBA_STRIDE,
        pixelData = thumb.data;
      if (index + BLUE_CHANNEL_OFFSET >= pixelData.length) {
        continue;
      }
      redSum += pixelData[index] ?? ORIGIN;
      greenSum += pixelData[index + GREEN_CHANNEL_OFFSET] ?? ORIGIN;
      blueSum += pixelData[index + BLUE_CHANNEL_OFFSET] ?? ORIGIN;
      sampleCount += 1;
    }
  }
  if (sampleCount === 0) {
    return null;
  }
  return {
    blue: Math.round(blueSum / sampleCount),
    green: Math.round(greenSum / sampleCount),
    red: Math.round(redSum / sampleCount),
  };
}

async function sampleWallpaperRegion(
  src: string,
  rect: ViewRect,
  viewport: ViewportSize,
): Promise<RgbAverage | null> {
  if (!src || rect.width <= 0 || rect.height <= 0) {
    return null;
  }
  const thumb = await getWallpaperThumb(src);
  if (!thumb) {
    return null;
  }
  const srcRect = coverSourceRect(
    { height: thumb.naturalHeight, width: thumb.naturalWidth },
    viewport,
    rect,
  );
  return averageThumbRegion(thumb, srcRect);
}

export {
  averageThumbRegion,
  clearWallpaperThumbCache,
  coverSourceRect,
  getWallpaperThumb,
  resolveBackgroundColor,
  resolveBackgroundSource,
  sampleWallpaperRegion,
  type BackgroundSource,
  type RgbAverage,
  type SourceRect,
  type Thumb,
  type ViewportSize,
  type ViewRect,
};
