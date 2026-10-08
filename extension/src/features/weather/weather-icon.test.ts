import { describe, expect, it } from 'bun:test';
import { owmIconToMdi } from './weather-icon';

describe('owmIconToMdi', () => {
  it('maps clear sky day/night', () => {
    expect(owmIconToMdi('01d')).toBe('i-mdi-weather-sunny');
    expect(owmIconToMdi('01n')).toBe('i-mdi-weather-night');
  });

  it('maps few/scattered/broken clouds', () => {
    expect(owmIconToMdi('02d')).toBe('i-mdi-weather-partly-cloudy');
    expect(owmIconToMdi('02n')).toBe('i-mdi-weather-night-partly-cloudy');
    expect(owmIconToMdi('03d')).toBe('i-mdi-weather-cloudy');
    expect(owmIconToMdi('03n')).toBe('i-mdi-weather-cloudy');
    expect(owmIconToMdi('04d')).toBe('i-mdi-weather-cloudy');
    expect(owmIconToMdi('04n')).toBe('i-mdi-weather-cloudy');
  });

  it('maps rain, storm, snow and mist', () => {
    expect(owmIconToMdi('09d')).toBe('i-mdi-weather-rainy');
    expect(owmIconToMdi('09n')).toBe('i-mdi-weather-rainy');
    expect(owmIconToMdi('10d')).toBe('i-mdi-weather-pouring');
    expect(owmIconToMdi('10n')).toBe('i-mdi-weather-pouring');
    expect(owmIconToMdi('11d')).toBe('i-mdi-weather-lightning-rainy');
    expect(owmIconToMdi('11n')).toBe('i-mdi-weather-lightning-rainy');
    expect(owmIconToMdi('13d')).toBe('i-mdi-weather-snowy');
    expect(owmIconToMdi('13n')).toBe('i-mdi-weather-snowy');
    expect(owmIconToMdi('50d')).toBe('i-mdi-weather-fog');
    expect(owmIconToMdi('50n')).toBe('i-mdi-weather-fog');
  });

  it('falls back to a cloudy icon for unknown or missing codes', () => {
    expect(owmIconToMdi('99x')).toBe('i-mdi-weather-cloudy');
    expect(owmIconToMdi(undefined)).toBe('i-mdi-weather-cloudy');
    expect(owmIconToMdi(null)).toBe('i-mdi-weather-cloudy');
    expect(owmIconToMdi('')).toBe('i-mdi-weather-cloudy');
  });
});
