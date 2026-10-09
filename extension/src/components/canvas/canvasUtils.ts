/**
 * Utility functions for 2D canvas layout calculations, boundary clamping,
 * magnetic relative alignment, and grid snapping.
 */

export const clamp = (val: number, min: number = 5, max: number = 95): number =>
  Math.max(min, Math.min(max, val));

export const snapCoordinate = (val: number, snap: boolean = true, step: number = 5): number => {
  if (!snap || step <= 0) {
    return Math.round(val * 10) / 10;
  }
  return Math.round(val / step) * step;
};

export interface ContainerBounds {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface ElementRect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
  readonly centerX: number;
  readonly centerY: number;
}

export interface AlignmentGuide {
  readonly type: 'horizontal' | 'vertical';
  readonly positionPx: number;
  readonly positionPercent: number;
}

export interface SmartSnapOptions {
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

export interface SmartSnapResult {
  readonly x: number;
  readonly y: number;
  readonly guides: readonly AlignmentGuide[];
}

/**
 * Calculates smart magnetic alignment between the dragged element and other canvas elements.
 * Checks relative edge-to-edge alignment (top-top, bottom-bottom, left-left, right-right, centers)
 * and falls back to grid increments when no relative edge is within threshold.
 */
export const calculateSmartSnap = (options: SmartSnapOptions): SmartSnapResult => {
  const {
    targetCenterX,
    targetCenterY,
    width,
    height,
    containerBounds,
    otherElements,
    snapEnabled = true,
    gridStep = 5,
    thresholdPx = 10,
  } = options;

  if (containerBounds.width <= 0 || containerBounds.height <= 0) {
    return { guides: [], x: 50, y: 50 };
  }

  // Smooth un-snapped movement when snapping is toggled off
  if (!snapEnabled) {
    const rawX = ((targetCenterX - containerBounds.left) / containerBounds.width) * 100,
      rawY = ((targetCenterY - containerBounds.top) / containerBounds.height) * 100;
    return {
      guides: [],
      x: clamp(Math.round(rawX * 10) / 10, 5, 95),
      y: clamp(Math.round(rawY * 10) / 10, 5, 95),
    };
  }

  const draggedLeft = targetCenterX - width / 2,
    draggedRight = targetCenterX + width / 2,
    draggedTop = targetCenterY - height / 2,
    draggedBottom = targetCenterY + height / 2,
    guides: AlignmentGuide[] = [];

  // --- Vertical Alignment (X axis / vertical guide lines) ---
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

  // Compare against other elements on canvas
  for (const other of otherElements) {
    // 1. Same Left Border (flush left)
    considerX(draggedLeft - other.left, other.left + width / 2, other.left);
    // 2. Same Right Border (flush right)
    considerX(draggedRight - other.right, other.right - width / 2, other.right);
    // 3. Same Column Center
    considerX(targetCenterX - other.centerX, other.centerX, other.centerX);
    // 4. Side-by-side: Dragged left to Other right
    considerX(draggedLeft - other.right, other.right + width / 2, other.right);
    // 5. Side-by-side: Dragged right to Other left
    considerX(draggedRight - other.left, other.left - width / 2, other.left);
  }

  // Check container horizontal center (50%)
  const containerCenterX = containerBounds.left + containerBounds.width / 2;
  considerX(targetCenterX - containerCenterX, containerCenterX, containerCenterX);

  let finalCenterX = targetCenterX;
  if (bestCandidateX) {
    const candidate = bestCandidateX as SnapCandidateX;
    finalCenterX = candidate.snappedCenterX;
    guides.push({
      positionPercent: ((candidate.guideXPx - containerBounds.left) / containerBounds.width) * 100,
      positionPx: candidate.guideXPx,
      type: 'vertical',
    });
  } else if (gridStep > 0) {
    const rawPctX = ((targetCenterX - containerBounds.left) / containerBounds.width) * 100,
      snappedPctX = snapCoordinate(rawPctX, true, gridStep);
    finalCenterX = containerBounds.left + (snappedPctX / 100) * containerBounds.width;
  }

  // --- Horizontal Alignment (Y axis / horizontal guide lines) ---
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
    // 1. Same Top Border (flush top)
    considerY(draggedTop - other.top, other.top + height / 2, other.top);
    // 2. Same Bottom Border (flush bottom)
    considerY(draggedBottom - other.bottom, other.bottom - height / 2, other.bottom);
    // 3. Same Row Center
    considerY(targetCenterY - other.centerY, other.centerY, other.centerY);
    // 4. Stacked: Dragged top to Other bottom
    considerY(draggedTop - other.bottom, other.bottom + height / 2, other.bottom);
    // 5. Stacked: Dragged bottom to Other top
    considerY(draggedBottom - other.top, other.top - height / 2, other.top);
  }

  // Check container vertical center (50%)
  const containerCenterY = containerBounds.top + containerBounds.height / 2;
  considerY(targetCenterY - containerCenterY, containerCenterY, containerCenterY);

  let finalCenterY = targetCenterY;
  if (bestCandidateY) {
    const candidate = bestCandidateY as SnapCandidateY;
    finalCenterY = candidate.snappedCenterY;
    guides.push({
      positionPercent: ((candidate.guideYPx - containerBounds.top) / containerBounds.height) * 100,
      positionPx: candidate.guideYPx,
      type: 'horizontal',
    });
  } else if (gridStep > 0) {
    const rawPctY = ((targetCenterY - containerBounds.top) / containerBounds.height) * 100,
      snappedPctY = snapCoordinate(rawPctY, true, gridStep);
    finalCenterY = containerBounds.top + (snappedPctY / 100) * containerBounds.height;
  }

  const finalPctX = ((finalCenterX - containerBounds.left) / containerBounds.width) * 100,
    finalPctY = ((finalCenterY - containerBounds.top) / containerBounds.height) * 100;

  return {
    guides,
    x: clamp(Math.round(finalPctX * 10) / 10, 5, 95),
    y: clamp(Math.round(finalPctY * 10) / 10, 5, 95),
  };
};

export interface PercentageInput {
  readonly clientX: number;
  readonly clientY: number;
  readonly bounds: ContainerBounds;
  readonly snap?: boolean;
  readonly step?: number;
}

export const calculatePercentage = ({
  clientX,
  clientY,
  bounds,
  snap = true,
  step = 5,
}: PercentageInput): { x: number; y: number } => {
  if (bounds.width <= 0 || bounds.height <= 0) {
    return { x: 50, y: 50 };
  }

  const rawX = ((clientX - bounds.left) / bounds.width) * 100,
    rawY = ((clientY - bounds.top) / bounds.height) * 100,
    clampedX = clamp(rawX, 5, 95),
    clampedY = clamp(rawY, 5, 95),
    finalX = snapCoordinate(clampedX, snap, step),
    finalY = snapCoordinate(clampedY, snap, step);

  return {
    x: clamp(finalX, 5, 95),
    y: clamp(finalY, 5, 95),
  };
};
