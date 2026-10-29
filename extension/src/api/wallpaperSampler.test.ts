import { describe, expect, it } from 'bun:test';
import {
  averageThumbRegion,
  coverSourceRect,
  resolveBackgroundSource,
} from './wallpaperSampler.js';
import type { Thumb } from './wallpaperSampler.js';

const NATURAL_SIZE = 100;
const NATURAL_WIDE = 200;
const VIEW_HEIGHT = 100;
const VIEW_WIDE = 200;
const RECT_HEIGHT = 30;
const RECT_WIDTH = 50;
const RECT_LEFT = 10;
const RECT_TOP = 20;
const FULL_NATURAL = 200;
const HALF_NATURAL = 100;
const AVG_MID = 128;
const CHANNEL_MAX = 255;
const ORIGIN = 0;

describe('wallpaperSampler - resolveBackgroundSource', () => {
  it('prefers the active image over static', () => {
    const src = resolveBackgroundSource({
      active: true,
      image: { author: '', next: '', origin: '', profile: '', src: 'active.jpg' },
      static: 'static.jpg',
    } as never);
    expect(src).toEqual({ kind: 'image', src: 'active.jpg' });
  });

  it('falls back to static when inactive, then to the image src', () => {
    expect(
      resolveBackgroundSource({
        active: false,
        image: { author: '', next: '', origin: '', profile: '', src: 'img.jpg' },
        static: 'static.jpg',
      } as never),
    ).toEqual({ kind: 'image', src: 'static.jpg' });

    expect(
      resolveBackgroundSource({
        active: false,
        image: { author: '', next: '', origin: '', profile: '', src: 'img.jpg' },
      } as never),
    ).toEqual({ kind: 'image', src: 'img.jpg' });
  });

  it('falls back to color and none', () => {
    expect(resolveBackgroundSource({ color: '#abc' } as never)).toEqual({
      color: '#abc',
      kind: 'color',
    });
    expect(resolveBackgroundSource()).toEqual({ kind: 'none' });
  });
});

describe('wallpaperSampler - coverSourceRect', () => {
  it('maps 1:1 when image and viewport match', () => {
    const mapped = coverSourceRect(
      { height: NATURAL_SIZE, width: NATURAL_WIDE },
      { height: NATURAL_SIZE, width: NATURAL_WIDE },
      { height: RECT_HEIGHT, left: RECT_LEFT, top: RECT_TOP, width: RECT_WIDTH },
    );
    expect(mapped.sourceX).toBeCloseTo(RECT_LEFT);
    expect(mapped.sourceY).toBeCloseTo(RECT_TOP);
    expect(mapped.sourceWidth).toBeCloseTo(RECT_WIDTH);
    expect(mapped.sourceHeight).toBeCloseTo(RECT_HEIGHT);
  });

  it('centers the crop when the image is scaled to cover', () => {
    const mapped = coverSourceRect(
      { height: NATURAL_SIZE, width: NATURAL_SIZE },
      { height: VIEW_HEIGHT, width: VIEW_WIDE },
      { height: VIEW_HEIGHT, left: ORIGIN, top: ORIGIN, width: VIEW_WIDE },
    );
    expect(mapped.sourceX).toBeCloseTo(ORIGIN);
    expect(mapped.sourceY).toBeCloseTo(25);
    expect(mapped.sourceWidth).toBeCloseTo(NATURAL_SIZE);
    expect(mapped.sourceHeight).toBeCloseTo(50);
  });

  it('clamps rects extending outside the viewport', () => {
    const mapped = coverSourceRect(
      { height: FULL_NATURAL, width: FULL_NATURAL },
      { height: FULL_NATURAL, width: FULL_NATURAL },
      { height: NATURAL_SIZE, left: -50, top: -50, width: NATURAL_SIZE },
    );
    expect(mapped.sourceX).toBeCloseTo(ORIGIN);
    expect(mapped.sourceY).toBeCloseTo(ORIGIN);
    expect(mapped.sourceWidth).toBeCloseTo(50);
    expect(mapped.sourceHeight).toBeCloseTo(50);
  });
});

describe('wallpaperSampler - averageThumbRegion', () => {
  const thumb: Thumb = {
    data: new Uint8ClampedArray([
      CHANNEL_MAX,
      0,
      0,
      CHANNEL_MAX,
      0,
      CHANNEL_MAX,
      0,
      CHANNEL_MAX,
      0,
      0,
      CHANNEL_MAX,
      CHANNEL_MAX,
      CHANNEL_MAX,
      CHANNEL_MAX,
      CHANNEL_MAX,
      CHANNEL_MAX,
    ]),
    naturalHeight: FULL_NATURAL,
    naturalWidth: FULL_NATURAL,
    thumbHeight: 2,
    thumbWidth: 2,
  };

  it('averages the full image', () => {
    const avg = averageThumbRegion(thumb, {
      sourceHeight: FULL_NATURAL,
      sourceWidth: FULL_NATURAL,
      sourceX: ORIGIN,
      sourceY: ORIGIN,
    });
    expect(avg).toEqual({ blue: AVG_MID, green: AVG_MID, red: AVG_MID });
  });

  it('averages a sub-region (top-left quadrant = red)', () => {
    const avg = averageThumbRegion(thumb, {
      sourceHeight: HALF_NATURAL,
      sourceWidth: HALF_NATURAL,
      sourceX: ORIGIN,
      sourceY: ORIGIN,
    });
    expect(avg).toEqual({ blue: ORIGIN, green: ORIGIN, red: CHANNEL_MAX });
  });

  it('returns null for empty regions', () => {
    expect(
      averageThumbRegion(thumb, {
        sourceHeight: HALF_NATURAL,
        sourceWidth: ORIGIN,
        sourceX: ORIGIN,
        sourceY: ORIGIN,
      }),
    ).toBeNull();
  });
});
