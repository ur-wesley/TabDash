import { createContext, onMount, useContext } from 'solid-js';
import type { JSX } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import type {
  BackgroundData,
  BackgroundSetting,
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
} from '../../../types/settings';
import { storageService } from '../../services/storage-service';
import { wallpaperService } from '../../services/wallpaper-service';
import { defaultFlowOrder, defaultPositions } from '../layout/layout-defaults';

export interface SettingsActions {
  setSettings: (settings: Setting) => void;
  updateGeneral: (patch: Partial<GeneralSetting>) => void;
  updateBackground: (patch: Partial<BackgroundSetting>) => void;
  updateShortcutAppearance: (patch: Partial<ShortcutAppereance>) => void;
  updateLayout: (patch: Partial<LayoutSetting>) => void;
  updateClock: (patch: Partial<ClockSetting>) => void;
  updateDate: (patch: Partial<DateSetting>) => void;
  updateWeather: (patch: Partial<WeatherSetting>) => void;
  updateSearch: (patch: Partial<SearchSetting>) => void;
  updateWidgetAppearance: (patch: {
    mode: 'light' | 'dark';
    patch: Partial<WidgetSetting['light']>;
  }) => void;
  addShortcut: (shortcut: ShortcutSetting) => void;
  editShortcut: (index: number, shortcut: ShortcutSetting) => void;
  removeShortcut: (shortcut: ShortcutSetting) => void;
  setTheme: (theme: Theme) => void;
  refreshImage: () => Promise<BackgroundData>;
  resetToDefault: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

export type SettingsContextValue = readonly [state: Setting, actions: SettingsActions];

const SettingsContext = createContext<SettingsContextValue>(),
  ROTATION_INTERVAL_MS = 1000 * 60 * 15; // 15 minutes

export function createSettingsStore(initialSettings: Setting): SettingsContextValue {
  const [state, setState] = createStore<Setting>(initialSettings);
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  const saveSettings = async (): Promise<void> => {
      const sanitized: Setting = {
        ...state,
        cache: { images: [] },
      };
      await storageService.set({ settings: sanitized });
    },
    scheduleSave = () => {
      if (saveTimer !== undefined) {
        clearTimeout(saveTimer);
      }
      saveTimer = setTimeout(() => {
        void saveSettings();
      }, 400);
    },
    actions: SettingsActions = {
      addShortcut: (shortcut) => {
        setState('shortcuts', (prev) => [...prev, shortcut]);
        scheduleSave();
      },
      editShortcut: (index, shortcut) => {
        setState('shortcuts', index, shortcut);
        scheduleSave();
      },
      refreshImage: async () => {
        const collections = state.background?.collections ?? [];
        const res = await wallpaperService.consumeNext(collections);
        const nextData = res.isOk() ? res.value : null;

        if (nextData) {
          setState('background', 'image', nextData);
          await storageService.set({ bgtimestamp: Date.now() });
          void saveSettings();
          return nextData;
        }
        return (
          state.background?.image ?? { src: '', next: '', author: '', profile: '', origin: '' }
        );
      },
      removeShortcut: (shortcut) => {
        setState('shortcuts', (prev) => prev.filter((s) => s.link !== shortcut.link));
        scheduleSave();
      },
      resetToDefault: async () => {
        await storageService.remove('settings');
        await storageService.remove('bgtimestamp');
        await wallpaperService.clear();
        const defaultSettings = await fetchDefaultSettings();
        setState(defaultSettings);
      },
      saveSettings,
      setSettings: (settings) => {
        setState(settings);
        scheduleSave();
      },
      setTheme: (theme) => {
        setState('general', 'theme', theme);
        scheduleSave();
      },
      updateBackground: (patch) => {
        setState('background', (prev) => ({ ...prev, ...patch }));
        scheduleSave();
      },
      updateClock: (patch) => {
        setState('clock', (prev) => ({ ...prev, ...patch }));
        scheduleSave();
      },
      updateDate: (patch) => {
        setState('date', (prev) => ({ ...prev, ...patch }));
        scheduleSave();
      },
      updateGeneral: (patch) => {
        setState('general', (prev) => ({ ...prev, ...patch }));
        scheduleSave();
      },
      updateLayout: (patch) => {
        const normalizedPatch: Partial<LayoutSetting> = { ...patch };
        if ('showSearchbar' in patch) {
          normalizedPatch.showSearch = patch.showSearchbar;
        } else if ('showSearch' in patch) {
          normalizedPatch.showSearchbar = patch.showSearch;
        }
        setState('layout', (prev) => ({ ...prev, ...normalizedPatch }));
        scheduleSave();
      },
      updateSearch: (patch) => {
        setState('search', (prev) => ({ ...prev, ...patch }));
        scheduleSave();
      },
      updateShortcutAppearance: (patch) => {
        setState('shortcutAppereance', (prev) => ({ ...prev, ...patch }));
        scheduleSave();
      },
      updateWeather: (patch) => {
        setState('weather', (prev) => ({ ...prev, ...patch }));
        scheduleSave();
      },
      updateWidgetAppearance: ({ mode, patch }) => {
        setState(
          'widgetSetting',
          mode,
          produce((current) => {
            Object.assign(current, patch);
          }),
        );
        scheduleSave();
      },
    };

  return [state, actions] as const;
}

const FALLBACK_DEFAULT_SETTINGS: Setting = {
  background: {
    active: false,
    backdrop: {
      blur: '0px',
      brightness: '100%',
      saturate: '100%',
    },
    backdropActive: false,
    collections: ['11649432'],
    image: { author: '', next: '', origin: '', profile: '', src: '' },
    static:
      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80',
  },
  cache: {
    images: [],
  },
  clock: {
    showSeconds: false,
  },
  date: {
    date: '2-digit',
    month: 'long',
    weekday: 'long',
  },
  general: {
    favicon: '',
    locale: 'en',
    sync: false,
    theme: 'light',
    title: 'TabDash',
    username: 'User',
  },
  id: '0',
  layout: {
    canvasPositions: defaultPositions(),
    flowOrder: defaultFlowOrder(),
    gridSize: 5,
    mode: 'canvas',
    showClock: true,
    showDate: true,
    showGreeting: true,
    showSearch: true,
    showSearchbar: true,
    showShortcuts: true,
    showWeather: true,
    snapToGrid: true,
  },
  search: {
    engine: 'Startpage',
    focus: false,
    newTab: false,
  },
  shortcutAppereance: {
    elementsPerLine: 5,
    iconOnly: false,
    style: 'large',
  },
  shortcuts: [],
  weather: {
    showCity: true,
    showFeelsLike: false,
    showHumidity: false,
    showIcon: true,
    showMinMax: false,
    showText: false,
    showWind: false,
    unit: 'metric',
  },
  widgetSetting: {
    dark: {
      backdrop: {
        blur: '6px',
        brightness: '160%',
        saturate: '120%',
      },
      background: 'rgba(64, 64, 64, 0.4)',
      borderRadius: '12px',
      font: 'Calibri',
      shadow: 'rgba(0,0,0,0) 1px 2px 6px',
      textColor: '#ffffff',
      textSize: '16px',
      weight: '400',
    },
    light: {
      backdrop: {
        blur: '6px',
        brightness: '100%',
        saturate: '100%',
      },
      background: '#eeeeee',
      borderRadius: '12px',
      font: 'Calibri',
      shadow: 'rgba(0,0,0,0) 1px 2px 6px',
      textColor: '#000000',
      textSize: '12px',
      weight: '400',
    },
  },
};

export async function fetchDefaultSettings(): Promise<Setting> {
  try {
    const res = await fetch('/defaultSettings.json');
    if (res.ok) {
      return (await res.json()) as Setting;
    }
  } catch {
    // Ignore
  }
  return FALLBACK_DEFAULT_SETTINGS;
}

export function SettingsProvider(props: { initialSettings?: Setting; children: JSX.Element }) {
  const store = createSettingsStore(props.initialSettings ?? FALLBACK_DEFAULT_SETTINGS),
    [state, actions] = store;

  onMount(() => {
    void (async () => {
      // If not given initialSettings, load from storage
      if (!props.initialSettings) {
        const stored = await storageService.get<{ settings?: Setting }>('settings');
        if (stored.isOk() && stored.value?.settings) {
          const loaded = stored.value.settings;
          if (loaded.layout) {
            if (
              loaded.layout.showSearchbar === undefined &&
              loaded.layout.showSearch !== undefined
            ) {
              loaded.layout.showSearchbar = loaded.layout.showSearch;
            }
            if (
              loaded.layout.showSearch === undefined &&
              loaded.layout.showSearchbar !== undefined
            ) {
              loaded.layout.showSearch = loaded.layout.showSearchbar;
            }
          }
          actions.setSettings(loaded);
        } else {
          const def = await fetchDefaultSettings();
          actions.setSettings(def);
        }
      }

      // Check background rotation
      if (state.background.active) {
        const storedTime = await storageService.get<{ bgtimestamp?: number }>('bgtimestamp'),
          timestamp =
            storedTime.isOk() && typeof storedTime.value?.bgtimestamp === 'number'
              ? storedTime.value.bgtimestamp
              : 0,
          isExpired = Date.now() - timestamp > ROTATION_INTERVAL_MS;
        if (isExpired || !state.background.image?.src) {
          void actions.refreshImage();
        }
      }
    })();
  });

  return <SettingsContext.Provider value={store}>{props.children}</SettingsContext.Provider>;
}

export function useSettingsContext(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return ctx;
}
