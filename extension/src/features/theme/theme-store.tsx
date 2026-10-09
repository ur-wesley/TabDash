import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js';
import type { Accessor, Component, JSX } from 'solid-js';
import type { Theme } from '../../../types/settings';
import { useSettingsContext } from '../settings/settings-context';
import { useWeatherContext } from '../weather/weather-context';

export type ResolvedTheme = 'light' | 'dark';

export interface ThemeEnv {
  readonly systemDark: boolean;
  readonly nightByWeather: boolean;
}

/**
 * Pure mapping from the configured theme + environment to the effective
 * color mode. Mirrors the previous `applyTheme` logic in `App.tsx`:
 * `system` follows the OS, `automatic` follows local night time when
 * weather data is available, otherwise it stays light.
 */
export function resolveEffectiveTheme(theme: Theme, env: ThemeEnv): ResolvedTheme {
  switch (theme) {
    case 'dark': {
      return 'dark';
    }
    case 'system': {
      return env.systemDark ? 'dark' : 'light';
    }
    case 'automatic': {
      return env.nightByWeather ? 'dark' : 'light';
    }
    case 'light':
    default: {
      return 'light';
    }
  }
}

export function isNightByWeather(
  additional?: { sunrise: number; sunset: number },
  now: number = Date.now(),
): boolean {
  if (!additional) {
    return false;
  }
  return now > additional.sunset * 1000 || now < additional.sunrise * 1000;
}

export interface ThemeContextValue {
  /** The configured theme (`light` | `dark` | `system` | `automatic`). */
  readonly theme: Accessor<Theme>;
  /** The effective color mode after resolving `system` / `automatic`. */
  readonly resolvedTheme: Accessor<ResolvedTheme>;
  readonly setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>();

function useSystemDark(): Accessor<boolean> {
  const [systemDark, setSystemDark] = createSignal(
      typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches,
    ),
    onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);

  onMount(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    query.addEventListener('change', onChange);
    onCleanup(() => {
      query.removeEventListener('change', onChange);
    });
  });

  return systemDark;
}

/**
 * Global theme store. Must be mounted below `SettingsProvider` and
 * `WeatherProvider` (see `WeatherRoot` in `App.tsx`). Owns the `.dark` /
 * `.light` class on `documentElement`, which also drives the UnoCSS `dark:`
 * variants and the `--tab-*` token overrides.
 */
export const ThemeProvider: Component<{ children: JSX.Element }> = (props) => {
  const [settings, settingsActions] = useSettingsContext(),
    [weatherState] = useWeatherContext(),
    systemDark = useSystemDark(),
    nightByWeather = createMemo(() =>
      isNightByWeather(weatherState().data?.additional ?? undefined),
    ),
    resolvedTheme = createMemo<ResolvedTheme>(() =>
      resolveEffectiveTheme(settings.general?.theme ?? 'light', {
        nightByWeather: nightByWeather(),
        systemDark: systemDark(),
      }),
    );

  createEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const mode = resolvedTheme();
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(mode);
  });

  const value: ThemeContextValue = {
    resolvedTheme,
    setTheme: (theme) => {
      settingsActions.setTheme(theme);
    },
    theme: () => settings.general?.theme ?? 'light',
  };

  return <ThemeContext.Provider value={value}>{props.children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
