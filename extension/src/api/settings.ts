import {
  BackgroundData,
  BackgroundSetting,
  ClockSetting,
  DateSetting,
  GeneralSetting,
  LayoutSetting,
  Setting,
  ShortcutAppereance,
  ShortcutSetting,
  Theme,
  WeatherSetting,
} from "../../types/settings.js";
import { Weather, WeatherData } from "./weather.js";
import { Storage, LocalStorage } from "./storage.js";

class Settings {
  public weatherData?: WeatherData;
  public settings: SettingObject;
  constructor(settings: SettingObject, weatherData?: WeatherData) {
    this.settings = settings;
    this.weatherData = weatherData;
    this._setup();
  }

  private async _setup(): Promise<void> {
    if (this.settings.background.active)
      this.settings.background.image = await this.getImage();
  }

  public static async getSettings(setting: any): Promise<Settings> {
    let _s: Storage | LocalStorage;
    if (import.meta.env.VITE_IS_EXTENSION == 'true') _s = new Storage(setting.sync);
    else _s = new LocalStorage();
    // _s.remove('settings');
    const settings: Setting =
      (await _s.get("settings")).settings ?? (await Settings.getDefault());
    const w = new Weather(settings.weather.unit, settings.general.locale);
    let weather;
    if (setting.refresh == "refresh") weather = await w.refreshWeather();
    else weather = await w.getWeather();
    return new Settings(SettingObject.fromJson(settings), weather);
  }

  public async getImage(): Promise<BackgroundData> {
    let _s: Storage | LocalStorage;
    if (import.meta.env.VITE_IS_EXTENSION == 'true') _s = new Storage(this.settings.general.sync || false);
    else _s = new LocalStorage();
    const t = (await _s.get("bgtimestamp")) ?? Date.now();
    if (Date.now() < Number(t.bgtimestamp) + 1000 * 60 * 10) {
      return this.settings.background.image;
    } else {
      return await this.refreshImage();
    }
  }

  public async refreshImage(): Promise<BackgroundData> {
    let _s: Storage | LocalStorage;
    if (import.meta.env.VITE_IS_EXTENSION == 'true') _s = new Storage(this.settings.general.sync || false);
    else _s = new LocalStorage();
    const _api: string = "https://api.unsplash.com";
    const _apiKey: string = "9P5xO9KHShS2W5uCsdCWBnlpLTYZKwi3x7iNC4HfOLo";
    const response = await fetch(
      `${_api}/photos/random?collections=${this.settings.background.collections.join(
        ","
      )}&client_id=${_apiKey}`
    )
      .then((r) => r.json())
      .catch(() => (this.settings.background.active = false));
    const src = response.urls.full;
    const author = response.user.name;
    const profile = response.user.links.html;
    const origin = response.links.html;
    const bg = { src, author, profile, origin };
    this.settings.background.image = bg;
    this.save();
    _s.set({ bgtimestamp: Date.now() });
    return bg;
  }

  public async setTheme(theme: Theme): Promise<void> {
    this.settings.general.theme = theme;
    this.save();
  }

  public getTheme(): Theme {
    return this.settings.general.theme;
  }

  public save(): void {
    let _s: Storage | LocalStorage;
    if (import.meta.env.VITE_IS_EXTENSION == 'true') _s = new Storage(this.settings.general.sync || false);
    else _s = new LocalStorage();
    _s.set({ settings: this.settings });
  }

  public addShortcut(shortcut: ShortcutSetting): void {
    this.settings.shortcuts.push(shortcut);
    this.save();
  }

  public editShortcut(index: number, shortcut: ShortcutSetting): void {
    this.settings.shortcuts.splice(index, 1, shortcut);
    this.save();
  }

  public removeShortcut(shortcut: ShortcutSetting): void {
    const index = this.settings.shortcuts.findIndex((s) => s == shortcut);
    if (index > -1) {
      this.settings.shortcuts.splice(index, 1);
      this.save();
    }
  }

  public static async getDefault(): Promise<Settings> {
    // const file = import.meta.env.VITE_IS_EXTENSION == 'true' ? chrome.runtime.getURL("./defaultSettings.json") : "/defaultSettings.json";
    return await fetch('/defaultSettings.json').then((f) => f.json());
  }

  public resestToDefault() {
    let _s: Storage | LocalStorage;
    if (import.meta.env.VITE_IS_EXTENSION == 'true') _s = new Storage(this.settings.general.sync || false);
    else _s = new LocalStorage();
    _s.remove("settings");
  }
}

export default Settings;

class SettingObject implements Setting {
  id: string;
  general: GeneralSetting;
  background: BackgroundSetting;
  shortcutAppereance: ShortcutAppereance;
  shortcuts: ShortcutSetting[];
  layout: LayoutSetting;
  clock: ClockSetting;
  date: DateSetting;
  weather: WeatherSetting;

  constructor(
    id: string,
    general: GeneralSetting,
    background: BackgroundSetting,
    shortcutAppereance: ShortcutAppereance,
    shortcuts: ShortcutSetting[],
    layout: LayoutSetting,
    clock: ClockSetting,
    date: DateSetting,
    weather: WeatherSetting
  ) {
    this.id = id;
    this.general = general;
    this.background = background;
    this.shortcutAppereance = shortcutAppereance;
    this.shortcuts = shortcuts;
    this.layout = layout;
    this.clock = clock;
    this.date = date;
    this.weather = weather;
  }

  public static fromJson(json: any): SettingObject {
    return new SettingObject(
      json.id,
      json.general,
      json.background,
      json.shortcutAppereance,
      json.shortcuts,
      json.layout,
      json.clock,
      json.date,
      json.weather
    );
  }
}
