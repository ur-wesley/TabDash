import type { Accessor } from 'solid-js';
import type { CanvasWidgetConfig } from '../../components/canvas/CanvasContainer';
import { ClockWidget } from '../clock/clock-widget';
import { GreetingWidget } from '../greeting/greeting-widget';
import { SearchBar } from '../search/search-bar';
import { useSettingsContext } from '../settings/settings-context';
import { ShortcutGrid } from '../shortcuts/shortcut-grid';
import { useWeatherContext } from '../weather/weather-context';
import { WeatherWidget } from '../weather/weather-widget';
import { WidgetContextMenu } from '../widgets/widget-context-menu';
import {
  ClockDatePanel,
  GreetingPanel,
  SearchPanel,
  ShortcutsPanel,
  WeatherPanel,
} from '../widgets/widget-settings-panels';
import { useI18n } from '../../i18n';

/** Builds the widget configs for the canvas from settings + weather state. */
export function useDashboardWidgets(
  isEditingLayout: Accessor<boolean>,
): () => CanvasWidgetConfig[] {
  const { t } = useI18n(),
    [state] = useSettingsContext(),
    [weatherState] = useWeatherContext();

  return () => [
    {
      content: (
        <WidgetContextMenu
          title={t('clock and date') || 'Clock & Date'}
          disabled={isEditingLayout()}
          content={<ClockDatePanel />}
        >
          <ClockWidget
            locale={state.general?.locale ?? 'en'}
            clockSetting={state.clock}
            dateSetting={state.date}
            showTime={state.layout?.showClock}
            showDate={state.layout?.showDate}
          />
        </WidgetContextMenu>
      ),
      id: 'clock',
      label: t('clock and date') || 'Clock & Date',
      visible: state.layout?.showClock || state.layout?.showDate,
    },
    {
      content: (
        <WidgetContextMenu
          title={t('greeting') || 'Greeting'}
          disabled={isEditingLayout()}
          content={<GreetingPanel />}
        >
          <GreetingWidget name={state.general?.username} />
        </WidgetContextMenu>
      ),
      id: 'greeting',
      label: t('greeting') || 'Greeting',
      visible: state.layout?.showGreeting,
    },
    {
      content: (
        <WidgetContextMenu
          title={t('weather') || 'Weather'}
          disabled={isEditingLayout()}
          content={<WeatherPanel />}
        >
          <WeatherWidget
            setting={state.weather}
            data={weatherState().data}
            loading={weatherState().status === 'loading'}
            error={weatherState().error}
          />
        </WidgetContextMenu>
      ),
      id: 'weather',
      label: t('weather') || 'Weather',
      visible: state.layout?.showWeather,
    },
    {
      content: (
        <WidgetContextMenu
          title={t('search') || 'Search'}
          disabled={isEditingLayout()}
          content={<SearchPanel />}
        >
          <SearchBar settings={state.search} />
        </WidgetContextMenu>
      ),
      id: 'searchbar',
      label: t('search') || 'Search',
      visible: state.layout?.showSearchbar,
    },
    {
      content: (
        <WidgetContextMenu
          title={t('shortcuts') || 'Shortcuts'}
          disabled={isEditingLayout()}
          content={<ShortcutsPanel />}
        >
          <ShortcutGrid />
        </WidgetContextMenu>
      ),
      id: 'shortcuts',
      label: t('shortcuts') || 'Shortcuts',
      visible: state.layout?.showShortcuts,
    },
  ];
}
