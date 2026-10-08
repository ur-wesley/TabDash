import { type Component, Show } from 'solid-js';
import type { WeatherSetting } from '../../../types/settings';
import type { WeatherData } from '../../services/weather-service';
import { useI18n } from '../../i18n';
import { owmIconToMdi } from './weather-icon';

export interface WeatherWidgetProps {
  setting?: WeatherSetting;
  data?: WeatherData | null;
  loading?: boolean;
  error?: string | null;
}

export const WeatherWidget: Component<WeatherWidgetProps> = (props) => {
  const { t } = useI18n();
  const weather = () => props.data?.weather?.[0];
  const unitSymbol = () => (props.setting?.unit === 'imperial' ? '°F' : '°C');
  const windUnit = () => (props.setting?.unit === 'imperial' ? 'mph' : 'm/s');

  const hasExtraMetrics = () =>
    Boolean(
      (props.setting?.showFeelsLike && props.data?.overview?.feels_like != null) ||
      (props.setting?.showMinMax &&
        props.data?.overview?.temp_min != null &&
        props.data?.overview?.temp_max != null) ||
      (props.setting?.showHumidity && props.data?.overview?.humidity != null) ||
      (props.setting?.showWind && props.data?.wind?.speed != null),
    );

  return (
    <div class="relative flex flex-col items-center widget p-3 select-none">
      <Show when={props.loading && !props.data}>
        <div class="flex items-center justify-center p-3">
          <span
            class="i-mdi-loading animate-spin text-xl text-zinc-300"
            aria-label={t('loading')}
          />
        </div>
      </Show>

      <Show when={!props.loading && props.error && !props.data}>
        <div class="flex items-center gap-2 p-2 text-xs text-red-400">
          <span class="i-mdi-alert-circle text-base" aria-hidden="true" />
          <span>{props.error}</span>
        </div>
      </Show>

      <Show when={props.data}>
        <Show when={props.loading}>
          <div
            class="absolute top-1.5 right-1.5 flex items-center p-1"
            title={t('updating weather')}
          >
            <span
              class="i-mdi-loading animate-spin text-xs text-zinc-400/80"
              aria-label={t('updating')}
            />
          </div>
        </Show>
        <Show when={(props.setting?.showCity ?? true) && props.data?.city}>
          <div
            class="flex items-center gap-1 text-xs tracking-wider uppercase mb-0.5 opacity-80"
            style={{ 'font-weight': 'var(--weight)' }}
          >
            <span class="i-mdi-map-marker text-xs opacity-75" aria-hidden="true" />
            <span>{props.data?.city}</span>
          </div>
        </Show>

        <div class="flex items-center">
          <Show when={props.setting?.showIcon && weather()?.icon}>
            <span
              class={`weather-icon text-6xl shrink-0 ${owmIconToMdi(weather()?.icon)}`}
              role="img"
              aria-label={weather()?.description ?? t('weather icon')}
            />
          </Show>
          <span
            class="p-2 text-5xl md:text-6xl tracking-tight"
            style={{ 'font-weight': 'var(--weight)' }}
          >
            {Math.round(props.data?.overview?.temp ?? 0)}
            {unitSymbol()}
          </span>
        </div>

        <Show when={props.setting?.showText && weather()?.description}>
          <span class="text-sm opacity-80 capitalize" style={{ 'font-weight': 'var(--weight)' }}>
            {weather()?.description}
          </span>
        </Show>

        <Show when={hasExtraMetrics()}>
          <div
            class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2 text-xs opacity-80"
            style={{ 'font-weight': 'var(--weight)' }}
          >
            <Show when={props.setting?.showFeelsLike && props.data?.overview?.feels_like != null}>
              <span class="flex items-center gap-1">
                <span class="opacity-75">{t('feels')}</span>
                <span>{Math.round(props.data?.overview?.feels_like ?? 0)}°</span>
              </span>
            </Show>

            <Show
              when={
                props.setting?.showMinMax &&
                props.data?.overview?.temp_min != null &&
                props.data?.overview?.temp_max != null
              }
            >
              <span class="flex items-center gap-1">
                <span>↓{Math.round(props.data?.overview?.temp_min ?? 0)}°</span>
                <span>↑{Math.round(props.data?.overview?.temp_max ?? 0)}°</span>
              </span>
            </Show>

            <Show when={props.setting?.showHumidity && props.data?.overview?.humidity != null}>
              <span class="flex items-center gap-1">
                <span class="i-mdi-water-percent text-sm" aria-hidden="true" />
                <span>{props.data?.overview?.humidity}%</span>
              </span>
            </Show>

            <Show when={props.setting?.showWind && props.data?.wind?.speed != null}>
              <span class="flex items-center gap-1">
                <span class="i-mdi-weather-windy text-sm" aria-hidden="true" />
                <span>
                  {Math.round(props.data?.wind?.speed ?? 0)} {windUnit()}
                </span>
              </span>
            </Show>
          </div>
        </Show>
      </Show>
    </div>
  );
};
