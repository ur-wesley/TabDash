import { describe, expect, it } from 'bun:test';
import { createRoot } from 'solid-js';
import { createWeatherStore } from './weather-context';
import { StorageService } from '../../services/storage-service';

describe('createWeatherStore loading and cached data retention', () => {
  it('initializes store with idle status', () => {
    createRoot((dispose) => {
      const [state] = createWeatherStore('metric', 'en');
      expect(state().status).toBe('idle');
      expect(state().error).toBeNull();
      dispose();
    });
  });

  it('preloads cached weather data so existing data is immediately available', async () => {
    const storage = new StorageService(false);
    const mockWeather = {
      city: 'Dresden',
      overview: { temp: 22, temp_min: 19, temp_max: 24, humidity: 50, pressure: 1013 },
      wind: { speed: 3, deg: 180 },
      weather: [{ main: 'Clear', description: 'sunny', icon: '01d' }],
      clouds: { all: 0 },
      additional: { country: 'DE', sunrise: 0, sunset: 0 },
    };

    await storage.set({ weather: mockWeather });

    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const [state] = createWeatherStore('metric', 'en');

        setTimeout(() => {
          expect(state().data).not.toBeNull();
          expect(state().data?.city).toBe('Dresden');
          dispose();
          resolve();
        }, 50);
      });
    });
  });

  it('updateParams reports changes so language switch can trigger refetch', () => {
    createRoot((dispose) => {
      const [, actions] = createWeatherStore('metric', 'en');
      expect(actions.updateParams('metric', 'en')).toBe(false);
      expect(actions.updateParams('metric', 'de')).toBe(true);
      expect(actions.updateParams('metric', 'de')).toBe(false);
      expect(actions.updateParams('imperial', 'de')).toBe(true);
      dispose();
    });
  });
});
