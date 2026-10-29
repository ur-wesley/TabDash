import { ResultAsync, ok } from '@ur-wesley/ts-prelude/result';
import type { WeatherUnit } from '../../types/settings';
import { isPlainObject, readFiniteNumber, readString } from '../lib/type-guards';
import { StorageService } from './storage-service';

interface WeatherOverview {
  humidity: number;
  pressure: number;
  temp: number;
  temp_max: number;
  temp_min: number;
  feels_like?: number;
}

interface Wind {
  speed: number;
  deg: number;
}

interface WeatherDetail {
  main: string;
  description: string;
  icon: string;
}

interface Clouds {
  all: number;
}

interface WeatherAdditional {
  country: string;
  sunrise: number;
  sunset: number;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface WeatherDataParams {
  city?: string;
  overview: WeatherOverview;
  wind: Wind;
  weather: WeatherDetail[];
  clouds: Clouds;
  additional: WeatherAdditional;
}

const CACHE_MINUTES = 10,
  HTTP_UNAUTHORIZED = 401,
  MS_PER_SECOND = 1000,
  SECONDS_PER_MINUTE = 60,
  CACHE_TTL_MS = MS_PER_SECOND * SECONDS_PER_MINUTE * CACHE_MINUTES,
  GEOLOCATION_MAX_AGE_MS = 600_000,
  GEOLOCATION_TIMEOUT_MS = 10_000,
  parseWeatherOverview = (value: unknown): WeatherOverview => {
    if (!isPlainObject(value)) {
      throw new Error('Invalid weather main');
    }
    const temp = readFiniteNumber(value.temp),
      humidity = readFiniteNumber(value.humidity),
      pressure = readFiniteNumber(value.pressure),
      tempMax = readFiniteNumber(value.temp_max),
      tempMin = readFiniteNumber(value.temp_min);
    if (
      temp === undefined ||
      humidity === undefined ||
      pressure === undefined ||
      tempMax === undefined ||
      tempMin === undefined
    ) {
      throw new Error('Invalid weather main');
    }
    const feelsLike = readFiniteNumber(value.feels_like);
    if (feelsLike === undefined) {
      return { humidity, pressure, temp, temp_max: tempMax, temp_min: tempMin };
    }
    return {
      feels_like: feelsLike,
      humidity,
      pressure,
      temp,
      temp_max: tempMax,
      temp_min: tempMin,
    };
  },
  parseWind = (value: unknown): Wind => {
    if (!isPlainObject(value)) {
      throw new Error('Invalid weather wind');
    }
    const speed = readFiniteNumber(value.speed),
      deg = readFiniteNumber(value.deg);
    if (speed === undefined || deg === undefined) {
      throw new Error('Invalid weather wind');
    }
    return { deg, speed };
  },
  parseClouds = (value: unknown): Clouds => {
    if (!isPlainObject(value)) {
      throw new Error('Invalid weather clouds');
    }
    const all = readFiniteNumber(value.all);
    if (all === undefined) {
      throw new Error('Invalid weather clouds');
    }
    return { all };
  },
  parseWeatherAdditional = (value: unknown): WeatherAdditional => {
    if (!isPlainObject(value)) {
      throw new Error('Invalid weather sys');
    }
    const country = readString(value.country),
      sunrise = readFiniteNumber(value.sunrise),
      sunset = readFiniteNumber(value.sunset);
    if (country === undefined || sunrise === undefined || sunset === undefined) {
      throw new Error('Invalid weather sys');
    }
    return { country, sunrise, sunset };
  },
  parseWeatherDetail = (value: unknown): WeatherDetail | null => {
    if (!isPlainObject(value)) {
      return null;
    }
    const main = readString(value.main),
      description = readString(value.description),
      icon = readString(value.icon);
    if (main === undefined || description === undefined || icon === undefined) {
      return null;
    }
    return { description, icon, main };
  },
  parseWeatherDetails = (value: unknown): WeatherDetail[] => {
    if (!Array.isArray(value)) {
      throw new TypeError('Invalid weather array');
    }
    const details: WeatherDetail[] = [];
    for (const entry of value) {
      const detail = parseWeatherDetail(entry);
      if (detail !== null) {
        details.push(detail);
      }
    }
    if (details.length === 0) {
      throw new Error('Invalid weather array');
    }
    return details;
  };

class WeatherData {
  public city?: string;
  public overview: WeatherOverview;
  public wind: Wind;
  public weather: WeatherDetail[];
  public clouds: Clouds;
  public additional: WeatherAdditional;

  public constructor(params: WeatherDataParams) {
    this.city = params.city;
    this.overview = params.overview;
    this.wind = params.wind;
    this.weather = params.weather;
    this.clouds = params.clouds;
    this.additional = params.additional;
  }

  public static fromObject(json: Record<string, unknown>): WeatherData {
    if (!isPlainObject(json.main) || !Array.isArray(json.weather)) {
      throw new Error('Invalid weather payload');
    }
    const city = readString(json.name);
    return new WeatherData({
      additional: parseWeatherAdditional(json.sys),
      city,
      clouds: parseClouds(json.clouds),
      overview: parseWeatherOverview(json.main),
      weather: parseWeatherDetails(json.weather),
      wind: parseWind(json.wind),
    });
  }

  public static fromStored(value: Record<string, unknown>): WeatherData | null {
    if (isPlainObject(value.main) && Array.isArray(value.weather)) {
      try {
        return WeatherData.fromObject(value);
      } catch {
        return null;
      }
    }
    if (!isPlainObject(value.overview) || !Array.isArray(value.weather)) {
      return null;
    }
    try {
      return new WeatherData({
        additional: parseWeatherAdditional(value.additional),
        city: readString(value.city),
        clouds: parseClouds(value.clouds),
        overview: parseWeatherOverview(value.overview),
        weather: parseWeatherDetails(value.weather),
        wind: parseWind(value.wind),
      });
    } catch {
      return null;
    }
  }
}

const normalizeWeatherLang = (lang?: string | null): string => {
  if (lang === null || lang === undefined || typeof lang !== 'string' || lang.trim() === '') {
    return 'en';
  }
  const base = lang.trim().toLowerCase().split(/[-_]/)[0];
  if (base === undefined || base === '') {
    return 'en';
  }
  return base;
};

class WeatherService {
  private readonly basePath = 'https://api.openweathermap.org/data/2.5/weather';
  private readonly appID =
    import.meta.env.VITE_OPENWEATHER_API_KEY ?? import.meta.env.OPENWEATHER_API_KEY ?? '';
  public unit: WeatherUnit;
  public lang: string;
  private readonly storage: StorageService;

  public constructor(unit: WeatherUnit, lang: string, storage?: StorageService) {
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
    const trimmed = this.appID.trim();
    return trimmed !== '' && trimmed !== 'VITE_OPENWEATHER_API_KEY';
  }

  public getGeolocation(): ResultAsync<Location, Error> {
    return ResultAsync.fromPromise(
      new Promise<Location>((resolve, reject) => {
        if (typeof navigator === 'undefined' || navigator.geolocation === undefined) {
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
            reject(new Error(error.message === '' ? 'Geolocation error' : error.message));
          },
          { maximumAge: GEOLOCATION_MAX_AGE_MS, timeout: GEOLOCATION_TIMEOUT_MS },
        );
      }),
      (error) => (error instanceof Error ? error : new Error(String(error))),
    );
  }

  public fetchWeather(): ResultAsync<WeatherData, Error> {
    if (!this.hasApiKey()) {
      return ResultAsync.fromPromise(
        Promise.reject(new Error('Weather API key is not configured')),
        (error) => (error instanceof Error ? error : new Error(String(error))),
      );
    }

    return this.getGeolocation().andThen(({ latitude, longitude }) =>
      ResultAsync.fromPromise(
        (async () => {
          const url = this.buildUrl(latitude, longitude),
            response = await fetch(url);
          if (!response.ok) {
            if (response.status === HTTP_UNAUTHORIZED) {
              throw new Error(
                'Weather fetch failed: 401 Unauthorized (Invalid or unactivated OpenWeather API key)',
              );
            }
            throw new Error(`Weather fetch failed: ${response.status} ${response.statusText}`);
          }
          const data: unknown = await response.json();
          if (!isPlainObject(data)) {
            throw new Error('Invalid weather response');
          }
          return WeatherData.fromObject(data);
        })(),
        (error) => (error instanceof Error ? error : new Error(String(error))),
      ),
    );
  }

  public getWeather(): ResultAsync<WeatherData | null, Error> {
    return this.storage
      .get<{ timestamp?: number }>('timestamp')
      .andThen((timestampRow) => {
        const timestamp =
            timestampRow !== null && timestampRow.timestamp !== undefined
              ? timestampRow.timestamp
              : 0,
          isFresh = Date.now() < timestamp + CACHE_TTL_MS;
        if (isFresh) {
          return this.storage.get<{ weather?: WeatherData }>('weather').map((weatherRow) => {
            if (weatherRow === null || weatherRow.weather === undefined) {
              return null;
            }
            return weatherRow.weather;
          });
        }
        return ok(null);
      })
      .andThen((cached) => {
        if (cached !== null) {
          return ok(cached);
        }
        return this.refreshWeather();
      });
  }

  public getCachedWeather(): ResultAsync<WeatherData | null, Error> {
    return this.storage
      .get<{ weather?: WeatherData | Record<string, unknown> }>('weather')
      .map((weatherRow) => {
        if (weatherRow === null || weatherRow.weather === undefined) {
          return null;
        }
        const stored = weatherRow.weather;
        if (stored instanceof WeatherData) {
          return stored;
        }
        if (isPlainObject(stored)) {
          return WeatherData.fromStored(stored);
        }
        return null;
      });
  }

  public refreshWeather(): ResultAsync<WeatherData | null, Error> {
    return this.fetchWeather()
      .andThen((weather) => this.storage.set({ timestamp: Date.now(), weather }).map(() => weather))
      .orElse(() =>
        this.storage.get<{ weather?: WeatherData }>('weather').map((weatherRow) => {
          if (weatherRow === null || weatherRow.weather === undefined) {
            return null;
          }
          return weatherRow.weather;
        }),
      );
  }
}

export {
  WeatherData,
  WeatherService,
  normalizeWeatherLang,
  type Clouds,
  type Location,
  type WeatherAdditional,
  type WeatherDataParams,
  type WeatherDetail,
  type WeatherOverview,
  type Wind,
};
