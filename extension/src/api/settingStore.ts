import type {
  BackgroundData,
  BackgroundSetting,
  CacheSetting,
  ClockSetting,
  DateSetting,
  GeneralSetting,
  LayoutSetting,
  SearchSetting,
  Setting,
  ShortcutAppereance,
  ShortcutSetting,
  Theme,
  WeatherSetting,
  WidgetSetting,
} from '../../types/settings.js';
import type { WeatherData } from './weather.js';
import { Weather } from './weather.js';
import { Storage, LocalStorage } from './storage.js';
import { map, onMount, onSet, task } from 'nanostores';

const getSettings = async (setting: { refresh?: string; sync?: boolean } = {}): Promise<void> => {
  let _s: Storage | LocalStorage;
  if (import.meta.env.VITE_IS_EXTENSION == 'true') _s = new Storage(setting.sync ?? false);
  else _s = new LocalStorage();
  const stored = await _s.get('settings');
  const x = stored?.settings;
  const settings: Setting = x ? x : await getDefault();
  const w = new Weather(settings.weather.unit, settings.general.locale);
  let weather: WeatherData | null;
  if (setting.refresh == 'refresh') weather = await w.refreshWeather();
  else weather = await w.getWeather();
  settingStore.set(await SettingObject.fromJson(settings));
  weatherStore.set(weather);
};

const settingStore = map<Setting>(undefined);
const weatherStore = map<WeatherData | null>(undefined);

let saveTimer: ReturnType<typeof setTimeout> | undefined;

onMount(settingStore, () => {
  task(async () => {
    await getSettings({ refresh: 'init', sync: false });
    const current = settingStore.get();
    if (current?.background?.active) {
      const img = await getImage();
      settingStore.setKey('background', {
        ...settingStore.get().background,
        image: img,
      });
    }
  });
  console.info('settingStore mounted');
});

onSet(settingStore, () => {
  if (saveTimer !== undefined) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => save(), 500);
});

const getImage = async (): Promise<BackgroundData> => {
  const current = settingStore.get();
  let _s: Storage | LocalStorage;
  if (import.meta.env.VITE_IS_EXTENSION == 'true')
    _s = new Storage(current?.general?.sync || false);
  else _s = new LocalStorage();
  const t = (await _s.get('bgtimestamp')) ?? Date.now();
  if (Date.now() < Number(t.bgtimestamp) + 1000 * 60 * 10 && current?.background?.image) {
    return current.background.image;
  } else {
    console.log('refreshing image');
    return await refreshImage();
  }
};

const refreshWeather = async (): Promise<WeatherData | null> => {
  const settings = settingStore.get();
  if (!settings) return null;
  const w = new Weather(settings.weather.unit, settings.general.locale);
  const weather = await w.refreshWeather();
  weatherStore.set(weather);
  return weather;
};

const refreshImage = async (): Promise<BackgroundData> => {
  let _s: Storage | LocalStorage;
  if (import.meta.env.VITE_IS_EXTENSION == 'true')
    _s = new Storage(settingStore.get().general.sync || false);
  else _s = new LocalStorage();
  const _api: string = 'https://api.unsplash.com';
  const _apiKey: string = import.meta.env.VITE_UNSPLASH_API_KEY;
  const { width, height } = screen;
  const size = width > height ? width : height;
  const cache = settingStore.get().cache.images;
  if (cache.length < 2) {
    await fetch(
      `${_api}/photos/random?collections=${
        settingStore.get().background.collections.join(',') ?? ''
      }&count=4`,
      {
        headers: {
          Authorization: `Client-ID ${_apiKey}`,
        },
      },
    )
      .then((r) => r.json())
      .then((images) => {
        settingStore.setKey('cache', {
          ...settingStore.get().cache,
          images: [...cache, ...images],
        });
      })
      .catch(() =>
        settingStore.setKey('background', {
          ...settingStore.get().background,
          active: false,
        }),
      );
  }
  await fetch(cache[0].links.download_location, {
    headers: {
      Authorization: `Client-ID ${_apiKey}`,
    },
  });
  const src = cache[0]?.urls?.raw
    ? `${cache[0].urls.raw}&w=${size}&dpr=${window.devicePixelRatio}`
    : '';
  const next = cache[1]?.urls?.raw
    ? `${cache[1].urls.raw}&w=${size}&dpr=${window.devicePixelRatio}`
    : '';
  const author = cache[0].user.name ?? '';
  const profile = cache[0].user.links.html ?? '';
  const origin = cache[0].links.html ?? '';
  const bg = { src, author, profile, origin, next };
  settingStore.setKey('cache', {
    images: cache.slice(1),
  });
  settingStore.setKey('background', {
    ...settingStore.get().background,
    image: bg,
  });
  save();
  _s.set({ bgtimestamp: Date.now() });
  return bg;
};

const save = () => {
  const current = settingStore.get();
  if (!current) return;
  console.log('saving ...');
  let _s: Storage | LocalStorage;
  if (import.meta.env.VITE_IS_EXTENSION == 'true') _s = new Storage(current.general?.sync || false);
  else _s = new LocalStorage();
  _s.set({ settings: current });
};

const setTheme = async (theme: Theme): Promise<void> => {
  settingStore.setKey('general', {
    ...settingStore.get().general,
    theme: theme,
  });
};

const getTheme = (): Theme => settingStore.get().general.theme;

const addShortcut = (shortcut: ShortcutSetting): void => {
  settingStore.setKey('shortcuts', [...settingStore.get().shortcuts, shortcut]);
};

const editShortcut = (index: number, shortcut: ShortcutSetting): void => {
  settingStore.setKey(
    'shortcuts',
    settingStore.get().shortcuts.map((s, i) => {
      if (i == index) return shortcut;
      return s;
    }),
  );
};

const removeShortcut = (shortcut: ShortcutSetting): void => {
  const index = settingStore.get().shortcuts.findIndex((s) => s.link == shortcut.link);
  settingStore.setKey(
    'shortcuts',
    settingStore.get().shortcuts.filter((s, i) => {
      if (index != i) return s;
    }),
  );
};

const getDefault = async (): Promise<Setting> => {
  return await fetch('/defaultSettings.json').then((f) => f.json());
};

const resestToDefault = () => {
  let _s: Storage | LocalStorage;
  if (import.meta.env.VITE_IS_EXTENSION == 'true')
    _s = new Storage(settingStore.get().general.sync || false);
  else _s = new LocalStorage();
  _s.remove('settings');
};

export {
  settingStore,
  weatherStore,
  getSettings,
  getImage,
  refreshImage,
  refreshWeather,
  setTheme,
  getTheme,
  addShortcut,
  editShortcut,
  removeShortcut,
  getDefault,
  resestToDefault,
};

export class SettingObject implements Setting {
  id: string;
  general: GeneralSetting;
  background: BackgroundSetting;
  shortcutAppereance: ShortcutAppereance;
  shortcuts: ShortcutSetting[];
  layout: LayoutSetting;
  clock: ClockSetting;
  date: DateSetting;
  weather: WeatherSetting;
  search: SearchSetting;
  cache: CacheSetting;
  widgetSetting: WidgetSetting;

  constructor(
    id: string,
    general: GeneralSetting,
    background: BackgroundSetting,
    shortcutAppereance: ShortcutAppereance,
    shortcuts: ShortcutSetting[],
    layout: LayoutSetting,
    clock: ClockSetting,
    date: DateSetting,
    weather: WeatherSetting,
    search: SearchSetting,
    cache: CacheSetting,
    widgetSetting: WidgetSetting,
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
    this.search = search;
    this.cache = cache;
    this.widgetSetting = widgetSetting;
  }

  public static async fromJson(json?: Partial<Setting>): Promise<SettingObject> {
    const settings = await getDefault();
    if (!json) {
      return new SettingObject(
        settings.id,
        settings.general,
        settings.background,
        settings.shortcutAppereance,
        settings.shortcuts,
        settings.layout,
        settings.clock,
        settings.date,
        settings.weather,
        settings.search,
        settings.cache,
        settings.widgetSetting,
      );
    }
    return new SettingObject(
      json.id || settings.id,
      json.general || settings.general,
      json.background || settings.background,
      json.shortcutAppereance || settings.shortcutAppereance,
      json.shortcuts || settings.shortcuts,
      json.layout || settings.layout,
      json.clock || settings.clock,
      json.date || settings.date,
      json.weather || settings.weather,
      json.search || settings.search,
      json.cache || settings.cache,
      json.widgetSetting || settings.widgetSetting,
    );
  }
}
