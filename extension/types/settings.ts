type AvailableLanguages = 'de' | 'en';

interface Setting {
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

interface GeneralSetting {
  theme: Theme;
  locale: AvailableLanguages;
  username: string;
  sync: boolean;
  favicon: string;
  title: string;
}

interface BackgroundSetting {
  active: boolean;
  backdropActive: boolean;
  backdrop: BackdropSetting;
  collections: string[];
  color?: string;
  static?: string;
  image: BackgroundData;
}

interface BackgroundData {
  src: string;
  next: string;
  author: string;
  origin: string;
  profile: string;
}

interface BackdropSetting {
  blur: string;
  saturate: string;
  brightness: string;
}

interface ClockSetting {
  showSeconds: boolean;
}

interface DateSetting {
  weekday: DateFormat;
  date: DateFormat;
  month: DateFormat;
}

type WidgetId = 'clock' | 'greeting' | 'weather' | 'searchbar' | 'shortcuts';

interface WidgetCanvasPosition {
  x: number;
  y: number;
}

type LayoutMode = 'canvas' | 'flow';

interface LayoutSetting {
  showClock: boolean;
  showDate: boolean;
  showGreeting: boolean;
  showSearchbar: boolean;
  showSearch?: boolean;
  showShortcuts: boolean;
  showWeather: boolean;
  mode?: LayoutMode;
  snapToGrid?: boolean;
  gridSize?: number;
  canvasPositions?: Record<WidgetId, WidgetCanvasPosition>;
  flowOrder?: WidgetId[];
}

interface ShortcutAppereance {
  style: ShortcutStyle;
  elementsPerLine: number;
  col?: number;
  iconOnly?: boolean;
}

interface ShortcutSetting {
  name: string;
  icon: string;
  link: string;
  newTab?: boolean;
}

interface WeatherSetting {
  unit: WeatherUnit;
  showIcon: boolean;
  showText: boolean;
  showCity?: boolean;
  showHumidity?: boolean;
  showWind?: boolean;
  showFeelsLike?: boolean;
  showMinMax?: boolean;
}

interface SearchSetting {
  focus: boolean;
  newTab: boolean;
  engine: string;
}

interface WidgetSetting {
  light: WidgetAppereance;
  dark: WidgetAppereance;
}

interface WidgetAppereance {
  textColor: string;
  textSize: string;
  background: string;
  borderRadius: string;
  shadow: string;
  font: string;
  weight: string;
  backdrop: BackdropSetting;
}

interface UnsplashImage {
  id?: string;
  links: {
    download_location: string;
    html: string;
  };
  urls: {
    raw: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

interface CacheSetting {
  images: UnsplashImage[];
}

const theme = ['light', 'dark', 'system', 'automatic'] as const;

type Theme = (typeof theme)[number];

type WeatherUnit = 'metric' | 'imperial';

type DateFormat = 'long' | '2-digit' | 'short' | 'narrow' | 'numeric';

type ShortcutStyle = 'large' | 'medium' | 'small' | 'text';

export type {
  AvailableLanguages,
  BackdropSetting,
  BackgroundData,
  BackgroundSetting,
  CacheSetting,
  ClockSetting,
  DateFormat,
  DateSetting,
  GeneralSetting,
  LayoutMode,
  LayoutSetting,
  SearchSetting,
  Setting,
  ShortcutAppereance,
  ShortcutSetting,
  ShortcutStyle,
  Theme,
  UnsplashImage,
  WeatherSetting,
  WeatherUnit,
  WidgetAppereance,
  WidgetCanvasPosition,
  WidgetId,
  WidgetSetting,
};
export { theme };
