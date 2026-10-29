import { describe, expect, it } from 'bun:test';
import {
  compositeColors,
  ensureWidgetContrast,
  getContrastRatio,
  getContrastingTextColor,
  getRelativeLuminance,
  isContrastSufficient,
  parseColor,
} from './colorContrast.js';

const ALPHA_HALF = 0.5;
const ALPHA_OPAQUE = 1;
const ALPHA_SEMI = 0.4;
const ALPHA_THREE_QUARTERS = 0.75;
const BLENDED_MID = 128;
const CHANNEL_MAX = 255;
const CONTRAST_RATIO_MAX = 21;
const CONTRAST_RATIO_MIN = 1;
const CONTRAST_TOLERANCE = 0.1;
const HEX_BLUE = 0x56;
const HEX_GREEN = 0x34;
const HEX_RED = 0x12;
const HIGH_CONTRAST_FLOOR = 3.5;
const HIGH_CONTRAST_CEILING = 5.5;
const LUMINANCE_BLACK = 0;
const LUMINANCE_WHITE = 1;
const NAMED_GRAY = 64;
const NAMED_GRAY_LIGHT = 128;
const WCAG_AA_RATIO = 4.5;

const rgba = (red: number, green: number, blue: number, alpha = ALPHA_OPAQUE) => ({
  alpha,
  blue,
  green,
  red,
});

describe('colorContrast - parseColor', () => {
  it('parses 3-digit and 6-digit hex codes', () => {
    expect(parseColor('#fff')).toEqual(rgba(CHANNEL_MAX, CHANNEL_MAX, CHANNEL_MAX));
    expect(parseColor('#000')).toEqual(rgba(0, 0, 0));
    expect(parseColor('#123456')).toEqual(rgba(HEX_RED, HEX_GREEN, HEX_BLUE));
    expect(parseColor('ffffff')).toEqual(rgba(CHANNEL_MAX, CHANNEL_MAX, CHANNEL_MAX));
  });

  it('parses 4-digit and 8-digit hex codes with alpha', () => {
    const four = parseColor('#fffa');
    expect(four.red).toBe(CHANNEL_MAX);
    expect(four.green).toBe(CHANNEL_MAX);
    expect(four.blue).toBe(CHANNEL_MAX);
    expect(four.alpha).toBeCloseTo(0.667, 2);

    const eight = parseColor('#ffffff80');
    expect(eight.red).toBe(CHANNEL_MAX);
    expect(eight.green).toBe(CHANNEL_MAX);
    expect(eight.blue).toBe(CHANNEL_MAX);
    expect(eight.alpha).toBeCloseTo(ALPHA_HALF, 2);
  });

  it('parses rgb and rgba strings', () => {
    expect(parseColor('rgb(255, 0, 128)')).toEqual(rgba(CHANNEL_MAX, 0, NAMED_GRAY_LIGHT));
    expect(parseColor('rgba(64, 64, 64, 0.4)')).toEqual(
      rgba(NAMED_GRAY, NAMED_GRAY, NAMED_GRAY, ALPHA_SEMI),
    );
    expect(parseColor('rgb(100%, 0%, 50%)')).toEqual(rgba(CHANNEL_MAX, 0, NAMED_GRAY_LIGHT));
  });

  it('parses modern space and slash CSS syntax', () => {
    expect(parseColor('rgb(255 100 50 / 0.5)')).toEqual(rgba(CHANNEL_MAX, 100, 50, ALPHA_HALF));
    expect(parseColor('rgba(255 100 50 / 50%)')).toEqual(rgba(CHANNEL_MAX, 100, 50, ALPHA_HALF));
  });

  it('parses hsl and hsla strings', () => {
    const white = parseColor('hsl(0, 0%, 100%)');
    expect(white.red).toBe(CHANNEL_MAX);
    expect(white.green).toBe(CHANNEL_MAX);
    expect(white.blue).toBe(CHANNEL_MAX);
    expect(white.alpha).toBe(ALPHA_OPAQUE);

    const black = parseColor('hsl(120, 100%, 0%)');
    expect(black.red).toBe(0);
    expect(black.green).toBe(0);
    expect(black.blue).toBe(0);

    const redAlpha = parseColor('hsla(0, 100%, 50%, 0.75)');
    expect(redAlpha.red).toBe(CHANNEL_MAX);
    expect(redAlpha.green).toBe(0);
    expect(redAlpha.blue).toBe(0);
    expect(redAlpha.alpha).toBe(ALPHA_THREE_QUARTERS);
  });

  it('parses named CSS colors and transparent', () => {
    expect(parseColor('white')).toEqual(rgba(CHANNEL_MAX, CHANNEL_MAX, CHANNEL_MAX));
    expect(parseColor('black')).toEqual(rgba(0, 0, 0));
    expect(parseColor('transparent')).toEqual(rgba(0, 0, 0, 0));
  });

  it('handles invalid strings gracefully by falling back to black with alpha 1', () => {
    expect(parseColor('')).toEqual(rgba(0, 0, 0));
    expect(parseColor('invalid-color-string')).toEqual(rgba(0, 0, 0));
  });
});

describe('colorContrast - alpha compositing', () => {
  it('blends semi-transparent color onto underlying surface', () => {
    const fg = rgba(CHANNEL_MAX, CHANNEL_MAX, CHANNEL_MAX, ALPHA_HALF),
      bg = rgba(0, 0, 0),
      composite = compositeColors(fg, bg);
    expect(composite.red).toBe(BLENDED_MID);
    expect(composite.green).toBe(BLENDED_MID);
    expect(composite.blue).toBe(BLENDED_MID);
    expect(composite.alpha).toBe(ALPHA_OPAQUE);
  });

  it('preserves fully opaque foreground color', () => {
    const fg = rgba(10, 20, 30),
      bg = rgba(200, 200, 200),
      composite = compositeColors(fg, bg);
    expect(composite).toEqual(rgba(10, 20, 30));
  });
});

describe('colorContrast - WCAG luminance & contrast ratio', () => {
  it('calculates relative luminance correctly for pure black and pure white', () => {
    expect(getRelativeLuminance('#000000')).toBe(LUMINANCE_BLACK);
    expect(getRelativeLuminance('#ffffff')).toBe(LUMINANCE_WHITE);
  });

  it('calculates contrast ratio between black and white as 21:1', () => {
    expect(getContrastRatio('#ffffff', '#000000')).toBeCloseTo(CONTRAST_RATIO_MAX, 1);
    expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(CONTRAST_RATIO_MAX, 1);
  });

  it('calculates contrast ratio between identical colors as 1:1', () => {
    expect(getContrastRatio('#ff0000', '#ff0000')).toBeCloseTo(CONTRAST_RATIO_MIN, 1);
  });

  it('accurately accounts for semi-transparent backgrounds with underlying backdrop', () => {
    const ratioOverBlack = getContrastRatio('#ffffff', 'rgba(255, 255, 255, 0.5)', {
      underlyingColor: '#000000',
    });
    expect(ratioOverBlack).toBeGreaterThan(HIGH_CONTRAST_FLOOR);
    expect(ratioOverBlack).toBeLessThan(HIGH_CONTRAST_CEILING);
  });
});

describe('colorContrast - isContrastSufficient', () => {
  it('returns true for high contrast combinations', () => {
    expect(isContrastSufficient('#ffffff', '#000000')).toBe(true);
    expect(isContrastSufficient('#000000', '#ffffff')).toBe(true);
  });

  it('returns false for low contrast combinations', () => {
    expect(isContrastSufficient('#777777', '#888888')).toBe(false);
    expect(isContrastSufficient('#ffffff', '#f4f4f5')).toBe(false);
  });

  it('respects custom minimum contrast ratio threshold', () => {
    const bg = '#ffffff',
      text = '#888888',
      ratio = getContrastRatio(text, bg);
    expect(isContrastSufficient(text, bg, ratio - CONTRAST_TOLERANCE)).toBe(true);
    expect(isContrastSufficient(text, bg, ratio + CONTRAST_TOLERANCE)).toBe(false);
  });
});

describe('colorContrast - getContrastingTextColor & ensureWidgetContrast', () => {
  it('chooses white text for dark background', () => {
    const textColor = getContrastingTextColor('#18181b');
    expect(textColor).toBe('#ffffff');
  });

  it('chooses black text for bright background', () => {
    const textColor = getContrastingTextColor('#f8fafc');
    expect(textColor).toBe('#000000');
  });

  it('preserves preferred text color when it meets contrast requirement', () => {
    const chosen = getContrastingTextColor('#000000', {
      minRatio: WCAG_AA_RATIO,
      preferredTextColor: '#38bdf8',
    });
    expect(chosen).toBe('#38bdf8');
  });

  it('overrides preferred text color when it has poor contrast', () => {
    const chosen = getContrastingTextColor('#ffffff', {
      minRatio: WCAG_AA_RATIO,
      preferredTextColor: '#fef08a',
    });
    expect(chosen).toBe('#000000');
  });

  it('ensureWidgetContrast correctly handles widget appearance backgrounds', () => {
    const contrastOnDarkWidget = ensureWidgetContrast({
      background: 'rgba(30, 30, 30, 0.8)',
      preferredTextColor: '#111111',
    });
    expect(contrastOnDarkWidget).toBe('#ffffff');

    const contrastOnLightWidget = ensureWidgetContrast({
      background: 'rgba(255, 255, 255, 0.9)',
      preferredTextColor: '#ffffff',
    });
    expect(contrastOnLightWidget).toBe('#000000');
  });

  it('supports custom light and dark text colors', () => {
    const chosen = getContrastingTextColor('#000000', {
      darkTextColor: '#0f172a',
      lightTextColor: '#f1f5f9',
    });
    expect(chosen).toBe('#f1f5f9');
  });
});
