/**
 * Color and contrast utility for widgets.
 *
 * Implements WCAG 2.1 relative luminance and contrast ratio algorithms
 * with alpha-compositing support for translucent backgrounds.
 */

const ALPHA_OPAQUE = 1;
const ALPHA_TRANSPARENT = 0;
const CHANNEL_MIN = 0;
const CHANNEL_MAX = 255;
const DIVISOR_THREE = 3;
const DIVISOR_TWO = 2;
const DIVISOR_SIX = 6;
const UNIT = 1;
const CONTRAST_OFFSET = 0.05;
const DEFAULT_MIN_RATIO = 4.5;
const FULL_CIRCLE_DEG = 360;
const HEX_DIGIT_RADIX = 16;
const HEX_LENGTH_3 = 3;
const HEX_LENGTH_4 = 4;
const HEX_LENGTH_6 = 6;
const HEX_LENGTH_8 = 8;
const HSL_MAX_PERCENT = 100;
const HSL_PERCENT_DIVISOR = 100;
const HUE_COMPONENTS = 6;
const HUE_MAX = 1;
const HUE_OFFSET_THIRD = UNIT / DIVISOR_THREE;
const HUE_SIXTH = UNIT / DIVISOR_SIX;
const HUE_HALF = UNIT / DIVISOR_TWO;
const HUE_TWO_THIRDS = DIVISOR_TWO / DIVISOR_THREE;
const LIGHTNESS_MIDPOINT = 0.5;
const LUMINANCE_BLUE = 0.0722;
const LUMINANCE_GREEN = 0.7152;
const LUMINANCE_RED = 0.2126;
const NAMED_GRAY = 128;
const NAMED_GREEN = 128;
const NAMED_ORANGE_GREEN = 165;
const NAMED_SLATE_BLUE = 139;
const NAMED_SLATE_GREEN = 116;
const NAMED_SLATE_RED = 100;
const NAMED_ZINC_BLUE = 122;
const NAMED_ZINC_GREEN = 113;
const NAMED_ZINC_RED = 113;
const SRGB_EXPONENT = 2.4;
const SRGB_LINEAR_DIVISOR = 12.92;
const SRGB_OFFSET = 0.055;
const SRGB_SCALE = 1.055;
const SRGB_THRESHOLD = 0.04045;

interface RGBA {
  alpha: number;
  blue: number;
  green: number;
  red: number;
}

interface ContrastOptions {
  preferredTextColor?: string;
  lightTextColor?: string;
  darkTextColor?: string;
  minRatio?: number;
  underlyingColor?: string | RGBA;
}

interface WidgetContrastParams {
  background?: string;
  preferredTextColor?: string;
  underlyingColor?: string | RGBA;
  minRatio?: number;
  lightTextColor?: string;
  darkTextColor?: string;
}

const DEFAULT_WIDGET_BACKGROUND = 'rgba(64, 64, 64, 0.4)';

const rgba = (red: number, green: number, blue: number, alpha = ALPHA_OPAQUE): RGBA => ({
  alpha,
  blue,
  green,
  red,
});

const NAMED_COLORS: Record<string, RGBA> = {
  black: rgba(CHANNEL_MIN, CHANNEL_MIN, CHANNEL_MIN),
  blue: rgba(CHANNEL_MIN, CHANNEL_MIN, CHANNEL_MAX),
  cyan: rgba(CHANNEL_MIN, CHANNEL_MAX, CHANNEL_MAX),
  gray: rgba(NAMED_GRAY, NAMED_GRAY, NAMED_GRAY),
  green: rgba(CHANNEL_MIN, NAMED_GREEN, CHANNEL_MIN),
  grey: rgba(NAMED_GRAY, NAMED_GRAY, NAMED_GRAY),
  magenta: rgba(CHANNEL_MAX, CHANNEL_MIN, CHANNEL_MAX),
  orange: rgba(CHANNEL_MAX, NAMED_ORANGE_GREEN, CHANNEL_MIN),
  purple: rgba(CHANNEL_MAX, CHANNEL_MIN, NAMED_GRAY),
  red: rgba(CHANNEL_MAX, CHANNEL_MIN, CHANNEL_MIN),
  slate: rgba(NAMED_SLATE_RED, NAMED_SLATE_GREEN, NAMED_SLATE_BLUE),
  transparent: rgba(CHANNEL_MIN, CHANNEL_MIN, CHANNEL_MIN, ALPHA_TRANSPARENT),
  white: rgba(CHANNEL_MAX, CHANNEL_MAX, CHANNEL_MAX),
  yellow: rgba(CHANNEL_MAX, CHANNEL_MAX, CHANNEL_MIN),
  zinc: rgba(NAMED_ZINC_RED, NAMED_ZINC_GREEN, NAMED_ZINC_BLUE),
};

const OPAQUE_BLACK = rgba(CHANNEL_MIN, CHANNEL_MIN, CHANNEL_MIN);

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function hue2rgb(low: number, high: number, component: number): number {
  let componentNorm = component;
  if (componentNorm < 0) {
    componentNorm += HUE_MAX;
  }
  if (componentNorm > HUE_MAX) {
    componentNorm -= HUE_MAX;
  }
  if (componentNorm < HUE_SIXTH) {
    return low + (high - low) * HUE_COMPONENTS * componentNorm;
  }
  if (componentNorm < HUE_HALF) {
    return high;
  }
  if (componentNorm < HUE_TWO_THIRDS) {
    return low + (high - low) * (HUE_TWO_THIRDS - componentNorm) * HUE_COMPONENTS;
  }
  return low;
}

function hslToRgb(
  hue: number,
  saturation: number,
  lightness: number,
): { red: number; green: number; blue: number } {
  const normHue = (((hue % FULL_CIRCLE_DEG) + FULL_CIRCLE_DEG) % FULL_CIRCLE_DEG) / FULL_CIRCLE_DEG,
    normSat = clamp(saturation, 0, HSL_MAX_PERCENT) / HSL_PERCENT_DIVISOR,
    normLight = clamp(lightness, 0, HSL_MAX_PERCENT) / HSL_PERCENT_DIVISOR;

  if (normSat === 0) {
    const gray = Math.round(normLight * CHANNEL_MAX);
    return { blue: gray, green: gray, red: gray };
  }

  const high =
      normLight < LIGHTNESS_MIDPOINT
        ? normLight * (HUE_MAX + normSat)
        : normLight + normSat - normLight * normSat,
    low = 2 * normLight - high;

  return {
    blue: Math.round(hue2rgb(low, high, normHue - HUE_OFFSET_THIRD) * CHANNEL_MAX),
    green: Math.round(hue2rgb(low, high, normHue) * CHANNEL_MAX),
    red: Math.round(hue2rgb(low, high, normHue + HUE_OFFSET_THIRD) * CHANNEL_MAX),
  };
}

function parseChannelValue(channelText: string, channelMax = CHANNEL_MAX): number {
  if (channelText.endsWith('%')) {
    return (Number.parseFloat(channelText) / HSL_PERCENT_DIVISOR) * channelMax;
  }
  return Number.parseFloat(channelText);
}

function srgbToLinear(channel: number): number {
  const channelNorm = channel / CHANNEL_MAX;
  return channelNorm <= SRGB_THRESHOLD
    ? channelNorm / SRGB_LINEAR_DIVISOR
    : ((channelNorm + SRGB_OFFSET) / SRGB_SCALE) ** SRGB_EXPONENT;
}

function parseColor(color: string | RGBA): RGBA {
  if (typeof color === 'object' && color !== null && 'red' in color) {
    return rgba(
      clamp(color.red, 0, CHANNEL_MAX),
      clamp(color.green, 0, CHANNEL_MAX),
      clamp(color.blue, 0, CHANNEL_MAX),
      clamp(color.alpha ?? ALPHA_OPAQUE, 0, HUE_MAX),
    );
  }

  if (typeof color !== 'string') {
    return OPAQUE_BLACK;
  }

  const trimmed = color.trim().toLowerCase();
  if (!trimmed) {
    return OPAQUE_BLACK;
  }

  if (NAMED_COLORS[trimmed]) {
    return { ...NAMED_COLORS[trimmed] };
  }

  const hexMatch = /^#?([0-9a-f]{3,8})$/i.exec(trimmed);
  if (hexMatch?.[1]) {
    const raw = hexMatch[1];
    if (raw.length === HEX_LENGTH_3) {
      const redChar = raw.charAt(0),
        greenChar = raw.charAt(1),
        blueChar = raw.charAt(2);
      return rgba(
        Number.parseInt(redChar + redChar, HEX_DIGIT_RADIX),
        Number.parseInt(greenChar + greenChar, HEX_DIGIT_RADIX),
        Number.parseInt(blueChar + blueChar, HEX_DIGIT_RADIX),
      );
    }
    if (raw.length === HEX_LENGTH_4) {
      const redChar = raw.charAt(0),
        greenChar = raw.charAt(1),
        blueChar = raw.charAt(2),
        alphaChar = raw.charAt(3);
      return rgba(
        Number.parseInt(redChar + redChar, HEX_DIGIT_RADIX),
        Number.parseInt(greenChar + greenChar, HEX_DIGIT_RADIX),
        Number.parseInt(blueChar + blueChar, HEX_DIGIT_RADIX),
        Number.parseInt(alphaChar + alphaChar, HEX_DIGIT_RADIX) / CHANNEL_MAX,
      );
    }
    if (raw.length === HEX_LENGTH_6) {
      return rgba(
        Number.parseInt(raw.slice(0, 2), HEX_DIGIT_RADIX),
        Number.parseInt(raw.slice(2, 4), HEX_DIGIT_RADIX),
        Number.parseInt(raw.slice(4, 6), HEX_DIGIT_RADIX),
      );
    }
    if (raw.length === HEX_LENGTH_8) {
      return rgba(
        Number.parseInt(raw.slice(0, 2), HEX_DIGIT_RADIX),
        Number.parseInt(raw.slice(2, 4), HEX_DIGIT_RADIX),
        Number.parseInt(raw.slice(4, 6), HEX_DIGIT_RADIX),
        Number.parseInt(raw.slice(6, 8), HEX_DIGIT_RADIX) / CHANNEL_MAX,
      );
    }
  }

  const rgbMatch = /^rgba?\((.+)\)$/.exec(trimmed);
  if (rgbMatch?.[1]) {
    const inner = rgbMatch[1].replaceAll(',', ' ').replaceAll('/', ' ').trim(),
      parts = inner.split(/\s+/).filter(Boolean),
      partRed = parts[0],
      partGreen = parts[1],
      partBlue = parts[2],
      partAlpha = parts[3];
    if (partRed !== undefined && partGreen !== undefined && partBlue !== undefined) {
      const red = clamp(Math.round(parseChannelValue(partRed, CHANNEL_MAX)), 0, CHANNEL_MAX),
        green = clamp(Math.round(parseChannelValue(partGreen, CHANNEL_MAX)), 0, CHANNEL_MAX),
        blue = clamp(Math.round(parseChannelValue(partBlue, CHANNEL_MAX)), 0, CHANNEL_MAX);
      let alpha = ALPHA_OPAQUE;
      if (partAlpha !== undefined) {
        if (partAlpha.endsWith('%')) {
          alpha = clamp(Number.parseFloat(partAlpha) / HSL_PERCENT_DIVISOR, 0, HUE_MAX);
        } else {
          alpha = clamp(Number.parseFloat(partAlpha), 0, HUE_MAX);
        }
      }
      return rgba(red, green, blue, alpha);
    }
  }

  const hslMatch = /^hsla?\((.+)\)$/.exec(trimmed);
  if (hslMatch?.[1]) {
    const inner = hslMatch[1].replaceAll(',', ' ').replaceAll('/', ' ').trim(),
      parts = inner.split(/\s+/).filter(Boolean),
      partHue = parts[0],
      partSat = parts[1],
      partLight = parts[2],
      partAlpha = parts[3];
    if (partHue !== undefined && partSat !== undefined && partLight !== undefined) {
      const hue = Number.parseFloat(partHue),
        saturation = Number.parseFloat(partSat.replace('%', '')),
        lightness = Number.parseFloat(partLight.replace('%', '')),
        rgb = hslToRgb(hue, saturation, lightness);
      let alpha = ALPHA_OPAQUE;
      if (partAlpha !== undefined) {
        if (partAlpha.endsWith('%')) {
          alpha = clamp(Number.parseFloat(partAlpha) / HSL_PERCENT_DIVISOR, 0, HUE_MAX);
        } else {
          alpha = clamp(Number.parseFloat(partAlpha), 0, HUE_MAX);
        }
      }
      return rgba(rgb.red, rgb.green, rgb.blue, alpha);
    }
  }

  return OPAQUE_BLACK;
}

function compositeColors(foreground: RGBA, background: RGBA = OPAQUE_BLACK): RGBA {
  const alpha = foreground.alpha;
  if (alpha >= ALPHA_OPAQUE) {
    return { ...foreground, alpha: ALPHA_OPAQUE };
  }
  if (alpha <= ALPHA_TRANSPARENT) {
    return { ...background, alpha: ALPHA_OPAQUE };
  }

  const inverseAlpha = HUE_MAX - alpha;
  return rgba(
    Math.round(foreground.red * alpha + background.red * inverseAlpha),
    Math.round(foreground.green * alpha + background.green * inverseAlpha),
    Math.round(foreground.blue * alpha + background.blue * inverseAlpha),
    ALPHA_OPAQUE,
  );
}

function getRelativeLuminance(color: string | RGBA, underlyingColor?: string | RGBA): number {
  const parsed = parseColor(color),
    base = underlyingColor ? parseColor(underlyingColor) : OPAQUE_BLACK,
    composited = parsed.alpha < ALPHA_OPAQUE ? compositeColors(parsed, base) : parsed,
    redLin = srgbToLinear(composited.red),
    greenLin = srgbToLinear(composited.green),
    blueLin = srgbToLinear(composited.blue);

  return LUMINANCE_RED * redLin + LUMINANCE_GREEN * greenLin + LUMINANCE_BLUE * blueLin;
}

function getContrastRatio(
  colorA: string | RGBA,
  colorB: string | RGBA,
  options?: { underlyingColor?: string | RGBA },
): number {
  const lumA = getRelativeLuminance(colorA, options?.underlyingColor),
    lumB = getRelativeLuminance(colorB, options?.underlyingColor),
    lighter = Math.max(lumA, lumB),
    darker = Math.min(lumA, lumB);

  return (lighter + CONTRAST_OFFSET) / (darker + CONTRAST_OFFSET);
}

function isContrastSufficient(
  textColor: string | RGBA,
  backgroundColor: string | RGBA,
  optionsOrMinRatio?: number | { minRatio?: number; underlyingColor?: string | RGBA },
): boolean {
  const minRatio =
      typeof optionsOrMinRatio === 'number'
        ? optionsOrMinRatio
        : (optionsOrMinRatio?.minRatio ?? DEFAULT_MIN_RATIO),
    underlyingColor =
      typeof optionsOrMinRatio === 'object' ? optionsOrMinRatio.underlyingColor : undefined,
    ratio = getContrastRatio(textColor, backgroundColor, { underlyingColor });
  return ratio >= minRatio;
}

function getContrastingTextColor(
  backgroundColor: string | RGBA,
  options?: ContrastOptions,
): string {
  const minRatio = options?.minRatio ?? DEFAULT_MIN_RATIO,
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

function ensureWidgetContrast(params: WidgetContrastParams = {}): string {
  const background = params.background ?? DEFAULT_WIDGET_BACKGROUND;
  return getContrastingTextColor(background, {
    darkTextColor: params.darkTextColor ?? '#000000',
    lightTextColor: params.lightTextColor ?? '#ffffff',
    minRatio: params.minRatio ?? DEFAULT_MIN_RATIO,
    preferredTextColor: params.preferredTextColor,
    underlyingColor: params.underlyingColor ?? '#000000',
  });
}

export {
  compositeColors,
  DEFAULT_WIDGET_BACKGROUND,
  ensureWidgetContrast,
  getContrastingTextColor,
  getContrastRatio,
  getRelativeLuminance,
  isContrastSufficient,
  parseColor,
  type ContrastOptions,
  type RGBA,
  type WidgetContrastParams,
};
