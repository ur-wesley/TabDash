import type { LayoutMode, WidgetCanvasPosition, WidgetId } from '../../../types/settings';
import { useSettingsContext } from '../settings/settings-context';
import {
  defaultFlowOrder,
  defaultPositions,
  moveFlowItem,
  withPosition,
} from '../layout/layout-defaults';
import type { FlowDirection } from '../layout/layout-defaults';

export interface DashboardLayoutActions {
  readonly handlePositionChange: (id: WidgetId, pos: WidgetCanvasPosition) => void;
  readonly handleToggleMode: () => void;
  readonly handleToggleSnap: () => void;
  readonly handleReset: () => void;
  readonly handleMoveFlowOrder: (id: WidgetId, direction: FlowDirection) => void;
}

export function useDashboardLayout(): DashboardLayoutActions {
  const [state, actions] = useSettingsContext(),
    handlePositionChange = (id: WidgetId, pos: WidgetCanvasPosition) => {
      actions.updateLayout({
        canvasPositions: withPosition(state.layout?.canvasPositions, id, pos),
      });
    },
    handleToggleMode = () => {
      const nextMode: LayoutMode =
        (state.layout?.mode ?? 'canvas') === 'canvas' ? 'flow' : 'canvas';
      actions.updateLayout({ mode: nextMode });
    },
    handleToggleSnap = () => {
      actions.updateLayout({ snapToGrid: !(state.layout?.snapToGrid ?? true) });
    },
    handleReset = () => {
      actions.updateLayout({
        canvasPositions: defaultPositions(),
        flowOrder: defaultFlowOrder(),
      });
    },
    handleMoveFlowOrder = (id: WidgetId, direction: FlowDirection) => {
      const currentOrder = state.layout?.flowOrder ?? defaultFlowOrder();
      actions.updateLayout({ flowOrder: moveFlowItem(currentOrder, id, direction) });
    };

  return {
    handleMoveFlowOrder,
    handlePositionChange,
    handleReset,
    handleToggleMode,
    handleToggleSnap,
  };
}
