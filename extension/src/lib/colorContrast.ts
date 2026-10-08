/**
 * Color and contrast utility for widgets.
 *
 * Implements WCAG 2.1 relative luminance and contrast ratio algorithms
 * with alpha-compositing support for translucent backgrounds.
 */

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ContrastOptions {
  /**
   * The user-configured or preferred text color.
   * If this color meets `minRatio`, it will be preserved.
   */
  preferredTextColor?: string;
  /**
   * Light text fallback color (defaults to #ffffff).
   */
  lightTextColor?: string;
  /**
   * Dark text fallback color (defaults to #000000).
   */
  darkTextColor?: string;
  /**
   * Minimum contrast ratio required (defaults to 4.5 for WCAG AA normal text).
   */
  minRatio?: number;
  /**
   * Underlying surface color used to composite semi-transparent backgrounds
   * (defaults to #000000).
   */
  underlyingColor?: string | RGBA;
}

export interface WidgetContrastParams {
  /**
   * Individual widget background color or CSS color string (e.g. rgba(64, 64, 64, 0.4)).
   */
  background?: string;
  /**
   * Preferred or currently set text color.
   */
  preferredTextColor?: string;
  /**
   * Optional underlying canvas or wallpaper color for translucent widgets.
   */
  underlyingColor?: string | RGBA;
  /**
   * Minimum contrast ratio threshold (defaults to 4.5).
   */
  minRatio?: number;
  /**
   * Light text color option (defaults to #ffffff).
   */
  lightTextColor?: string;
  /**
   * Dark text color option (defaults to #000000).
   */
  darkTextColor?: string;
}

export const DEFAULT_WIDGET_BACKGROUND = 'rgba(64, 64, 64, 0.4)';

const NAMED_COLORS: Record<string, RGBA> = {
  transparent: { r: 0, g: 0, b: 0, a: 0 },
  black: { r: 0, g: 0, b: 0, a: 1 },
  white: { r: 255, g: 255, b: 255, a: 1 },
  gray: { r: 128, g: 128, b: 128, a: 1 },
  grey: { r: 128, g: 128, b: 128, a: 1 },
  red: { r: 255, g: 0, b: 0, a: 1 },
  green: { r: 0, g: 128, b: 0, a: 1 },
  blue: { r: 0, g: 0, b: 255, a: 1 },
  yellow: { r: 255, g: 255, b: 0, a: 1 },
  cyan: { r: 0, g: 255, b: 255, a: 1 },
  magenta: { r: 255, g: 0, b: 255, a: 1 },
  orange: { r: 255, g: 165, b: 0, a: 1 },
  purple: { r: 128, g: 0, b: 128, a: 1 },
  slate: { r: 100, g: 116, b: 139, a: 1 },
  zinc: { r: 113, g: 113, b: 122, a: 1 },
};

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

function hue2rgb(p: number, q: number, t: number): number {
  let tNorm = t;
  if (tNorm < 0) tNorm += 1;
  if (tNorm > 1) tNorm -= 1;
  if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
  if (tNorm < 1 / 2) return q;
  if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
  return p;
}

/**
 * Converts HSL values to RGB [0-255].
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const normH = (((h % 360) + 360) % 360) / 360;
  const normS = clamp(s, 0, 100) / 100;
  const normL = clamp(l, 0, 100) / 100;

  if (normS === 0) {
    const val = Math.round(normL * 255);
    return { r: val, g: val, b: val };
  }

  const q = normL < 0.5 ? normL * (1 + normS) : normL + normS - normL * normS;
  const p = 2 * normL - q;

  return {
    r: Math.round(hue2rgb(p, q, normH + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, normH) * 255),
    b: Math.round(hue2rgb(p, q, normH - 1 / 3) * 255),
  };
}

function parseChannelValue(str: string, max = 255): number {
  if (str.endsWith('%')) {
    return (Number.parseFloat(str) / 100) * max;
  }
  return Number.parseFloat(str);
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Parses any common CSS color string into an RGBA object.
 * Returns opaque black { r: 0, g: 0, b: 0, a: 1 } if invalid.
 */
export function parseColor(color: string | RGBA): RGBA {
  if (typeof color === 'object' && color !== null && 'r' in color) {
    return {
      r: clamp(color.r, 0, 255),
      g: clamp(color.g, 0, 255),
      b: clamp(color.b, 0, 255),
      a: clamp(color.a ?? 1, 0, 1),
    };
  }

  if (typeof color !== 'string') {
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  const trimmed = color.trim().toLowerCase();
  if (!trimmed) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  if (NAMED_COLORS[trimmed]) {
    return { ...NAMED_COLORS[trimmed] };
  }

  // Hex format (#rgb, #rgba, #rrggbb, #rrggbbaa)
  const hexMatch = trimmed.match(/^#?([0-9a-f]{3,8})$/i);
  if (hexMatch && hexMatch[1]) {
    const raw = hexMatch[1];
    if (raw.length === 3) {
      const rChar = raw.charAt(0);
      const gChar = raw.charAt(1);
      const bChar = raw.charAt(2);
      return {
        r: Number.parseInt(rChar + rChar, 16),
        g: Number.parseInt(gChar + gChar, 16),
        b: Number.parseInt(bChar + bChar, 16),
        a: 1,
      };
    }
    if (raw.length === 4) {
      const rChar = raw.charAt(0);
      const gChar = raw.charAt(1);
      const bChar = raw.charAt(2);
      const aChar = raw.charAt(3);
      return {
        r: Number.parseInt(rChar + rChar, 16),
        g: Number.parseInt(gChar + gChar, 16),
        b: Number.parseInt(bChar + bChar, 16),
        a: Number.parseInt(aChar + aChar, 16) / 255,
      };
    }
    if (raw.length === 6) {
      return {
        r: Number.parseInt(raw.slice(0, 2), 16),
        g: Number.parseInt(raw.slice(2, 4), 16),
        b: Number.parseInt(raw.slice(4, 6), 16),
        a: 1,
      };
    }
    if (raw.length === 8) {
      return {
        r: Number.parseInt(raw.slice(0, 2), 16),
        g: Number.parseInt(raw.slice(2, 4), 16),
        b: Number.parseInt(raw.slice(4, 6), 16),
        a: Number.parseInt(raw.slice(6, 8), 16) / 255,
      };
    }
  }

  // rgb / rgba format
  // Handles rgb(r, g, b), rgba(r, g, b, a), rgb(r g b / a)
  const rgbMatch = trimmed.match(/^rgba?\((.+)\)$/);
  if (rgbMatch && rgbMatch[1]) {
    const inner = rgbMatch[1].replace(/,/g, ' ').replace(/\//g, ' ').trim();
    const parts = inner.split(/\s+/).filter(Boolean);
    const p0 = parts[0];
    const p1 = parts[1];
    const p2 = parts[2];
    const p3 = parts[3];
    if (p0 !== undefined && p1 !== undefined && p2 !== undefined) {
      const r = clamp(Math.round(parseChannelValue(p0, 255)), 0, 255);
      const g = clamp(Math.round(parseChannelValue(p1, 255)), 0, 255);
      const b = clamp(Math.round(parseChannelValue(p2, 255)), 0, 255);
      let a = 1;
      if (p3 !== undefined) {
        if (p3.endsWith('%')) {
          a = clamp(Number.parseFloat(p3) / 100, 0, 1);
        } else {
          a = clamp(Number.parseFloat(p3), 0, 1);
        }
      }
      return { r, g, b, a };
    }
  }

  // hsl / hsla format
  const hslMatch = trimmed.match(/^hsla?\((.+)\)$/);
  if (hslMatch && hslMatch[1]) {
    const inner = hslMatch[1].replace(/,/g, ' ').replace(/\//g, ' ').trim();
    const parts = inner.split(/\s+/).filter(Boolean);
    const p0 = parts[0];
    const p1 = parts[1];
    const p2 = parts[2];
    const p3 = parts[3];
    if (p0 !== undefined && p1 !== undefined && p2 !== undefined) {
      const h = Number.parseFloat(p0);
      const s = Number.parseFloat(p1.replace('%', ''));
      const l = Number.parseFloat(p2.replace('%', ''));
      const { r, g, b } = hslToRgb(h, s, l);
      let a = 1;
      if (p3 !== undefined) {
        if (p3.endsWith('%')) {
          a = clamp(Number.parseFloat(p3) / 100, 0, 1);
        } else {
          a = clamp(Number.parseFloat(p3), 0, 1);
        }
      }
      return { r, g, b, a };
    }
  }

  return { r: 0, g: 0, b: 0, a: 1 };
}

/**
 * Composites a foreground color over an underlying background color using alpha blending.
 * Resulting color is opaque (alpha = 1).
 */
export function compositeColors(
  foreground: RGBA,
  background: RGBA = { r: 0, g: 0, b: 0, a: 1 },
): RGBA {
  const alpha = foreground.a;
  if (alpha >= 1) {
    return { ...foreground, a: 1 };
  }
  if (alpha <= 0) {
    return { ...background, a: 1 };
  }

  return {
    r: Math.round(foreground.r * alpha + background.r * (1 - alpha)),
    g: Math.round(foreground.g * alpha + background.g * (1 - alpha)),
    b: Math.round(foreground.b * alpha + background.b * (1 - alpha)),
    a: 1,
  };
}

/**
 * Calculates WCAG 2.1 relative luminance (0 for pure black, 1 for pure white).
 */
export function getRelativeLuminance(
  color: string | RGBA,
  underlyingColor?: string | RGBA,
): number {
  const parsed = parseColor(color);
  const base = underlyingColor ? parseColor(underlyingColor) : { r: 0, g: 0, b: 0, a: 1 };
  const composited = parsed.a < 1 ? compositeColors(parsed, base) : parsed;

  const rLin = srgbToLinear(composited.r);
  const gLin = srgbToLinear(composited.g);
  const bLin = srgbToLinear(composited.b);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Calculates the WCAG 2.1 contrast ratio between two colors.
 * Value ranges between 1 (no contrast) and 21 (maximum contrast).
 */
export function getContrastRatio(
  colorA: string | RGBA,
  colorB: string | RGBA,
  options?: { underlyingColor?: string | RGBA },
): number {
  const lumA = getRelativeLuminance(colorA, options?.underlyingColor);
  const lumB = getRelativeLuminance(colorB, options?.underlyingColor);

  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks whether the contrast ratio between text and background meets the given threshold.
 */
export function isContrastSufficient(
  textColor: string | RGBA,
  backgroundColor: string | RGBA,
  optionsOrMinRatio?: number | { minRatio?: number; underlyingColor?: string | RGBA },
): boolean {
  const minRatio =
    typeof optionsOrMinRatio === 'number'
      ? optionsOrMinRatio
      : (optionsOrMinRatio?.minRatio ?? 4.5);
  const underlyingColor =
    typeof optionsOrMinRatio === 'object' ? optionsOrMinRatio.underlyingColor : undefined;

  const ratio = getContrastRatio(textColor, backgroundColor, { underlyingColor });
  return ratio >= minRatio;
}

/**
 * Determines the most readable text color for a given background.
 *
 * If a `preferredTextColor` is provided and meets `minRatio` (default 4.5),
 * it is kept as the active choice. Otherwise, it selects between light and dark
 * text options to maximize contrast.
 */
export function getContrastingTextColor(
  backgroundColor: string | RGBA,
  options?: ContrastOptions,
): string {
  const minRatio = options?.minRatio ?? 4.5;
  const lightColor = options?.lightTextColor ?? '#ffffff';
  const darkColor = options?.darkTextColor ?? '#000000';
  const underlying = options?.underlyingColor ?? '#000000';

  if (options?.preferredTextColor) {
    const preferredRatio = getContrastRatio(options.preferredTextColor, backgroundColor, {
      underlyingColor: underlying,
    });
    if (preferredRatio >= minRatio) {
      return options.preferredTextColor;
    }
  }

  const lightRatio = getContrastRatio(lightColor, backgroundColor, {
    underlyingColor: underlying,
  });
  const darkRatio = getContrastRatio(darkColor, backgroundColor, {
    underlyingColor: underlying,
  });

  return lightRatio >= darkRatio ? lightColor : darkColor;
}

/**
 * High-level utility for widgets to ensure their text color provides good contrast
 * against their specific individual background.
 */
export function ensureWidgetContrast(params: WidgetContrastParams = {}): string {
  const background = params.background ?? DEFAULT_WIDGET_BACKGROUND;
  return getContrastingTextColor(background, {
    preferredTextColor: params.preferredTextColor,
    minRatio: params.minRatio ?? 4.5,
    lightTextColor: params.lightTextColor ?? '#ffffff',
    darkTextColor: params.darkTextColor ?? '#000000',
    underlyingColor: params.underlyingColor ?? '#000000',
  });
}
