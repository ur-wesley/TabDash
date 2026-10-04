import { Slider as KobalteSlider } from '@kobalte/core/slider';
import { type Component, Show } from 'solid-js';

export interface SliderProps {
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly value: number;
  readonly onChange: (value: string) => void;
  readonly showValue?: boolean;
  readonly disabled?: boolean;
}

const Slider: Component<SliderProps> = (props) => {
  return (
    <KobalteSlider
      class="w-full flex items-center justify-between gap-4 my-3 z-20"
      minValue={props.min}
      maxValue={props.max}
      step={props.step ?? 1}
      value={[props.value]}
      onChange={(values) => {
        const val = values[0];
        if (val !== undefined) {
          props.onChange(val.toString());
        }
      }}
      disabled={props.disabled}
    >
      <div class="flex items-center justify-between gap-2">
        <KobalteSlider.Label class="label cursor-pointer">{props.label}</KobalteSlider.Label>
        <Show when={props.showValue}>
          <KobalteSlider.ValueLabel class="text-sm font-medium color-base" />
        </Show>
      </div>
      <KobalteSlider.Track class="relative w-full max-w-45 h-3 surface-base rounded-full cursor-pointer flex items-center">
        <KobalteSlider.Fill class="h-full bg-blue-500 rounded-full" />
        <KobalteSlider.Thumb class="block w-5 h-5 bg-base rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform focus-visible:outline-2 focus-visible:outline-blue-500">
          <KobalteSlider.Input />
        </KobalteSlider.Thumb>
      </KobalteSlider.Track>
    </KobalteSlider>
  );
};

export default Slider;
