import { ColorArea } from '@kobalte/core/color-area';
import { ColorSlider } from '@kobalte/core/color-slider';
import { type Color, parseColor } from '@kobalte/core/colors';
import { Popover } from '@kobalte/core/popover';
import {
  type Component,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  splitProps,
} from 'solid-js';
import { cn } from '../../lib/utils';

export interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  side?: 'left' | 'right' | 'top' | 'bottom';
  class?: string;
  id?: string;
}

function safeParse(value: string): Color {
  try {
    return parseColor(value);
  } catch {
    return parseColor('#000000');
  }
}

/** Emit `hex` when opaque, `hexa` only when transparent (backward compatible). */
function emitString(color: Color): string {
  try {
    return color.getChannelValue('alpha') >= 1 ? color.toString('hex') : color.toString('hexa');
  } catch {
    return color.toString('hex');
  }
}

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

const placementForSide = (side: ColorPickerProps['side']) => {
  switch (side) {
    case 'right':
      return 'right-start' as const;
    case 'top':
      return 'top' as const;
    case 'bottom':
      return 'bottom' as const;
    case 'left':
    default:
      return 'left-start' as const;
  }
};

export const ColorPicker: Component<ColorPickerProps> = (props) => {
  const [local, others] = splitProps(props, ['label', 'value', 'onChange', 'side', 'class', 'id']);
  const fieldId = () => local.id ?? `color-${createUniqueId()}`;

  const [color, setColor] = createSignal<Color>(safeParse(local.value));
  const [hexDraft, setHexDraft] = createSignal(local.value);
  const [hexTouched, setHexTouched] = createSignal(false);

  // Sync from parent (e.g. reset). Guard against echo loops.
  createEffect(() => {
    const next = local.value;
    const current = emitString(color());
    if (next !== current && (!hexTouched() || next !== hexDraft())) {
      setColor(safeParse(next));
      setHexDraft(next);
      setHexTouched(false);
    }
  });

  const commit = (next: Color) => {
    setColor(next);
    const out = emitString(next);
    setHexDraft(out);
    setHexTouched(false);
    if (out !== local.value) {
      local.onChange(out);
    }
  };

  const hue = createMemo(() => {
    try {
      return color().toFormat('hsb').getChannelValue('hue');
    } catch {
      return 0;
    }
  });

  const swatchBackground = createMemo(() => {
    try {
      return color().toString('css');
    } catch {
      return local.value;
    }
  });

  const hexError = createMemo(() => {
    const v = hexDraft().trim();
    if (!v) return 'Required';
    return HEX_RE.test(v) ? undefined : 'Use #rgb or #rrggbb';
  });

  const commitHex = () => {
    const v = hexDraft().trim();
    if (!HEX_RE.test(v)) return;
    // Expand #rgb / #rgba so Kobalte always sees a full value.
    const digits = v.slice(1);
    let full = v;
    if (digits.length === 3 || digits.length === 4) {
      full = `#${digits
        .split('')
        .map((digit) => digit + digit)
        .join('')}`;
    }
    try {
      commit(parseColor(full));
    } catch {
      // keep draft + error visible
    }
  };

  return (
    <Popover
      placement={placementForSide(local.side)}
      flip
      slide
      shift={8}
      gutter={8}
      overflowPadding={12}
      fitViewport
    >
      <div class={cn('flex justify-between items-center w-full min-w-0 py-1', local.class)}>
        <span class="text-xs sm:text-sm font-medium text-[var(--fg-label)] min-w-0 flex-1 mr-2 truncate">
          {local.label}
        </span>
        <Popover.Trigger
          id={fieldId()}
          class="h-5.5 w-10 shrink-0 rounded-md border border-[var(--border-swatch)] shadow-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition-transform active:scale-95 overflow-hidden"
          style={{ 'background-color': swatchBackground() }}
          aria-label={`${local.label}: ${local.value}`}
          {...others}
        >
          {/* checker shows through when alpha < 1 */}
          <span
            aria-hidden="true"
            class="block w-full h-full"
            style={{
              'background-image':
                'conic-gradient(var(--border-swatch) 25%, transparent 0 50%, var(--border-swatch) 0 75%, transparent 0)',
              'background-size': '8px 8px',
              'background-color': swatchBackground(),
            }}
          />
        </Popover.Trigger>
      </div>

      <Popover.Portal>
        <Popover.Content
          class="z-[70] w-60 rounded-xl border border-[var(--border-menu)] bg-[var(--surface)] text-[var(--fg-default)] shadow-xl p-3 flex flex-col gap-2.5 outline-none"
          aria-label={local.label}
        >
          <ColorArea
            value={color()}
            onChange={commit}
            colorSpace="hsb"
            xChannel="saturation"
            yChannel="brightness"
            class="relative w-full h-36 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] overflow-hidden border border-[var(--border-field)]"
            style={{ 'touch-action': 'none' }}
          >
            <ColorArea.Background
              class="absolute inset-0 rounded-lg"
              style={{ background: `hsl(${hue()}, 100%, 50%)` }}
            >
              {/* white (saturation) + black (brightness) overlays */}
              <span
                aria-hidden="true"
                class="absolute inset-0 rounded-lg pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)',
                }}
              />
            </ColorArea.Background>
            <ColorArea.Thumb
              class="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] cursor-crosshair"
              style={{ 'background-color': swatchBackground() }}
            />
            <ColorArea.HiddenInputX />
            <ColorArea.HiddenInputY />
          </ColorArea>

          <ColorSlider
            value={color()}
            onChange={commit}
            colorSpace="hsb"
            channel="hue"
            class="w-full flex items-center gap-2"
          >
            <ColorSlider.Track class="relative flex-1 h-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] cursor-pointer">
              <ColorSlider.Thumb class="block w-3.5 h-3.5 -mt-[3px] rounded-full border-2 border-white bg-[var(--thumb)] shadow-md cursor-grab active:cursor-grabbing outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                <ColorSlider.Input />
              </ColorSlider.Thumb>
            </ColorSlider.Track>
          </ColorSlider>

          <ColorSlider
            value={color()}
            onChange={commit}
            colorSpace="hsb"
            channel="alpha"
            class="w-full flex items-center gap-2"
          >
            <span
              aria-hidden="true"
              class="relative flex-1 h-2.5 rounded-full overflow-hidden border border-[var(--border-field)]"
              style={{
                'background-image':
                  'conic-gradient(var(--border-field) 25%, transparent 0 50%, var(--border-field) 0 75%, transparent 0)',
                'background-size': '10px 10px',
              }}
            >
              <ColorSlider.Track class="absolute inset-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-full cursor-pointer">
                <ColorSlider.Thumb class="block w-3.5 h-3.5 -mt-[3px] rounded-full border-2 border-white bg-[var(--thumb)] shadow-md cursor-grab active:cursor-grabbing outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                  <ColorSlider.Input />
                </ColorSlider.Thumb>
              </ColorSlider.Track>
            </span>
          </ColorSlider>

          <div class="flex items-center gap-2">
            <span
              aria-hidden="true"
              class="w-7 h-7 shrink-0 rounded-md border border-[var(--border-swatch)]"
              style={{
                'background-image':
                  'conic-gradient(var(--border-swatch) 25%, transparent 0 50%, var(--border-swatch) 0 75%, transparent 0)',
                'background-size': '8px 8px',
                'background-color': swatchBackground(),
              }}
            />
            <div class="flex flex-col gap-0.5 min-w-0 flex-1">
              <input
                value={hexDraft()}
                spellcheck={false}
                autocomplete="off"
                aria-label={`${local.label} hex value`}
                aria-invalid={hexError() !== undefined}
                class={cn(
                  'h-8 w-full min-w-0 rounded-lg border bg-[var(--field)] px-2 py-1 font-mono text-xs text-[var(--fg-strong)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                  hexError() ? 'border-[var(--border-error)]' : 'border-[var(--border-field)]',
                )}
                onInput={(e) => {
                  setHexDraft(e.currentTarget.value);
                  setHexTouched(true);
                }}
                onChange={commitHex}
                onBlur={commitHex}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitHex();
                  }
                }}
              />
              {hexError() && hexTouched() ? (
                <p class="text-[11px] text-[var(--fg-error)]">{hexError()}</p>
              ) : null}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
};
