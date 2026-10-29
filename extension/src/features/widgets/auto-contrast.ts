import { compositeColors, getContrastRatio, parseColor } from '../../lib/colorContrast.js';
import type { RGBA } from '../../lib/colorContrast.js';

interface AutoTextOptions {
  preferredTextColor?: string;
  lightTextColor?: string;
  darkTextColor?: string;
}

interface AutoTextResult {
  color: string;
  ratio: number;
}

interface RgbTriplet {
  red: number;
  green: number;
  blue: number;
}

const BRIGHTNESS_MAX_FACTOR = 3;
const CHANNEL_MAX = 255;
const DEFAULT_GRAY = 128;
const DEFAULT_WIDGET_BG = 'rgba(64, 64, 64, 0.4)';
const PERCENT_DIVISOR = 100;
const UNIT_BRIGHTNESS = 1;

function parseBrightnessFactor(brightness?: string): number {
  if (!brightness) {
    return UNIT_BRIGHTNESS;
  }
  const parsed = Number.parseFloat(brightness.replace('%', ''));
  if (!Number.isFinite(parsed)) {
    return UNIT_BRIGHTNESS;
  }
  return Math.min(Math.max(parsed / PERCENT_DIVISOR, 0), BRIGHTNESS_MAX_FACTOR);
}

function clampChannel(value: number): number {
  return Math.min(Math.max(Math.round(value), 0), CHANNEL_MAX);
}

function applyBrightness(rgb: RgbTriplet, factor: number): RGBA {
  if (factor === UNIT_BRIGHTNESS) {
    return { alpha: 1, blue: rgb.blue, green: rgb.green, red: rgb.red };
  }
  return {
    alpha: 1,
    blue: clampChannel(rgb.blue * factor),
    green: clampChannel(rgb.green * factor),
    red: clampChannel(rgb.red * factor),
  };
}

function effectiveWidgetSurface(
  widgetBackground: string | undefined,
  wallpaperAvg: RgbTriplet | string | undefined,
  backdropBrightness?: string,
): RGBA {
  let wallpaper: RGBA;
  if (typeof wallpaperAvg === 'string') {
    wallpaper = { ...parseColor(wallpaperAvg), alpha: 1 };
  } else if (wallpaperAvg) {
    wallpaper = {
      alpha: 1,
      blue: wallpaperAvg.blue,
      green: wallpaperAvg.green,
      red: wallpaperAvg.red,
    };
  } else {
    wallpaper = { alpha: 1, blue: DEFAULT_GRAY, green: DEFAULT_GRAY, red: DEFAULT_GRAY };
  }

  const brightened = applyBrightness(wallpaper, parseBrightnessFactor(backdropBrightness)),
    fg = parseColor(widgetBackground ?? DEFAULT_WIDGET_BG);
  return compositeColors(fg, brightened);
}

function pickBestTextColor(
  effectiveSurface: string | RGBA,
  options?: AutoTextOptions,
): AutoTextResult {
  const light = options?.lightTextColor ?? '#ffffff',
    dark = options?.darkTextColor ?? '#000000',
    candidates: string[] = options?.preferredTextColor
      ? [options.preferredTextColor, light, dark]
      : [light, dark];

  let best = candidates[0] ?? light,
    bestRatio = -1;
  for (const candidate of candidates) {
    const ratio = getContrastRatio(candidate, effectiveSurface);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = candidate;
    }
  }
  return { color: best, ratio: bestRatio };
}

function autoWidgetTextColor(
  widgetBackground: string | undefined,
  wallpaperAvg: RgbTriplet | string | undefined,
  options?: AutoTextOptions & { backdropBrightness?: string },
): AutoTextResult {
  const surface = effectiveWidgetSurface(
    widgetBackground,
    wallpaperAvg,
    options?.backdropBrightness,
  );
  return pickBestTextColor(surface, options);
}

export {
  autoWidgetTextColor,
  effectiveWidgetSurface,
  parseBrightnessFactor,
  pickBestTextColor,
  type AutoTextOptions,
  type AutoTextResult,
};
