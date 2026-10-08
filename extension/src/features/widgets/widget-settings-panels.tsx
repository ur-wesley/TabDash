import type { Component } from 'solid-js';
import type { DateFormat, LayoutMode, ShortcutStyle } from '../../../types/settings';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Slider } from '../../components/ui/slider';
import { Switch } from '../../components/ui/switch';
import { useI18n } from '../../i18n';
import { useSettingsContext } from '../settings/settings-context';
import {
  SEARCH_ENGINE_OPTIONS,
  shortcutStyleOptions,
  weatherUnitOptions,
} from '../settings/setting-options';

export const ClockDatePanel: Component = () => {
  const { t } = useI18n();
  const [state, actions] = useSettingsContext();
  return (
    <div class="flex flex-col gap-1">
      <Switch
        label={t('show clock')}
        checked={state.layout.showClock}
        onChange={(v) => actions.updateLayout({ showClock: v })}
      />
      <Switch
        label={t('show date')}
        checked={state.layout.showDate}
        onChange={(v) => actions.updateLayout({ showDate: v })}
      />
      <Switch
        label={t('show seconds')}
        checked={state.clock.showSeconds}
        onChange={(v) => actions.updateClock({ showSeconds: v })}
      />
      <Select
        label={t('weekday')}
        value={state.date?.weekday ?? 'long'}
        options={[
          { value: 'long', name: t('long') },
          { value: 'short', name: t('short') },
          { value: 'narrow', name: t('narrow') },
        ]}
        onChange={(v) => actions.updateDate({ weekday: v as DateFormat })}
      />
      <Select
        label={t('day')}
        value={state.date?.date ?? '2-digit'}
        options={[
          { value: '2-digit', name: t('2-digit') },
          { value: 'numeric', name: t('numeric') },
        ]}
        onChange={(v) => actions.updateDate({ date: v as DateFormat })}
      />
      <Select
        label={t('month')}
        value={state.date?.month ?? 'long'}
        options={[
          { value: 'long', name: t('long') },
          { value: 'short', name: t('short') },
          { value: '2-digit', name: t('2-digit') },
          { value: 'numeric', name: t('numeric') },
        ]}
        onChange={(v) => actions.updateDate({ month: v as DateFormat })}
      />
      <Select
        label={t('layout mode')}
        value={state.layout.mode ?? 'canvas'}
        options={[
          { value: 'canvas', name: t('free canvas') },
          { value: 'flow', name: t('flow order') },
        ]}
        onChange={(v) => actions.updateLayout({ mode: v as LayoutMode })}
      />
    </div>
  );
};

export const GreetingPanel: Component = () => {
  const { t } = useI18n();
  const [state, actions] = useSettingsContext();
  return (
    <div class="flex flex-col gap-1">
      <Input
        label={t('name')}
        value={state.general.username ?? ''}
        onInput={(e) => actions.updateGeneral({ username: e.currentTarget.value })}
      />
      <Switch
        label={t('show greeting')}
        checked={state.layout.showGreeting}
        onChange={(v) => actions.updateLayout({ showGreeting: v })}
      />
    </div>
  );
};

export const WeatherPanel: Component = () => {
  const { t } = useI18n();
  const [state, actions] = useSettingsContext();
  return (
    <div class="flex flex-col gap-1">
      <Select
        label={t('unit')}
        value={state.weather.unit}
        options={weatherUnitOptions(t)}
        onChange={(v) => actions.updateWeather({ unit: v as 'metric' | 'imperial' })}
      />
      <Switch
        label={t('show weather icon')}
        checked={state.weather.showIcon}
        onChange={(v) => actions.updateWeather({ showIcon: v })}
      />
      <Switch
        label={t('show weather text')}
        checked={state.weather.showText}
        onChange={(v) => actions.updateWeather({ showText: v })}
      />
      <Switch
        label={t('show city')}
        checked={state.weather.showCity ?? true}
        onChange={(v) => actions.updateWeather({ showCity: v })}
      />
      <Switch
        label={t('show feels like')}
        checked={state.weather.showFeelsLike ?? false}
        onChange={(v) => actions.updateWeather({ showFeelsLike: v })}
      />
      <Switch
        label={t('show min max')}
        checked={state.weather.showMinMax ?? false}
        onChange={(v) => actions.updateWeather({ showMinMax: v })}
      />
      <Switch
        label={t('show humidity')}
        checked={state.weather.showHumidity ?? false}
        onChange={(v) => actions.updateWeather({ showHumidity: v })}
      />
      <Switch
        label={t('show wind')}
        checked={state.weather.showWind ?? false}
        onChange={(v) => actions.updateWeather({ showWind: v })}
      />
    </div>
  );
};

export const SearchPanel: Component = () => {
  const { t } = useI18n();
  const [state, actions] = useSettingsContext();
  return (
    <div class="flex flex-col gap-1">
      <Select
        label={t('search engine')}
        value={state.search.engine}
        options={[...SEARCH_ENGINE_OPTIONS]}
        onChange={(v) => actions.updateSearch({ engine: v })}
      />
      <Switch
        label={t('auto focus')}
        checked={state.search.focus}
        onChange={(v) => actions.updateSearch({ focus: v })}
      />
      <Switch
        label={t('new tab')}
        checked={state.search.newTab}
        onChange={(v) => actions.updateSearch({ newTab: v })}
      />
    </div>
  );
};

export const ShortcutsPanel: Component = () => {
  const { t } = useI18n();
  const [state, actions] = useSettingsContext();
  return (
    <div class="flex flex-col gap-1">
      <Select
        label={t('style')}
        value={state.shortcutAppereance.style}
        options={shortcutStyleOptions(t)}
        onChange={(v) => actions.updateShortcutAppearance({ style: v as ShortcutStyle })}
      />
      <Slider
        label={t('columns')}
        min={1}
        max={10}
        showValue
        value={state.shortcutAppereance.elementsPerLine ?? state.shortcutAppereance.col ?? 4}
        onChange={(v) => actions.updateShortcutAppearance({ elementsPerLine: v, col: v })}
      />
      <Switch
        label={t('icon only')}
        checked={state.shortcutAppereance.iconOnly}
        onChange={(v) => actions.updateShortcutAppearance({ iconOnly: v })}
      />
    </div>
  );
};
