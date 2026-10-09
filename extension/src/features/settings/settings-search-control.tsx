import { Show } from 'solid-js';
import type { Component } from 'solid-js';
import type { AvailableLanguages } from '../../lang';
import type { ShortcutStyle } from '../../../types/settings';
import { Button } from '../../components/ui/button';
import { ColorPicker } from '../../components/ui/color-picker';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import type { SelectOption } from '../../components/ui/select';
import { Slider } from '../../components/ui/slider';
import { Switch } from '../../components/ui/switch';
import { useI18n } from '../../i18n';
import { useSettingsContext } from './settings-context';

export interface SettingsSearchControlProps {
  id: string;
  name: string;
  category: 'general' | 'widgets' | 'appearance' | 'management';
  onSelectTab: (tab: string) => void;
  onClear: () => void;
  languageOptions: readonly SelectOption[];
  themeOptions: readonly SelectOption[];
  searchEngineOptions: readonly SelectOption[];
  weatherUnitOptions: readonly SelectOption[];
  shortcutStyleOptions: readonly SelectOption[];
}

export const SettingsSearchControl: Component<SettingsSearchControlProps> = (props) => {
  const { t, setLocale } = useI18n(),
    [state, actions] = useSettingsContext();

  return (
    <div class="w-full">
      <Show when={props.id === 'language'}>
        <Select
          label={t('language')}
          value={state.general.locale}
          options={props.languageOptions}
          onChange={(val) => {
            actions.updateGeneral({ locale: val as AvailableLanguages });
            setLocale(val as AvailableLanguages);
          }}
        />
      </Show>

      <Show when={props.id === 'theme'}>
        <Select
          label={t('theme')}
          value={state.general.theme}
          options={props.themeOptions}
          onChange={(val) => {
            actions.updateGeneral({
              theme: val as 'automatic' | 'light' | 'dark',
            });
          }}
        />
      </Show>

      <Show when={props.id === 'sync'}>
        <Switch
          label={t('sync')}
          checked={state.general.sync}
          onChange={(val) => {
            actions.updateGeneral({ sync: val });
          }}
        />
      </Show>

      <Show when={props.id === 'bg-active'}>
        <Switch
          label={t('bg active')}
          checked={state.background.active}
          onChange={(val) => {
            actions.updateBackground({ active: val });
          }}
        />
      </Show>

      <Show when={props.id === 'collections'}>
        <Input
          label={t('collections')}
          value={state.background.collections?.join(', ') ?? ''}
          onInput={(e) => {
            actions.updateBackground({
              collections: e.currentTarget.value
                .split(',')
                .map((i) => i.trim())
                .filter(Boolean),
            });
          }}
        />
      </Show>

      <Show when={props.id === 'static-img'}>
        <Input
          label={t('static img')}
          value={state.background.static ?? ''}
          onInput={(e) => {
            actions.updateBackground({ static: e.currentTarget.value });
          }}
        />
      </Show>

      <Show when={props.id === 'color'}>
        <ColorPicker
          label={t('color')}
          value={state.background.color ?? '#000000'}
          onChange={(color) => {
            actions.updateBackground({ color });
          }}
        />
      </Show>

      <Show when={props.id === 'backdrop'}>
        <div class="flex flex-col gap-2">
          <Switch
            label={t('backdrop')}
            checked={state.background.backdropActive}
            onChange={(val) => {
              actions.updateBackground({ backdropActive: val });
            }}
          />
          <Show when={state.background.backdropActive}>
            <Slider
              label={t('blur')}
              min={0}
              max={50}
              value={Number.parseInt(state.background.backdrop?.blur || '0', 10) || 0}
              onChange={(val) => {
                actions.updateBackground({
                  backdrop: { ...state.background.backdrop, blur: `${val}px` },
                });
              }}
              showValue
            />
          </Show>
        </div>
      </Show>

      <Show when={props.id === 'show-clock'}>
        <Switch
          label={t('show clock')}
          checked={state.layout.showClock}
          onChange={(val) => {
            actions.updateLayout({ showClock: val });
          }}
        />
      </Show>

      <Show when={props.id === 'show-date'}>
        <Switch
          label={t('show date')}
          checked={state.layout.showDate}
          onChange={(val) => {
            actions.updateLayout({ showDate: val });
          }}
        />
      </Show>

      <Show when={props.id === 'show-seconds'}>
        <Switch
          label={t('show seconds')}
          checked={state.clock.showSeconds}
          onChange={(val) => {
            actions.updateClock({ showSeconds: val });
          }}
        />
      </Show>

      <Show when={props.id === 'show-weather'}>
        <Switch
          label={t('show weather')}
          checked={state.layout.showWeather}
          onChange={(val) => {
            actions.updateLayout({ showWeather: val });
          }}
        />
      </Show>

      <Show when={props.id === 'unit' || props.id === 'weatherUnit'}>
        <Select
          label={t('unit')}
          value={state.weather.unit}
          options={props.weatherUnitOptions}
          onChange={(val) => {
            actions.updateWeather({ unit: val as 'metric' | 'imperial' });
          }}
        />
      </Show>

      <Show when={props.id === 'weather-icon' || props.id === 'weatherIcon'}>
        <Switch
          label={t('show weather icon')}
          checked={state.weather.showIcon}
          onChange={(val) => {
            actions.updateWeather({ showIcon: val });
          }}
        />
      </Show>

      <Show when={props.id === 'weather-text' || props.id === 'weatherText'}>
        <Switch
          label={t('show weather text')}
          checked={state.weather.showText}
          onChange={(val) => {
            actions.updateWeather({ showText: val });
          }}
        />
      </Show>

      <Show when={props.id === 'weather-city' || props.id === 'weatherCity'}>
        <Switch
          label={t('show city')}
          checked={state.weather.showCity ?? true}
          onChange={(val) => {
            actions.updateWeather({ showCity: val });
          }}
        />
      </Show>

      <Show when={props.id === 'weather-feels-like' || props.id === 'weatherFeelsLike'}>
        <Switch
          label={t('show feels like')}
          checked={state.weather.showFeelsLike ?? false}
          onChange={(val) => {
            actions.updateWeather({ showFeelsLike: val });
          }}
        />
      </Show>

      <Show when={props.id === 'weather-min-max' || props.id === 'weatherMinMax'}>
        <Switch
          label={t('show min max')}
          checked={state.weather.showMinMax ?? false}
          onChange={(val) => {
            actions.updateWeather({ showMinMax: val });
          }}
        />
      </Show>

      <Show when={props.id === 'weather-humidity' || props.id === 'weatherHumidity'}>
        <Switch
          label={t('show humidity')}
          checked={state.weather.showHumidity ?? false}
          onChange={(val) => {
            actions.updateWeather({ showHumidity: val });
          }}
        />
      </Show>

      <Show when={props.id === 'weather-wind' || props.id === 'weatherWind'}>
        <Switch
          label={t('show wind')}
          checked={state.weather.showWind ?? false}
          onChange={(val) => {
            actions.updateWeather({ showWind: val });
          }}
        />
      </Show>

      <Show when={props.id === 'show-search' || props.id === 'showSearchbar'}>
        <Switch
          label={t('show searchbar')}
          checked={state.layout.showSearchbar}
          onChange={(val) => {
            actions.updateLayout({ showSearchbar: val });
          }}
        />
      </Show>

      <Show when={props.id === 'search-engine'}>
        <Select
          label={t('search engine')}
          value={state.search.engine}
          options={props.searchEngineOptions}
          onChange={(val) => {
            actions.updateSearch({ engine: val });
          }}
        />
      </Show>

      <Show when={props.id === 'auto-focus'}>
        <Switch
          label={t('auto focus')}
          checked={state.search.focus}
          onChange={(val) => {
            actions.updateSearch({ focus: val });
          }}
        />
      </Show>

      <Show when={props.id === 'show-shortcuts'}>
        <Switch
          label={t('show shortcuts')}
          checked={state.layout.showShortcuts}
          onChange={(val) => {
            actions.updateLayout({ showShortcuts: val });
          }}
        />
      </Show>

      <Show when={props.id === 'shortcut-style'}>
        <Select
          label={t('style')}
          value={state.shortcutAppereance.style}
          options={props.shortcutStyleOptions}
          onChange={(val) => {
            actions.updateShortcutAppearance({ style: val as ShortcutStyle });
          }}
        />
      </Show>

      <Show when={props.id === 'shortcut-columns'}>
        <Slider
          label={t('columns')}
          min={1}
          max={10}
          showValue
          value={state.shortcutAppereance.elementsPerLine ?? state.shortcutAppereance.col ?? 4}
          onChange={(elementsPerLine) => {
            actions.updateShortcutAppearance({ col: elementsPerLine, elementsPerLine });
          }}
        />
      </Show>

      <Show when={props.id === 'shortcut-icon-only'}>
        <Switch
          label={t('icon only')}
          checked={state.shortcutAppereance.iconOnly}
          onChange={(val) => {
            actions.updateShortcutAppearance({ iconOnly: val });
          }}
        />
      </Show>

      <Show when={props.id === 'show-greeting'}>
        <Switch
          label={t('show greeting')}
          checked={state.layout.showGreeting}
          onChange={(val) => {
            actions.updateLayout({ showGreeting: val });
          }}
        />
      </Show>

      <Show when={props.id === 'appearance' || props.id === 'management'}>
        <div class="flex items-center justify-between pt-1">
          <span class="text-xs text-slate-600 dark:text-zinc-300">{props.name}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              props.onSelectTab(props.category);
              props.onClear();
            }}
          >
            {t(props.category)}
          </Button>
        </div>
      </Show>
    </div>
  );
};
