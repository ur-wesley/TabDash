import { describe, expect, it } from 'bun:test';
import { WeatherService, normalizeWeatherLang } from './weather-service';
import { StorageService } from './storage-service';

describe('WeatherService caching', () => {
  it('returns null when no cached weather exists', async () => {
    const storage = new StorageService(false);
    await storage.remove('weather');
    const service = new WeatherService('metric', 'en', storage);

    const cached = await service.getCachedWeather();
    expect(cached.isOk()).toBe(true);
    if (cached.isOk()) {
      expect(cached.value).toBeNull();
    }
  });

  it('retrieves cached weather when available in storage', async () => {
    const storage = new StorageService(false);
    const mockWeather = {
      city: 'Berlin',
      overview: { temp: 20, temp_min: 16, temp_max: 22, humidity: 55, pressure: 1012 },
      wind: { speed: 5, deg: 180 },
      weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
      clouds: { all: 10 },
      additional: { country: 'DE', sunrise: 0, sunset: 0 },
    };

    await storage.set({ weather: mockWeather });
    const service = new WeatherService('metric', 'en', storage);

    const cached = await service.getCachedWeather();
    expect(cached.isOk()).toBe(true);
    if (cached.isOk()) {
      expect(cached.value?.city).toBe('Berlin');
      expect(cached.value?.overview.temp).toBe(20);
    }
  });
});

describe('WeatherService language', () => {
  it('normalizes lang codes with en fallback', () => {
    expect(normalizeWeatherLang('de')).toBe('de');
    expect(normalizeWeatherLang('FR')).toBe('fr');
    expect(normalizeWeatherLang('en-US')).toBe('en');
    expect(normalizeWeatherLang('')).toBe('en');
    expect(normalizeWeatherLang(null)).toBe('en');
    expect(normalizeWeatherLang(undefined)).toBe('en');
  });

  it('normalizes lang in constructor', () => {
    const storage = new StorageService(false);
    const service = new WeatherService('metric', 'DE', storage);
    expect(service.lang).toBe('de');
  });

  it('builds OpenWeather URL with correct lang param', () => {
    const storage = new StorageService(false);
    const service = new WeatherService('metric', 'de', storage);
    const url = service.buildUrl(50, 10);
    expect(url).toContain('lang=de');
    expect(url).toContain('units=metric');
    expect(url).toContain('lat=50');
    expect(url).toContain('lon=10');
  });

  it('setParams returns false when unchanged and true when lang changes', () => {
    const storage = new StorageService(false);
    const service = new WeatherService('metric', 'en', storage);
    expect(service.setParams('metric', 'en')).toBe(false);
    expect(service.setParams('metric', 'de')).toBe(true);
    expect(service.lang).toBe('de');
    expect(service.buildUrl(50, 10)).toContain('lang=de');
  });
});
