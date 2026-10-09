import type { Component, JSX } from 'solid-js';
import { Show, createSignal } from 'solid-js';
import type { WidgetCanvasPosition, WidgetId } from '../../../types/settings.js';
import { calculateSmartSnap } from './canvasUtils.js';
import type { AlignmentGuide, ContainerBounds, ElementRect } from './canvasUtils.js';

export interface CanvasItemProps {
  readonly id: WidgetId;
  readonly label: string;
  readonly position: WidgetCanvasPosition;
  readonly isEditing: boolean;
  readonly snapToGrid: boolean;
  readonly gridSize: number;
  readonly onPositionChange: (id: WidgetId, pos: WidgetCanvasPosition) => void;
  readonly onGuidesChange?: (guides: readonly AlignmentGuide[]) => void;
  readonly children: JSX.Element;
}

export const CanvasItem: Component<CanvasItemProps> = (props) => {
  const [isDragging, setIsDragging] = createSignal(false),
    [currentPos, setCurrentPos] = createSignal<WidgetCanvasPosition>({
      x: props.position?.x ?? 50,
      y: props.position?.y ?? 50,
    });

  let itemElement: HTMLDivElement | undefined;

  // Sync internal position when external prop updates and not actively dragging
  const effectivePos = () => (isDragging() ? currentPos() : (props.position ?? { x: 50, y: 50 })),
    zIndex = () => {
      if (isDragging()) {
        return '60';
      }
      if (props.isEditing) {
        return '40';
      }
      return '20';
    },
    handlePointerDown = (e: PointerEvent) => {
      if (!props.isEditing) {
        return;
      }

      e.preventDefault();
      setIsDragging(true);

      const canvasEl = itemElement?.closest('[data-canvas-container]') as HTMLElement | null,
        // Get current item bounding rect to compute pointer offset relative to center
        itemRect = itemElement
          ? itemElement.getBoundingClientRect()
          : {
              height: 100,
              left: e.clientX - 50,
              top: e.clientY - 50,
              width: 100,
            },
        itemCenterX = itemRect.left + itemRect.width / 2,
        itemCenterY = itemRect.top + itemRect.height / 2,
        grabOffsetX = e.clientX - itemCenterX,
        grabOffsetY = e.clientY - itemCenterY,
        getBounds = (): ContainerBounds => {
          if (canvasEl) {
            const rect = canvasEl.getBoundingClientRect();
            return {
              height: rect.height,
              left: rect.left,
              top: rect.top,
              width: rect.width,
            };
          }
          return {
            height: window.innerHeight,
            left: 0,
            top: 0,
            width: window.innerWidth,
          };
        },
        getOtherElements = (): ElementRect[] => {
          if (!canvasEl) {
            return [];
          }
          const items = [...canvasEl.querySelectorAll<HTMLElement>('[data-canvas-item]')];
          return items
            .filter((el) => el.dataset.widgetId !== props.id)
            .map((el) => {
              const r = el.getBoundingClientRect();
              return {
                bottom: r.bottom,
                centerX: r.left + r.width / 2,
                centerY: r.top + r.height / 2,
                height: r.height,
                left: r.left,
                right: r.right,
                top: r.top,
                width: r.width,
              };
            });
        },
        onPointerMove = (moveEvent: PointerEvent) => {
          const bounds = getBounds(),
            otherElements = getOtherElements(),
            targetCenterX = moveEvent.clientX - grabOffsetX,
            targetCenterY = moveEvent.clientY - grabOffsetY,
            snapResult = calculateSmartSnap({
              containerBounds: bounds,
              gridStep: props.gridSize,
              height: itemRect.height,
              otherElements,
              snapEnabled: props.snapToGrid,
              targetCenterX,
              targetCenterY,
              thresholdPx: 12,
              width: itemRect.width,
            });

          setCurrentPos({ x: snapResult.x, y: snapResult.y });
          props.onGuidesChange?.(snapResult.guides);
        },
        onPointerUp = () => {
          setIsDragging(false);
          props.onGuidesChange?.([]);
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
          props.onPositionChange(props.id, currentPos());
        };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };

  return (
    <div
      ref={(el) => {
        itemElement = el;
      }}
      data-canvas-item
      data-widget-id={props.id}
      class="canvas-item absolute flex flex-col items-center justify-center transition-[transform,shadow] duration-75"
      style={{
        left: `${effectivePos().x}%`,
        top: `${effectivePos().y}%`,
        transform: 'translate(-50%, -50%)',
        'z-index': zIndex(),
      }}
    >
      <div
        class={`relative group ${
          props.isEditing
            ? 'cursor-grab active:cursor-grabbing p-2 rounded-2xl border-2 border-dashed border-blue-500/50 hover:border-blue-400 bg-white/5 hover:bg-white/10 backdrop-blur-xs transition-all'
            : ''
        } ${isDragging() ? 'scale-[1.02] shadow-2xl ring-2 ring-blue-500' : ''}`}
        onPointerDown={handlePointerDown}
      >
        <Show when={props.isEditing}>
          <div class="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900/95 text-zinc-100 text-[11px] font-medium tracking-wide shadow-md pointer-events-none whitespace-nowrap z-50 border border-zinc-700/60">
            <span class="i-mdi-cursor-move w-3 h-3 text-blue-400"></span>
            <span>{props.label}</span>
            <span class="text-zinc-400 text-[10px]">
              {Math.round(effectivePos().x)}%, {Math.round(effectivePos().y)}%
            </span>
          </div>

          {/* Transparent overlay capturing clicks to avoid accidental link navigation during edit */}
          <div class="absolute inset-0 z-30 cursor-grab active:cursor-grabbing rounded-2xl" />
        </Show>

        <div class={props.isEditing ? 'pointer-events-none select-none' : ''}>{props.children}</div>
      </div>
    </div>
  );
};
