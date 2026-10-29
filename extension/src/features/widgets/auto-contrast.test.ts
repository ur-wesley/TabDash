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
    expect(parseBrightnessFactor()).toBe(1);
    expect(parseBrightnessFactor('invalid')).toBe(1);
  });
});

describe('auto-contrast - effectiveWidgetSurface', () => {
  it('composites translucent widget backgrounds over the wallpaper sample', () => {
    const surface = effectiveWidgetSurface('rgba(64, 64, 64, 0.4)', {
      blue: 255,
      green: 255,
      red: 255,
    });
    expect(surface.red).toBeGreaterThan(160);
    expect(surface.red).toBeLessThan(195);
    expect(surface.alpha).toBe(1);
  });

  it('keeps opaque widget backgrounds independent of the wallpaper', () => {
    const surface = effectiveWidgetSurface('#eeeeee', { blue: 0, green: 0, red: 0 });
    expect(surface).toEqual({ alpha: 1, blue: 238, green: 238, red: 238 });
  });

  it('applies backdrop brightness to the wallpaper sample', () => {
    const normal = effectiveWidgetSurface('rgba(64, 64, 64, 0.4)', {
        blue: 100,
        green: 100,
        red: 100,
      }),
      bright = effectiveWidgetSurface(
        'rgba(64, 64, 64, 0.4)',
        { blue: 100, green: 100, red: 100 },
        '160%',
      );
    expect(bright.red).toBeGreaterThan(normal.red);
  });
});

describe('auto-contrast - pickBestTextColor', () => {
  it('chooses white for dark surfaces and black for bright ones', () => {
    expect(pickBestTextColor('#18181b').color).toBe('#ffffff');
    expect(pickBestTextColor('#f8fafc').color).toBe('#000000');
  });

  it('keeps the preferred color when it already has the best contrast', () => {
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
    const res = autoWidgetTextColor('rgba(64, 64, 64, 0.4)', { blue: 220, green: 235, red: 240 });
    expect(res.color).toBe('#000000');
  });

  it('picks white text for a translucent widget over a dark photo region', () => {
    const res = autoWidgetTextColor('rgba(64, 64, 64, 0.4)', { blue: 25, green: 14, red: 10 });
    expect(res.color).toBe('#ffffff');
  });

  it('per-widget regions can disagree on the same photo', () => {
    const bg = 'rgba(64, 64, 64, 0.4)',
      bright = autoWidgetTextColor(bg, { blue: 245, green: 245, red: 245 }),
      dark = autoWidgetTextColor(bg, { blue: 5, green: 5, red: 5 });
    expect(bright.color).not.toBe(dark.color);
  });
});
