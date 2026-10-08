import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import type { LayoutMode } from '../../../types/settings.js';
import { useI18n } from '../../i18n.jsx';
import { cn } from '../../lib/utils.js';

export interface CanvasToolbarProps {
  readonly isEditing: boolean;
  readonly snapToGrid: boolean;
  readonly mode: LayoutMode;
  readonly onToggleEditing: () => void;
  readonly onToggleSnap: () => void;
  readonly onToggleMode: () => void;
  readonly onReset: () => void;
}

export const CanvasToolbar: Component<CanvasToolbarProps> = (props) => {
  const { t } = useI18n();

  return (
    <Show when={props.isEditing}>
      <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-zinc-900/95 text-zinc-100 backdrop-blur-xl border border-zinc-700/80 shadow-2xl animate-fade-in ring-1 ring-white/10">
        <div class="flex items-center gap-2 pr-3 border-r border-zinc-700/80">
          <span class="i-mdi-view-dashboard-outline w-4 h-4 text-blue-400" />
          <span class="text-xs font-semibold text-zinc-200 tracking-wide">
            {t('layout editor')}
          </span>
        </div>

        {/* Mode Toggle */}
        <button
          type="button"
          onClick={props.onToggleMode}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 active:bg-zinc-800 text-zinc-200 border border-zinc-700/70 hover:border-zinc-600 shadow-xs text-xs font-medium cursor-pointer transition-all active:scale-[0.98]"
          title={`Switch to ${props.mode === 'canvas' ? 'Flow' : 'Canvas'} mode`}
        >
          <span
            class={`w-3.5 h-3.5 text-blue-400 ${
              props.mode === 'canvas' ? 'i-mdi-cursor-move' : 'i-mdi-view-agenda'
            }`}
          />
          <span>{props.mode === 'canvas' ? t('free canvas') : t('flow order')}</span>
        </button>

        {/* Snap to Grid / Smart Snapping (only relevant in canvas mode) */}
        <Show when={props.mode === 'canvas'}>
          <button
            type="button"
            onClick={props.onToggleSnap}
            class={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all active:scale-[0.98]',
              props.snapToGrid
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/60 shadow-xs shadow-blue-500/10'
                : 'bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50 hover:border-zinc-700',
            )}
            title="Toggle Smart Snapping and Grid Alignment"
          >
            <span class="i-mdi-magnet w-3.5 h-3.5 text-blue-400" />
            <span>{t('snap to grid')}</span>
          </button>
        </Show>

        {/* Reset */}
        <button
          type="button"
          onClick={props.onReset}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 text-xs font-medium cursor-pointer transition-all active:scale-[0.98]"
          title="Reset widgets to default positions"
        >
          <span class="i-mdi-refresh w-3.5 h-3.5" />
          <span>{t('reset layout')}</span>
        </button>

        {/* Done / Save */}
        <button
          type="button"
          onClick={props.onToggleEditing}
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/30 border border-blue-400/40 cursor-pointer transition-all active:scale-[0.98] ml-1"
          title="Save and exit layout editing"
        >
          <span class="i-mdi-check w-3.5 h-3.5" />
          <span>{t('done')}</span>
        </button>
      </div>
    </Show>
  );
};
