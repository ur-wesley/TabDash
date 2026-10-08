import {
  compositeColors,
  getContrastRatio,
  parseColor,
  type RGBA,
} from '../../lib/colorContrast.js';

export interface AutoTextOptions {
  preferredTextColor?: string;
  lightTextColor?: string;
  darkTextColor?: string;
}

export interface AutoTextResult {
  color: string;
  ratio: number;
}

/**
 * Parses a CSS brightness percent (e.g. "160%") into a multiplier.
 * Returns 1 for missing/invalid input.
 */
export function parseBrightnessFactor(brightness?: string): number {
  if (!brightness) return 1;
  const v = Number.parseFloat(brightness.replace('%', ''));
  if (!Number.isFinite(v)) return 1;
  return Math.min(Math.max(v / 100, 0), 3);
}

function clampChannel(value: number): number {
  return Math.min(Math.max(Math.round(value), 0), 255);
}

function applyBrightness(rgb: { r: number; g: number; b: number }, factor: number): RGBA {
  if (factor === 1) return { r: rgb.r, g: rgb.g, b: rgb.b, a: 1 };
  return {
    r: clampChannel(rgb.r * factor),
    g: clampChannel(rgb.g * factor),
    b: clampChannel(rgb.b * factor),
    a: 1,
  };
}

/**
 * Computes the effective opaque surface of a (possibly translucent) widget
 * background composited over the sampled wallpaper color behind the widget.
 * The widget backdrop brightness filter brightens what shows through, so the
 * sampled color is scaled by it before compositing.
 */
export function effectiveWidgetSurface(
  widgetBackground: string | undefined,
  wallpaperAvg: { r: number; g: number; b: number } | string | undefined,
  backdropBrightness?: string,
): RGBA {
  let wallpaper: RGBA;
  if (typeof wallpaperAvg === 'string') {
    wallpaper = { ...parseColor(wallpaperAvg), a: 1 };
  } else if (wallpaperAvg) {
    wallpaper = { r: wallpaperAvg.r, g: wallpaperAvg.g, b: wallpaperAvg.b, a: 1 };
  } else {
    wallpaper = { r: 128, g: 128, b: 128, a: 1 };
  }

  const brightened = applyBrightness(wallpaper, parseBrightnessFactor(backdropBrightness));
  const fg = parseColor(widgetBackground ?? 'rgba(64, 64, 64, 0.4)');
  return compositeColors(fg, brightened);
}

/**
 * Picks the highest-contrast text color for an effective surface.
 * The preferred (user-configured) color is kept when it already wins or
 * ties — otherwise the better of light/dark is returned. This always yields
 * the best contrast instead of merely a passing one.
 */
export function pickBestTextColor(
  effectiveSurface: string | RGBA,
  options?: AutoTextOptions,
): AutoTextResult {
  const light = options?.lightTextColor ?? '#ffffff';
  const dark = options?.darkTextColor ?? '#000000';
  const candidates: string[] = options?.preferredTextColor
    ? [options.preferredTextColor, light, dark]
    : [light, dark];

  let best = candidates[0] ?? light;
  let bestRatio = -1;
  for (const candidate of candidates) {
    const ratio = getContrastRatio(candidate, effectiveSurface);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = candidate;
    }
  }
  return { color: best, ratio: bestRatio };
}

/**
 * One-step helper: from widget background + wallpaper sample to the best
 * readable text color.
 */
export function autoWidgetTextColor(
  widgetBackground: string | undefined,
  wallpaperAvg: { r: number; g: number; b: number } | string | undefined,
  options?: AutoTextOptions & { backdropBrightness?: string },
): AutoTextResult {
  const surface = effectiveWidgetSurface(
    widgetBackground,
    wallpaperAvg,
    options?.backdropBrightness,
  );
  return pickBestTextColor(surface, options);
}
