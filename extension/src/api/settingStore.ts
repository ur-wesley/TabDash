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
} from '../../types/settings.js';
import { Weather, WeatherData } from './weather.js';
import { Storage, LocalStorage } from './storage.js';
import { map, onMount, onSet, task } from 'nanostores';


const getSettings = async (setting: any): Promise<void> => {
  let _s: Storage | LocalStorage;
  if (import.meta.env.VITE_IS_EXTENSION == 'true')
    _s = new Storage(setting.sync);
  else _s = new LocalStorage();
  // _s.remove('settings');
  const x = (await _s.get('settings')).settings
  const settings: Setting = !!x['general'] ? x : (await getDefault());
  const w = new Weather(settings.weather.unit, settings.general.locale);
  let weather;
  if (setting.refresh == 'refresh') weather = await w.refreshWeather();
  else weather = await w.getWeather();
  settingStore.set(SettingObject.fromJson(settings));
  weatherStore.set(weather);
};

const settingStore = map<Setting>(undefined);
const weatherStore = map<WeatherData>(undefined);

onMount(settingStore, () => {
  task(async () => {
    await getSettings({ refresh: 'init', sync: false })
    if (settingStore.get().background.active)
      settingStore.get().background.image = await getImage();
  });
  console.info('settingStore mounted')
});
onSet(settingStore, ({ newValue }) => {
  setTimeout(() =>
    save()
    , 500)
});

const getImage = async (): Promise<BackgroundData> => {
  let _s: Storage | LocalStorage;
  if (import.meta.env.VITE_IS_EXTENSION == 'true')
    _s = new Storage(settingStore.get().general.sync || false);
  else _s = new LocalStorage();
  const t = (await _s.get('bgtimestamp')) ?? Date.now();
  if (Date.now() < Number(t.bgtimestamp) + 1000 * 60 * 10 && !!settingStore.get().background) {
    return settingStore.get().background.image;
  } else {
    console.log('refreshing image')
    return await refreshImage();
  }
};

const refreshImage = async (): Promise<BackgroundData> => {
  let _s: Storage | LocalStorage;
  if (import.meta.env.VITE_IS_EXTENSION == 'true')
    _s = new Storage(settingStore.get().general.sync || false);
  else _s = new LocalStorage();
  const _api: string = 'https://api.unsplash.com';
  const _apiKey: string = import.meta.env.VITE_UNSPLASH_API_KEY;
  const response = await fetch(
    `${_api}/photos/random?collections=${settingStore.get().background.collections.join(',') ?? ''
    }&client_id=${_apiKey}`
  )
    .then((r) => r.json())
    .catch(() => (settingStore.get().background.active = false));
  const src = response.urls.full ?? '';
  const author = response.user.name ?? '';
  const profile = response.user.links.html ?? '';
  const origin = response.links.html ?? '';
  const bg = { src, author, profile, origin };
  settingStore.get().background.image = bg;
  save();
  _s.set({ bgtimestamp: Date.now() });
  return bg;
};

const save = () => {
  console.log('saving ...')
  let _s: Storage | LocalStorage;
  if (import.meta.env.VITE_IS_EXTENSION == 'true')
    _s = new Storage(settingStore.get().general.sync || false);
  else _s = new LocalStorage();
  _s.set({ settings: settingStore.get() });
};

const setTheme = async (theme: Theme): Promise<void> => {
  settingStore.get().general.theme = theme;
};

const getTheme = (): Theme => settingStore.get().general.theme;


const addShortcut = (shortcut: ShortcutSetting): void => {
  settingStore.setKey('shortcuts', [...settingStore.get().shortcuts, shortcut]);
};

const editShortcut = (index: number, shortcut: ShortcutSetting): void => {
  settingStore.setKey('shortcuts', [...settingStore.get().shortcuts.map((s, i) => {
    if (i == index) return shortcut;
    return s;
  })]);
};

const removeShortcut = (shortcut: ShortcutSetting): void => {
  const index = settingStore.get().shortcuts.findIndex((s) => s.link == shortcut.link);
  settingStore.setKey('shortcuts', [...settingStore.get().shortcuts.filter((s, i) => {
    if (index != i) return s;
  })]);
};

const getDefault = async (): Promise<Setting> => {
  // const file = import.meta.env.VITE_IS_EXTENSION == 'true' ? chrome.runtime.getURL("./defaultSettings.json") : "/defaultSettings.json";
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
  setTheme,
  getTheme,
  addShortcut,
  editShortcut,
  removeShortcut,
  getDefault,
  resestToDefault,
};

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
