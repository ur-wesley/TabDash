import { createEffect, createRoot } from 'solid-js';
import { createStore } from 'solid-js/store';
import Settings from './api/settings.js';
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
} from '../types/settings.js';
import { Weather, WeatherData } from './api/weather.js';
import { Storage, LocalStorage } from './api/storage.js';

function createSettings() {
  createEffect(async () => {
    getSettings({ refresh: 'init', sync: false });
  });

  const [state, setState] = createStore<{
    settings?: Setting;
    weatherData?: WeatherData;
  }>({
    settings: undefined,
    weatherData: undefined,
  });

  const getSettings = async (setting: any) => {
    let _s: Storage | LocalStorage;
    if (import.meta.env.VITE_IS_EXTENSION == 'true')
      _s = new Storage(setting.sync);
    else _s = new LocalStorage();
    // _s.remove('settings');
    const settings: Setting =
      (await _s.get('settings')).settings ?? (await Settings.getDefault());
    const w = new Weather(settings.weather.unit, settings.general.locale);
    let weather;
    if (setting.refresh == 'refresh') weather = await w.refreshWeather();
    else weather = await w.getWeather();
    setState('settings', SettingObject.fromJson(settings));
    setState('weatherData', weather);
  };

  const getImage = async (): Promise<BackgroundData> => {
    let _s: Storage | LocalStorage;
    if (import.meta.env.VITE_IS_EXTENSION == 'true')
      _s = new Storage(state.settings!.general.sync || false);
    else _s = new LocalStorage();
    const t = (await _s.get('bgtimestamp')) ?? Date.now();
    if (Date.now() < Number(t.bgtimestamp) + 1000 * 60 * 10) {
      return state.settings!.background.image;
    } else {
      return await refreshImage();
    }
  };

  const refreshImage = async (): Promise<BackgroundData> => {
    let _s: Storage | LocalStorage;
    if (import.meta.env.VITE_IS_EXTENSION == 'true')
      _s = new Storage(state.settings!.general.sync || false);
    else _s = new LocalStorage();
    const _api: string = 'https://api.unsplash.com';
    const _apiKey: string = '9P5xO9KHShS2W5uCsdCWBnlpLTYZKwi3x7iNC4HfOLo';
    const response = await fetch(
      `${_api}/photos/random?collections=${state.settings!.background.collections.join(
        ','
      )}&client_id=${_apiKey}`
    )
      .then((r) => r.json())
      .catch(() => (state.settings!.background.active = false));
    const src = response.urls.full ?? '';
    const author = response.user.name ?? '';
    const profile = response.user.links.html ?? '';
    const origin = response.links.html ?? '';
    const bg = { src, author, profile, origin };
    state.settings!.background.image = bg;
    save();
    _s.set({ bgtimestamp: Date.now() });
    return bg;
  };

  const save = () => {
    let _s: Storage | LocalStorage;
    if (import.meta.env.VITE_IS_EXTENSION == 'true')
      _s = new Storage(state.settings!.general.sync || false);
    else _s = new LocalStorage();
    _s.set({ settings: state.settings });
  };

  const updateSettings = async (newSettings: Setting) => {
    setState('settings', (s) => {
      s = newSettings;
      return s;
    });
    save();
  };

  const setTheme = async (theme: Theme): Promise<void> => {
    state.settings!.general.theme = theme;
    save();
  };

  const getTheme = (): Theme => {
    return state.settings!.general.theme;
  };

  const addShortcut = (shortcut: ShortcutSetting): void => {
    state.settings!.shortcuts.push(shortcut);
    save();
  };

  const editShortcut = (index: number, shortcut: ShortcutSetting): void => {
    state.settings!.shortcuts.splice(index, 1, shortcut);
    save();
  };

  const removeShortcut = (shortcut: ShortcutSetting): void => {
    const index = state.settings!.shortcuts.findIndex((s) => s == shortcut);
    if (index > -1) {
      state.settings!.shortcuts.splice(index, 1);
      save();
    }
  };

  const getDefault = async (): Promise<Settings> => {
    // const file = import.meta.env.VITE_IS_EXTENSION == 'true' ? chrome.runtime.getURL("./defaultSettings.json") : "/defaultSettings.json";
    return await fetch('/defaultSettings.json').then((f) => f.json());
  };

  const resestToDefault = () => {
    let _s: Storage | LocalStorage;
    if (import.meta.env.VITE_IS_EXTENSION == 'true')
      _s = new Storage(state.settings!.general.sync || false);
    else _s = new LocalStorage();
    _s.remove('settings');
  };

  return {
    state,
    getSettings,
    getImage,
    refreshImage,
    updateSettings,
    setTheme,
    getTheme,
    addShortcut,
    editShortcut,
    removeShortcut,
    getDefault,
    resestToDefault,
  };
}

export default createRoot(createSettings);

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
