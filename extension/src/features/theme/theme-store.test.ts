import { describe, expect, it } from 'bun:test';
import { isNightByWeather, resolveEffectiveTheme } from './theme-store';

describe('resolveEffectiveTheme', () => {
  it('returns explicit light/dark themes untouched', () => {
    expect(resolveEffectiveTheme('light', { systemDark: true, nightByWeather: true })).toBe(
      'light',
    );
    expect(resolveEffectiveTheme('dark', { systemDark: false, nightByWeather: false })).toBe(
      'dark',
    );
  });

  it('follows the OS preference for system theme', () => {
    expect(resolveEffectiveTheme('system', { systemDark: true, nightByWeather: false })).toBe(
      'dark',
    );
    expect(resolveEffectiveTheme('system', { systemDark: false, nightByWeather: true })).toBe(
      'light',
    );
  });

  it('follows night time for automatic theme', () => {
    expect(resolveEffectiveTheme('automatic', { systemDark: false, nightByWeather: true })).toBe(
      'dark',
    );
    expect(resolveEffectiveTheme('automatic', { systemDark: true, nightByWeather: false })).toBe(
      'light',
    );
  });
});

describe('isNightByWeather', () => {
  const additional = { sunrise: 1_000, sunset: 2_000 };

  it('returns false without weather data', () => {
    expect(isNightByWeather(undefined)).toBe(false);
  });

  it('detects day between sunrise and sunset', () => {
    expect(isNightByWeather(additional, 1_500_000)).toBe(false);
  });

  it('detects night after sunset', () => {
    expect(isNightByWeather(additional, 2_500_000)).toBe(true);
  });

  it('detects night before sunrise', () => {
    expect(isNightByWeather(additional, 500_000)).toBe(true);
  });
});
