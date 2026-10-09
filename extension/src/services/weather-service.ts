import { ResultAsync, ok } from '@ur-wesley/ts-prelude/result';
import type { WeatherUnit } from '../../types/settings';
import { StorageService } from './storage-service';

export interface WeatherOverview {
  humidity: number;
  pressure: number;
  temp: number;
  temp_max: number;
  temp_min: number;
  feels_like?: number;
}

export interface Wind {
  speed: number;
  deg: number;
}

export interface WeatherDetail {
  main: string;
  description: string;
  icon: string;
}

export interface Clouds {
  all: number;
}

export interface WeatherAdditional {
  country: string;
  sunrise: number;
  sunset: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface WeatherDataParams {
  city?: string;
  overview: WeatherOverview;
  wind: Wind;
  weather: WeatherDetail[];
  clouds: Clouds;
  additional: WeatherAdditional;
}

export class WeatherData {
  public city?: string;
  public overview: WeatherOverview;
  public wind: Wind;
  public weather: WeatherDetail[];
  public clouds: Clouds;
  public additional: WeatherAdditional;

  constructor(params: WeatherDataParams) {
    this.city = params.city;
    this.overview = params.overview;
    this.wind = params.wind;
    this.weather = params.weather;
    this.clouds = params.clouds;
    this.additional = params.additional;
  }

  public static fromObject(json: Record<string, unknown>): WeatherData {
    if (!json || typeof json !== 'object' || !json.main || !json.weather) {
      throw new Error('Invalid weather payload');
    }
    return new WeatherData({
      additional: json.sys as WeatherAdditional,
      city: typeof json.name === 'string' ? json.name : undefined,
      clouds: json.clouds as Clouds,
      overview: json.main as WeatherOverview,
      weather: json.weather as WeatherDetail[],
      wind: json.wind as Wind,
    });
  }
}

export function normalizeWeatherLang(lang?: string | null): string {
  if (!lang || typeof lang !== 'string') {
    return 'en';
  }
  const base = lang.trim().toLowerCase().split(/[-_]/)[0];
  return base || 'en';
}

export class WeatherService {
  private readonly basePath: string = 'https://api.openweathermap.org/data/2.5/weather';
  private readonly appID: string =
    import.meta.env?.VITE_OPENWEATHER_API_KEY || import.meta.env?.OPENWEATHER_API_KEY || '';
  public unit: WeatherUnit;
  public lang: string;
  private readonly storage: StorageService;

  constructor(unit: WeatherUnit, lang: string, storage?: StorageService) {
    this.unit = unit;
    this.lang = normalizeWeatherLang(lang);
    this.storage = storage ?? new StorageService(false);
  }

  public setParams(unit: WeatherUnit, lang: string): boolean {
    const normalizedLang = normalizeWeatherLang(lang);
    if (this.unit === unit && this.lang === normalizedLang) {
      return false;
    }
    this.unit = unit;
    this.lang = normalizedLang;
    return true;
  }

  public buildUrl(latitude: number, longitude: number): string {
    return `${this.basePath}?units=${this.unit}&lang=${this.lang}&appid=${this.appID}&lat=${latitude}&lon=${longitude}`;
  }

  public hasApiKey(): boolean {
    return Boolean(
      this.appID && this.appID.trim() !== '' && this.appID !== 'VITE_OPENWEATHER_API_KEY',
    );
  }

  public getGeolocation(): ResultAsync<Location, Error> {
    return ResultAsync.fromPromise(
      new Promise<Location>((resolve, reject) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          reject(new Error('Geolocation is not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            reject(new Error(error.message || 'Geolocation error'));
          },
          { maximumAge: 600000, timeout: 10000 },
        );
      }),
      (e) => (e instanceof Error ? e : new Error(String(e))),
    );
  }

  public fetchWeather(): ResultAsync<WeatherData, Error> {
    if (!this.hasApiKey()) {
      return ResultAsync.fromPromise(
        Promise.reject(new Error('Weather API key is not configured')),
        (e) => (e instanceof Error ? e : new Error(String(e))),
      );
    }

    return this.getGeolocation().andThen(({ latitude, longitude }) =>
      ResultAsync.fromPromise(
        (async () => {
          const url = this.buildUrl(latitude, longitude),
            response = await fetch(url);
          if (!response.ok) {
            if (response.status === 401) {
              throw new Error(
                'Weather fetch failed: 401 Unauthorized (Invalid or unactivated OpenWeather API key)',
              );
            }
            throw new Error(`Weather fetch failed: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          return WeatherData.fromObject(data);
        })(),
        (e) => (e instanceof Error ? e : new Error(String(e))),
      ),
    );
  }

  public getWeather(): ResultAsync<WeatherData | null, Error> {
    return this.storage
      .get<{ timestamp?: number }>('timestamp')
      .andThen((t) => {
        const timestamp = t?.timestamp ? t.timestamp : 0,
          isFresh = Date.now() < timestamp + 1000 * 60 * 10;
        if (isFresh) {
          return this.storage.get<{ weather?: WeatherData }>('weather').map((w) => {
            if (!w?.weather) {
              return null;
            }
            return w.weather;
          });
        }
        return ok(null);
      })
      .andThen((cached) => {
        if (cached) {
          return ok(cached);
        }
        return this.refreshWeather();
      });
  }

  public getCachedWeather(): ResultAsync<WeatherData | null, Error> {
    return this.storage.get<{ weather?: WeatherData }>('weather').map((w) => {
      if (!w?.weather) {
        return null;
      }
      try {
        return WeatherData.fromObject(w.weather as unknown as Record<string, unknown>);
      } catch {
        return w.weather;
      }
    });
  }

  public refreshWeather(): ResultAsync<WeatherData | null, Error> {
    return this.fetchWeather()
      .andThen((weather) =>
        this.storage
          .set({ timestamp: Date.now(), weather })
          .map(() => weather as WeatherData | null),
      )
      .orElse(() =>
        // On error, try returning cached weather if present
        this.storage.get<{ weather?: WeatherData }>('weather').map((w) => w?.weather ?? null),
      );
  }
}
