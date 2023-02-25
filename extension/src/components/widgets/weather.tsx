import { Component, Show } from "solid-js";
import { WeatherSetting } from "../../../types/settings.js";
import { WeatherData } from "../../api/weather.js";

const WeatherWidget: Component<Prop> = (props) => {
  return (
    <Show when={props.data.weather}>
      <div class="flex flex-col items-center widget">
        <div class="flex items-center">
          <Show when={props.setting.showIcon}>
            <img
              class="bg-cover"
              src={`http://openweathermap.org/img/wn/${props.data.weather[0].icon}@2x.png`}
              alt="weather icon"
            />
          </Show>
          <span class="z-20 p-4 text-6xl text-bold">
            {Math.round(props.data.overview.temp)}
            {props.setting.unit == "metric" ? "°C" : "°F"}
          </span>
        </div>
        <Show when={props.setting.showText}>
          <span class="z-20 p-4 text-2xl">
            {props.data.weather[0].description}
          </span>
        </Show>
      </div>
    </Show>
  );
};

export default WeatherWidget;

interface Prop {
  setting: WeatherSetting;
  data: WeatherData;
}
