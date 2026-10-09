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

describe('colorContrast - parseColor', () => {
  it('parses 3-digit and 6-digit hex codes', () => {
    expect(parseColor('#fff')).toEqual({ a: 1, b: 255, g: 255, r: 255 });
    expect(parseColor('#000')).toEqual({ a: 1, b: 0, g: 0, r: 0 });
    expect(parseColor('#123456')).toEqual({ a: 1, b: 0x56, g: 0x34, r: 0x12 });
    expect(parseColor('ffffff')).toEqual({ a: 1, b: 255, g: 255, r: 255 });
  });

  it('parses 4-digit and 8-digit hex codes with alpha', () => {
    const four = parseColor('#fffa');
    expect(four.r).toBe(255);
    expect(four.g).toBe(255);
    expect(four.b).toBe(255);
    expect(four.a).toBeCloseTo(0.667, 2);

    const eight = parseColor('#ffffff80');
    expect(eight.r).toBe(255);
    expect(eight.g).toBe(255);
    expect(eight.b).toBe(255);
    expect(eight.a).toBeCloseTo(0.5, 2);
  });

  it('parses rgb and rgba strings', () => {
    expect(parseColor('rgb(255, 0, 128)')).toEqual({ a: 1, b: 128, g: 0, r: 255 });
    expect(parseColor('rgba(64, 64, 64, 0.4)')).toEqual({ a: 0.4, b: 64, g: 64, r: 64 });
    expect(parseColor('rgb(100%, 0%, 50%)')).toEqual({ a: 1, b: 128, g: 0, r: 255 });
  });

  it('parses modern space and slash CSS syntax', () => {
    expect(parseColor('rgb(255 100 50 / 0.5)')).toEqual({ a: 0.5, b: 50, g: 100, r: 255 });
    expect(parseColor('rgba(255 100 50 / 50%)')).toEqual({ a: 0.5, b: 50, g: 100, r: 255 });
  });

  it('parses hsl and hsla strings', () => {
    const white = parseColor('hsl(0, 0%, 100%)');
    expect(white.r).toBe(255);
    expect(white.g).toBe(255);
    expect(white.b).toBe(255);
    expect(white.a).toBe(1);

    const black = parseColor('hsl(120, 100%, 0%)');
    expect(black.r).toBe(0);
    expect(black.g).toBe(0);
    expect(black.b).toBe(0);

    const redAlpha = parseColor('hsla(0, 100%, 50%, 0.75)');
    expect(redAlpha.r).toBe(255);
    expect(redAlpha.g).toBe(0);
    expect(redAlpha.b).toBe(0);
    expect(redAlpha.a).toBe(0.75);
  });

  it('parses named CSS colors and transparent', () => {
    expect(parseColor('white')).toEqual({ a: 1, b: 255, g: 255, r: 255 });
    expect(parseColor('black')).toEqual({ a: 1, b: 0, g: 0, r: 0 });
    expect(parseColor('transparent')).toEqual({ a: 0, b: 0, g: 0, r: 0 });
  });

  it('handles invalid strings gracefully by falling back to black with alpha 1', () => {
    expect(parseColor('')).toEqual({ a: 1, b: 0, g: 0, r: 0 });
    expect(parseColor('invalid-color-string')).toEqual({ a: 1, b: 0, g: 0, r: 0 });
  });
});

describe('colorContrast - alpha compositing', () => {
  it('blends semi-transparent color onto underlying surface', () => {
    const fg = { a: 0.5, b: 255, g: 255, r: 255 },
      bg = { a: 1, b: 0, g: 0, r: 0 },
      composite = compositeColors(fg, bg);
    expect(composite.r).toBe(128);
    expect(composite.g).toBe(128);
    expect(composite.b).toBe(128);
    expect(composite.a).toBe(1);
  });

  it('preserves fully opaque foreground color', () => {
    const fg = { a: 1, b: 30, g: 20, r: 10 },
      bg = { a: 1, b: 200, g: 200, r: 200 },
      composite = compositeColors(fg, bg);
    expect(composite).toEqual({ a: 1, b: 30, g: 20, r: 10 });
  });
});

describe('colorContrast - WCAG luminance & contrast ratio', () => {
  it('calculates relative luminance correctly for pure black and pure white', () => {
    expect(getRelativeLuminance('#000000')).toBe(0);
    expect(getRelativeLuminance('#ffffff')).toBe(1);
  });

  it('calculates contrast ratio between black and white as 21:1', () => {
    expect(getContrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1);
    expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('calculates contrast ratio between identical colors as 1:1', () => {
    expect(getContrastRatio('#ff0000', '#ff0000')).toBeCloseTo(1, 1);
  });

  it('accurately accounts for semi-transparent backgrounds with underlying backdrop', () => {
    // 50% white over black background becomes ~#808080
    const ratioOverBlack = getContrastRatio('#ffffff', 'rgba(255, 255, 255, 0.5)', {
      underlyingColor: '#000000',
    });
    // White (#ffffff) on ~#808080 has a contrast ratio around ~4.5
    expect(ratioOverBlack).toBeGreaterThan(3.5);
    expect(ratioOverBlack).toBeLessThan(5.5);
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
    // 3:1 is WCAG AA for large text
    const text = '#888888',
      bg = '#ffffff',
      ratio = getContrastRatio(text, bg);
    expect(isContrastSufficient(text, bg, ratio - 0.1)).toBe(true);
    expect(isContrastSufficient(text, bg, ratio + 0.1)).toBe(false);
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
      minRatio: 4.5,
      preferredTextColor: '#38bdf8', // Light blue on black has high contrast (> 4.5),
    });
    expect(chosen).toBe('#38bdf8');
  });

  it('overrides preferred text color when it has poor contrast', () => {
    const chosen = getContrastingTextColor('#ffffff', {
      minRatio: 4.5,
      preferredTextColor: '#fef08a', // Pale yellow on white has very poor contrast,
    });
    // Should fallback to dark text
    expect(chosen).toBe('#000000');
  });

  it('ensureWidgetContrast correctly handles widget appearance backgrounds', () => {
    // Tabdash default widget background: rgba(64, 64, 64, 0.4)
    // Over a dark background or default underlying surface, ensures contrast
    const contrastOnDarkWidget = ensureWidgetContrast({
      background: 'rgba(30, 30, 30, 0.8)',
      preferredTextColor: '#111111', // Dark text on dark widget fails
    });
    expect(contrastOnDarkWidget).toBe('#ffffff');

    const contrastOnLightWidget = ensureWidgetContrast({
      background: 'rgba(255, 255, 255, 0.9)',
      preferredTextColor: '#ffffff', // White text on white widget fails
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
