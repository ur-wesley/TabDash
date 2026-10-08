import { type JSX, createContext, createEffect, createSignal, onMount, useContext } from 'solid-js';
import type { WeatherUnit } from '../../../types/settings';
import {
  type WeatherData,
  WeatherService,
  normalizeWeatherLang,
} from '../../services/weather-service';

export interface WeatherState {
  data: WeatherData | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

export interface WeatherActions {
  refreshWeather: () => Promise<WeatherData | null>;
  updateParams: (unit: WeatherUnit, lang: string) => boolean;
}

export type WeatherContextValue = readonly [state: () => WeatherState, actions: WeatherActions];

const WeatherContext = createContext<WeatherContextValue>();

export function createWeatherStore(
  unit: WeatherUnit,
  lang: string,
  storage?: ConstructorParameters<typeof WeatherService>[2],
): WeatherContextValue {
  const service = new WeatherService(unit, lang, storage);
  const [state, setState] = createSignal<WeatherState>({
    data: null,
    status: 'idle',
    error: null,
  });

  // Pre-load cached weather immediately so old data is shown while fetching
  void service.getCachedWeather().then((res) => {
    if (res.isOk() && res.value) {
      setState((prev) => ({
        ...prev,
        data: prev.data ?? res.value,
      }));
    }
  });

  const refreshWeather = async (): Promise<WeatherData | null> => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    const res = await service.refreshWeather();
    if (res.isOk()) {
      setState({
        data: res.value,
        status: res.value ? 'success' : 'idle',
        error: null,
      });
      return res.value;
    } else {
      const errMsg = res.error?.message ?? 'Failed to fetch weather';
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: errMsg,
      }));
      return null;
    }
  };

  const updateParams = (nextUnit: WeatherUnit, nextLang: string): boolean => {
    return service.setParams(nextUnit, normalizeWeatherLang(nextLang));
  };

  return [state, { refreshWeather, updateParams }] as const;
}

export function WeatherProvider(props: {
  unit?: WeatherUnit;
  lang?: string;
  autoFetch?: boolean;
  children: JSX.Element;
}) {
  const store = createWeatherStore(props.unit ?? 'metric', props.lang ?? 'en');

  onMount(() => {
    if (props.autoFetch) {
      void store[1].refreshWeather();
    }
  });

  // Re-fetch with the correct OpenWeather `lang` (and `units`) when props change.
  // Bypasses the 10-minute cache via refreshWeather so the description is re-localized.
  // The first run is skipped because autoFetch onMount already covers initial load.
  let isFirstRun = true;
  createEffect(() => {
    const nextUnit = props.unit ?? 'metric';
    const nextLang = props.lang ?? 'en';
    if (isFirstRun) {
      isFirstRun = false;
      return;
    }
    if (store[1].updateParams(nextUnit, nextLang)) {
      void store[1].refreshWeather();
    }
  });

  return <WeatherContext.Provider value={store}>{props.children}</WeatherContext.Provider>;
}

export function useWeatherContext(): WeatherContextValue {
  const ctx = useContext(WeatherContext);
  if (!ctx) {
    throw new Error('useWeatherContext must be used within a WeatherProvider');
  }
  return ctx;
}
