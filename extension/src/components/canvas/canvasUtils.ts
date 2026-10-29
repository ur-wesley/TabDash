/**
 * Utility functions for 2D canvas layout calculations, boundary clamping,
 * magnetic relative alignment, and grid snapping.
 */

const COORDINATE_DECIMAL_FACTOR = 10;
const DEFAULT_CENTER_PERCENT = 50;
const DEFAULT_GRID_STEP = 5;
const DEFAULT_SNAP_THRESHOLD_PX = 10;
const HALF_DIVISOR = 2;
const MAX_POSITION_PERCENT = 95;
const MIN_POSITION_PERCENT = 5;
const MIN_GRID_STEP = 0;
const PERCENT_FACTOR = 100;

const clamp = (
  value: number,
  min: number = MIN_POSITION_PERCENT,
  max: number = MAX_POSITION_PERCENT,
): number => Math.max(min, Math.min(max, value));

const snapCoordinate = (
  value: number,
  snap: boolean = true,
  step: number = DEFAULT_GRID_STEP,
): number => {
  if (!snap || step <= MIN_GRID_STEP) {
    return Math.round(value * COORDINATE_DECIMAL_FACTOR) / COORDINATE_DECIMAL_FACTOR;
  }
  return Math.round(value / step) * step;
};

interface ContainerBounds {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

interface ElementRect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
  readonly centerX: number;
  readonly centerY: number;
}

interface AlignmentGuide {
  readonly type: 'horizontal' | 'vertical';
  readonly positionPx: number;
  readonly positionPercent: number;
}

interface SmartSnapOptions {
  readonly targetCenterX: number;
  readonly targetCenterY: number;
  readonly width: number;
  readonly height: number;
  readonly containerBounds: ContainerBounds;
  readonly otherElements: readonly ElementRect[];
  readonly snapEnabled?: boolean;
  readonly gridStep?: number;
  readonly thresholdPx?: number;
}

interface SmartSnapResult {
  readonly percentX: number;
  readonly percentY: number;
  readonly guides: readonly AlignmentGuide[];
}

const calculateSmartSnap = (options: SmartSnapOptions): SmartSnapResult => {
  const {
    targetCenterX,
    targetCenterY,
    width,
    height,
    containerBounds,
    otherElements,
    snapEnabled = true,
    gridStep = DEFAULT_GRID_STEP,
    thresholdPx = DEFAULT_SNAP_THRESHOLD_PX,
  } = options;

  if (containerBounds.width <= 0 || containerBounds.height <= 0) {
    return { guides: [], percentX: DEFAULT_CENTER_PERCENT, percentY: DEFAULT_CENTER_PERCENT };
  }

  if (!snapEnabled) {
    const rawX = ((targetCenterX - containerBounds.left) / containerBounds.width) * PERCENT_FACTOR,
      rawY = ((targetCenterY - containerBounds.top) / containerBounds.height) * PERCENT_FACTOR;
    return {
      guides: [],
      percentX: clamp(Math.round(rawX * COORDINATE_DECIMAL_FACTOR) / COORDINATE_DECIMAL_FACTOR),
      percentY: clamp(Math.round(rawY * COORDINATE_DECIMAL_FACTOR) / COORDINATE_DECIMAL_FACTOR),
    };
  }

  const draggedLeft = targetCenterX - width / HALF_DIVISOR,
    draggedRight = targetCenterX + width / HALF_DIVISOR,
    draggedTop = targetCenterY - height / HALF_DIVISOR,
    draggedBottom = targetCenterY + height / HALF_DIVISOR,
    guides: AlignmentGuide[] = [];

  interface SnapCandidateX {
    diff: number;
    snappedCenterX: number;
    guideXPx: number;
  }

  let bestCandidateX: SnapCandidateX | null = null;
  const considerX = (diff: number, snappedCenterX: number, guideXPx: number) => {
    const absDiff = Math.abs(diff);
    if (absDiff <= thresholdPx && (!bestCandidateX || absDiff < bestCandidateX.diff)) {
      bestCandidateX = { diff: absDiff, guideXPx, snappedCenterX };
    }
  };

  for (const other of otherElements) {
    considerX(draggedLeft - other.left, other.left + width / HALF_DIVISOR, other.left);
    considerX(draggedRight - other.right, other.right - width / HALF_DIVISOR, other.right);
    considerX(targetCenterX - other.centerX, other.centerX, other.centerX);
    considerX(draggedLeft - other.right, other.right + width / HALF_DIVISOR, other.right);
    considerX(draggedRight - other.left, other.left - width / HALF_DIVISOR, other.left);
  }

  const containerCenterX = containerBounds.left + containerBounds.width / HALF_DIVISOR;
  considerX(targetCenterX - containerCenterX, containerCenterX, containerCenterX);

  let finalCenterX = targetCenterX;
  if (bestCandidateX) {
    const candidate = bestCandidateX as SnapCandidateX;
    finalCenterX = candidate.snappedCenterX;
    guides.push({
      positionPercent:
        ((candidate.guideXPx - containerBounds.left) / containerBounds.width) * PERCENT_FACTOR,
      positionPx: candidate.guideXPx,
      type: 'vertical',
    });
  } else if (gridStep > MIN_GRID_STEP) {
    const rawPctX =
        ((targetCenterX - containerBounds.left) / containerBounds.width) * PERCENT_FACTOR,
      snappedPctX = snapCoordinate(rawPctX, true, gridStep);
    finalCenterX = containerBounds.left + (snappedPctX / PERCENT_FACTOR) * containerBounds.width;
  }

  interface SnapCandidateY {
    diff: number;
    snappedCenterY: number;
    guideYPx: number;
  }

  let bestCandidateY: SnapCandidateY | null = null;
  const considerY = (diff: number, snappedCenterY: number, guideYPx: number) => {
    const absDiff = Math.abs(diff);
    if (absDiff <= thresholdPx && (!bestCandidateY || absDiff < bestCandidateY.diff)) {
      bestCandidateY = { diff: absDiff, guideYPx, snappedCenterY };
    }
  };

  for (const other of otherElements) {
    considerY(draggedTop - other.top, other.top + height / HALF_DIVISOR, other.top);
    considerY(draggedBottom - other.bottom, other.bottom - height / HALF_DIVISOR, other.bottom);
    considerY(targetCenterY - other.centerY, other.centerY, other.centerY);
    considerY(draggedTop - other.bottom, other.bottom + height / HALF_DIVISOR, other.bottom);
    considerY(draggedBottom - other.top, other.top - height / HALF_DIVISOR, other.top);
  }

  const containerCenterY = containerBounds.top + containerBounds.height / HALF_DIVISOR;
  considerY(targetCenterY - containerCenterY, containerCenterY, containerCenterY);

  let finalCenterY = targetCenterY;
  if (bestCandidateY) {
    const candidate = bestCandidateY as SnapCandidateY;
    finalCenterY = candidate.snappedCenterY;
    guides.push({
      positionPercent:
        ((candidate.guideYPx - containerBounds.top) / containerBounds.height) * PERCENT_FACTOR,
      positionPx: candidate.guideYPx,
      type: 'horizontal',
    });
  } else if (gridStep > MIN_GRID_STEP) {
    const rawPctY =
        ((targetCenterY - containerBounds.top) / containerBounds.height) * PERCENT_FACTOR,
      snappedPctY = snapCoordinate(rawPctY, true, gridStep);
    finalCenterY = containerBounds.top + (snappedPctY / PERCENT_FACTOR) * containerBounds.height;
  }

  const finalPctX =
      ((finalCenterX - containerBounds.left) / containerBounds.width) * PERCENT_FACTOR,
    finalPctY = ((finalCenterY - containerBounds.top) / containerBounds.height) * PERCENT_FACTOR;

  return {
    guides,
    percentX: clamp(Math.round(finalPctX * COORDINATE_DECIMAL_FACTOR) / COORDINATE_DECIMAL_FACTOR),
    percentY: clamp(Math.round(finalPctY * COORDINATE_DECIMAL_FACTOR) / COORDINATE_DECIMAL_FACTOR),
  };
};

interface PercentageInput {
  readonly clientX: number;
  readonly clientY: number;
  readonly bounds: ContainerBounds;
  readonly snap?: boolean;
  readonly step?: number;
}

const calculatePercentage = ({
  clientX,
  clientY,
  bounds,
  snap = true,
  step = DEFAULT_GRID_STEP,
}: PercentageInput): { percentX: number; percentY: number } => {
  if (bounds.width <= MIN_GRID_STEP || bounds.height <= MIN_GRID_STEP) {
    return { percentX: DEFAULT_CENTER_PERCENT, percentY: DEFAULT_CENTER_PERCENT };
  }

  const rawX = ((clientX - bounds.left) / bounds.width) * PERCENT_FACTOR,
    rawY = ((clientY - bounds.top) / bounds.height) * PERCENT_FACTOR,
    clampedX = clamp(rawX),
    clampedY = clamp(rawY),
    finalX = snapCoordinate(clampedX, snap, step),
    finalY = snapCoordinate(clampedY, snap, step);

  return {
    percentX: clamp(finalX),
    percentY: clamp(finalY),
  };
};

export {
  calculatePercentage,
  calculateSmartSnap,
  clamp,
  snapCoordinate,
  type AlignmentGuide,
  type ContainerBounds,
  type ElementRect,
  type PercentageInput,
  type SmartSnapOptions,
  type SmartSnapResult,
};
