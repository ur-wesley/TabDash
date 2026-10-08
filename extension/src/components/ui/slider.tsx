import { Slider as KobalteSlider } from '@kobalte/core/slider';
import { Show, splitProps } from 'solid-js';
import { cn } from '../../lib/utils';

export interface SliderProps {
  id?: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  showValue?: boolean;
  disabled?: boolean;
  class?: string;
}

export function Slider(props: SliderProps) {
  const [local, others] = splitProps(props, [
    'id',
    'label',
    'min',
    'max',
    'step',
    'value',
    'onChange',
    'showValue',
    'disabled',
    'class',
  ]);

  return (
    <KobalteSlider
      id={local.id}
      class={cn('w-full min-w-0 flex items-center justify-between gap-3 py-1', local.class)}
      minValue={local.min ?? 0}
      maxValue={local.max ?? 100}
      step={local.step ?? 1}
      value={[local.value]}
      onChange={(values) => {
        const val = values[0];
        if (val !== undefined) {
          local.onChange(val);
        }
      }}
      disabled={local.disabled}
      {...others}
    >
      <div class="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
        <Show when={local.label}>
          <KobalteSlider.Label class="text-xs sm:text-sm font-medium text-[var(--fg-label)] cursor-pointer select-none truncate">
            {local.label}
          </KobalteSlider.Label>
        </Show>
        <Show when={local.showValue}>
          <KobalteSlider.ValueLabel class="text-[11px] text-[var(--fg-faint)] font-mono shrink-0 ml-1" />
        </Show>
      </div>

      <KobalteSlider.Track class="relative w-28 sm:w-36 max-w-[45%] h-1.5 bg-[var(--track)] rounded-full cursor-pointer flex items-center shrink-0">
        <KobalteSlider.Fill class="h-full bg-[var(--primary)] rounded-full" />
        <KobalteSlider.Thumb class="block w-3.5 h-3.5 bg-[var(--thumb)] rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform focus-visible:outline-2 focus-visible:outline-[var(--ring)]">
          <KobalteSlider.Input />
        </KobalteSlider.Thumb>
      </KobalteSlider.Track>
    </KobalteSlider>
  );
}
