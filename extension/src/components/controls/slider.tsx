import { Component, createSignal, Show } from "solid-js";

const Slider: Component<Prop> = (props) => {
  const [value, setValue] = createSignal(props.value.toString() ?? "");
  return (
    <div class="w-full flex items-center justify-between gap-4 my-3 z-20">
      <label for="step" class="label">
        {props.label}
      </label>
      <Show when={props.showValue ?? false}>
        <span>{value}</span>
      </Show>
      <input
        type="range"
        min={props.min}
        step={props.step}
        max={props.max}
        value={props.value}
        class="w-full h-4 surface-base appearance-none block max-w-45 rounded-lg cursor-pointer"
        onChange={(e) => {
          props.onChange(e.currentTarget.value);
        }}
        onInput={(e) => {
          if (props.showValue) setValue(e.currentTarget.value);
        }}
      />
    </div>
  );
};

export default Slider;

interface Prop {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: string) => void;
  showValue?: boolean;
}
