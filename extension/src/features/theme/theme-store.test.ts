import { describe, expect, it } from 'bun:test';
import { isNightByWeather, resolveEffectiveTheme } from './theme-store';

describe('resolveEffectiveTheme', () => {
  it('returns explicit light/dark themes untouched', () => {
    expect(resolveEffectiveTheme('light', { nightByWeather: true, systemDark: true })).toBe(
      'light',
    );
    expect(resolveEffectiveTheme('dark', { nightByWeather: false, systemDark: false })).toBe(
      'dark',
    );
  });

  it('follows the OS preference for system theme', () => {
    expect(resolveEffectiveTheme('system', { nightByWeather: false, systemDark: true })).toBe(
      'dark',
    );
    expect(resolveEffectiveTheme('system', { nightByWeather: true, systemDark: false })).toBe(
      'light',
    );
  });

  it('follows night time for automatic theme', () => {
    expect(resolveEffectiveTheme('automatic', { nightByWeather: true, systemDark: false })).toBe(
      'dark',
    );
    expect(resolveEffectiveTheme('automatic', { nightByWeather: false, systemDark: true })).toBe(
      'light',
    );
  });
});

describe('isNightByWeather', () => {
  const additional = { sunrise: 1000, sunset: 2000 };

  it('returns false without weather data', () => {
    expect(isNightByWeather()).toBe(false);
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
