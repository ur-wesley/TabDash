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
  search: SearchSetting;
  cache: CacheSetting;
  widgetSetting: WidgetSetting;
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
  next: string;
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

export interface SearchSetting {
  focus: boolean;
  newTab: boolean;
  engine: string;
}

export interface WidgetSetting {
  light: WidgetAppereance;
  dark: WidgetAppereance;
}

export interface WidgetAppereance {
  textColor: string;
  textSize: string;
  background: string;
  borderRadius: string;
  shadow: string;
  font: string;
  weight: string;
  backdrop: BackdropSetting;
}

export interface CacheSetting {
  images: any[];
}

export const theme = ["light", "dark", "system", "automatic"] as const;
export type Theme = (typeof theme)[number];

export type WeatherUnit = "metric" | "imperial";
export type DateFormat = "long" | "2-digit" | "short";
export type ShortcutStyle = "large" | "medium" | "small" | "text";
