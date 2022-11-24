import { AvailableLanguages } from "../src/lang.js";

export interface Setting {
  id: string;
  general: GeneralSetting;
  background: BackgroundSetting;
  shortcutAppereance: ShortcutAppereance;
  shortcuts: ShortcutSetting[];
  layout: LayoutSetting;
  clock: ClockSetting;
  date: DateSetting;
  weather: WeatherSetting;
}

export interface GeneralSetting {
  theme: Theme;
  locale: AvailableLanguages;
  username: string;
  sync: boolean;
  favicon: string;
  title: string;
}

export interface BackgroundSetting {
  active: boolean;
  backdropActive: boolean;
  backdrop: BackdropSetting;
  collections: string[];
  color?: string;
  static?: string;
  image: BackgroundData;
}

export interface BackgroundData {
  src: string;
  author: string;
  origin: string;
  profile: string;
}

export interface BackdropSetting {
  blur: string;
  saturate: string;
  brightness: string;
}

export interface ClockSetting {
  showSeconds: boolean;
}

export interface DateSetting {
  weekday: DateFormat;
  date: DateFormat;
  month: DateFormat;
}

export interface LayoutSetting {
  showClock: boolean;
  showDate: boolean;
  showGreeting: boolean;
  showSearchbar: boolean;
  showShortcuts: boolean;
  showWeather: boolean;
}

export interface ShortcutAppereance {
  style: ShortcutStyle;
  elementsPerLine: number;
  iconOnly?: boolean;
}

export interface ShortcutSetting {
  name: string;
  icon: string;
  link: string;
  newTab?: boolean;
}

export interface WeatherSetting {
  unit: WeatherUnit;
  showIcon: boolean;
  showText: boolean;
}

export type Theme = "light" | "dark";
export type WeatherUnit = "metric" | "imperial";
export type DateFormat = "long" | "2-digit" | "short";
export type ShortcutStyle = "large" | "medium" | "small" | "text";
