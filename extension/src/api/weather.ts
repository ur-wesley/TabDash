import { WeatherUnit } from "../../types/settings.js";
import { Storage, LocalStorage } from "./storage.js";

class Weather {
  private basePath: string = "https://api.openweathermap.org/data/2.5/weather";
  private appID: string = import.meta.env.VITE_OPENWEATHER_API_KEY;
  public unit: WeatherUnit;
  public lang: string;
  constructor(unit: WeatherUnit, lang: string) {
    this.unit = unit;
    this.lang = lang;
  }
  public async fetchWeather(): Promise<WeatherData> {
    return new Promise<WeatherData>(async (resolve, reject) => {
      const { latitude, longitude } = await this.getGeolocation();
      return await fetch(
        `${this.basePath}?units=${this.unit}&lang=${this.lang}&appid=${this.appID}&lat=${latitude}&lon=${longitude}`
      )
        .then((res) => res.json())
        .then((data) => resolve(WeatherData.fromObject(data)))
        .catch(() => reject);
    });
  }

  private async getGeolocation(): Promise<Location> {
    return new Promise<Location>((resolve, reject) => {
      return navigator.geolocation.getCurrentPosition((position) => {
        return resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      }, reject);
    });
  }

  public async getWeather(): Promise<WeatherData> {
    let _s: Storage | LocalStorage;
    if (import.meta.env.VITE_IS_EXTENSION == 'true') _s = new Storage(false);
    else _s = new LocalStorage();
    const t = (await _s.get("timestamp")) ?? Date.now();
    if (Date.now() < Number(t.timestamp) + 1000 * 60 * 10) {
      const w = await _s.get("weather");
      if (!w) return await this.refreshWeather();
      return w.weather as WeatherData;
    } else {
      return await this.refreshWeather();
    }
  }

  public async refreshWeather(): Promise<WeatherData> {
    let _s: Storage | LocalStorage;
    if (import.meta.env.VITE_IS_EXTENSION == 'true') _s = new Storage(false);
    else _s = new LocalStorage();
    const weather = await this.fetchWeather();
    _s.set({ weather, timestamp: Date.now() });
    return weather;
  }
}

export { Weather, WeatherData };

class WeatherData {
  public overview: WeatherOverview;
  public wind: Wind;
  public weather: Array<WeatherDetail>;
  public clouds: Clouds;
  public additional: WeatherAdditional;
  constructor(
    overview: WeatherOverview,
    wind: Wind,
    weather: Array<WeatherDetail>,
    clouds: Clouds,
    additional: WeatherAdditional
  ) {
    this.overview = overview;
    this.wind = wind;
    this.weather = weather;
    this.clouds = clouds;
    this.additional = additional;
  }

  public static fromObject(json: any): WeatherData {
    return new WeatherData(
      json.main,
      json.wind,
      json.weather,
      json.clouds,
      json.sys
    );
  }
}

interface WeatherOverview {
  humidity: number;
  pressure: number;
  temp: number;
  temp_max: number;
  temp_min: number;
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
