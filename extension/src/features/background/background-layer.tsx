import { type Component, Show } from 'solid-js';
import type { BackgroundSetting } from '../../../types/settings';

export interface BackgroundLayerProps {
  background?: BackgroundSetting;
  backdrop?: {
    blur?: string;
    brightness?: string;
    saturate?: string;
  };
}

export const BackgroundLayer: Component<BackgroundLayerProps> = (props) => {
  const imageSrc = () => {
    const bg = props.background;
    if (!bg) return '';
    if (bg.active && bg.image?.src) {
      return bg.image.src;
    }
    if (bg.static) {
      return bg.static;
    }
    if (bg.image?.src) {
      return bg.image.src;
    }
    return '';
  };

  const hasImage = () => Boolean(imageSrc());
  const bgColor = () => props.background?.color || 'var(--backdrop-surface)';
  const nextSrc = () => {
    const bg = props.background;
    if (!bg?.active) return '';
    return bg.image?.next ?? '';
  };

  return (
    <div class="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none select-none">
      <Show
        when={hasImage()}
        fallback={<div class="w-full h-full" style={{ 'background-color': bgColor() }} />}
      >
        <img
          id="background"
          src={imageSrc()}
          alt="background"
          class="w-full h-full object-cover transition-opacity duration-700"
          style={{
            'background-color': props.background?.color,
          }}
        />
        <Show when={nextSrc()}>
          <img src={nextSrc()} class="hidden" loading="lazy" alt="" />
        </Show>
      </Show>

      <Show when={props.backdrop}>
        <div
          class="absolute inset-0 w-full h-full"
          style={{
            'backdrop-filter': `blur(${props.backdrop?.blur ?? '0px'}) saturate(${props.backdrop?.saturate ?? '100%'}) brightness(${props.backdrop?.brightness ?? '100%'})`,
          }}
        />
      </Show>
    </div>
  );
};
