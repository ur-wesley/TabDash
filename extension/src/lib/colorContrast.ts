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
  black: { a: 1, b: 0, g: 0, r: 0 },
  blue: { a: 1, b: 255, g: 0, r: 0 },
  cyan: { a: 1, b: 255, g: 255, r: 0 },
  gray: { a: 1, b: 128, g: 128, r: 128 },
  green: { a: 1, b: 0, g: 128, r: 0 },
  grey: { a: 1, b: 128, g: 128, r: 128 },
  magenta: { a: 1, b: 255, g: 0, r: 255 },
  orange: { a: 1, b: 0, g: 165, r: 255 },
  purple: { a: 1, b: 128, g: 0, r: 128 },
  red: { a: 1, b: 0, g: 0, r: 255 },
  slate: { a: 1, b: 139, g: 116, r: 100 },
  transparent: { a: 0, b: 0, g: 0, r: 0 },
  white: { a: 1, b: 255, g: 255, r: 255 },
  yellow: { a: 1, b: 0, g: 255, r: 255 },
  zinc: { a: 1, b: 122, g: 113, r: 113 },
};

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

function hue2rgb(p: number, q: number, t: number): number {
  let tNorm = t;
  if (tNorm < 0) {
    tNorm += 1;
  }
  if (tNorm > 1) {
    tNorm -= 1;
  }
  if (tNorm < 1 / 6) {
    return p + (q - p) * 6 * tNorm;
  }
  if (tNorm < 1 / 2) {
    return q;
  }
  if (tNorm < 2 / 3) {
    return p + (q - p) * (2 / 3 - tNorm) * 6;
  }
  return p;
}

/**
 * Converts HSL values to RGB [0-255].
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const normH = (((h % 360) + 360) % 360) / 360,
    normS = clamp(s, 0, 100) / 100,
    normL = clamp(l, 0, 100) / 100;

  if (normS === 0) {
    const val = Math.round(normL * 255);
    return { b: val, g: val, r: val };
  }

  const q = normL < 0.5 ? normL * (1 + normS) : normL + normS - normL * normS,
    p = 2 * normL - q;

  return {
    b: Math.round(hue2rgb(p, q, normH - 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, normH) * 255),
    r: Math.round(hue2rgb(p, q, normH + 1 / 3) * 255),
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
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/**
 * Parses any common CSS color string into an RGBA object.
 * Returns opaque black { r: 0, g: 0, b: 0, a: 1 } if invalid.
 */
export function parseColor(color: string | RGBA): RGBA {
  if (typeof color === 'object' && color !== null && 'r' in color) {
    return {
      a: clamp(color.a ?? 1, 0, 1),
      b: clamp(color.b, 0, 255),
      g: clamp(color.g, 0, 255),
      r: clamp(color.r, 0, 255),
    };
  }

  if (typeof color !== 'string') {
    return { a: 1, b: 0, g: 0, r: 0 };
  }

  const trimmed = color.trim().toLowerCase();
  if (!trimmed) {
    return { a: 1, b: 0, g: 0, r: 0 };
  }

  if (NAMED_COLORS[trimmed]) {
    return { ...NAMED_COLORS[trimmed] };
  }

  // Hex format (#rgb, #rgba, #rrggbb, #rrggbbaa)
  const hexMatch = /^#?([0-9a-f]{3,8})$/i.exec(trimmed);
  if (hexMatch && hexMatch[1]) {
    const raw = hexMatch[1];
    if (raw.length === 3) {
      const rChar = raw.charAt(0),
        gChar = raw.charAt(1),
        bChar = raw.charAt(2);
      return {
        a: 1,
        b: Number.parseInt(bChar + bChar, 16),
        g: Number.parseInt(gChar + gChar, 16),
        r: Number.parseInt(rChar + rChar, 16),
      };
    }
    if (raw.length === 4) {
      const rChar = raw.charAt(0),
        gChar = raw.charAt(1),
        bChar = raw.charAt(2),
        aChar = raw.charAt(3);
      return {
        a: Number.parseInt(aChar + aChar, 16) / 255,
        b: Number.parseInt(bChar + bChar, 16),
        g: Number.parseInt(gChar + gChar, 16),
        r: Number.parseInt(rChar + rChar, 16),
      };
    }
    if (raw.length === 6) {
      return {
        a: 1,
        b: Number.parseInt(raw.slice(4, 6), 16),
        g: Number.parseInt(raw.slice(2, 4), 16),
        r: Number.parseInt(raw.slice(0, 2), 16),
      };
    }
    if (raw.length === 8) {
      return {
        a: Number.parseInt(raw.slice(6, 8), 16) / 255,
        b: Number.parseInt(raw.slice(4, 6), 16),
        g: Number.parseInt(raw.slice(2, 4), 16),
        r: Number.parseInt(raw.slice(0, 2), 16),
      };
    }
  }

  // Rgb / rgba format
  // Handles rgb(r, g, b), rgba(r, g, b, a), rgb(r g b / a)
  const rgbMatch = /^rgba?\((.+)\)$/.exec(trimmed);
  if (rgbMatch && rgbMatch[1]) {
    const inner = rgbMatch[1].replaceAll(',', ' ').replaceAll('/', ' ').trim(),
      parts = inner.split(/\s+/).filter(Boolean),
      p0 = parts[0],
      p1 = parts[1],
      p2 = parts[2],
      p3 = parts[3];
    if (p0 !== undefined && p1 !== undefined && p2 !== undefined) {
      const r = clamp(Math.round(parseChannelValue(p0, 255)), 0, 255),
        g = clamp(Math.round(parseChannelValue(p1, 255)), 0, 255),
        b = clamp(Math.round(parseChannelValue(p2, 255)), 0, 255);
      let a = 1;
      if (p3 !== undefined) {
        if (p3.endsWith('%')) {
          a = clamp(Number.parseFloat(p3) / 100, 0, 1);
        } else {
          a = clamp(Number.parseFloat(p3), 0, 1);
        }
      }
      return { a, b, g, r };
    }
  }

  // Hsl / hsla format
  const hslMatch = /^hsla?\((.+)\)$/.exec(trimmed);
  if (hslMatch && hslMatch[1]) {
    const inner = hslMatch[1].replaceAll(',', ' ').replaceAll('/', ' ').trim(),
      parts = inner.split(/\s+/).filter(Boolean),
      p0 = parts[0],
      p1 = parts[1],
      p2 = parts[2],
      p3 = parts[3];
    if (p0 !== undefined && p1 !== undefined && p2 !== undefined) {
      const h = Number.parseFloat(p0),
        s = Number.parseFloat(p1.replace('%', '')),
        l = Number.parseFloat(p2.replace('%', '')),
        { r, g, b } = hslToRgb(h, s, l);
      let a = 1;
      if (p3 !== undefined) {
        if (p3.endsWith('%')) {
          a = clamp(Number.parseFloat(p3) / 100, 0, 1);
        } else {
          a = clamp(Number.parseFloat(p3), 0, 1);
        }
      }
      return { a, b, g, r };
    }
  }

  return { a: 1, b: 0, g: 0, r: 0 };
}

/**
 * Composites a foreground color over an underlying background color using alpha blending.
 * Resulting color is opaque (alpha = 1).
 */
export function compositeColors(
  foreground: RGBA,
  background: RGBA = { a: 1, b: 0, g: 0, r: 0 },
): RGBA {
  const alpha = foreground.a;
  if (alpha >= 1) {
    return { ...foreground, a: 1 };
  }
  if (alpha <= 0) {
    return { ...background, a: 1 };
  }

  return {
    a: 1,
    b: Math.round(foreground.b * alpha + background.b * (1 - alpha)),
    g: Math.round(foreground.g * alpha + background.g * (1 - alpha)),
    r: Math.round(foreground.r * alpha + background.r * (1 - alpha)),
  };
}

/**
 * Calculates WCAG 2.1 relative luminance (0 for pure black, 1 for pure white).
 */
export function getRelativeLuminance(
  color: string | RGBA,
  underlyingColor?: string | RGBA,
): number {
  const parsed = parseColor(color),
    base = underlyingColor ? parseColor(underlyingColor) : { a: 1, b: 0, g: 0, r: 0 },
    composited = parsed.a < 1 ? compositeColors(parsed, base) : parsed,
    rLin = srgbToLinear(composited.r),
    gLin = srgbToLinear(composited.g),
    bLin = srgbToLinear(composited.b);

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
  const lumA = getRelativeLuminance(colorA, options?.underlyingColor),
    lumB = getRelativeLuminance(colorB, options?.underlyingColor),
    lighter = Math.max(lumA, lumB),
    darker = Math.min(lumA, lumB);

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
        : (optionsOrMinRatio?.minRatio ?? 4.5),
    underlyingColor =
      typeof optionsOrMinRatio === 'object' ? optionsOrMinRatio.underlyingColor : undefined,
    ratio = getContrastRatio(textColor, backgroundColor, { underlyingColor });
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
  const minRatio = options?.minRatio ?? 4.5,
    lightColor = options?.lightTextColor ?? '#ffffff',
    darkColor = options?.darkTextColor ?? '#000000',
    underlying = options?.underlyingColor ?? '#000000';

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
    }),
    darkRatio = getContrastRatio(darkColor, backgroundColor, {
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
    darkTextColor: params.darkTextColor ?? '#000000',
    lightTextColor: params.lightTextColor ?? '#ffffff',
    minRatio: params.minRatio ?? 4.5,
    preferredTextColor: params.preferredTextColor,
    underlyingColor: params.underlyingColor ?? '#000000',
  });
}
