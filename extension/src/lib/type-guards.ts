import type {
  DateFormat,
  LayoutMode,
  Setting,
  ShortcutStyle,
  Theme,
  WeatherUnit,
} from '../../types/settings';
import type { AvailableLanguages } from '../lang';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value),
  isStorageRecord = (value: unknown): value is Record<string, unknown> => isPlainObject(value),
  DATE_FORMATS: readonly DateFormat[] = ['long', '2-digit', 'short', 'narrow', 'numeric'],
  toDateFormat = (value: string, fallback: DateFormat): DateFormat => {
    for (const format of DATE_FORMATS) {
      if (format === value) {
        return format;
      }
    }
    return fallback;
  },
  toLayoutMode = (value: string, fallback: LayoutMode = 'canvas'): LayoutMode => {
    if (value === 'canvas' || value === 'flow') {
      return value;
    }
    return fallback;
  },
  toWeatherUnit = (value: string, fallback: WeatherUnit = 'metric'): WeatherUnit => {
    if (value === 'metric' || value === 'imperial') {
      return value;
    }
    return fallback;
  },
  toShortcutStyle = (value: string, fallback: ShortcutStyle): ShortcutStyle => {
    if (value === 'large' || value === 'medium' || value === 'small' || value === 'text') {
      return value;
    }
    return fallback;
  },
  isSetting = (value: unknown): value is Setting => {
    if (!isPlainObject(value)) {
      return false;
    }
    return isPlainObject(value.general) && isPlainObject(value.layout);
  },
  readFiniteNumber = (value: unknown): number | undefined =>
    typeof value === 'number' && Number.isFinite(value) ? value : undefined,
  readString = (value: unknown): string | undefined =>
    typeof value === 'string' ? value : undefined,
  THEMES: readonly Theme[] = ['automatic', 'light', 'dark'],
  toTheme = (value: string, fallback: Theme = 'automatic'): Theme => {
    for (const theme of THEMES) {
      if (theme === value) {
        return theme;
      }
    }
    return fallback;
  },
  toAvailableLanguage = (
    value: string,
    allowed: readonly AvailableLanguages[],
    fallback: AvailableLanguages,
  ): AvailableLanguages => {
    for (const language of allowed) {
      if (language === value) {
        return language;
      }
    }
    return fallback;
  },
  isPartialSetting = (value: unknown): value is Partial<Setting> => isPlainObject(value);

export {
  isPartialSetting,
  isPlainObject,
  isSetting,
  isStorageRecord,
  readFiniteNumber,
  readString,
  toAvailableLanguage,
  toDateFormat,
  toLayoutMode,
  toShortcutStyle,
  toTheme,
  toWeatherUnit,
};
