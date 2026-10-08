import { describe, expect, it } from 'bun:test';
import {
  autoWidgetTextColor,
  effectiveWidgetSurface,
  parseBrightnessFactor,
  pickBestTextColor,
} from './auto-contrast.js';

describe('auto-contrast - parseBrightnessFactor', () => {
  it('parses percent strings and falls back to 1', () => {
    expect(parseBrightnessFactor('160%')).toBeCloseTo(1.6);
    expect(parseBrightnessFactor('100%')).toBeCloseTo(1);
    expect(parseBrightnessFactor(undefined)).toBe(1);
    expect(parseBrightnessFactor('invalid')).toBe(1);
  });
});

describe('auto-contrast - effectiveWidgetSurface', () => {
  it('composites translucent widget backgrounds over the wallpaper sample', () => {
    // Default dark translucent widget over a bright wallpaper region.
    const surface = effectiveWidgetSurface('rgba(64, 64, 64, 0.4)', { r: 255, g: 255, b: 255 });
    // 0.4 * 64 + 0.6 * 255 = ~179
    expect(surface.r).toBeGreaterThan(160);
    expect(surface.r).toBeLessThan(195);
    expect(surface.a).toBe(1);
  });

  it('keeps opaque widget backgrounds independent of the wallpaper', () => {
    const surface = effectiveWidgetSurface('#eeeeee', { r: 0, g: 0, b: 0 });
    expect(surface).toEqual({ r: 238, g: 238, b: 238, a: 1 });
  });

  it('applies backdrop brightness to the wallpaper sample', () => {
    const normal = effectiveWidgetSurface('rgba(64, 64, 64, 0.4)', { r: 100, g: 100, b: 100 });
    const bright = effectiveWidgetSurface(
      'rgba(64, 64, 64, 0.4)',
      { r: 100, g: 100, b: 100 },
      '160%',
    );
    expect(bright.r).toBeGreaterThan(normal.r);
  });
});

describe('auto-contrast - pickBestTextColor', () => {
  it('chooses white for dark surfaces and black for bright ones', () => {
    expect(pickBestTextColor('#18181b').color).toBe('#ffffff');
    expect(pickBestTextColor('#f8fafc').color).toBe('#000000');
  });

  it('keeps the preferred color when it already has the best contrast', () => {
    // Bright yellow has higher contrast on black than pure white does not;
    // white wins here — but a preferred color equal to the winner is kept.
    const res = pickBestTextColor('#000000', { preferredTextColor: '#ffffff' });
    expect(res.color).toBe('#ffffff');
    expect(res.ratio).toBeCloseTo(21, 0);
  });

  it('overrides a low-contrast preferred color with the best option', () => {
    const res = pickBestTextColor('#ffffff', { preferredTextColor: '#fef08a' });
    expect(res.color).toBe('#000000');
  });
});

describe('auto-contrast - autoWidgetTextColor', () => {
  it('picks black text for a translucent widget over a bright photo region', () => {
    const res = autoWidgetTextColor('rgba(64, 64, 64, 0.4)', { r: 240, g: 235, b: 220 });
    expect(res.color).toBe('#000000');
  });

  it('picks white text for a translucent widget over a dark photo region', () => {
    const res = autoWidgetTextColor('rgba(64, 64, 64, 0.4)', { r: 10, g: 14, b: 25 });
    expect(res.color).toBe('#ffffff');
  });

  it('per-widget regions can disagree on the same photo', () => {
    const bg = 'rgba(64, 64, 64, 0.4)';
    const bright = autoWidgetTextColor(bg, { r: 245, g: 245, b: 245 });
    const dark = autoWidgetTextColor(bg, { r: 5, g: 5, b: 5 });
    expect(bright.color).not.toBe(dark.color);
  });
});
