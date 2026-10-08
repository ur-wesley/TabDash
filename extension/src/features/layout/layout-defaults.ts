import type { WidgetCanvasPosition, WidgetId } from '../../../types/settings';

export function defaultPositions(): Record<WidgetId, WidgetCanvasPosition> {
  return {
    clock: { x: 50, y: 25 },
    greeting: { x: 50, y: 42 },
    searchbar: { x: 50, y: 55 },
    weather: { x: 85, y: 15 },
    shortcuts: { x: 50, y: 72 },
  };
}

export function defaultFlowOrder(): WidgetId[] {
  return ['clock', 'greeting', 'weather', 'searchbar', 'shortcuts'];
}

export type FlowDirection = 'up' | 'down';

export function withPosition(
  positions: Partial<Record<WidgetId, WidgetCanvasPosition>> | undefined,
  id: WidgetId,
  pos: WidgetCanvasPosition,
): Record<WidgetId, WidgetCanvasPosition> {
  const defaults = defaultPositions();
  const next: Record<WidgetId, WidgetCanvasPosition> = {
    clock: positions?.clock ?? defaults.clock,
    greeting: positions?.greeting ?? defaults.greeting,
    searchbar: positions?.searchbar ?? defaults.searchbar,
    weather: positions?.weather ?? defaults.weather,
    shortcuts: positions?.shortcuts ?? defaults.shortcuts,
  };
  next[id] = pos;
  return next;
}

export function moveFlowItem(
  order: readonly WidgetId[],
  id: WidgetId,
  direction: FlowDirection,
): WidgetId[] {
  const index = order.indexOf(id);
  if (index === -1) return [...order];
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= order.length) return [...order];
  const next = [...order];
  const [removed] = next.splice(index, 1);
  if (removed === undefined) return [...order];
  next.splice(targetIndex, 0, removed);
  return next;
}
