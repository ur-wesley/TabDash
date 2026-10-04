import { type Component, Show } from 'solid-js';
import type { WeatherSetting } from '../../../types/settings.js';
import type { WeatherData } from '../../api/weather.js';

export interface WeatherWidgetProps {
  readonly setting: WeatherSetting;
  readonly data: WeatherData;
}

const WeatherWidget: Component<WeatherWidgetProps> = (props) => {
  return (
    <Show when={props.data?.weather}>
      <div class="flex flex-col items-center widget">
        <div class="flex items-center">
          <Show when={props.setting.showIcon && props.data.weather[0]?.icon}>
            <img
              class="bg-cover"
              src={`https://openweathermap.org/img/wn/${props.data.weather[0].icon}@2x.png`}
              alt="weather icon"
            />
          </Show>
          <span class="z-20 p-4 text-6xl text-bold">
            {Math.round(props.data.overview.temp)}
            {props.setting.unit === 'metric' ? '°C' : '°F'}
          </span>
        </div>
        <Show when={props.setting.showText && props.data.weather[0]?.description}>
          <span class="z-20 p-4 text-2xl">{props.data.weather[0].description}</span>
        </Show>
      </div>
    </Show>
  );
};

export default WeatherWidget;
