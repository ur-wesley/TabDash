import { createEffect, onCleanup, onMount } from 'solid-js';
import type { BackgroundSetting, WidgetAppereance } from '../../../types/settings.js';
import {
  resolveBackgroundColor,
  resolveBackgroundSource,
  sampleWallpaperRegion,
} from '../../api/wallpaperSampler.js';
import { parseColor } from '../../lib/colorContrast.js';
import { useSettingsContext } from '../settings/settings-context.js';
import { useTheme } from '../theme/theme-store.js';
import { autoWidgetTextColor } from './auto-contrast.js';

const DEBOUNCE_MS = 120;

/** Widgets are scoped to the dashboard canvas (excludes the settings gear button). */
function collectWidgetElements(): HTMLElement[] {
  if (typeof document === 'undefined') {
    return [];
  }
  const container = document.querySelector('[data-canvas-container]');
  if (!container) {
    return [];
  }
  return [...container.querySelectorAll<HTMLElement>('.widget')];
}

function snapshotSettings(state: {
  widgetSetting?: { light?: WidgetAppereance; dark?: WidgetAppereance };
  background?: BackgroundSetting;
}): {
  appearance: WidgetAppereance | undefined;
  background: BackgroundSetting | undefined;
  themeKey: 'light' | 'dark';
} {
  const themeClass =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';
  return {
    appearance: state.widgetSetting?.[themeClass],
    background: state.background,
    themeKey: themeClass,
  };
}

function fallbackUnderlying(background: BackgroundSetting | undefined): string {
  return resolveBackgroundColor(background) ?? '#808080';
}

/**
 * Per-widget automatic text contrast. Mount once (in `Dashboard`): for every
 * `.widget` inside the canvas it samples the wallpaper region behind the
 * element, composites the translucent widget background over it, and sets a
 * local `--textColor` override with the best-contrast color (white/black or
 * the user's color when it already wins).
 *
 * Re-runs on theme/appearance/background changes, background image loads,
 * resizes, and widget moves (dragging mutates ancestor style attributes).
 */
export function usePerWidgetAutoContrast(): void {
  const [state] = useSettingsContext(),
    // Subscribe to the resolved theme so appearance lookups follow it.
    // `resolvedTheme` is read inside the effect below via theme class; the
    // hook only needs the context to exist — keep a reference for reactivity.
    theme = useTheme();

  let timer: ReturnType<typeof setTimeout> | undefined,
    runId = 0,
    disposed = false;

  const applyAll = async (): Promise<void> => {
      const myRun = ++runId;
      // Track reactive deps.
      theme.resolvedTheme();
      const { appearance, background } = snapshotSettings(state);
      if (typeof document === 'undefined' || typeof window === 'undefined') {
        return;
      }

      const elements = collectWidgetElements();
      if (elements.length === 0) {
        return;
      }

      const source = resolveBackgroundSource(background),
        fallback = fallbackUnderlying(background),
        viewport = { h: window.innerHeight, w: window.innerWidth };

      await Promise.all(
        elements.map(async (el) => {
          try {
            const rect = el.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) {
              return;
            }

            let wallpaper: { r: number; g: number; b: number } | string = fallback;
            if (source.kind === 'image') {
              const sampled = await sampleWallpaperRegion(
                source.src,
                { h: rect.height, w: rect.width, x: rect.left, y: rect.top },
                viewport,
              );
              if (sampled) {
                wallpaper = sampled;
              }
            }

            const { color } = autoWidgetTextColor(appearance?.background, wallpaper, {
              backdropBrightness: appearance?.backdrop?.brightness,
              preferredTextColor: appearance?.textColor,
            });

            if (disposed || myRun !== runId) {
              return;
            }
            // Validate the computed color parses before applying.
            parseColor(color);
            el.style.setProperty('--textColor', color);
          } catch {
            // Never break the dashboard because of contrast sampling.
          }
        }),
      );
    },
    schedule = (): void => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        void applyAll();
      }, DEBOUNCE_MS);
    };

  // Re-run whenever reactive settings change. Deps are read explicitly so
  // Theme switches, appearance edits, and background rotations retrigger.
  createEffect(() => {
    const deps = [
      theme.resolvedTheme(),
      state.widgetSetting?.light,
      state.widgetSetting?.dark,
      state.background?.active,
      state.background?.color,
      state.background?.static,
      state.background?.image?.src,
    ];
    void deps;
    schedule();
  });

  onMount(() => {
    void applyAll();

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    window.addEventListener('resize', schedule);

    const container = document.querySelector('[data-canvas-container]'),
      resizeObserver =
        typeof ResizeObserver === 'undefined'
          ? undefined
          : new ResizeObserver(() => {
              schedule();
            });
    if (container && resizeObserver) {
      resizeObserver.observe(container);
    }

    // Catches canvas drags (ancestor left/top style changes) and list changes.
    const mutationObserver =
      typeof MutationObserver === 'undefined'
        ? undefined
        : new MutationObserver(() => {
            schedule();
          });
    if (container && mutationObserver) {
      mutationObserver.observe(container, {
        attributeFilter: ['style', 'class'],
        attributes: true,
        childList: true,
        subtree: true,
      });
    }

    // Background image swaps (rotation / collection change).
    const bgImg = document.querySelector('#background');
    bgImg?.addEventListener('load', schedule);

    // Late image loads after settings arrive from storage.
    const lateTimer = setTimeout(() => {
      schedule();
    }, 500);

    onCleanup(() => {
      disposed = true;
      if (timer !== undefined) {
        clearTimeout(timer);
      }
      clearTimeout(lateTimer);
      window.removeEventListener('resize', schedule);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      bgImg?.removeEventListener('load', schedule);
    });
  });
}
