import { describe, expect, it } from 'bun:test';
import { calculatePercentage, calculateSmartSnap, clamp, snapCoordinate } from './canvasUtils';
import type { ElementRect } from './canvasUtils';
import defaultSettings from '../../../public/defaultSettings.json';
import {
  defaultFlowOrder,
  defaultPositions,
  moveFlowItem,
  withPosition,
} from '../../features/layout/layout-defaults';
import type { WidgetCanvasPosition, WidgetId } from '../../../types/settings';

describe('canvas layout coordinate math', () => {
  it('clamps coordinates within bounds', () => {
    expect(clamp(-10, 5, 95)).toBe(5);
    expect(clamp(3, 5, 95)).toBe(5);
    expect(clamp(50, 5, 95)).toBe(50);
    expect(clamp(97, 5, 95)).toBe(95);
    expect(clamp(150, 5, 95)).toBe(95);
  });

  it('snaps coordinates to grid steps correctly', () => {
    expect(snapCoordinate(23, true, 5)).toBe(25);
    expect(snapCoordinate(22, true, 5)).toBe(20);
    expect(snapCoordinate(27.8, true, 5)).toBe(30);
    expect(snapCoordinate(23.4, false, 5)).toBe(23.4);
    expect(snapCoordinate(37, true, 10)).toBe(40);
  });

  it('calculates viewport percentage coordinates with boundary clamping and snapping', () => {
    const bounds = { height: 1000, left: 0, top: 0, width: 1000 },
      // Point at (234, 482) -> raw (23.4%, 48.2%) -> snapped (25%, 50%)
      snapped = calculatePercentage({
        bounds,
        clientX: 234,
        clientY: 482,
        snap: true,
        step: 5,
      });
    expect(snapped.x).toBe(25);
    expect(snapped.y).toBe(50);

    // Unsnapped
    const unsnapped = calculatePercentage({
      bounds,
      clientX: 234,
      clientY: 482,
      snap: false,
      step: 5,
    });
    expect(unsnapped.x).toBe(23.4);
    expect(unsnapped.y).toBe(48.2);

    // Out of bounds (< 5% or > 95%)
    const clampedEdge = calculatePercentage({
      bounds,
      clientX: -50,
      clientY: 1200,
      snap: true,
      step: 5,
    });
    expect(clampedEdge.x).toBe(5);
    expect(clampedEdge.y).toBe(95);
  });

  it('handles zero or negative container bounds gracefully', () => {
    const invalidBounds = { height: 0, left: 0, top: 0, width: 0 },
      result = calculatePercentage({
        bounds: invalidBounds,
        clientX: 100,
        clientY: 100,
        snap: true,
        step: 5,
      });
    expect(result).toEqual({ x: 50, y: 50 });
  });
});

describe('calculateSmartSnap relative magnetic snapping', () => {
  const containerBounds = { height: 1000, left: 0, top: 0, width: 1000 },
    // Reference widget: top=150, bottom=230, left=200, right=400, width=200, height=80
    otherWidget: ElementRect = {
      bottom: 230,
      centerX: 300,
      centerY: 190,
      height: 80,
      left: 200,
      right: 400,
      top: 150,
      width: 200,
    };

  it('snaps to exact same top border of another element within threshold', () => {
    // Dragged widget: width=120, height=60 -> halfHeight=30
    // If targetCenterY is 184, draggedTop = 184 - 30 = 154 (diff with other.top=150 is 4px <= 10px)
    const result = calculateSmartSnap({
      containerBounds,
      height: 60,
      otherElements: [otherWidget],
      snapEnabled: true,
      targetCenterX: 700,
      targetCenterY: 184,
      thresholdPx: 10,
      width: 120,
    });

    // Snapped center Y must be other.top + height / 2 = 150 + 30 = 180
    // Snapped top must be 180 - 30 = 150 (same top border!)
    // As percentage of 1000: 180 / 1000 * 100 = 18%
    expect(result.y).toBe(18);

    // Should include a horizontal alignment guide at other.top
    const topGuide = result.guides.find((g) => g.type === 'horizontal');
    expect(topGuide).toBeDefined();
    expect(topGuide?.positionPx).toBe(150);
    expect(topGuide?.positionPercent).toBe(15);
  });

  it('snaps to exact same bottom border of another element within threshold', () => {
    // Dragged widget: width=120, height=60 -> halfHeight=30
    // If targetCenterY is 202, draggedBottom = 202 + 30 = 232 (diff with other.bottom=230 is 2px <= 10px)
    const result = calculateSmartSnap({
      containerBounds,
      height: 60,
      otherElements: [otherWidget],
      snapEnabled: true,
      targetCenterX: 700,
      targetCenterY: 202,
      thresholdPx: 10,
      width: 120,
    });

    // Snapped center Y must be other.bottom - height / 2 = 230 - 30 = 200
    // Snapped bottom must be 200 + 30 = 230
    // As percentage: 200 / 1000 * 100 = 20%
    expect(result.y).toBe(20);

    const bottomGuide = result.guides.find((g) => g.type === 'horizontal');
    expect(bottomGuide).toBeDefined();
    expect(bottomGuide?.positionPx).toBe(230);
    expect(bottomGuide?.positionPercent).toBe(23);
  });

  it('snaps to exact same left border of another element within threshold', () => {
    // Dragged widget: width=80, height=50 -> halfWidth=40
    // If targetCenterX is 243, draggedLeft = 243 - 40 = 203 (diff with other.left=200 is 3px <= 10px)
    const result = calculateSmartSnap({
      containerBounds,
      height: 50,
      otherElements: [otherWidget],
      snapEnabled: true,
      targetCenterX: 243,
      targetCenterY: 600,
      thresholdPx: 10,
      width: 80,
    });

    // Snapped center X must be other.left + width / 2 = 200 + 40 = 240
    // Snapped left is 200
    // As percentage: 240 / 1000 * 100 = 24%
    expect(result.x).toBe(24);

    const leftGuide = result.guides.find((g) => g.type === 'vertical');
    expect(leftGuide).toBeDefined();
    expect(leftGuide?.positionPx).toBe(200);
    expect(leftGuide?.positionPercent).toBe(20);
  });

  it('snaps to exact center of another element', () => {
    // Other.centerY = 190, other.centerX = 300
    const result = calculateSmartSnap({
      containerBounds,
      height: 100,
      otherElements: [otherWidget],
      snapEnabled: true,
      targetCenterX: 303,
      targetCenterY: 192,
      thresholdPx: 10,
      width: 100,
    });

    expect(result.x).toBe(30); // 300 / 1000 * 100
    expect(result.y).toBe(19); // 190 / 1000 * 100
    expect(result.guides.length).toBe(2);
  });

  it('snaps to container center when close to middle', () => {
    // Container center is (500, 500)
    const result = calculateSmartSnap({
      containerBounds,
      height: 100,
      otherElements: [],
      snapEnabled: true,
      targetCenterX: 504,
      targetCenterY: 497,
      thresholdPx: 10,
      width: 100,
    });

    expect(result.x).toBe(50);
    expect(result.y).toBe(50);
    expect(result.guides.some((g) => g.positionPx === 500)).toBe(true);
  });

  it('allows smooth continuous movement when snapEnabled is false', () => {
    const result = calculateSmartSnap({
      containerBounds,
      height: 60,
      otherElements: [otherWidget],
      snapEnabled: false,
      targetCenterX: 243,
      targetCenterY: 184,
      width: 120,
    });

    expect(result.x).toBe(24.3);
    expect(result.y).toBe(18.4);
    expect(result.guides).toEqual([]);
  });
});

describe('layout defaults & flow order', () => {
  it('exposes a default canvas position for every widget', () => {
    const ids: readonly WidgetId[] = ['clock', 'greeting', 'searchbar', 'weather', 'shortcuts'],
      positions = defaultPositions();
    for (const id of ids) {
      expect(positions[id]).toBeDefined();
    }
    expect(positions.clock).toEqual({ x: 50, y: 25 });
    expect(positions.weather).toEqual({ x: 85, y: 15 });
  });

  it('matches the shipped defaultSettings.json layout', () => {
    expect(defaultSettings.layout.canvasPositions).toEqual(defaultPositions());
    expect(defaultSettings.layout.flowOrder).toEqual(defaultFlowOrder());
  });

  it('moves a widget up or down within the flow order', () => {
    const order = defaultFlowOrder();
    expect(moveFlowItem(order, 'weather', 'up')).toEqual([
      'clock',
      'weather',
      'greeting',
      'searchbar',
      'shortcuts',
    ]);
    expect(moveFlowItem(order, 'weather', 'down')).toEqual([
      'clock',
      'greeting',
      'searchbar',
      'weather',
      'shortcuts',
    ]);
  });

  it('keeps edge items and unknown ids in place', () => {
    const order = defaultFlowOrder();
    expect(moveFlowItem(order, 'clock', 'up')).toEqual(order);
    expect(moveFlowItem(order, 'shortcuts', 'down')).toEqual(order);
    expect(moveFlowItem(order, 'unknown' as WidgetId, 'up')).toEqual(order);
  });

  it('merges a moved widget into a full position record', () => {
    const positions: Record<WidgetId, WidgetCanvasPosition> = {
        ...defaultPositions(),
        clock: { x: 20, y: 15 },
      },
      next = withPosition(positions, 'weather', { x: 10, y: 10 });
    expect(next.clock).toEqual({ x: 20, y: 15 });
    expect(next.weather).toEqual({ x: 10, y: 10 });
    expect(next.greeting).toEqual(defaultPositions().greeting);
    // Input is untouched
    expect(positions.weather).toEqual({ x: 85, y: 15 });
  });

  it('fills missing positions from defaults', () => {
    const next = withPosition({ clock: { x: 1, y: 2 } }, 'clock', { x: 20, y: 15 });
    expect(next.clock).toEqual({ x: 20, y: 15 });
    expect(next.weather).toEqual(defaultPositions().weather);
  });
});
