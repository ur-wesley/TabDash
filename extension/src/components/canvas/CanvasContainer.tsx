import type { Component, JSX } from 'solid-js';
import { createSignal, For, Show } from 'solid-js';
import type { LayoutMode, WidgetCanvasPosition, WidgetId } from '../../../types/settings.js';
import { CanvasItem } from './CanvasItem.jsx';
import type { AlignmentGuide } from './canvasUtils.js';

export interface CanvasWidgetConfig {
  id: WidgetId;
  label: string;
  visible: boolean;
  content: JSX.Element;
}

export interface CanvasContainerProps {
  readonly mode: LayoutMode;
  readonly isEditing: boolean;
  readonly snapToGrid: boolean;
  readonly gridSize: number;
  readonly positions: Record<WidgetId, WidgetCanvasPosition>;
  readonly flowOrder: WidgetId[];
  readonly widgets: CanvasWidgetConfig[];
  readonly onPositionChange: (id: WidgetId, pos: WidgetCanvasPosition) => void;
  readonly onMoveFlowOrder?: (id: WidgetId, direction: 'up' | 'down') => void;
}

export const CanvasContainer: Component<CanvasContainerProps> = (props) => {
  const [activeGuides, setActiveGuides] = createSignal<readonly AlignmentGuide[]>([]);

  // Ordered widgets for flow mode
  const orderedWidgets = () => {
    const map = new Map(props.widgets.map((w) => [w.id, w]));
    const list: CanvasWidgetConfig[] = [];

    // First add widgets in the configured flowOrder
    for (const id of props.flowOrder) {
      const w = map.get(id);
      if (w) {
        list.push(w);
        map.delete(id);
      }
    }

    // Append any widgets not in flowOrder
    for (const w of map.values()) {
      list.push(w);
    }

    return list.filter((w) => w.visible);
  };

  return (
    <div
      data-canvas-container
      class="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Grid pattern overlay shown only during canvas editing */}
      <Show when={props.isEditing && props.mode === 'canvas'}>
        <div class="pointer-events-none absolute inset-0 z-10 opacity-25 bg-[radial-gradient(var(--canvas-grid-dot)_1px,transparent_1px)] [background-size:24px_24px]" />
      </Show>

      {/* Alignment Guide Lines */}
      <Show when={props.isEditing && props.mode === 'canvas' && activeGuides().length > 0}>
        <For each={activeGuides()}>
          {(guide) => (
            <Show
              when={guide.type === 'horizontal'}
              fallback={
                <div
                  class="pointer-events-none absolute top-0 bottom-0 z-35 border-l-2 border-dashed border-blue-400/90 shadow-[0_0_8px_var(--snap-guide-glow)]"
                  style={{ left: `${guide.positionPercent}%` }}
                />
              }
            >
              <div
                class="pointer-events-none absolute left-0 right-0 z-35 border-t-2 border-dashed border-blue-400/90 shadow-[0_0_8px_var(--snap-guide-glow)]"
                style={{ top: `${guide.positionPercent}%` }}
              />
            </Show>
          )}
        </For>
      </Show>

      {/* Mode: Free Canvas */}
      <Show
        when={props.mode === 'canvas'}
        fallback={
          /* Mode: Flow Order */
          <div class="z-20 flex flex-col items-center gap-6 max-w-4xl w-full px-4 text-center my-auto py-12 transition-all">
            <For each={orderedWidgets()}>
              {(widget, index) => (
                <div class="relative group w-full flex flex-col items-center">
                  <Show when={props.isEditing}>
                    <div class="flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-zinc-900/90 text-zinc-100 text-xs border border-zinc-700/80 shadow">
                      <span class="font-medium">{widget.label}</span>
                      <div class="flex items-center gap-1 border-l border-zinc-700/80 pl-2">
                        <button
                          type="button"
                          disabled={index() === 0}
                          onClick={() => props.onMoveFlowOrder?.(widget.id, 'up')}
                          class="p-1 hover:bg-zinc-700/80 active:bg-zinc-700 text-zinc-300 hover:text-white rounded-md border border-transparent hover:border-zinc-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                          title="Move Up"
                        >
                          <span class="i-mdi-arrow-up w-3.5 h-3.5"></span>
                        </button>
                        <button
                          type="button"
                          disabled={index() === orderedWidgets().length - 1}
                          onClick={() => props.onMoveFlowOrder?.(widget.id, 'down')}
                          class="p-1 hover:bg-zinc-700/80 active:bg-zinc-700 text-zinc-300 hover:text-white rounded-md border border-transparent hover:border-zinc-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                          title="Move Down"
                        >
                          <span class="i-mdi-arrow-down w-3.5 h-3.5"></span>
                        </button>
                      </div>
                    </div>
                  </Show>
                  {widget.content}
                </div>
              )}
            </For>
          </div>
        }
      >
        {/* Canvas Mode rendering each visible widget in its 2D coordinates */}
        <For each={props.widgets.filter((w) => w.visible)}>
          {(widget) => (
            <CanvasItem
              id={widget.id}
              label={widget.label}
              position={props.positions[widget.id] ?? { x: 50, y: 50 }}
              isEditing={props.isEditing}
              snapToGrid={props.snapToGrid}
              gridSize={props.gridSize}
              onPositionChange={props.onPositionChange}
              onGuidesChange={setActiveGuides}
            >
              {widget.content}
            </CanvasItem>
          )}
        </For>
      </Show>
    </div>
  );
};
